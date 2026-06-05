import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../context/AppContext';
import KasbonForm from '../components/forms/KasbonForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';
import FAB from '../components/ui/FAB';
import EmptyState from '../components/ui/EmptyState';

export default function Kasbon() {
  const { kasbon, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const { getTaylor, formatRupiah, showToast } = useHelpers();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Belum Lunas'); // Semua, Belum Lunas, Lunas
  const [currentPage, setCurrentPage] = useState(1);

  // Edit / Delete states
  const [kbToEdit, setKbToEdit] = useState(null);
  const [kbToDelete, setKbToDelete] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const totalBelumLunas = kasbon.filter(kb => !kb.lunas).reduce((s, kb) => s + kb.nominal, 0);

  // Filtered items
  const filteredKasbon = kasbon.filter(kb => {
    const taylor = getTaylor(kb.taylorId);
    const matchesSearch =
      (taylor && taylor.nama.toLowerCase().includes(search.toLowerCase())) ||
      (kb.catatan && kb.catatan.toLowerCase().includes(search.toLowerCase()));

    let matchesStatus = true;
    if (statusFilter === 'Belum Lunas') {
      matchesStatus = !kb.lunas;
    } else if (statusFilter === 'Lunas') {
      matchesStatus = kb.lunas;
    }

    return matchesSearch && matchesStatus;
  });

  // Pagination config
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredKasbon.length / itemsPerPage);
  const paginatedKasbon = filteredKasbon.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEditClick = (kb) => {
    setKbToEdit(kb);
    setShowForm(true);
  };

  const handleDeleteClick = (kb) => {
    setKbToDelete(kb);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (kbToDelete) {
      dispatch({ type: 'DELETE_KASBON', payload: kbToDelete.id });
      showToast('Data kasbon berhasil dihapus!', 'success');
      setKbToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-white">
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">Kasbon Taylor</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
          Pencatatan pinjaman taylor
        </p>
      </div>

      {/* Total kasbon */}
      <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-3xl p-5 md:p-6 text-slate-100 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500 z-10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/15 to-amber-500/0 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total Kasbon Belum Lunas</p>
          <h2 className="text-3xl font-black mt-1 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{formatRupiah(totalBelumLunas)}</h2>
          <p className="text-xs mt-1.5 text-slate-400 font-medium">{kasbon.filter(kb => !kb.lunas).length} kasbon aktif</p>
        </div>
        <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-7xl opacity-[0.04] text-amber-400 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-[0.06]">
          account_balance_wallet
        </span>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl">
        <div className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-500">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Cari nama taylor atau catatan kasbon..."
            className="w-full bg-slate-950/40 border border-white/[0.06] text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto scroll-x-auto pb-1 md:pb-0">
          {[
            { id: 'Semua', label: 'Semua' },
            { id: 'Belum Lunas', label: 'Belum Lunas' },
            { id: 'Lunas', label: 'Lunas' }
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

      {paginatedKasbon.length === 0 ? (
        <EmptyState
          icon="account_balance_wallet"
          title="Kasbon Tidak Ditemukan"
          description={search || statusFilter !== 'Semua' ? "Tidak ada kasbon yang sesuai dengan filter Anda." : "Catat jika taylor meminjam uang"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedKasbon.map((kb) => {
            const taylor = getTaylor(kb.taylorId);
            return (
              <div
                key={kb.id}
                className={`bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-white/[0.15] p-5 rounded-2xl flex items-center justify-between hover:bg-white/[0.05] transition-all duration-300 group relative ${
                  kb.lunas ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    kb.lunas ? 'bg-white/[0.02] border-white/[0.06] text-slate-500' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {kb.lunas ? 'check' : 'schedule'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">{taylor?.nama}</span>
                      <Badge variant={kb.lunas ? 'success' : 'warning'}>
                        {kb.lunas ? 'Lunas' : 'Aktif'}
                      </Badge>
                    </div>
                    <p className="font-black text-slate-100 text-base mt-1">{formatRupiah(kb.nominal)}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[12px]">calendar_month</span>
                      {kb.tanggal}
                      {kb.catatan && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[120px] text-slate-400 font-medium">{kb.catatan}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditClick(kb)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-cyan-400 transition-all"
                    title="Ubah"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  {currentUser?.role === 'Owner' && (
                    <button
                      onClick={() => handleDeleteClick(kb)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
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

      <FAB onClick={() => { setKbToEdit(null); setShowForm(true); }} icon="add" label="Kasbon" />
      <KasbonForm isOpen={showForm} onClose={() => { setShowForm(false); setKbToEdit(null); }} kasbonToEdit={kbToEdit} />
      
      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kasbon Taylor"
        message="Apakah Anda yakin ingin menghapus data catatan kasbon ini?"
        confirmText="Hapus"
        variant="error"
      />
    </div>
  );
}
