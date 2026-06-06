import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../context/AppContext';
import BarangMasukForm from '../components/forms/BarangMasukForm';
import DistribusiForm from '../components/forms/DistribusiForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

export default function BarangMasuk() {
  const { barangMasuk, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const { getModel, formatRupiah, showToast } = useHelpers();
  
  const [showForm, setShowForm] = useState(false);
  const [showDistribusi, setShowDistribusi] = useState(false);
  
  // Search, Filter, Pagination state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit / Delete states
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Filter items
  const filteredItems = barangMasuk.filter(bm => {
    const model = getModel(bm.modelId);
    const matchesSearch = 
      (model && model.nama.toLowerCase().includes(search.toLowerCase())) ||
      (bm.catatan && bm.catatan.toLowerCase().includes(search.toLowerCase()));

    let matchesStatus = true;
    if (statusFilter === 'Belum') {
      matchesStatus = bm.sisaBelumDistribusi === bm.jumlah;
    } else if (statusFilter === 'Sebagian') {
      matchesStatus = bm.sisaBelumDistribusi > 0 && bm.sisaBelumDistribusi < bm.jumlah;
    } else if (statusFilter === 'Selesai') {
      matchesStatus = bm.sisaBelumDistribusi === 0;
    }

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEditClick = (bm) => {
    setItemToEdit(bm);
    setShowForm(true);
  };

  const handleDeleteClick = (bm) => {
    setItemToDelete(bm);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      dispatch({ type: 'DELETE_BARANG_MASUK', payload: itemToDelete.id });
      showToast('Data barang masuk berhasil dihapus!', 'success');
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">Barang Masuk</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            {barangMasuk.length} entri tercatat
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => { setItemToEdit(null); setShowForm(true); }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Barang Masuk
          </button>
          <button
            onClick={() => setShowDistribusi(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 hover:text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-98"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
            Distribusi
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl">
        <div className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-500">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Cari model baju atau catatan..."
            className="w-full bg-slate-950/40 border border-white/[0.06] text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto scroll-x-auto pb-1 md:pb-0">
          {[
            { id: 'Semua', label: 'Semua' },
            { id: 'Belum', label: 'Belum Distribusi' },
            { id: 'Sebagian', label: 'Sebagian' },
            { id: 'Selesai', label: 'Terdistribusi' }
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => { setStatusFilter(status.id); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border whitespace-nowrap ${
                statusFilter === status.id
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-lg'
                  : 'bg-slate-950/40 border-white/[0.06] text-slate-400 hover:bg-white/[0.02]'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {paginatedItems.length === 0 ? (
        <EmptyState
          icon="inventory_2"
          title="Tidak Ada Barang Masuk"
          description={search || statusFilter !== 'Semua' ? "Tidak ada hasil yang sesuai dengan filter Anda." : "Tekan tombol + untuk menambahkan bahan/kain yang masuk"}
        />
      ) : (
        <div className="space-y-3 stagger-children">
          {paginatedItems.map((bm) => {
            const model = getModel(bm.modelId);
            const pctDistributed = model ? ((bm.jumlah - bm.sisaBelumDistribusi) / bm.jumlah) * 100 : 0;
            return (
              <div
                key={bm.id}
                className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-white/[0.15] p-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group"
              >
                <div className="flex flex-col gap-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">checkroom</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-200 text-sm md:text-base">{model?.nama || 'Model'}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{bm.tanggal}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={bm.sisaBelumDistribusi === 0 ? 'success' : bm.sisaBelumDistribusi < bm.jumlah ? 'primary' : 'default'}>
                        {bm.sisaBelumDistribusi === 0 ? 'Terdistribusi' : `Sisa ${bm.sisaBelumDistribusi}`}
                      </Badge>
                      
                      {/* Action buttons in flow */}
                      <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(bm)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-cyan-400 transition-all flex items-center justify-center"
                          title="Ubah data"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        {currentUser?.role === 'Owner' && (
                          <button
                            onClick={() => handleDeleteClick(bm)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center"
                            title="Hapus data"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Total</p>
                        <p className="font-bold text-slate-200">{bm.jumlah} pcs</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Ongkos</p>
                        <p className="font-bold text-purple-400">{formatRupiah(model?.hargaJahit || 0)}/pcs</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="w-full bg-slate-950/60 border border-white/[0.04] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${pctDistributed}%` }}
                      />
                    </div>
                  </div>

                  {bm.catatan && (
                    <p className="text-xs text-slate-400 italic font-medium">Catatan: {bm.catatan}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-white/[0.06] bg-slate-900/60 hover:bg-white/[0.04] disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
          
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border ${
                currentPage === idx + 1
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-lg'
                  : 'bg-slate-900/60 border-white/[0.06] text-slate-400 hover:bg-white/[0.02]'
              }`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-white/[0.06] bg-slate-900/60 hover:bg-white/[0.04] disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      )}

      <BarangMasukForm isOpen={showForm} onClose={() => { setShowForm(false); setItemToEdit(null); }} barangMasukToEdit={itemToEdit} />
      <DistribusiForm isOpen={showDistribusi} onClose={() => setShowDistribusi(false)} />
      
      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Barang Masuk"
        message="Apakah Anda yakin ingin menghapus data barang masuk ini? Distribusi terkait akan disesuaikan."
        confirmText="Hapus"
        variant="error"
      />
    </div>
  );
}
