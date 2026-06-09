import { useState, useEffect } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../context/AppContext';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';

export default function CustomerPortal() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { formatRupiah, showToast, getModel } = useHelpers();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  
  // Checkout simulator state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('select_method'); // 'select_method' | 'instructions' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-restore session from sessionStorage
  useEffect(() => {
    const savedCust = sessionStorage.getItem('customer-portal-session');
    if (savedCust) {
      setCurrentCustomer(JSON.parse(savedCust));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!phoneNumber) return;

    // Clean phone number format for matching
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    // Find customer by phone number
    const customer = (state.customers || []).find(c => {
      const cPhoneClean = (c.phone || '').replace(/[^0-9]/g, '');
      return cPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(cPhoneClean);
    });

    if (!customer) {
      showToast('Nomor telepon tidak terdaftar sebagai pelanggan!', 'error');
      return;
    }

    // Verify invoice number optionally or allow password-less entry
    if (invoiceNumber) {
      const matchedInvoice = (state.invoices || []).find(inv => 
        inv.customerId === customer.id && 
        inv.invoiceNumber.toLowerCase() === invoiceNumber.trim().toLowerCase()
      );
      if (!matchedInvoice) {
        showToast('Nomor invoice tidak cocok dengan pelanggan ini!', 'error');
        return;
      }
    }

    sessionStorage.setItem('customer-portal-session', JSON.stringify(customer));
    setCurrentCustomer(customer);
    setIsLoggedIn(true);
    showToast(`Selamat datang, ${customer.nama}!`, 'success');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('customer-portal-session');
    setCurrentCustomer(null);
    setIsLoggedIn(false);
    setSelectedInvoice(null);
  };

  // Get customer invoices
  const customerInvoices = isLoggedIn && currentCustomer
    ? (state.invoices || []).filter(inv => inv.customerId === currentCustomer.id)
    : [];

  // Find tracking links for customer's models
  const getTrackingJobsForInvoice = (invoice) => {
    // Find a model matching the invoice's product name
    const model = state.models.find(m => 
      m.nama.toLowerCase().includes(invoice.produk.toLowerCase()) ||
      invoice.produk.toLowerCase().includes(m.nama.toLowerCase())
    );
    if (!model) return null;

    // Find active tracking job matching that model
    const trackingJob = (state.trackingJobs || []).find(j => j.modelId === model.id && j.status !== 'Selesai');
    return trackingJob;
  };

  // Checkout actions
  const handleOpenCheckout = (inv) => {
    setSelectedInvoice(inv);
    setPaymentMethod('qris');
    setCheckoutStep('select_method');
  };

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutStep('instructions');
    }, 1200);
  };

  const simulateSuccess = () => {
    if (!selectedInvoice) return;

    dispatch({
      type: 'EDIT_INVOICE',
      payload: { id: selectedInvoice.id, status: 'Lunas' }
    });

    // Write audit log in AppContext
    dispatch({
      type: 'ADD_ADMIN_LOG',
      payload: {
        action: 'PEMBAYARAN_INLINE',
        details: `Simulasi Pembayaran Online sukses untuk Invoice ${selectedInvoice.invoiceNumber} sebesar ${formatRupiah(selectedInvoice.total)}`
      }
    });

    setCheckoutStep('success');
    showToast('Pembayaran berhasil dikonfirmasi!', 'success');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative px-4 overflow-hidden font-sans">
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-slate-950 to-cyan-950/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md animate-fade-in-up">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-cyan-500/30 rounded-3xl blur-xl opacity-60 pointer-events-none" />

          {/* Card */}
          <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/[0.08] p-8 rounded-3xl shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
                <span className="material-symbols-outlined text-white text-2xl filled">face</span>
              </div>
              <h2 className="text-2xl font-black font-display tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Portal Pelanggan</h2>
              <p className="text-xs text-slate-400 font-medium mt-1.5">Lacak Jahitan & Bayar Tagihan Konveksi</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Nomor WhatsApp Pelanggan</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="input-base"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Nomor Invoice (Opsional)</label>
                </div>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Contoh: INV-2026-001"
                  className="input-base font-semibold uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Masuk Portal
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative px-4 py-8 overflow-y-auto font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/10 via-slate-950 to-cyan-950/10 pointer-events-none" />

      <div className="relative w-full max-w-4xl mx-auto space-y-6">
        
        {/* Navbar */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] px-6 py-4 rounded-3xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
              <span className="material-symbols-outlined text-[18px]">face</span>
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-200">{currentCustomer.nama}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{currentCustomer.phone}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Keluar Portal
          </button>
        </div>

        {/* Customer invoices and trackings */}
        <div className="space-y-4">
          <h2 className="text-base font-black uppercase tracking-wider text-slate-200 px-1">Riwayat Tagihan & Progres Produksi</h2>

          {customerInvoices.length === 0 ? (
            <div className="bg-slate-900/40 border border-white/[0.06] rounded-3xl p-8 text-center">
              <EmptyState
                icon="description"
                title="Tidak Ada Tagihan"
                description="Anda saat ini tidak memiliki invoice tagihan yang terdaftar."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerInvoices.map((inv) => {
                const trackingJob = getTrackingJobsForInvoice(inv);
                return (
                  <div key={inv.id} className="bg-slate-900/80 border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4 hover:border-white/20 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{inv.invoiceNumber}</span>
                        <h3 className="text-sm font-bold text-slate-100 mt-1">{inv.produk}</h3>
                        <p className="text-xs text-slate-500 font-semibold mt-1">Tanggal: {inv.tanggal}</p>
                      </div>
                      <Badge variant={inv.status === 'Lunas' ? 'success' : inv.status === 'DP' ? 'primary' : 'danger'}>
                        {inv.status}
                      </Badge>
                    </div>

                    <div className="border-t border-b border-white/[0.04] py-3 grid grid-cols-2 gap-4 text-xs font-semibold">
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Jumlah Order</span>
                        <span className="text-slate-200 mt-0.5 block">{inv.qty} Pcs</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Total Tagihan</span>
                        <span className="text-cyan-400 mt-0.5 block font-black">{formatRupiah(inv.total)}</span>
                      </div>
                    </div>

                    {/* Progress tracking display */}
                    {trackingJob ? (
                      <div className="space-y-2 bg-slate-950/40 p-3 rounded-2xl border border-white/[0.04]">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span>Progres Jahit</span>
                          <span className="text-cyan-400">{trackingJob.progress}% Selesai</span>
                        </div>
                        <div className="w-full bg-slate-950 border border-white/[0.04] h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" style={{ width: `${trackingJob.progress}%` }} />
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[9px] text-slate-500 font-semibold">Tahap: {trackingJob.status}</span>
                          <a
                            href={`/tracking/${trackingJob.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300"
                          >
                            Lacak Jahitan &rarr;
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 italic">Antrean produksi belum dikoordinasikan oleh admin.</p>
                    )}

                    {/* Pay Button */}
                    {inv.status !== 'Lunas' && (
                      <button
                        onClick={() => handleOpenCheckout(inv)}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-xs hover:scale-[1.01] transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">payment</span>
                        Bayar Tagihan
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Checkout Simulator Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Pembayaran Online - ${selectedInvoice.invoiceNumber}`}
        >
          {checkoutStep === 'select_method' && (
            <div className="space-y-6">
              <div className="bg-slate-950/40 p-4 border border-white/[0.06] rounded-2xl text-xs font-semibold space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Pemesanan:</span>
                  <span className="text-slate-200 font-bold">{selectedInvoice.produk}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Jumlah:</span>
                  <span>{selectedInvoice.qty} pcs</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-100 border-t border-white/[0.04] pt-2 mt-2">
                  <span>Total Bayar:</span>
                  <span className="text-cyan-400">{formatRupiah(selectedInvoice.total)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'qris', name: 'QRIS (Gopay, OVO, ShopeePay)', icon: 'qr_code_2' },
                    { id: 'bca', name: 'BCA Virtual Account', icon: 'account_balance' },
                    { id: 'mandiri', name: 'Mandiri Virtual Account', icon: 'credit_card' }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod === method.id 
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold' 
                          : 'bg-slate-950/40 border-white/[0.04] text-slate-400 hover:bg-white/[0.02]'
                      }`}
                    >
                      <span className="material-symbols-outlined">{method.icon}</span>
                      <span className="text-xs">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    Memproses...
                  </>
                ) : (
                  'Lanjutkan Pembayaran'
                )}
              </button>
            </div>
          )}

          {checkoutStep === 'instructions' && (
            <div className="space-y-6 text-center">
              {paymentMethod === 'qris' ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scan Kode QRIS di Bawah Ini</h3>
                  <div className="bg-white p-3 rounded-2xl inline-block shadow-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160&160&data=${encodeURIComponent(`qris_payment_${selectedInvoice.invoiceNumber}_${selectedInvoice.total}`)}`}
                      alt="QRIS Code"
                      className="w-40 h-40"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold">Gunakan aplikasi e-wallet (GoPay, OVO, DANA) atau mobile banking Anda.</p>
                </div>
              ) : (
                <div className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-white/[0.06] text-left">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Nomor Virtual Account ({paymentMethod.toUpperCase()})</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-base font-black text-cyan-400 tracking-wider">8077708123456789</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase cursor-pointer hover:text-white" onClick={() => showToast('VA disalin!', 'success')}>Salin</span>
                    </div>
                  </div>
                  <div className="border-t border-white/[0.04] pt-3">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Nama Rekening</span>
                    <span className="text-xs font-bold text-slate-200 mt-0.5 block">Zenirastore Convection</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={simulateSuccess}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Simulasikan Pembayaran Sukses
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="w-full py-2 bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white rounded-2xl font-bold text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {checkoutStep === 'success' && (
            <div className="space-y-6 text-center py-6 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <span className="material-symbols-outlined text-[36px] filled">check_circle</span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100">Pembayaran Sukses!</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Pembayaran Anda telah berhasil diverifikasi secara otomatis. Invoice status telah berubah menjadi Lunas.</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-full py-3 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 hover:text-white rounded-2xl font-bold text-xs transition-all cursor-pointer"
              >
                Tutup Selesai
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
