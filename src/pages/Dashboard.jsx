import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState, useHelpers } from '../context/AppContext';
import { ROLE_ROUTES } from '../components/layout/AppLayout';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import BarangMasukForm from '../components/forms/BarangMasukForm';
import KasbonForm from '../components/forms/KasbonForm';
import CostForm from '../components/forms/CostForm';

export default function Dashboard() {
  const state = useAppState();
  const { getTodayKelaran, getTodayCost, getAllKasbonBelumLunas, formatRupiah, getModel, getTaylor, getSisaDistribusi } = useHelpers();

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

  const userRole = state.currentUser?.role || 'Owner';
  const businessName = state.currentUser?.businessProfile?.namaUsaha || 'Konveksi Anda';

  // Monthly Revenue Calculation
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = state.invoices
    .filter(inv => {
      const d = new Date(inv.tanggal);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  // Active Orders (invoices not yet Lunas)
  const activeOrders = state.invoices.filter(inv => inv.status !== 'Lunas').length;

  // Active Production (distribusi with sisa > 0)
  const activeProduction = state.distribusi.filter(d => {
    const sisa = getSisaDistribusi(d);
    return sisa > 0;
  }).length;

  // Hero quick action definitions with route-based filtering
  const heroQuickActions = [
    { label: 'Buat Order', icon: 'shopping_cart', to: '/invoice-pelanggan', color: 'purple' },
    { label: 'Buat Invoice', icon: 'receipt_long', to: '/invoice', color: 'cyan' },
    { label: 'Tambah Pelanggan', icon: 'person_add', to: '/customers', color: 'emerald' },
    { label: 'Tracking Produksi', icon: 'sync', to: '/on-progress', color: 'amber' },
  ];

  const allowedRoutes = ROLE_ROUTES[userRole] || [];
  const filteredHeroActions = heroQuickActions.filter(action => allowedRoutes.includes(action.to));

  // Role badge variant mapping
  const roleBadgeVariant = userRole === 'Owner' ? 'primary' : userRole === 'Admin Keuangan' ? 'secondary' : 'success';
  const roleBadgeIcon = userRole === 'Owner' ? 'shield' : userRole === 'Admin Keuangan' ? 'account_balance' : 'badge';

  // Recent activities tailored per role
  let filteredActivities = [];
  if (userRole === 'Owner') {
    filteredActivities = [
      ...state.kelaran.slice(0, 3).map(k => ({
        type: 'kelaran',
        icon: 'check_circle',
        text: `${getTaylor(k.taylorId)?.nama || 'Taylor'} setor ${k.jumlah} pcs ${getModel(k.modelId)?.nama || 'Model'}`,
        date: k.tanggal,
      })),
      ...state.kasbon.slice(0, 2).map(kb => ({
        type: 'kasbon',
        icon: 'account_balance_wallet',
        text: `Kasbon ${getTaylor(kb.taylorId)?.nama || 'Taylor'}: ${formatRupiah(kb.nominal)}`,
        date: kb.tanggal,
      })),
      ...state.costHarian.slice(0, 2).map(c => ({
        type: 'cost',
        icon: 'payments',
        text: `${c.deskripsi}: ${formatRupiah(c.nominal)}`,
        date: c.tanggal,
      })),
    ];
  } else if (userRole === 'Admin Keuangan') {
    filteredActivities = [
      ...state.kasbon.slice(0, 3).map(kb => ({
        type: 'kasbon',
        icon: 'account_balance_wallet',
        text: `Kasbon ${getTaylor(kb.taylorId)?.nama || 'Taylor'}: ${formatRupiah(kb.nominal)}`,
        date: kb.tanggal,
      })),
      ...state.costHarian.slice(0, 3).map(c => ({
        type: 'cost',
        icon: 'payments',
        text: `${c.deskripsi}: ${formatRupiah(c.nominal)}`,
        date: c.tanggal,
      })),
      ...state.invoices.slice(0, 3).map(inv => {
        const customer = state.customers.find(c => c.id === inv.customerId);
        return {
          type: 'invoice',
          icon: 'description',
          text: `Invoice ${inv.invoiceNumber} (${customer?.nama || 'Pelanggan'}): ${formatRupiah(inv.total)} - ${inv.status}`,
          date: inv.tanggal,
        };
      }),
    ];
  } else if (userRole === 'Staff Administrasi') {
    filteredActivities = [
      ...state.kelaran.slice(0, 3).map(k => ({
        type: 'kelaran',
        icon: 'check_circle',
        text: `${getTaylor(k.taylorId)?.nama || 'Taylor'} setor ${k.jumlah} pcs ${getModel(k.modelId)?.nama || 'Model'}`,
        date: k.tanggal,
      })),
      ...state.barangMasuk.slice(0, 3).map(bm => ({
        type: 'barangMasuk',
        icon: 'inventory_2',
        text: `Masuk ${bm.jumlah} pcs ${getModel(bm.modelId)?.nama || 'Model'} - ${bm.catatan || 'Tanpa Catatan'}`,
        date: bm.tanggal,
      })),
    ];
  }

  const recentActivities = filteredActivities
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  const today = new Date();
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  // Hero metric cards data
  const heroMetrics = [
    {
      label: 'Total Order Aktif',
      value: activeOrders,
      icon: 'shopping_bag',
      color: 'purple',
    },
    {
      label: 'Produksi Berjalan',
      value: activeProduction,
      icon: 'precision_manufacturing',
      color: 'cyan',
    },
    {
      label: 'Pendapatan Bulan Ini',
      value: formatRupiah(monthlyRevenue),
      icon: 'trending_up',
      color: 'emerald',
    },
    {
      label: 'Kelaran Hari Ini',
      value: `${totalKelaranPcs} pcs`,
      icon: 'check_circle',
      color: 'amber',
    },
  ];

  const metricColorMap = {
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/10',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-500/10',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/10',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/10',
    },
  };

  const quickActionColorMap = {
    purple: 'text-purple-400 group-hover:text-purple-300',
    cyan: 'text-cyan-400 group-hover:text-cyan-300',
    emerald: 'text-emerald-400 group-hover:text-emerald-300',
    amber: 'text-amber-400 group-hover:text-amber-300',
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-white">
      {/* ══════════ HERO SECTION ══════════ */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2b0d6d] via-[#100b33] to-[#04334a] border border-white/10 shadow-2xl">
        {/* Animated decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating circles */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-purple-500/[0.07] blur-2xl animate-float" />
          <div className="absolute top-1/2 -right-8 w-36 h-36 rounded-full bg-cyan-500/[0.07] blur-2xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-10 left-1/3 w-28 h-28 rounded-full bg-emerald-500/[0.05] blur-2xl animate-float" style={{ animationDelay: '4s' }} />
          {/* Subtle glow orbs */}
          <div className="absolute top-6 right-1/4 w-2 h-2 rounded-full bg-purple-400/40 animate-pulse" />
          <div className="absolute bottom-8 left-1/5 w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-12 w-1 h-1 rounded-full bg-emerald-400/50 animate-pulse" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
            {/* Left side - Greeting & Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Selamat Datang Kembali
              </p>
              <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight leading-tight">
                {businessName}
              </h1>
              <div className="flex items-center flex-wrap gap-2.5 mt-3">
                <Badge variant={roleBadgeVariant} icon={roleBadgeIcon}>
                  {userRole}
                </Badge>
                <Link
                  to="/pricing"
                  className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-1 shrink-0 ${
                    (state.currentUser?.plan || 'FREE') === 'PREMIUM'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : (state.currentUser?.plan || 'FREE') === 'BUSINESS'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}
                >
                  <span className="w-1 h-1 rounded-full bg-current animate-pulse shrink-0" />
                  {state.currentUser?.plan || 'FREE'} PLAN
                </Link>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {dayNames[today.getDay()]} &middot; {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}
                </span>
              </div>

              {/* Hero Quick Actions (Redesigned responsive grid) */}
              {filteredHeroActions.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-6">
                  {filteredHeroActions.map(action => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="group flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white/[0.06] border border-white/15 hover:bg-white/[0.12] hover:border-white/25 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-95"
                    >
                      <span className={`material-symbols-outlined text-[16px] ${quickActionColorMap[action.color]} transition-colors`}>
                        {action.icon}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-slate-100 transition-colors">
                        {action.label}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right side - 2x2 Metric Grid */}
            <div className="grid grid-cols-2 gap-3 lg:w-[360px] shrink-0">
              {heroMetrics.map(metric => {
                const colors = metricColorMap[metric.color];
                return (
                  <div
                    key={metric.label}
                    className={`relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md p-4 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-lg ${colors.glow}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`material-symbols-outlined text-[18px] ${colors.text}`}>
                        {metric.icon}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                        {metric.label}
                      </span>
                    </div>
                    <p className={`text-lg md:text-xl font-black ${colors.text} tracking-tight truncate`}>
                      {metric.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ STAT CARDS - BENTO GRID ══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        {userRole === 'Owner' && (
          <>
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
          </>
        )}

        {userRole === 'Admin Keuangan' && (
          <>
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
            <StatCard
              icon="description"
              label="Invoice Belum Lunas"
              value={formatRupiah(state.invoices.filter(inv => inv.status !== 'Lunas').reduce((s, inv) => s + inv.total, 0))}
              subtitle={`${state.invoices.filter(inv => inv.status !== 'Lunas').length} invoice aktif`}
              variant="primary"
            />
          </>
        )}

        {userRole === 'Staff Administrasi' && (
          <>
            <StatCard
              icon="check_circle"
              label="Kelaran Hari Ini"
              value={`${totalKelaranPcs} pcs`}
              subtitle={todayKelaran.length > 0 ? `${todayKelaran.length} entri hari ini` : 'Belum ada kelaran'}
              variant="primary"
            />
            <StatCard
              icon="inventory_2"
              label="Barang Masuk Hari Ini"
              value={`${state.barangMasuk.filter(bm => bm.tanggal === new Date().toISOString().split('T')[0]).reduce((s, bm) => s + bm.jumlah, 0)} pcs`}
              subtitle={`${state.barangMasuk.filter(bm => bm.tanggal === new Date().toISOString().split('T')[0]).length} pengiriman masuk`}
              variant="tertiary"
            />
            <StatCard
              icon="pending_actions"
              label="Sisa Belum Didistribusi"
              value={`${state.barangMasuk.reduce((s, bm) => s + bm.sisaBelumDistribusi, 0)} pcs`}
              subtitle="Perlu didistribusikan ke taylor"
              variant="warning"
            />
          </>
        )}
      </div>

      {/* ══════════ QUICK ACTIONS ══════════ */}
      <div>
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {userRole === 'Owner' && (
            <>
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
                <span className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 group-hover:text-slate-200 transition-colors">Invoice Taylor</span>
              </Link>
            </>
          )}

          {userRole === 'Admin Keuangan' && (
            <>
              <Link
                to="/kasbon"
                className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 active:scale-95 hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 text-slate-200 group"
              >
                <span className="material-symbols-outlined text-2xl text-amber-400 group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-300">account_balance_wallet</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 group-hover:text-slate-200 transition-colors">Kasbon Taylor</span>
              </Link>
              <Link
                to="/invoice-pelanggan"
                className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 active:scale-95 hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 text-slate-200 group"
              >
                <span className="material-symbols-outlined text-2xl text-purple-400 group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-300">description</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 group-hover:text-slate-200 transition-colors">Invoice Pelanggan</span>
              </Link>
              <Link
                to="/cost-harian"
                className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 active:scale-95 hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 text-slate-200 group"
              >
                <span className="material-symbols-outlined text-2xl text-cyan-400 group-hover:scale-110 group-hover:text-purple-400 transition-all duration-300">payments</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 group-hover:text-slate-200 transition-colors">Cost Harian</span>
              </Link>
              <Link
                to="/laporan"
                className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 active:scale-95 hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 text-slate-200 group"
              >
                <span className="material-symbols-outlined text-2xl text-emerald-400 group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-300">analytics</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 group-hover:text-slate-200 transition-colors">Laporan Keuangan</span>
              </Link>
            </>
          )}

          {userRole === 'Staff Administrasi' && (
            <>
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
                to="/customers"
                className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 active:scale-95 hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 text-slate-200 group"
              >
                <span className="material-symbols-outlined text-2xl text-amber-400 group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-300">groups</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 group-hover:text-slate-200 transition-colors">Pelanggan</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ══════════ RECENT ACTIVITIES ══════════ */}
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
                    : activity.type === 'cost'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    : activity.type === 'invoice'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{activity.text}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{activity.date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ══════════ FAB WITH QUICK MENU ══════════ */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40">
        {userRole !== 'Staff Administrasi' && showQuickMenu && (
          <div className="absolute bottom-16 right-0 bg-slate-900/95 border border-white/[0.08] backdrop-blur-2xl rounded-2xl shadow-2xl p-2.5 min-w-[190px] animate-scale-in text-white shadow-black/80">
            {userRole === 'Owner' && (
              <button
                onClick={() => { setShowBarangMasuk(true); setShowQuickMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-colors text-left text-slate-300 hover:text-white"
              >
                <span className="material-symbols-outlined text-purple-400 text-[20px]">inventory_2</span>
                <span className="text-xs font-semibold tracking-wide">Barang Masuk</span>
              </button>
            )}
            {(userRole === 'Owner' || userRole === 'Admin Keuangan') && (
              <>
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
              </>
            )}
          </div>
        )}
        <button
          onClick={() => {
            if (userRole === 'Staff Administrasi') {
              setShowBarangMasuk(true);
            } else {
              setShowQuickMenu(!showQuickMenu);
            }
          }}
          className={`flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all duration-200 ${showQuickMenu && userRole !== 'Staff Administrasi' ? 'rotate-45' : ''}`}
        >
          <span className="material-symbols-outlined text-[26px]">add</span>
        </button>
      </div>

      {/* ══════════ MODALS ══════════ */}
      <BarangMasukForm isOpen={showBarangMasuk} onClose={() => setShowBarangMasuk(false)} />
      <KasbonForm isOpen={showKasbon} onClose={() => setShowKasbon(false)} />
      <CostForm isOpen={showCost} onClose={() => setShowCost(false)} />
    </div>
  );
}
