import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers, legacyEncryptPassword } from '../context/AppContext';
import { updateProfile } from '../utils/supabaseClient';

const AVAILABLE_CATEGORIES = [
  'Kaos & Jersey',
  'Kemeja & PDL',
  'Jaket & Hoodie',
  'Seragam Sekolah/Kantor',
  'Gamis & Busana Muslim',
  'Celana & Denim',
  'Custom & Merchandise'
];

export default function Profile() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { showToast } = useHelpers();

  const user = state.currentUser || {
    nama: '',
    email: '',
    role: 'Owner',
    categories: [],
    businessProfile: { namaUsaha: '', telepon: '', email: '', alamat: '' }
  };

  const [nama, setNama] = useState(user.nama);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [categories, setCategories] = useState(user.categories || []);
  
  // Business settings
  const [namaUsaha, setNamaUsaha] = useState(user.businessProfile?.namaUsaha || '');
  const [teleponUsaha, setTeleponUsaha] = useState(user.businessProfile?.telepon || '');
  const [emailUsaha, setEmailUsaha] = useState(user.businessProfile?.email || '');
  const [alamatUsaha, setAlamatUsaha] = useState(user.businessProfile?.alamat || '');
  
  const handleToggleCategory = (cat) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!nama || !email) {
      showToast('Nama dan Email harus diisi!', 'error');
      return;
    }

    if (password && password !== confirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok!', 'error');
      return;
    }

    const updates = {
      nama,
      name: nama,
      email,
      categories,
      businessProfile: {
        namaUsaha,
        telepon: teleponUsaha,
        email: emailUsaha,
        alamat: alamatUsaha
      },
      businessName: namaUsaha,
      phone: teleponUsaha,
      updatedAt: Date.now()
    };

    if (password) {
      updates.password = legacyEncryptPassword(password);
    }

    try {
      await updateProfile(user.id, updates);

      const payload = {
        nama,
        email,
        role: user.role,
        categories,
        businessProfile: {
          namaUsaha,
          telepon: teleponUsaha,
          email: emailUsaha,
          alamat: alamatUsaha
        }
      };

      if (password) {
        payload.password = password;
      }

      dispatch({
        type: 'UPDATE_PROFILE',
        payload
      });

      showToast('Profil dan pengaturan usaha berhasil diperbarui!', 'success');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      showToast('Gagal memperbarui profil ke database.', 'error');
    }
  };

  const handleExportBackup = () => {
    try {
      const backupObj = {
        app: 'konveksi-os',
        timestamp: Date.now(),
        data: state
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupObj, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('download', `konveksi_os_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Cadangan data berhasil diunduh!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengekspor data cadangan!', 'error');
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.app !== 'konveksi-os' || !parsed.data) {
          showToast('File JSON bukan cadangan Konveksi OS yang valid!', 'error');
          return;
        }

        const d = parsed.data;
        if (!d.users || !d.taylors || !d.models || !d.barangMasuk) {
          showToast('Data cadangan tidak lengkap atau rusak!', 'error');
          return;
        }

        localStorage.setItem('konveksi-os-data', JSON.stringify(d));
        if (d.currentUser) {
          sessionStorage.setItem('konveksi-os-session-user', JSON.stringify(d.currentUser));
        }

        showToast('Cadangan berhasil diimpor! Memuat ulang sistem...', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        console.error(err);
        showToast('Gagal membaca atau mem-parse file cadangan!', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Pengaturan Usaha</h1>
        <p className="text-xs text-slate-400 mt-1">Kelola informasi profil, kategori produksi, dan identitas usaha Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/[0.02] to-cyan-500/[0.02]" />
            <div className="relative flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-purple-500/20 mb-4">
                {user.nama ? user.nama.charAt(0).toUpperCase() : 'A'}
              </div>
              <h3 className="text-lg font-bold text-slate-100">{user.nama}</h3>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <p className="text-xs text-cyan-400 font-semibold">{user.businessRole || user.role}</p>
                <span className="text-slate-500 text-xs">•</span>
                <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase ${
                  (user.plan || 'FREE') === 'PREMIUM'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : (user.plan || 'FREE') === 'BUSINESS'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                }`}>
                  {user.plan || 'FREE'}
                </span>
              </div>
              
              <div className="w-full border-t border-white/[0.06] my-6 pt-6 space-y-3 text-left">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Nama Usaha</span>
                  <span className="text-sm font-semibold text-slate-200">{namaUsaha || 'Belum diatur'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Email Akun</span>
                  <span className="text-sm font-semibold text-slate-200">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Categories card */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-lg">category</span>
              Kategori Terpilih
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center gap-1.5"
                >
                  {cat}
                  <button onClick={() => handleToggleCategory(cat)} className="hover:text-red-400 transition-colors">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
              {categories.length === 0 && (
                <span className="text-xs text-slate-500 italic">Belum ada kategori yang dipilih</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="lg:col-span-2">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            {/* Box 1: Akun User */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-lg">person</span>
                Informasi Akun
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="input-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Alamat Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Kata Sandi Baru (Kosongkan jika tidak diubah)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Konfirmasi Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-base"
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Identitas Usaha */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-lg">store</span>
                Identitas Usaha (Invoice Pelanggan)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Nama Usaha / Konveksi</label>
                  <input
                    type="text"
                    value={namaUsaha}
                    onChange={(e) => setNamaUsaha(e.target.value)}
                    placeholder="Contoh: Stitch & Sew"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Nomor Telepon Usaha</label>
                  <input
                    type="text"
                    value={teleponUsaha}
                    onChange={(e) => setTeleponUsaha(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="input-base"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Email Bisnis</label>
                  <input
                    type="email"
                    value={emailUsaha}
                    onChange={(e) => setEmailUsaha(e.target.value)}
                    placeholder="Contoh: billing@namausaha.com"
                    className="input-base"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Alamat Lengkap Usaha</label>
                  <textarea
                    value={alamatUsaha}
                    onChange={(e) => setAlamatUsaha(e.target.value)}
                    placeholder="Contoh: Jl. Sukajadi No. 123, Bandung, Jawa Barat"
                    rows="3"
                    className="input-base resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Box 3: Pilih Kategori Produksi */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-lg">check_box</span>
                Sesuaikan Kategori Produksi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVAILABLE_CATEGORIES.map((cat, idx) => {
                  const isChecked = categories.includes(cat);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleCategory(cat)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                        isChecked
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 font-bold'
                          : 'bg-slate-950/40 border-white/[0.06] text-slate-400 hover:bg-white/[0.02]'
                      }`}
                    >
                      <span className="text-xs">{cat}</span>
                      <span className="material-symbols-outlined text-[16px]">
                        {isChecked ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="submit"
                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Simpan Perubahan
              </button>
            </div>

            {/* Box 4: Pencadangan & Pemulihan Data */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6 mt-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-400 text-lg">backup</span>
                  Pencadangan & Pemulihan Data
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Ekspor seluruh data konveksi Anda (pelanggan, bahan baku, keuangan, progres) ke file JSON lokal, atau impor kembali untuk memulihkan data.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 text-xs font-bold transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Ekspor Cadangan (JSON)
                </button>

                <label
                  htmlFor="import-backup-file"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer text-center"
                >
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Impor Cadangan (JSON)
                  <input
                    type="file"
                    id="import-backup-file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
