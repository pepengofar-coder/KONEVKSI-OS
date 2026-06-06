import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch, useHelpers, hashPassword } from '../context/AppContext';

export default function Register() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useHelpers();

  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [namaUsaha, setNamaUsaha] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (state.currentUser) {
      if (!state.currentUser.categories || state.currentUser.categories.length === 0 || !state.currentUser.role) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [state.currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!nama || !username || !namaUsaha || !email || !password || !confirmPassword) {
      showToast('Semua kolom wajib diisi!', 'error');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      showToast('Username minimal 3 karakter!', 'error');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      showToast('Username hanya boleh huruf, angka, dan underscore!', 'error');
      return;
    }

    if (password.length < 5) {
      showToast('Kata sandi minimal 5 karakter!', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok!', 'error');
      return;
    }

    const usernameExist = state.users.some(u => u.username?.toLowerCase() === cleanUsername);
    if (usernameExist) {
      showToast('Username sudah digunakan oleh akun lain!', 'error');
      return;
    }

    const emailExist = state.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExist) {
      showToast('Email sudah terdaftar!', 'error');
      return;
    }

    setLoading(true);

    try {
      // Hash password securely with PBKDF2 before storing
      const hashedPassword = await hashPassword(password);

      dispatch({
        type: 'REGISTER_ASYNC',
        payload: { nama, username: cleanUsername, namaUsaha, email, hashedPassword }
      });
      showToast('Registrasi akun berhasil!', 'success');
      navigate('/onboarding');
    } catch (err) {
      console.error('Registration error:', err);
      showToast('Terjadi kesalahan saat mendaftarkan akun.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative px-4 overflow-hidden py-12">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-slate-950 to-cyan-950/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      {/* Floating Rings */}
      <div className="absolute -top-10 -right-10 w-80 h-80 border border-purple-500/10 rounded-full animate-spin-very-slow pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 border border-cyan-500/10 rounded-full animate-spin-very-slow-reverse pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-cyan-500/30 rounded-3xl blur-xl opacity-60" />

        {/* Card */}
        <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/[0.08] p-8 rounded-3xl shadow-2xl shadow-black/60">
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 items-center justify-center shadow-lg shadow-purple-500/20 mb-3">
              <span className="material-symbols-outlined text-white text-2xl filled">checkroom</span>
            </div>
            <h2 className="text-2xl font-black font-display tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Daftar Akun</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Langkah awal manajemen konveksi digital Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Ahmad Ziyad"
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ahmad_ziyad"
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Nama Bisnis / Usaha</label>
              <input
                type="text"
                value={namaUsaha}
                onChange={(e) => setNamaUsaha(e.target.value)}
                placeholder="Ziyad Convection"
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Alamat Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmad@gmail.com"
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 5 karakter"
                  className="input-base pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="input-base pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 disabled:opacity-50 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  Mendaftarkan...
                </>
              ) : (
                'Buat Akun Baru'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-slate-400 font-medium">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
