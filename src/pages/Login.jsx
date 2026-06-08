import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch, useHelpers, verifyPassword, needsMigration, hashPassword } from '../context/AppContext';
import { fetchProfile, createProfile } from '../utils/supabaseClient';

export default function Login() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useHelpers();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorField, setErrorField] = useState(''); // 'identifier' | 'password' | ''
  const [errorMessage, setErrorMessage] = useState('');

  const user = state.currentUser;

  // Redirect if already logged in
  useEffect(() => {
    if (!user) return; // belum login → jangan redirect
    if (user.role === "SUPER_ADMIN") navigate("/super-admin/dashboard");
    else navigate("/dashboard");
  }, [user, navigate]);

  const clearError = () => {
    setErrorField('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;

    clearError();
    setLoading(true);

    try {
      // Step 1: Find user by username or email
      let authenticatedUser = state.users.find(
        (u) =>
          u.email.toLowerCase() === identifier.toLowerCase() ||
          (u.username && u.username.toLowerCase() === identifier.toLowerCase())
      );

      if (!authenticatedUser) {
        setErrorField('identifier');
        setErrorMessage('Username atau email tidak terdaftar.');
        showToast('Username atau email tidak terdaftar.', 'error');
        setPassword('');
        setLoading(false);
        return;
      }

      // Step 2: Verify password (async — uses Web Crypto API)
      const isValid = await verifyPassword(password, authenticatedUser.password);

      if (!isValid) {
        setErrorField('password');
        setErrorMessage('Password salah. Silakan coba lagi.');
        showToast('Password salah.', 'error');
        setPassword('');
        setLoading(false);
        return;
      }

      // Step 3: Block SUPER_ADMIN — they must use /super-admin/login
      if (authenticatedUser.role === 'SUPER_ADMIN') {
        setErrorField('identifier');
        setErrorMessage('Akun Super Admin tidak dapat login di sini. Silakan gunakan Portal Super Admin.');
        showToast('Silakan gunakan halaman login Super Admin.', 'error');
        setPassword('');
        setLoading(false);
        return;
      }

      // Step 4: Sync user profile from Supabase on successful login
      try {
        const dbProfile = await fetchProfile(authenticatedUser.id);
        if (dbProfile) {
          // Merge Supabase database profile into our authenticatedUser
          authenticatedUser = {
            ...authenticatedUser,
            name: dbProfile.name || authenticatedUser.name,
            nama: dbProfile.name || authenticatedUser.nama,
            role: dbProfile.role || authenticatedUser.role,
            plan: dbProfile.plan || authenticatedUser.plan,
            planStatus: dbProfile.planStatus || authenticatedUser.planStatus,
            planExpiresAt: dbProfile.planExpiresAt !== undefined ? dbProfile.planExpiresAt : authenticatedUser.planExpiresAt
          };
          // Sync it directly in React state
          dispatch({ type: 'SYNC_USER_DIRECT', payload: authenticatedUser });
        } else {
          // Create user profile in Supabase database if it does not exist yet
          await createProfile(authenticatedUser);
        }
      } catch (syncErr) {
        console.warn('Failed to sync or create user profile in Supabase on login:', syncErr);
      }

      // Step 5: Login success — set current user
      dispatch({ type: 'SET_CURRENT_USER', payload: { user: authenticatedUser, rememberMe } });
      showToast(`Selamat datang kembali, ${authenticatedUser.nama || authenticatedUser.name}!`, 'success');

      // Step 6: Lazy password migration — upgrade legacy hash to PBKDF2
      if (needsMigration(authenticatedUser.password)) {
        try {
          const newHash = await hashPassword(password);
          dispatch({ type: 'MIGRATE_PASSWORD', payload: { userId: authenticatedUser.id, newHashedPassword: newHash } });
        } catch {
          // Migration failure is non-critical — user can still use the app
          console.warn('Password migration skipped.');
        }
      }

      // Step 7: Redirect
      if (!authenticatedUser.categories || authenticatedUser.categories.length === 0 || !authenticatedUser.businessRole) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      showToast('Terjadi kesalahan saat login. Silakan coba lagi.', 'error');
      setPassword('');
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative px-4 overflow-hidden">
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
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
              <span className="material-symbols-outlined text-white text-2xl filled">checkroom</span>
            </div>
            <h2 className="text-2xl font-black font-display tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Konveksi OS</h2>
            <p className="text-xs text-slate-400 font-medium mt-1.5">Sistem Manajemen Konveksi Modern</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Username atau Email</label>
              <input
                id="login-identifier"
                type="text"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); if (errorField === 'identifier') clearError(); }}
                placeholder="username atau email@contoh.com"
                className={`input-base ${errorField === 'identifier' ? 'ring-2 ring-red-500/50 border-red-500/40' : ''}`}
                required
              />
              {errorField === 'identifier' && (
                <p className="mt-1.5 text-[11px] text-red-400 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errorMessage}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Kata Sandi</label>
                <Link to="/reset-password" className="text-xs text-purple-400 hover:text-purple-300 font-bold">Lupa Sandi?</Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errorField === 'password') clearError(); }}
                  placeholder="••••••••"
                  className={`input-base pr-10 ${errorField === 'password' ? 'ring-2 ring-red-500/50 border-red-500/40' : ''}`}
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
              {errorField === 'password' && (
                <p className="mt-1.5 text-[11px] text-red-400 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errorMessage}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/[0.08] text-purple-600 focus:ring-purple-500 bg-slate-950"
              />
              <label htmlFor="remember-me" className="text-xs font-semibold text-slate-400 cursor-pointer select-none">Ingat Saya</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 disabled:opacity-50 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  Memproses...
                </>
              ) : (
                'Masuk ke Aplikasi'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center text-xs text-slate-400 font-medium space-y-2">
            <div>
              Belum punya akun?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold">Daftar Sekarang</Link>
            </div>
            <div className="pt-2">
              <Link to="/super-admin/login" className="text-slate-500 hover:text-slate-400 transition-colors text-[10px] tracking-wide uppercase font-bold">Portal Super Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
