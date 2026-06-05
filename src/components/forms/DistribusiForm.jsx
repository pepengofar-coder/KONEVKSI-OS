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
          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Pilih Barang Masuk</label>
          <select
            value={barangMasukId}
            onChange={(e) => setBarangMasukId(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm font-medium"
            required
          >
            <option value="">Pilih barang...</option>
            {availableBM.map((bm) => {
              const model = getModel(bm.modelId);
              return (
                <option key={bm.id} value={bm.id}>
                  {model?.nama} — Sisa: {bm.sisaBelumDistribusi} pcs
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Taylor</label>
          <select
            value={taylorId}
            onChange={(e) => setTaylorId(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm font-medium"
            required
          >
            <option value="">Pilih taylor...</option>
            {taylors.map((t) => (
              <option key={t.id} value={t.id}>{t.nama}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewTaylor(!showNewTaylor)}
            className="mt-2 text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Tambah Taylor Baru
          </button>
        </div>

        {showNewTaylor && (
          <div className="bg-surface-container-low rounded-2xl p-4 space-y-3 animate-scale-in">
            <input
              type="text"
              placeholder="Nama taylor (misal: Pak Ahmad)"
              value={newTaylorNama}
              onChange={(e) => setNewTaylorNama(e.target.value)}
              className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={handleAddTaylor}
              className="w-full py-2.5 bg-secondary-container text-on-secondary-container rounded-xl text-xs font-bold"
            >
              Simpan Taylor
            </button>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
            Jumlah Potong
            {selectedBM && <span className="text-primary ml-2">(Maks: {selectedBM.sisaBelumDistribusi})</span>}
          </label>
          <input
            type="number"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="50"
            min="1"
            max={selectedBM?.sisaBelumDistribusi || 9999}
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm font-medium"
            required
          />
        </div>

        {selectedBM && taylorId && jumlah && (
          <div className="bg-primary-fixed/20 rounded-2xl p-4 text-sm">
            <p className="font-semibold text-primary">
              {getModel(selectedBM.modelId)?.nama} × {jumlah} pcs
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Ongkos: {formatRupiah(getModel(selectedBM.modelId)?.hargaJahit * parseInt(jumlah || 0))}
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 bg-primary text-on-primary rounded-2xl font-bold text-sm hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]"
        >
          Distribusikan
        </button>
      </form>
    </Modal>
  );
}
