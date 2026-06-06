import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';

export default function SuperAdminLayout() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useHelpers();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Guard: Redirect if not logged in or not admin
  useEffect(() => {
    if (!state.currentUser) {
      navigate('/super-admin/login');
    } else if (state.currentUser.role !== 'SUPER_ADMIN' && state.currentUser.role !== 'ADMIN') {
      showToast('Akses Ditolak: Halaman ini hanya untuk Administrator.', 'error');
      navigate('/dashboard');
    }
  }, [state.currentUser, navigate]);

  if (!state.currentUser || (state.currentUser.role !== 'SUPER_ADMIN' && state.currentUser.role !== 'ADMIN')) {
    return null; // Don't flash layout
  }

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const adminName = state.currentUser.nama || state.currentUser.name || 'Admin';
  const adminUsername = state.currentUser.username || 'admin';
  const adminInitial = adminName.charAt(0).toUpperCase();
  const toasts = state.toasts || [];

  const pendingPaymentsCount = (state.paymentOrders || []).filter(o => o.status === 'PENDING').length;

  const menuItems = [
    { to: '/super-admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/super-admin/payments', label: 'Pembayaran', icon: 'payments', badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null },
    { to: '/super-admin/users', label: 'Pengguna', icon: 'group' },
    { to: '/super-admin/subscriptions', label: 'Subscription', icon: 'card_membership' },
    { to: '/super-admin/logs', label: 'Audit Log', icon: 'receipt_long' },
    { to: '/super-admin/settings', label: 'Pengaturan', icon: 'settings' },
  ];

  const isSuperAdmin = state.currentUser.role === 'SUPER_ADMIN';
  const roleLabel = isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN (Terbatas)';
  const badgeColor = isSuperAdmin 
    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-6 lg:p-8 premium-bg relative overflow-hidden text-slate-100 font-sans">
      {/* Background blobs for premium SaaS glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[40vw] h-[40vw] max-w-[500px] bg-pink-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-scale-in cursor-pointer ${
              toast.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/20 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-red-950/80 border-red-500/20 text-red-300'
                : 'bg-slate-900/90 border-white/[0.08] text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] filled">
                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
              </span>
              <p className="text-xs font-bold leading-normal">{toast.message}</p>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400 hover:text-white">close</span>
          </div>
        ))}
      </div>

      {/* Main glassmorphic container */}
      <div className="w-full md:max-w-[1440px] h-screen md:h-[90vh] md:rounded-[2.5rem] border-none md:border border-white/10 backdrop-blur-2xl bg-white/[0.04] shadow-2xl flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col h-full py-6 bg-white/[0.02] border-r border-white/10 shrink-0 w-72 relative z-20">
          <div className="px-6 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <span className="material-symbols-outlined text-white text-[16px] filled">shield</span>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tighter bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Konveksi OS</h1>
              <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-extrabold leading-none mt-0.5">SUPER ADMIN PORTAL</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto space-y-1.5 px-3">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-cyan-500/15 border border-white/[0.08] text-cyan-300 font-semibold shadow-[0_4px_20px_-2px_rgba(168,85,247,0.15)]'
                      : 'text-slate-400 border border-transparent hover:bg-white/[0.04] hover:text-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gradient-to-b from-purple-400 to-cyan-400" />
                      )}
                      <span
                        className={`material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-110 ${
                          isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto px-4 pt-4 border-t border-white/[0.06] space-y-3">
            <div className="px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex items-center justify-between hover:bg-white/[0.04] transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/20 shrink-0">
                  {adminInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-100 leading-tight truncate">{adminName}</p>
                  <p className="text-[9px] text-slate-400 truncate mt-0.5">@{adminUsername}</p>
                  <span className={`inline-block text-[7px] font-black tracking-widest px-1 py-0.5 rounded-md uppercase mt-1 ${badgeColor}`}>
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/25 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Keluar
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/40 relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="material-symbols-outlined text-white text-[16px] filled">shield</span>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Konveksi OS</h1>
              <p className="text-[8px] text-slate-400 uppercase tracking-[0.2em] font-extrabold leading-none mt-0.5">SUPER ADMIN PORTAL</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[73px] bottom-0 z-30 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 flex flex-col p-6 space-y-6 animate-fade-in">
            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between py-3 px-4 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600/25 border border-purple-500/30 text-white'
                        : 'text-slate-400 hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/25 text-rose-300 border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-white/[0.08] pt-4">
              <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {adminInitial}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100">{adminName}</p>
                    <p className="text-[9px] text-slate-400">@{adminUsername} · <span className="text-rose-300 font-bold">{roleLabel}</span></p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 text-xs font-bold flex items-center gap-1.5 border border-red-500/30"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content area */}
        <main className="flex-1 flex flex-col overflow-hidden relative z-10 bg-transparent">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 animate-fade-in">
              {/* Limited rights notice banner if not Super Admin */}
              {!isSuperAdmin && (
                <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-2xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">info</span>
                  <span><strong>Hak Akses Terbatas:</strong> Anda login dengan role ADMIN. Anda hanya dapat melihat data secara read-only. Tindakan modifikasi dinonaktifkan.</span>
                </div>
              )}
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
