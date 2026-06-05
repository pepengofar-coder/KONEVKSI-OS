import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch, useHelpers } from '../context/AppContext';

const CATEGORIES = [
  { id: 'kaos', label: 'Kaos', icon: 'apparel' },
  { id: 'polo', label: 'Polo Shirt', icon: 'sports_polo' },
  { id: 'kemeja', label: 'Kemeja', icon: 'shirt' },
  { id: 'sekolah', label: 'Seragam Sekolah', icon: 'school' },
  { id: 'kantor', label: 'Seragam Kantor', icon: 'badge' },
  { id: 'jaket', label: 'Jaket', icon: 'hangout' },
  { id: 'hoodie', label: 'Hoodie', icon: 'gentle_wind' },
  { id: 'wearpack', label: 'Wearpack', icon: 'construction' },
  { id: 'tas', label: 'Tas', icon: 'shopping_bag' },
  { id: 'totebag', label: 'Totebag', icon: 'local_mall' },
  { id: 'topi', label: 'Topi', icon: 'storefront' },
  { id: 'bordir', label: 'Bordir', icon: 'architecture' },
  { id: 'sablon', label: 'Sablon', icon: 'palette' },
  { id: 'custom', label: 'Custom', icon: 'design_services' },
];

const ROLES = [
  {
    id: 'Owner',
    label: 'Owner',
    desc: 'Akses penuh untuk memantau produksi, mengelola penjahit, melihat seluruh data laporan finansial, dan mengontrol sistem.',
    icon: 'crown'
  },
  {
    id: 'Admin Keuangan',
    label: 'Admin Keuangan',
    desc: 'Fokus pada pencatatan invoice pelanggan, slip kasbon taylor, cost operasional, pengeluaran kas, serta laporan keuangan bisnis.',
    icon: 'payments'
  },
  {
    id: 'Staff Administrasi',
    label: 'Staff Administrasi',
    desc: 'Fokus pada monitoring status order, monitoring progress taylor, input order kain, dan manajemen data pelanggan konveksi.',
    icon: 'engineering'
  }
];

export default function Onboarding() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useHelpers();

  const [step, setStep] = useState(1);
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!state.currentUser) {
      navigate('/login');
    } else if (
      state.currentUser.categories && 
      state.currentUser.categories.length > 0 && 
      state.currentUser.role
    ) {
      // If already has categories and role, skip onboarding
      navigate('/dashboard');
    }
  }, [state.currentUser, navigate]);

  const toggleCategory = (label) => {
    if (selectedCats.includes(label)) {
      setSelectedCats(selectedCats.filter(c => c !== label));
    } else {
      setSelectedCats([...selectedCats, label]);
    }
  };

  const animateStep = (nextStep) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 200);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (selectedCats.length === 0) {
        showToast('Pilih setidaknya satu jenis usaha konveksi!', 'error');
        return;
      }
      animateStep(2);
    } else if (step === 2) {
      if (!selectedRole) {
        showToast('Pilih role utama Anda!', 'error');
        return;
      }
      animateStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      animateStep(step - 1);
    }
  };

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        ...state.currentUser,
        categories: selectedCats,
        role: selectedRole
      }
    });

    showToast('Konfigurasi onboarding berhasil disimpan!', 'success');
    navigate('/dashboard');
  };

  if (!state.currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative px-4 overflow-hidden py-12">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-slate-950 to-cyan-950/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-3xl animate-fade-in-up">
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-cyan-500/30 rounded-3xl blur-xl opacity-60 pointer-events-none" />

        {/* Card */}
        <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/[0.08] p-8 md:p-10 rounded-3xl shadow-2xl shadow-black/60">
          
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
                step >= 1 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-slate-950/40 border-white/[0.06] text-slate-500'
              }`}>1</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 hidden sm:inline">Kategori Konveksi</span>
            </div>
            <div className="flex-1 h-0.5 bg-white/[0.06] mx-4" />
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
                step >= 2 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-slate-950/40 border-white/[0.06] text-slate-500'
              }`}>2</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 hidden sm:inline">Role Utama</span>
            </div>
            <div className="flex-1 h-0.5 bg-white/[0.06] mx-4" />
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
                step >= 3 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-slate-950/40 border-white/[0.06] text-slate-500'
              }`}>3</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 hidden sm:inline">Dashboard</span>
            </div>
          </div>

          {/* Step content wrapper with transition */}
          <div className={`transition-all duration-200 ease-in-out ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            {/* STEP 1: Categories Choice */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Pilih Jenis Usaha Konveksi</h2>
                  <p className="text-xs text-slate-400 mt-2">Pilih jenis produk yang diproduksi di bengkel konveksi Anda (bisa pilih lebih dari satu).</p>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 max-h-[40vh] overflow-y-auto pr-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCats.includes(cat.label);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.label)}
                        className={`flex flex-col items-center justify-center p-4 min-h-[44px] rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500/80 text-white shadow-lg shadow-cyan-500/5'
                            : 'bg-slate-950/40 border-white/[0.06] text-slate-400 hover:bg-white/[0.02]'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[24px] mb-2 ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`}>{cat.icon}</span>
                        <span className="text-[11px] font-bold tracking-wide">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Role Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Pilih Role Utama Anda</h2>
                  <p className="text-xs text-slate-400 mt-2">Pilih role utama yang akan menentukan tata letak menu dan data di dashboard Anda.</p>
                </div>

                <div className="space-y-3">
                  {ROLES.map((role) => {
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={`w-full flex items-start gap-4 p-4 min-h-[44px] rounded-2xl border transition-all text-left group ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500/80 text-white shadow-lg shadow-cyan-500/5'
                            : 'bg-slate-950/40 border-white/[0.06] text-slate-400 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300' : 'bg-slate-900 border-white/[0.06] text-slate-500'
                        }`}>
                          <span className="material-symbols-outlined text-[20px]">
                            {role.id === 'Owner' ? 'crown' : role.id === 'Admin Keuangan' ? 'payments' : 'engineering'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black uppercase tracking-wider leading-none">{role.label}</p>
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-medium">{role.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-slate-950 text-[14px] font-bold">check</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Summary / Welcome */}
            {step === 3 && (
              <div className="space-y-6 text-center">
                <div className="inline-flex w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 items-center justify-center shadow-lg shadow-purple-500/20 mb-4 animate-scale-in">
                  <span className="material-symbols-outlined text-white text-3xl filled">celebration</span>
                </div>
                <h2 className="text-2xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Konfigurasi Berhasil!</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Akun Anda telah dikonfigurasi sebagai <strong className="text-cyan-300 font-bold">{selectedRole}</strong> dengan jenis produksi <strong className="text-purple-300 font-bold">{selectedCats.join(', ')}</strong>.
                </p>

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-left max-w-md mx-auto text-xs space-y-2.5 font-semibold text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nama Akun:</span>
                    <span>{state.currentUser.nama}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span>{state.currentUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hak Akses:</span>
                    <span className="text-cyan-400">{selectedRole}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-white/[0.06] mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-2.5 rounded-xl border border-white/[0.08] text-xs font-bold hover:bg-white/[0.04] transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Kembali
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl text-xs font-bold hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-1.5 shadow-lg shadow-purple-500/10"
              >
                Selanjutnya
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-2xl text-sm font-bold hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2 shadow-lg shadow-purple-500/15"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                Masuk ke Dashboard
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
