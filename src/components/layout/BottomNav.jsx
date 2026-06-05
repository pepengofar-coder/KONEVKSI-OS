import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/barang-masuk', icon: 'inventory_2', label: 'Produksi' },
  { to: '/kasbon', icon: 'account_balance_wallet', label: 'Keuangan' },
  { to: '/cost-harian', icon: 'payments', label: 'Kas' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-5 pt-2 bg-slate-950/80 border-t border-white/[0.08] backdrop-blur-2xl z-50 rounded-t-[1.5rem] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
      {tabs.map((tab) => (
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
                className={`flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-gradient-to-r from-purple-500/15 to-cyan-500/15 border border-cyan-500/20' : ''
                }`}
              >
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
              <span className={`text-[9px] font-black tracking-widest uppercase mt-0.5 transition-colors ${
                isActive ? 'text-cyan-400' : 'text-slate-500'
              }`}>
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

