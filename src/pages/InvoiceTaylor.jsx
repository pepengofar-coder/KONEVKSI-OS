import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../context/AppContext';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function InvoiceTaylor() {
  const { taylors, kelaran, kasbon } = useAppState();
  const dispatch = useAppDispatch();
  const { getModel, getTaylor, getTaylorKelaran, getTotalKasbonBelumLunas, getTaylorKasbonBelumLunas, formatRupiah } = useHelpers();

  const [selectedTaylor, setSelectedTaylor] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const taylorData = selectedTaylor ? (() => {
    const taylor = getTaylor(selectedTaylor);
    const kelaranItems = getTaylorKelaran(selectedTaylor);
    const kasbonBelumLunas = getTaylorKasbonBelumLunas(selectedTaylor);
    const totalKasbon = getTotalKasbonBelumLunas(selectedTaylor);

    // Group kelaran by model for breakdown
    const modelBreakdown = {};
    kelaranItems.forEach((k) => {
      const model = getModel(k.modelId);
      if (!modelBreakdown[k.modelId]) {
        modelBreakdown[k.modelId] = {
          nama: model?.nama || 'Unknown',
          hargaJahit: model?.hargaJahit || 0,
          totalPcs: 0,
        };
      }
      modelBreakdown[k.modelId].totalPcs += k.jumlah;
    });

    const subtotal = Object.values(modelBreakdown).reduce(
      (sum, m) => sum + m.totalPcs * m.hargaJahit,
      0
    );

    return {
      taylor,
      kelaranItems,
      kasbonBelumLunas,
      totalKasbon,
      modelBreakdown: Object.values(modelBreakdown),
      subtotal,
      sisaBayar: subtotal - totalKasbon,
    };
  })() : null;

  const handleBayar = () => {
    dispatch({ type: 'LUNASI_KASBON_TAYLOR', payload: selectedTaylor });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Invoice Taylor</h1>
        <p className="text-sm text-on-surface-variant font-medium mt-1">
          Generate slip gaji & pembayaran taylor
        </p>
      </div>

      {/* Taylor Selector */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 md:p-6">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
          Pilih Taylor
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {taylors.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTaylor(t.id)}
              className={`p-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                selectedTaylor === t.id
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {t.nama}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Preview */}
      {taylorData && (
        <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-xl shadow-primary/5 animate-scale-in">
          {/* Invoice Header */}
          <div className="bg-primary p-6 text-on-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Invoice</p>
                <h2 className="text-xl font-black mt-1">{taylorData.taylor?.nama}</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] opacity-70">Tanggal</p>
                <p className="font-bold text-sm">{new Date().toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Breakdown */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
                Rincian Hasil Kerja
              </h3>
              {taylorData.modelBreakdown.length === 0 ? (
                <p className="text-sm text-outline italic">Belum ada kelaran tercatat</p>
              ) : (
                <div className="space-y-2">
                  {taylorData.modelBreakdown.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                      <div>
                        <p className="font-semibold text-sm text-on-surface">{m.nama}</p>
                        <p className="text-[10px] text-outline">
                          {m.totalPcs} pcs × {formatRupiah(m.hargaJahit)}
                        </p>
                      </div>
                      <p className="font-bold text-primary">{formatRupiah(m.totalPcs * m.hargaJahit)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kasbon */}
            {taylorData.kasbonBelumLunas.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
                  Potongan Kasbon
                </h3>
                <div className="space-y-2">
                  {taylorData.kasbonBelumLunas.map((kb) => (
                    <div key={kb.id} className="flex items-center justify-between p-3 bg-warning-container/30 rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-on-surface">{kb.catatan || 'Kasbon'}</p>
                        <p className="text-[10px] text-outline">{kb.tanggal}</p>
                      </div>
                      <p className="font-bold text-error">-{formatRupiah(kb.nominal)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t-2 border-dashed border-outline-variant/30 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-outline">Subtotal Kelaran</span>
                  <span className="font-bold text-on-surface">{formatRupiah(taylorData.subtotal)}</span>
                </div>
                {taylorData.totalKasbon > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-outline">Potongan Kasbon</span>
                    <span className="font-bold text-error">-{formatRupiah(taylorData.totalKasbon)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2 border-t border-outline-variant/20">
                  <span className="text-xs font-bold uppercase tracking-widest text-outline">Sisa Dibayar</span>
                  <span className="text-2xl font-black text-primary">
                    {formatRupiah(Math.max(0, taylorData.sisaBayar))}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 no-print">
              <button
                onClick={() => setShowConfirm(true)}
                className="flex-1 py-3.5 bg-tertiary text-on-tertiary rounded-2xl font-bold text-sm hover:bg-tertiary-container hover:text-on-tertiary-container transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                Bayar & Lunasi
              </button>
              <button
                onClick={() => window.print()}
                className="py-3.5 px-5 bg-surface-container-high text-on-surface-variant rounded-2xl font-bold text-sm hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleBayar}
        title="Konfirmasi Pembayaran"
        message={`Yakin ingin menandai pembayaran untuk ${taylorData?.taylor?.nama}? Semua kasbon yang belum lunas akan ditandai lunas.`}
        confirmText="Ya, Bayar"
        variant="success"
      />
    </div>
  );
}
