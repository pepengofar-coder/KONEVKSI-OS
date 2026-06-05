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
    <div className="space-y-6 animate-fade-in-up text-white">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
            {dayNames[today.getDay()]}, {today.getDate()} {monthNames[today.getMonth()]}
          </p>
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent tracking-tight mt-1">
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
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/barang-masuk"
            className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 active:scale-95 hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 text-slate-200 group"
          >
            <span className="material-symbols-outlined text-2xl text-purple-400 group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-300">inventory_2</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 group-hover:text-slate-200 transition-colors">Barang Masuk</span>
          </Link>
          <Link
            to="/on-progress"
            className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 active:scale-95 hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 text-slate-200 group"
          >
            <span className="material-symbols-outlined text-2xl text-cyan-400 group-hover:scale-110 group-hover:text-purple-400 transition-all duration-300">sync</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 group-hover:text-slate-200 transition-colors">On Progress</span>
          </Link>
          <Link
            to="/kelaran"
            className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 active:scale-95 hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 text-slate-200 group"
          >
            <span className="material-symbols-outlined text-2xl text-emerald-400 group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-300">check_circle</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 group-hover:text-slate-200 transition-colors">Kelaran</span>
          </Link>
          <Link
            to="/invoice"
            className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 active:scale-95 hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 text-slate-200 group"
          >
            <span className="material-symbols-outlined text-2xl text-amber-400 group-hover:scale-110 group-hover:text-purple-400 transition-all duration-300">receipt_long</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 group-hover:text-slate-200 transition-colors">Invoice</span>
          </Link>
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">
          Aktivitas Terbaru
        </h2>
        <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-md rounded-3xl divide-y divide-white/[0.04] overflow-hidden">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">Belum ada aktivitas</div>
          ) : (
            recentActivities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  activity.type === 'kelaran'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    : activity.type === 'kasbon'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{activity.text}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{activity.date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FAB with quick menu */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40">
        {showQuickMenu && (
          <div className="absolute bottom-16 right-0 bg-slate-900/95 border border-white/[0.08] backdrop-blur-2xl rounded-2xl shadow-2xl p-2.5 min-w-[190px] animate-scale-in text-white shadow-black/80">
            <button
              onClick={() => { setShowBarangMasuk(true); setShowQuickMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-colors text-left text-slate-300 hover:text-white"
            >
              <span className="material-symbols-outlined text-purple-400 text-[20px]">inventory_2</span>
              <span className="text-xs font-semibold tracking-wide">Barang Masuk</span>
            </button>
            <button
              onClick={() => { setShowKasbon(true); setShowQuickMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-colors text-left text-slate-300 hover:text-white"
            >
              <span className="material-symbols-outlined text-amber-400 text-[20px]">account_balance_wallet</span>
              <span className="text-xs font-semibold tracking-wide">Kasbon</span>
            </button>
            <button
              onClick={() => { setShowCost(true); setShowQuickMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-colors text-left text-slate-300 hover:text-white"
            >
              <span className="material-symbols-outlined text-cyan-400 text-[20px]">payments</span>
              <span className="text-xs font-semibold tracking-wide">Cost Harian</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setShowQuickMenu(!showQuickMenu)}
          className={`flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all duration-200 ${showQuickMenu ? 'rotate-45' : ''}`}
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

