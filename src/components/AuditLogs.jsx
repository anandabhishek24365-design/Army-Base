import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, Filter, Search, Download } from 'lucide-react';

export default function AuditLogs({ logs, onRefresh }) {
  const [filterText, setFilterText] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesText = 
      log.operator.toLowerCase().includes(filterText.toLowerCase()) ||
      log.action.toLowerCase().includes(filterText.toLowerCase()) ||
      log.details.toLowerCase().includes(filterText.toLowerCase());

    const matchesAction = 
      actionFilter === 'ALL' || 
      log.action.toUpperCase().includes(actionFilter.toUpperCase());

    return matchesText && matchesAction;
  });

  // Export logs to a text file
  const handleExportLogs = () => {
    const logsContent = filteredLogs.map(log => 
      `[${log.timestamp}] OPERATOR: ${log.operator} | ACTION: ${log.action} | DETAILS: ${log.details}`
    ).join('\n');

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(logsContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `military_audit_logs_${new Date().toISOString().slice(0,10)}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full font-mono text-tactical-khaki space-y-4">
      {/* Module Title */}
      <div className="flex items-center justify-between border-b border-army-green/40 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={20} className="text-tactical-orange animate-pulse" />
          <h2 className="text-lg font-bold text-white tracking-widest uppercase">TACTICAL SECURITY AUDIT REGISTRY</h2>
        </div>
        <button 
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1 bg-army-green/50 border border-army-green text-xs rounded hover:border-tactical-gold hover:text-tactical-gold transition-colors cursor-pointer"
        >
          <RefreshCw size={12} className="hover:animate-spin" />
          <span>RELOAD REGISTRY</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-lg flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Text Filter */}
        <div className="w-full md:w-72 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-olive-drab" />
          <input 
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search operator, event or detail..."
            className="w-full pl-9 pr-3 py-1.5 bg-military-black border border-army-green/50 focus:border-tactical-gold rounded text-xs text-white placeholder-olive-drab focus:outline-none"
          />
        </div>

        {/* Action Type Filter */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <Filter size={14} className="text-tactical-gold shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-military-black border border-army-green/50 focus:border-tactical-gold rounded text-xs text-tactical-khaki px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">ALL OPERATIONS</option>
            <option value="AUTHENTICATED">AUTHENTICATIONS</option>
            <option value="SEARCHED">RECORD SEARCHES</option>
            <option value="DOWNLOADED">DOWNLOAD PREVIEWS</option>
            <option value="DECRYPT">FIELD DECRYPTIONS</option>
            <option value="FAILED">FAILED ACTIONS</option>
          </select>
        </div>

        {/* Export Log button */}
        <button 
          onClick={handleExportLogs}
          className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-1.5 bg-tactical-gold/25 border border-tactical-gold text-tactical-gold text-xs rounded hover:bg-tactical-gold/40 transition-colors cursor-pointer"
        >
          <Download size={12} />
          <span>EXPORT ACTIVE VIEW (.TXT)</span>
        </button>
      </div>

      {/* Audit Registry Feed */}
      <div className="glass-panel rounded-lg overflow-hidden border border-army-green/35 shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-mono">
            <thead>
              <tr className="bg-army-dark border-b border-army-green/30 text-olive-drab uppercase font-bold tracking-wider">
                <th className="p-3 w-48 text-[10px]">TIMESTAMP</th>
                <th className="p-3 w-40 text-[10px]">OPERATOR TERMINAL</th>
                <th className="p-3 w-36 text-[10px]">SECURITY EVENT</th>
                <th className="p-3 text-[10px]">TRANSACTION DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-army-green/15 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-olive-drab italic bg-military-black/20">
                    No matching military security records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  let badgeColor = "bg-army-green/30 text-tactical-khaki border-army-green/50";
                  if (log.action.includes("Failed") || log.action.includes("Violated")) {
                    badgeColor = "bg-red-950/50 text-red-400 border-red-900/50";
                  } else if (log.action.includes("Authenticated") || log.action.includes("OTP")) {
                    badgeColor = "bg-yellow-950/50 text-tactical-gold border-tactical-gold/50";
                  } else if (log.action.includes("Decrypt")) {
                    badgeColor = "bg-blue-950/50 text-blue-400 border-blue-900/50";
                  }

                  return (
                    <tr 
                      key={index}
                      className="hover:bg-army-green/5 transition-colors duration-150 border-b border-army-green/10"
                    >
                      <td className="p-3 text-[10px] text-olive-drab font-semibold select-none">
                        {log.timestamp.replace('T', ' ').substring(0, 19)}
                      </td>
                      <td className="p-3 font-semibold text-white tracking-wide">
                        {log.operator}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${badgeColor}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-xs text-slate-400 max-w-sm truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
