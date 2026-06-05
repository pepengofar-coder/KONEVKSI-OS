import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '../../context/AppContext';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/barang-masuk': 'Barang Masuk',
  '/on-progress': 'On Progress',
  '/kelaran': 'Kelaran',
  '/kasbon': 'Kasbon Taylor',
  '/invoice': 'Invoice Taylor',
  '/cost-harian': 'Cost Harian',
  '/laporan': 'Laporan Keuangan',
  '/invoice-pelanggan': 'Invoice Pelanggan',
  '/customers': 'Pelanggan',
  '/profile': 'Pengaturan Usaha',
};

export default function TopBar({ onOpenDrawer }) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useAppState();

  const userInitial = state.currentUser?.nama?.charAt(0)?.toUpperCase() || 'A';
  const pageTitle = PAGE_TITLES[location.pathname] || 'Konveksi OS';

  return (
    <header className="bg-white/[0.02] backdrop-blur-md border-b border-white/10 sticky top-0 z-40 flex justify-between items-center w-full px-4 md:px-6 h-14 md:h-16">
      <div className="flex items-center gap-3">
        {/* Hamburger menu — mobile only */}
        <button
          className="md:hidden p-1.5 -ml-1 rounded-xl hover:bg-white/[0.06] transition-all text-slate-300 hover:text-white flex items-center justify-center"
          onClick={onOpenDrawer}
          aria-label="Buka menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
        {/* Logo Icon for Mobile */}
        <div className="md:hidden w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/10 shrink-0">
          <span className="material-symbols-outlined text-white text-[14px] filled">checkroom</span>
        </div>
        <span className="text-base md:text-lg font-black tracking-tighter bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          {pageTitle}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-xl hover:bg-white/[0.06] transition-all text-slate-300 hover:text-white flex items-center justify-center"
          onClick={() => navigate('/dashboard')}
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-500/20">
          {userInitial}
        </div>
      </div>
    </header>
  );
}
