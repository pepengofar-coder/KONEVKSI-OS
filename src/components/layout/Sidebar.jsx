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
    <aside className="hidden md:flex flex-col h-screen py-6 bg-surface-container-low w-72 border-r border-outline-variant/10 shrink-0">
      {/* Brand */}
      <div className="px-6 mb-8">
        <h1 className="text-lg font-black text-primary tracking-tighter">Konveksi OS</h1>
        <p className="text-[10px] text-outline uppercase tracking-[0.2em] font-bold mt-1">Manajemen Produksi</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-6 px-2">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-outline">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-fixed/40 text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-high/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{
                          fontVariationSettings: isActive
                            ? "'FILL' 1"
                            : "'FILL' 0",
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
      <div className="mt-auto px-4 pt-4 border-t border-outline-variant/10">
        <div className="px-4 py-3 bg-surface-container rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold">
            A
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface leading-tight">Admin</p>
            <p className="text-[10px] text-outline">Konveksi</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
