import { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { ROLE_ROUTES } from './AppLayout';

const navGroups = [
  { label: 'Utama', items: [{ to: '/dashboard', icon: 'dashboard', label: 'Dashboard' }] },
  { label: 'Produksi', items: [
    { to: '/barang-masuk', icon: 'inventory_2', label: 'Barang Masuk' },
    { to: '/bahan-baku', icon: 'inventory', label: 'Bahan Baku' },
    { to: '/on-progress', icon: 'sync', label: 'On Progress' },
    { to: '/kelaran', icon: 'check_circle', label: 'Kelaran' },
  ]},
  { label: 'Penjualan', items: [
    { to: '/pelanggan', icon: 'groups', label: 'Pelanggan' },
    { to: '/invoice-pelanggan', icon: 'description', label: 'Invoice Pelanggan' },
  ]},
  { label: 'Keuangan Penjahit', items: [
    { to: '/kasbon-taylor', icon: 'account_balance_wallet', label: 'Kasbon Taylor' },
    { to: '/invoice-taylor', icon: 'receipt_long', label: 'Invoice Taylor' },
  ]},
  { label: 'Laporan & Kas', items: [
    { to: '/cost-harian', icon: 'payments', label: 'Cost Harian' },
    { to: '/laporan', icon: 'analytics', label: 'Laporan Keuangan' },
  ]},
  { label: 'Pengaturan', items: [{ to: '/profile', icon: 'settings', label: 'Pengaturan Usaha' }] },
];

export { navGroups };

export default function MobileDrawer({ isOpen, onClose }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  const userBusinessRole = state.currentUser?.businessRole || 'Owner';
  const userName = state.currentUser?.nama || 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();
  const userRoleLabel = `${state.currentUser?.role || 'USER'} · ${state.currentUser?.businessProfile?.namaUsaha || 'Konveksi'}`;

  // Filter nav groups by user's business role
  const allowedRoutes = ROLE_ROUTES[userBusinessRole] || [];
  const filteredNavGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => allowedRoutes.includes(item.to))
    }))
    .filter(group => group.items.length > 0);

  // Lock body scroll & handle Escape
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handleKey);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKey);
      };
    }
  }, [isOpen, onClose]);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 animate-fade-in">
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="absolute left-0 top-0 bottom-0 w-72 bg-slate-950/40 border-r border-white/10 backdrop-blur-3xl flex flex-col animate-slide-in-left shadow-2xl"
      >
        {/* Brand */}
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <span className="material-symbols-outlined text-white text-[16px] filled">checkroom</span>
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Konveksi OS
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.15em] font-bold leading-none mt-0.5">
              Production Suite
            </p>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {filteredNavGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500 px-3 mb-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    end={item.to === '/dashboard'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-cyan-500/15 border border-white/[0.08] text-cyan-300 font-semibold shadow-[0_4px_20px_-2px_rgba(168,85,247,0.15)]'
                          : 'text-slate-400 border border-transparent hover:bg-white/[0.04] hover:text-slate-200'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className="material-symbols-outlined text-[20px]"
                          style={{
                            fontVariationSettings: isActive ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
                          }}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="text-sm font-bold text-slate-200 truncate">{userName}</p>
                <NavLink
                  to="/pricing"
                  onClick={onClose}
                  className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-full uppercase shrink-0 hover:scale-105 active:scale-95 transition-all ${
                    (state.currentUser?.plan || 'FREE') === 'PREMIUM'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : (state.currentUser?.plan || 'FREE') === 'BUSINESS'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}
                >
                  {state.currentUser?.plan || 'FREE'}
                </NavLink>
              </div>
              <p className="text-[10px] text-slate-500 truncate">{userRoleLabel}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-white/[0.06] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Keluar
          </button>
        </div>
      </aside>
    </div>
  );
}
