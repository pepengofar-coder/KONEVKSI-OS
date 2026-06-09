import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../context/AppContext';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';

export default function BahanBaku() {
  const { bahanBaku = [] } = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useHelpers();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form Fields
  const [nama, setNama] = useState('');
  const [stok, setStok] = useState('');
  const [minimalStok, setMinimalStok] = useState('');
  const [satuan, setSatuan] = useState('Pcs');

  // Filter items
  const filteredItems = bahanBaku.filter(bb => 
    bb.nama.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setNama('');
    setStok('');
    setMinimalStok('');
    setSatuan('Pcs');
    setShowForm(true);
  };

  const handleOpenEdit = (bb) => {
    setEditingItem(bb);
    setNama(bb.nama);
    setStok(bb.stok.toString());
    setMinimalStok(bb.minimalStok.toString());
    setSatuan(bb.satuan);
    setShowForm(true);
  };

  const handleDeleteClick = (bb) => {
    setItemToDelete(bb);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      dispatch({ type: 'DELETE_BAHAN_BAKU', payload: itemToDelete.id });
      showToast('Bahan baku berhasil dihapus!', 'success');
      setItemToDelete(null);
      setShowConfirmDelete(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nama || stok === '' || minimalStok === '') {
      showToast('Harap isi semua kolom wajib!', 'error');
      return;
    }

    const stokNum = parseFloat(stok);
    const minNum = parseFloat(minimalStok);

    if (isNaN(stokNum) || stokNum < 0 || isNaN(minNum) || minNum < 0) {
      showToast('Stok dan batas minimum harus berupa angka positif!', 'error');
      return;
    }

    const payload = {
      nama,
      stok: stokNum,
      minimalStok: minNum,
      satuan
    };

    if (editingItem) {
      dispatch({
        type: 'EDIT_BAHAN_BAKU',
        payload: { id: editingItem.id, ...payload }
      });
      showToast('Bahan baku berhasil diperbarui!', 'success');
    } else {
      dispatch({
        type: 'ADD_BAHAN_BAKU',
        payload
      });
      showToast('Bahan baku baru berhasil ditambahkan!', 'success');
    }

    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">Bahan Baku</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            {bahanBaku.length} kain & material terdaftar
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tambah Bahan
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-500">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari bahan baku (misal: Cotton Combed, Kancing)..."
            className="w-full bg-slate-950/40 border border-white/[0.06] text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all"
          />
        </div>
      </div>

      {/* Content List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon="inventory"
          title="Bahan Baku Kosong"
          description={search ? "Tidak ada bahan baku yang cocok dengan pencarian Anda." : "Tekan tombol + Tambah Bahan untuk mencatat kain, benang, atau material konveksi."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filteredItems.map((bb) => {
            const isLowStock = bb.stok <= bb.minimalStok;
            return (
              <div
                key={bb.id}
                className={`bg-gradient-to-br from-white/[0.04] to-white/[0.01] border p-5 rounded-3xl transition-all duration-300 hover:shadow-lg relative group ${
                  isLowStock 
                    ? 'border-red-500/30 hover:border-red-500/50 shadow-md shadow-red-500/5' 
                    : 'border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                {/* Low Stock Warning Badge */}
                {isLowStock && (
                  <span className="absolute top-4 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isLowStock 
                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {isLowStock ? 'warning' : 'inventory_2'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-100 text-sm md:text-base truncate">{bb.nama}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Satuan: {bb.satuan}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-white/[0.04] py-3 text-xs">
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Stok Saat Ini</span>
                      <span className={`text-base font-black mt-0.5 block ${isLowStock ? 'text-red-400' : 'text-slate-200'}`}>
                        {bb.stok} {bb.satuan}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Batas Aman</span>
                      <span className="text-base font-bold text-slate-400 mt-0.5 block">
                        {bb.minimalStok} {bb.satuan}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge variant={isLowStock ? 'danger' : 'success'}>
                      {isLowStock ? 'Stok Kritis' : 'Aman'}
                    </Badge>

                    {/* Edit/Delete Actions */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(bb)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-cyan-400 transition-all flex items-center justify-center cursor-pointer"
                        title="Ubah Bahan"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(bb)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center cursor-pointer"
                        title="Hapus Bahan"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={editingItem ? 'Ubah Bahan Baku' : 'Tambah Bahan Baku Baru'}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Nama Bahan Baku</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Kain Katun Combed 30s Hitam"
                className="input-base"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Jumlah Stok</label>
                <input
                  type="number"
                  step="any"
                  value={stok}
                  onChange={(e) => setStok(e.target.value)}
                  placeholder="Contoh: 15"
                  className="input-base"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Batas Minimum</label>
                <input
                  type="number"
                  step="any"
                  value={minimalStok}
                  onChange={(e) => setMinimalStok(e.target.value)}
                  placeholder="Contoh: 20"
                  className="input-base"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Satuan</label>
              <select
                value={satuan}
                onChange={(e) => setSatuan(e.target.value)}
                className="input-base appearance-none"
                required
              >
                <option value="Roll" className="bg-slate-900 text-slate-200">Roll</option>
                <option value="Meter" className="bg-slate-900 text-slate-200">Meter</option>
                <option value="Yard" className="bg-slate-900 text-slate-200">Yard</option>
                <option value="Kg" className="bg-slate-900 text-slate-200">Kg (Kilogram)</option>
                <option value="Pcs" className="bg-slate-900 text-slate-200">Pcs (Keping)</option>
                <option value="Pack" className="bg-slate-900 text-slate-200">Pack</option>
                <option value="Gross" className="bg-slate-900 text-slate-200">Gross</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              {editingItem ? 'Simpan Perubahan' : 'Tambah Bahan Baku'}
            </button>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => { setShowConfirmDelete(false); setItemToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Hapus Bahan Baku"
        message={`Apakah Anda yakin ingin menghapus bahan baku "${itemToDelete?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="error"
      />
    </div>
  );
}
