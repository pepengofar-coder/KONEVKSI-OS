import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch, useHelpers, checkPassword } from '../../context/AppContext';

export default function AdminLogin() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useHelpers();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (state.currentUser && (state.currentUser.role === 'ADMIN' || state.currentUser.role === 'SUPER_ADMIN')) {
      navigate('/admin/dashboard');
    }
  }, [state.currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);

    setTimeout(() => {
      const user = state.users.find(
        (u) => 
          u.username.toLowerCase() === username.toLowerCase() && 
          checkPassword(password, u.password)
      );

      if (user) {
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          dispatch({ type: 'SET_CURRENT_USER', payload: { user, rememberMe: true } });
          showToast(`Selamat datang di Portal Admin, ${user.nama || user.name}!`, 'success');
          navigate('/admin/dashboard');
        } else {
          showToast('Akses Ditolak: Akun Anda bukan Administrator!', 'error');
          setLoading(false);
        }
      } else {
        showToast('Username atau password salah!', 'error');
        setLoading(false);
      }
    }, 800);
  };

  const handleUseSeedAdmin = () => {
    setUsername('zenirastrore');
    setPassword('abu_ziyadh280292');
    showToast('Kredensial admin default berhasil diisi.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative px-4 overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-slate-950 to-cyan-950/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />

      {/* Floating Rings */}
      <div className="absolute -top-10 -right-10 w-80 h-80 border border-purple-500/10 rounded-full animate-spin-very-slow pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 border border-cyan-500/10 rounded-full animate-spin-very-slow-reverse pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-cyan-500/30 rounded-3xl blur-xl opacity-60" />

        {/* Card */}
        <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/[0.08] p-8 rounded-3xl shadow-2xl shadow-black/60">
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
              <span className="material-symbols-outlined text-white text-2xl filled">shield</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Konveksi OS</h2>
            <p className="text-xs text-slate-400 font-bold mt-1">Portal Administrasi Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Username Administrator</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="zenirastrore"
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 disabled:opacity-50 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  Mengautentikasi...
                </>
              ) : (
                'Masuk Portal Admin'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-col gap-2">
            <button
              onClick={handleUseSeedAdmin}
              className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">vpn_key</span>
              Isi Admin Kredensial Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
