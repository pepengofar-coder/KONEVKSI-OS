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
    <div className="space-y-6 animate-fade-in-up text-white">
      <div>
        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">Kelaran</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
          Barang jadi yang sudah disetor taylor
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-3xl p-5 md:p-6 text-slate-100 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/15 to-cyan-500/0 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Total Kelaran</p>
          <h2 className="text-3xl font-black mt-1 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{kelaran.reduce((s, k) => s + k.jumlah, 0)} pcs</h2>
          <p className="text-xs mt-1.5 text-slate-400 font-medium">{kelaran.length} entri tercatat</p>
        </div>
        <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-7xl opacity-[0.04] text-purple-400 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-[0.06]">
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
            <div key={date} className="space-y-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">{date}</p>
              <div className="space-y-2">
                {grouped[date].map((k) => {
                  const model = getModel(k.modelId);
                  const taylor = getTaylor(k.taylorId);
                  return (
                    <div
                      key={k.id}
                      className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-white/[0.15] p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.06] hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px] filled">check_circle</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm">{model?.nama}</h4>
                          <p className="text-xs text-slate-400 font-medium">{taylor?.nama}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-cyan-400">{k.jumlah} pcs</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{formatRupiah((model?.hargaJahit || 0) * k.jumlah)}</p>
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
