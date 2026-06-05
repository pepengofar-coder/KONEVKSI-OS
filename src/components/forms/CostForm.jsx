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
          <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Deskripsi</label>
          <input
            type="text"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Beli benang, jarum, makan siang..."
            className="w-full bg-slate-900/60 border border-white/[0.08] text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Nominal (Rp)</label>
          <input
            type="number"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            placeholder="25000"
            min="1"
            className="w-full bg-slate-900/60 border border-white/[0.08] text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          Simpan Cost Harian
        </button>
      </form>
    </Modal>
  );
}

