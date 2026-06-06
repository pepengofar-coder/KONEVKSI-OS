import { useState } from 'react';
import { useAppState } from '../../context/AppContext';

export default function SuperAdminLogs() {
  const state = useAppState();
  const logs = state.adminLogs || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const actionTypes = [
    { id: 'ALL', label: 'Semua' },
    { id: 'APPROVE_PAYMENT', label: 'ACC Payment' },
    { id: 'REJECT_PAYMENT', label: 'Reject' },
    { id: 'FAIL_PAYMENT', label: 'Failed' },
    { id: 'MANUAL_UPDATE_PLAN', label: 'Update Plan' },
    { id: 'MANUAL_UPDATE_ROLE', label: 'Update Role' },
    { id: 'EXTEND_SUBSCRIPTION', label: 'Extend Sub' },
    { id: 'UPDATE_SETTINGS', label: 'Settings' },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const matchesSearch = !searchQuery ||
      (log.details || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.adminUsername || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.note || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionBadge = (action) => {
    switch (action) {
      case 'APPROVE_PAYMENT':
        return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
      case 'REJECT_PAYMENT':
        return 'bg-rose-500/10 text-rose-300 border border-rose-500/20';
      case 'FAIL_PAYMENT':
        return 'bg-amber-500/10 text-amber-300 border border-amber-500/20';
      case 'MANUAL_UPDATE_PLAN':
      case 'EXTEND_SUBSCRIPTION':
        return 'bg-purple-500/10 text-purple-300 border border-purple-500/20';
      case 'MANUAL_UPDATE_ROLE':
        return 'bg-amber-500/10 text-amber-300 border border-amber-500/20';
      case 'UPDATE_SETTINGS':
        return 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'APPROVE_PAYMENT': return 'check_circle';
      case 'REJECT_PAYMENT': return 'cancel';
      case 'FAIL_PAYMENT': return 'error';
      case 'MANUAL_UPDATE_PLAN': return 'card_membership';
      case 'MANUAL_UPDATE_ROLE': return 'admin_panel_settings';
      case 'EXTEND_SUBSCRIPTION': return 'update';
      case 'UPDATE_SETTINGS': return 'settings';
      default: return 'info';
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
          Riwayat lengkap aktivitas administratif — {logs.length} total log tercatat.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          {actionTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setFilterAction(type.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                filterAction === type.id
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <input
            type="text"
            placeholder="Cari di audit log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-10 text-xs"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Log', value: logs.length, color: 'text-slate-200' },
          { label: 'ACC Payment', value: logs.filter(l => l.action === 'APPROVE_PAYMENT').length, color: 'text-emerald-400' },
          { label: 'Rejected', value: logs.filter(l => l.action === 'REJECT_PAYMENT' || l.action === 'FAIL_PAYMENT').length, color: 'text-rose-400' },
          { label: 'Plan Changes', value: logs.filter(l => l.action === 'MANUAL_UPDATE_PLAN' || l.action === 'EXTEND_SUBSCRIPTION').length, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
            <span className={`block text-lg font-black font-display ${stat.color}`}>{stat.value}</span>
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Logs Timeline */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-xl">
        <div className="relative border-l-2 border-white/[0.06] ml-4 pl-6 space-y-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="relative group">
              {/* Timeline dot */}
              <span className="absolute -left-[33px] top-2 w-4 h-4 rounded-full bg-slate-900 border-2 border-purple-500 flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform" />

              <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl space-y-2 hover:bg-white/[0.02] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`material-symbols-outlined text-[16px] ${getActionBadge(log.action).includes('emerald') ? 'text-emerald-400' : getActionBadge(log.action).includes('rose') ? 'text-rose-400' : getActionBadge(log.action).includes('purple') ? 'text-purple-400' : getActionBadge(log.action).includes('cyan') ? 'text-cyan-400' : 'text-slate-400'}`}>
                      {getActionIcon(log.action)}
                    </span>
                    <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      oleh <strong className="text-slate-200">@{log.adminUsername}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold shrink-0">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-200">{log.details}</p>

                {log.note && (
                  <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-white/[0.04] italic">
                    &ldquo;{log.note}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-slate-500 italic text-sm -ml-6">
              {logs.length === 0
                ? 'Belum ada log aktivitas admin yang tercatat.'
                : 'Tidak ada log yang cocok dengan filter/pencarian Anda.'
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
