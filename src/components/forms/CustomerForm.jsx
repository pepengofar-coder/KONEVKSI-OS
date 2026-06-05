import { useState, useEffect } from 'react';
import { useAppDispatch, useHelpers } from '../../context/AppContext';
import Modal from '../ui/Modal';

export default function CustomerForm({ isOpen, onClose, customerToEdit = null }) {
  const dispatch = useAppDispatch();
  const { showToast } = useHelpers();

  const [nama, setNama] = useState('');
  const [phone, setPhone] = useState('');
  const [alamat, setAlamat] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setNama(customerToEdit.nama);
      setPhone(customerToEdit.phone || '');
      setAlamat(customerToEdit.alamat || '');
    } else {
      setNama('');
      setPhone('');
      setAlamat('');
    }
  }, [customerToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nama) {
      showToast('Nama pelanggan harus diisi!', 'error');
      return;
    }

    if (customerToEdit) {
      dispatch({
        type: 'EDIT_CUSTOMER',
        payload: {
          id: customerToEdit.id,
          nama,
          phone,
          alamat
        }
      });
      showToast('Data pelanggan berhasil diperbarui!', 'success');
    } else {
      dispatch({
        type: 'ADD_CUSTOMER',
        payload: {
          nama,
          phone,
          alamat
        }
      });
      showToast('Pelanggan baru berhasil ditambahkan!', 'success');
    }

    setNama('');
    setPhone('');
    setAlamat('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? 'Ubah Data Pelanggan' : 'Tambah Pelanggan Baru'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Nama Pelanggan</label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: CV Jaya Abadi"
            className="input-base"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">No. Telepon / WhatsApp</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contoh: 08123456789"
            className="input-base"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Alamat Pelanggan</label>
          <textarea
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Contoh: Jl. Industri Raya No. 4 Bandung"
            rows="3"
            className="input-base resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          {customerToEdit ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
        </button>
      </form>
    </Modal>
  );
}
