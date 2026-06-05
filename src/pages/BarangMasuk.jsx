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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Barang Masuk</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            {barangMasuk.length} entri tercatat
          </p>
        </div>
        <button
          onClick={() => setShowDistribusi(true)}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-secondary-container text-on-secondary-container rounded-xl text-xs font-bold hover:bg-secondary hover:text-on-secondary transition-all"
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
                className="bg-surface-container-lowest p-5 rounded-2xl hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary-fixed/30 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[20px]">checkroom</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface">{model?.nama || 'Model'}</h3>
                      <p className="text-xs text-outline font-medium">{bm.tanggal}</p>
                    </div>
                  </div>
                  <Badge variant={bm.sisaBelumDistribusi === 0 ? 'success' : bm.sisaBelumDistribusi < bm.jumlah ? 'primary' : 'default'}>
                    {bm.sisaBelumDistribusi === 0 ? 'Terdistribusi' : `Sisa ${bm.sisaBelumDistribusi}`}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[10px] text-outline font-bold uppercase tracking-widest">Total</p>
                      <p className="font-bold text-on-surface">{bm.jumlah} pcs</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-outline font-bold uppercase tracking-widest">Ongkos</p>
                      <p className="font-bold text-primary">{formatRupiah(model?.hargaJahit || 0)}/pcs</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-500"
                      style={{ width: `${pctDistributed}%` }}
                    />
                  </div>
                </div>

                {bm.catatan && (
                  <p className="mt-2.5 text-xs text-outline italic">{bm.catatan}</p>
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
