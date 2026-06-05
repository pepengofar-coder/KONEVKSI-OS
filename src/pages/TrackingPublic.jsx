import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Badge from '../components/ui/Badge';

const STATUS_STEPS = [
  { status: 'Belum Dikerjakan', icon: 'schedule', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
  { status: 'Potong Kain (Cutting)', icon: 'content_cut', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { status: 'Menjahit (Sewing)', icon: 'settings', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { status: 'Finishing & Setrika', icon: 'iron', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { status: 'QC & Packing', icon: 'inventory', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { status: 'Selesai', icon: 'check_circle', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
];

export default function TrackingPublic() {
  const { id } = useParams();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editable fields in tailor form
  const [selectedStatus, setSelectedStatus] = useState('');
  const [completedQty, setCompletedQty] = useState(0);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState('');
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  // Fetch job on mount
  const fetchJob = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.npoint.io/bins/${id}`);
      if (!res.ok) {
        throw new Error('Pekerjaan tidak ditemukan di cloud bin.');
      }
      const data = await res.json();
      setJob(data);
      setSelectedStatus(data.status);
      setCompletedQty(Math.round((data.progress / 100) * data.jumlah) || 0);
      setNotes(data.notes || '');
      setPhoto(data.photo || '');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat detail pekerjaan. Pastikan link benar dan koneksi internet aktif.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  // Client-side canvas compression for base64 photo
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsPhotoUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // compress to max 400px width
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Output compressed JPEG at 60% quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        setPhoto(compressedBase64);
        setIsPhotoUploading(false);
      };
    };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setSuccessMsg('');
    setError('');

    // Calculate progress percentage — handle empty string gracefully
    const safeQty = parseInt(completedQty) || 0;
    const progressPct = Math.min(100, Math.max(0, Math.round((safeQty / job.jumlah) * 100)));
    
    // Create new log entry if status changed
    const statusChanged = selectedStatus !== job.status;
    const updatedLogs = [...(job.logs || [])];
    if (statusChanged) {
      updatedLogs.unshift({
        status: selectedStatus,
        timestamp: new Date().toLocaleString('id-ID'),
        notes: notes || 'Status diperbarui oleh penjahit'
      });
    }

    const updatedJob = {
      ...job,
      status: selectedStatus,
      progress: progressPct,
      photo: photo,
      notes: notes,
      logs: updatedLogs
    };

    try {
      // Send PUT to npoint.io bin
      const res = await fetch(`https://api.npoint.io/bins/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedJob),
      });

      if (!res.ok) {
        throw new Error('Gagal menyimpan pembaruan ke cloud bin.');
      }

      setJob(updatedJob);
      setSuccessMsg('Laporan progres berhasil disimpan!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Clear message after 4s
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Gagal mengirim update. Silakan periksa koneksi internet Anda dan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <span className="material-symbols-outlined text-[48px] text-cyan-400 animate-spin">sync</span>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-4">Memuat Data Pelacakan...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-[48px] text-red-500">error</span>
        <h2 className="text-lg font-black text-slate-200 mt-4">Kesalahan Memuat Halaman</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">{error}</p>
        <button
          onClick={fetchJob}
          className="mt-6 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-xs font-bold hover:scale-105 transition-all"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative px-4 py-8 overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-slate-950 to-cyan-950/20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-xl mx-auto space-y-6">
        
        {/* Banner Notification Success */}
        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/20 text-emerald-300 p-4 rounded-2xl flex items-center gap-3 animate-scale-in">
            <span className="material-symbols-outlined text-emerald-400">check_circle</span>
            <span className="text-xs font-bold">{successMsg}</span>
          </div>
        )}

        {/* Banner Notification Error */}
        {error && (
          <div className="bg-red-950/80 border border-red-500/20 text-red-300 p-4 rounded-2xl flex items-center gap-3 animate-scale-in">
            <span className="material-symbols-outlined text-red-400">error</span>
            <span className="text-xs font-bold">{error}</span>
          </div>
        )}

        {/* Job Header */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Pekerjaan Jahit</span>
              <h1 className="text-xl font-black text-slate-100 mt-1">{job.modelName}</h1>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-[14px]">person</span>
                Penjahit: {job.taylorName}
              </p>
            </div>
            <button
              onClick={fetchJob}
              className="p-2 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl transition-all"
              title="Perbarui Data"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>

          <div className="border-t border-white/[0.06] pt-4 grid grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Jumlah Target</span>
              <span className="text-slate-200 mt-0.5 block">{job.jumlah} Pcs</span>
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Progres Saat Ini</span>
              <span className="text-cyan-400 mt-0.5 block font-black">{job.progress}% Selesai</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 border border-white/[0.04] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSave} className="bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] p-6 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-lg">edit_document</span>
            Lapor Progres Pekerjaan
          </h2>

          {/* Status Selection Cards */}
          <div className="space-y-2.5">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Pilih Tahapan Progres</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STATUS_STEPS.map((step) => {
                const isSelected = selectedStatus === step.status;
                return (
                  <button
                    key={step.status}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(step.status);
                      if (step.status === 'Selesai') {
                        setCompletedQty(job.jumlah);
                      }
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${step.color} border-current font-bold scale-[1.01]`
                        : 'bg-slate-950/40 border-white/[0.04] text-slate-400 hover:bg-white/[0.02]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
                    <span className="text-xs">{step.status}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Completed Qty */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Jumlah Yang Sudah Selesai (Pcs)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                inputMode="numeric"
                value={completedQty}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setCompletedQty('');
                  } else {
                    setCompletedQty(Math.min(job.jumlah, Math.max(0, parseInt(val) || 0)));
                  }
                }}
                min="0"
                max={job.jumlah}
                className="w-32 input-base font-bold text-center"
                required
              />
              <span className="text-xs text-slate-500 font-semibold">dari total {job.jumlah} Pcs</span>
            </div>
          </div>

          {/* Photo upload */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Unggah Foto Progres (Opsional)</label>
            
            {photo ? (
              <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-white/[0.08]">
                <img src={photo} alt="Progress upload" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto('')}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all">
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  {isPhotoUploading ? 'Memproses...' : 'Ambil / Upload Foto'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isPhotoUploading}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Catatan Tambahan / Keterangan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Ada 5 pcs cacat kain, atau jahitan selesai 25 pcs tinggal disetrika..."
              rows="3"
              className="input-base resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-purple-500/25 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                Menyimpan...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Kirim Laporan Progres
              </>
            )}
          </button>
        </form>

        {/* Timeline Logs */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] p-6 rounded-3xl shadow-xl space-y-5">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400 text-lg">history</span>
            Riwayat Pembaruan Progres
          </h2>

          <div className="relative border-l-2 border-white/[0.06] pl-5 ml-2.5 space-y-5">
            {job.logs && job.logs.map((log, index) => (
              <div key={index} className="relative">
                {/* Node Dot */}
                <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-md shadow-cyan-500/20" />
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-200">{log.status}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{log.timestamp}</span>
                  </div>
                  {log.notes && (
                    <p className="text-xs text-slate-400 leading-normal">{log.notes}</p>
                  )}
                </div>
              </div>
            ))}

            {(!job.logs || job.logs.length === 0) && (
              <p className="text-xs text-slate-500 italic">Belum ada riwayat aktivitas</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
