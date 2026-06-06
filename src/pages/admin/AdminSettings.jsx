import { useState, useEffect } from 'react';
import { useHelpers } from '../../context/AppContext';

export default function AdminSettings() {
  const { showToast } = useHelpers();

  const [bankMandiri, setBankMandiri] = useState('131-00-153482-9');
  const [bankBca, setBankBca] = useState('781-0539-281');
  const [premiumPrice, setPremiumPrice] = useState('99000');
  const [businessPrice, setBusinessPrice] = useState('199000');
  const [autoApprove, setAutoApprove] = useState(false);

  useEffect(() => {
    // Load config from localStorage
    const saved = localStorage.getItem('konveksi-os-saas-settings');
    if (saved) {
      const config = JSON.parse(saved);
      setBankMandiri(config.bankMandiri || '131-00-153482-9');
      setBankBca(config.bankBca || '781-0539-281');
      setPremiumPrice(config.premiumPrice || '99000');
      setBusinessPrice(config.businessPrice || '199000');
      setAutoApprove(config.autoApprove || false);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const config = {
      bankMandiri,
      bankBca,
      premiumPrice,
      businessPrice,
      autoApprove
    };
    localStorage.setItem('konveksi-os-saas-settings', JSON.stringify(config));
    showToast('Pengaturan SaaS platform berhasil diperbarui!', 'success');
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Pengaturan Platform SaaS
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Konfigurasi rekening tujuan transfer bank manual, harga paket langganan, dan setelan simulasi.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Bank transfer configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-lg">account_balance</span>
              Tujuan Rekening Bank Pembayaran
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">No. Rekening Bank Mandiri</label>
                <input
                  type="text"
                  value={bankMandiri}
                  onChange={(e) => setBankMandiri(e.target.value)}
                  className="input-base"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">No. Rekening Bank BCA</label>
                <input
                  type="text"
                  value={bankBca}
                  onChange={(e) => setBankBca(e.target.value)}
                  className="input-base"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing configurations */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-lg">sell</span>
              Tarif Harga Paket Langganan (SaaS Pricing)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Harga Premium per Bulan (IDR)</label>
                <input
                  type="number"
                  value={premiumPrice}
                  onChange={(e) => setPremiumPrice(e.target.value)}
                  className="input-base"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Harga Business per Bulan (IDR)</label>
                <input
                  type="number"
                  value={businessPrice}
                  onChange={(e) => setBusinessPrice(e.target.value)}
                  className="input-base"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Sandbox/Simulation */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400 text-lg">science</span>
              Sandbox / Simulasi
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-2xl border border-white/[0.06]">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Auto ACC Pembayaran</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Otomatis setujui bukti transfer tanpa verifikasi admin.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoApprove(!autoApprove)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex ${
                    autoApprove ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Simpan Setelan Platform
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
