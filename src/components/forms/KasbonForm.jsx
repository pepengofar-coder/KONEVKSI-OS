import { useState, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import Modal from '../ui/Modal';

const formatCurrency = (val) => val ? parseInt(String(val).replace(/\./g, '').replace(/[^\d]/g, ''), 10).toLocaleString('id-ID') : '';
const parseCurrency = (str) => parseInt(String(str).replace(/\./g, '').replace(/[^\d]/g, ''), 10) || 0;

export default function KasbonForm({ isOpen, onClose, kasbonToEdit = null }) {
  const { taylors } = useAppState();
  const dispatch = useAppDispatch();

  const [taylorId, setTaylorId] = useState('');
  const [nominal, setNominal] = useState('');
  const [catatan, setCatatan] = useState('');
  const [lunas, setLunas] = useState(false);

  useEffect(() => {
    if (kasbonToEdit) {
      setTaylorId(kasbonToEdit.taylorId);
      setNominal(formatCurrency(kasbonToEdit.nominal));
      setCatatan(kasbonToEdit.catatan || '');
      setLunas(kasbonToEdit.lunas || false);
    } else {
      setTaylorId('');
      setNominal('');
      setCatatan('');
      setLunas(false);
    }
  }, [kasbonToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taylorId || !nominal) return;

    const nominalNum = parseCurrency(nominal);

    if (kasbonToEdit) {
      dispatch({
        type: 'EDIT_KASBON',
        payload: {
          id: kasbonToEdit.id,
          taylorId,
          nominal: nominalNum,
          catatan,
          lunas
        }
      });
    } else {
      dispatch({
        type: 'ADD_KASBON',
        payload: {
          taylorId,
          nominal: nominalNum,
          catatan,
        },
      });
    }

    setTaylorId('');
    setNominal('');
    setCatatan('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={kasbonToEdit ? 'Ubah Catatan Kasbon' : 'Catat Kasbon Baru'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Taylor</label>
          <select
            value={taylorId}
            onChange={(e) => setTaylorId(e.target.value)}
            className="input-base appearance-none"
            required
          >
            <option value="" className="bg-slate-900 text-slate-400">Pilih taylor...</option>
            {taylors.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">{t.nama}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Nominal (Rp)</label>
          <input
            type="text"
            inputMode="numeric"
            value={nominal}
            onChange={(e) => setNominal(formatCurrency(e.target.value))}
            placeholder="100.000"
            className="input-base font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Catatan (opsional)</label>
          <input
            type="text"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Keperluan pribadi"
            className="input-base"
          />
        </div>

        {kasbonToEdit && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="lunas-checkbox"
              checked={lunas}
              onChange={(e) => setLunas(e.target.checked)}
              className="w-4 h-4 rounded border-white/[0.08] text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="lunas-checkbox" className="text-xs font-semibold text-slate-300">Tandai sudah lunas</label>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          {kasbonToEdit ? 'Simpan Perubahan' : 'Simpan Kasbon'}
        </button>
      </form>
    </Modal>
  );
}
