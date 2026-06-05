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
          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Pilih Distribusi</label>
          <select
            value={distribusiId}
            onChange={(e) => { setDistribusiId(e.target.value); setJumlah(''); }}
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm font-medium"
            required
          >
            <option value="">Pilih...</option>
            {activeDistribusi.map((d) => {
              const model = getModel(d.modelId);
              const taylor = getTaylor(d.taylorId);
              const sisa = getSisaDistribusi(d);
              return (
                <option key={d.id} value={d.id}>
                  {taylor?.nama} — {model?.nama} (sisa: {sisa} pcs)
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
            Jumlah Selesai
            {selectedDist && <span className="text-primary ml-2">(Maks: {sisaDist})</span>}
          </label>
          <input
            type="number"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="30"
            min="1"
            max={sisaDist || 9999}
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm font-medium"
            required
          />
        </div>

        {selectedDist && jumlah && (
          <div className="bg-tertiary-fixed/20 rounded-2xl p-4 text-sm">
            <p className="font-semibold text-tertiary">
              {getModel(selectedDist.modelId)?.nama} × {jumlah} pcs selesai
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Nilai: {formatRupiah(getModel(selectedDist.modelId)?.hargaJahit * parseInt(jumlah || 0))}
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 bg-tertiary text-on-tertiary rounded-2xl font-bold text-sm hover:bg-tertiary-container hover:text-on-tertiary-container transition-all active:scale-[0.98]"
        >
          Simpan Kelaran
        </button>
      </form>
    </Modal>
  );
}
