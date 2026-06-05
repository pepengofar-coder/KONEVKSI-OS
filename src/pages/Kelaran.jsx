import { useState } from 'react';
import { useAppState, useHelpers } from '../context/AppContext';
import KelaranForm from '../components/forms/KelaranForm';
import FAB from '../components/ui/FAB';
import EmptyState from '../components/ui/EmptyState';

export default function Kelaran() {
  const { kelaran } = useAppState();
  const { getModel, getTaylor, formatRupiah } = useHelpers();
  const [showForm, setShowForm] = useState(false);

  // Group by date
  const grouped = {};
  kelaran.forEach((k) => {
    if (!grouped[k.tanggal]) grouped[k.tanggal] = [];
    grouped[k.tanggal].push(k);
  });
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Kelaran</h1>
        <p className="text-sm text-on-surface-variant font-medium mt-1">
          Barang jadi yang sudah disetor taylor
        </p>
      </div>

      {/* Summary */}
      <div className="bg-tertiary-container rounded-3xl p-5 md:p-6 text-on-tertiary-container relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">Total Kelaran</p>
          <h2 className="text-3xl font-black mt-1">{kelaran.reduce((s, k) => s + k.jumlah, 0)} pcs</h2>
          <p className="text-xs mt-1 opacity-80">{kelaran.length} entri tercatat</p>
        </div>
        <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-7xl opacity-[0.08]">
          check_circle
        </span>
      </div>

      {dates.length === 0 ? (
        <EmptyState
          icon="check_circle"
          title="Belum Ada Kelaran"
          description="Catat hasil jahitan taylor yang sudah selesai"
        />
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <div key={date}>
              <p className="text-[10px] font-bold text-outline uppercase tracking-[0.15em] mb-2 px-1">{date}</p>
              <div className="space-y-2">
                {grouped[date].map((k) => {
                  const model = getModel(k.modelId);
                  const taylor = getTaylor(k.taylorId);
                  return (
                    <div
                      key={k.id}
                      className="bg-surface-container-lowest p-4 rounded-2xl flex items-center justify-between hover:shadow-md hover:shadow-primary/5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/20 flex items-center justify-center text-tertiary shrink-0">
                          <span className="material-symbols-outlined text-[18px] filled">check_circle</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface text-sm">{model?.nama}</h4>
                          <p className="text-xs text-outline">{taylor?.nama}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary">{k.jumlah} pcs</p>
                        <p className="text-[10px] text-outline">{formatRupiah((model?.hargaJahit || 0) * k.jumlah)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <FAB onClick={() => setShowForm(true)} icon="check_circle" label="Catat Kelaran" />
      <KelaranForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
