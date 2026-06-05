import { useState } from 'react';
import { useAppState, useAppDispatch, useHelpers } from '../../context/AppContext';
import Modal from '../ui/Modal';

export default function TrackingJobForm({ isOpen, onClose, distribusiItem }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { getTaylor, getModel, showToast } = useHelpers();

  const [loading, setLoading] = useState(false);

  if (!distribusiItem) return null;

  const taylor = getTaylor(distribusiItem.taylorId);
  const model = getModel(distribusiItem.modelId);
  
  // Check if tracking job already exists for this distribution
  const existingJob = (state.trackingJobs || []).find(
    (j) => j.distribusiId === distribusiItem.id
  );

  const getTrackingUrl = (jobId) => {
    return `${window.location.origin}/#/tracking/${jobId}`;
  };

  const handleCreateTracking = async () => {
    setLoading(true);
    const tempId = `tr_${Date.now()}`;
    const initialPayload = {
      id: tempId,
      distribusiId: distribusiItem.id,
      taylorId: distribusiItem.taylorId,
      taylorName: taylor?.nama || 'Taylor',
      modelId: distribusiItem.modelId,
      modelName: model?.nama || 'Model',
      jumlah: distribusiItem.jumlah,
      status: 'Belum Dikerjakan',
      progress: 0,
      logs: [
        {
          status: 'Belum Dikerjakan',
          timestamp: new Date().toLocaleString('id-ID'),
          notes: 'Pekerjaan didistribusikan & tracking diaktifkan'
        }
      ],
      photo: '',
      notes: '',
      userId: state.currentUser.id
    };

    try {
      // Create JSON Bin on npoint.io
      const response = await fetch('https://api.npoint.io/bins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(initialPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to create cloud JSON bin');
      }

      const data = await response.json();
      const binId = data.binId;

      if (binId) {
        // Save locally using the binId as job ID so public page can fetch it directly
        dispatch({
          type: 'ADD_TRACKING_JOB',
          payload: {
            ...initialPayload,
            id: binId,
            syncUrl: `https://api.npoint.io/bins/${binId}`
          }
        });
        showToast('Link tracking publik berhasil diaktifkan!', 'success');
      } else {
        throw new Error('No binId returned');
      }
    } catch (error) {
      console.error(error);
      // Fallback: create offline job
      dispatch({
        type: 'ADD_TRACKING_JOB',
        payload: {
          ...initialPayload,
          id: tempId,
          syncUrl: ''
        }
      });
      showToast('Koneksi internet bermasalah. Tracking dibuat dalam mode lokal (Offline).', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = () => {
    if (existingJob) {
      dispatch({ type: 'DELETE_TRACKING_JOB', payload: existingJob.id });
      showToast('Link tracking publik dinonaktifkan.', 'info');
      onClose();
    }
  };

  const handleCopyLink = () => {
    if (existingJob) {
      const url = getTrackingUrl(existingJob.id);
      navigator.clipboard.writeText(url);
      showToast('Link berhasil disalin ke papan klip!', 'success');
    }
  };

  const handleShareWhatsApp = () => {
    if (existingJob) {
      const url = getTrackingUrl(existingJob.id);
      const cleanPhone = taylor?.phone ? taylor.phone.replace(/[^0-9]/g, '') : '';
      const phoneWithCountry = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
      
      const message = `Halo ${taylor?.nama || 'Penjahit'}, silakan laporkan dan update progres jahitan *${model?.nama}* (${distribusiItem.jumlah} pcs) melalui link tracking berikut:
${url}

Anda tidak perlu login untuk memperbarui status pekerjaan. Terima kasih!`;
      
      const encoded = encodeURIComponent(message);
      if (phoneWithCountry) {
        window.open(`https://wa.me/${phoneWithCountry}?text=${encoded}`, '_blank');
      } else {
        // Fallback open WA web to search user manually
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingJob ? 'Manajemen Link Tracking' : 'Aktifkan Tracking Publik'}
    >
      <div className="space-y-6">
        {/* Info card */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-2 text-xs font-semibold">
          <div className="flex justify-between">
            <span className="text-slate-500">Penjahit:</span>
            <span className="text-slate-200">{taylor?.nama || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Model Baju:</span>
            <span className="text-slate-200">{model?.nama || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Jumlah:</span>
            <span className="text-cyan-400">{distribusiItem.jumlah} Pcs</span>
          </div>
        </div>

        {existingJob ? (
          /* Manage existing link */
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Link Tracking Penjahit</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={getTrackingUrl(existingJob.id)}
                  readOnly
                  className="flex-1 bg-slate-950/60 border border-white/[0.08] text-cyan-400 text-xs rounded-xl px-3 py-2.5 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 flex items-center justify-center transition-colors"
                  title="Salin Link"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleShareWhatsApp}
                className="py-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                Kirim WhatsApp
              </button>
              <button
                onClick={() => window.open(getTrackingUrl(existingJob.id), '_blank')}
                className="py-3 bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/20 text-cyan-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                Buka Link
              </button>
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <button
                onClick={handleDeactivate}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">link_off</span>
                Nonaktifkan Link Publik
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-2">
                Menonaktifkan link akan menghapus data pelacakan dari server cloud.
              </p>
            </div>
          </div>
        ) : (
          /* Create new link */
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Dengan mengaktifkan link tracking, Anda akan membuat halaman web publik unik yang memungkinkan penjahit Anda memperbarui progres jahitannya langsung dari smartphone mereka tanpa memerlukan akun login.
            </p>

            <button
              onClick={handleCreateTracking}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  Menghubungkan ke Awan...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  Aktifkan & Buat Link
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
