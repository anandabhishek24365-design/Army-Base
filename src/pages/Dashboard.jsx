import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarRange, 
  ShieldAlert, 
  Search, 
  Activity, 
  TrendingUp,
  FileCheck,
  CheckCircle,
  Database
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard({ onSearchTrigger, setActiveTab }) {
  const [stats, setStats] = useState({
    totalPersonnel: 3,
    activePersonnel: 2,
    onDuty: 1,
    onLeave: 1,
    pendingLeaves: 2,
    searchCount: 5
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch('/api/dashboard/stats');
      const statsData = await statsRes.json();
      if (statsRes.ok && statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch latest logs for live feed
      const logsRes = await fetch('/api/audit/logs');
      const logsData = await logsRes.json();
      if (logsRes.ok && logsData.success) {
        setRecentLogs(logsData.logs.slice(0, 4));
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick personnel search redirection
  const handleQuickSearch = (armyNumber) => {
    onSearchTrigger(armyNumber);
  };

  // Recharts Pie Chart Data
  const distributionData = [
    { name: 'Active Duty', value: stats.onDuty, color: '#486e48' },
    { name: 'On Leave', value: stats.onLeave, color: '#d4af37' },
    { name: 'Inactive/Retired', value: stats.totalPersonnel - stats.activePersonnel, color: '#ff6b00' }
  ];

  // Recharts Area Chart Data (Simulated daily search activity trend)
  const searchTrendData = [
    { day: '06-06', queries: 2 },
    { day: '06-07', queries: 5 },
    { day: '06-08', queries: 8 },
    { day: '06-09', queries: 4 },
    { day: '06-10', queries: 6 },
    { day: '06-11', queries: 9 },
    { day: '06-12', queries: stats.searchCount || 5 }
  ];

  return (
    <div className="w-full font-mono text-tactical-khaki space-y-6">
      
      {/* Central Command Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-army-green/40 pb-3 gap-2">
        <div>
          <h2 className="text-lg font-bold text-white tracking-widest uppercase flex items-center gap-2">
            <Activity size={18} className="text-tactical-gold" />
            <span>HQ FORCE POSITION COMMAND</span>
          </h2>
          <p className="text-[10px] text-olive-drab">LIVE FORCE COMPLEMENT AND ANALYTICS ROSTER</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 px-3 py-1 bg-army-green border border-army-green text-xs rounded hover:border-tactical-gold hover:text-tactical-gold transition-colors cursor-pointer"
        >
          <RefreshButton />
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Personnel */}
        <div className="glass-panel p-4 rounded-lg border border-army-green/40 flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Users size={48} className="text-tactical-khaki" />
          </div>
          <div>
            <span className="text-[10px] text-olive-drab block uppercase font-sans font-bold">TOTAL REGISTERED</span>
            <span className="text-2xl font-bold text-white leading-none font-mono">{stats.totalPersonnel}</span>
          </div>
        </div>

        {/* Stat 2: Active Duty */}
        <div className="glass-panel p-4 rounded-lg border border-army-green/40 flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <div>
            <span className="text-[10px] text-olive-drab block uppercase font-sans font-bold">ACTIVE SERVICE</span>
            <span className="text-2xl font-bold text-green-500 leading-none font-mono">{stats.activePersonnel}</span>
          </div>
        </div>

        {/* Stat 3: On Leave */}
        <div className="glass-panel p-4 rounded-lg border border-army-green/40 flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <CalendarRange size={48} className="text-tactical-gold" />
          </div>
          <div>
            <span className="text-[10px] text-olive-drab block uppercase font-sans font-bold">ON FURLOUGH / LEAVE</span>
            <span className="text-2xl font-bold text-tactical-gold leading-none font-mono">{stats.onLeave}</span>
          </div>
        </div>

        {/* Stat 4: Pending Leaves */}
        <div className="glass-panel p-4 rounded-lg border border-army-green/40 flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <FileCheck size={48} className="text-tactical-orange" />
          </div>
          <div>
            <span className="text-[10px] text-olive-drab block uppercase font-sans font-bold">PENDING REQUESTS</span>
            <span className="text-2xl font-bold text-tactical-orange leading-none font-mono">{stats.pendingLeaves}</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Search Activity Chart */}
        <div className="glass-panel p-4 rounded-lg border border-army-green/35 lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <TrendingUp size={14} className="text-tactical-gold" />
              <span>TERMINAL TRANSACTION TREND</span>
            </span>
            <span className="text-[9px] text-olive-drab">7-DAY RANGE</span>
          </div>
          <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={searchTrendData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="queriesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#486e48" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#486e48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#486e48" strokeWidth={1} />
                <YAxis stroke="#486e48" strokeWidth={1} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f180f', borderColor: '#d4af37', borderRadius: '4px' }}
                  labelStyle={{ color: '#c2b280', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="queries" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#queriesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Force Distribution Donut Chart */}
        <div className="glass-panel p-4 rounded-lg border border-army-green/35 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            FORCE STATUS DISTRIBUTION
          </span>
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f180f', borderColor: '#d4af37', borderRadius: '4px' }}
                  itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center HUD value */}
            <div className="absolute text-center select-none pointer-events-none">
              <div className="text-lg font-bold text-white leading-none">{stats.totalPersonnel}</div>
              <div className="text-[7px] text-olive-drab mt-1 font-bold">OFFICERS</div>
            </div>
          </div>

          {/* Custom Legends */}
          <div className="space-y-1.5 text-[10px]">
            {distributionData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm block" style={{ backgroundColor: entry.color }}></span>
                  <span className="text-tactical-khaki">{entry.name}</span>
                </div>
                <span className="font-bold text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Quick Access Actions & Live Log Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Access */}
        <div className="glass-panel p-4 rounded-lg border border-army-green/35 space-y-3 lg:col-span-1">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Database size={14} className="text-tactical-gold" />
            <span>TACTICAL SHORTCUTS</span>
          </span>
          
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('search')}
              className="w-full flex items-center justify-between p-2.5 bg-military-black border border-army-green/40 hover:border-tactical-gold rounded text-left transition-colors cursor-pointer group"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-tactical-gold">SEARCH GENERAL FILE</div>
                <div className="text-[9px] text-olive-drab">Look up IC-102938A Gen Manoj Pande</div>
              </div>
              <Search size={14} className="text-olive-drab group-hover:text-tactical-gold" />
            </button>

            <button 
              onClick={() => handleQuickSearch('IC-582910M')}
              className="w-full flex items-center justify-between p-2.5 bg-military-black border border-army-green/40 hover:border-tactical-gold rounded text-left transition-colors cursor-pointer group"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-tactical-gold">SEARCH TRIBUTE RECORD</div>
                <div className="text-[9px] text-olive-drab">Look up IC-582910M Col Vikram Batra</div>
              </div>
              <Search size={14} className="text-olive-drab group-hover:text-tactical-gold" />
            </button>

            <button 
              onClick={() => handleQuickSearch('JC-481920K')}
              className="w-full flex items-center justify-between p-2.5 bg-military-black border border-army-green/40 hover:border-tactical-gold rounded text-left transition-colors cursor-pointer group"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-tactical-gold">SEARCH ACTIVE SUBEDAR</div>
                <div className="text-[9px] text-olive-drab">Look up JC-481920K Sub Neeraj Chopra</div>
              </div>
              <Search size={14} className="text-olive-drab group-hover:text-tactical-gold" />
            </button>
          </div>
        </div>

        {/* Security Live Logs Widget */}
        <div className="glass-panel p-4 rounded-lg border border-army-green/35 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-tactical-orange" />
              <span>LIVE SECURITY AUDIT CONSOLE</span>
            </span>
            <button 
              onClick={() => setActiveTab('audit')}
              className="text-[9px] text-tactical-gold hover:underline font-bold"
            >
              VIEW ALL
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-olive-drab italic text-center py-4">No recent security events</p>
            ) : (
              recentLogs.map((log, i) => (
                <div key={i} className="p-2 bg-military-black/80 border border-army-green/30 rounded text-[10px] flex items-start justify-between font-mono gap-4">
                  <div className="flex items-start gap-2">
                    <span className="text-olive-drab select-none font-semibold">[{log.timestamp.slice(11,19)}]</span>
                    <div>
                      <span className="text-white font-bold">{log.operator}:</span>{' '}
                      <span className="text-slate-300">{log.action}</span>
                      <span className="text-[9px] text-olive-drab block font-sans mt-0.5">{log.details}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

// Inline Subcomponents
function RefreshButton() {
  return (
    <>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin-slow">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.72 2.73L21 8" />
        <path d="M21 3v5h-5" />
      </svg>
      <span>REFRESH STATS</span>
    </>
  );
}
