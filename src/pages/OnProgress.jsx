import { useState } from 'react';
import { useAppState, useHelpers } from '../context/AppContext';
import DistribusiForm from '../components/forms/DistribusiForm';
import KelaranForm from '../components/forms/KelaranForm';
import Badge from '../components/ui/Badge';
import FAB from '../components/ui/FAB';
import EmptyState from '../components/ui/EmptyState';

export default function OnProgress() {
  const { distribusi } = useAppState();
  const { getModel, getTaylor, getSisaDistribusi, formatRupiah } = useHelpers();
  const [showDistribusi, setShowDistribusi] = useState(false);
  const [showKelaran, setShowKelaran] = useState(false);

  // Group by taylor
  const taylorGroups = {};
  distribusi.forEach((d) => {
    const sisa = getSisaDistribusi(d);
    if (sisa <= 0) return; // skip completed
    if (!taylorGroups[d.taylorId]) {
      taylorGroups[d.taylorId] = [];
    }
    taylorGroups[d.taylorId].push({ ...d, sisa });
  });

  const taylorIds = Object.keys(taylorGroups);

  return (
    <div className="space-y-6 animate-fade-in-up text-white">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">On Progress</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            Barang yang sedang dijahit taylor
          </p>
        </div>
        <button
          onClick={() => setShowKelaran(true)}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.03] active:scale-[0.97]"
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Catat Kelaran
        </button>
      </div>

      {taylorIds.length === 0 ? (
        <EmptyState
          icon="sync"
          title="Tidak Ada Barang On Progress"
          description="Distribusikan barang ke taylor terlebih dahulu"
        />
      ) : (
        <div className="space-y-6 stagger-children">
          {taylorIds.map((taylorId) => {
            const taylor = getTaylor(taylorId);
            const items = taylorGroups[taylorId];
            const totalSisa = items.reduce((s, d) => s + d.sisa, 0);
            return (
              <div key={taylorId} className="space-y-3">
                {/* Taylor Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-purple-500/20">
                      {taylor?.nama?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200 text-sm">{taylor?.nama}</h3>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.15em] mt-0.5">
                        {totalSisa} pcs sedang dijahit
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 gap-3">
                  {items.map((d) => {
                    const model = getModel(d.modelId);
                    const pctDone = ((d.jumlah - d.sisa) / d.jumlah) * 100;
                    return (
                      <div
                        key={d.id}
                        className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-t border-r border-b border-white/[0.08] border-l-4 border-l-purple-500 p-4 rounded-2xl hover:border-white/[0.15] hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-slate-200 text-sm">{model?.nama}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{d.tanggal}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-purple-400">{d.sisa} pcs</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mt-0.5">sisa dari {d.jumlah}</p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-950/60 border border-white/[0.04] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                            style={{ width: `${pctDone}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FAB onClick={() => setShowDistribusi(true)} icon="send" label="Distribusi" />
      <DistribusiForm isOpen={showDistribusi} onClose={() => setShowDistribusi(false)} />
      <KelaranForm isOpen={showKelaran} onClose={() => setShowKelaran(false)} />
    </div>
  );
}
