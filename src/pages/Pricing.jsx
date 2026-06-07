import { useState, useEffect } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../context/AppContext';
import Badge from '../components/ui/Badge';

export default function Pricing() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { formatRupiah, showToast } = useHelpers();

  const currentPlan = state.currentUser?.plan || 'FREE';
  const planExpiresAt = state.currentUser?.planExpiresAt || null;
  const currentUserId = state.currentUser?.id;

  const [isYearly, setIsYearly] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState(null); // 'PREMIUM' or 'BUSINESS'
  const [paymentGateway, setPaymentGateway] = useState('midtrans'); // 'midtrans', 'stripe', 'paypal', 'manual'
  const [paymentMethod, setPaymentMethod] = useState('gopay'); // 'gopay', 'va', 'cc'
  const [ccNumber, setCcNumber] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');
  const [ccCvc, setCcCvc] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);

  // Manual payment state
  const [paymentProof, setPaymentProof] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const bankSettings = state.saasSettings || {
    activePaymentOption: 'seabank',
    seabankNumber: '131-00-153482-9',
    seabankName: 'a.n. Zenirastrore Convection',
    jagoNumber: '781-0539-281',
    jagoName: 'a.n. Zenirastrore Convection',
    gopayNumber: '081234567890',
    gopayName: 'a.n. Zenirastrore Convection',
    freePrice: '0',
    premiumPrice: '99000',
    businessPrice: '199000',
    premiumActive: true,
    businessActive: true,
    freeActive: true,
    autoApprove: false,
    trialDays: '7',
    gracePeriodDays: '3',
  };

  const pendingOrder = (state.paymentOrders || []).find(
    (o) => o.userId === currentUserId && o.status === 'PENDING'
  );
  const rejectedOrder = (state.paymentOrders || []).find(
    (o) => o.userId === currentUserId && o.status === 'REJECTED'
  );

  const getPlanPrice = (plan) => {
    const basePrice = plan === 'PREMIUM'
      ? parseInt(bankSettings.premiumPrice || 0, 10)
      : plan === 'BUSINESS'
      ? parseInt(bankSettings.businessPrice || 0, 10)
      : parseInt(bankSettings.freePrice || 0, 10);
    return isYearly ? basePrice * 12 * 0.8 : basePrice;
  };

  // Fetch billing history for this user
  useEffect(() => {
    if (currentUserId) {
      const saved = localStorage.getItem(`konveksi-os-billing-${currentUserId}`);
      if (saved) {
        setBillingHistory(JSON.parse(saved));
      } else {
        setBillingHistory([]);
      }
    }
  }, [currentUserId]);

  const saveBillingHistory = (newHistory) => {
    setBillingHistory(newHistory);
    localStorage.setItem(`konveksi-os-billing-${currentUserId}`, JSON.stringify(newHistory));
  };

  const handleOpenCheckout = (plan) => {
    if (plan === currentPlan) {
      showToast(`Anda sudah menggunakan rencana ${plan}!`, 'info');
      return;
    }
    if (plan === 'FREE') {
      dispatch({
        type: 'UPGRADE_PLAN',
        payload: {
          plan: 'FREE',
          planExpiresAt: null
        }
      });
      showToast('Rencana subscription dikembalikan ke FREE.', 'info');
      return;
    }

    const message = `Hello, I want to upgrade to ${plan} plan.`;
    const waUrl = `https://wa.me/6285951621496?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran file bukti transfer tidak boleh lebih dari 2MB!', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProof(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitManualProof = () => {
    if (!paymentProof) {
      showToast('Harap unggah bukti transfer pembayaran Anda!', 'error');
      return;
    }

    setIsSubmittingProof(true);

    setTimeout(() => {
      const price = getPlanPrice(checkoutPlan);

      // Check if autoApprove is enabled in settings
      if (bankSettings.autoApprove) {
        // Automatically approve payment
        const expDate = new Date();
        if (isYearly) {
          expDate.setFullYear(expDate.getFullYear() + 1);
        } else {
          expDate.setMonth(expDate.getMonth() + 1);
        }
        dispatch({
          type: 'UPGRADE_PLAN',
          payload: {
            plan: checkoutPlan,
            planExpiresAt: expDate.toISOString().split('T')[0]
          }
        });
        showToast(`Upgrade otomatis ke rencana ${checkoutPlan} berhasil (Mode Sandbox)!`, 'success');
      } else {
        // Submit to admin queue
        dispatch({
          type: 'SUBMIT_PAYMENT_ORDER',
          payload: {
            plan: checkoutPlan,
            price: price,
            paymentMethod: 'Transfer Manual',
            paymentProof: paymentProof
          }
        });
        showToast('Bukti transfer berhasil dikirim. Menunggu verifikasi admin!', 'success');
      }

      setIsSubmittingProof(false);
      setCheckoutPlan(null);
      setPaymentProof('');
    }, 1500);
  };

  const handleSimulatePayment = () => {
    if (paymentGateway === 'manual') {
      handleSubmitManualProof();
      return;
    }

    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);

      const price = getPlanPrice(checkoutPlan);

      const expDate = new Date();
      if (isYearly) {
        expDate.setFullYear(expDate.getFullYear() + 1);
      } else {
        expDate.setMonth(expDate.getMonth() + 1);
      }

      const invNum = `SUB-${Date.now().toString(36).toUpperCase()}`;
      const newInvoice = {
        invoiceNumber: invNum,
        plan: checkoutPlan,
        nominal: price,
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        expiredAt: expDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        billingCycle: isYearly ? 'Tahunan' : 'Bulanan',
        gateway: paymentGateway.toUpperCase(),
        status: 'SUKSES'
      };

      // Update state
      dispatch({
        type: 'UPGRADE_PLAN',
        payload: {
          plan: checkoutPlan,
          planExpiresAt: expDate.toISOString().split('T')[0]
        }
      });

      // Save to billing history
      saveBillingHistory([newInvoice, ...billingHistory]);
      setReceiptInvoice(newInvoice);
      showToast(`Upgrade ke rencana ${checkoutPlan} berhasil!`, 'success');
    }, 2000);
  };

  const handleDowngradeToFree = () => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan subscription dan kembali ke FREE plan?')) {
      dispatch({
        type: 'UPGRADE_PLAN',
        payload: {
          plan: 'FREE',
          planExpiresAt: null
        }
      });
      showToast('Rencana subscription dibatalkan.', 'info');
    }
  };

  return (
    <div className="space-y-8 text-white animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Subscription & Rencana</h1>
        <p className="text-xs text-slate-400 mt-1">Buka seluruh kapabilitas Konveksi OS untuk performa bisnis terbaik Anda.</p>
      </div>

      {/* Upgrade Pending Banner */}
      {pendingOrder && (
        <div className="p-4 rounded-3xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-300 backdrop-blur-xl flex items-center gap-3 animate-pulse">
          <span className="material-symbols-outlined text-yellow-400 text-xl">hourglass_empty</span>
          <div className="text-xs">
            <p className="font-bold">Upgrade Permohonan Sedang Ditinjau Admin</p>
            <p className="text-slate-400 mt-0.5">Bukti transfer untuk paket <strong>{pendingOrder.plan}</strong> ({formatRupiah(pendingOrder.price)}) sedang diproses. Layanan Premium/Business akan otomatis aktif setelah diverifikasi.</p>
          </div>
        </div>
      )}

      {/* Upgrade Rejected Banner */}
      {rejectedOrder && !pendingOrder && (
        <div className="p-4 rounded-3xl border border-rose-500/20 bg-rose-500/10 text-rose-300 backdrop-blur-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-rose-400 text-xl">cancel</span>
          <div className="text-xs">
            <p className="font-bold">Upgrade Pembayaran Manual Ditolak</p>
            <p className="text-slate-400 mt-0.5">Permintaan Anda untuk paket <strong>{rejectedOrder.plan}</strong> ditolak oleh admin. Alasan: <span className="text-rose-200 font-semibold">{rejectedOrder.adminNote}</span>. Harap lakukan transfer ulang dan upload bukti pembayaran baru yang sah.</p>
          </div>
        </div>
      )}

      {/* Plan Info Bar */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shrink-0">
            <span className="material-symbols-outlined text-white text-[24px]">verified</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rencana Aktif Anda</span>
              <Badge variant={currentPlan === 'FREE' ? 'default' : currentPlan === 'PREMIUM' ? 'primary' : 'success'}>
                {currentPlan}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1">
              {currentPlan === 'FREE'
                ? 'Gunakan Rencana Premium untuk menikmati fitur tanpa batas.'
                : `Berlaku sampai: ${planExpiresAt ? new Date(planExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Selamanya'}`}
            </p>
          </div>
        </div>

        {currentPlan !== 'FREE' && (
          <button
            onClick={handleDowngradeToFree}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 text-xs font-bold rounded-xl transition-all"
          >
            Batalkan Subscription
          </button>
        )}
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="bg-slate-950/40 border border-white/[0.06] rounded-2xl p-1.5 flex items-center gap-1">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!isYearly ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Bulanan
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isYearly ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Tahunan
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-black uppercase tracking-wider">Hemat 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FREE CARD */}
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-[2rem] p-6 md:p-8 backdrop-blur-xl flex flex-col justify-between hover:border-white/[0.12] transition-all duration-300">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rencana Dasar</span>
            <h2 className="text-xl font-extrabold text-slate-200 mt-2">FREE</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-100">
                {formatRupiah(getPlanPrice('FREE'))}
              </span>
              <span className="text-xs text-slate-500">/ {isYearly ? 'tahun' : 'bulan'}</span>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">Sempurna untuk konveksi rumahan kecil atau untuk mencoba fitur awal.</p>
            
            <div className="border-t border-white/[0.06] my-6 pt-6 space-y-3">
               {[
                 { active: true, text: 'Maks. 5 Order Bahan Masuk' },
                 { active: true, text: 'Maks. 5 Profil Pelanggan' },
                 { active: true, text: 'Maks. 5 Invoice Tagihan' },
                 { active: false, text: 'Ekspor PDF & Excel (CSV)' },
                 { active: false, text: 'Live Tracking Pekerjaan' },
                 { active: false, text: 'AI Insight & Chart Analitik' }
               ].map((feature, i) => (
                 <div key={i} className="flex items-center gap-2.5">
                   <span className={`material-symbols-outlined text-[16px] ${feature.active ? 'text-cyan-400' : 'text-slate-600'}`}>
                     {feature.active ? 'check_circle' : 'cancel'}
                   </span>
                   <span className={`text-xs font-semibold ${feature.active ? 'text-slate-300' : 'text-slate-500 line-through'}`}>{feature.text}</span>
                 </div>
               ))}
            </div>
          </div>
          {bankSettings.freeActive === false ? (
            <button
              disabled={true}
              className="w-full py-3.5 rounded-2xl text-xs font-bold bg-white/[0.02] border border-white/[0.04] text-slate-500 cursor-not-allowed text-center"
            >
              Tidak Tersedia
            </button>
          ) : (
            <button
              disabled={currentPlan === 'FREE'}
              onClick={() => handleOpenCheckout('FREE')}
              className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all ${currentPlan === 'FREE' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300' : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300'}`}
            >
              {currentPlan === 'FREE' ? 'Rencana Aktif' : 'Pilih FREE'}
            </button>
          )}
        </div>

        {/* PREMIUM CARD */}
        <div className="bg-gradient-to-br from-purple-950/20 via-slate-900/60 to-cyan-950/20 border border-purple-500/30 rounded-[2rem] p-6 md:p-8 backdrop-blur-xl flex flex-col justify-between hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 relative scale-105">
          <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-cyan-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider shadow-lg">POPULER</div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Rencana Terlaris</span>
            <h2 className="text-xl font-extrabold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent mt-2">PREMIUM</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-100">
                {formatRupiah(getPlanPrice('PREMIUM'))}
              </span>
              <span className="text-xs text-slate-500">/ {isYearly ? 'tahun' : 'bulan'}</span>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">Cocok untuk owner konveksi profesional untuk melacak produksi harian tanpa hambatan.</p>
            
            <div className="border-t border-white/[0.06] my-6 pt-6 space-y-3">
              {[
                { active: true, text: 'Unlimited Input Bahan Masuk' },
                { active: true, text: 'Unlimited Profil Pelanggan' },
                { active: true, text: 'Unlimited Invoice & Tagihan' },
                { active: true, text: 'Ekspor Excel & CSV Laporan' },
                { active: true, text: 'Live Tracking Pekerjaan (Maks 3)' },
                { active: true, text: 'AI Insight Rekomendasi Finansial' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-cyan-400 text-[16px]">check_circle</span>
                  <span className="text-xs font-semibold text-slate-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          {bankSettings.premiumActive === false ? (
            <button
              disabled={true}
              className="w-full py-4 rounded-2xl text-xs font-bold bg-white/[0.02] border border-white/[0.04] text-slate-500 cursor-not-allowed text-center"
            >
              Tidak Tersedia
            </button>
          ) : (
            <div className="space-y-2 w-full">
              <button
                onClick={() => handleOpenCheckout('PREMIUM')}
                className={`w-full py-4 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${currentPlan === 'PREMIUM' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 cursor-default shadow-md shadow-cyan-500/10' : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 shadow-lg text-white'}`}
              >
                {currentPlan === 'PREMIUM' ? 'Rencana Aktif' : 'Mulai PREMIUM'}
              </button>
              {currentPlan !== 'PREMIUM' && (
                <p className="text-[10px] text-center text-slate-400 font-semibold flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-xs text-green-400">chat</span>
                  Klik untuk upgrade via WhatsApp
                </p>
              )}
            </div>
          )}
        </div>

        {/* BUSINESS CARD */}
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-[2rem] p-6 md:p-8 backdrop-blur-xl flex flex-col justify-between hover:border-white/[0.12] transition-all duration-300">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Skala Besar</span>
            <h2 className="text-xl font-extrabold text-slate-200 mt-2">BUSINESS</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-100">
                {formatRupiah(getPlanPrice('BUSINESS'))}
              </span>
              <span className="text-xs text-slate-500">/ {isYearly ? 'tahun' : 'bulan'}</span>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">Untuk pemilik bisnis skala menengah ke atas dengan banyak karyawan dan fitur enterprise.</p>
            
            <div className="border-t border-white/[0.06] my-6 pt-6 space-y-3">
              {[
                { active: true, text: 'Seluruh Fitur PREMIUM' },
                { active: true, text: 'Multi-User Staff & Role Guard' },
                { active: true, text: 'Live Tracking Pekerjaan Unlimited' },
                { active: true, text: 'Backup Otomatis Ke Cloud' },
                { active: true, text: 'Laporan Finansial Multi-Branch' },
                { active: true, text: 'Prioritas CS WhatsApp 24/7' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-purple-400 text-[16px]">check_circle</span>
                  <span className="text-xs font-semibold text-slate-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          {bankSettings.businessActive === false ? (
            <button
              disabled={true}
              className="w-full py-3.5 rounded-2xl text-xs font-bold bg-white/[0.02] border border-white/[0.04] text-slate-500 cursor-not-allowed text-center"
            >
              Tidak Tersedia
            </button>
          ) : (
            <div className="space-y-2 w-full">
              <button
                onClick={() => handleOpenCheckout('BUSINESS')}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${currentPlan === 'BUSINESS' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 cursor-default shadow-md shadow-cyan-500/10' : 'bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] text-slate-100'}`}
              >
                {currentPlan === 'BUSINESS' ? 'Rencana Aktif' : 'Mulai BUSINESS'}
              </button>
              {currentPlan !== 'BUSINESS' && (
                <p className="text-[10px] text-center text-slate-400 font-semibold flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-xs text-green-400">chat</span>
                  Klik untuk upgrade via WhatsApp
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Checkout Simulator Modal */}
      {checkoutPlan && !paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900/95 border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-scale-in text-white relative">
            <button
              onClick={() => setCheckoutPlan(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Checkout Sandbox</span>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-100 tracking-tight mt-1 mb-5">
              Upgrade ke Rencana {checkoutPlan}
            </h2>

            {/* Price Detail */}
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2 mb-6">
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>Rencana Pilihan:</span>
                <span className="text-slate-200">{checkoutPlan} ({isYearly ? 'Tahunan' : 'Bulanan'})</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-white/[0.06] pt-2 mt-2">
                <span>Total Tagihan:</span>
                <span className="text-cyan-400">
                  {formatRupiah(getPlanPrice(checkoutPlan))}
                </span>
              </div>
            </div>

            {/* Gateway Tabs */}
            <div className="flex border-b border-white/[0.06] mb-6">
              {[
                { id: 'midtrans', label: 'Midtrans' },
                { id: 'stripe', label: 'Stripe' },
                { id: 'paypal', label: 'PayPal' },
                { id: 'manual', label: 'Transfer Manual' }
              ].map(gw => (
                <button
                  key={gw.id}
                  onClick={() => { setPaymentGateway(gw.id); setPaymentMethod(gw.id === 'midtrans' ? 'gopay' : 'cc'); }}
                  className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${paymentGateway === gw.id ? 'border-cyan-500 text-cyan-300' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  {gw.label}
                </button>
              ))}
            </div>

            {/* Payment Fields according to Gateways */}
            {paymentGateway === 'midtrans' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentMethod('gopay')}
                    className={`flex-1 p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${paymentMethod === 'gopay' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' : 'bg-slate-950/40 border-white/[0.06] text-slate-400 hover:bg-white/[0.02]'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                    GoPay QR
                  </button>
                  <button
                    onClick={() => setPaymentMethod('va')}
                    className={`flex-1 p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${paymentMethod === 'va' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' : 'bg-slate-950/40 border-white/[0.06] text-slate-400 hover:bg-white/[0.02]'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">account_balance</span>
                    Virtual Account
                  </button>
                </div>

                {paymentMethod === 'gopay' ? (
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 border border-white/[0.06] rounded-2xl space-y-3">
                    <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center">
                      {/* GoPay Mock QR Code */}
                      <span className="material-symbols-outlined text-slate-900 text-8xl">qr_code_2</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pindai QR dengan GoPay / e-Wallet</p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/60 border border-white/[0.06] rounded-2xl text-xs space-y-2">
                    <p className="text-slate-400 font-bold">Instruksi Pembayaran VA:</p>
                    <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-white/[0.04]">
                      <span className="font-mono text-cyan-400 text-sm font-black">987019283748293</span>
                      <span className="text-[9px] font-bold bg-white/[0.06] px-2 py-1 rounded text-slate-300">SALIN VA</span>
                    </div>
                    <p className="text-[9px] text-slate-500">Gunakan Virtual Account di atas melalui M-Banking atau ATM Bank Mandiri, BNI, BRI, atau BCA.</p>
                  </div>
                )}
              </div>
            )}

            {paymentGateway === 'stripe' && (
              <div className="space-y-4">
                <div className="space-y-3 p-4 bg-slate-950/60 border border-white/[0.06] rounded-2xl">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nomor Kartu Kredit / Debit</label>
                    <input
                      type="text"
                      maxLength="19"
                      value={ccNumber}
                      onChange={(e) => setCcNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                      placeholder="4111 2222 3333 4444"
                      className="input-base text-xs py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Masa Berlaku</label>
                      <input
                        type="text"
                        maxLength="5"
                        value={ccExpiry}
                        onChange={(e) => setCcExpiry(e.target.value.replace(/\D/g, '').replace(/(.{2})/, '$1/').trim())}
                        placeholder="MM/YY"
                        className="input-base text-xs py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">CVC / CVV</label>
                      <input
                        type="text"
                        maxLength="3"
                        value={ccCvc}
                        onChange={(e) => setCcCvc(e.target.value.replace(/\D/g, '').trim())}
                        placeholder="123"
                        className="input-base text-xs py-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentGateway === 'paypal' && (
              <div className="space-y-4 flex flex-col items-center justify-center p-6 bg-slate-950/60 border border-white/[0.06] rounded-2xl">
                <span className="material-symbols-outlined text-indigo-400 text-5xl">payments</span>
                <p className="text-xs text-slate-300 font-semibold mt-2">Membayar dengan Akun PayPal Sandbox</p>
                <p className="text-[10px] text-slate-500 text-center leading-relaxed mt-1">Anda akan diarahkan ke halaman login simulasi PayPal untuk meninjau detail saldo/kartu.</p>
              </div>
            )}

            {paymentGateway === 'manual' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950/60 border border-white/[0.06] rounded-2xl space-y-3">
                  <p className="text-slate-300 font-bold">Silakan transfer sesuai nominal tagihan ke salah satu rekening berikut:</p>
                  
                  <div className="space-y-2">
                    {bankSettings.activePaymentOption === 'seabank' && (
                      <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-white/[0.04] hover:bg-white/[0.02] transition-all">
                        <div>
                          <span className="block text-[8px] font-black uppercase text-slate-500">BANK SEABANK (AKTIF)</span>
                          <span className="font-mono text-cyan-400 text-xs font-black">{bankSettings.seabankNumber}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{bankSettings.seabankName || 'a.n. Konveksi OS'}</span>
                      </div>
                    )}

                    {bankSettings.activePaymentOption === 'jago' && (
                      <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-white/[0.04] hover:bg-white/[0.02] transition-all">
                        <div>
                          <span className="block text-[8px] font-black uppercase text-slate-500">BANK JAGO (AKTIF)</span>
                          <span className="font-mono text-cyan-400 text-xs font-black">{bankSettings.jagoNumber}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{bankSettings.jagoName || 'a.n. Konveksi OS'}</span>
                      </div>
                    )}

                    {bankSettings.activePaymentOption === 'gopay' && (
                      <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-white/[0.04] hover:bg-white/[0.02] transition-all">
                        <div>
                          <span className="block text-[8px] font-black uppercase text-slate-500">E-WALLET GOPAY (AKTIF)</span>
                          <span className="font-mono text-cyan-400 text-xs font-black">{bankSettings.gopayNumber}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{bankSettings.gopayName || 'a.n. Konveksi OS'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Upload Bukti Transfer Gambar (Maks 2MB)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="manual-payment-proof-input"
                      />
                      <label
                        htmlFor="manual-payment-proof-input"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl cursor-pointer font-bold text-[10px] transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                        {paymentProof ? 'Ubah Gambar Bukti' : 'Pilih Gambar Bukti'}
                      </label>
                      {paymentProof && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                          <img src={paymentProof} alt="Proof preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => setCheckoutPlan(null)}
                className="flex-1 py-3 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 rounded-2xl font-bold text-xs transition-all text-center"
              >
                Kembali
              </button>
              <button
                onClick={handleSimulatePayment}
                disabled={isPaying || isSubmittingProof}
                className="flex-2 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all text-center"
              >
                {isPaying || isSubmittingProof ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin mr-1.5 align-middle">sync</span>
                    Memproses...
                  </>
                ) : paymentGateway === 'manual' ? (
                  'Kirim Bukti Pembayaran'
                ) : (
                  'Simulasikan Pembayaran Sukses'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Invoice Receipt */}
      {paymentSuccess && receiptInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-slate-900 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-8 max-w-lg w-full shadow-2xl animate-scale-in text-white relative">
            <div className="flex flex-col items-center justify-center space-y-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Pembayaran Berhasil!</h2>
              <p className="text-xs text-slate-400">Subscription Rencana {receiptInvoice.plan} Anda telah aktif.</p>
            </div>

            {/* Printable Receipt area */}
            <div className="p-5 bg-slate-950/60 border border-white/[0.06] rounded-2xl space-y-4 text-xs font-semibold text-slate-300">
              <div className="flex justify-between pb-2 border-b border-white/[0.04]">
                <span className="text-slate-500">ID Invoice:</span>
                <span className="font-mono text-slate-200">{receiptInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paket Upgrade:</span>
                <span className="text-slate-200">{receiptInvoice.plan} ({receiptInvoice.billingCycle})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal Dibayar:</span>
                <span className="text-cyan-400">{formatRupiah(receiptInvoice.nominal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Bayar:</span>
                <span className="text-slate-200">{receiptInvoice.tanggal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Aktif s/d:</span>
                <span className="text-slate-200">{receiptInvoice.expiredAt}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/[0.04]">
                <span className="text-slate-500">Metode Sandbox:</span>
                <span className="text-slate-200">{receiptInvoice.gateway} ({paymentMethod.toUpperCase()})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Pembayaran:</span>
                <span className="text-emerald-400 uppercase tracking-widest font-black text-[10px]">LUNAS / BERHASIL</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Cetak Kuitansi
              </button>
              <button
                onClick={() => { setPaymentSuccess(false); setCheckoutPlan(null); }}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-xs rounded-xl shadow-lg hover:scale-[1.01] transition-all text-center"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Ledger Billing History */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl space-y-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-400 text-lg">history</span>
          Riwayat Transaksi Subscription
        </h3>

        {billingHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-semibold bg-slate-950/20 border border-white/[0.04] rounded-2xl">
            Belum ada transaksi pembayaran subscription.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-500 font-bold">
                  <th className="py-3 px-4">Invoice</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Rencana Paket</th>
                  <th className="py-3 px-4">Siklus</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-white/[0.04] text-slate-300 hover:bg-white/[0.01] transition-all font-semibold"
                  >
                    <td className="py-3 px-4 text-slate-500 font-bold font-mono">{item.invoiceNumber}</td>
                    <td className="py-3 px-4">{item.tanggal}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {item.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{item.billingCycle}</td>
                    <td className="py-3 px-4 text-right font-black text-cyan-400">{formatRupiah(item.nominal)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[10px] font-black uppercase text-emerald-400">{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
