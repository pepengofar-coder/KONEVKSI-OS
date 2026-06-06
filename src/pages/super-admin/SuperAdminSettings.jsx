import { useState, useEffect } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';

const SETTINGS_KEY = 'konveksi-os-saas-settings';

const defaultSettings = {
  bankMandiri: '131-00-153482-9',
  bankMandiriName: 'a.n. Zenirastrore Convection',
  bankBca: '781-0539-281',
  bankBcaName: 'a.n. Zenirastrore Convection',
  bankBsi: '',
  bankBsiName: '',
  premiumPrice: '99000',
  businessPrice: '199000',
  premiumActive: true,
  businessActive: true,
  freeActive: true,
  autoApprove: false,
  trialDays: '7',
  gracePeriodDays: '3',
};

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return { ...defaultSettings };
}

export default function SuperAdminSettings() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { showToast, formatRupiah } = useHelpers();

  const [settings, setSettings] = useState(loadSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedSettings, setSavedSettings] = useState(loadSettings);

  const isSuperAdmin = state.currentUser?.role === 'SUPER_ADMIN';

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Detect changes
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(savedSettings));
  }, [settings, savedSettings]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      showToast('Akses Ditolak: Hanya Super Admin yang dapat menyimpan setelan!', 'error');
      return;
    }

    // Persist to localStorage
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSavedSettings({ ...settings });
    setHasChanges(false);

    // Log the change to audit trail
    const changedFields = [];
    Object.keys(settings).forEach(key => {
      if (JSON.stringify(settings[key]) !== JSON.stringify(savedSettings[key])) {
        changedFields.push(key);
      }
    });

    if (changedFields.length > 0) {
      dispatch({
        type: 'ADD_ADMIN_LOG',
        payload: {
          action: 'UPDATE_SETTINGS',
          details: `Platform settings updated: ${changedFields.join(', ')}`,
          note: `Changes: ${changedFields.map(f => `${f}: ${savedSettings[f]} → ${settings[f]}`).join('; ')}`
        }
      });
    }

    showToast('Pengaturan platform berhasil disimpan!', 'success');
  };

  const handleReset = () => {
    setSettings(savedSettings);
    setHasChanges(false);
    showToast('Perubahan dibatalkan.', 'info');
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Pengaturan Platform SaaS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi rekening bank, harga langganan, opsi plan, dan setelan operasional platform.
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-amber-400 font-bold animate-pulse flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">edit_note</span>
              Ada perubahan belum disimpan
            </span>
          </div>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-base">warning</span>
          <span>Hanya Super Admin yang dapat merubah setelan platform.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* ═══ BANK ACCOUNTS ═══ */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-xl space-y-5">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-lg">account_balance</span>
            Rekening Bank Tujuan Transfer
          </h3>
          <p className="text-[10px] text-slate-500">
            Rekening ini ditampilkan kepada pengguna saat melakukan pembayaran upgrade plan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Mandiri */}
            <div className="space-y-3 p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-black text-blue-300">MDR</span>
                </div>
                <span className="text-xs font-bold text-slate-200">Bank Mandiri</span>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Nomor Rekening</label>
                <input type="text" value={settings.bankMandiri} onChange={(e) => update('bankMandiri', e.target.value)} disabled={!isSuperAdmin} className="input-base disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Atas Nama</label>
                <input type="text" value={settings.bankMandiriName} onChange={(e) => update('bankMandiriName', e.target.value)} disabled={!isSuperAdmin} className="input-base disabled:opacity-50" />
              </div>
            </div>

            {/* BCA */}
            <div className="space-y-3 p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-black text-blue-300">BCA</span>
                </div>
                <span className="text-xs font-bold text-slate-200">Bank BCA</span>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Nomor Rekening</label>
                <input type="text" value={settings.bankBca} onChange={(e) => update('bankBca', e.target.value)} disabled={!isSuperAdmin} className="input-base disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Atas Nama</label>
                <input type="text" value={settings.bankBcaName} onChange={(e) => update('bankBcaName', e.target.value)} disabled={!isSuperAdmin} className="input-base disabled:opacity-50" />
              </div>
            </div>

            {/* BSI */}
            <div className="space-y-3 p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-black text-emerald-300">BSI</span>
                </div>
                <span className="text-xs font-bold text-slate-200">Bank Syariah Indonesia</span>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Nomor Rekening</label>
                <input type="text" value={settings.bankBsi} onChange={(e) => update('bankBsi', e.target.value)} disabled={!isSuperAdmin} className="input-base disabled:opacity-50" placeholder="Kosongkan jika tidak ada" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Atas Nama</label>
                <input type="text" value={settings.bankBsiName} onChange={(e) => update('bankBsiName', e.target.value)} disabled={!isSuperAdmin} className="input-base disabled:opacity-50" placeholder="Kosongkan jika tidak ada" />
              </div>
            </div>
          </div>
        </div>

        {/* ═══ PRICING ═══ */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-xl space-y-5">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400 text-lg">sell</span>
            Tarif Harga Paket Langganan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* FREE */}
            <div className={`p-5 rounded-xl border transition-all ${settings.freeActive ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-950/40 border-white/[0.03] opacity-60'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">FREE</span>
                  <p className="text-lg font-black text-slate-100 mt-2">Gratis</p>
                </div>
                <button
                  type="button"
                  onClick={() => update('freeActive', !settings.freeActive)}
                  disabled={!isSuperAdmin}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex disabled:opacity-50 ${settings.freeActive ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500">Plan dasar gratis dengan fitur terbatas. {settings.freeActive ? 'Aktif' : 'Nonaktif'}</p>
            </div>

            {/* PREMIUM */}
            <div className={`p-5 rounded-xl border transition-all ${settings.premiumActive ? 'bg-cyan-500/[0.03] border-cyan-500/10' : 'bg-slate-950/40 border-white/[0.03] opacity-60'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">PREMIUM</span>
                </div>
                <button
                  type="button"
                  onClick={() => update('premiumActive', !settings.premiumActive)}
                  disabled={!isSuperAdmin}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex disabled:opacity-50 ${settings.premiumActive ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'}`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
              <div className="mb-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Harga / Bulan (IDR)</label>
                <input
                  type="number"
                  value={settings.premiumPrice}
                  onChange={(e) => update('premiumPrice', e.target.value)}
                  disabled={!isSuperAdmin}
                  className="input-base disabled:opacity-50"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                {settings.premiumActive ? `Aktif — ${formatRupiah(parseInt(settings.premiumPrice || 0))}` : 'Nonaktif — Tidak ditampilkan'}
              </p>
            </div>

            {/* BUSINESS */}
            <div className={`p-5 rounded-xl border transition-all ${settings.businessActive ? 'bg-purple-500/[0.03] border-purple-500/10' : 'bg-slate-950/40 border-white/[0.03] opacity-60'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">BUSINESS</span>
                </div>
                <button
                  type="button"
                  onClick={() => update('businessActive', !settings.businessActive)}
                  disabled={!isSuperAdmin}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex disabled:opacity-50 ${settings.businessActive ? 'bg-purple-500 justify-end' : 'bg-slate-700 justify-start'}`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
              <div className="mb-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Harga / Bulan (IDR)</label>
                <input
                  type="number"
                  value={settings.businessPrice}
                  onChange={(e) => update('businessPrice', e.target.value)}
                  disabled={!isSuperAdmin}
                  className="input-base disabled:opacity-50"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                {settings.businessActive ? `Aktif — ${formatRupiah(parseInt(settings.businessPrice || 0))}` : 'Nonaktif — Tidak ditampilkan'}
              </p>
            </div>
          </div>
        </div>

        {/* ═══ OPERATIONAL SETTINGS ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Auto-approve & trial */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-xl space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400 text-lg">tune</span>
              Setelan Operasional
            </h3>

            <div className="space-y-4">
              {/* Auto ACC */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-white/[0.06]">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Auto-ACC Pembayaran</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Otomatis setujui tanpa verifikasi manual.</p>
                </div>
                <button
                  type="button"
                  onClick={() => update('autoApprove', !settings.autoApprove)}
                  disabled={!isSuperAdmin}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex disabled:opacity-50 ${settings.autoApprove ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'}`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Grace period */}
              <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Grace Period (Hari)</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Masa tenggang setelah expired sebelum akses diblokir.</p>
                  </div>
                </div>
                <input
                  type="number"
                  value={settings.gracePeriodDays}
                  onChange={(e) => update('gracePeriodDays', e.target.value)}
                  disabled={!isSuperAdmin}
                  className="input-base mt-3 disabled:opacity-50"
                  min="0"
                  max="30"
                />
              </div>
            </div>
          </div>

          {/* Preview & Save */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-xl space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-lg">preview</span>
              Preview Konfigurasi Aktif
            </h3>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Mandiri', value: settings.bankMandiri || 'Belum diatur', name: settings.bankMandiriName },
                { label: 'BCA', value: settings.bankBca || 'Belum diatur', name: settings.bankBcaName },
                { label: 'BSI', value: settings.bankBsi || 'Tidak tersedia', name: settings.bankBsiName },
              ].map((bank) => (
                <div key={bank.label} className="flex justify-between p-2.5 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                  <span className="text-slate-500 font-medium">{bank.label}</span>
                  <div className="text-right">
                    <span className="text-slate-200 font-bold">{bank.value}</span>
                    {bank.name && <span className="text-slate-500 block text-[10px]">{bank.name}</span>}
                  </div>
                </div>
              ))}
              <div className="flex justify-between p-2.5 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                <span className="text-slate-500 font-medium">Premium</span>
                <span className={`font-bold ${settings.premiumActive ? 'text-cyan-300' : 'text-slate-500 line-through'}`}>
                  {formatRupiah(parseInt(settings.premiumPrice || 0))}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                <span className="text-slate-500 font-medium">Business</span>
                <span className={`font-bold ${settings.businessActive ? 'text-purple-300' : 'text-slate-500 line-through'}`}>
                  {formatRupiah(parseInt(settings.businessPrice || 0))}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                <span className="text-slate-500 font-medium">Auto-ACC</span>
                <span className={`font-bold ${settings.autoApprove ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {settings.autoApprove ? 'Aktif' : 'Non-aktif'}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-3 border-t border-white/[0.06]">
              {hasChanges && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 text-slate-400 rounded-xl font-bold text-xs border border-white/[0.06] hover:bg-white/[0.04] transition-all"
                >
                  Batalkan
                </button>
              )}
              <button
                type="submit"
                disabled={!isSuperAdmin || !hasChanges}
                className={`flex-1 py-3 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isSuperAdmin && hasChanges
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-800 border border-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Simpan Setelan
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
