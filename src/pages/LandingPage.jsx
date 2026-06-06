import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAppState } from '../context/AppContext';

// Animated particles component
function Particles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 6,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-cyan-400"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Geometric shapes
function GeoShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large ring */}
      <div className="absolute -top-20 -right-20 w-96 h-96 border-2 border-cyan-400/10 rounded-full animate-spin-very-slow" />
      <div className="absolute -top-10 -right-10 w-80 h-80 border border-purple-400/10 rounded-full animate-spin-very-slow-reverse" />
      {/* Small diamonds */}
      <div className="absolute top-1/4 left-[10%] w-8 h-8 border border-cyan-400/20 rotate-45 animate-float-slow" />
      <div className="absolute top-1/3 right-[15%] w-6 h-6 border border-purple-400/15 rotate-45 animate-float-slow-delay" />
      <div className="absolute bottom-1/3 left-[20%] w-4 h-4 bg-cyan-400/10 rotate-45 animate-float-slow" />
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
    </div>
  );
}

const features = [
  {
    icon: 'inventory_2',
    title: 'Barang Masuk',
    desc: 'Catat bahan/kain masuk, tentukan model & ongkos jahit per potong dengan mudah.',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    icon: 'sync',
    title: 'Tracking Produksi',
    desc: 'Distribusi ke taylor, pantau progress real-time. Tahu siapa mengerjakan apa.',
    gradient: 'from-indigo-500 to-cyan-600',
  },
  {
    icon: 'check_circle',
    title: 'Kelaran Otomatis',
    desc: 'Catat barang jadi dengan satu tap. Status otomatis berubah "Selesai".',
    gradient: 'from-cyan-500 to-teal-600',
  },
  {
    icon: 'receipt_long',
    title: 'Invoice & Kasbon',
    desc: 'Kalkulasi gaji otomatis: (Kelaran × Harga) − Kasbon = Sisa Bayar. Langsung cetak.',
    gradient: 'from-teal-500 to-emerald-600',
  },
  {
    icon: 'payments',
    title: 'Kas Harian',
    desc: 'Lacak pengeluaran operasional harian. Dashboard ringkas menampilkan 3 angka kunci.',
    gradient: 'from-emerald-500 to-green-600',
  },
];

const steps = [
  { num: '01', title: 'Input Bahan Masuk', desc: 'Catat kain/potongan dari cutting. Tentukan model & harga jahit.' },
  { num: '02', title: 'Distribusi ke Taylor', desc: 'Serahkan potongan ke taylor. Sistem melacak siapa pegang berapa.' },
  { num: '03', title: 'Catat Kelaran', desc: 'Taylor setor hasil? Satu tap untuk update status "Selesai".' },
  { num: '04', title: 'Cetak Invoice', desc: 'Hari gajian? Generate slip otomatis. Kasbon terpotong langsung.' },
];

