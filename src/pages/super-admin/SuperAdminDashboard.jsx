import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';

export default function SuperAdminDashboard() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { formatRupiah, showToast } = useHelpers();

  // Notification bell state
  const [notifOpen, setNotifOpen] = useState(false);
  const [seenPaymentIds, setSeenPaymentIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('konveksi-os-seen-payments') || '[]');
    } catch { return []; }
  });
  const notifRef = useRef(null);

  // Payment detail modal (opened from notification click)
  const [paymentDetailOrder, setPaymentDetailOrder] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  // Quick edit user modal
  const [quickEditUser, setQuickEditUser] = useState(null);
  const [editPlan, setEditPlan] = useState('FREE');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [extendDays, setExtendDays] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [backfillLoading, setBackfillLoading] = useState(false);

  const isSuperAdmin = state.currentUser?.role === 'SUPER_ADMIN';

  const handleRunBackfill = () => {
    if (!isSuperAdmin) {
      showToast('Akses Ditolak: Hanya Super Admin yang dapat menjalankan backfill!', 'error');
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin mem-backfill status PREMIUM untuk semua tenant hingga akhir 2026? Ini akan mengubah data di database Supabase.')) {
      return;
    }

    setBackfillLoading(true);

    fetch('/api/users/backfill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminUserId: state.currentUser.id
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Gagal memproses backfill di server');
      return res.json();
    })
    .then((data) => {
      dispatch({
        type: 'ADD_ADMIN_LOG',
        payload: {
          action: 'EXTEND_SUBSCRIPTION',
          details: `Executed bulk premium backfill for ${data.updatedCount} tenants until end of 2026`,
          note: 'Database synchronized'
        }
      });
      showToast(data.message || `Berhasil mem-backfill ${data.updatedCount} tenant ke PREMIUM!`, 'success');
    })
    .catch(err => {
      console.error(err);
      showToast('Gagal mem-backfill: ' + err.message, 'error');
    })
    .finally(() => {
      setBackfillLoading(false);
    });
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Users — all registered (excluding SUPER_ADMIN)
  const allUsers = (state.users || []).filter(u => u.role !== 'SUPER_ADMIN');
  const totalUsers = allUsers.length;

  const premiumCount = allUsers.filter(u => u.plan === 'PREMIUM' && u.planStatus === 'ACTIVE').length;
  const businessCount = allUsers.filter(u => u.plan === 'BUSINESS' && u.planStatus === 'ACTIVE').length;
  const freeCount = allUsers.filter(u => u.plan === 'FREE' || !u.plan).length;
  const expiredCount = allUsers.filter(u => u.planStatus === 'EXPIRED' || (u.planExpiresAt && u.planExpiresAt < Date.now())).length;
  const paidCount = premiumCount + businessCount;

  // Load SaaS settings for dynamic pricing
  const saasSettings = (() => {
    try {
      return JSON.parse(localStorage.getItem('konveksi-os-saas-settings') || '{}');
    } catch { return {}; }
  })();
  const premiumPrice = parseInt(saasSettings.premiumPrice || '99000', 10);
  const businessPrice = parseInt(saasSettings.businessPrice || '199000', 10);

  // MRR
  const mrr = (premiumCount * premiumPrice) + (businessCount * businessPrice);

  // Conversion rate
  const conversionRate = totalUsers > 0 ? ((paidCount / totalUsers) * 100).toFixed(1) : '0.0';

  // Payments
  const allPayments = state.paymentOrders || [];
  const pendingPayments = allPayments.filter(o => o.status === 'PENDING');
  const pendingCount = pendingPayments.length;

  // Unseen pending payments (new notifications)
  const unseenPayments = pendingPayments.filter(p => !seenPaymentIds.includes(p.id));
  const unseenCount = unseenPayments.length;

  // Notification sound / pulse effect when new payment arrives
  const [pulseNotif, setPulseNotif] = useState(false);
  const prevPendingRef = useRef(pendingCount);
  useEffect(() => {
    if (pendingCount > prevPendingRef.current) {
      setPulseNotif(true);
      setTimeout(() => setPulseNotif(false), 3000);
    }
    prevPendingRef.current = pendingCount;
  }, [pendingCount]);

  // Mark all notifications as seen
  const markAllSeen = () => {
    const ids = pendingPayments.map(p => p.id);
    setSeenPaymentIds(ids);
    localStorage.setItem('konveksi-os-seen-payments', JSON.stringify(ids));
  };

  // Recent 8 users sorted by registration date
  const recentUsers = [...allUsers].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 8);

  // Upcoming expirations (7 days)
  const today = Date.now();
  const sevenDaysLater = today + 7 * 24 * 60 * 60 * 1000;
  const expiringUsers = allUsers.filter(u =>
    u.plan !== 'FREE' &&
    u.planStatus === 'ACTIVE' &&
    u.planExpiresAt &&
    u.planExpiresAt > today &&
    u.planExpiresAt <= sevenDaysLater
  );

  // Recent admin logs (last 5)
  const recentLogs = (state.adminLogs || []).slice(0, 5);

  // Approved payments revenue
  const totalRevenue = allPayments
    .filter(o => o.status === 'APPROVED')
    .reduce((sum, o) => sum + (o.price || 0), 0);

  // Handlers
  const handleApproveFromNotif = (order) => {
    setPaymentDetailOrder(order);
    setAdminNote('');
    setNotifOpen(false);
  };

  const handleApprove = () => {
    if (!isSuperAdmin || !paymentDetailOrder) return;

    // Calculate new expiration date
    const durationMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const expiryTimestamp = Date.now() + durationMs;

    fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminUserId: state.currentUser.id,
        targetUserId: paymentDetailOrder.userId,
        updates: {
          plan: paymentDetailOrder.plan,
          planStatus: 'ACTIVE',
          planStartedAt: Date.now(),
          planExpiresAt: expiryTimestamp,
          updatedAt: Date.now()
        }
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Gagal memperbarui di server');
      return res.json();
    })
    .then((updatedUser) => {
      dispatch({
        type: 'APPROVE_PAYMENT',
        payload: {
          orderId: paymentDetailOrder.id,
          adminNote: adminNote || 'Pembayaran diverifikasi dari dashboard.'
        }
      });
      showToast(`Pembayaran ${paymentDetailOrder.businessName || paymentDetailOrder.username} disetujui!`, 'success');
      setPaymentDetailOrder(null);
      setAdminNote('');
    })
    .catch(err => {
      console.error(err);
      showToast('Gagal menyetujui pembayaran.', 'error');
    });
  };

  const handleReject = () => {
    if (!isSuperAdmin || !paymentDetailOrder || !adminNote.trim()) {
      showToast('Harap masukkan alasan penolakan!', 'error');
      return;
    }

    const targetUser = state.users.find(u => u.id === paymentDetailOrder.userId);
    const planStatus = targetUser && targetUser.planExpiresAt && targetUser.planExpiresAt < Date.now() ? 'EXPIRED' : 'ACTIVE';

    fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminUserId: state.currentUser.id,
        targetUserId: paymentDetailOrder.userId,
        updates: {
          planStatus,
          updatedAt: Date.now()
        }
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Gagal memperbarui di server');
      return res.json();
    })
    .then(() => {
      dispatch({
        type: 'REJECT_PAYMENT',
        payload: { orderId: paymentDetailOrder.id, adminNote, status: 'REJECTED' }
      });
      showToast(`Pembayaran ${paymentDetailOrder.businessName || paymentDetailOrder.username} ditolak.`, 'success');
      setPaymentDetailOrder(null);
      setAdminNote('');
    })
    .catch(err => {
      console.error(err);
      showToast('Gagal menolak pembayaran.', 'error');
    });
  };

  const handleQuickExtend = (userId, days) => {
    if (!isSuperAdmin) return;
    const targetUser = state.users.find(u => u.id === userId);
    if (!targetUser) return;

    const currentExpiry = targetUser.planExpiresAt && targetUser.planExpiresAt > Date.now()
      ? targetUser.planExpiresAt
      : Date.now();
    const durationMs = days * 24 * 60 * 60 * 1000;
    const newExpiry = currentExpiry + durationMs;

    fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminUserId: state.currentUser.id,
        targetUserId: userId,
        updates: {
          planStatus: 'ACTIVE',
          planExpiresAt: newExpiry,
          updatedAt: Date.now()
        }
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Gagal memperbarui di server');
      return res.json();
    })
    .then((updatedUser) => {
      dispatch({
        type: 'SYNC_USER_DIRECT',
        payload: updatedUser
      });
      showToast(`Masa aktif diperpanjang ${days} hari!`, 'success');
    })
    .catch(err => {
      console.error(err);
      showToast('Gagal memperpanjang masa aktif.', 'error');
    });
  };

  const handleOpenQuickEdit = (user) => {
    setQuickEditUser(user);
    setEditPlan(user.plan || 'FREE');
    setEditStatus(user.planStatus || 'ACTIVE');
    setEditExpiryDate(user.planExpiresAt ? new Date(user.planExpiresAt).toISOString().split('T')[0] : '');
    setExtendDays('');
  };

  const handleSaveQuickEdit = () => {
    if (!isSuperAdmin || !quickEditUser) return;
    
    let expiryTimestamp = editExpiryDate ? new Date(editExpiryDate).getTime() : null;
    if (extendDays && parseInt(extendDays) > 0) {
      const currentExpiry = expiryTimestamp && expiryTimestamp > Date.now()
        ? expiryTimestamp
        : Date.now();
      const durationMs = parseInt(extendDays) * 24 * 60 * 60 * 1000;
      expiryTimestamp = currentExpiry + durationMs;
    }

    const updates = {
      plan: editPlan,
      planStatus: editStatus,
      planExpiresAt: expiryTimestamp,
      updatedAt: Date.now()
    };

    setEditLoading(true);

    fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminUserId: state.currentUser.id,
        targetUserId: quickEditUser.id,
        updates
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Gagal memperbarui di server');
      return res.json();
    })
    .then((updatedUser) => {
      dispatch({
        type: 'SYNC_USER_DIRECT',
        payload: updatedUser
      });
      showToast(`Akun @${quickEditUser.username} berhasil diperbarui!`, 'success');
      setQuickEditUser(null);
    })
    .catch(err => {
      console.error(err);
      showToast('Gagal memperbarui data pengguna: ' + err.message, 'error');
    })
    .finally(() => {
      setEditLoading(false);
    });
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'APPROVE_PAYMENT': return 'bg-emerald-500/10 text-emerald-300';
      case 'REJECT_PAYMENT': case 'FAIL_PAYMENT': return 'bg-rose-500/10 text-rose-300';
      case 'MANUAL_UPDATE_PLAN': case 'EXTEND_SUBSCRIPTION': return 'bg-purple-500/10 text-purple-300';
      case 'MANUAL_UPDATE_ROLE': return 'bg-amber-500/10 text-amber-300';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header with Notification Bell */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Dashboard Super Admin
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Statistik global, manajemen pengguna real-time, dan notifikasi pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={handleRunBackfill}
              disabled={backfillLoading}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 ${
                backfillLoading
                  ? 'bg-slate-800 border border-slate-700 text-slate-500 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:shadow-cyan-500/25 text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">database</span>
              {backfillLoading ? 'Backfilling...' : 'Backfill Premium 2026'}
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllSeen(); }}
              className={`relative w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all ${pulseNotif ? 'animate-pulse' : ''}`}
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unseenCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse">
                  {unseenCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-14 w-96 max-h-[420px] bg-slate-900/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden animate-scale-in">
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Notifikasi Pembayaran
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold">{pendingCount} Pending</span>
                </div>
                <div className="overflow-y-auto max-h-[340px] divide-y divide-white/[0.04]">
                  {pendingPayments.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs italic">
                      <span className="material-symbols-outlined text-[32px] block mb-2 opacity-30">notifications_off</span>
                      Tidak ada pembayaran pending.
                    </div>
                  ) : (
                    pendingPayments.map((order) => {
                      const user = (state.users || []).find(u => u.id === order.userId);
                      const isUnseen = !seenPaymentIds.includes(order.id);
                      return (
                        <button
                          key={order.id}
                          onClick={() => handleApproveFromNotif(order)}
                          className={`w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-all flex items-start gap-3 ${isUnseen ? 'bg-purple-500/5' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isUnseen ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                            <span className="material-symbols-outlined text-[16px]">payments</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate">
                              {order.businessName || order.username}
                              {user && <span className="text-slate-500 font-normal"> · {user.email}</span>}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Upgrade ke <span className="text-purple-300 font-bold">{order.plan}</span> · {formatRupiah(order.price)} · {order.paymentMethod}
                            </p>
                            <p className="text-[9px] text-slate-500 mt-0.5">
                              {new Date(order.createdAt).toLocaleString('id-ID')}
                            </p>
                          </div>
                          {isUnseen && (
                            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 mt-2 animate-pulse" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
                {pendingCount > 0 && (
                  <div className="px-4 py-2.5 border-t border-white/[0.06]">
                    <button
                      onClick={() => { navigate('/super-admin/payments'); setNotifOpen(false); }}
                      className="w-full text-center text-[10px] text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                    >
                      Lihat Semua di Halaman Pembayaran →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metric Grid — 6 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Pengguna', value: totalUsers, sub: 'Akun Terdaftar', icon: 'group', iconColor: 'text-cyan-400' },
          { label: 'Premium', value: premiumCount, sub: 'Aktif', icon: 'workspace_premium', iconColor: 'text-cyan-400' },
          { label: 'Business', value: businessCount, sub: 'Aktif', icon: 'diamond', iconColor: 'text-purple-400' },
          { label: 'Free / Expired', value: `${freeCount} / ${expiredCount}`, sub: 'Non-Paying', icon: 'person_outline', iconColor: 'text-yellow-400' },
          { label: 'Pending ACC', value: pendingCount, sub: 'Butuh Verifikasi', icon: 'hourglass_empty', iconColor: 'text-rose-400', pulse: pendingCount > 0 },
          { label: 'Estimasi MRR', value: formatRupiah(mrr), sub: `Konversi ${conversionRate}%`, icon: 'payments', iconColor: 'text-emerald-400', isSmallText: true },
        ].map((m, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 relative overflow-hidden backdrop-blur-xl group hover:bg-white/[0.04] transition-all">
            <div className={`absolute top-0 right-0 p-2.5 ${m.iconColor} opacity-15`}>
              <span className="material-symbols-outlined text-[32px]">{m.icon}</span>
            </div>
            <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">{m.label}</span>
            <span className={`block font-black text-slate-100 mt-1.5 font-display ${m.isSmallText ? 'text-sm' : 'text-xl'} ${m.label === 'Estimasi MRR' ? 'text-emerald-400' : ''}`}>
              {m.value}
            </span>
            <span className={`block text-[9px] mt-0.5 font-bold ${m.pulse ? 'text-rose-300 animate-pulse' : 'text-slate-500'}`}>{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Revenue Stat Bar */}
      <div className="bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5 border border-white/[0.06] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">account_balance</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Total Revenue Terkumpul</p>
            <p className="text-lg font-black text-emerald-400 font-display">{formatRupiah(totalRevenue)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{allPayments.filter(o => o.status === 'APPROVED').length} transaksi disetujui</span>
          <span className="text-white/10">|</span>
          <span>{allPayments.filter(o => o.status === 'REJECTED').length} ditolak</span>
          <span className="text-white/10">|</span>
          <span className="text-rose-300 font-bold">{pendingCount} pending</span>
        </div>
      </div>

      {/* Two Column Layout: Pending + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending Payments */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-400 text-base">hourglass_empty</span>
              Pembayaran Pending ({pendingCount})
            </h3>
            <button onClick={() => navigate('/super-admin/payments')} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold">
              Semua →
            </button>
          </div>
          <div className="space-y-2">
            {pendingPayments.slice(0, 5).map((order) => {
              const user = (state.users || []).find(u => u.id === order.userId);
              return (
                <div key={order.id} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl hover:bg-white/[0.03] transition-all">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{order.businessName || order.username}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {order.plan} · {formatRupiah(order.price)} · {order.paymentMethod}
                      {user && <span className="text-slate-500"> · {user.email}</span>}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{new Date(order.createdAt).toLocaleString('id-ID')}</p>
                  </div>
                  <button
                    onClick={() => handleApproveFromNotif(order)}
                    className="px-3 py-1.5 bg-rose-500/15 text-rose-300 border border-rose-500/20 rounded-xl text-[10px] font-bold hover:bg-rose-500/25 transition-all shrink-0 ml-3"
                  >
                    Verifikasi
                  </button>
                </div>
              );
            })}
            {pendingCount === 0 && (
              <div className="text-center py-6 text-slate-500 text-xs italic">
                Tidak ada pembayaran pending.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-base">history</span>
              Aktivitas Admin Terbaru
            </h3>
            <button onClick={() => navigate('/super-admin/logs')} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold">
              Semua Log →
            </button>
          </div>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full shrink-0 ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <p className="text-xs text-slate-300 truncate">{log.details}</p>
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium shrink-0">
                    {new Date(log.timestamp).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-xs italic">
                Belum ada aktivitas admin.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full User Management Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-base">group</span>
            Semua Pengguna Terdaftar ({totalUsers})
          </h3>
          <button onClick={() => navigate('/super-admin/users')} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold">
            Kelola Detail →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01] text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                <th className="py-3 px-5">Pengguna</th>
                <th className="py-3 px-5">Plan</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Mulai / Berakhir</th>
                <th className="py-3 px-5 text-center">Transaksi</th>
                <th className="py-3 px-5">Terdaftar</th>
                <th className="py-3 px-5 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentUsers.map((user) => {
                const userPayments = allPayments.filter(po => po.userId === user.id);
                const approvedCount = userPayments.filter(po => po.status === 'APPROVED').length;
                const totalPaid = userPayments.filter(po => po.status === 'APPROVED').reduce((sum, po) => sum + (po.price || 0), 0);

                return (
                  <tr key={user.id} className="hover:bg-white/[0.01] transition-all text-xs">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0">
                          {(user.nama || user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-200 truncate">{user.nama || user.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">@{user.username} · {user.email}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Last Login: <span className="text-slate-300 font-medium">{user.lastLogin ? new Date(user.lastLogin).toLocaleString('id-ID') : 'Belum Pernah'}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                        user.plan === 'PREMIUM' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                        : user.plan === 'BUSINESS' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {user.plan || 'FREE'}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        user.planStatus === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400'
                        : user.planStatus === 'PENDING' ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {user.planStatus || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-[10px] text-slate-400">
                      <div>
                        <span className="text-slate-500">Start: </span>
                        <span className="text-slate-300">{user.planStartedAt ? new Date(user.planStartedAt).toLocaleDateString('id-ID') : '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">End: </span>
                        <span className={user.planExpiresAt && user.planExpiresAt < Date.now() ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString('id-ID') : '∞'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <p className="font-bold text-slate-200">{approvedCount}x</p>
                      <p className="text-[9px] text-emerald-400 font-bold">{formatRupiah(totalPaid)}</p>
                    </td>
                    <td className="py-3 px-5 text-[10px] text-slate-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickExtend(user.id, 30)}
                          className="px-2 py-1 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-lg text-[9px] font-bold transition-all"
                          title="Perpanjang +30 hari"
                        >
                          +30d
                        </button>
                        <button
                          onClick={() => handleOpenQuickEdit(user)}
                          className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/25 text-purple-300 rounded-lg text-[9px] font-bold transition-all flex items-center gap-0.5"
                          title="Edit lisensi"
                        >
                          <span className="material-symbols-outlined text-[12px]">edit</span>
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-500 italic text-xs">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalUsers > 8 && (
          <div className="px-5 py-3 border-t border-white/[0.06] text-center">
            <button onClick={() => navigate('/super-admin/users')} className="text-xs text-cyan-400 hover:text-cyan-300 font-bold">
              Lihat semua {totalUsers} pengguna →
            </button>
          </div>
        )}
      </div>

      {/* Subscription Expirations */}
      {expiringUsers.length > 0 && (
        <div className="bg-white/[0.02] border border-yellow-500/10 rounded-2xl p-5 backdrop-blur-xl space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400 text-base">warning</span>
            Langganan Segera Berakhir (7 Hari)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expiringUsers.map((user) => {
              const daysLeft = Math.ceil((user.planExpiresAt - today) / (24 * 60 * 60 * 1000));
              return (
                <div key={user.id} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-200">{user.businessName || user.nama}</p>
                    <p className="text-[10px] text-amber-400 font-medium mt-0.5">
                      Sisa {daysLeft} hari ({new Date(user.planExpiresAt).toLocaleDateString('id-ID')})
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickExtend(user.id, 30)}
                      className="px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 rounded-lg text-[10px] font-bold transition-all"
                    >
                      +30 Hari
                    </button>
                    <button
                      onClick={() => navigate('/super-admin/subscriptions')}
                      className="px-2.5 py-1.5 bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 rounded-lg text-[10px] font-bold hover:bg-yellow-500/20 transition-all"
                    >
                      Kelola
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════ MODALS ═══════════ */}

      {/* Payment Detail Modal (from notification click) */}
      {paymentDetailOrder && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-lg w-full shadow-2xl animate-scale-in space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">receipt_long</span>
                Detail Pembayaran
              </h3>
              <button onClick={() => setPaymentDetailOrder(null)} className="w-8 h-8 rounded-full hover:bg-white/[0.04] text-slate-400 hover:text-white flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Payment info */}
            {(() => {
              const user = (state.users || []).find(u => u.id === paymentDetailOrder.userId);
              return (
                <div className="space-y-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">Nama / Usaha</span>
                      <span className="text-slate-200 font-bold">{paymentDetailOrder.businessName || paymentDetailOrder.username}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">Email</span>
                      <span className="text-slate-200">{user?.email || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">Plan Upgrade</span>
                      <span className="text-purple-300 font-bold">{paymentDetailOrder.plan}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">Nominal</span>
                      <span className="text-emerald-400 font-black text-sm">{formatRupiah(paymentDetailOrder.price)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">Metode Pembayaran</span>
                      <span className="text-slate-200">{paymentDetailOrder.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">Status</span>
                      <span className="text-rose-300 font-bold animate-pulse">{paymentDetailOrder.status}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block text-[10px] font-bold">Waktu Request</span>
                      <span className="text-slate-200">{new Date(paymentDetailOrder.createdAt).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Payment proof */}
                  {paymentDetailOrder.paymentProof && (
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold mb-1.5">Bukti Transfer</span>
                      <img
                        src={paymentDetailOrder.paymentProof}
                        alt="Bukti Transfer"
                        className="max-h-48 rounded-xl border border-white/10 object-contain"
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Admin note */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Catatan Admin</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Catatan verifikasi (opsional untuk ACC, wajib untuk tolak)..."
                rows="2"
                className="input-base resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <button onClick={() => setPaymentDetailOrder(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/[0.04]">
                Batal
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/20 hover:bg-rose-500/25"
              >
                Tolak
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">check</span>
                Setujui (ACC)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit User Modal */}
      {quickEditUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400">admin_panel_settings</span>
                Edit Lisensi — @{quickEditUser.username}
             </h3>
              <button
                onClick={() => setQuickEditUser(null)}
                disabled={editLoading}
                className="w-8 h-8 rounded-full hover:bg-white/[0.04] text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-50"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Paket Plan</label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value)}
                    disabled={editLoading}
                    className="input-base cursor-pointer disabled:opacity-50"
                  >
                    <option value="FREE" className="bg-slate-900">FREE</option>
                    <option value="PREMIUM" className="bg-slate-900">PREMIUM</option>
                    <option value="BUSINESS" className="bg-slate-900">BUSINESS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    disabled={editLoading}
                    className="input-base cursor-pointer disabled:opacity-50"
                  >
                    <option value="ACTIVE" className="bg-slate-900">ACTIVE</option>
                    <option value="PENDING" className="bg-slate-900">PENDING</option>
                    <option value="EXPIRED" className="bg-slate-900">EXPIRED</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Tanggal Berakhir</label>
                <input
                  type="date"
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  disabled={editLoading}
                  className="input-base disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Perpanjang (Hari Tambahan)</label>
                <input
                  type="number"
                  value={extendDays}
                  onChange={(e) => setExtendDays(e.target.value)}
                  placeholder="Contoh: 30"
                  disabled={editLoading}
                  className="input-base disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
              <button
                onClick={() => setQuickEditUser(null)}
                disabled={editLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/[0.04] disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveQuickEdit}
                disabled={editLoading}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-1.5 ${
                  !editLoading
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 cursor-pointer'
                    : 'bg-slate-800 border border-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                {editLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
