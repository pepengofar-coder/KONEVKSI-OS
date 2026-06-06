import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';

export default function AdminSubscriptions() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useHelpers();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, ACTIVE, WARNING, EXPIRED

  const customers = (state.users || []).filter(u => u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN');
  const today = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  // Classify and filter users
  const filteredUsers = customers.filter(user => {
    // Exclude FREE plans from sub list or show them separately? Let's show all paying or previously paying users
    const isPayingUser = user.plan !== 'FREE' || user.planStatus === 'PENDING' || user.planExpiresAt !== null;
    if (!isPayingUser) return false;

    // Search query match
    const matchesSearch = 
      (user.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.businessName || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Status filter match
    const isExpired = user.planStatus === 'EXPIRED' || (user.planExpiresAt && user.planExpiresAt < today);
    const isWarning = user.planStatus === 'ACTIVE' && user.planExpiresAt && (user.planExpiresAt - today) <= sevenDaysMs && user.planExpiresAt > today;
    const isActive = user.planStatus === 'ACTIVE' && (!user.planExpiresAt || (user.planExpiresAt - today) > sevenDaysMs);

    if (filterType === 'ACTIVE') return isActive;
    if (filterType === 'WARNING') return isWarning;
    if (filterType === 'EXPIRED') return isExpired;

    return true;
  });

  const handleExtend = (userId, days) => {
    dispatch({
      type: 'EXTEND_SUBSCRIPTION',
      payload: { userId, days }
    });
    showToast(`Masa aktif berhasil diperpanjang ${days} hari!`, 'success');
  };

  const handleCancelSubscription = (userId) => {
    dispatch({
      type: 'MANUAL_UPDATE_PLAN',
      payload: {
        userId,
        plan: 'FREE',
        planStatus: 'ACTIVE',
        planExpiresAt: null
      }
    });
    showToast(`Paket subskripsi dibatalkan dan dikembalikan ke FREE!`, 'info');
  };

  const handleUpgradeToBusiness = (userId) => {
    dispatch({
      type: 'MANUAL_UPDATE_PLAN',
      payload: {
        userId,
        plan: 'BUSINESS',
        planStatus: 'ACTIVE',
        planExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
      }
    });
    showToast(`Akun berhasil ditingkatkan ke paket BUSINESS!`, 'success');
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Manajemen Lisensi & Subskripsi
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Pantau status siklus hidup langganan tenant, perpanjang masa aktif dengan cepat, atau batalkan paket premium.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/[0.06] p-4 rounded-3xl backdrop-blur-xl">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'Semua Berbayar' },
            { id: 'ACTIVE', label: 'Aktif Aman' },
            { id: 'WARNING', label: 'Hampir Habis (≤ 7 Hari)' },
            { id: 'EXPIRED', label: 'Kedaluwarsa' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === type.id
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari tenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-10"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
        </div>
      </div>

      {/* License List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => {
          const isExpired = user.planStatus === 'EXPIRED' || (user.planExpiresAt && user.planExpiresAt < today);
          const isWarning = user.planStatus === 'ACTIVE' && user.planExpiresAt && (user.planExpiresAt - today) <= sevenDaysMs && user.planExpiresAt > today;
          
          let statusLabel = 'ACTIVE';
          let badgeColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';

          if (isExpired) {
            statusLabel = 'EXPIRED';
            badgeColor = 'bg-rose-500/10 text-rose-300 border-rose-500/20';
          } else if (isWarning) {
            statusLabel = 'WARNING';
            badgeColor = 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20 animate-pulse';
          }

          const timeLeft = user.planExpiresAt ? user.planExpiresAt - today : null;
          const daysLeft = timeLeft !== null ? Math.ceil(timeLeft / (24 * 60 * 60 * 1000)) : null;

          return (
            <div
              key={user.id}
              className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Left detail */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full border ${
                    user.plan === 'PREMIUM'
                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                      : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                  }`}>
                    {user.plan}
                  </span>
                  <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full border uppercase ${badgeColor}`}>
                    {statusLabel}
                  </span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Berakhir: {user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString('id-ID') : 'Selamanya / Free'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100">{user.businessName || user.nama}</h3>
                  <p className="text-xs text-slate-400">
                    Owner: <span className="font-semibold text-slate-200">@{user.username}</span> · Email: <span className="font-semibold text-slate-200">{user.email}</span>
                  </p>
                  
                  {daysLeft !== null && (
                    <p className={`text-xs mt-1.5 font-bold ${
                      isExpired 
                        ? 'text-rose-400' 
                        : isWarning 
                        ? 'text-yellow-400 animate-pulse' 
                        : 'text-slate-400'
                    }`}>
                      {isExpired 
                        ? 'Lisensi telah kedaluwarsa!' 
                        : `Tersisa ${daysLeft} hari masa aktif.`}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/[0.06]">
                <button
                  onClick={() => handleExtend(user.id, 30)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 hover:border-white/20 transition-all"
                >
                  +30 Hari
                </button>
                <button
                  onClick={() => handleExtend(user.id, 365)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 hover:border-white/20 transition-all"
                >
                  +1 Tahun
                </button>
                
                {user.plan !== 'BUSINESS' && (
                  <button
                    onClick={() => handleUpgradeToBusiness(user.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/35 transition-all"
                  >
                    Set Business
                  </button>
                )}

                <button
                  onClick={() => handleCancelSubscription(user.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/20 hover:bg-rose-500/25 transition-all"
                >
                  Batal / Free
                </button>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-12 text-center text-slate-500 italic text-sm">
            Tidak ada subskripsi berbayar yang cocok dengan kriteria.
          </div>
        )}
      </div>
    </div>
  );
}
