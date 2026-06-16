import React from 'react';
import { Shield, MapPin, Award, Printer, Download, Eye } from 'lucide-react';

export default function IDCardView({ personnel, onPrint, onExportPDF }) {
  const { 
    fullName, 
    rank, 
    armyNumber, 
    unit, 
    regiment, 
    branch, 
    status, 
    bloodGroup, 
    dateOfJoining, 
    serviceYears 
  } = personnel.personalInfo;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 relative">
      {/* Control Buttons */}
      <div className="no-print flex justify-end gap-2 mb-2 font-mono">
        <button 
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3 py-1 bg-army-green border border-tactical-gold/30 rounded text-xs text-tactical-khaki hover:text-tactical-gold hover:border-tactical-gold transition-colors duration-150 cursor-pointer"
        >
          <Printer size={12} />
          <span>PRINT RECORD</span>
        </button>
        <button 
          onClick={onExportPDF}
          className="flex items-center gap-1.5 px-3 py-1 bg-army-green border border-tactical-gold/30 rounded text-xs text-tactical-khaki hover:text-tactical-gold hover:border-tactical-gold transition-colors duration-150 cursor-pointer"
        >
          <Download size={12} />
          <span>EXPORT PDF</span>
        </button>
      </div>

      {/* ID Card Wrapper */}
      <div className="glass-panel crt-effect border border-tactical-gold/40 rounded-lg p-5 overflow-hidden shadow-2xl relative select-none">
        
        {/* Holographic Watermark Background */}
        <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
          <svg width="300" height="300" viewBox="0 0 100 100" fill="currentColor" className="text-tactical-gold">
            <path d="M50 5 L75 25 L75 75 L50 95 L25 75 L25 25 Z" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M50 15 L70 30 L70 70 L50 85 L30 70 L30 30 Z" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Diagonal Ribbon Overlay for Martyred/Retired */}
        {status === "Retired" && (
          <div className="absolute top-6 right-[-35px] rotate-45 bg-amber-800/80 text-white font-mono text-[9px] font-bold w-36 text-center py-0.5 border-y border-amber-500/30 uppercase tracking-wide shadow-md z-30">
            HONOUR LIST
          </div>
        )}
        {status === "Active" && (
          <div className="absolute top-6 right-[-35px] rotate-45 bg-green-700/80 text-white font-mono text-[9px] font-bold w-36 text-center py-0.5 border-y border-green-500/30 uppercase tracking-wide shadow-md z-30">
            ACTIVE SERVICE
          </div>
        )}

        <div className="relative z-20 flex flex-col sm:flex-row gap-5">
          {/* Left Column: Photo & Badges */}
          <div className="flex flex-col items-center gap-3">
            {/* Tactical Frame */}
            <div className="relative p-1 border border-tactical-gold/30 bg-military-black rounded">
              {/* Sonar Reticle corners */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-tactical-gold"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-tactical-gold"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-tactical-gold"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-tactical-gold"></div>
              
              {/* Photo */}
              <div className="w-32 h-40 bg-army-dark flex items-center justify-center overflow-hidden relative">
                {/* Silhouette avatar representing secure profile */}
                <div className="absolute inset-0 bg-gradient-to-t from-army-green/50 to-transparent mix-blend-overlay z-10"></div>
                <svg viewBox="0 0 100 100" className="w-full h-full text-olive-drab/60 p-2">
                  <circle cx="50" cy="35" r="20" fill="currentColor" />
                  <path d="M15 85 C15 60, 25 55, 50 55 C75 55, 85 60, 85 85 Z" fill="currentColor" />
                  <circle cx="50" cy="50" r="43" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" fill="none" />
                </svg>
                {/* Grid Scanline Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] pointer-events-none"></div>
                {/* Visual Red Laser Bar */}
                <div className="absolute w-full h-[2px] bg-tactical-orange/70 shadow-[0_0_8px_rgba(255,107,0,0.8)] top-0 left-0 animate-scanline"></div>
              </div>
            </div>

            {/* Rank badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-army-dark/80 border border-army-green rounded-full text-[10px] font-bold text-tactical-khaki font-mono">
              <Award size={12} className="text-tactical-gold" />
              <span>{rank.toUpperCase()}</span>
            </div>
          </div>

          {/* Right Column: Card Credentials */}
          <div className="flex-1 font-mono text-tactical-khaki flex flex-col justify-between">
            <div>
              {/* Header banner */}
              <div className="flex items-center justify-between border-b border-tactical-gold/20 pb-1.5 mb-3">
                <div>
                  <h3 className="text-xs text-tactical-gold font-bold uppercase tracking-widest">INDIAN ARMY PORTAL</h3>
                  <p className="text-[8px] text-olive-drab tracking-widest">PERSONNEL CREDENTIAL IDENTIFICATION</p>
                </div>
                <Shield size={20} className="text-tactical-gold" />
              </div>

              {/* Grid data */}
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                <div>
                  <span className="text-[9px] text-olive-drab block uppercase font-sans">FULL NAME</span>
                  <span className="font-bold text-white tracking-wide">{fullName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-olive-drab block uppercase font-sans">ARMY NUMBER</span>
                  <span className="font-bold text-tactical-orange tracking-wide">{armyNumber}</span>
                </div>
                <div>
                  <span className="text-[9px] text-olive-drab block uppercase font-sans">REGIMENT / CORPS</span>
                  <span className="font-semibold text-white truncate block">{regiment}</span>
                </div>
                <div>
                  <span className="text-[9px] text-olive-drab block uppercase font-sans">UNIT / STATION</span>
                  <span className="font-semibold text-white truncate block">{unit}</span>
                </div>
                <div>
                  <span className="text-[9px] text-olive-drab block uppercase font-sans">BRANCH / WING</span>
                  <span className="font-semibold text-white">{branch}</span>
                </div>
                <div>
                  <span className="text-[9px] text-olive-drab block uppercase font-sans">BLOOD GROUP</span>
                  <span className="font-bold text-red-400">{bloodGroup}</span>
                </div>
                <div>
                  <span className="text-[9px] text-olive-drab block uppercase font-sans">COMMISSION DATE</span>
                  <span className="font-semibold text-white">{dateOfJoining}</span>
                </div>
                <div>
                  <span className="text-[9px] text-olive-drab block uppercase font-sans">SERVICE RECORD</span>
                  <span className="font-semibold text-white">{serviceYears}</span>
                </div>
              </div>
            </div>

            {/* Barcode & Security stamp footer */}
            <div className="flex items-end justify-between border-t border-tactical-gold/20 pt-3 mt-4">
              {/* Holographic Hologram security Stamp */}
              <div className="relative group">
                <div className="w-12 h-12 rounded-full border border-tactical-gold/45 bg-gradient-to-tr from-army-medium to-tactical-gold/30 flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_12px_rgba(212,175,55,0.4)]">
                  <div className="absolute inset-[-100%] bg-gradient-to-tr from-transparent via-white/25 to-transparent rotate-45 transform transition-transform group-hover:translate-x-full duration-1000"></div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tactical-gold">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-[7px] text-olive-drab absolute left-0 bottom-[-10px] w-max uppercase">SECURE SEAL</span>
              </div>

              {/* Barcode */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-[2px] items-center h-6 opacity-80">
                  <div className="w-[1px] h-full bg-tactical-khaki"></div>
                  <div className="w-[2px] h-full bg-tactical-khaki"></div>
                  <div className="w-[1px] h-full bg-tactical-khaki"></div>
                  <div className="w-[3px] h-full bg-tactical-khaki"></div>
                  <div className="w-[1px] h-full bg-tactical-khaki"></div>
                  <div className="w-[2px] h-full bg-tactical-khaki"></div>
                  <div className="w-[1px] h-full bg-tactical-khaki"></div>
                  <div className="w-[1px] h-full bg-tactical-khaki"></div>
                  <div className="w-[3px] h-full bg-tactical-khaki"></div>
                  <div className="w-[1px] h-full bg-tactical-khaki"></div>
                  <div className="w-[2px] h-full bg-tactical-khaki"></div>
                  <div className="w-[1px] h-full bg-tactical-khaki"></div>
                </div>
                <span className="text-[8px] text-olive-drab uppercase tracking-widest">{armyNumber}</span>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-1 rounded">
                <svg width="40" height="40" viewBox="0 0 100 100" className="text-black">
                  {/* Outer corner finders */}
                  <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="12.5" y="12.5" width="10" height="10" fill="currentColor" />
                  
                  <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="77.5" y="12.5" width="10" height="10" fill="currentColor" />
                  
                  <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="12.5" y="77.5" width="10" height="10" fill="currentColor" />

                  {/* Random QR code pixels representing encrypted Army Number */}
                  <rect x="35" y="5" width="6" height="6" fill="currentColor" />
                  <rect x="47" y="11" width="6" height="6" fill="currentColor" />
                  <rect x="59" y="5" width="6" height="6" fill="currentColor" />
                  <rect x="41" y="23" width="12" height="6" fill="currentColor" />
                  
                  <rect x="5" y="35" width="6" height="18" fill="currentColor" />
                  <rect x="23" y="41" width="12" height="6" fill="currentColor" />
                  <rect x="17" y="53" width="6" height="12" fill="currentColor" />

                  <rect x="35" y="35" width="12" height="12" fill="currentColor" />
                  <rect x="53" y="35" width="6" height="6" fill="currentColor" />
                  <rect x="47" y="47" width="18" height="6" fill="currentColor" />
                  <rect x="35" y="59" width="6" height="18" fill="currentColor" />
                  <rect x="47" y="65" width="12" height="6" fill="currentColor" />

                  <rect x="70" y="35" width="12" height="6" fill="currentColor" />
                  <rect x="82" y="47" width="6" height="12" fill="currentColor" />
                  <rect x="76" y="65" width="18" height="12" fill="currentColor" />
                  
                  <rect x="59" y="76" width="6" height="12" fill="currentColor" />
                  <rect x="47" y="88" width="12" height="6" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
