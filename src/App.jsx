import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import BarangMasuk from './pages/BarangMasuk';
import OnProgress from './pages/OnProgress';
import Kelaran from './pages/Kelaran';
import Kasbon from './pages/Kasbon';
import InvoiceTaylor from './pages/InvoiceTaylor';
import CostHarian from './pages/CostHarian';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/barang-masuk" element={<BarangMasuk />} />
          <Route path="/on-progress" element={<OnProgress />} />
          <Route path="/kelaran" element={<Kelaran />} />
          <Route path="/kasbon" element={<Kasbon />} />
          <Route path="/invoice" element={<InvoiceTaylor />} />
          <Route path="/cost-harian" element={<CostHarian />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
