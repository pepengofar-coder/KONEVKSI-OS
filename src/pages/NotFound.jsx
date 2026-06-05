import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.08),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.08),transparent_40%)] pointer-events-none" />
      
      <div className="relative text-center max-w-md">
        {/* 404 number */}
        <h1 className="text-[120px] md:text-[160px] font-extrabold leading-none bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-display opacity-20">
          404
        </h1>
        
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/[0.06] flex items-center justify-center mx-auto -mt-8 mb-6">
          <span className="material-symbols-outlined text-3xl text-slate-400">explore_off</span>
        </div>
        
        {/* Message */}
        <h2 className="text-xl md:text-2xl font-bold text-slate-200 mb-2 font-display">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        
        {/* Back button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
