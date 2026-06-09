import { useState, useEffect } from 'react';
import { useAppState, useAppDispatch, usePlan, useHelpers } from '../../context/AppContext';
import Modal from '../ui/Modal';

const formatCurrency = (val) => val ? parseInt(String(val).replace(/\./g, '').replace(/[^\d]/g, ''), 10).toLocaleString('id-ID') : '';
const parseCurrency = (str) => parseInt(String(str).replace(/\./g, '').replace(/[^\d]/g, ''), 10) || 0;

export default function BarangMasukForm({ isOpen, onClose, barangMasukToEdit = null }) {
  const { models } = useAppState();
  const dispatch = useAppDispatch();
  const { isLimitExceeded, showUpgradeModal } = usePlan();
  const { showToast } = useHelpers();

  const [modelId, setModelId] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [catatan, setCatatan] = useState('');
  const [priority, setPriority] = useState('Sedang');
  const [deadline, setDeadline] = useState('');
  const [showNewModel, setShowNewModel] = useState(false);
  const [newModelNama, setNewModelNama] = useState('');
  const [newModelHarga, setNewModelHarga] = useState('');

  useEffect(() => {
    if (barangMasukToEdit) {
      setModelId(barangMasukToEdit.modelId);
      setJumlah(barangMasukToEdit.jumlah);
      setCatatan(barangMasukToEdit.catatan || '');
      setPriority(barangMasukToEdit.priority || 'Sedang');
      setDeadline(barangMasukToEdit.deadline || '');
    } else {
      setModelId('');
      setJumlah('');
      setCatatan('');
      setPriority('Sedang');
      // Default to 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDeadline(defaultDate.toISOString().split('T')[0]);
    }
  }, [barangMasukToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!modelId || !jumlah) return;

    if (!barangMasukToEdit && isLimitExceeded('orders')) {
      showToast('Batas kuota tercapai! Upgrade ke Premium untuk input order tak terbatas.', 'error');
      showUpgradeModal();
      onClose();
      return;
    }

    const jumlahNum = parseInt(jumlah) || 0;

    if (barangMasukToEdit) {
      // Calculate new sisaBelumDistribusi based on edited total amount
      const distributedAmount = barangMasukToEdit.jumlah - barangMasukToEdit.sisaBelumDistribusi;
      const newSisa = Math.max(0, jumlahNum - distributedAmount);

      dispatch({
        type: 'EDIT_BARANG_MASUK',
        payload: {
          id: barangMasukToEdit.id,
          modelId,
          jumlah: jumlahNum,
          sisaBelumDistribusi: newSisa,
          catatan,
          priority,
          deadline
        }
      });
    } else {
      dispatch({
        type: 'ADD_BARANG_MASUK',
        payload: { modelId, jumlah: jumlahNum, catatan, priority, deadline },
      });
    }
    resetForm();
    onClose();
  };

  const handleAddModel = () => {
    if (!newModelNama || !newModelHarga) return;
    dispatch({
      type: 'ADD_MODEL',
      payload: { nama: newModelNama, hargaJahit: parseCurrency(newModelHarga) },
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={barangMasukToEdit ? 'Ubah Barang Masuk' : 'Barang Masuk Baru'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Model Pakaian</label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="input-base appearance-none"
            required
          >
            <option value="" className="bg-slate-900 text-slate-400">Pilih model...</option>
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                {m.nama} — Rp {m.hargaJahit.toLocaleString('id-ID')}/pcs
              </option>
            ))}
          </select>
          {!barangMasukToEdit && (
            <button
              type="button"
              onClick={() => setShowNewModel(!showNewModel)}
              className="mt-2 text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Tambah Model Baru
            </button>
          )}
        </div>

        {showNewModel && !barangMasukToEdit && (
          <div className="bg-slate-950/40 border border-white/[0.08] rounded-2xl p-4 space-y-3 animate-scale-in">
            <input
              type="text"
              placeholder="Nama model (misal: Gamis B)"
              value={newModelNama}
              onChange={(e) => setNewModelNama(e.target.value)}
              className="input-base"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Harga jahit per pcs"
              value={newModelHarga}
              onChange={(e) => setNewModelHarga(formatCurrency(e.target.value))}
              className="input-base"
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
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Jumlah Potong</label>
          <input
            type="number"
            inputMode="numeric"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="100"
            min="1"
            className="input-base font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Prioritas</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input-base appearance-none"
              required
            >
              <option value="Rendah" className="bg-slate-900 text-slate-200">Rendah</option>
              <option value="Sedang" className="bg-slate-900 text-slate-200">Sedang</option>
              <option value="Tinggi" className="bg-slate-900 text-slate-200">Tinggi</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Tenggat Waktu</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="input-base"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Catatan (opsional)</label>
          <input
            type="text"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Kain dari Pak Hasan"
            className="input-base"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          {barangMasukToEdit ? 'Simpan Perubahan' : 'Simpan Barang Masuk'}
        </button>
      </form>
    </Modal>
  );
}
