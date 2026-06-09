import { useState } from 'react';
import { useAppState, useHelpers, usePlan, useAppDispatch } from '../context/AppContext';
import DistribusiForm from '../components/forms/DistribusiForm';
import KelaranForm from '../components/forms/KelaranForm';
import TrackingJobForm from '../components/forms/TrackingJobForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

export default function OnProgress() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { distribusi, trackingJobs } = state;
  const { getModel, getTaylor, getSisaDistribusi, getTotalKelaranByDistribusi, formatRupiah, showToast } = useHelpers();
  const { isLimitExceeded, showUpgradeModal } = usePlan();
  
  const [showDistribusi, setShowDistribusi] = useState(false);
  const [showKelaran, setShowKelaran] = useState(false);
  
  // Edit & Delete state
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Tracking Modal state
  const [selectedDist, setSelectedDist] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  // Group by taylor
  const taylorGroups = {};
  distribusi.forEach((d) => {
    const sisa = getSisaDistribusi(d);
    if (sisa <= 0) return; // skip completed
    if (!taylorGroups[d.taylorId]) {
      taylorGroups[d.taylorId] = [];
    }
    taylorGroups[d.taylorId].push({ ...d, sisa });
  });

  const taylorIds = Object.keys(taylorGroups);

  const handleOpenTracking = (d) => {
    const trackJob = (trackingJobs || []).find(j => j.distribusiId === d.id);
    if (!trackJob && isLimitExceeded('tracking')) {
      showToast('Batas kuota tercapai! Upgrade ke Premium untuk mengaktifkan link tracking produksi.', 'error');
      showUpgradeModal();
      return;
    }
    setSelectedDist(d);
    setShowTrackingModal(true);
  };

  const handleStartEdit = (d) => {
    setEditingId(d.id);
    setEditValue(d.jumlah.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = (d) => {
    const valInt = parseInt(editValue);
    if (isNaN(valInt) || valInt <= 0) {
      showToast('Jumlah jahitan harus berupa angka bulat positif!', 'error');
      return;
    }

    const totalKelaran = getTotalKelaranByDistribusi(d.id);
    if (valInt < totalKelaran) {
      showToast(`Jumlah tidak boleh kurang dari yang sudah dikerjakan (${totalKelaran} pcs)!`, 'error');
      return;
    }

    // Check undistributed availability in barangMasuk
    const bm = state.barangMasuk.find(b => b.id === d.barangMasukId);
    if (bm) {
      const oldJumlah = d.jumlah;
      const diff = valInt - oldJumlah;
      if (diff > bm.sisaBelumDistribusi) {
        showToast(`Stok bahan masuk tidak mencukupi! Sisa belum distribusi: ${bm.sisaBelumDistribusi} pcs`, 'error');
        return;
      }
    }

    dispatch({
      type: 'EDIT_DISTRIBUSI',
      payload: { id: d.id, jumlah: valInt }
    });
    showToast('Jumlah jahitan berhasil diperbarui!', 'success');
    setEditingId(null);
    setEditValue('');
  };

  const handleDeleteClick = (d) => {
    setItemToDelete(d);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      dispatch({ type: 'DELETE_DISTRIBUSI', payload: itemToDelete.id });
      showToast('Data distribusi berhasil dihapus dan dikembalikan ke sisa stok barang masuk.', 'success');
      setItemToDelete(null);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">On Progress</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            Barang yang sedang dijahit taylor
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setShowDistribusi(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
            Distribusi
          </button>
          <button
            onClick={() => setShowKelaran(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 hover:text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-98"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            Catat Kelaran
          </button>
        </div>
      </div>

      {taylorIds.length === 0 ? (
        <EmptyState
          icon="sync"
          title="Tidak Ada Barang On Progress"
          description="Distribusikan barang ke taylor terlebih dahulu"
        />
      ) : (
        <div className="space-y-6 stagger-children">
          {taylorIds.map((taylorId) => {
            const taylor = getTaylor(taylorId);
            const items = taylorGroups[taylorId];
            const totalSisa = items.reduce((s, d) => s + d.sisa, 0);
            return (
              <div key={taylorId} className="space-y-3">
                {/* Taylor Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-purple-500/20">
                      {taylor?.nama?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200 text-sm">{taylor?.nama}</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em] mt-0.5">
                        {totalSisa} pcs sedang dijahit
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 gap-3">
                  {items.map((d) => {
                    const model = getModel(d.modelId);
                    const pctDone = ((d.jumlah - d.sisa) / d.jumlah) * 100;
                    
                    // Look up tracking job
                    const trackJob = (trackingJobs || []).find(j => j.distribusiId === d.id);
                    
                    return (
                      <div
                        key={d.id}
                        className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] border-l-4 border-l-purple-500 p-5 rounded-3xl hover:border-white/[0.15] hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1 space-y-3">
                            {/* Header Info */}
                            <div className="flex flex-wrap items-center gap-2">
                              {trackJob ? (
                                <Badge variant="primary">
                                  {trackJob.status}
                                </Badge>
                              ) : (
                                <Badge variant="default">
                                  Belum Dikerjakan
                                </Badge>
                              )}
                              <h4 className="font-bold text-slate-200 text-sm">{model?.nama}</h4>
                              <span className="text-[10px] text-slate-400 border border-white/10 px-2 py-0.5 rounded-md font-semibold bg-white/[0.02]">{d.tanggal}</span>
                            </div>
                            
                            {/* Detail Nominal/pcs or Edit Input */}
                            {editingId === d.id ? (
                              <div className="flex items-center gap-3 bg-slate-950/40 p-2.5 rounded-2xl border border-white/[0.06] w-full max-w-sm animate-scale-in">
                                <div className="flex-1 space-y-1">
                                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Ubah Jumlah Jahitan</label>
                                  <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
                                    placeholder="Contoh: 1"
                                  />
                                </div>
                                <div className="flex items-center gap-1.5 self-end">
                                  <button
                                    onClick={() => handleSaveEdit(d)}
                                    className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center justify-center cursor-pointer"
                                    title="Simpan"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">check</span>
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                                    title="Batal"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-sm font-black text-cyan-400">{d.sisa} pcs</p>
                                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">sisa dari {d.jumlah}</p>
                                </div>
                              </div>
                            )}

                            {/* Progress Bar */}
                            <div className="w-full bg-slate-950/60 border border-white/[0.04] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                                style={{ width: `${pctDone}%` }}
                              />
                            </div>
                          </div>

                          {/* Tracking Action Button & Edit/Delete Buttons */}
                          <div className="flex items-center gap-2 w-full shrink-0 lg:w-auto mt-2 lg:mt-0 justify-end">
                            {editingId !== d.id && (
                              <>
                                <button
                                  onClick={() => handleStartEdit(d)}
                                  className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-cyan-400 transition-all flex items-center justify-center cursor-pointer"
                                  title="Ubah jumlah jahitan"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(d)}
                                  className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.08] text-slate-400 hover:text-red-400 transition-all flex items-center justify-center cursor-pointer"
                                  title="Hapus distribusi"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </>
                            )}

                            {trackJob ? (
                              <button
                                onClick={() => handleOpenTracking(d)}
                                className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-6 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition-all shadow-sm active:scale-95 cursor-pointer"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                Tracking ({trackJob.progress}%)
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenTracking(d)}
                                className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-6 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[14px]">share</span>
                                Aktifkan Link
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DistribusiForm isOpen={showDistribusi} onClose={() => setShowDistribusi(false)} />
      <KelaranForm isOpen={showKelaran} onClose={() => setShowKelaran(false)} />
      
      {/* Tracking Modal */}
      {showTrackingModal && (
        <TrackingJobForm
          isOpen={showTrackingModal}
          onClose={() => {
            setShowTrackingModal(false);
            setSelectedDist(null);
          }}
          distribusiItem={selectedDist}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => { setShowConfirmDelete(false); setItemToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Hapus Distribusi"
        message="Apakah Anda yakin ingin menghapus data distribusi ini? Bahan yang sudah didistribusikan akan dikembalikan ke sisa stok barang masuk. Semua catatan kelaran dan link tracking terkait juga akan dihapus."
        confirmText="Hapus"
        variant="error"
      />
    </div>
  );
}
