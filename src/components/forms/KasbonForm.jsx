import { useState } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import Modal from '../ui/Modal';

export default function KasbonForm({ isOpen, onClose }) {
  const { taylors } = useAppState();
  const dispatch = useAppDispatch();

  const [taylorId, setTaylorId] = useState('');
  const [nominal, setNominal] = useState('');
  const [catatan, setCatatan] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taylorId || !nominal) return;
    dispatch({
      type: 'ADD_KASBON',
      payload: {
        taylorId,
        nominal: parseInt(nominal),
        catatan,
      },
    });
    setTaylorId('');
    setNominal('');
    setCatatan('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catat Kasbon">
      <form onSubmit={handleSubmit} className="space-y-5">
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
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Nominal (Rp)</label>
          <input
            type="number"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            placeholder="100000"
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
            placeholder="Keperluan pribadi"
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-warning text-on-warning rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
        >
          Simpan Kasbon
        </button>
      </form>
    </Modal>
  );
}
