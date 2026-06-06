import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch, useHelpers } from '../context/AppContext';

// Reusable SVG Icons for Onboarding Categories
function ShirtIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </svg>
  );
}

function PoloIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      <path d="M10 5v3.5h4V5" />
      <path d="M12 8.5v3.5" />
    </svg>
  );
}

function KemejaIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      <path d="M12 2v20M12 7h.01M12 11h.01M12 15h.01M12 19h.01" />
    </svg>
  );
}

function GraduationCapIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      <path d="M21.5 12v6" />
    </svg>
  );
}

function BriefcaseIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

function JacketIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      <path d="M12 2v20M4 11h4M16 11h4" />
    </svg>
  );
}

function HoodieIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      <path d="M9 2a3 3 0 0 0 6 0M8 6c0 1.5 1.5 3 4 3s4-1.5 4-3" />
    </svg>
  );
}

function WrenchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function ShoppingBagIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function CrownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zM3 20h18" />
    </svg>
  );
}

function PenToolIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v8M9 11l3-3 3 3" />
    </svg>
  );
}

function PaletteIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM7.5 10.5c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM11.5 7.5c.828 0 1.5-.672 1.5-1.5S12.328 4.5 11.5 4.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM16.5 9.5c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5z" />
    </svg>
  );
}

function SparklesIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v1M12 20v1M21 12h-1M4 12H3M18.364 5.636l-.707.707M6.343 17.657l-.707.707M5.636 5.636l.707.707M17.657 17.657l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  );
}

// Role selection SVG Icons
function WalletIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v-6" />
    </svg>
  );
}

function ClipboardIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

// Step 3 celebration icon
function CelebrationIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
    </svg>
  );
}

// Arrow icons
function ArrowLeftIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// Dashboard mini icon
function DashboardIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );
}

const CATEGORIES = [
  { id: 'kaos', label: 'Kaos', icon: ShirtIcon },
  { id: 'polo', label: 'Polo Shirt', icon: PoloIcon },
  { id: 'kemeja', label: 'Kemeja', icon: KemejaIcon },
  { id: 'sekolah', label: 'Seragam Sekolah', icon: GraduationCapIcon },
  { id: 'kantor', label: 'Seragam Kantor', icon: BriefcaseIcon },
  { id: 'jaket', label: 'Jaket', icon: JacketIcon },
  { id: 'hoodie', label: 'Hoodie', icon: HoodieIcon },
  { id: 'wearpack', label: 'Wearpack', icon: WrenchIcon },
  { id: 'tas', label: 'Tas', icon: ShoppingBagIcon },
  { id: 'totebag', label: 'Totebag', icon: ShoppingBagIcon },
  { id: 'topi', label: 'Topi', icon: CrownIcon },
  { id: 'bordir', label: 'Bordir', icon: PenToolIcon },
  { id: 'sablon', label: 'Sablon', icon: PaletteIcon },
  { id: 'custom', label: 'Custom', icon: SparklesIcon },
];

const ROLES = [
  {
    id: 'Owner',
    label: 'Owner',
    desc: 'Akses penuh untuk memantau produksi, mengelola penjahit, melihat seluruh data laporan finansial, dan mengontrol sistem.',
    icon: CrownIcon
  },
  {
    id: 'Admin Keuangan',
    label: 'Admin Keuangan',
    desc: 'Fokus pada pencatatan invoice pelanggan, slip kasbon taylor, cost operasional, pengeluaran kas, serta laporan keuangan bisnis.',
    icon: WalletIcon
  },
  {
    id: 'Staff Administrasi',
    label: 'Staff Administrasi',
    desc: 'Fokus pada monitoring status order, monitoring progress taylor, input order kain, dan manajemen data pelanggan konveksi.',
    icon: ClipboardIcon
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

                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 max-h-[40vh] overflow-y-auto pr-2 pb-4">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCats.includes(cat.label);
                    const IconComponent = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.label)}
                        className={`group flex flex-col items-center justify-center p-4 min-h-[100px] rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500/60 text-white shadow-lg shadow-cyan-500/5'
                            : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-cyan-400/50 hover:bg-white/[0.08]'
                        }`}
                      >
                        <IconComponent className={`w-7 h-7 mb-2.5 transition-all ${isSelected ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-300'}`} />
                        <span className={`text-[11px] font-bold tracking-wide transition-all ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{cat.label}</span>
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
                    const RoleIcon = role.icon;
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
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                          isSelected ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300' : 'bg-slate-900 border-white/[0.06] text-slate-500 group-hover:text-cyan-300 group-hover:border-cyan-500/30'
                        }`}>
                          <RoleIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black uppercase tracking-wider leading-none transition-all group-hover:text-white">{role.label}</p>
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-medium">{role.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-400/20">
                            <svg className="w-3 h-3 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
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
                  <CelebrationIcon className="w-8 h-8 text-white" />
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
                <ArrowLeftIcon className="w-4 h-4" />
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
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-2xl text-sm font-bold hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2 shadow-lg shadow-purple-500/15"
              >
                <DashboardIcon className="w-4 h-4" />
                Masuk ke Dashboard
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
