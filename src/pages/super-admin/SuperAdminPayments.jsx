import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';

export default function SuperAdminPayments() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { formatRupiah, showToast } = useHelpers();

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProof, setSelectedProof] = useState(null);
  
  // Sorting state
  const [sortBy, setSortBy] = useState('date'); // 'date', 'nominal', 'plan'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // Modals state
  const [approveModalOrder, setApproveModalOrder] = useState(null);
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  // Manual Override Modal state
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [editPlan, setEditPlan] = useState('FREE');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editRole, setEditRole] = useState('USER');
  const [editExpiryDate, setEditExpiryDate] = useState('');

  const orders = state.paymentOrders || [];
  const isSuperAdmin = state.currentUser?.role === 'SUPER_ADMIN';

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    
    // Find associated user to fetch email
    const userObj = (state.users || []).find(u => u.id === o.userId || u.username === o.username);
    const userEmail = userObj ? userObj.email || '' : '';

    const matchesSearch = 
      (o.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.plan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (userEmail).toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesStatus && matchesSearch;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = (a.createdAt || 0) - (b.createdAt || 0);
    } else if (sortBy === 'nominal') {
      comparison = (a.price || 0) - (b.price || 0);
    } else if (sortBy === 'plan') {
      comparison = (a.plan || '').localeCompare(b.plan || '');
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const handleApprove = () => {
    if (!isSuperAdmin) {
      showToast('Akses Ditolak: Hanya Super Admin yang dapat menyetujui pembayaran!', 'error');
      return;
    }
    if (!approveModalOrder) return;
    dispatch({
      type: 'APPROVE_PAYMENT',
      payload: {
        orderId: approveModalOrder.id,
        adminNote: adminNote || 'Pembayaran diverifikasi secara manual oleh Super Admin.'
      }
    });
    showToast(`Upgrade pembayaran untuk ${approveModalOrder.businessName || approveModalOrder.username} disetujui!`, 'success');
    setApproveModalOrder(null);
    setAdminNote('');
  };

  const handleReject = (status = 'REJECTED') => {
    if (!isSuperAdmin) {
      showToast('Akses Ditolak: Hanya Super Admin yang dapat menolak/menggagalkan pembayaran!', 'error');
      return;
    }
    if (!rejectModalOrder) return;
    if (!adminNote.trim()) {
      showToast('Harap masukkan alasan tindakan penolakan/kegagalan!', 'error');
      return;
    }
    dispatch({
      type: 'REJECT_PAYMENT',
      payload: {
        orderId: rejectModalOrder.id,
        adminNote,
        status
      }
    });
    showToast(`Upgrade pembayaran untuk ${rejectModalOrder.businessName || rejectModalOrder.username} ditandai sebagai ${status}!`, 'success');
    setRejectModalOrder(null);
    setAdminNote('');
  };

  const handleExtend = (userId, days) => {
    if (!isSuperAdmin) {
      showToast('Akses Ditolak: Hanya Super Admin yang dapat memperpanjang lisensi!', 'error');
      return;
    }
    dispatch({
      type: 'EXTEND_SUBSCRIPTION',
      payload: { userId, days }
    });
    showToast(`Masa aktif berhasil diperpanjang ${days} hari!`, 'success');
  };

  const handleOpenEdit = (user) => {
    setSelectedUserForEdit(user);
    setEditPlan(user.plan || 'FREE');
    setEditStatus(user.planStatus || 'ACTIVE');
    setEditRole(user.role || 'USER');
    setEditExpiryDate(
      user.planExpiresAt 
        ? new Date(user.planExpiresAt).toISOString().split('T')[0] 
        : ''
    );
  };

  const handleSaveEdit = () => {
    if (!isSuperAdmin) {
      showToast('Akses Ditolak: Hanya Super Admin yang dapat memodifikasi lisensi/role!', 'error');
      return;
    }
    if (!selectedUserForEdit) return;

    const expiryTimestamp = editExpiryDate ? new Date(editExpiryDate).getTime() : null;

    // 1. Update plan and status
    dispatch({
      type: 'MANUAL_UPDATE_PLAN',
      payload: {
        userId: selectedUserForEdit.id,
        plan: editPlan,
        planStatus: editStatus,
        planExpiresAt: expiryTimestamp
      }
    });

    // 2. Update role if changed
    if (editRole !== selectedUserForEdit.role) {
      dispatch({
        type: 'MANUAL_UPDATE_ROLE',
        payload: {
          userId: selectedUserForEdit.id,
          role: editRole
        }
      });
    }

    showToast(`Akun @${selectedUserForEdit.username} berhasil diperbarui secara manual!`, 'success');
    setSelectedUserForEdit(null);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Verifikasi Bukti Transfer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tinjau bukti pembayaran manual dan lakukan ACC untuk mengaktifkan lisensi premium/business.
        </p>
      </div>

      {/* Filters, Sorting, and Search */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/[0.06] p-4 rounded-3xl backdrop-blur-xl">
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'FAILED'].map((status) => (
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

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-center">
          {/* Sorting controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 shrink-0">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 cursor-pointer outline-none focus:border-purple-500 w-full sm:w-auto"
            >
              <option value="date">Tanggal</option>
              <option value="nominal">Nominal</option>
              <option value="plan">Paket (Plan)</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] text-slate-300 hover:text-white rounded-xl transition-all flex items-center justify-center shrink-0"
              title={sortOrder === 'asc' ? 'Urutkan Terlama / Terkecil' : 'Urutkan Terbaru / Terbesar'}
            >
              <span className="material-symbols-outlined text-sm leading-none">
                {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari email, username, usaha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-10"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {sortedOrders.map((order) => {
          const targetUser = (state.users || []).find(u => u.id === order.userId || u.username === order.username);
          return (
            <div
              key={order.id}
              className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* User & Order Details */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full border ${
                    order.plan === 'PREMIUM'
                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                      : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                  }`}>
                    {order.plan}
                  </span>
                  <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full border uppercase ${
                    order.status === 'PENDING'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/20 animate-pulse'
                      : order.status === 'APPROVED'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                      : order.status === 'FAILED'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/20'
                      : 'bg-slate-500/15 text-slate-400 border-slate-500/20'
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
                    Pemohon: <span className="font-semibold text-slate-200">@{order.username}</span>
                    {targetUser && <span className="text-slate-500 font-normal"> · {targetUser.email}</span>}
                    {' · '}Metode: <span className="font-semibold text-slate-200">{order.paymentMethod}</span>
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/[0.06] w-full md:w-auto">
                <div className="flex items-center gap-3">
                  {order.paymentProof ? (
                    <button
                      onClick={() => setSelectedProof(order.paymentProof)}
                      className="w-16 h-16 rounded-xl border border-white/10 hover:border-cyan-500/50 bg-slate-950 flex items-center justify-center overflow-hidden transition-all group relative shrink-0"
                      title="Klik untuk perbesar bukti transfer"
                    >
                      <img src={order.paymentProof} alt="Bukti Transfer" className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-lg">zoom_in</span>
                      </div>
                    </button>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-slate-600 bg-slate-950/40 shrink-0">
                      <span className="material-symbols-outlined">no_photography</span>
                    </div>
                  )}

                  {/* Quick User Actions */}
                  {targetUser && (
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => handleExtend(targetUser.id, 30)}
                        disabled={!isSuperAdmin}
                        className="px-2.5 py-1 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                        title="Extend subscription user by 30 days"
                      >
                        +30 Hari
                      </button>
                      <button
                        onClick={() => handleOpenEdit(targetUser)}
                        disabled={!isSuperAdmin}
                        className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/25 text-purple-300 hover:text-purple-200 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                        title="Ubah lisensi paket secara manual"
                      >
                        <span className="material-symbols-outlined text-[12px]">edit</span>
                        Lisensi
                      </button>
                    </div>
                  )}
                </div>

                {order.status === 'PENDING' && (
                  <div className="flex flex-row gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        if (!isSuperAdmin) return;
                        setRejectModalOrder(order);
                        setAdminNote('');
                      }}
                      disabled={!isSuperAdmin}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all text-center flex-1 sm:flex-initial ${
                        isSuperAdmin 
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20 hover:bg-rose-500/25 cursor-pointer' 
                          : 'bg-slate-800 text-slate-600 border border-slate-700 opacity-50 cursor-not-allowed'
                      }`}
                      title={!isSuperAdmin ? 'Hanya Super Admin yang dapat menolak.' : 'Tolak / Gagal'}
                    >
                      Tolak / Gagal
                    </button>
                    <button
                      onClick={() => {
                        if (!isSuperAdmin) return;
                        setApproveModalOrder(order);
                        setAdminNote('');
                      }}
                      disabled={!isSuperAdmin}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                        isSuperAdmin
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/25 cursor-pointer shadow-lg'
                          : 'bg-slate-800 text-slate-600 border border-slate-700 opacity-50 cursor-not-allowed'
                      }`}
                      title={!isSuperAdmin ? 'Hanya Super Admin yang dapat menyetujui.' : 'ACC Pembayaran'}
                    >
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Setujui (ACC)
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sortedOrders.length === 0 && (
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
      {approveModalOrder && isSuperAdmin && (
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

      {/* Reject / Fail Modal */}
      {rejectModalOrder && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-400">cancel</span>
              Tolak / Gagalkan Pembayaran
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Harap berikan alasan tindakan untuk <strong>{rejectModalOrder.businessName || rejectModalOrder.username}</strong>. Alasan ini akan tercatat dalam logs audit dan tampil di panel tagihan user.
            </p>

            <div className="mt-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Alasan Penolakan / Kegagalan (Wajib)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Contoh: Bukti transfer buram, mohon upload kembali."
                rows="3"
                className="input-base resize-none"
                required
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/[0.04]"
              >
                Batal
              </button>
              <button
                onClick={() => handleReject('FAILED')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1"
              >
                Tandai Gagal (FAILED)
              </button>
              <button
                onClick={() => handleReject('REJECTED')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 shadow-lg shadow-rose-600/25"
              >
                Tolak (REJECTED)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Override License Modal */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400">admin_panel_settings</span>
                Override Lisensi & Hak Akses
              </h3>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="w-8 h-8 rounded-full hover:bg-white/[0.04] text-slate-400 hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* SaaS Plan Tier */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Paket Langganan (Plan Tier)</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="input-base cursor-pointer"
                >
                  <option value="FREE" className="bg-slate-900 text-slate-200">FREE</option>
                  <option value="PREMIUM" className="bg-slate-900 text-slate-200">PREMIUM</option>
                  <option value="BUSINESS" className="bg-slate-900 text-slate-200">BUSINESS</option>
                </select>
              </div>

              {/* SaaS Plan Status */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Status Lisensi</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="input-base cursor-pointer"
                >
                  <option value="ACTIVE" className="bg-slate-900 text-slate-200">ACTIVE</option>
                  <option value="PENDING" className="bg-slate-900 text-slate-200">PENDING</option>
                  <option value="EXPIRED" className="bg-slate-900 text-slate-200">EXPIRED</option>
                </select>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Tanggal Berakhir Langganan</label>
                <input
                  type="date"
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  className="input-base"
                />
              </div>

              {/* System Platform Role */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Platform System Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="input-base cursor-pointer"
                >
                  <option value="USER" className="bg-slate-900 text-slate-200">USER (Tenant Biasa)</option>
                  <option value="ADMIN" className="bg-slate-900 text-slate-200">ADMIN (Platform Administrator)</option>
                  <option value="SUPER_ADMIN" className="bg-slate-900 text-slate-200">SUPER ADMIN (Full Platform Control)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex justify-end gap-3">
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/[0.04]"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-600 cursor-pointer shadow-lg"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
