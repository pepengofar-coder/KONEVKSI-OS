import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';
import Modal from '../ui/Modal';

export default function KelaranForm({ isOpen, onClose }) {
  const { distribusi, taylors } = useAppState();
  const dispatch = useAppDispatch();
  const { getModel, getSisaDistribusi, getTaylor, formatRupiah } = useHelpers();

  const [distribusiId, setDistribusiId] = useState('');
  const [jumlah, setJumlah] = useState('');

  // Only show distribusi that still have remaining items
  const activeDistribusi = distribusi.filter(d => getSisaDistribusi(d) > 0);
  const selectedDist = distribusi.find(d => d.id === distribusiId);
  const sisaDist = selectedDist ? getSisaDistribusi(selectedDist) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!distribusiId || !jumlah) return;
    const qty = parseInt(jumlah);
    if (qty > sisaDist) return;
    dispatch({
      type: 'ADD_KELARAN',
      payload: {
        distribusiId,
        taylorId: selectedDist.taylorId,
        modelId: selectedDist.modelId,
        jumlah: qty,
      },
    });
    setDistribusiId('');
    setJumlah('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catat Kelaran">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Pilih Distribusi</label>
          <select
            value={distribusiId}
            onChange={(e) => { setDistribusiId(e.target.value); setJumlah(''); }}
            className="w-full bg-slate-900/80 border border-white/[0.08] text-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all"
            required
          >
            <option value="" className="bg-slate-900 text-slate-400">Pilih...</option>
            {activeDistribusi.map((d) => {
              const model = getModel(d.modelId);
              const taylor = getTaylor(d.taylorId);
              const sisa = getSisaDistribusi(d);
              return (
                <option key={d.id} value={d.id} className="bg-slate-900 text-slate-200">
                  {taylor?.nama} — {model?.nama} (sisa: {sisa} pcs)
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
            Jumlah Selesai
            {selectedDist && <span className="text-purple-400 ml-2">(Maks: {sisaDist})</span>}
          </label>
          <input
            type="number"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="30"
            min="1"
            max={sisaDist || 9999}
            className="w-full bg-slate-900/60 border border-white/[0.08] text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all"
            required
          />
        </div>

        {selectedDist && jumlah && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4 text-sm animate-scale-in">
            <p className="font-bold text-slate-200">
              {getModel(selectedDist.modelId)?.nama} × {jumlah} pcs selesai
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Estimasi Gaji: <span className="text-emerald-400 font-bold">{formatRupiah(getModel(selectedDist.modelId)?.hargaJahit * parseInt(jumlah || 0))}</span>
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          Simpan Kelaran
        </button>
      </form>
    </Modal>
  );
}

