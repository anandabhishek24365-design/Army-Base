import React, { useState, useEffect } from 'react';
import { Shield, Radio, Terminal } from 'lucide-react';

export default function SecurityBanner() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  return (
    <div className="security-banner no-print bg-military-black border-b border-tactical-gold/30 px-4 py-2 flex flex-col md:flex-row items-center justify-between text-xs font-mono text-tactical-khaki tracking-wider select-none z-50">
      <div className="flex items-center gap-3">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
        </span>
        <div className="flex items-center gap-1.5 text-red-500 font-bold">
          <Shield size={14} className="animate-pulse" />
          <span>SECRET // FOR AUTHORIZED USE ONLY</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-1 md:mt-0 text-[10px] md:text-xs text-olive-drab">
        <div className="flex items-center gap-1.5">
          <Terminal size={12} className="text-tactical-gold" />
          <span>TERMINAL IP: <strong className="text-tactical-khaki">10.224.89.102</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio size={12} className="text-tactical-gold animate-pulse" />
          <span>AUDIT LOGGING: <strong className="text-green-500">ACTIVE</strong></span>
        </div>
        <div className="text-tactical-gold font-semibold bg-army-dark/60 border border-army-green/50 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(45,74,45,0.4)]">
          MIL-SEC LEVEL 5
        </div>
      </div>

      <div className="mt-1 md:mt-0 font-bold text-tactical-gold">
        {formatTime(time)}
      </div>
    </div>
  );
}
