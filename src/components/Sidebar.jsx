import React, { useRef } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  History, 
  ShieldAlert, 
  Download, 
  Upload, 
  LogOut, 
  Sun, 
  Moon,
  Compass,
  FileText,
  UserPlus
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  recentSearches, 
  onHistoryClick, 
  onLogout, 
  darkMode, 
  setDarkMode,
  dbData,
  onImportDb
}) {
  const fileInputRef = useRef(null);

  // Export db.json as a backup
  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "indian_army_db_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore db.json from a backup
  const handleRestore = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        if (parsedData && typeof parsedData === 'object') {
          onImportDb(parsedData);
          alert("Database Backup Restored Successfully!");
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Error reading backup file.");
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <aside className="sidebar no-print w-full md:w-64 bg-army-dark border-r border-army-green/40 flex flex-col justify-between shrink-0 font-mono text-tactical-khaki">
      {/* Header Info */}
      <div>
        <div className="p-4 border-b border-army-green/30 flex items-center gap-3">
          <div className="bg-tactical-gold/25 border border-tactical-gold p-1.5 rounded-full text-tactical-gold animate-sonar">
            <Compass size={22} className="animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest text-white uppercase">IA-PORTAL</h2>
            <p className="text-[10px] text-olive-drab">MILITARY DATA SHEATH</p>
          </div>
        </div>

        {/* View Selection */}
        <nav className="p-3 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-all duration-200 border ${
              activeTab === 'dashboard' 
                ? 'bg-army-green/40 border-tactical-gold/40 text-tactical-gold shadow-[0_0_12px_rgba(212,175,55,0.15)] font-bold' 
                : 'border-transparent text-olive-drab hover:text-tactical-khaki hover:bg-army-green/20'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>HQ DASHBOARD</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('search')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-all duration-200 border ${
              activeTab === 'search' 
                ? 'bg-army-green/40 border-tactical-gold/40 text-tactical-gold shadow-[0_0_12px_rgba(212,175,55,0.15)] font-bold' 
                : 'border-transparent text-olive-drab hover:text-tactical-khaki hover:bg-army-green/20'
            }`}
          >
            <Search size={16} />
            <span>PERSONNEL SEARCH</span>
          </button>

          <button 
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-all duration-200 border ${
              activeTab === 'audit' 
                ? 'bg-army-green/40 border-tactical-gold/40 text-tactical-gold shadow-[0_0_12px_rgba(212,175,55,0.15)] font-bold' 
                : 'border-transparent text-olive-drab hover:text-tactical-khaki hover:bg-army-green/20'
            }`}
          >
            <ShieldAlert size={16} />
            <span>SECURITY AUDIT LOGS</span>
          </button>

          <button 
            onClick={() => setActiveTab('commission')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-all duration-200 border ${
              activeTab === 'commission' 
                ? 'bg-army-green/40 border-tactical-gold/40 text-tactical-gold shadow-[0_0_12px_rgba(212,175,55,0.15)] font-bold' 
                : 'border-transparent text-olive-drab hover:text-tactical-khaki hover:bg-army-green/20'
            }`}
          >
            <UserPlus size={16} />
            <span>COMMISSION CADET</span>
          </button>
        </nav>

        {/* Recent Searches / History */}
        <div className="px-4 py-3 border-t border-army-green/20">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-olive-drab tracking-widest uppercase mb-2">
            <History size={12} />
            <span>RECENT QUERIES</span>
          </div>
          {recentSearches.length === 0 ? (
            <p className="text-[10px] text-army-green italic px-1">No recent searches</p>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {recentSearches.map((num, i) => (
                <button
                  key={i}
                  onClick={() => onHistoryClick(num)}
                  className="w-full text-left text-[11px] px-2 py-1 rounded border border-army-green/20 bg-military-black hover:border-tactical-gold hover:text-tactical-gold transition-colors duration-150 font-mono"
                >
                  &gt; {num}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Settings & Actions */}
      <div className="p-3 border-t border-army-green/20 space-y-2">
        {/* Backup and Restore */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleBackup}
            title="Download DB Backup"
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 border border-army-green/40 text-[10px] font-bold text-olive-drab hover:text-tactical-gold hover:border-tactical-gold hover:bg-army-green/15 rounded transition-all duration-200"
          >
            <Download size={12} />
            <span>BACKUP</span>
          </button>
          
          <button 
            onClick={() => fileInputRef.current.click()}
            title="Upload DB Backup"
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 border border-army-green/40 text-[10px] font-bold text-olive-drab hover:text-tactical-gold hover:border-tactical-gold hover:bg-army-green/15 rounded transition-all duration-200"
          >
            <Upload size={12} />
            <span>RESTORE</span>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleRestore} 
            accept=".json" 
            className="hidden" 
          />
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-between px-3 py-2 border border-army-green/30 rounded text-[11px] text-olive-drab hover:text-tactical-khaki transition-all duration-200"
        >
          <span className="flex items-center gap-2">
            {darkMode ? <Moon size={12} /> : <Sun size={12} />}
            <span>{darkMode ? "NIGHT OPERATION" : "DAY OPERATION"}</span>
          </span>
          <span className="text-[9px] px-1 bg-army-green/40 border border-army-green/50 text-tactical-khaki rounded">
            {darkMode ? "ON" : "OFF"}
          </span>
        </button>

        {/* Log Out */}
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded text-[11px] border border-red-900/30 text-red-400 hover:text-red-300 hover:bg-red-950/20 hover:border-red-500/30 transition-all duration-200"
        >
          <LogOut size={12} />
          <span>TERMINATE SESSION</span>
        </button>
      </div>
    </aside>
  );
}
