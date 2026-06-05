import { NavLink } from 'react-router-dom';

const navGroups = [
  {
    label: 'Utama',
    items: [
      { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    ],
  },
  {
    label: 'Produksi',
    items: [
      { to: '/barang-masuk', icon: 'inventory_2', label: 'Barang Masuk' },
      { to: '/on-progress', icon: 'sync', label: 'On Progress' },
      { to: '/kelaran', icon: 'check_circle', label: 'Kelaran' },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { to: '/kasbon', icon: 'account_balance_wallet', label: 'Kasbon' },
      { to: '/invoice', icon: 'receipt_long', label: 'Invoice Taylor' },
    ],
  },
  {
    label: 'Kas',
    items: [
      { to: '/cost-harian', icon: 'payments', label: 'Cost Harian' },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col h-screen py-6 bg-slate-950/40 backdrop-blur-2xl w-72 border-r border-white/[0.06] shrink-0 text-white relative z-20">
      {/* Brand */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
          <span className="material-symbols-outlined text-white text-[16px] filled">checkroom</span>
        </div>
        <div>
          <h1 className="text-base font-black tracking-tighter bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Konveksi OS</h1>
          <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black leading-none mt-0.5">Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-6 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
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
                        ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-cyan-400 font-semibold border-l-2 border-cyan-400 shadow-[inset_1px_0_0_rgba(6,182,212,0.1)]'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
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
      <div className="mt-auto px-4 pt-4 border-t border-white/[0.06]">
        <div className="px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex items-center gap-3 hover:bg-white/[0.04] transition-all">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/20">
            A
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100 leading-tight">Admin</p>
            <p className="text-[10px] text-slate-500">Konveksi Owner</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
