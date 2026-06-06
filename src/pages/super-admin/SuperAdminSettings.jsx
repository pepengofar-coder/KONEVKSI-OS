import { useState, useEffect } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';

const SETTINGS_KEY = 'konveksi-os-saas-settings';

const defaultSettings = {
  activePaymentOption: 'seabank',
  seabankNumber: '131-00-153482-9',
  seabankName: 'a.n. Zenirastrore Convection',
  jagoNumber: '781-0539-281',
  jagoName: 'a.n. Zenirastrore Convection',
  gopayNumber: '081234567890',
  gopayName: 'a.n. Zenirastrore Convection',
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

  const [settings, setSettings] = useState(() => state.saasSettings || loadSettings());
  const [hasChanges, setHasChanges] = useState(false);
  const [savedSettings, setSavedSettings] = useState(() => state.saasSettings || loadSettings());

  const isSuperAdmin = state.currentUser?.role === 'SUPER_ADMIN';

  // Sync settings when global saasSettings updates
  useEffect(() => {
    if (state.saasSettings) {
      setSavedSettings(state.saasSettings);
      if (!hasChanges) {
        setSettings(state.saasSettings);
      }
    }
  }, [state.saasSettings, hasChanges]);

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

    // Persist to localStorage and global state
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    dispatch({ type: 'UPDATE_SAAS_SETTINGS', payload: settings });
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
            Rekening Bank & E-Wallet Tujuan Transfer
          </h3>
          <p className="text-[10px] text-slate-500">
            Pilih metode pembayaran yang aktif dan atur detail rekening/e-wallet yang akan ditampilkan kepada pengguna saat melakukan pembayaran upgrade plan.
          </p>

          {/* Active Payment Option Selector */}
          <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl space-y-3">
            <label className="block text-xs font-bold text-slate-300">Metode Pembayaran Utama (Aktif)</label>
            <p className="text-[10px] text-slate-500">Pilih opsi pembayaran yang akan ditampilkan kepada pengguna saat checkout.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              {[
                { id: 'seabank', label: 'Bank SeaBank', icon: 'account_balance' },
                { id: 'jago', label: 'Bank Jago', icon: 'account_balance' },
                { id: 'gopay', label: 'E-Wallet GoPay', icon: 'qr_code_2' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => update('activePaymentOption', opt.id)}
                  disabled={!isSuperAdmin}
                  className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    settings.activePaymentOption === opt.id
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md'
                      : 'bg-slate-950/40 border-white/[0.06] text-slate-400 hover:bg-white/[0.02]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* SeaBank */}
            <div className={`space-y-3 p-4 rounded-xl border transition-all ${settings.activePaymentOption === 'seabank' ? 'bg-cyan-500/[0.02] border-cyan-500/20 shadow-md' : 'bg-white/[0.01] border-white/[0.04]'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <span className="text-[10px] font-black text-cyan-300">SB</span>
                  </div>
                  <span className="text-xs font-bold text-slate-200">Bank SeaBank</span>
                </div>
                {settings.activePaymentOption === 'seabank' && (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-black uppercase text-cyan-300">AKTIF</span>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Nomor Rekening</label>
                <input type="text" value={settings.seabankNumber} onChange={(e) => update('seabankNumber', e.target.value)} disabled={!isSuperAdmin} className="input-base disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Atas Nama</label>
                <input type="text" value={settings.seabankName} onChange={(e) => update('seabankName', e.target.value)} disabled={!isSuperAdmin} className="input-base disabled:opacity-50" />
              </div>
            </div>

            {/* Bank Jago */}
            <div className={`space-y-3 p-4 rounded-xl border transition-all ${settings.activePaymentOption === 'jago' ? 'bg-cyan-500/[0.02] border-cyan-500/20 shadow-md' : 'bg-white/[0.01] border-white/[0.04]'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <span className="text-[10px] font-black text-orange-300">JAG</span>
                  </div>
                  <span className="text-xs font-bold text-slate-200">Bank Jago</span>
                </div>
                {settings.activePaymentOption === 'jago' && (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-black uppercase text-cyan-300">AKTIF</span>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Nomor Rekening</label>
                <input type="text" value={settings.jagoNumber} onChange={(e) => update('jagoNumber', e.target.value)} disabled={!isSuperAdmin} className="input-base disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Atas Nama</label>
                <input type="text" value={settings.jagoName} onChange={(e) => update('jagoName', e.target.value)} disabled={!isSuperAdmin} className="input-base disabled:opacity-50" />
              </div>
            </div>

            {/* GoPay */}
            <div className={`space-y-3 p-4 rounded-xl border transition-all ${settings.activePaymentOption === 'gopay' ? 'bg-cyan-500/[0.02] border-cyan-500/20 shadow-md' : 'bg-white/[0.01] border-white/[0.04]'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <span className="text-[10px] font-black text-indigo-300">GP</span>
                  </div>
                  <span className="text-xs font-bold text-slate-200">E-Wallet GoPay</span>
                </div>
                {settings.activePaymentOption === 'gopay' && (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-black uppercase text-cyan-300">AKTIF</span>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Nomor HP / GoPay</label>
                <input type="text" value={settings.gopayNumber} onChange={(e) => update('gopayNumber', e.target.value)} disabled={!isSuperAdmin} className="input-base disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Nama Akun</label>
                <input type="text" value={settings.gopayName} onChange={(e) => update('gopayName', e.target.value)} disabled={!isSuperAdmin} className="input-base disabled:opacity-50" />
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
              <div className="mb-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Harga / Bulan (IDR)</label>
                <input
                  type="number"
                  value={settings.freePrice || '0'}
                  onChange={(e) => update('freePrice', e.target.value)}
                  disabled={!isSuperAdmin}
                  className="input-base disabled:opacity-50"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                {settings.freeActive ? `Aktif — ${formatRupiah(parseInt(settings.freePrice || 0))}` : 'Nonaktif — Tidak ditampilkan'}
              </p>
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
                { id: 'seabank', label: 'SeaBank', value: settings.seabankNumber || 'Belum diatur', name: settings.seabankName },
                { id: 'jago', label: 'Bank Jago', value: settings.jagoNumber || 'Belum diatur', name: settings.jagoName },
                { id: 'gopay', label: 'GoPay', value: settings.gopayNumber || 'Belum diatur', name: settings.gopayName },
              ].map((bank) => (
                <div key={bank.id} className={`flex justify-between p-2.5 rounded-lg border transition-all ${settings.activePaymentOption === bank.id ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' : 'bg-white/[0.01] border-white/[0.04]'}`}>
                  <span className={`${settings.activePaymentOption === bank.id ? 'text-cyan-300 font-bold' : 'text-slate-500'} font-medium`}>
                    {bank.label} {settings.activePaymentOption === bank.id && ' (Aktif)'}
                  </span>
                  <div className="text-right">
                    <span className={`font-bold ${settings.activePaymentOption === bank.id ? 'text-cyan-200' : 'text-slate-200'}`}>{bank.value}</span>
                    {bank.name && <span className={`${settings.activePaymentOption === bank.id ? 'text-cyan-400/80' : 'text-slate-500'} block text-[10px]`}>{bank.name}</span>}
                  </div>
                </div>
              ))}
              <div className="flex justify-between p-2.5 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                <span className="text-slate-500 font-medium">Free</span>
                <span className={`font-bold ${settings.freeActive ? 'text-slate-300' : 'text-slate-500 line-through'}`}>
                  {formatRupiah(parseInt(settings.freePrice || 0))}
                </span>
              </div>
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
