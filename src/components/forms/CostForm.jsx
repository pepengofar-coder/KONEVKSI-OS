import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import Modal from '../ui/Modal';

const formatCurrency = (val) => val ? parseInt(String(val).replace(/\./g, '').replace(/[^\d]/g, ''), 10).toLocaleString('id-ID') : '';
const parseCurrency = (str) => parseInt(String(str).replace(/\./g, '').replace(/[^\d]/g, ''), 10) || 0;

export default function CostForm({ isOpen, onClose, costToEdit = null }) {
  const dispatch = useAppDispatch();

  const [deskripsi, setDeskripsi] = useState('');
  const [nominal, setNominal] = useState('');

  useEffect(() => {
    if (costToEdit) {
      setDeskripsi(costToEdit.deskripsi);
      setNominal(formatCurrency(costToEdit.nominal));
    } else {
      setDeskripsi('');
      setNominal('');
    }
  }, [costToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deskripsi || !nominal) return;

    const nominalNum = parseCurrency(nominal);

    if (costToEdit) {
      dispatch({
        type: 'EDIT_COST',
        payload: {
          id: costToEdit.id,
          deskripsi,
          nominal: nominalNum,
        },
      });
    } else {
      dispatch({
        type: 'ADD_COST',
        payload: {
          deskripsi,
          nominal: nominalNum,
        },
      });
    }
    setDeskripsi('');
    setNominal('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={costToEdit ? 'Ubah Cost Harian' : 'Tambah Cost Harian'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Deskripsi</label>
          <input
            type="text"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Beli benang, jarum, makan siang..."
            className="input-base"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Nominal (Rp)</label>
          <input
            type="text"
            inputMode="numeric"
            value={nominal}
            onChange={(e) => setNominal(formatCurrency(e.target.value))}
            placeholder="25.000"
            className="input-base font-medium"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          {costToEdit ? 'Simpan Perubahan' : 'Simpan Cost Harian'}
        </button>
      </form>
    </Modal>
  );
}
