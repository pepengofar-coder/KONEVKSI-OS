import { createContext, useContext, useReducer, useEffect } from 'react';
import { getInitialState } from '../data/initialData';
import { hashPassword, verifyPassword, needsMigration } from '../utils/cryptoUtils';

const AppContext = createContext(null);
const AppDispatchContext = createContext(null);

const STORAGE_KEY = 'konveksi-os-data';

// Re-export crypto utilities for use in login/register pages
export { hashPassword, verifyPassword, needsMigration };

// Legacy Base64 encoding — only used for seeding initial data and reading old hashes
export const legacyEncryptPassword = (password) => {
  if (!password) return '';
  if (password.startsWith('pbkdf2_sha256$')) return password;
  return 'pbkdf2_sha256$' + btoa(password);
};

// Legacy check — synchronous, only for backward compatibility during migration
export const checkPassword = (inputPw, storedPw) => {
  return storedPw === legacyEncryptPassword(inputPw);
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    let state = null;
    if (saved) {
      state = JSON.parse(saved);
    } else {
      state = getInitialState();
    }

    // Check sessionStorage for session-only active user
    const sessionUser = sessionStorage.getItem('konveksi-os-session-user');
    if (sessionUser) {
      state.currentUser = JSON.parse(sessionUser);
    }

    // Ensure all arrays and user states are present
    if (!state.users) state.users = getInitialState().users;
    if (state.currentUser === undefined) state.currentUser = null;
    if (!state.taylors) state.taylors = [];
    if (!state.models) state.models = [];
    if (!state.barangMasuk) state.barangMasuk = [];
    if (!state.distribusi) state.distribusi = [];
    if (!state.kelaran) state.kelaran = [];
    if (!state.kasbon) state.kasbon = [];
    if (!state.costHarian) state.costHarian = [];
    if (!state.customers) state.customers = [];
    if (!state.invoices) state.invoices = [];
    if (!state.trackingJobs) state.trackingJobs = [];
    if (!state.paymentOrders) state.paymentOrders = [];
    if (!state.adminLogs) state.adminLogs = [];
    if (!state.toasts) state.toasts = [];

    // Ensure saasSettings exist in state
    if (!state.saasSettings) {
      try {
        const savedSettings = localStorage.getItem('konveksi-os-saas-settings');
        const defaultSettings = {
          activePaymentOption: 'seabank',
          seabankNumber: '131-00-153482-9',
          seabankName: 'a.n. Zenirastrore Convection',
          jagoNumber: '781-0539-281',
          jagoName: 'a.n. Zenirastrore Convection',
          gopayNumber: '081234567890',
          gopayName: 'a.n. Zenirastrore Convection',
          premiumPrice: '99000',
          businessPrice: '199000',
          premiumActive: true,
          businessActive: true,
          freeActive: true,
          autoApprove: false,
          trialDays: '7',
          gracePeriodDays: '3',
        };
        state.saasSettings = savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
      } catch {
        state.saasSettings = {
          activePaymentOption: 'seabank',
          seabankNumber: '131-00-153482-9',
          seabankName: 'a.n. Zenirastrore Convection',
          jagoNumber: '781-0539-281',
          jagoName: 'a.n. Zenirastrore Convection',
          gopayNumber: '081234567890',
          gopayName: 'a.n. Zenirastrore Convection',
          premiumPrice: '99000',
          businessPrice: '199000',
          premiumActive: true,
          businessActive: true,
          freeActive: true,
          autoApprove: false,
          trialDays: '7',
          gracePeriodDays: '3',
        };
      }
    } else {
      // Ensure all settings keys are present and clean
      state.saasSettings = {
        activePaymentOption: 'seabank',
        seabankNumber: '131-00-153482-9',
        seabankName: 'a.n. Zenirastrore Convection',
        jagoNumber: '781-0539-281',
        jagoName: 'a.n. Zenirastrore Convection',
        gopayNumber: '081234567890',
        gopayName: 'a.n. Zenirastrore Convection',
        premiumPrice: '99000',
        businessPrice: '199000',
        premiumActive: true,
        businessActive: true,
        freeActive: true,
        autoApprove: false,
        trialDays: '7',
        gracePeriodDays: '3',
        ...state.saasSettings
      };
    }

    // Ensure zenirastrore admin exists in state.users (seed only if missing)
    const adminExists = state.users.some(u => u.username === 'zenirastrore');
    if (!adminExists) {
      const defaultAdmin = {
        id: 'u_admin',
        nama: 'Admin Zenirastrore',
        name: 'Admin Zenirastrore',
        username: 'zenirastrore',
        email: 'zenirastrore@konveksios.com',
        password: legacyEncryptPassword('abu_ziyadh280292'),
        role: 'SUPER_ADMIN',
        businessRole: 'Owner',
        plan: 'BUSINESS',
        planStatus: 'ACTIVE',
        planStartedAt: Date.now(),
        planExpiresAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        categories: ['Kaos', 'Kemeja', 'Jaket'],
        businessProfile: {
          namaUsaha: 'Zenirastrore Convection',
          telepon: '08123456789',
          email: 'info@zenirastrore.com',
          alamat: 'Jl. Admin No. 1'
        },
        businessName: 'Zenirastrore Convection'
      };
      state.users.push(defaultAdmin);
    }

    // Ensure users in database have default plan properties
    // NOTE: No longer force-reset passwords — existing hashes are preserved
    // Password migration happens lazily on successful login via MIGRATE_PASSWORD action
    state.users = state.users.map(u => {
      if (u.username === 'zenirastrore' && (u.role === undefined || u.role === '')) {
        u.role = 'SUPER_ADMIN';
      }
      if (!u.password.startsWith('pbkdf2_sha256$')) {
        u.password = legacyEncryptPassword(u.password);
      }
      if (!u.plan) {
        u.plan = u.username === 'admin' ? 'PREMIUM' : 'FREE';
      }
      if (u.planStatus === undefined) {
        u.planStatus = 'ACTIVE';
      }
      if (u.role === undefined || u.role === '') {
        u.role = u.username === 'zenirastrore' ? 'SUPER_ADMIN' : 'USER';
      }
      if (u.businessRole === undefined) {
        u.businessRole = u.role === 'SUPER_ADMIN' || u.role === 'ADMIN' ? 'Owner' : (u.role || 'Owner');
      }
      if (u.businessName === undefined) {
        u.businessName = u.businessProfile?.namaUsaha || u.namaUsaha || '';
      }
      if (u.name === undefined) {
        u.name = u.nama || '';
      }
      if (u.createdAt === undefined) {
        u.createdAt = Date.now();
      }
      if (u.updatedAt === undefined) {
        u.updatedAt = Date.now();
      }
      if (u.planExpiresAt === undefined) {
        u.planExpiresAt = null;
      }
      return u;
    });

    if (state.currentUser) {
      const fullUser = state.users.find(u => u.id === state.currentUser.id);
      if (fullUser) {
        state.currentUser = fullUser;
      } else {
        if (!state.currentUser.plan) state.currentUser.plan = 'FREE';
        if (state.currentUser.planExpiresAt === undefined) state.currentUser.planExpiresAt = null;
      }
    }

    if (state.upgradeModalOpen === undefined) {
      state.upgradeModalOpen = false;
    }

    return state;
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return getInitialState();
}

