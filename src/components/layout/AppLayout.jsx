import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import MobileDrawer from './MobileDrawer';
import UpgradeModal from '../ui/UpgradeModal';

export const ROLE_ROUTES = {
  'Owner': ['/dashboard', '/barang-masuk', '/on-progress', '/kelaran', '/kasbon-taylor', '/invoice-taylor', '/cost-harian', '/laporan', '/invoice-pelanggan', '/pelanggan', '/profile', '/pricing'],
  'Admin Keuangan': ['/dashboard', '/barang-masuk', '/on-progress', '/kelaran', '/kasbon-taylor', '/invoice-taylor', '/cost-harian', '/laporan', '/invoice-pelanggan', '/pelanggan', '/profile', '/pricing'],
  'Staff Administrasi': ['/dashboard', '/barang-masuk', '/on-progress', '/kelaran', '/kasbon-taylor', '/invoice-taylor', '/cost-harian', '/laporan', '/invoice-pelanggan', '/pelanggan', '/profile', '/pricing']
};

export default function AppLayout() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useHelpers();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auth Guard & Onboarding Redirect
  useEffect(() => {
    const user = state.currentUser;
    if (!user) {
      return navigate("/login");
    }

    // SUPER_ADMIN should never reach AppLayout (should be caught by DomainRedirector)
    // But as defensive guard: redirect to their dashboard
    if (user.role === "SUPER_ADMIN") {
      return navigate("/super-admin/dashboard");
    }

    // Redirect to onboarding if user hasn't set up business profile
    if (!user.categories || user.categories.length === 0 || !user.businessRole) {
      return navigate('/onboarding');
    }
  }, [state.currentUser, navigate]);

  if (!state.currentUser) {
    return null; // Prevents flashing dashboard before redirect
  }

  const toasts = state.toasts || [];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-6 lg:p-8 premium-bg relative overflow-hidden">
      {/* Background blobs for premium SaaS glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[40vw] h-[40vw] max-w-[500px] bg-pink-500/5 rounded-full blur-[150px] pointer-events-none" />
      
      <UpgradeModal />
      
      {/* Toast Notification Container — z-[60] sits above modals (z-50) */}
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
      <div className="w-full md:max-w-[1440px] h-screen md:h-[90vh] md:rounded-[2.5rem] border-none md:border border-white/10 backdrop-blur-2xl bg-white/[0.04] shadow-2xl flex overflow-hidden relative z-10">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden relative z-10 bg-transparent">
          <TopBar onOpenDrawer={() => setDrawerOpen(true)} />
          <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 animate-fade-in">
              <Outlet />
            </div>
          </div>
        </main>
        <BottomNav onOpenDrawer={() => setDrawerOpen(true)} />
        <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </div>
  );
}
