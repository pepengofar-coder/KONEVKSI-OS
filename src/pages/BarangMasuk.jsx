import { useState } from 'react';
import { useAppState, useHelpers } from '../context/AppContext';
import BarangMasukForm from '../components/forms/BarangMasukForm';
import DistribusiForm from '../components/forms/DistribusiForm';
import Badge from '../components/ui/Badge';
import FAB from '../components/ui/FAB';
import EmptyState from '../components/ui/EmptyState';

export default function BarangMasuk() {
  const { barangMasuk } = useAppState();
  const { getModel, formatRupiah } = useHelpers();
  const [showForm, setShowForm] = useState(false);
  const [showDistribusi, setShowDistribusi] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in-up text-white">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">Barang Masuk</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            {barangMasuk.length} entri tercatat
          </p>
        </div>
        <button
          onClick={() => setShowDistribusi(true)}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.03] active:scale-[0.97]"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          Distribusi
        </button>
      </div>

      {barangMasuk.length === 0 ? (
        <EmptyState
          icon="inventory_2"
          title="Belum Ada Barang Masuk"
          description="Tekan tombol + untuk menambahkan bahan/kain yang masuk"
        />
      ) : (
        <div className="space-y-3 stagger-children">
          {barangMasuk.map((bm) => {
            const model = getModel(bm.modelId);
            const pctDistributed = model ? ((bm.jumlah - bm.sisaBelumDistribusi) / bm.jumlah) * 100 : 0;
            return (
              <div
                key={bm.id}
                className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-white/[0.15] p-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">checkroom</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200">{model?.nama || 'Model'}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{bm.tanggal}</p>
                    </div>
                  </div>
                  <Badge variant={bm.sisaBelumDistribusi === 0 ? 'success' : bm.sisaBelumDistribusi < bm.jumlah ? 'primary' : 'default'}>
                    {bm.sisaBelumDistribusi === 0 ? 'Terdistribusi' : `Sisa ${bm.sisaBelumDistribusi}`}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Total</p>
                      <p className="font-bold text-slate-200">{bm.jumlah} pcs</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Ongkos</p>
                      <p className="font-bold text-purple-400">{formatRupiah(model?.hargaJahit || 0)}/pcs</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-slate-950/60 border border-white/[0.04] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${pctDistributed}%` }}
                    />
                  </div>
                </div>

                {bm.catatan && (
                  <p className="mt-3 text-xs text-slate-400 italic font-medium">Catatan: {bm.catatan}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <FAB onClick={() => setShowForm(true)} icon="add" label="Barang Masuk" />
      <BarangMasukForm isOpen={showForm} onClose={() => setShowForm(false)} />
      <DistribusiForm isOpen={showDistribusi} onClose={() => setShowDistribusi(false)} />
    </div>
  );
}
