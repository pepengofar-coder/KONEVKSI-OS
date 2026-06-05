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
          <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Taylor</label>
          <select
            value={taylorId}
            onChange={(e) => setTaylorId(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/[0.08] text-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all"
            required
          >
            <option value="" className="bg-slate-900 text-slate-400">Pilih taylor...</option>
            {taylors.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">{t.nama}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Nominal (Rp)</label>
          <input
            type="number"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            placeholder="100000"
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
            placeholder="Keperluan pribadi"
            className="w-full bg-slate-900/60 border border-white/[0.08] text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          Simpan Kasbon
        </button>
      </form>
    </Modal>
  );
}

