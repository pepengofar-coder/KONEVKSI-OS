import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../context/AppContext';
import KelaranForm from '../components/forms/KelaranForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FAB from '../components/ui/FAB';
import EmptyState from '../components/ui/EmptyState';

export default function Kelaran() {
  const { kelaran, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const { getModel, getTaylor, formatRupiah, showToast } = useHelpers();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit / Delete states
  const [kToEdit, setKToEdit] = useState(null);
  const [kToDelete, setKToDelete] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Filter items
  const filteredKelaran = kelaran.filter(k => {
    const model = getModel(k.modelId);
    const taylor = getTaylor(k.taylorId);
    return (
      (model && model.nama.toLowerCase().includes(search.toLowerCase())) ||
      (taylor && taylor.nama.toLowerCase().includes(search.toLowerCase())) ||
      k.tanggal.includes(search)
    );
  });

  // Pagination config
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredKelaran.length / itemsPerPage);
  const paginatedKelaran = filteredKelaran.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Group paginated items by date
  const grouped = {};
  paginatedKelaran.forEach((k) => {
    if (!grouped[k.tanggal]) grouped[k.tanggal] = [];
    grouped[k.tanggal].push(k);
  });
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleEditClick = (k) => {
    setKToEdit(k);
    setShowForm(true);
  };

  const handleDeleteClick = (k) => {
    setKToDelete(k);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (kToDelete) {
      dispatch({ type: 'DELETE_KELARAN', payload: kToDelete.id });
      showToast('Data kelaran berhasil dihapus!', 'success');
      setKToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-white">
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">Kelaran</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
          Barang jadi yang sudah disetor taylor
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-3xl p-5 md:p-6 text-slate-100 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/15 to-cyan-500/0 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total Kelaran</p>
          <h2 className="text-3xl font-black mt-1 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{kelaran.reduce((s, k) => s + k.jumlah, 0)} pcs</h2>
          <p className="text-xs mt-1.5 text-slate-400 font-medium">{kelaran.length} entri tercatat</p>
        </div>
        <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-7xl opacity-[0.04] text-purple-400 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-[0.06]">
          check_circle
        </span>
      </div>

      {/* Search Bar */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl">
        <div className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-500">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Cari model jahit atau nama taylor..."
            className="w-full bg-slate-950/40 border border-white/[0.06] text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          Menampilkan {filteredKelaran.length} dari {kelaran.length} entri
        </div>
      </div>

      {dates.length === 0 ? (
        <EmptyState
          icon="check_circle"
          title="Kelaran Tidak Ditemukan"
          description={search ? "Tidak ada kelaran yang cocok dengan pencarian Anda." : "Catat hasil jahitan taylor yang sudah selesai"}
        />
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <div key={date} className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">{date}</p>
              <div className="space-y-2">
                {grouped[date].map((k) => {
                  const model = getModel(k.modelId);
                  const taylor = getTaylor(k.taylorId);
                  return (
                    <div
                      key={k.id}
                      className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-white/[0.15] p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.06] hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px] filled">check_circle</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm">{model?.nama}</h4>
                          <p className="text-xs text-slate-400 font-medium">{taylor?.nama}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-black text-cyan-400">{k.jumlah} pcs</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{formatRupiah((model?.hargaJahit || 0) * k.jumlah)}</p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(k)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-cyan-400 transition-all"
                            title="Ubah"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          {currentUser?.role === 'Owner' && (
                            <button
                              onClick={() => handleDeleteClick(k)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                              title="Hapus"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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

      <FAB onClick={() => { setKToEdit(null); setShowForm(true); }} icon="check_circle" label="Catat Kelaran" />
      <KelaranForm isOpen={showForm} onClose={() => { setShowForm(false); setKToEdit(null); }} kelaranToEdit={kToEdit} />
      
      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kelaran Taylor"
        message="Apakah Anda yakin ingin menghapus data kelaran ini? Sisa barang on progress taylor akan bertambah kembali secara otomatis."
        confirmText="Hapus"
        variant="error"
      />
    </div>
  );
}
