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
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Kasbon Taylor</h1>
        <p className="text-sm text-on-surface-variant font-medium mt-1">
          Pencatatan pinjaman taylor
        </p>
      </div>

      {/* Total kasbon */}
      <div className="bg-warning-container rounded-3xl p-5 md:p-6 text-on-warning-container relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">Total Kasbon Belum Lunas</p>
          <h2 className="text-3xl font-black mt-1">{formatRupiah(totalBelumLunas)}</h2>
          <p className="text-xs mt-1 opacity-80">{kasbon.filter(kb => !kb.lunas).length} kasbon aktif</p>
        </div>
        <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-7xl opacity-[0.08]">
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
              <div key={taylorId}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold">
                      {taylor?.nama?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm font-bold text-on-surface">{taylor?.nama}</span>
                  </div>
                  {belumLunas > 0 && (
                    <span className="text-xs font-bold text-warning">{formatRupiah(belumLunas)}</span>
                  )}
                </div>
                <div className="space-y-2">
                  {items.map((kb) => (
                    <div
                      key={kb.id}
                      className={`bg-surface-container-lowest p-4 rounded-2xl flex items-center justify-between transition-all ${
                        kb.lunas ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          kb.lunas ? 'bg-surface-container-high text-outline' : 'bg-warning-container text-on-warning-container'
                        }`}>
                          <span className="material-symbols-outlined text-[16px]">
                            {kb.lunas ? 'check' : 'schedule'}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-on-surface">{formatRupiah(kb.nominal)}</p>
                          <p className="text-[10px] text-outline">
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
