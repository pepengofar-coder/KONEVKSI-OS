import { useState, useMemo } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../context/AppContext';
import CustomerForm from '../components/forms/CustomerForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';

export default function Customers() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useHelpers();

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const customers = state.customers || [];
  const invoices = state.invoices || [];

  // Filtered customers
  const filtered = customers.filter(c => 
    c.nama.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search)) ||
    (c.alamat && c.alamat.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination config
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Ellipsis pagination - max 5 visible pages
  const paginationPages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  const getCustomerStats = (customerId) => {
    const custInvs = invoices.filter(inv => inv.customerId === customerId);
    const totalOrder = custInvs.length;
    const totalSales = custInvs.reduce((sum, inv) => sum + (inv.total || 0), 0);
    return { totalOrder, totalSales };
  };

  const handleEdit = (customer) => {
    setCustomerToEdit(customer);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (customerToDelete) {
      dispatch({ type: 'DELETE_CUSTOMER', payload: customerToDelete.id });
      showToast(`Pelanggan ${customerToDelete.nama} berhasil dihapus!`, 'success');
      setCustomerToDelete(null);
    }
  };

  const handleAddClick = () => {
    setCustomerToEdit(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Daftar Pelanggan</h1>
          <p className="text-xs text-slate-400 mt-1">Kelola data klien konveksi Anda dan pantau riwayat pemesanan mereka.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/20 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Tambah Pelanggan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <span className="material-symbols-outlined text-[18px]">groups</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total Pelanggan</p>
          <p className="text-2xl font-black text-slate-100 mt-2">{customers.length}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <span className="material-symbols-outlined text-[18px]">description</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Jumlah Invoice Penjualan</p>
          <p className="text-2xl font-black text-slate-100 mt-2">{invoices.length}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-[18px]">payments</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total Transaksi Penjualan</p>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            Rp {invoices.reduce((sum, inv) => sum + (inv.total || 0), 0).toLocaleString('id-ID')}
          </p>
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
            placeholder="Cari nama, no. telepon, atau alamat pelanggan..."
            className="w-full bg-slate-950/40 border border-white/[0.06] text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          Menampilkan {filtered.length} dari {customers.length} pelanggan
        </div>
      </div>

      {/* Customer List */}
      {paginated.length === 0 ? (
        <EmptyState
          icon="groups"
          title="Pelanggan Tidak Ditemukan"
          description={search ? "Tidak ada pelanggan yang cocok dengan pencarian Anda." : "Anda belum menambahkan data pelanggan."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginated.map((customer) => {
            const stats = getCustomerStats(customer.id);
            return (
              <div
                key={customer.id}
                className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl hover:bg-white/[0.04] transition-all group duration-300"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                      {customer.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{customer.nama}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">phone</span>
                        {customer.phone || '-'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-65 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-cyan-400 transition-all"
                      title="Ubah data"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    {state.currentUser?.role === 'Owner' && (
                      <button
                        onClick={() => handleDeleteClick(customer)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                        title="Hapus data"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {customer.alamat && (
                  <p className="text-xs text-slate-400 bg-slate-950/20 rounded-xl p-3 border border-white/[0.03] mt-4 leading-relaxed">
                    {customer.alamat}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 border-t border-white/[0.04] mt-4 pt-4 text-xs font-semibold">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Jumlah Order</span>
                    <span className="text-slate-300 mt-1 block">{stats.totalOrder} Pesanan</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Total Belanja</span>
                    <span className="text-emerald-400 mt-1 block">Rp {stats.totalSales.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination with ellipsis */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-white/[0.06] bg-slate-900/60 hover:bg-white/[0.04] disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
          
          {paginationPages.map((page, idx) => (
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-500 text-xs font-bold">
                ···
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border ${
                  currentPage === page
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-lg'
                    : 'bg-slate-900/60 border-white/[0.06] text-slate-400 hover:bg-white/[0.02]'
                }`}
              >
                {page}
              </button>
            )
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

      {/* Form Modal */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        customerToEdit={customerToEdit}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Pelanggan"
        message={customerToDelete ? `Apakah Anda yakin ingin menghapus pelanggan "${customerToDelete.nama}"? Tindakan ini tidak dapat dibatalkan.` : ''}
        confirmText="Hapus"
        cancelText="Batal"
        variant="error"
      />
    </div>
  );
}
