import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch, useHelpers, usePlan } from '../context/AppContext';
import { ROLE_ROUTES } from '../components/layout/AppLayout';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import BarangMasukForm from '../components/forms/BarangMasukForm';
import KasbonForm from '../components/forms/KasbonForm';
import CostForm from '../components/forms/CostForm';
import PrayerCalendarWidget from '../components/ui/PrayerCalendarWidget';

export default function Dashboard() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { plan } = usePlan();
  const { getTodayKelaran, getTodayCost, getAllKasbonBelumLunas, formatRupiah, getModel, getTaylor, getSisaDistribusi } = useHelpers();

  const [nowMs] = useState(() => Date.now());
  const [showBarangMasuk, setShowBarangMasuk] = useState(false);
  const [showKasbon, setShowKasbon] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const todayKelaran = getTodayKelaran();
  const todayCost = getTodayCost();
  const kasbonBelumLunas = getAllKasbonBelumLunas();

  const totalKelaranPcs = todayKelaran.reduce((s, k) => s + k.jumlah, 0);

  const userRole = state.currentUser?.businessRole || 'Owner';
  const businessName = state.currentUser?.businessProfile?.namaUsaha || 'Konveksi Anda';

  // Secure session logout handler
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

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
    { label: 'Buat Invoice', icon: 'receipt_long', to: '/invoice-taylor', color: 'cyan' },
    { label: 'Tambah Pelanggan', icon: 'person_add', to: '/pelanggan', color: 'emerald' },
    { label: 'Tracking Produksi', icon: 'sync', to: '/on-progress', color: 'amber' },
  ];

  const allowedRoutes = ROLE_ROUTES[userRole] || [];
  const filteredHeroActions = heroQuickActions.filter(action => allowedRoutes.includes(action.to));

  // Role badge variant mapping
  const roleBadgeVariant = userRole === 'Owner' ? 'primary' : userRole === 'Admin Keuangan' ? 'secondary' : 'success';
  const roleBadgeIcon = userRole === 'Owner' ? 'shield' : userRole === 'Admin Keuangan' ? 'account_balance' : 'badge';

  // --- 1. Order Volume Chart Data Aggregation ---
  const [orderChartTab, setOrderChartTab] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  
  const getOrderChartData = () => {
    const todayMs = nowMs;
    if (orderChartTab === 'daily') {
      const labels = [];
      const values = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(todayMs - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
        labels.push(label);
        
        const total = state.barangMasuk
          .filter(bm => bm.tanggal === dateStr)
          .reduce((sum, bm) => sum + bm.jumlah, 0);
        values.push(total);
      }
      return { labels, values };
    } else if (orderChartTab === 'weekly') {
      const labels = ['M-4', 'M-3', 'M-2', 'M-1'];
      const values = [0, 0, 0, 0];
      state.barangMasuk.forEach(bm => {
        const bmDate = new Date(bm.tanggal);
        const diffDays = Math.floor((todayMs - bmDate.getTime()) / (24 * 60 * 60 * 1000));
        if (diffDays >= 0 && diffDays < 28) {
          const weekIdx = 3 - Math.floor(diffDays / 7);
          if (weekIdx >= 0 && weekIdx < 4) {
            values[weekIdx] += bm.jumlah;
          }
        }
      });
      return { labels, values };
    } else {
      const labels = [];
      const values = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const mLabel = d.toLocaleDateString('id-ID', { month: 'short' });
        labels.push(mLabel);
        
        const total = state.barangMasuk
          .filter(bm => {
            const bmDate = new Date(bm.tanggal);
            return bmDate.getMonth() === d.getMonth() && bmDate.getFullYear() === d.getFullYear();
          })
          .reduce((sum, bm) => sum + bm.jumlah, 0);
        values.push(total);
      }
      return { labels, values };
    }
  };

  const chartData = getOrderChartData();
  const maxVal = Math.max(...chartData.values, 10);
  const chartHeight = 110;
  const chartWidth = 500;
  
  const points = chartData.values.map((v, idx) => {
    const x = idx * (chartWidth / (chartData.values.length - 1 || 1));
    const y = chartHeight - 10 - (v / maxVal) * (chartHeight - 30);
    return { x, y, value: v };
  });
  
  const lineD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';
    
  const areaD = points.length > 0
    ? `${lineD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : '';

  // --- 2. Cost vs Revenue Chart Aggregation ---
  const getFinancialChartData = () => {
    const labels = [];
    const revenueValues = [];
    const costValues = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = d.toLocaleDateString('id-ID', { month: 'short' });
      labels.push(mLabel);
      
      const m = d.getMonth();
      const y = d.getFullYear();
      
      // Revenue
      const revenue = state.invoices
        .filter(inv => {
          const invDate = new Date(inv.tanggal);
          return invDate.getMonth() === m && invDate.getFullYear() === y;
        })
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
      revenueValues.push(revenue);
      
      // Cost
      const costHarianTotal = state.costHarian
        .filter(c => {
          const cDate = new Date(c.tanggal);
          return cDate.getMonth() === m && cDate.getFullYear() === y;
        })
        .reduce((sum, c) => sum + c.nominal, 0);
        
      const wagesTotal = state.kelaran
        .filter(k => {
          const kDate = new Date(k.tanggal);
          return kDate.getMonth() === m && kDate.getFullYear() === y;
        })
        .reduce((sum, k) => {
          const model = getModel(k.modelId);
          const price = model?.hargaJahit || 0;
          return sum + (k.jumlah * price);
        }, 0);
        
      costValues.push(costHarianTotal + wagesTotal);
    }
    return { labels, revenueValues, costValues };
  };

  const finData = getFinancialChartData();
  const maxFinVal = Math.max(...finData.revenueValues, ...finData.costValues, 1000000);

  // --- 3. Production Progress KPIs ---
  const totalPendingPcs = state.barangMasuk.reduce((sum, bm) => sum + bm.sisaBelumDistribusi, 0);
  const totalInProgressPcs = state.distribusi.reduce((sum, d) => sum + getSisaDistribusi(d), 0);
  const totalCompletedPcsAllTime = state.kelaran.reduce((sum, k) => sum + k.jumlah, 0);
  
  // Delayed calculation (due date has passed and remaining pcs > 0)
  const todayStr = new Date().toISOString().split('T')[0];
  const totalDelayedOrders = state.barangMasuk.filter(bm => {
    const isUndelivered = bm.sisaBelumDistribusi > 0;
    const deadline = bm.deadline || new Date(new Date(bm.tanggal).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const isOverdue = deadline < todayStr;
    return isUndelivered && isOverdue;
  }).length;

  // --- 4. Alerts (Low Stock & Deadline Reminders) ---
  const lowStockMaterials = (state.bahanBaku || []).filter(bb => bb.stok <= bb.minimalStok);
  const deadlineApproachingOrders = state.barangMasuk
    .filter(bm => {
      if (bm.sisaBelumDistribusi === 0) return false;
      const deadline = bm.deadline || new Date(new Date(bm.tanggal).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const diffTime = new Date(deadline).getTime() - nowMs;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3; // within 3 days
    })
    .map(bm => {
      const model = getModel(bm.modelId);
      const deadline = bm.deadline || new Date(new Date(bm.tanggal).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return { ...bm, modelName: model?.nama || 'Pakaian', deadline };
    });

  // --- 5. Production Optimization Queue Scheduler ---
  const getScheduledQueue = () => {
    const activeOrdersQueue = state.barangMasuk
      .filter(bm => bm.sisaBelumDistribusi > 0)
      .map(bm => {
        const priority = bm.priority || 'Sedang';
        const deadline = bm.deadline || new Date(new Date(bm.tanggal).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const model = getModel(bm.modelId);
        return {
          ...bm,
          modelName: model?.nama || 'Pakaian',
          priority,
          deadline,
          priorityWeight: priority === 'Tinggi' ? 3 : priority === 'Sedang' ? 2 : 1
        };
      })
      // Sort by priority weight descending, then deadline ascending
      .sort((a, b) => b.priorityWeight - a.priorityWeight || a.deadline.localeCompare(b.deadline));

    // Calculate Estimated Completion Date based on capacity (15 pcs/day per tailor)
    const tailorsCount = state.taylors.length || 3;
    const capacityPerDay = tailorsCount * 15; // standard daily shop speed
    
    let daysAccumulated = 0;
    return activeOrdersQueue.map(order => {
      const neededDays = order.sisaBelumDistribusi / capacityPerDay;
      daysAccumulated += neededDays;
      const completionDate = new Date();
      completionDate.setDate(completionDate.getDate() + Math.ceil(daysAccumulated));
      return {
        ...order,
        estCompletion: completionDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      };
    });
  };

  const scheduledQueue = getScheduledQueue();

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
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-purple-500/[0.07] blur-2xl animate-float" />
          <div className="absolute top-1/2 -right-8 w-36 h-36 rounded-full bg-cyan-500/[0.07] blur-2xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-10 left-1/3 w-28 h-28 rounded-full bg-emerald-500/[0.05] blur-2xl animate-float" style={{ animationDelay: '4s' }} />
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
              <div className="flex items-center flex-wrap gap-2.5 mt-3 w-full">
                <Badge variant={roleBadgeVariant} icon={roleBadgeIcon}>
                  {userRole}
                </Badge>
                <Link
                  to="/pricing"
                  className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-1 shrink-0 ${
                    plan === 'PREMIUM'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : plan === 'BUSINESS'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}
                >
                  <span className="w-1 h-1 rounded-full bg-current animate-pulse shrink-0" />
                  {plan} PLAN
                </Link>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {dayNames[today.getDay()]} &middot; {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}
                </span>
                
                {/* Secure Logout button inside Greeting panel */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-105 active:scale-95 transition-all text-[10px] font-bold text-red-400 cursor-pointer ml-auto"
                >
                  <span className="material-symbols-outlined text-[14px]">logout</span>
                  KELUAR
                </button>
              </div>

              {/* Hero Quick Actions */}
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

      {/* ══════════ PRAYER & CALENDAR WIDGET ══════════ */}
      <PrayerCalendarWidget />

      {/* ══════════ ALERTS PANEL (LOW STOCK & DEADLINES) ══════════ */}
      {(lowStockMaterials.length > 0 || deadlineApproachingOrders.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Low Stock Alerts */}
          {lowStockMaterials.length > 0 && (
            <div className="bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <span className="absolute top-0 right-0 w-36 h-36 bg-red-500/[0.02] rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-red-400 text-[20px] animate-pulse">warning</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-red-300">Peringatan Stok Bahan Baku Rendah</h3>
              </div>
              <div className="space-y-2">
                {lowStockMaterials.map(bb => (
                  <div key={bb.id} className="flex justify-between items-center text-xs bg-red-500/[0.04] border border-red-500/10 p-2.5 rounded-xl">
                    <span className="font-semibold text-slate-300">{bb.nama}</span>
                    <span className="font-black text-red-400">{bb.stok} / {bb.minimalStok} {bb.satuan}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Deadline Reminders */}
          {deadlineApproachingOrders.length > 0 && (
            <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <span className="absolute top-0 right-0 w-36 h-36 bg-amber-500/[0.02] rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-amber-400 text-[20px] animate-pulse">notification_important</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">Pengingat Batas Tenggat Waktu</h3>
              </div>
              <div className="space-y-2">
                {deadlineApproachingOrders.map(ord => (
                  <div key={ord.id} className="flex justify-between items-center text-xs bg-amber-500/[0.04] border border-amber-500/10 p-2.5 rounded-xl">
                    <span className="font-semibold text-slate-300 truncate max-w-[240px]">{ord.modelName} ({ord.sisaBelumDistribusi} Pcs sisa)</span>
                    <span className="font-black text-amber-400 shrink-0">Batas: {ord.deadline}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════ STAT CARDS - BENTO GRID & PRODUCTION KPIs ══════════ */}
      <div className="space-y-3">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">
          Indikator Kinerja Utama (KPI) Produksi
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon="pending_actions"
            label="Menunggu Antrean (Pending)"
            value={`${totalPendingPcs} pcs`}
            subtitle="Belum didistribusikan"
            variant="default"
          />
          <StatCard
            icon="sync"
            label="Sedang Dijahit (In Progress)"
            value={`${totalInProgressPcs} pcs`}
            subtitle="Sedang dikerjakan tailor"
            variant="primary"
          />
          <StatCard
            icon="check_circle"
            label="Total Kelaran (Completed)"
            value={`${totalCompletedPcsAllTime} pcs`}
            subtitle="Total semua hasil jahitan"
            variant="secondary"
          />
          <StatCard
            icon="error_outline"
            label="Terlambat (Delayed)"
            value={`${totalDelayedOrders} order`}
            subtitle="Melewati batas tenggat"
            variant="warning"
          />
        </div>
      </div>

      {/* ══════════ CHARTS SECTION (BENTO GRID) ══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SVG Area Chart: Order Volume */}
        <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Volume Order Masuk</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Jumlah pakaian yang masuk untuk diproduksi</p>
            </div>
            
            {/* Toggles */}
            <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/[0.06] gap-1 shrink-0">
              {['daily', 'weekly', 'monthly'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setOrderChartTab(tab)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    orderChartTab === tab 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 shadow-lg' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab === 'daily' ? 'Harian' : tab === 'weekly' ? 'Mingguan' : 'Bulanan'}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line/Area Chart */}
          <div className="w-full relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              {[0, 1, 2, 3].map(i => {
                const y = 10 + i * (chartHeight - 30) / 3;
                return (
                  <line key={i} x1="0" y1={y} x2={chartWidth} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
                );
              })}
              {/* Area */}
              {areaD && <path d={areaD} fill="url(#areaGrad)" />}
              {/* Line */}
              {lineD && <path d={lineD} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />}
              {/* Dots and Tooltips */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="4" fill="#06b6d4" stroke="#0f172a" strokeWidth="2" />
                  <text x={p.x} y={p.y - 8} fill="#22d3ee" fontSize="8" fontWeight="bold" textAnchor="middle">
                    {p.value > 0 ? `${p.value} pcs` : ''}
                  </text>
                </g>
              ))}
            </svg>
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest pt-2">
              {chartData.labels.map((lbl, idx) => (
                <span key={idx} className="text-center w-full truncate">{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Bar Chart: Cost vs Revenue */}
        <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Perbandingan Finansial</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Pendapatan vs Pengeluaran (Bahan & Ongkos Taylor)</p>
          </div>

          <div className="flex gap-4 text-[9px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-400 block" />
              <span className="text-cyan-300">Pendapatan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-purple-500 block" />
              <span className="text-purple-400">Total Pengeluaran</span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="w-full relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
              {/* Grid Lines */}
              {[0, 1, 2, 3].map(i => {
                const y = 10 + i * (chartHeight - 30) / 3;
                return (
                  <line key={i} x1="0" y1={y} x2={chartWidth} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
                );
              })}
              {/* Bars */}
              {finData.revenueValues.map((rev, idx) => {
                const cost = finData.costValues[idx];
                const xBase = idx * (chartWidth / 6);
                
                const revHeight = (rev / maxFinVal) * (chartHeight - 30);
                const revY = chartHeight - 10 - revHeight;
                const costHeight = (cost / maxFinVal) * (chartHeight - 30);
                const costY = chartHeight - 10 - costHeight;

                return (
                  <g key={idx}>
                    {/* Revenue Bar */}
                    <rect
                      x={xBase + 20}
                      y={revY}
                      width="16"
                      height={Math.max(revHeight, 2)}
                      rx="4"
                      fill="#06b6d4"
                      className="transition-all hover:opacity-80"
                    />
                    {/* Cost Bar */}
                    <rect
                      x={xBase + 40}
                      y={costY}
                      width="16"
                      height={Math.max(costHeight, 2)}
                      rx="4"
                      fill="#a855f7"
                      className="transition-all hover:opacity-80"
                    />
                    {/* Mini values labels on hover */}
                    {rev > 0 && (
                      <text x={xBase + 28} y={revY - 4} fill="#22d3ee" fontSize="7" fontWeight="bold" textAnchor="middle">
                        {(rev / 1000).toFixed(0)}k
                      </text>
                    )}
                    {cost > 0 && (
                      <text x={xBase + 48} y={costY - 4} fill="#c084fc" fontSize="7" fontWeight="bold" textAnchor="middle">
                        {(cost / 1000).toFixed(0)}k
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest pt-2">
              {finData.labels.map((lbl, idx) => (
                <span key={idx} className="text-center w-full truncate">{lbl}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ OPTIMIZED PRODUCTION QUEUE SCHEDULER ══════════ */}
      <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Optimalisasi & Penjadwalan Produksi Otomatis</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Urutan antrean pengerjaan berdasarkan prioritas, tenggat waktu, dan estimasi waktu penyelesaian (Kapasitas: 15 pcs/hari per Taylor).
          </p>
        </div>

        {scheduledQueue.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 italic">Tidak ada order aktif dalam antrean produksi</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-500 font-bold">
                  <th className="py-2.5">Nama Model</th>
                  <th className="py-2.5 text-center">Sisa Order</th>
                  <th className="py-2.5 text-center">Prioritas</th>
                  <th className="py-2.5 text-center">Tenggat Waktu</th>
                  <th className="py-2.5 text-right">Estimasi Selesai</th>
                </tr>
              </thead>
              <tbody>
                {scheduledQueue.map((item, index) => (
                  <tr key={item.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-semibold text-slate-200 flex items-center gap-2">
                      <span className="text-slate-500 font-bold">#{index + 1}</span>
                      {item.modelName}
                    </td>
                    <td className="py-3 text-center text-slate-300 font-bold">{item.sisaBelumDistribusi} pcs</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        item.priority === 'Tinggi' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        item.priority === 'Sedang' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-3 text-center text-slate-400">{item.deadline}</td>
                    <td className="py-3 text-right text-cyan-400 font-black">{item.estCompletion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-colors text-left text-slate-300 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-purple-400 text-[20px]">inventory_2</span>
                <span className="text-xs font-semibold tracking-wide">Barang Masuk</span>
              </button>
            )}
            {(userRole === 'Owner' || userRole === 'Admin Keuangan') && (
              <>
                <button
                  onClick={() => { setShowKasbon(true); setShowQuickMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-colors text-left text-slate-300 hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-amber-400 text-[20px]">account_balance_wallet</span>
                  <span className="text-xs font-semibold tracking-wide">Kasbon</span>
                </button>
                <button
                  onClick={() => { setShowCost(true); setShowQuickMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-colors text-left text-slate-300 hover:text-white cursor-pointer"
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
          className={`flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer ${showQuickMenu && userRole !== 'Staff Administrasi' ? 'rotate-45' : ''}`}
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
