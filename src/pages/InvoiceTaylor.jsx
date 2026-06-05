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
    <div className="space-y-6 animate-fade-in-up text-white">
      <div>
        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">Invoice Taylor</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
          Generate slip gaji & pembayaran taylor
        </p>
      </div>

      {/* Taylor Selector */}
      <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-3xl p-5 md:p-6">
        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3.5">
          Pilih Taylor
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {taylors.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTaylor(t.id)}
              className={`p-3 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 ${
                selectedTaylor === t.id
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/25 border-none'
                  : 'bg-white/[0.03] border border-white/[0.06] text-slate-300 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {t.nama}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Preview */}
      {taylorData && (
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-white/[0.08] backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl shadow-black/80 animate-scale-in text-white">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-purple-900/60 to-cyan-900/60 border-b border-white/[0.06] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">Invoice Slip</p>
                <h2 className="text-xl font-black mt-1 text-slate-100">{taylorData.taylor?.nama}</h2>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Tanggal</p>
                <p className="font-bold text-sm text-slate-200 mt-1">{new Date().toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Breakdown */}
            <div>
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                Rincian Hasil Kerja
              </h3>
              {taylorData.modelBreakdown.length === 0 ? (
                <p className="text-sm text-slate-500 italic font-medium">Belum ada kelaran tercatat</p>
              ) : (
                <div className="space-y-2">
                  {taylorData.modelBreakdown.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                      <div>
                        <p className="font-bold text-sm text-slate-200">{m.nama}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                          {m.totalPcs} pcs × {formatRupiah(m.hargaJahit)}
                        </p>
                      </div>
                      <p className="font-bold text-purple-400">{formatRupiah(m.totalPcs * m.hargaJahit)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kasbon */}
            {taylorData.kasbonBelumLunas.length > 0 && (
              <div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                  Potongan Kasbon
                </h3>
                <div className="space-y-2">
                  {taylorData.kasbonBelumLunas.map((kb) => (
                    <div key={kb.id} className="flex items-center justify-between p-3.5 bg-red-500/5 border border-red-500/10 rounded-xl">
                      <div>
                        <p className="font-semibold text-sm text-slate-200">{kb.catatan || 'Kasbon'}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{kb.tanggal}</p>
                      </div>
                      <p className="font-bold text-red-400">-{formatRupiah(kb.nominal)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t-2 border-dashed border-white/[0.08] pt-4">
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal Kelaran</span>
                  <span className="font-bold text-slate-200">{formatRupiah(taylorData.subtotal)}</span>
                </div>
                {taylorData.totalKasbon > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Potongan Kasbon</span>
                    <span className="font-bold text-red-400">-{formatRupiah(taylorData.totalKasbon)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-3.5 border-t border-white/[0.06]">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Sisa Dibayar</span>
                  <span className="text-2xl font-black text-cyan-400">
                    {formatRupiah(Math.max(0, taylorData.sisaBayar))}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 no-print pt-2">
              <button
                onClick={() => setShowConfirm(true)}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/20 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                Bayar & Lunasi
              </button>
              <button
                onClick={() => window.print()}
                className="py-3.5 px-5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 hover:text-white rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
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