export default function LandingPage() {
  const state = useAppState();
  const isLoggedIn = !!state?.currentUser;
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ======= NAVBAR ======= */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrollY > 50 ? 'bg-slate-950/80 backdrop-blur-2xl shadow-2xl shadow-purple-950/20' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg filled">checkroom</span>
            </div>
            <span className="text-lg font-black tracking-tighter">Konveksi OS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-slate-400 hover:text-white transition-colors font-medium">Fitur</a>
            <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors font-medium">Cara Kerja</a>
            <a href="#pricing" className="text-slate-400 hover:text-white transition-colors font-medium">Harga</a>
          </div>
          {isLoggedIn ? (
            <Link
              to={state.currentUser.role === 'SUPER_ADMIN' ? "/super-admin/dashboard" : "/dashboard"}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 border border-white/20 hover:bg-white/10 hover:border-white/30 rounded-xl text-sm font-bold transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ======= HERO ======= */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-950 to-cyan-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />

        <Particles />
        <GeoShapes />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full">
          {/* Main Card with Glassmorphism */}
          <div className="relative max-w-6xl mx-auto animate-fade-in-up">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-cyan-500/30 to-emerald-600/30 rounded-[3rem] blur-2xl opacity-60" />

            {/* Main Content Card */}
            <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-3xl border border-white/[0.15] rounded-3xl md:rounded-4xl overflow-hidden shadow-2xl shadow-purple-950/60">

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* LEFT SIDE - TEXT CONTENT */}
                <div className="p-8 md:p-12 lg:p-14 flex flex-col justify-center">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6 w-fit">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-semibold text-cyan-300 tracking-wide">Solusi Terpadu Konveksi</span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-4">
                    <span className="text-white">Konveksi</span>
                    <br />
                    <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">OS</span>
                  </h1>

                  {/* Subheadline */}
                  <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-3">
                    Sistem Manajemen Konveksi Modern untuk Baju, Tas & Berbagai Produk
                  </p>

                  {/* Supporting text */}
                  <p className="text-sm md:text-base text-slate-400 leading-relaxed mb-8 max-w-md">
                    Kelola produksi, tracking real-time, dan keuangan konveksi Anda dengan satu platform yang efisien dan terorganisir.
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {isLoggedIn ? (
                      <Link
                        to={state.currentUser.role === 'SUPER_ADMIN' ? "/super-admin/dashboard" : "/dashboard"}
                        className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl md:rounded-2xl text-sm md:text-base font-bold hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        Buka Dashboard
                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl md:rounded-2xl text-sm md:text-base font-bold hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          Login Sekarang
                          <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                        <Link
                          to="/register"
                          className="px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-semibold text-slate-300 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2"
                        >
                          Daftar Akun Baru
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE - 3D ELEMENTS */}
                <div className="relative hidden lg:flex items-center justify-center p-8 md:p-12 overflow-hidden">
                  {/* Floating 3D elements background */}
                  <div className="absolute inset-0 bg-gradient-to-bl from-purple-600/10 to-cyan-600/10" />

                  {/* Floating Sewing Machine */}
                  <div className="absolute top-12 left-8 w-32 h-32 opacity-80 animate-float-lg" style={{ animationDelay: '0s' }}>
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                      <rect x="20" y="30" width="60" height="50" rx="3" fill="#6366f1" opacity="0.8" />
                      <circle cx="35" cy="55" r="8" fill="#c7d2fe" />
                      <circle cx="65" cy="55" r="8" fill="#c7d2fe" />
                      <rect x="25" y="20" width="50" height="8" rx="2" fill="#818cf8" />
                      <circle cx="50" cy="23" r="3" fill="#fbbf24" />
                    </svg>
                  </div>

                  {/* Laptop with Dashboard */}
                  <div className="relative z-10 w-64 md:w-72 animate-float-lg" style={{ animationDelay: '1s' }}>
                    <div className="bg-gradient-to-br from-white/90 to-slate-100 rounded-2xl overflow-hidden shadow-2xl">
                      {/* Screen */}
                      <div className="bg-gradient-to-br from-purple-900 to-slate-900 p-4 aspect-video flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="h-3 w-20 bg-cyan-500/40 rounded-full" />
                          <div className="h-2 w-full bg-white/10 rounded-full" />
                          <div className="h-2 w-4/5 bg-white/10 rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-purple-600/40 rounded-lg p-2 h-12" />
                          <div className="bg-cyan-600/40 rounded-lg p-2 h-12" />
                        </div>
                      </div>
                      {/* Stand */}
                      <div className="bg-gradient-to-b from-slate-300 to-slate-400 h-4 flex items-center justify-center">
                        <div className="w-24 h-3 bg-slate-500 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Fabric Rolls */}
                  <div className="absolute bottom-8 right-4 w-24 h-24 opacity-80 animate-float-lg" style={{ animationDelay: '0.5s' }}>
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                      <circle cx="35" cy="50" r="20" fill="#dc2626" opacity="0.9" />
                      <circle cx="35" cy="48" r="18" fill="#ef4444" opacity="0.7" />
                      <ellipse cx="35" cy="45" rx="16" ry="8" fill="#fca5a5" opacity="0.8" />
                      <circle cx="65" cy="50" r="18" fill="#2563eb" opacity="0.8" />
                      <ellipse cx="65" cy="48" rx="16" ry="6" fill="#60a5fa" opacity="0.7" />
                    </svg>
                  </div>

                  {/* Thread Spools */}
                  <div className="absolute top-1/2 right-8 w-20 h-20 opacity-75 animate-float-lg" style={{ animationDelay: '1.5s' }}>
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                      <rect x="35" y="20" width="30" height="60" rx="4" fill="#8b5cf6" />
                      <circle cx="50" cy="25" r="6" fill="#c4b5fd" />
                      <circle cx="50" cy="75" r="6" fill="#c4b5fd" />
                      <circle cx="45" cy="50" r="4" fill="#f97316" />
                      <circle cx="55" cy="50" r="4" fill="#22d3ee" />
                    </svg>
                  </div>

                  {/* Clothes on Hanger */}
                  <div className="absolute bottom-16 left-12 w-28 h-28 opacity-80 animate-float-lg" style={{ animationDelay: '2s' }}>
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                      <path d="M 50 10 Q 55 15 55 20 L 55 70 Q 50 80 45 70 L 45 20 Q 45 15 50 10" fill="#ec4899" opacity="0.8" />
                      <rect x="40" y="8" width="20" height="4" rx="2" fill="#f472b6" />
                      <path d="M 45 25 L 30 35 Q 25 40 28 50 L 35 65" fill="#f472b6" opacity="0.7" />
                      <path d="M 55 25 L 70 35 Q 75 40 72 50 L 65 65" fill="#f472b6" opacity="0.7" />
                    </svg>
                  </div>

                  {/* Scissors & Tools */}
                  <div className="absolute top-1/4 right-1/4 w-16 h-16 opacity-70 animate-float-lg" style={{ animationDelay: '2.5s' }}>
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                      <circle cx="30" cy="40" r="8" fill="#6366f1" stroke="#818cf8" strokeWidth="1.5" />
                      <path d="M 30 48 L 30 75" stroke="#6366f1" strokeWidth="3" />
                      <circle cx="70" cy="40" r="8" fill="#6366f1" stroke="#818cf8" strokeWidth="1.5" />
                      <path d="M 70 48 L 70 75" stroke="#6366f1" strokeWidth="3" />
                      <line x1="30" y1="40" x2="70" y2="40" stroke="#f97316" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-12 md:mt-16 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            {[
              { icon: 'checkroom', title: 'Manajemen Baju', color: 'from-purple-600 to-purple-800' },
              { icon: 'shopping_bag', title: 'Manajemen Tas', color: 'from-indigo-600 to-indigo-800' },
              { icon: 'widgets', title: 'Multi Kategori', color: 'from-cyan-600 to-cyan-800' },
              { icon: 'timeline', title: 'Tracking Real-time', color: 'from-teal-600 to-teal-800' },
              { icon: 'trending_up', title: 'Laporan Keuangan', color: 'from-emerald-600 to-emerald-800' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-6 hover:bg-white/[0.12] hover:border-white/[0.2] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-white text-xl filled">{feature.icon}</span>
                </div>
                <h3 className="font-bold text-white text-sm md:text-base">{feature.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= FEATURES ======= */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">
              Fitur Utama
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Semua yang Anda <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Butuhkan</span>
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">
              3 modul simpel yang mencakup seluruh operasional konveksi — dari bahan masuk hingga gajian taylor.
            </p>
          </div>

          {/* Feature cards - top row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.slice(0, 3).map((f, idx) => (
              <div
                key={idx}
                className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-6 md:p-8 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                  <span className="material-symbols-outlined text-white text-xl filled">{f.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          {/* Feature cards - bottom row centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6 max-w-3xl mx-auto">
            {features.slice(3).map((f, idx) => (
              <div
                key={idx + 3}
                className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-6 md:p-8 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                  <span className="material-symbols-outlined text-white text-xl filled">{f.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= HOW IT WORKS ======= */}
      <section id="how-it-works" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950" />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">
              Cara Kerja
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              4 Langkah <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Simpel</span>
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">
              Dari bahan masuk sampai gajian, semua teralur rapi tanpa ribet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="group relative bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500"
              >
                <span className="text-5xl font-black bg-gradient-to-br from-purple-500/20 to-cyan-500/20 bg-clip-text text-transparent">
                  {step.num}
                </span>
                <h3 className="text-xl font-bold text-white mt-3 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400 z-10">
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= CTA ======= */}
      <section id="pricing" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-purple-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-[2.5rem] p-10 md:p-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-white text-3xl filled">rocket_launch</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Gratis. Selamanya.
            </h2>
            <p className="text-slate-400 mb-3 max-w-md mx-auto">
              Konveksi OS sepenuhnya gratis. Tidak ada biaya bulanan, tidak ada trial. 
              Data tersimpan di perangkat Anda — privasi terjaga.
            </p>
            <p className="text-xs text-slate-500 mb-8">
              Offline-first • Tanpa registrasi • Data 100% milik Anda
            </p>
            <Link
              to={isLoggedIn ? (state.currentUser.role === 'SUPER_ADMIN' ? "/super-admin/dashboard" : "/dashboard") : "/dashboard"}
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              Buka Aplikasi
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ======= FOOTER ======= */}
      <footer className="relative border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm filled">checkroom</span>
            </div>
            <span className="text-sm font-bold text-slate-400">Konveksi OS</span>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Konveksi OS. Built with ❤️ for pengusaha konveksi Indonesia.
          </p>
        </div>
      </footer>

      {/* Inline animations */}
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: var(--opacity, 0.2); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); opacity: calc(var(--opacity, 0.2) * 1.5); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        @keyframes float-lg {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        @keyframes spin-very-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-very-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: rotate(45deg) translateY(0); }
          50% { transform: rotate(45deg) translateY(-15px); }
        }
        @keyframes float-slow-delay {
          0%, 100% { transform: rotate(45deg) translateY(0); }
          50% { transform: rotate(45deg) translateY(-12px); }
        }
        .animate-spin-very-slow { animation: spin-very-slow 60s linear infinite; }
        .animate-spin-very-slow-reverse { animation: spin-very-slow-reverse 45s linear infinite; }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-slow-delay { animation: float-slow-delay 8s ease-in-out 2s infinite; }
        .animate-float-lg { animation: float-lg 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
