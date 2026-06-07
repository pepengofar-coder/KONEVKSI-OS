import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';

export default function SuperAdminUsers() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { showToast, formatRupiah } = useHelpers();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  // Edit Modal form state
  const [editPlan, setEditPlan] = useState('FREE');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editRole, setEditRole] = useState('USER');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editNama, setEditNama] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const users = state.users || [];

  const isSuperAdmin = state.currentUser?.role === 'SUPER_ADMIN';

  // Filter out the logged-in admin from basic list (or show all users)
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.businessName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getUserStats = (userId) => {
    return {
      models: (state.models || []).filter(m => m.userId === userId).length,
      taylors: (state.taylors || []).filter(t => t.userId === userId).length,
      barangMasuk: (state.barangMasuk || []).filter(b => b.userId === userId).length,
      invoices: (state.invoices || []).filter(i => i.userId === userId).length,
      kasbon: (state.kasbon || []).filter(k => k.userId === userId).length,
      customers: (state.customers || []).filter(c => c.userId === userId).length
    };
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
    setEditNama(user.nama || user.name || '');
    setEditPhone(user.phone || '');
  };

  const handleSaveEdit = () => {
    if (!isSuperAdmin) {
      showToast('Akses Ditolak: Hanya Super Admin yang dapat memodifikasi lisensi/role!', 'error');
      return;
    }
    if (!selectedUserForEdit) return;

    if (!editNama.trim()) {
      showToast('Nama pengguna tidak boleh kosong!', 'error');
      return;
    }

    const expiryTimestamp = editExpiryDate ? new Date(editExpiryDate).getTime() : null;

    const updates = {
      nama: editNama.trim(),
      name: editNama.trim(),
      phone: editPhone.trim(),
      plan: editPlan,
      planStatus: editStatus,
      planExpiresAt: expiryTimestamp,
      role: editRole,
      updatedAt: Date.now()
    };

    setEditLoading(true);

    fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminUserId: state.currentUser.id,
        targetUserId: selectedUserForEdit.id,
        updates
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Gagal memperbarui di server');
      return res.json();
    })
    .then((updatedUser) => {
      dispatch({
        type: 'SYNC_USER_DIRECT',
        payload: updatedUser
      });
      showToast(`Akun @${selectedUserForEdit.username} berhasil diperbarui!`, 'success');
      setSelectedUserForEdit(null);
    })
    .catch(err => {
      console.error(err);
      showToast('Gagal memperbarui data pengguna: ' + err.message, 'error');
    })
    .finally(() => {
      setEditLoading(false);
    });
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Manajemen Pengguna & Tenant
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Daftar seluruh tenant terdaftar, pantau tingkat penggunaan resource, dan lakukan override lisensi secara manual.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex bg-white/[0.02] border border-white/[0.06] p-4 rounded-3xl backdrop-blur-xl">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Cari pengguna berdasarkan nama, username, email, atau nama usaha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-10"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="py-4 px-6">Pengguna & Usaha</th>
                <th className="py-4 px-6">Lisensi & Role</th>
                <th className="py-4 px-6">Durasi Langganan</th>
                <th className="py-4 px-6 text-center">Transaksi</th>
                <th className="py-4 px-6 text-center">Penggunaan</th>
                <th className="py-4 px-6">Terdaftar</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredUsers.map((user) => {
                const stats = getUserStats(user.id);
                const isUserAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
                const userPayments = (state.paymentOrders || []).filter(po => po.userId === user.id);
                const totalPaid = userPayments.filter(po => po.status === 'APPROVED').reduce((sum, po) => sum + (po.price || 0), 0);
                const paymentCount = userPayments.length;

                return (
                  <tr key={user.id} className="hover:bg-white/[0.01] transition-all text-xs">
                    {/* Username & Usaha */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${
                          isUserAdmin 
                            ? 'from-rose-600 to-amber-600' 
                            : 'from-purple-600 to-cyan-600'
                        } flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                          {(user.nama || user.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">{user.nama || user.name}</p>
                          <p className="text-[10px] text-slate-400">
                            @{user.username} · {user.email}
                          </p>
                          <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">
                            {user.businessName || 'Belum Mengatur Profil Usaha'}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Login Terakhir: <span className="text-slate-300 font-medium">{user.lastLogin ? new Date(user.lastLogin).toLocaleString('id-ID') : 'Belum Pernah'}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Lisensi & Role */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                            user.plan === 'FREE'
                              ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              : user.plan === 'PREMIUM'
                              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                              : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                          }`}>
                            {user.plan}
                          </span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                            user.planStatus === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : user.planStatus === 'PENDING'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}>
                            {user.planStatus}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500">
                          Role: <span className="text-slate-300 font-bold">{user.role}</span>
                          {user.businessRole && (
                            <> · <span className="text-slate-400">{user.businessRole}</span></>
                          )}
                        </p>
                      </div>
                    </td>

                    {/* Durasi Langganan */}
                    <td className="py-4 px-6 text-slate-400">
                      <div className="space-y-0.5 text-[10px]">
                        <div>
                          <span className="text-slate-500">Mulai: </span>
                          <span className="text-slate-300 font-medium">{user.planStartedAt ? new Date(user.planStartedAt).toLocaleDateString('id-ID') : '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Selesai: </span>
                          <span className="text-slate-300 font-medium">{user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString('id-ID') : '∞'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Transaksi */}
                    <td className="py-4 px-6 text-center">
                      <div className="inline-block text-left">
                        <p className="font-bold text-slate-200 text-xs">{paymentCount}x Transaksi</p>
                        <p className="text-[10px] text-emerald-400 font-extrabold">{formatRupiah(totalPaid)}</p>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3 text-slate-400">
                        <div className="text-center" title="Barang Masuk">
                          <span className="block text-slate-200 font-bold text-xs">{stats.barangMasuk}</span>
                          <span className="text-[8px] uppercase font-bold text-slate-500">Order</span>
                        </div>
                        <span className="text-white/10">|</span>
                        <div className="text-center" title="Model Kain">
                          <span className="block text-slate-200 font-bold text-xs">{stats.models}</span>
                          <span className="text-[8px] uppercase font-bold text-slate-500">Model</span>
                        </div>
                        <span className="text-white/10">|</span>
                        <div className="text-center" title="Invoice Pelanggan">
                          <span className="block text-slate-200 font-bold text-xs">{stats.invoices}</span>
                          <span className="text-[8px] uppercase font-bold text-slate-500">Inv</span>
                        </div>
                        <span className="text-white/10">|</span>
                        <div className="text-center" title="Penjahit">
                          <span className="block text-slate-200 font-bold text-xs">{stats.taylors}</span>
                          <span className="text-[8px] uppercase font-bold text-slate-500">Penjahit</span>
                        </div>
                      </div>
                    </td>

                    {/* CreatedAt */}
                    <td className="py-4 px-6 text-slate-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUserForDetails({ ...user, stats })}
                          className="p-1.5 hover:bg-white/[0.04] rounded-xl text-slate-400 hover:text-cyan-400 transition-colors"
                          title="Detail Penggunaan"
                        >
                          <span className="material-symbols-outlined text-[18px]">info</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 hover:bg-white/[0.04] rounded-xl text-slate-400 hover:text-purple-400 transition-colors"
                          title={isSuperAdmin ? "Ubah Lisensi & Paket" : "Ubah Lisensi & Paket (Super Admin Only)"}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 italic">
                    Tidak ada tenant terdaftar yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Drawer Modal */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-white/10 h-full p-6 flex flex-col justify-between shadow-2xl animate-fade-in">
            <div className="space-y-6 overflow-y-auto pr-1">
              {/* Header Details */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400">account_circle</span>
                  Detail Profil Tenant
                </h3>
                <button
                  onClick={() => setSelectedUserForDetails(null)}
                  className="w-8 h-8 rounded-full hover:bg-white/[0.04] text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* User Bio */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-lg font-black shadow-lg">
                    {selectedUserForDetails.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-100">{selectedUserForDetails.nama}</h4>
                    <p className="text-xs text-slate-400">@{selectedUserForDetails.username}</p>
                  </div>
                </div>

                <div className="divide-y divide-white/[0.06] space-y-2.5 pt-2 text-xs text-slate-400">
                  <div className="pt-2 flex justify-between">
                    <span>Email:</span>
                    <span className="text-slate-200 font-medium">{selectedUserForDetails.email}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span>Nama Usaha:</span>
                    <span className="text-slate-200 font-medium">{selectedUserForDetails.businessName || '-'}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span>SaaS Role:</span>
                    <span className="text-slate-200 font-medium">{selectedUserForDetails.role}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span>In-App Role:</span>
                    <span className="text-slate-200 font-medium">{selectedUserForDetails.businessRole || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Resource Usage Graph Detail */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Statistik Penggunaan Data</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Barang Masuk', count: selectedUserForDetails.stats.barangMasuk, icon: 'inventory' },
                    { label: 'Model Pakaian', count: selectedUserForDetails.stats.models, icon: 'style' },
                    { label: 'Invoices', count: selectedUserForDetails.stats.invoices, icon: 'receipt' },
                    { label: 'Penjahit', count: selectedUserForDetails.stats.taylors, icon: 'sports_kabaddi' },
                    { label: 'Kasbon Penjahit', count: selectedUserForDetails.stats.kasbon, icon: 'account_balance_wallet' },
                    { label: 'Pelanggan', count: selectedUserForDetails.stats.customers, icon: 'group_work' }
                  ].map((stat, i) => (
                    <div key={i} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-500 text-base">{stat.icon}</span>
                        <span className="text-xs text-slate-400">{stat.label}</span>
                      </div>
                      <span className="text-xs font-black text-slate-200">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Payment Log Ledger */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Riwayat Verifikasi Upgrade</h4>
                <div className="space-y-2">
                  {(state.paymentOrders || [])
                    .filter(po => po.userId === selectedUserForDetails.id)
                    .map((po, idx) => (
                      <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl text-xs flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-slate-200">Upgrade to {po.plan}</p>
                          <p className="text-[10px] text-slate-400">{new Date(po.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                          po.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : po.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-300'
                            : 'bg-amber-500/10 text-amber-300'
                        }`}>
                          {po.status}
                        </span>
                      </div>
                    ))}
                  {(state.paymentOrders || []).filter(po => po.userId === selectedUserForDetails.id).length === 0 && (
                    <p className="text-xs text-slate-500 italic">Belum ada riwayat transaksi pembayaran.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-white/[0.08] pt-4 mt-6">
              <button
                onClick={() => {
                  setSelectedUserForDetails(null);
                  handleOpenEdit(selectedUserForDetails);
                }}
                disabled={!isSuperAdmin}
                className={`w-full py-3 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isSuperAdmin 
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/20 cursor-pointer shadow-lg' 
                    : 'bg-slate-800 text-slate-600 border border-slate-700 opacity-50 cursor-not-allowed'
                }`}
                title={!isSuperAdmin ? 'Hanya Super Admin yang dapat memodifikasi data.' : 'Ubah Lisensi'}
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Override Lisensi & Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit License / Role Modal */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400">admin_panel_settings</span>
                Ubah Lisensi & Hak Akses
              </h3>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                disabled={editLoading}
                className="w-8 h-8 rounded-full hover:bg-white/[0.04] text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-50"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {!isSuperAdmin && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-base">warning</span>
                <span>Hanya Super Admin yang dapat mengubah setelan lisensi/role pengguna.</span>
              </div>
            )}

            <div className="space-y-4">
              {/* User Name */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Nama Pengguna</label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  disabled={!isSuperAdmin || editLoading}
                  className="input-base disabled:opacity-50"
                  required
                />
              </div>

              {/* User Phone Number */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Nomor Telepon</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  disabled={!isSuperAdmin || editLoading}
                  placeholder="Belum ada nomor telepon"
                  className="input-base disabled:opacity-50"
                />
              </div>

              {/* SaaS Plan Tier */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Paket Langganan (Plan Tier)</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  disabled={!isSuperAdmin || editLoading}
                  className="input-base cursor-pointer disabled:opacity-50"
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
                  disabled={!isSuperAdmin || editLoading}
                  className="input-base cursor-pointer disabled:opacity-50"
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
                  disabled={!isSuperAdmin || editLoading}
                  className="input-base disabled:opacity-50"
                />
              </div>

              {/* System Platform Role */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Platform System Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  disabled={!isSuperAdmin || editLoading}
                  className="input-base cursor-pointer disabled:opacity-50"
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
                disabled={editLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/[0.04] disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!isSuperAdmin || editLoading}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-1.5 ${
                  isSuperAdmin && !editLoading
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 cursor-pointer' 
                    : 'bg-slate-800 border border-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                {editLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
