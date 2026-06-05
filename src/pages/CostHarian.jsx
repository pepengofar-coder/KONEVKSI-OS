import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../context/AppContext';
import CostForm from '../components/forms/CostForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FAB from '../components/ui/FAB';
import EmptyState from '../components/ui/EmptyState';

export default function CostHarian() {
  const { costHarian, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const { formatRupiah, getTodayCost, getTodayString, showToast } = useHelpers();
  
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit / Delete states
  const [costToEdit, setCostToEdit] = useState(null);
  const [costToDelete, setCostToDelete] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const todayCost = getTodayCost();
  const totalToday = todayCost.reduce((s, c) => s + c.nominal, 0);
  const totalAll = costHarian.reduce((s, c) => s + c.nominal, 0);

  // Filter items
  const filteredCosts = costHarian.filter(c =>
    c.deskripsi.toLowerCase().includes(search.toLowerCase()) ||
    c.tanggal.includes(search)
  );

  // Pagination config
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCosts.length / itemsPerPage);
  const paginatedCosts = filteredCosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Group paginated items by date
  const grouped = {};
  paginatedCosts.forEach((c) => {
    if (!grouped[c.tanggal]) grouped[c.tanggal] = [];
    grouped[c.tanggal].push(c);
  });
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleEditClick = (c) => {
    setCostToEdit(c);
    setShowForm(true);
  };

  const handleDeleteClick = (c) => {
    setCostToDelete(c);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (costToDelete) {
      dispatch({ type: 'DELETE_COST', payload: costToDelete.id });
      showToast('Data pengeluaran berhasil dihapus!', 'success');
      setCostToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-white">
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">Cost Harian</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
          Pengeluaran operasional sehari-hari
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-purple-500/20 hover:border-purple-500/40 rounded-3xl p-5 relative overflow-hidden group transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/15 to-purple-500/0 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Hari Ini</p>
            <h2 className="text-lg md:text-xl font-black text-purple-400 mt-1">{formatRupiah(totalToday)}</h2>
            <p className="text-xs mt-1.5 text-slate-400 font-semibold">{todayCost.length} pengeluaran</p>
          </div>
          <span className="material-symbols-outlined absolute -right-1 -bottom-1 text-5xl opacity-[0.04] text-purple-400 transition-transform duration-500 group-hover:scale-110">today</span>
        </div>
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-cyan-500/20 hover:border-cyan-500/40 rounded-3xl p-5 relative overflow-hidden group transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/15 to-cyan-500/0 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total Semua</p>
            <h2 className="text-lg md:text-xl font-black text-cyan-400 mt-1">{formatRupiah(totalAll)}</h2>
            <p className="text-xs mt-1.5 text-slate-400 font-semibold">{costHarian.length} entri</p>
          </div>
          <span className="material-symbols-outlined absolute -right-1 -bottom-1 text-5xl opacity-[0.04] text-cyan-400 transition-transform duration-500 group-hover:scale-110">payments</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl">
        <div className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-500">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Cari deskripsi pengeluaran..."
            className="w-full bg-slate-950/40 border border-white/[0.06] text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          Menampilkan {filteredCosts.length} dari {costHarian.length} entri
        </div>
      </div>

      {dates.length === 0 ? (
        <EmptyState
          icon="payments"
          title="Tidak Ada Pengeluaran"
          description={search ? "Tidak ada pengeluaran yang cocok dengan pencarian." : "Catat pengeluaran operasional seperti beli benang, jarum, dll"}
        />
      ) : (
        <div className="space-y-6">
          {dates.map((date) => {
            const items = grouped[date];
            const dayTotal = items.reduce((s, c) => s + c.nominal, 0);
            const isToday = date === getTodayString();
            return (
              <div key={date} className="space-y-2">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{date}</p>
                    {isToday && (
                      <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest rounded-full">
                        Hari Ini
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-black text-purple-400">{formatRupiah(dayTotal)}</p>
                </div>
                <div className="space-y-2">
                  {items.map((c) => (
                    <div
                      key={c.id}
                      className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-white/[0.15] p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.06] hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[16px]">receipt</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-200">{c.deskripsi}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{c.tanggal}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-slate-200 text-sm">{formatRupiah(c.nominal)}</p>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(c)}
                            className="p-1 rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-cyan-400 transition-all"
                            title="Ubah"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                          </button>
                          {currentUser?.role === 'Owner' && (
                            <button
                              onClick={() => handleDeleteClick(c)}
                              className="p-1 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                              title="Hapus"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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

      <FAB onClick={() => { setCostToEdit(null); setShowForm(true); }} icon="add" label="Tambah Cost" />
      <CostForm isOpen={showForm} onClose={() => { setShowForm(false); setCostToEdit(null); }} costToEdit={costToEdit} />
      
      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Cost Harian"
        message="Apakah Anda yakin ingin menghapus data pengeluaran operasional ini?"
        confirmText="Hapus"
        variant="error"
      />
    </div>
  );
}
