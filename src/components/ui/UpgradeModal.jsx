import { useNavigate } from 'react-router-dom';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import Modal from './Modal';

export default function UpgradeModal() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isOpen = state.upgradeModalOpen || false;

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_UPGRADE_MODAL', payload: false });
  };

  const handleUpgradeClick = () => {
    handleClose();
    navigate('/pricing');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upgrade ke Premium Suite 🚀"
      size="md"
    >
      <div className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl">
          <p className="text-sm font-semibold text-slate-200 text-center leading-relaxed">
            Wah, Anda telah mencapai batas kuota rencana <span className="text-cyan-400 font-extrabold">FREE</span>! Buka potensi penuh bisnis konveksi Anda tanpa batas.
          </p>
        </div>

        <div className="space-y-3.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Fitur Premium yang Terbuka:
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            {[
              { icon: 'all_inclusive', text: 'Tanpa Batas Input Order, Model, & Pelanggan' },
              { icon: 'analytics', text: 'Laporan Keuangan & AI Insight Bisnis Lengkap' },
              { icon: 'download', text: 'Ekspor Data Laporan (PDF & Excel / CSV)' },
              { icon: 'description', text: 'Desain Invoice Profesional Klien & Taylor' },
              { icon: 'share', text: 'Fitur Live Tracking Produksi Publik Tanpa Batas' },
              { icon: 'cloud_upload', text: 'Backup Otomatis & Pemulihan Data Aman' }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                <span className="material-symbols-outlined text-cyan-400 text-[18px] shrink-0">
                  {feature.icon}
                </span>
                <span className="text-xs font-semibold text-slate-300">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={handleUpgradeClick}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 hover:shadow-lg text-white rounded-2xl font-bold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-lg text-center"
          >
            Upgrade Sekarang — Mulai dari Rp 99.000
          </button>
          <button
            onClick={handleClose}
            className="w-full py-3.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 rounded-2xl font-bold text-xs transition-all text-center"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </Modal>
  );
}
