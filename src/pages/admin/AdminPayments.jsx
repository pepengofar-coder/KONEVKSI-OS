import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';

export default function AdminPayments() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { formatRupiah, showToast } = useHelpers();

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProof, setSelectedProof] = useState(null);
  
  // Modals state
  const [approveModalOrder, setApproveModalOrder] = useState(null);
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const orders = state.paymentOrders || [];

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesSearch = 
      (o.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.plan || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = () => {
    if (!approveModalOrder) return;
    dispatch({
      type: 'APPROVE_PAYMENT',
      payload: {
        orderId: approveModalOrder.id,
        adminNote: adminNote || 'Pembayaran diverifikasi secara manual oleh Admin.'
      }
    });
    showToast(`Upgrade pembayaran untuk ${approveModalOrder.businessName || approveModalOrder.username} disetujui!`, 'success');
    setApproveModalOrder(null);
    setAdminNote('');
  };

  const handleReject = () => {
    if (!rejectModalOrder) return;
    if (!adminNote.trim()) {
      showToast('Harap masukkan alasan penolakan pembayaran!', 'error');
      return;
    }
    dispatch({
      type: 'REJECT_PAYMENT',
      payload: {
        orderId: rejectModalOrder.id,
        adminNote
      }
    });
    showToast(`Upgrade pembayaran untuk ${rejectModalOrder.businessName || rejectModalOrder.username} ditolak!`, 'success');
    setRejectModalOrder(null);
    setAdminNote('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Verifikasi Bukti Transfer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Periksa bukti transfer dari pengguna dan lakukan ACC untuk mengaktifkan paket Premium/Business.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/[0.06] p-4 rounded-3xl backdrop-blur-xl">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              {status === 'ALL' ? 'Semua' : status}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari berdasarkan nama usaha/username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-10"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            {/* User & Order Details */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full border ${
                  order.plan === 'PREMIUM'
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                    : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                }`}>
                  {order.plan}
                </span>
                <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase ${
                  order.status === 'PENDING'
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20 animate-pulse'
                    : order.status === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  {order.status}
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {new Date(order.createdAt).toLocaleString('id-ID')}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">{order.businessName || order.username}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pemohon: <span className="font-semibold text-slate-200">@{order.username}</span> · Metode: <span className="font-semibold text-slate-200">{order.paymentMethod}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Nominal Transfer:{' '}
                  <span className="font-black text-emerald-400 text-sm leading-none">
                    {formatRupiah(order.price)}
                  </span>
                </p>
              </div>

              {order.adminNote && (
                <div className="mt-3 p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl text-xs text-slate-400">
                  <strong className="text-slate-300 block mb-0.5">Catatan Admin:</strong>
                  {order.adminNote}
                </div>
              )}
            </div>

            {/* Proof & Actions */}
            <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/[0.06]">
              {order.paymentProof ? (
                <button
                  onClick={() => setSelectedProof(order.paymentProof)}
                  className="w-16 h-16 rounded-xl border border-white/10 hover:border-cyan-500/50 bg-slate-950 flex items-center justify-center overflow-hidden transition-all group relative"
                  title="Klik untuk perbesar"
                >
                  <img src={order.paymentProof} alt="Bukti Transfer" className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg">zoom_in</span>
                  </div>
                </button>
              ) : (
                <div className="w-16 h-16 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-slate-600 bg-slate-950/40">
                  <span className="material-symbols-outlined">no_photography</span>
                </div>
              )}

              {order.status === 'PENDING' && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      setRejectModalOrder(order);
                      setAdminNote('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/25 transition-all text-center"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      setApproveModalOrder(order);
                      setAdminNote('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/25 transition-all text-center flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    Setujui (ACC)
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-12 text-center text-slate-500 italic text-sm">
            Tidak ada bukti transfer yang sesuai dengan filter atau kata pencarian.
          </div>
        )}
      </div>

      {/* Proof Image Lightbox Modal */}
      {selectedProof && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedProof(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={selectedProof} alt="Bukti Transfer Perbesar" className="max-w-full max-h-[80vh] rounded-2xl object-contain border border-white/10" />
            <button
              onClick={() => setSelectedProof(null)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center shadow-lg"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Approve ACC Modal */}
      {approveModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">check_circle</span>
              ACC Pembayaran
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Apakah Anda yakin ingin menyetujui transfer dari <strong>{approveModalOrder.businessName || approveModalOrder.username}</strong> sebesar <strong>{formatRupiah(approveModalOrder.price)}</strong>? Ini akan langsung meningkatkan status akun ke <strong>{approveModalOrder.plan}</strong> selama 30 hari.
            </p>

            <div className="mt-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Catatan Admin (Opsional)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Contoh: Bukti transfer valid. Paket diaktifkan."
                rows="3"
                className="input-base resize-none"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setApproveModalOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/[0.04]"
              >
                Batal
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-lg shadow-emerald-600/25"
              >
                Setujui Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-400">cancel</span>
              Tolak Pembayaran
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Harap berikan alasan penolakan pembayaran untuk <strong>{rejectModalOrder.businessName || rejectModalOrder.username}</strong>. Pengguna akan melihat pesan ini pada dashboard tagihan mereka.
            </p>

            <div className="mt-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Alasan Penolakan (Wajib)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Contoh: Bukti transfer buram/tidak terbaca. Harap upload kembali."
                rows="3"
                className="input-base resize-none"
                required
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/[0.04]"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 shadow-lg shadow-rose-600/25"
              >
                Tolak Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
