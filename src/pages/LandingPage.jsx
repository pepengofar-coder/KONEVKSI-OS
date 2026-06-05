import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

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
          <Link
            to="/dashboard"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            Buka Aplikasi
          </Link>
        </div>
      </nav>

      {/* ======= HERO ======= */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-950 to-cyan-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
        
        <Particles />
        <GeoShapes />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-cyan-300 tracking-wide">Simpel • Mobile-Friendly • Offline-First</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">Konveksi</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">OS</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Sistem Manajemen Konveksi Modern untuk Bisnis Anda 
            <br className="hidden md:block" />
            <span className="text-white font-semibold">Lebih Efisien & Terorganisir</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link
              to="/dashboard"
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl text-base font-bold hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              Mulai Sekarang — Gratis
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-2xl text-base font-semibold text-slate-300 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">play_circle</span>
              Lihat Cara Kerja
            </a>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            {/* Glow behind */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-emerald-500/20 rounded-3xl blur-3xl scale-105" />
            
            {/* Browser chrome */}
            <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-purple-950/50">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white/5 rounded-lg text-[10px] text-slate-500 font-mono">
                    konveksi-os.vercel.app
                  </div>
                </div>
              </div>
              
              {/* Dashboard mockup */}
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-12 gap-3 md:gap-4">
                  {/* Sidebar mock */}
                  <div className="hidden md:block col-span-2 space-y-3">
                    <div className="h-6 w-full bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-lg" />
                    <div className="space-y-2">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-4 rounded-md ${i === 1 ? 'bg-cyan-500/30 w-full' : 'bg-white/5 w-4/5'}`} />
                      ))}
                    </div>
                  </div>
                  
                  {/* Main content mock */}
                  <div className="col-span-12 md:col-span-10 space-y-3 md:space-y-4">
                    {/* Stat cards */}
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                      <div className="bg-gradient-to-br from-purple-600/30 to-purple-800/20 p-3 md:p-4 rounded-xl border border-purple-500/10">
                        <div className="text-[8px] md:text-[10px] text-purple-300/60 uppercase font-bold tracking-wider">Kelaran</div>
                        <div className="text-lg md:text-2xl font-black text-purple-200 mt-1">55 pcs</div>
                      </div>
                      <div className="bg-gradient-to-br from-cyan-600/30 to-cyan-800/20 p-3 md:p-4 rounded-xl border border-cyan-500/10">
                        <div className="text-[8px] md:text-[10px] text-cyan-300/60 uppercase font-bold tracking-wider">Cost</div>
                        <div className="text-lg md:text-2xl font-black text-cyan-200 mt-1">Rp 110K</div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-600/30 to-emerald-800/20 p-3 md:p-4 rounded-xl border border-emerald-500/10">
                        <div className="text-[8px] md:text-[10px] text-emerald-300/60 uppercase font-bold tracking-wider">Kasbon</div>
                        <div className="text-lg md:text-2xl font-black text-emerald-200 mt-1">Rp 150K</div>
                      </div>
                    </div>
                    
                    {/* Activity list mock */}
                    <div className="bg-white/5 rounded-xl p-3 md:p-4 space-y-2">
                      {['Taylor A setor 30 pcs Gamis A', 'Kasbon Bu Siti: Rp 50.000', 'Beli benang: Rp 25.000'].map((text, i) => (
                        <div key={i} className="flex items-center gap-3 py-1.5">
                          <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full ${i === 0 ? 'bg-cyan-500/20' : i === 1 ? 'bg-amber-500/20' : 'bg-slate-500/20'}`} />
                          <div className="text-[10px] md:text-xs text-slate-400">{text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((f, idx) => (
              <div
                key={idx}
                className={`group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-6 md:p-8 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 ${
                  idx === 3 ? 'lg:col-span-1 lg:translate-x-[50%]' : ''
                } ${idx === 4 ? 'lg:col-span-1 lg:translate-x-[50%]' : ''}`}
              >
                {/* Icon */}
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
              to="/dashboard"
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
      `}</style>
    </div>
  );
}
