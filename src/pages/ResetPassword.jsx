import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch, useHelpers } from '../context/AppContext';

export default function ResetPassword() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useHelpers();

  const [step, setStep] = useState(1); // 1: Email Input, 2: Reset Form
  const [email, setEmail] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerifyEmail = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    setTimeout(() => {
      const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        setFoundUser(user);
        setStep(2);
        showToast('Identitas email terverifikasi!', 'success');
      } else {
        showToast('Email tidak terdaftar!', 'error');
      }
      setLoading(false);
    }, 800);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;

    if (newPassword.length < 5) {
      showToast('Kata sandi minimal 5 karakter!', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok!', 'error');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Dispatch profile update to change password (UPDATE_PROFILE action handles password encryption!)
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: {
          ...foundUser,
          password: newPassword
        }
      });

      showToast('Kata sandi berhasil diperbarui!', 'success');
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative px-4 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-slate-950 to-cyan-950/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-cyan-500/30 rounded-3xl blur-xl opacity-60 pointer-events-none" />

        {/* Card */}
        <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/[0.08] p-8 rounded-3xl shadow-2xl shadow-black/60">
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 items-center justify-center shadow-lg shadow-purple-500/20 mb-3">
              <span className="material-symbols-outlined text-white text-2xl filled">lock_reset</span>
            </div>
            <h2 className="text-2xl font-black font-display tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Reset Sandi</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Setel ulang kata sandi akun Konveksi OS Anda</p>
          </div>

          {step === 1 ? (
            /* Step 1: Input Email */
            <form onSubmit={handleVerifyEmail} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Masukkan Alamat Email Terdaftar</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@konveksios.com"
                  className="input-base"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 disabled:opacity-50 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    Memverifikasi...
                  </>
                ) : (
                  'Verifikasi Email'
                )}
              </button>
            </form>
          ) : (
            /* Step 2: Set New Password */
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 mb-4 text-xs font-semibold text-slate-300">
                <span className="text-slate-500 block text-[10px] font-black uppercase tracking-wider">Mereset Sandi Akun:</span>
                <p className="text-slate-200 mt-1">{foundUser.nama} ({foundUser.email})</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 5 karakter"
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

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Konfirmasi Kata Sandi Baru</label>
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
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 disabled:opacity-50 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    Memperbarui...
                  </>
                ) : (
                  'Simpan Kata Sandi Baru'
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center text-xs text-slate-400 font-medium">
            Ingat kata sandi Anda?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
