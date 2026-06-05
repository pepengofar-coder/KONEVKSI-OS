import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState, useHelpers } from '../context/AppContext';
import StatCard from '../components/ui/StatCard';
import BarangMasukForm from '../components/forms/BarangMasukForm';
import KasbonForm from '../components/forms/KasbonForm';
import CostForm from '../components/forms/CostForm';

export default function Dashboard() {
  const state = useAppState();
  const { getTodayKelaran, getTodayCost, getAllKasbonBelumLunas, formatRupiah, getModel, getTaylor } = useHelpers();

  const [showBarangMasuk, setShowBarangMasuk] = useState(false);
  const [showKasbon, setShowKasbon] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const todayKelaran = getTodayKelaran();
  const todayCost = getTodayCost();
  const kasbonBelumLunas = getAllKasbonBelumLunas();

  const totalKelaranPcs = todayKelaran.reduce((s, k) => s + k.jumlah, 0);
  const totalCostRp = todayCost.reduce((s, c) => s + c.nominal, 0);
  const totalKasbonRp = kasbonBelumLunas.reduce((s, kb) => s + kb.nominal, 0);

  // Recent activities (combine last few entries from all modules)
  const recentActivities = [
    ...state.kelaran.slice(0, 3).map(k => ({
      type: 'kelaran',
      icon: 'check_circle',
      text: `${getTaylor(k.taylorId)?.nama} setor ${k.jumlah} pcs ${getModel(k.modelId)?.nama}`,
      date: k.tanggal,
    })),
    ...state.kasbon.slice(0, 2).map(kb => ({
      type: 'kasbon',
      icon: 'account_balance_wallet',
      text: `Kasbon ${getTaylor(kb.taylorId)?.nama}: ${formatRupiah(kb.nominal)}`,
      date: kb.tanggal,
    })),
    ...state.costHarian.slice(0, 2).map(c => ({
      type: 'cost',
      icon: 'payments',
      text: `${c.deskripsi}: ${formatRupiah(c.nominal)}`,
      date: c.tanggal,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const today = new Date();
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold text-outline uppercase tracking-[0.15em]">
            {dayNames[today.getDay()]}, {today.getDate()} {monthNames[today.getMonth()]}
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight mt-1">
            Dashboard
          </h1>
        </div>
      </div>

      {/* Stat Cards - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        <StatCard
          icon="check_circle"
          label="Kelaran Hari Ini"
          value={`${totalKelaranPcs} pcs`}
          subtitle={todayKelaran.length > 0 ? `${todayKelaran.length} entri hari ini` : 'Belum ada kelaran'}
          variant="primary"
        />
        <StatCard
          icon="payments"
          label="Cost Hari Ini"
          value={formatRupiah(totalCostRp)}
          subtitle={todayCost.length > 0 ? `${todayCost.length} pengeluaran` : 'Belum ada cost'}
          variant="tertiary"
        />
        <StatCard
          icon="account_balance_wallet"
          label="Kasbon Belum Lunas"
          value={formatRupiah(totalKasbonRp)}
          subtitle={`${kasbonBelumLunas.length} kasbon aktif`}
          variant="warning"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-[0.1em] mb-3 px-1">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/barang-masuk"
            className="bg-surface-container-lowest p-5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all active:scale-95 hover:shadow-md hover:shadow-primary/5 text-primary group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">inventory_2</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-center">Barang Masuk</span>
          </Link>
          <Link
            to="/on-progress"
            className="bg-surface-container-lowest p-5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all active:scale-95 hover:shadow-md hover:shadow-primary/5 text-primary group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">sync</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-center">On Progress</span>
          </Link>
          <Link
            to="/kelaran"
            className="bg-surface-container-lowest p-5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all active:scale-95 hover:shadow-md hover:shadow-primary/5 text-primary group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">check_circle</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-center">Kelaran</span>
          </Link>
          <Link
            to="/invoice"
            className="bg-surface-container-lowest p-5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all active:scale-95 hover:shadow-md hover:shadow-primary/5 text-primary group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">receipt_long</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-center">Invoice</span>
          </Link>
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-[0.1em] mb-3 px-1">
          Aktivitas Terbaru
        </h2>
        <div className="bg-surface-container-lowest rounded-3xl divide-y divide-outline-variant/10 overflow-hidden">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-sm text-outline">Belum ada aktivitas</div>
          ) : (
            recentActivities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-container-low/50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  activity.type === 'kelaran'
                    ? 'bg-tertiary-fixed/20 text-tertiary'
                    : activity.type === 'kasbon'
                    ? 'bg-warning-container text-on-warning-container'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface truncate">{activity.text}</p>
                  <p className="text-[10px] text-outline font-medium">{activity.date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FAB with quick menu */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40">
        {showQuickMenu && (
          <div className="absolute bottom-16 right-0 bg-surface-container-lowest rounded-2xl shadow-2xl p-2 min-w-[180px] animate-scale-in">
            <button
              onClick={() => { setShowBarangMasuk(true); setShowQuickMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-left"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
              <span className="text-sm font-medium">Barang Masuk</span>
            </button>
            <button
              onClick={() => { setShowKasbon(true); setShowQuickMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-left"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
              <span className="text-sm font-medium">Kasbon</span>
            </button>
            <button
              onClick={() => { setShowCost(true); setShowQuickMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-left"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
              <span className="text-sm font-medium">Cost Harian</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setShowQuickMenu(!showQuickMenu)}
          className={`flex items-center justify-center w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-2xl shadow-primary/25 hover:shadow-primary/35 hover:scale-105 active:scale-95 transition-all duration-200 ${showQuickMenu ? 'rotate-45' : ''}`}
        >
          <span className="material-symbols-outlined text-[26px]">add</span>
        </button>
      </div>

      {/* Modals */}
      <BarangMasukForm isOpen={showBarangMasuk} onClose={() => setShowBarangMasuk(false)} />
      <KasbonForm isOpen={showKasbon} onClose={() => setShowKasbon(false)} />
      <CostForm isOpen={showCost} onClose={() => setShowCost(false)} />
    </div>
  );
}
