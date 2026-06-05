import { useState } from 'react';
import { useAppState, useHelpers } from '../context/AppContext';
import CostForm from '../components/forms/CostForm';
import FAB from '../components/ui/FAB';
import EmptyState from '../components/ui/EmptyState';

export default function CostHarian() {
  const { costHarian } = useAppState();
  const { formatRupiah, getTodayCost, getTodayString } = useHelpers();
  const [showForm, setShowForm] = useState(false);

  const todayCost = getTodayCost();
  const totalToday = todayCost.reduce((s, c) => s + c.nominal, 0);
  const totalAll = costHarian.reduce((s, c) => s + c.nominal, 0);

  // Group by date
  const grouped = {};
  costHarian.forEach((c) => {
    if (!grouped[c.tanggal]) grouped[c.tanggal] = [];
    grouped[c.tanggal].push(c);
  });
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 animate-fade-in-up text-white">
      <div>
        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">Cost Harian</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
          Pengeluaran operasional sehari-hari
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-purple-500/20 hover:border-purple-500/40 rounded-3xl p-5 relative overflow-hidden group transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/15 to-purple-500/0 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Hari Ini</p>
            <h2 className="text-lg md:text-xl font-black text-purple-400 mt-1">{formatRupiah(totalToday)}</h2>
            <p className="text-[10px] mt-1.5 text-slate-400 font-semibold">{todayCost.length} pengeluaran</p>
          </div>
          <span className="material-symbols-outlined absolute -right-1 -bottom-1 text-5xl opacity-[0.04] text-purple-400 transition-transform duration-500 group-hover:scale-110">today</span>
        </div>
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-cyan-500/20 hover:border-cyan-500/40 rounded-3xl p-5 relative overflow-hidden group transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/15 to-cyan-500/0 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Total Semua</p>
            <h2 className="text-lg md:text-xl font-black text-cyan-400 mt-1">{formatRupiah(totalAll)}</h2>
            <p className="text-[10px] mt-1.5 text-slate-400 font-semibold">{costHarian.length} entri</p>
          </div>
          <span className="material-symbols-outlined absolute -right-1 -bottom-1 text-5xl opacity-[0.04] text-cyan-400 transition-transform duration-500 group-hover:scale-110">payments</span>
        </div>
      </div>

      {dates.length === 0 ? (
        <EmptyState
          icon="payments"
          title="Belum Ada Pengeluaran"
          description="Catat pengeluaran operasional seperti beli benang, jarum, dll"
        />
      ) : (
        <div className="space-y-6">
          {dates.map((date) => {
            const items = grouped[date];
            const dayTotal = items.reduce((s, c) => s + c.nominal, 0);
            const isToday = date === getTodayString();
            return (
              <div key={date} className="space-y-2">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-3">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{date}</p>
                    {isToday && (
                      <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[8px] font-black uppercase tracking-widest rounded-full">
                        Hari Ini
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-black text-purple-400">{formatRupiah(dayTotal)}</p>
                </div>
                <div className="space-y-2">
                  {items.map((c) => (
                    <div
                      key={c.id}
                      className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-white/[0.15] p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.06] hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[16px]">receipt</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-200">{c.deskripsi}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{c.tanggal}</p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-200 text-sm">{formatRupiah(c.nominal)}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FAB onClick={() => setShowForm(true)} icon="add" label="Tambah Cost" />
      <CostForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