function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function appReducer(state, action) {
  const currentUserId = state.currentUser ? state.currentUser.id : null;

  switch (action.type) {
    // Auth & Session
    case 'REGISTER': {
      // Legacy sync registration — kept for backward compatibility
      const newUser = {
        id: generateId('u'),
        nama: action.payload.nama,
        name: action.payload.nama,
        username: action.payload.username.toLowerCase(),
        email: action.payload.email.toLowerCase(),
        password: legacyEncryptPassword(action.payload.password),
        role: 'USER', // system role
        businessRole: '', // Selected in Onboarding Step 2
        plan: 'FREE',
        planStatus: 'ACTIVE',
        planStartedAt: Date.now(),
        planExpiresAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        categories: [],
        businessProfile: {
          namaUsaha: action.payload.namaUsaha || (action.payload.nama + ' Convection'),
          telepon: '',
          email: action.payload.email,
          alamat: ''
        },
        businessName: action.payload.namaUsaha || (action.payload.nama + ' Convection')
      };
      sessionStorage.setItem('konveksi-os-session-user', JSON.stringify(newUser));
      return {
        ...state,
        users: [...state.users, newUser],
        currentUser: newUser,
        rememberMe: false
      };
    }
    case 'REGISTER_ASYNC': {
      // New async registration — receives pre-hashed password from Register page
      const newUserAsync = {
        id: generateId('u'),
        nama: action.payload.nama,
        name: action.payload.nama,
        username: action.payload.username.toLowerCase(),
        email: action.payload.email.toLowerCase(),
        password: action.payload.hashedPassword, // already hashed with PBKDF2
        role: 'USER',
        businessRole: '',
        plan: 'FREE',
        planStatus: 'ACTIVE',
        planStartedAt: Date.now(),
        planExpiresAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        categories: [],
        businessProfile: {
          namaUsaha: action.payload.namaUsaha || (action.payload.nama + ' Convection'),
          telepon: '',
          email: action.payload.email,
          alamat: ''
        },
        businessName: action.payload.namaUsaha || (action.payload.nama + ' Convection')
      };
      sessionStorage.setItem('konveksi-os-session-user', JSON.stringify(newUserAsync));
      return {
        ...state,
        users: [...state.users, newUserAsync],
        currentUser: newUserAsync,
        rememberMe: false
      };
    }
    case 'SET_CURRENT_USER': {
      const { user, rememberMe } = action.payload;
      const updatedUser = {
        ...user,
        lastLogin: Date.now(),
        updatedAt: Date.now()
      };

      const updatedUsers = state.users.map(u => u.id === user.id ? updatedUser : u);

      if (rememberMe) {
        sessionStorage.removeItem('konveksi-os-session-user');
      } else {
        sessionStorage.setItem('konveksi-os-session-user', JSON.stringify(updatedUser));
      }
      return {
        ...state,
        users: updatedUsers,
        currentUser: updatedUser,
        rememberMe: rememberMe
      };
    }
    case 'LOGOUT': {
      sessionStorage.clear();
      const cleanState = { ...state, currentUser: null, rememberMe: false };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanState));
      } catch (e) {
        console.error('Failed to clear session from localStorage on logout:', e);
      }
      return cleanState;
    }
    case 'MIGRATE_PASSWORD': {
      // Lazily upgrade a user's password hash from legacy Base64 to PBKDF2
      const { userId, newHashedPassword } = action.payload;
      const migratedUsers = state.users.map(u =>
        u.id === userId ? { ...u, password: newHashedPassword, updatedAt: Date.now() } : u
      );
      let migratedCurrentUser = state.currentUser;
      if (migratedCurrentUser && migratedCurrentUser.id === userId) {
        migratedCurrentUser = { ...migratedCurrentUser, password: newHashedPassword, updatedAt: Date.now() };
      }
      return { ...state, users: migratedUsers, currentUser: migratedCurrentUser };
    }
    case 'UPDATE_PROFILE': {
      const isBusinessRole = ['Owner', 'Admin Keuangan', 'Staff Administrasi'].includes(action.payload.role);
      const updatedUser = {
        ...state.currentUser,
        nama: action.payload.nama !== undefined ? action.payload.nama : state.currentUser.nama,
        name: action.payload.nama !== undefined ? action.payload.nama : state.currentUser.nama,
        email: action.payload.email !== undefined ? action.payload.email : state.currentUser.email,
        role: isBusinessRole
          ? (state.currentUser.role || 'USER')
          : (action.payload.role !== undefined ? action.payload.role : state.currentUser.role),
        businessRole: isBusinessRole
          ? action.payload.role
          : (action.payload.businessRole !== undefined ? action.payload.businessRole : state.currentUser.businessRole),
        categories: action.payload.categories || state.currentUser.categories,
        businessProfile: action.payload.businessProfile || state.currentUser.businessProfile,
        businessName: action.payload.businessProfile?.namaUsaha || action.payload.businessName || state.currentUser.businessName || ''
      };
      if (action.payload.password) {
        updatedUser.password = legacyEncryptPassword(action.payload.password);
      }
      const updatedUsers = state.users.map(u => u.id === updatedUser.id ? updatedUser : u);

      if (!state.rememberMe) {
        sessionStorage.setItem('konveksi-os-session-user', JSON.stringify(updatedUser));
      }

      return {
        ...state,
        currentUser: updatedUser,
        users: updatedUsers
      };
    }
    case 'UPGRADE_PLAN': {
      const { plan, planExpiresAt } = action.payload;
      const updatedUser = {
        ...state.currentUser,
        plan,
        planExpiresAt
      };
      const updatedUsers = state.users.map(u => u.id === updatedUser.id ? updatedUser : u);

      if (!state.rememberMe) {
        sessionStorage.setItem('konveksi-os-session-user', JSON.stringify(updatedUser));
      }

      return {
        ...state,
        currentUser: updatedUser,
        users: updatedUsers
      };
    }
    case 'TOGGLE_UPGRADE_MODAL': {
      return {
        ...state,
        upgradeModalOpen: action.payload
      };
    }
    case 'SUBMIT_PAYMENT_ORDER': {
      const newOrder = {
        id: generateId('po'),
        userId: currentUserId,
        username: state.currentUser.username,
        businessName: state.currentUser.businessName || state.currentUser.businessProfile?.namaUsaha || '',
        plan: action.payload.plan,
        price: action.payload.price,
        paymentMethod: action.payload.paymentMethod,
        paymentProof: action.payload.paymentProof,
        status: 'PENDING',
        createdAt: Date.now(),
        adminNote: '',
        updatedAt: Date.now(),
      };

      const updatedUser = {
        ...state.currentUser,
        planStatus: 'PENDING',
        updatedAt: Date.now()
      };
      const updatedUsers = state.users.map(u => u.id === updatedUser.id ? updatedUser : u);

      if (!state.rememberMe) {
        sessionStorage.setItem('konveksi-os-session-user', JSON.stringify(updatedUser));
      }

      return {
        ...state,
        paymentOrders: [newOrder, ...(state.paymentOrders || [])],
        currentUser: updatedUser,
        users: updatedUsers
      };
    }
    case 'APPROVE_PAYMENT': {
      const { orderId, adminNote } = action.payload;
      const order = state.paymentOrders.find(o => o.id === orderId);
      if (!order) return state;

      const updatedOrders = state.paymentOrders.map(o =>
        o.id === orderId
          ? { ...o, status: 'APPROVED', adminNote, updatedAt: Date.now() }
          : o
      );

      const targetUser = state.users.find(u => u.id === order.userId);
      if (!targetUser) return { ...state, paymentOrders: updatedOrders };

      const durationMs = 30 * 24 * 60 * 60 * 1000; // 30 days
      const updatedTargetUser = {
        ...targetUser,
        plan: order.plan,
        planStatus: 'ACTIVE',
        planStartedAt: Date.now(),
        planExpiresAt: Date.now() + durationMs,
        updatedAt: Date.now()
      };

      const updatedUsers = state.users.map(u => u.id === order.userId ? updatedTargetUser : u);

      const newLog = {
        id: generateId('log'),
        timestamp: Date.now(),
        adminUsername: state.currentUser ? state.currentUser.username : 'system',
        action: 'APPROVE_PAYMENT',
        details: `Approved payment order ${orderId} for ${order.username} (${order.plan})`,
        note: adminNote
      };

      let currentSessionUser = state.currentUser;
      if (currentSessionUser && currentSessionUser.id === order.userId) {
        currentSessionUser = updatedTargetUser;
        if (!state.rememberMe) {
          sessionStorage.setItem('konveksi-os-session-user', JSON.stringify(currentSessionUser));
        }
      }

      return {
        ...state,
        paymentOrders: updatedOrders,
        users: updatedUsers,
        currentUser: currentSessionUser,
        adminLogs: [newLog, ...(state.adminLogs || [])]
      };
    }
    case 'REJECT_PAYMENT': {
      const { orderId, adminNote, status = 'REJECTED' } = action.payload;
      const order = state.paymentOrders.find(o => o.id === orderId);
      if (!order) return state;

      const updatedOrders = state.paymentOrders.map(o =>
        o.id === orderId
          ? { ...o, status: status, adminNote, updatedAt: Date.now() }
          : o
      );

      const targetUser = state.users.find(u => u.id === order.userId);
      if (!targetUser) return { ...state, paymentOrders: updatedOrders };

      const updatedTargetUser = {
        ...targetUser,
        planStatus: targetUser.planExpiresAt && targetUser.planExpiresAt < Date.now() ? 'EXPIRED' : 'ACTIVE',
        updatedAt: Date.now()
      };

      const updatedUsers = state.users.map(u => u.id === order.userId ? updatedTargetUser : u);

      const newLog = {
        id: generateId('log'),
        timestamp: Date.now(),
        adminUsername: state.currentUser ? state.currentUser.username : 'system',
        action: status === 'FAILED' ? 'FAIL_PAYMENT' : 'REJECT_PAYMENT',
        details: `${status === 'FAILED' ? 'Failed' : 'Rejected'} payment order ${orderId} for ${order.username}. Reason: ${adminNote}`,
        note: adminNote
      };

      let currentSessionUser = state.currentUser;
      if (currentSessionUser && currentSessionUser.id === order.userId) {
        currentSessionUser = updatedTargetUser;
        if (!state.rememberMe) {
          sessionStorage.setItem('konveksi-os-session-user', JSON.stringify(currentSessionUser));
        }
      }

      return {
        ...state,
        paymentOrders: updatedOrders,
        users: updatedUsers,
        currentUser: currentSessionUser,
        adminLogs: [newLog, ...(state.adminLogs || [])]
      };
    }
    case 'MANUAL_UPDATE_PLAN': {
      const { userId, plan, planStatus, planExpiresAt } = action.payload;
      const targetUser = state.users.find(u => u.id === userId);
      if (!targetUser) return state;

      const updatedTargetUser = {
        ...targetUser,
        plan,
        planStatus,
        planExpiresAt,
        updatedAt: Date.now()
      };

      const updatedUsers = state.users.map(u => u.id === userId ? updatedTargetUser : u);

      const newLog = {
        id: generateId('log'),
        timestamp: Date.now(),
        adminUsername: state.currentUser ? state.currentUser.username : 'system',
        action: 'MANUAL_UPDATE_PLAN',
        details: `Manually updated plan for ${targetUser.username} to ${plan} (${planStatus})`,
        note: `Expiry: ${planExpiresAt ? new Date(planExpiresAt).toLocaleDateString('id-ID') : 'Never'}`
      };

      let currentSessionUser = state.currentUser;
      if (currentSessionUser && currentSessionUser.id === userId) {
        currentSessionUser = updatedTargetUser;
        if (!state.rememberMe) {
          sessionStorage.setItem('konveksi-os-session-user', JSON.stringify(currentSessionUser));
        }
      }

      return {
        ...state,
        users: updatedUsers,
        currentUser: currentSessionUser,
        adminLogs: [newLog, ...(state.adminLogs || [])]
      };
    }
    case 'MANUAL_UPDATE_ROLE': {
      const { userId, role } = action.payload;
      const targetUser = state.users.find(u => u.id === userId);
      if (!targetUser) return state;

      const updatedTargetUser = {
        ...targetUser,
        role,
        updatedAt: Date.now()
      };

      const updatedUsers = state.users.map(u => u.id === userId ? updatedTargetUser : u);

      const newLog = {
        id: generateId('log'),
        timestamp: Date.now(),
        adminUsername: state.currentUser ? state.currentUser.username : 'system',
        action: 'MANUAL_UPDATE_ROLE',
        details: `Manually updated system role for ${targetUser.username} to ${role}`,
        note: ''
      };

      let currentSessionUser = state.currentUser;
      if (currentSessionUser && currentSessionUser.id === userId) {
        currentSessionUser = updatedTargetUser;
        if (!state.rememberMe) {
          sessionStorage.setItem('konveksi-os-session-user', JSON.stringify(currentSessionUser));
        }
      }

      return {
        ...state,
        users: updatedUsers,
        currentUser: currentSessionUser,
        adminLogs: [newLog, ...(state.adminLogs || [])]
      };
    }
    case 'EXTEND_SUBSCRIPTION': {
      const { userId, days } = action.payload;
      const targetUser = state.users.find(u => u.id === userId);
      if (!targetUser) return state;

      const currentExpiry = targetUser.planExpiresAt && targetUser.planExpiresAt > Date.now()
        ? targetUser.planExpiresAt
        : Date.now();
      const durationMs = days * 24 * 60 * 60 * 1000;
      const newExpiry = currentExpiry + durationMs;

      const updatedTargetUser = {
        ...targetUser,
        planStatus: 'ACTIVE',
        planExpiresAt: newExpiry,
        updatedAt: Date.now()
      };

      const updatedUsers = state.users.map(u => u.id === userId ? updatedTargetUser : u);

      const newLog = {
        id: generateId('log'),
        timestamp: Date.now(),
        adminUsername: state.currentUser ? state.currentUser.username : 'system',
        action: 'EXTEND_SUBSCRIPTION',
        details: `Extended subscription for ${targetUser.username} by ${days} days`,
        note: `New Expiry: ${new Date(newExpiry).toLocaleDateString('id-ID')}`
      };

      let currentSessionUser = state.currentUser;
      if (currentSessionUser && currentSessionUser.id === userId) {
        currentSessionUser = updatedTargetUser;
        if (!state.rememberMe) {
          sessionStorage.setItem('konveksi-os-session-user', JSON.stringify(currentSessionUser));
        }
      }

      return {
        ...state,
        users: updatedUsers,
        currentUser: currentSessionUser,
        adminLogs: [newLog, ...(state.adminLogs || [])]
      };
    }

    // Toast Notifications
    case 'ADD_TOAST': {
      const toasts = state.toasts || [];
      return { ...state, toasts: [...toasts, action.payload] };
    }
    case 'REMOVE_TOAST': {
      const toasts = state.toasts || [];
      return { ...state, toasts: toasts.filter(t => t.id !== action.payload) };
    }

    // Barang Masuk
    case 'ADD_BARANG_MASUK': {
      const newItem = {
        id: generateId('bm'),
        modelId: action.payload.modelId,
        jumlah: action.payload.jumlah,
        sisaBelumDistribusi: action.payload.jumlah,
        tanggal: action.payload.tanggal || new Date().toISOString().split('T')[0],
        catatan: action.payload.catatan || '',
        userId: currentUserId,
      };
      return { ...state, barangMasuk: [newItem, ...state.barangMasuk] };
    }
    case 'EDIT_BARANG_MASUK': {
      const updated = state.barangMasuk.map(b =>
        b.id === action.payload.id ? { ...b, ...action.payload } : b
      );
      return { ...state, barangMasuk: updated };
    }
    case 'DELETE_BARANG_MASUK': {
      return { ...state, barangMasuk: state.barangMasuk.filter(b => b.id !== action.payload) };
    }

    // Model
    case 'ADD_MODEL': {
      const newModel = {
        id: generateId('m'),
        nama: action.payload.nama,
        hargaJahit: action.payload.hargaJahit,
        userId: currentUserId,
      };
      return { ...state, models: [...state.models, newModel] };
    }
    case 'EDIT_MODEL': {
      const updated = state.models.map(m =>
        m.id === action.payload.id ? { ...m, ...action.payload } : m
      );
      return { ...state, models: updated };
    }
    case 'DELETE_MODEL': {
      return { ...state, models: state.models.filter(m => m.id !== action.payload) };
    }

    // Taylor (Penjahit)
    case 'ADD_TAYLOR': {
      const newTaylor = {
        id: generateId('t'),
        nama: action.payload.nama,
        userId: currentUserId,
      };
      return { ...state, taylors: [...state.taylors, newTaylor] };
    }
    case 'EDIT_TAYLOR': {
      const updated = state.taylors.map(t =>
        t.id === action.payload.id ? { ...t, ...action.payload } : t
      );
      return { ...state, taylors: updated };
    }
    case 'DELETE_TAYLOR': {
      return { ...state, taylors: state.taylors.filter(t => t.id !== action.payload) };
    }

    // Distribusi
    case 'ADD_DISTRIBUSI': {
      const { barangMasukId, taylorId, modelId, jumlah, tanggal } = action.payload;
      const newDist = {
        id: generateId('d'),
        barangMasukId,
        taylorId,
        modelId,
        jumlah,
        tanggal: tanggal || new Date().toISOString().split('T')[0],
        userId: currentUserId,
      };
      const updatedBM = state.barangMasuk.map(bm =>
        bm.id === barangMasukId
          ? { ...bm, sisaBelumDistribusi: bm.sisaBelumDistribusi - jumlah }
          : bm
      );
      return {
        ...state,
        distribusi: [newDist, ...state.distribusi],
        barangMasuk: updatedBM,
      };
    }
    case 'EDIT_DISTRIBUSI': {
      const updated = state.distribusi.map(d =>
        d.id === action.payload.id ? { ...d, ...action.payload } : d
      );
      return { ...state, distribusi: updated };
    }
    case 'DELETE_DISTRIBUSI': {
      // Revert barang masuk stock when deleting
      const dist = state.distribusi.find(d => d.id === action.payload);
      let updatedBM = state.barangMasuk;
      if (dist) {
        updatedBM = state.barangMasuk.map(bm =>
          bm.id === dist.barangMasukId
            ? { ...bm, sisaBelumDistribusi: bm.sisaBelumDistribusi + dist.jumlah }
            : bm
        );
      }
      return {
        ...state,
        distribusi: state.distribusi.filter(d => d.id !== action.payload),
        barangMasuk: updatedBM
      };
    }

    // Kelaran
    case 'ADD_KELARAN': {
      const { distribusiId, taylorId: kTaylorId, modelId: kModelId, jumlah: kJumlah, tanggal: kTanggal } = action.payload;
      const newKelaran = {
        id: generateId('k'),
        distribusiId,
        taylorId: kTaylorId,
        modelId: kModelId,
        jumlah: kJumlah,
        tanggal: kTanggal || new Date().toISOString().split('T')[0],
        userId: currentUserId,
      };
      return { ...state, kelaran: [newKelaran, ...state.kelaran] };
    }
    case 'EDIT_KELARAN': {
      const updated = state.kelaran.map(k =>
        k.id === action.payload.id ? { ...k, ...action.payload } : k
      );
      return { ...state, kelaran: updated };
    }
    case 'DELETE_KELARAN': {
      return { ...state, kelaran: state.kelaran.filter(k => k.id !== action.payload) };
    }

    // Kasbon
    case 'ADD_KASBON': {
      const newKasbon = {
        id: generateId('kb'),
        taylorId: action.payload.taylorId,
        nominal: action.payload.nominal,
        lunas: false,
        tanggal: action.payload.tanggal || new Date().toISOString().split('T')[0],
        catatan: action.payload.catatan || '',
        userId: currentUserId,
      };
      return { ...state, kasbon: [newKasbon, ...state.kasbon] };
    }
    case 'EDIT_KASBON': {
      const updated = state.kasbon.map(k =>
        k.id === action.payload.id ? { ...k, ...action.payload } : k
      );
      return { ...state, kasbon: updated };
    }
    case 'DELETE_KASBON': {
      return { ...state, kasbon: state.kasbon.filter(k => k.id !== action.payload) };
    }
    case 'LUNASI_KASBON_TAYLOR': {
      const taylorIdToLunasi = action.payload;
      const updatedKasbon = state.kasbon.map(kb =>
        kb.taylorId === taylorIdToLunasi && kb.userId === currentUserId && !kb.lunas
          ? { ...kb, lunas: true }
          : kb
      );
      return { ...state, kasbon: updatedKasbon };
    }

    // Cost Harian
    case 'ADD_COST': {
      const newCost = {
        id: generateId('ch'),
        deskripsi: action.payload.deskripsi,
        nominal: action.payload.nominal,
        tanggal: action.payload.tanggal || new Date().toISOString().split('T')[0],
        userId: currentUserId,
      };
      return { ...state, costHarian: [newCost, ...state.costHarian] };
    }
    case 'EDIT_COST': {
      const updated = state.costHarian.map(c =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c
      );
      return { ...state, costHarian: updated };
    }
    case 'DELETE_COST': {
      return { ...state, costHarian: state.costHarian.filter(c => c.id !== action.payload) };
    }

    // Customers CRUD
    case 'ADD_CUSTOMER': {
      const newCustomer = {
        id: generateId('cust'),
        nama: action.payload.nama,
        phone: action.payload.phone,
        alamat: action.payload.alamat,
        userId: currentUserId,
      };
      return { ...state, customers: [newCustomer, ...(state.customers || [])] };
    }
    case 'EDIT_CUSTOMER': {
      const updated = state.customers.map(c =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c
      );
      return { ...state, customers: updated };
    }
    case 'DELETE_CUSTOMER': {
      return { ...state, customers: state.customers.filter(c => c.id !== action.payload) };
    }

    // Invoices CRUD
    case 'ADD_INVOICE': {
      const existingNums = (state.invoices || []).map(inv => {
        const match = inv.invoiceNumber?.match(/INV-\d{4}-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const lastInvoiceNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
      const invNum = `INV-${new Date().getFullYear()}-${lastInvoiceNum.toString().padStart(3, '0')}`;
      const newInvoice = {
        id: generateId('inv'),
        invoiceNumber: invNum,
        customerId: action.payload.customerId,
        produk: action.payload.produk,
        qty: action.payload.qty,
        harga: action.payload.harga,
        discount: action.payload.discount || 0,
        tax: action.payload.tax || 0,
        shipping: action.payload.shipping || 0,
        total: action.payload.total,
        status: action.payload.status || 'Belum Bayar',
        tanggal: action.payload.tanggal || new Date().toISOString().split('T')[0],
        userId: currentUserId,
      };
      return { ...state, invoices: [newInvoice, ...(state.invoices || [])] };
    }
    case 'EDIT_INVOICE': {
      const updated = state.invoices.map(i =>
        i.id === action.payload.id ? { ...i, ...action.payload } : i
      );
      return { ...state, invoices: updated };
    }
    case 'DELETE_INVOICE': {
      return { ...state, invoices: state.invoices.filter(i => i.id !== action.payload) };
    }

    // Tracking Jobs
    case 'ADD_TRACKING_JOB': {
      const newJob = {
        id: action.payload.id || generateId('tr'),
        distribusiId: action.payload.distribusiId,
        taylorId: action.payload.taylorId,
        modelId: action.payload.modelId,
        status: action.payload.status || 'Belum Dikerjakan',
        progress: action.payload.progress || 0,
        logs: action.payload.logs || [
          { status: 'Belum Dikerjakan', timestamp: new Date().toLocaleString('id-ID'), notes: 'Pekerjaan dibuat' }
        ],
        photo: action.payload.photo || '',
        notes: action.payload.notes || '',
        syncUrl: action.payload.syncUrl || '',
        userId: currentUserId,
      };
      return { ...state, trackingJobs: [newJob, ...(state.trackingJobs || [])] };
    }
    case 'UPDATE_TRACKING_JOB': {
      const updated = (state.trackingJobs || []).map(j =>
        j.id === action.payload.id ? { ...j, ...action.payload } : j
      );
      return { ...state, trackingJobs: updated };
    }
    case 'DELETE_TRACKING_JOB': {
      return { ...state, trackingJobs: (state.trackingJobs || []).filter(j => j.id !== action.payload) };
    }
    case 'SYNC_TRACKING_JOB': {
      const updated = (state.trackingJobs || []).map(j =>
        j.id === action.payload.id ? { ...j, ...action.payload } : j
      );
      return { ...state, trackingJobs: updated };
    }

    case 'SYNC_STATE': {
      const freshData = loadState();
      return {
        ...state,
        users: freshData.users,
        taylors: freshData.taylors,
        models: freshData.models,
        barangMasuk: freshData.barangMasuk,
        distribusi: freshData.distribusi,
        kelaran: freshData.kelaran,
        kasbon: freshData.kasbon,
        costHarian: freshData.costHarian,
        customers: freshData.customers,
        invoices: freshData.invoices,
        trackingJobs: freshData.trackingJobs,
        paymentOrders: freshData.paymentOrders,
        adminLogs: freshData.adminLogs,
        currentUser: freshData.currentUser,
        saasSettings: freshData.saasSettings,
      };
    }

    case 'UPDATE_SAAS_SETTINGS': {
      return {
        ...state,
        saasSettings: action.payload
      };
    }

    // Reset
    case 'RESET_DATA': {
      const fresh = getInitialState();
      return { ...fresh, currentUser: state.currentUser, users: state.users };
    }

    // Generic Admin Log
    case 'ADD_ADMIN_LOG': {
      const newLog = {
        id: generateId('log'),
        timestamp: Date.now(),
        adminUsername: state.currentUser ? state.currentUser.username : 'system',
        action: action.payload.action,
        details: action.payload.details,
        note: action.payload.note || ''
      };
      return {
        ...state,
        adminLogs: [newLog, ...(state.adminLogs || [])]
      };
    }

    default:
      throw new Error('Unknown action: ' + action.type);
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState);

  useEffect(() => {
    try {
      const stateToSave = { ...state };
      if (state && !state.rememberMe) {
        stateToSave.currentUser = null;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [state]);

  // Real-time synchronization & polling
  useEffect(() => {
    const checkAndSync = (newRawVal) => {
      try {
        if (!newRawVal) return;
        const parsed = JSON.parse(newRawVal);

        // Check if users, paymentOrders or saasSettings changed
        const currentUsersStr = JSON.stringify(state?.users || []);
        const nextUsersStr = JSON.stringify(parsed?.users || []);
        const currentOrdersStr = JSON.stringify(state?.paymentOrders || []);
        const nextOrdersStr = JSON.stringify(parsed?.paymentOrders || []);
        const currentSettingsStr = JSON.stringify(state?.saasSettings || {});
        const nextSettingsStr = JSON.stringify(parsed?.saasSettings || {});

        if (
          currentUsersStr !== nextUsersStr ||
          currentOrdersStr !== nextOrdersStr ||
          currentSettingsStr !== nextSettingsStr
        ) {
          dispatch({ type: 'SYNC_STATE' });
        }
      } catch (err) {
        // Fallback sync
        dispatch({ type: 'SYNC_STATE' });
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        checkAndSync(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const rawStored = localStorage.getItem(STORAGE_KEY);
      checkAndSync(rawStored);
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [state?.users, state?.paymentOrders, state?.saasSettings]);

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}

export function useAppState() {
  const state = useContext(AppContext);
  if (!state) throw new Error('useAppState must be used within AppProvider');

  // Sync currentUser with users database to guarantee fresh plan and profile data
  let currentUser = state.currentUser;
  if (currentUser) {
    const freshUser = state.users.find(u => u.id === currentUser.id);
    if (freshUser) {
      currentUser = freshUser;
    }
  }

  // Multi-user data isolation proxy
  if (currentUser && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
    const userId = currentUser.id;
    return {
      ...state,
      currentUser,
      models: state.models.filter(item => item.userId === userId),
      taylors: state.taylors.filter(item => item.userId === userId),
      barangMasuk: state.barangMasuk.filter(item => item.userId === userId),
      distribusi: state.distribusi.filter(item => item.userId === userId),
      kelaran: state.kelaran.filter(item => item.userId === userId),
      kasbon: state.kasbon.filter(item => item.userId === userId),
      costHarian: state.costHarian.filter(item => item.userId === userId),
      customers: (state.customers || []).filter(item => item.userId === userId),
      invoices: (state.invoices || []).filter(item => item.userId === userId),
      trackingJobs: (state.trackingJobs || []).filter(item => item.userId === userId),
    };
  }

  // If not logged in, return base lists
  return state;
}

export function useAppDispatch() {
  const dispatch = useContext(AppDispatchContext);
  if (!dispatch) throw new Error('useAppDispatch must be used within AppProvider');
  return dispatch;
}

export function usePlan() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const currentUser = state?.currentUser;
  const plan = currentUser?.plan || 'FREE';
  const planExpiresAt = currentUser?.planExpiresAt || null;
  const isPremium = plan === 'PREMIUM' || plan === 'BUSINESS';
  const isBusiness = plan === 'BUSINESS';

  const isLimitExceeded = (type) => {
    if (plan === 'PREMIUM' || plan === 'BUSINESS') return false;

    // FREE plan limits
    if (type === 'orders') {
      return (state.barangMasuk || []).length >= 5;
    }
    if (type === 'customers') {
      return (state.customers || []).length >= 5;
    }
    if (type === 'invoices') {
      return (state.invoices || []).length >= 5;
    }
    if (type === 'export') {
      return true;
    }
    if (type === 'tracking') {
      return true;
    }
    return false;
  };

  const showUpgradeModal = () => {
    dispatch({ type: 'TOGGLE_UPGRADE_MODAL', payload: true });
  };

  return {
    plan,
    planExpiresAt,
    isPremium,
    isBusiness,
    isLimitExceeded,
    showUpgradeModal,
  };
}

// Global helper hooks for easy frontend implementation
export function useHelpers() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const getModel = (modelId) => state.models.find(m => m.id === modelId);
  const getTaylor = (taylorId) => state.taylors.find(t => t.id === taylorId);
  const getCustomer = (customerId) => (state.customers || []).find(c => c.id === customerId);

  const getTaylorKelaran = (taylorId) =>
    state.kelaran.filter(k => k.taylorId === taylorId);

  const getTaylorKasbonBelumLunas = (taylorId) =>
    state.kasbon.filter(kb => kb.taylorId === taylorId && !kb.lunas);

  const getTotalKasbonBelumLunas = (taylorId) =>
    getTaylorKasbonBelumLunas(taylorId).reduce((sum, kb) => sum + kb.nominal, 0);

  const getDistribusiByTaylor = (taylorId) =>
    state.distribusi.filter(d => d.taylorId === taylorId);

  const getKelaranByDistribusi = (distribusiId) =>
    state.kelaran.filter(k => k.distribusiId === distribusiId);

  const getTotalKelaranByDistribusi = (distribusiId) =>
    getKelaranByDistribusi(distribusiId).reduce((sum, k) => sum + k.jumlah, 0);

  const getSisaDistribusi = (distribusi) => {
    const totalKelaran = getTotalKelaranByDistribusi(distribusi.id);
    return distribusi.jumlah - totalKelaran;
  };

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const getTodayKelaran = () =>
    state.kelaran.filter(k => k.tanggal === getTodayString());

  const getTodayCost = () =>
    state.costHarian.filter(c => c.tanggal === getTodayString());

  const getAllKasbonBelumLunas = () =>
    state.kasbon.filter(kb => !kb.lunas);

  const formatRupiah = (num) =>
    'Rp ' + Number(num || 0).toLocaleString('id-ID');

  const showToast = (message, type = 'success') => {
    const toastId = 'toast' + Math.random().toString(36).substr(2, 9);
    dispatch({ type: 'ADD_TOAST', payload: { id: toastId, message, type } });
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: toastId });
    }, 4000);
  };

  return {
    getModel,
    getTaylor,
    getCustomer,
    getTaylorKelaran,
    getTaylorKasbonBelumLunas,
    getTotalKasbonBelumLunas,
    getDistribusiByTaylor,
    getKelaranByDistribusi,
    getTotalKelaranByDistribusi,
    getSisaDistribusi,
    getTodayString,
    getTodayKelaran,
    getTodayCost,
    getAllKasbonBelumLunas,
    formatRupiah,
    showToast,
  };
}
