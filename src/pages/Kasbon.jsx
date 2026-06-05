import { useState } from 'react';
import { useAppState, useHelpers } from '../context/AppContext';
import KasbonForm from '../components/forms/KasbonForm';
import Badge from '../components/ui/Badge';
import FAB from '../components/ui/FAB';
import EmptyState from '../components/ui/EmptyState';

export default function Kasbon() {
  const { kasbon } = useAppState();
  const { getTaylor, formatRupiah, getTotalKasbonBelumLunas } = useHelpers();
  const [showForm, setShowForm] = useState(false);

  // Group by taylor
  const taylorGroups = {};
  kasbon.forEach((kb) => {
    if (!taylorGroups[kb.taylorId]) {
      taylorGroups[kb.taylorId] = [];
    }
    taylorGroups[kb.taylorId].push(kb);
  });

  const totalBelumLunas = kasbon.filter(kb => !kb.lunas).reduce((s, kb) => s + kb.nominal, 0);

  return (
    <div className="space-y-6 animate-fade-in-up text-white">
      <div>
        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">Kasbon Taylor</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
          Pencatatan pinjaman taylor
        </p>
      </div>

      {/* Total kasbon */}
      <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-3xl p-5 md:p-6 text-slate-100 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/15 to-amber-500/0 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
        
        <div className="relative z-10">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Total Kasbon Belum Lunas</p>
          <h2 className="text-3xl font-black mt-1 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{formatRupiah(totalBelumLunas)}</h2>
          <p className="text-xs mt-1.5 text-slate-400 font-medium">{kasbon.filter(kb => !kb.lunas).length} kasbon aktif</p>
        </div>
        <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-7xl opacity-[0.04] text-amber-400 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-[0.06]">
          account_balance_wallet
        </span>
      </div>

      {Object.keys(taylorGroups).length === 0 ? (
        <EmptyState
          icon="account_balance_wallet"
          title="Belum Ada Kasbon"
          description="Catat jika taylor meminjam uang"
        />
      ) : (
        <div className="space-y-5">
          {Object.entries(taylorGroups).map(([taylorId, items]) => {
            const taylor = getTaylor(taylorId);
            const belumLunas = getTotalKasbonBelumLunas(taylorId);
            return (
              <div key={taylorId} className="space-y-3">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-500/20">
                      {taylor?.nama?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm font-bold text-slate-200">{taylor?.nama}</span>
                  </div>
                  {belumLunas > 0 && (
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">{formatRupiah(belumLunas)}</span>
                  )}
                </div>
                <div className="space-y-2">
                  {items.map((kb) => (
                    <div
                      key={kb.id}
                      className={`bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-white/[0.15] p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.05] transition-all duration-300 ${
                        kb.lunas ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          kb.lunas ? 'bg-white/[0.02] border-white/[0.06] text-slate-500' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          <span className="material-symbols-outlined text-[16px]">
                            {kb.lunas ? 'check' : 'schedule'}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-200">{formatRupiah(kb.nominal)}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                            {kb.tanggal}{kb.catatan ? ` · ${kb.catatan}` : ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant={kb.lunas ? 'success' : 'warning'}>
                        {kb.lunas ? 'Lunas' : 'Belum'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FAB onClick={() => setShowForm(true)} icon="add" label="Kasbon" />
      <KasbonForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
