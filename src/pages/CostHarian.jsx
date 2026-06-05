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
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Cost Harian</h1>
        <p className="text-sm text-on-surface-variant font-medium mt-1">
          Pengeluaran operasional sehari-hari
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-primary-container p-5 rounded-3xl text-on-primary-container relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">Hari Ini</p>
            <h2 className="text-xl md:text-2xl font-black mt-1">{formatRupiah(totalToday)}</h2>
            <p className="text-[10px] mt-1 opacity-80">{todayCost.length} pengeluaran</p>
          </div>
          <span className="material-symbols-outlined absolute -right-1 -bottom-1 text-5xl opacity-[0.08]">today</span>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-3xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-outline">Total Semua</p>
            <h2 className="text-xl md:text-2xl font-black text-on-surface mt-1">{formatRupiah(totalAll)}</h2>
            <p className="text-[10px] mt-1 text-outline">{costHarian.length} entri</p>
          </div>
          <span className="material-symbols-outlined absolute -right-1 -bottom-1 text-5xl opacity-[0.06]">payments</span>
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
              <div key={date}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-outline uppercase tracking-[0.15em]">{date}</p>
                    {isToday && (
                      <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed text-[8px] font-bold uppercase tracking-widest rounded-full">
                        Hari Ini
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-primary">{formatRupiah(dayTotal)}</p>
                </div>
                <div className="space-y-2">
                  {items.map((c) => (
                    <div
                      key={c.id}
                      className="bg-surface-container-lowest p-4 rounded-2xl flex items-center justify-between hover:shadow-md hover:shadow-primary/5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
                          <span className="material-symbols-outlined text-[16px]">receipt</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-on-surface">{c.deskripsi}</p>
                          <p className="text-[10px] text-outline">{c.tanggal}</p>
                        </div>
                      </div>
                      <p className="font-bold text-on-surface text-sm">{formatRupiah(c.nominal)}</p>
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
