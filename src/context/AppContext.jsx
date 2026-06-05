import { createContext, useContext, useReducer, useEffect } from 'react';
import { getInitialState } from '../data/initialData';

const AppContext = createContext(null);
const AppDispatchContext = createContext(null);

const STORAGE_KEY = 'konveksi-os-data';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return getInitialState();
}

function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function appReducer(state, action) {
  switch (action.type) {
    // Barang Masuk
    case 'ADD_BARANG_MASUK': {
      const newItem = {
        id: generateId('bm'),
        modelId: action.payload.modelId,
        jumlah: action.payload.jumlah,
        sisaBelumDistribusi: action.payload.jumlah,
        tanggal: action.payload.tanggal || new Date().toISOString().split('T')[0],
        catatan: action.payload.catatan || '',
      };
      return { ...state, barangMasuk: [newItem, ...state.barangMasuk] };
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
      };
      return { ...state, models: [...state.models, newModel] };
    }

    // Taylor
    case 'ADD_TAYLOR': {
      const newTaylor = {
        id: generateId('t'),
        nama: action.payload.nama,
      };
      return { ...state, taylors: [...state.taylors, newTaylor] };
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
      };
      return { ...state, kelaran: [newKelaran, ...state.kelaran] };
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
      };
      return { ...state, kasbon: [newKasbon, ...state.kasbon] };
    }
    case 'LUNASI_KASBON_TAYLOR': {
      const taylorIdToLunasi = action.payload;
      const updatedKasbon = state.kasbon.map(kb =>
        kb.taylorId === taylorIdToLunasi && !kb.lunas
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
      };
      return { ...state, costHarian: [newCost, ...state.costHarian] };
    }
    case 'DELETE_COST': {
      return { ...state, costHarian: state.costHarian.filter(c => c.id !== action.payload) };
    }

    // Reset
    case 'RESET_DATA': {
      return getInitialState();
    }

    default:
      throw new Error('Unknown action: ' + action.type);
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [state]);

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (!context) throw new Error('useAppDispatch must be used within AppProvider');
  return context;
}

// Helper hooks
export function useHelpers() {
  const state = useAppState();

  const getModel = (modelId) => state.models.find(m => m.id === modelId);
  const getTaylor = (taylorId) => state.taylors.find(t => t.id === taylorId);

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
    'Rp ' + Number(num).toLocaleString('id-ID');

  return {
    getModel,
    getTaylor,
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
  };
}
