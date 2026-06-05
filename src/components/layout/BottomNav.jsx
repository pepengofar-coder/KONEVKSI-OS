import { NavLink, useLocation } from 'react-router-dom';
import { useAppState } from '../../context/AppContext';
import { ROLE_ROUTES } from './AppLayout';

const tabs = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/barang-masuk', icon: 'inventory_2', label: 'Produksi' },
  { to: '/invoice-pelanggan', icon: 'description', label: 'Invoice' },
  { to: '/laporan', icon: 'analytics', label: 'Laporan' },
];

export default function BottomNav({ onOpenDrawer }) {
  const state = useAppState();
  const location = useLocation();
  const userRole = state.currentUser ? state.currentUser.role : 'Owner';
  const allowedRoutes = ROLE_ROUTES[userRole] || [];

  const filteredTabs = tabs.filter((tab) => allowedRoutes.includes(tab.to));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-5 pt-2 bg-slate-950/40 border-t border-white/10 backdrop-blur-3xl z-45 rounded-t-[1.5rem] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
      {filteredTabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/dashboard'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all duration-200 ${
              isActive
                ? 'text-cyan-400'
                : 'text-slate-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-gradient-to-r from-purple-500/15 to-cyan-500/15' : ''
                }`}
              >
                {/* Animated active indicator pill */}
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 animate-scale-in" />
                )}
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{
                    fontVariationSettings: isActive
                      ? "'FILL' 1, 'wght' 500"
                      : "'FILL' 0, 'wght' 400",
                  }}
                >
                  {tab.icon}
                </span>
              </div>
              <span className={`text-[10px] font-black tracking-widest uppercase mt-0.5 transition-colors ${
                isActive ? 'text-cyan-400' : 'text-slate-500'
              }`}>
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}

      {/* More / Menu tab — always visible, not filtered by roles */}
      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all duration-200 text-slate-400 active:text-cyan-400"
      >
        <div className="flex items-center justify-center w-14 h-8 rounded-full">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
          >
            menu
          </span>
        </div>
        <span className="text-[10px] font-black tracking-widest uppercase mt-0.5 text-slate-500">
          Menu
        </span>
      </button>
    </nav>
  );
}
