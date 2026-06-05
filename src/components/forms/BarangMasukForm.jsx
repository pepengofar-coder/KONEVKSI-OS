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
          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Model Pakaian</label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
            required
          >
            <option value="">Pilih model...</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama} — Rp {m.hargaJahit.toLocaleString('id-ID')}/pcs
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewModel(!showNewModel)}
            className="mt-2 text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Tambah Model Baru
          </button>
        </div>

        {showNewModel && (
          <div className="bg-surface-container-low rounded-2xl p-4 space-y-3 animate-scale-in">
            <input
              type="text"
              placeholder="Nama model (misal: Gamis B)"
              value={newModelNama}
              onChange={(e) => setNewModelNama(e.target.value)}
              className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-2.5 text-sm"
            />
            <input
              type="number"
              placeholder="Harga jahit per pcs"
              value={newModelHarga}
              onChange={(e) => setNewModelHarga(e.target.value)}
              className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={handleAddModel}
              className="w-full py-2.5 bg-secondary-container text-on-secondary-container rounded-xl text-xs font-bold"
            >
              Simpan Model
            </button>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Jumlah Potong</label>
          <input
            type="number"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="100"
            min="1"
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Catatan (opsional)</label>
          <input
            type="text"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Kain dari Pak Hasan"
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-primary text-on-primary rounded-2xl font-bold text-sm hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]"
        >
          Simpan Barang Masuk
        </button>
      </form>
    </Modal>
  );
}
