import { useState } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import Modal from '../ui/Modal';

export default function BarangMasukForm({ isOpen, onClose }) {
  const { models } = useAppState();
  const dispatch = useAppDispatch();

  const [modelId, setModelId] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [catatan, setCatatan] = useState('');
  const [showNewModel, setShowNewModel] = useState(false);
  const [newModelNama, setNewModelNama] = useState('');
  const [newModelHarga, setNewModelHarga] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!modelId || !jumlah) return;
    dispatch({
      type: 'ADD_BARANG_MASUK',
      payload: { modelId, jumlah: parseInt(jumlah), catatan },
    });
    resetForm();
    onClose();
  };

  const handleAddModel = () => {
    if (!newModelNama || !newModelHarga) return;
    dispatch({
      type: 'ADD_MODEL',
      payload: { nama: newModelNama, hargaJahit: parseInt(newModelHarga) },
    });
    setNewModelNama('');
    setNewModelHarga('');
    setShowNewModel(false);
  };

  const resetForm = () => {
    setModelId('');
    setJumlah('');
    setCatatan('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Barang Masuk Baru">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Model Pakaian</label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/[0.08] text-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all"
            required
          >
            <option value="" className="bg-slate-900 text-slate-400">Pilih model...</option>
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                {m.nama} — Rp {m.hargaJahit.toLocaleString('id-ID')}/pcs
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewModel(!showNewModel)}
            className="mt-2 text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Tambah Model Baru
          </button>
        </div>

        {showNewModel && (
          <div className="bg-slate-950/40 border border-white/[0.08] rounded-2xl p-4 space-y-3 animate-scale-in">
            <input
              type="text"
              placeholder="Nama model (misal: Gamis B)"
              value={newModelNama}
              onChange={(e) => setNewModelNama(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/[0.08] text-slate-200 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all"
            />
            <input
              type="number"
              placeholder="Harga jahit per pcs"
              value={newModelHarga}
              onChange={(e) => setNewModelHarga(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/[0.08] text-slate-200 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all"
            />
            <button
              type="button"
              onClick={handleAddModel}
              className="w-full py-2.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all duration-200"
            >
              Simpan Model
            </button>
          </div>
        )}

        <div>
          <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Jumlah Potong</label>
          <input
            type="number"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="100"
            min="1"
            className="w-full bg-slate-900/60 border border-white/[0.08] text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Catatan (opsional)</label>
          <input
            type="text"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Kain dari Pak Hasan"
            className="w-full bg-slate-900/60 border border-white/[0.08] text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          Simpan Barang Masuk
        </button>
      </form>
    </Modal>
  );
}

