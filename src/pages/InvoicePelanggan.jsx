import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../context/AppContext';
import InvoicePelangganForm from '../components/forms/InvoicePelangganForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

export default function InvoicePelanggan() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { getCustomer, formatRupiah, showToast } = useHelpers();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  
  // Invoice Viewer State
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const invoices = state.invoices || [];
  const business = state.currentUser?.businessProfile || {
    namaUsaha: 'Konveksi OS',
    telepon: '',
    email: '',
    alamat: ''
  };

  // Filtered invoices
  const filtered = invoices.filter(i => {
    const cust = getCustomer(i.customerId);
    const matchesSearch = 
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.produk.toLowerCase().includes(search.toLowerCase()) ||
      (cust && cust.nama.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'Semua' || i.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Smart pagination with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const handleEdit = (invoice, e) => {
    e.stopPropagation();
    setInvoiceToEdit(invoice);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (invoice, e) => {
    e.stopPropagation();
    setInvoiceToDelete(invoice);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (invoiceToDelete) {
      dispatch({ type: 'DELETE_INVOICE', payload: invoiceToDelete.id });
      showToast(`Invoice ${invoiceToDelete.invoiceNumber} berhasil dihapus!`, 'success');
      setInvoiceToDelete(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = (invoice) => {
    const cust = getCustomer(invoice.customerId);
    if (!cust || !cust.phone) {
      showToast('Klien tidak memiliki nomor WhatsApp!', 'error');
      return;
    }
    
    const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    
    const message = `Halo ${cust.nama}, berikut adalah tagihan pemesanan Anda di *${business.namaUsaha}*:

*No. Invoice:* ${invoice.invoiceNumber}
*Produk:* ${invoice.produk}
*Jumlah:* ${invoice.qty} Pcs
*Total Tagihan:* ${formatRupiah(invoice.total)}
*Status:* ${invoice.status === 'Lunas' ? 'LUNAS ✅' : invoice.status === 'DP' ? 'DP (Uang Muka) 🕒' : 'BELUM BAYAR ❌'}

Silakan lakukan pembayaran ke rekening kami atau hubungi kami untuk informasi lebih lanjut. Terima kasih!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneWithCountry}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Print CSS Inject */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          aside, nav, header, button, .no-print, .toast-container {
            display: none !important;
          }
          body, main, .pattern-bg, .max-w-5xl {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-full-card {
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            position: absolute;
            left: 0;
            top: 0;
            z-index: 9999;
          }
          .print-text-slate-900 { color: #0f172a !important; }
          .print-text-slate-600 { color: #475569 !important; }
          .print-border-slate-200 { border-color: #e2e8f0 !important; }
          .print-bg-slate-50 { background-color: #f8fafc !important; }
        }
      `}} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Invoice Pelanggan</h1>
          <p className="text-xs text-slate-400 mt-1">Buat, kelola, cetak tagihan, dan bagikan invoice ke klien melalui WhatsApp.</p>
        </div>
        <button
          onClick={() => { setInvoiceToEdit(null); setIsFormOpen(true); }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg"
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          Buat Invoice
        </button>
      </div>

      {/* Search and Filter Area */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl no-print">
        <div className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-500">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Cari nomor invoice, produk, atau nama pelanggan..."
            className="w-full bg-slate-950/40 border border-white/[0.06] text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto scroll-x-auto">
          {['Semua', 'Lunas', 'DP', 'Belum Bayar'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-lg'
                  : 'bg-slate-950/40 border-white/[0.06] text-slate-400 hover:bg-white/[0.02]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      {paginated.length === 0 ? (
        <div className="no-print">
          <EmptyState
            icon="description"
            title="Invoice Tidak Ditemukan"
            description="Tidak ada data invoice yang sesuai dengan pencarian atau filter Anda."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
          {paginated.map((invoice) => {
            const customer = getCustomer(invoice.customerId);
            return (
              <div
                key={invoice.id}
                onClick={() => setSelectedInvoice(invoice)}
                className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.04] transition-all group duration-300 cursor-pointer relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-cyan-400 tracking-wider uppercase block">{invoice.invoiceNumber}</span>
                    <h3 className="text-sm font-bold text-slate-100 mt-1">{invoice.produk}</h3>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">person</span>
                      {customer ? customer.nama : 'Pelanggan tidak ditemukan'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      status={
                        invoice.status === 'Lunas' ? 'success' :
                        invoice.status === 'DP' ? 'primary' : 'danger'
                      }
                    >
                      {invoice.status}
                    </Badge>
                    <span className="text-[10px] text-slate-500 font-semibold">{invoice.tanggal}</span>
                  </div>
                </div>

                <div className="border-t border-white/[0.04] mt-4 pt-4 flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Total Tagihan</span>
                    <span className="text-sm font-black text-slate-100 mt-0.5 block">{formatRupiah(invoice.total)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-65 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEdit(invoice, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-cyan-400 transition-all"
                      title="Ubah data"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    {state.currentUser?.role === 'Owner' && (
                      <button
                        onClick={(e) => handleDeleteClick(invoice, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                        title="Hapus data"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                    {customer?.phone && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleWhatsAppShare(invoice); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
                        title="Kirim ke WhatsApp"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 no-print">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-white/[0.06] bg-slate-900/60 hover:bg-white/[0.04] disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
          
          {getPageNumbers().map((page, idx) => (
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-xs text-slate-500 font-bold">…</span>
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

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h2 className="text-base font-bold text-slate-100">Pratinjau Invoice</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleWhatsAppShare(selectedInvoice)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  WhatsApp
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Cetak PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Invoice Printable Sheet */}
            <div className="bg-slate-950 p-6 md:p-8 rounded-2xl border border-white/[0.06] text-slate-300 print-full-card font-sans">
              <div className="flex flex-col md:flex-row justify-between gap-6 border-b print-border-slate-200 border-white/[0.06] pb-6">
                <div>
                  <h3 className="text-xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent print-text-slate-900 leading-none">{business.namaUsaha}</h3>
                  <p className="text-xs text-slate-400 print-text-slate-600 mt-2 max-w-xs leading-relaxed">{business.alamat || 'Alamat belum diatur di menu profil.'}</p>
                  {business.telepon && (
                    <p className="text-[11px] text-slate-500 print-text-slate-600 mt-1">Telp: {business.telepon}</p>
                  )}
                  {business.email && (
                    <p className="text-[11px] text-slate-500 print-text-slate-600">Email: {business.email}</p>
                  )}
                </div>
                <div className="md:text-right">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Invoice</span>
                  <h4 className="text-base font-black text-slate-100 print-text-slate-900 mt-1">{selectedInvoice.invoiceNumber}</h4>
                  <p className="text-xs text-slate-400 print-text-slate-600 mt-2">Tanggal: {selectedInvoice.tanggal}</p>
                  <div className="mt-2.5 inline-block">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                      selectedInvoice.status === 'Lunas' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      selectedInvoice.status === 'DP' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 block">Ditagihkan Kepada:</span>
                {(() => {
                  const c = getCustomer(selectedInvoice.customerId);
                  return c ? (
                    <div className="mt-2 text-xs">
                      <p className="font-bold text-slate-200 print-text-slate-900 text-sm">{c.nama}</p>
                      {c.phone && <p className="text-slate-400 print-text-slate-600 mt-1">Telp: {c.phone}</p>}
                      {c.alamat && <p className="text-slate-400 print-text-slate-600 mt-0.5 leading-relaxed max-w-xs">{c.alamat}</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic mt-1">Detail pelanggan tidak ditemukan</p>
                  );
                })()}
              </div>

              {/* Items Table */}
              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[400px]">
                  <thead>
                    <tr className="border-b print-border-slate-200 border-white/[0.06] text-slate-500 font-bold">
                      <th className="py-2.5">Deskripsi Produk/Jasa</th>
                      <th className="py-2.5 text-center">Jumlah</th>
                      <th className="py-2.5 text-right">Harga Satuan</th>
                      <th className="py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b print-border-slate-200 border-white/[0.04] text-slate-200 print-text-slate-900 font-medium">
                      <td className="py-3.5 font-semibold">{selectedInvoice.produk}</td>
                      <td className="py-3.5 text-center font-bold">{selectedInvoice.qty} Pcs</td>
                      <td className="py-3.5 text-right">{formatRupiah(selectedInvoice.harga)}</td>
                      <td className="py-3.5 text-right font-bold">{formatRupiah(selectedInvoice.qty * selectedInvoice.harga)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary Calculation */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                {/* QR Code Container */}
                <div className="flex items-center gap-4 border border-white/[0.04] print-border-slate-200 rounded-xl p-3 bg-white/[0.01] print-bg-slate-50">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80&80&data=${encodeURIComponent(`Invoice:${selectedInvoice.invoiceNumber}\nTotal:${formatRupiah(selectedInvoice.total)}\nStatus:${selectedInvoice.status}`)}`}
                    alt="QR Code Invoice Info"
                    className="w-16 h-16 rounded bg-white p-1"
                  />
                  <div className="text-[10px] text-slate-500 print-text-slate-600 leading-normal font-semibold">
                    <p className="font-bold text-slate-300 print-text-slate-900">QR Code Informasi Tagihan</p>
                    <p className="mt-1">Pindai kode QR untuk memvalidasi nomor dan keaslian invoice ini.</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-semibold text-right">
                  <div className="flex justify-between text-slate-400 print-text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatRupiah(selectedInvoice.qty * selectedInvoice.harga)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>Diskon:</span>
                      <span>- {formatRupiah(selectedInvoice.discount)}</span>
                    </div>
                  )}
                  {selectedInvoice.tax > 0 && (
                    <div className="flex justify-between text-purple-400">
                      <span>Pajak ({selectedInvoice.tax}%):</span>
                      <span>+ {formatRupiah(Math.round(((selectedInvoice.qty * selectedInvoice.harga) - (selectedInvoice.discount || 0)) * (selectedInvoice.tax / 100)))}</span>
                    </div>
                  )}
                  {selectedInvoice.shipping > 0 && (
                    <div className="flex justify-between text-cyan-400">
                      <span>Ongkir:</span>
                      <span>+ {formatRupiah(selectedInvoice.shipping)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-100 print-text-slate-900 border-t print-border-slate-200 border-white/[0.06] pt-2 mt-2">
                    <span>Total Tagihan:</span>
                    <span className="text-cyan-400 print-text-slate-900">{formatRupiah(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <InvoicePelangganForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        invoiceToEdit={invoiceToEdit}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Invoice"
        message={invoiceToDelete ? `Apakah Anda yakin ingin menghapus invoice "${invoiceToDelete.invoiceNumber}"? Tindakan ini akan menghapus data penjualan secara permanen.` : ''}
        confirmText="Hapus"
        cancelText="Batal"
        variant="error"
      />
    </div>
  );
}
