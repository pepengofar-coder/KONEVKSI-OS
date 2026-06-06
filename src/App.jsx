import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
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

export default function App() {
  return (
    <AppProvider>
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

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppProvider>
  );
}
