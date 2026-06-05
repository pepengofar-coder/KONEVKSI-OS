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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">On Progress</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Barang yang sedang dijahit taylor
          </p>
        </div>
        <button
          onClick={() => setShowKelaran(true)}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-tertiary-container text-on-tertiary-container rounded-xl text-xs font-bold hover:bg-tertiary hover:text-on-tertiary transition-all"
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
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold">
                      {taylor?.nama?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface text-sm">{taylor?.nama}</h3>
                      <p className="text-[10px] text-outline font-bold uppercase tracking-widest">
                        {totalSisa} pcs sedang dijahit
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {items.map((d) => {
                  const model = getModel(d.modelId);
                  const pctDone = ((d.jumlah - d.sisa) / d.jumlah) * 100;
                  return (
                    <div
                      key={d.id}
                      className="bg-surface-container-lowest p-4 rounded-2xl border-l-4 border-primary/30 hover:border-primary transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-on-surface text-sm">{model?.nama}</h4>
                          <p className="text-[10px] text-outline">{d.tanggal}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-primary">{d.sisa} pcs</p>
                          <p className="text-[10px] text-outline">sisa dari {d.jumlah}</p>
                        </div>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-500"
                          style={{ width: `${pctDone}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
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
