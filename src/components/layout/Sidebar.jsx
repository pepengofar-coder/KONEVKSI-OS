import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { ROLE_ROUTES } from './AppLayout';
import { navGroups } from './MobileDrawer';

export default function Sidebar() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const userInitial = state.currentUser ? state.currentUser.nama.charAt(0).toUpperCase() : 'A';
  const userName = state.currentUser ? state.currentUser.nama : 'Admin';
  const userRole = state.currentUser ? state.currentUser.role : 'Owner';
  const businessName = state.currentUser?.businessProfile?.namaUsaha || 'Konveksi';
  const userRoleLabel = state.currentUser ? `${state.currentUser.role} · ${businessName}` : 'Owner';

  const allowedRoutes = ROLE_ROUTES[userRole] || [];
  const filteredNavGroups = navGroups.map((group) => {
    const items = group.items.filter((item) => allowedRoutes.includes(item.to));
    return { ...group, items };
  }).filter((group) => group.items.length > 0);

  return (
    <aside className="hidden md:flex flex-col h-screen py-6 bg-white/[0.02] md:bg-white/[0.03] backdrop-blur-3xl w-72 border-r border-white/10 shrink-0 relative z-20">
      {/* Brand */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
          <span className="material-symbols-outlined text-white text-[16px] filled">checkroom</span>
        </div>
        <div>
          <h1 className="text-base font-black tracking-tighter bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Konveksi OS</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-bold leading-none mt-0.5 truncate max-w-[160px]">{businessName}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-6 px-3">
        {filteredNavGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-cyan-500/15 border border-white/[0.08] text-cyan-300 font-semibold shadow-[0_4px_20px_-2px_rgba(168,85,247,0.15)]'
                        : 'text-slate-400 border border-transparent hover:bg-white/[0.04] hover:text-slate-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active pill indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gradient-to-b from-purple-400 to-cyan-400" />
                      )}
                      <span
                        className={`material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-110 ${
                          isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                        style={{
                          fontVariationSettings: isActive
                            ? "'FILL' 1, 'wght' 500"
                            : "'FILL' 0, 'wght' 400",
                        }}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-4 pt-4 border-t border-white/[0.06] space-y-2">
        <div className="px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex items-center justify-between hover:bg-white/[0.04] transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/20 shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-100 leading-tight truncate">{userName}</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{userRoleLabel}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            title="Log Keluar"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
