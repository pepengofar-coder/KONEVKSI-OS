import { useState, useEffect } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';
import Modal from '../ui/Modal';

export default function KelaranForm({ isOpen, onClose, kelaranToEdit = null }) {
  const { distribusi } = useAppState();
  const dispatch = useAppDispatch();
  const { getModel, getSisaDistribusi, getTaylor, formatRupiah, getKelaranByDistribusi } = useHelpers();

  const [distribusiId, setDistribusiId] = useState('');
  const [jumlah, setJumlah] = useState('');

  // Find the distribution item
  const selectedDist = distribusi.find(d => d.id === (kelaranToEdit ? kelaranToEdit.distribusiId : distribusiId));

  // If editing, the sisa limits are the current sisa plus the amount of this kelaran
  const sisaDist = selectedDist
    ? getSisaDistribusi(selectedDist) + (kelaranToEdit ? kelaranToEdit.jumlah : 0)
    : 0;

  // Only show active distribusi (except when editing, where it's locked anyway)
  const activeDistribusi = distribusi.filter(d => getSisaDistribusi(d) > 0 || (kelaranToEdit && d.id === kelaranToEdit.distribusiId));

  useEffect(() => {
    if (kelaranToEdit) {
      setDistribusiId(kelaranToEdit.distribusiId);
      setJumlah(kelaranToEdit.jumlah);
    } else {
      setDistribusiId('');
      setJumlah('');
    }
  }, [kelaranToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!distribusiId || !jumlah) return;
    const qty = parseInt(jumlah);
    if (qty > sisaDist) return;

    if (kelaranToEdit) {
      dispatch({
        type: 'EDIT_KELARAN',
        payload: {
          id: kelaranToEdit.id,
          distribusiId: kelaranToEdit.distribusiId,
          taylorId: kelaranToEdit.taylorId,
          modelId: kelaranToEdit.modelId,
          jumlah: qty,
          tanggal: kelaranToEdit.tanggal
        }
      });
    } else {
      dispatch({
        type: 'ADD_KELARAN',
        payload: {
          distribusiId,
          taylorId: selectedDist.taylorId,
          modelId: selectedDist.modelId,
          jumlah: qty,
        },
      });
    }

    setDistribusiId('');
    setJumlah('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={kelaranToEdit ? 'Ubah Catatan Kelaran' : 'Catat Kelaran Baru'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Pilih Distribusi</label>
          <select
            value={distribusiId}
            onChange={(e) => { setDistribusiId(e.target.value); setJumlah(''); }}
            disabled={!!kelaranToEdit}
            className="input-base appearance-none disabled:opacity-50"
            required
          >
            <option value="" className="bg-slate-900 text-slate-400">Pilih...</option>
            {activeDistribusi.map((d) => {
              const model = getModel(d.modelId);
              const taylor = getTaylor(d.taylorId);
              const sisa = getSisaDistribusi(d) + (kelaranToEdit && d.id === kelaranToEdit.distribusiId ? kelaranToEdit.jumlah : 0);
              return (
                <option key={d.id} value={d.id} className="bg-slate-900 text-slate-200">
                  {taylor?.nama} — {model?.nama} (sisa: {sisa} pcs)
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
            Jumlah Selesai
            {selectedDist && <span className="text-purple-400 ml-2">(Maks: {sisaDist})</span>}
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="30"
            min="1"
            max={sisaDist || 9999}
            className="input-base font-medium"
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
          {kelaranToEdit ? 'Simpan Perubahan' : 'Simpan Kelaran'}
        </button>
      </form>
    </Modal>
  );
}
