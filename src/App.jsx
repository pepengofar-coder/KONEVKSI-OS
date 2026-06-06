import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppState } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';

// Eager load auth pages (needed immediately)
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Lazy load dashboard pages for better initial load performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BarangMasuk = lazy(() => import('./pages/BarangMasuk'));
const OnProgress = lazy(() => import('./pages/OnProgress'));
const Kelaran = lazy(() => import('./pages/Kelaran'));
const Kasbon = lazy(() => import('./pages/Kasbon'));
const InvoiceTaylor = lazy(() => import('./pages/InvoiceTaylor'));
const CostHarian = lazy(() => import('./pages/CostHarian'));
const LaporanKeuangan = lazy(() => import('./pages/LaporanKeuangan'));
const InvoicePelanggan = lazy(() => import('./pages/InvoicePelanggan'));
const Customers = lazy(() => import('./pages/Customers'));
const Profile = lazy(() => import('./pages/Profile'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const TrackingPublic = lazy(() => import('./pages/TrackingPublic'));
const Pricing = lazy(() => import('./pages/Pricing'));

// Super Admin pages lazy loads
const SuperAdminLayout = lazy(() => import('./components/layout/SuperAdminLayout'));
const SuperAdminLogin = lazy(() => import('./pages/super-admin/SuperAdminLogin'));
const SuperAdminDashboard = lazy(() => import('./pages/super-admin/SuperAdminDashboard'));
const SuperAdminPayments = lazy(() => import('./pages/super-admin/SuperAdminPayments'));
const SuperAdminUsers = lazy(() => import('./pages/super-admin/SuperAdminUsers'));
const SuperAdminSubscriptions = lazy(() => import('./pages/super-admin/SuperAdminSubscriptions'));
const SuperAdminLogs = lazy(() => import('./pages/super-admin/SuperAdminLogs'));
const SuperAdminSettings = lazy(() => import('./pages/super-admin/SuperAdminSettings'));

// Loading skeleton for lazy-loaded pages
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Memuat...</p>
      </div>
    </div>
  );
}

function DomainRedirector({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useAppState();

  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isMockAdminDomain = new URLSearchParams(window.location.search).get('domain') === 'admin';
    const isAdminDomain = isLocalhost && isMockAdminDomain;
    
    if (isAdminDomain) {
      if (location.pathname === '/' || !location.pathname.startsWith('/super-admin')) {
        navigate('/super-admin/dashboard');
      }
    }

    // Redirect admins/super-admins to their dashboard when accessing root or user login
    if (state?.currentUser && (state.currentUser.role === 'SUPER_ADMIN' || state.currentUser.role === 'ADMIN')) {
      if (location.pathname === '/' || location.pathname === '/login') {
        navigate('/super-admin/dashboard');
      }
    }
  }, [location.pathname, navigate, state?.currentUser]);

  return children;
}

export default function App() {
  return (
    <AppProvider>
      <DomainRedirector>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/tracking/:id" element={<TrackingPublic />} />

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/barang-masuk" element={<BarangMasuk />} />
            <Route path="/on-progress" element={<OnProgress />} />
            <Route path="/kelaran" element={<Kelaran />} />
            <Route path="/kasbon" element={<Kasbon />} />
            <Route path="/invoice" element={<InvoiceTaylor />} />
            <Route path="/cost-harian" element={<CostHarian />} />
            <Route path="/laporan" element={<LaporanKeuangan />} />
            <Route path="/invoice-pelanggan" element={<InvoicePelanggan />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>

          {/* Super Admin Routes */}
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route element={<SuperAdminLayout />}>
            <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/payments" element={<SuperAdminPayments />} />
            <Route path="/super-admin/users" element={<SuperAdminUsers />} />
            <Route path="/super-admin/subscriptions" element={<SuperAdminSubscriptions />} />
            <Route path="/super-admin/logs" element={<SuperAdminLogs />} />
            <Route path="/super-admin/settings" element={<SuperAdminSettings />} />
          </Route>

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </DomainRedirector>
    </AppProvider>
  );
}
