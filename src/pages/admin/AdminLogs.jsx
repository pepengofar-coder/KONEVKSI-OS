import { useAppState } from '../../context/AppContext';

export default function AdminLogs() {
  const state = useAppState();
  const logs = state.adminLogs || [];

  const getActionBadge = (action) => {
    switch (action) {
      case 'APPROVE_PAYMENT':
        return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
      case 'REJECT_PAYMENT':
        return 'bg-rose-500/10 text-rose-300 border border-rose-500/20';
      case 'MANUAL_UPDATE_PLAN':
      case 'EXTEND_SUBSCRIPTION':
        return 'bg-purple-500/10 text-purple-300 border border-purple-500/20';
      case 'MANUAL_UPDATE_ROLE':
        return 'bg-amber-500/10 text-amber-300 border border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Audit Log Keamanan & Platform
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Riwayat lengkap aktivitas administratif yang dilakukan oleh admin atau sistem platform Konveksi OS.
        </p>
      </div>

      {/* Logs Timeline */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl">
        <div className="relative border-l border-white/[0.08] ml-4 pl-6 space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="relative group">
              {/* Timeline dot */}
              <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-purple-500 flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform" />

              <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl space-y-2 hover:bg-white/[0.02] transition-all">
                {/* Log Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Oleh <strong className="text-slate-200">@{log.adminUsername}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Log Content */}
                <p className="text-xs font-bold text-slate-200">{log.details}</p>

                {log.note && (
                  <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-white/[0.04] italic">
                    &ldquo;{log.note}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-12 text-slate-500 italic text-sm -ml-6 border-l-0">
              Belum ada log aktivitas admin yang tercatat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
