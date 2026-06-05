import { useState } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import Modal from '../ui/Modal';

export default function CostForm({ isOpen, onClose }) {
  const dispatch = useAppDispatch();

  const [deskripsi, setDeskripsi] = useState('');
  const [nominal, setNominal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deskripsi || !nominal) return;
    dispatch({
      type: 'ADD_COST',
      payload: {
        deskripsi,
        nominal: parseInt(nominal),
      },
    });
    setDeskripsi('');
    setNominal('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Cost Harian">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Deskripsi</label>
          <input
            type="text"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Beli benang, jarum, makan siang..."
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Nominal (Rp)</label>
          <input
            type="number"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            placeholder="25000"
            min="1"
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm font-medium"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-primary text-on-primary rounded-2xl font-bold text-sm hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]"
        >
          Simpan
        </button>
      </form>
    </Modal>
  );
}
