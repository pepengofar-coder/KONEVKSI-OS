import { useNavigate } from 'react-router-dom';
import { useAppState, useHelpers } from '../../context/AppContext';

export default function SuperAdminDashboard() {
  const state = useAppState();
  const navigate = useNavigate();
  const { formatRupiah } = useHelpers();

  // Filter users to exclude SUPER_ADMIN and ADMIN
  const customers = (state.users || []).filter(u => u.role !== 'SUPER_ADMIN' && u.role !== 'ADMIN');
  const totalUsers = customers.length;
  
  const premiumCount = customers.filter(u => u.plan === 'PREMIUM' && u.planStatus === 'ACTIVE').length;
  const businessCount = customers.filter(u => u.plan === 'BUSINESS' && u.planStatus === 'ACTIVE').length;
  const freeCount = customers.filter(u => u.plan === 'FREE' || u.planStatus === 'EXPIRED').length;
  
  const pendingPayments = (state.paymentOrders || []).filter(o => o.status === 'PENDING');
  const pendingCount = pendingPayments.length;

  // Calculate MRR (Premium = Rp 99k/month, Business = Rp 199k/month)
  const mrr = (premiumCount * 99000) + (businessCount * 199000);

  // Recent 5 payment orders
  const recentPayments = (state.paymentOrders || []).slice(0, 5);

  // Recent 5 user signups
  const recentUsers = [...customers].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5);

  // Upcoming expirations (active and expiring within 7 days)
  const today = Date.now();
  const sevenDaysLater = today + 7 * 24 * 60 * 60 * 1000;
  const expiringUsers = customers.filter(u => 
    u.plan !== 'FREE' && 
    u.planStatus === 'ACTIVE' && 
    u.planExpiresAt && 
    u.planExpiresAt > today && 
    u.planExpiresAt <= sevenDaysLater
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Dashboard Super Admin
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Statistik global, metrik bisnis SaaS, dan manajemen portal Konveksi OS.
        </p>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-5 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-3 text-cyan-400 opacity-20">
            <span className="material-symbols-outlined text-[40px]">group</span>
          </div>
          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total Pengguna</span>
          <span className="block text-2xl font-black text-slate-100 mt-2 font-display">{totalUsers}</span>
          <span className="block text-[10px] text-slate-400 mt-1">Akun Terdaftar</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-5 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-3 text-purple-400 opacity-20">
            <span className="material-symbols-outlined text-[40px]">workspace_premium</span>
          </div>
          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Premium / Business</span>
          <span className="block text-2xl font-black text-slate-100 mt-2 font-display">
            {premiumCount} / {businessCount}
          </span>
          <span className="block text-[10px] text-cyan-400 mt-1 font-bold">Total Berlangganan</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-5 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-3 text-yellow-400 opacity-20">
            <span className="material-symbols-outlined text-[40px]">person_outline</span>
          </div>
          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Free / Expired</span>
          <span className="block text-2xl font-black text-slate-100 mt-2 font-display">{freeCount}</span>
          <span className="block text-[10px] text-slate-400 mt-1">Free Tier</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-5 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-3 text-rose-400 opacity-20">
            <span className="material-symbols-outlined text-[40px]">hourglass_empty</span>
          </div>
          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Pending ACC</span>
          <span className="block text-2xl font-black text-slate-100 mt-2 font-display">{pendingCount}</span>
          <span className="block text-[10px] text-rose-300 font-bold mt-1 animate-pulse">Butuh Verifikasi</span>
        </div>

        {/* Metric 5 */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-5 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-3 text-emerald-400 opacity-20">
            <span className="material-symbols-outlined text-[40px]">payments</span>
          </div>
          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Estimasi MRR</span>
          <span className="block text-lg font-black text-emerald-400 mt-2 font-display">{formatRupiah(mrr)}</span>
          <span className="block text-[10px] text-slate-400 mt-1">Pendapatan Bulanan</span>
        </div>
      </div>

      {/* Main Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left column: Pending Verification */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-400 text-lg">hourglass_empty</span>
              Verifikasi Pembayaran Manual ({pendingCount})
            </h3>
            <button
              onClick={() => navigate('/super-admin/payments')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
            >
              Lihat Semua
            </button>
          </div>

          <div className="divide-y divide-white/[0.06] space-y-3">
            {pendingPayments.map((order, idx) => (
              <div key={order.id || idx} className="flex items-center justify-between pt-3 first:pt-0">
                <div>
                  <p className="text-xs font-bold text-slate-200">{order.businessName || order.username}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Tier: <span className="text-purple-400 font-semibold">{order.plan}</span> · {formatRupiah(order.price)}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/super-admin/payments')}
                  className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-[10px] font-bold hover:bg-rose-500/30 transition-all"
                >
                  Verifikasi
                </button>
              </div>
            ))}
            {pendingCount === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs italic">
                Tidak ada pembayaran pending yang perlu diverifikasi.
              </div>
            )}
          </div>
        </div>

        {/* Right column: Recent Signups */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-lg">person_add</span>
              Registrasi Tenant Terbaru
            </h3>
            <button
              onClick={() => navigate('/super-admin/users')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
            >
              Lihat Semua
            </button>
          </div>

          <div className="divide-y divide-white/[0.06] space-y-3">
            {recentUsers.map((user, idx) => {
              const userPayments = (state.paymentOrders || []).filter(po => po.userId === user.id);
              const totalPaid = userPayments.filter(po => po.status === 'APPROVED').reduce((sum, po) => sum + (po.price || 0), 0);
              const paymentCount = userPayments.length;

              return (
                <div key={user.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 first:pt-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold text-slate-200">{user.nama || user.name}</p>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${
                        user.plan === 'FREE'
                          ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          : user.plan === 'PREMIUM'
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                      }`}>
                        {user.plan} ({user.planStatus || 'ACTIVE'})
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      @{user.username} · {user.email}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      Terdaftar: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'} · Usaha: {user.businessName || 'Belum Atur Usaha'}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-[10px] font-bold text-slate-300">{paymentCount}x Transaksi</p>
                    <p className="text-[10px] text-emerald-400 font-extrabold">{formatRupiah(totalPaid)}</p>
                  </div>
                </div>
              );
            })}
            {recentUsers.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs italic">
                Belum ada pengguna terdaftar.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Expirations Alert */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-400 text-lg">warning</span>
          Berlangganan Segera Berakhir (7 Hari ke Depan)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expiringUsers.map((user, idx) => {
            const daysLeft = Math.ceil((user.planExpiresAt - today) / (24 * 60 * 60 * 1000));
            return (
              <div key={user.id || idx} className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">{user.businessName || user.nama}</p>
                  <p className="text-[10px] text-amber-400 font-medium mt-0.5">
                    Expiring in {daysLeft} days ({new Date(user.planExpiresAt).toLocaleDateString('id-ID')})
                  </p>
                </div>
                <button
                  onClick={() => navigate('/super-admin/subscriptions')}
                  className="px-3 py-1.5 bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 rounded-xl text-[10px] font-bold hover:bg-yellow-500/20 transition-all"
                >
                  Kelola
                </button>
              </div>
            );
          })}
          {expiringUsers.length === 0 && (
            <div className="col-span-full text-center py-6 text-slate-500 text-xs italic">
              Tidak ada langganan yang akan segera berakhir.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
