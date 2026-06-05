import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';
import Modal from '../ui/Modal';

export default function DistribusiForm({ isOpen, onClose }) {
  const { taylors, barangMasuk } = useAppState();
  const dispatch = useAppDispatch();
  const { getModel, formatRupiah } = useHelpers();

  const [barangMasukId, setBarangMasukId] = useState('');
  const [taylorId, setTaylorId] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [showNewTaylor, setShowNewTaylor] = useState(false);
  const [newTaylorNama, setNewTaylorNama] = useState('');

  const availableBM = barangMasuk.filter(bm => bm.sisaBelumDistribusi > 0);
  const selectedBM = barangMasuk.find(bm => bm.id === barangMasukId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!barangMasukId || !taylorId || !jumlah) return;
    const qty = parseInt(jumlah);
    if (selectedBM && qty > selectedBM.sisaBelumDistribusi) return;
    dispatch({
      type: 'ADD_DISTRIBUSI',
      payload: {
        barangMasukId,
        taylorId,
        modelId: selectedBM.modelId,
        jumlah: qty,
      },
    });
    resetForm();
    onClose();
  };

  const handleAddTaylor = () => {
    if (!newTaylorNama) return;
    dispatch({ type: 'ADD_TAYLOR', payload: { nama: newTaylorNama } });
    setNewTaylorNama('');
    setShowNewTaylor(false);
  };

  const resetForm = () => {
    setBarangMasukId('');
    setTaylorId('');
    setJumlah('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Distribusi ke Taylor">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Pilih Barang Masuk</label>
          <select
            value={barangMasukId}
            onChange={(e) => setBarangMasukId(e.target.value)}
            className="input-base appearance-none"
            required
          >
            <option value="" className="bg-slate-900 text-slate-400">Pilih barang...</option>
            {availableBM.map((bm) => {
              const model = getModel(bm.modelId);
              return (
                <option key={bm.id} value={bm.id} className="bg-slate-900 text-slate-200">
                  {model?.nama} — Sisa: {bm.sisaBelumDistribusi} pcs
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Taylor</label>
          <select
            value={taylorId}
            onChange={(e) => setTaylorId(e.target.value)}
            className="input-base appearance-none"
            required
          >
            <option value="" className="bg-slate-900 text-slate-400">Pilih taylor...</option>
            {taylors.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">{t.nama}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewTaylor(!showNewTaylor)}
            className="mt-2 text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Tambah Taylor Baru
          </button>
        </div>

        {showNewTaylor && (
          <div className="bg-slate-950/40 border border-white/[0.08] rounded-2xl p-4 space-y-3 animate-scale-in">
            <input
              type="text"
              placeholder="Nama taylor (misal: Pak Ahmad)"
              value={newTaylorNama}
              onChange={(e) => setNewTaylorNama(e.target.value)}
              className="input-base"
            />
            <button
              type="button"
              onClick={handleAddTaylor}
              className="w-full py-2.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all duration-200"
            >
              Simpan Taylor
            </button>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
            Jumlah Potong
            {selectedBM && <span className="text-purple-400 ml-2">(Maks: {selectedBM.sisaBelumDistribusi})</span>}
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="50"
            min="1"
            max={selectedBM?.sisaBelumDistribusi || 9999}
            className="input-base font-medium"
            required
          />
        </div>

        {selectedBM && taylorId && jumlah && (
          <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-4 text-sm animate-scale-in">
            <p className="font-bold text-slate-200">
              {getModel(selectedBM.modelId)?.nama} × {jumlah} pcs
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Estimasi Ongkos: <span className="text-cyan-400 font-bold">{formatRupiah(getModel(selectedBM.modelId)?.hargaJahit * parseInt(jumlah || 0))}</span>
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          Distribusikan
        </button>
      </form>
    </Modal>
  );
}
