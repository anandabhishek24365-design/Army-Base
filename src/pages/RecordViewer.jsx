import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Search, 
  FileText, 
  Users, 
  Calendar, 
  CreditCard, 
  History, 
  HeartPulse, 
  Award,
  Eye, 
  EyeOff, 
  Printer, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Download,
  AlertCircle
} from 'lucide-react';
import { mockPersonnelData } from '../mockData';
import IDCardView from '../components/IDCardView';
import LeafletMap from '../components/LeafletMap';
import FamilyTree from '../components/FamilyTree';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function RecordViewer({ 
  searchedNumber, 
  setSearchedNumber, 
  recentSearches, 
  setRecentSearches,
  authToken 
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [personnel, setPersonnel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('personal');

  // Security masking states
  const [revealBank, setRevealBank] = useState(false);
  const [revealAadhaar, setRevealAadhaar] = useState(false);
  const [revealPan, setRevealPan] = useState(false);

  // PDF Viewer simulated state
  const [pdfZoom, setPdfZoom] = useState(1);
  const [pdfRotation, setPdfRotation] = useState(0);

  // Print configuration modal states
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printActionType, setPrintActionType] = useState('print'); // 'print' | 'pdf'
  const [selectedSections, setSelectedSections] = useState({
    idCard: true,
    personal: true,
    documents: true,
    address: true,
    family: true,
    leave: true,
    bank: true,
    service: true,
    medical: true,
    awards: true
  });

  // Keep search input synced with search actions from sidebar history clicks
  useEffect(() => {
    if (searchedNumber) {
      setQuery(searchedNumber);
      handleSearch(searchedNumber);
    }
  }, [searchedNumber]);

  // Live autocomplete suggestions
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 1) {
      const filtered = Object.keys(mockPersonnelData).filter(num => 
        num.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (num) => {
    setQuery(num);
    setSuggestions([]);
    handleSearch(num);
  };

  // Log custom action to audit logger
  const logSecurityEvent = async (action, details) => {
    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          operator: "System Admin (HQ)",
          action,
          details
        })
      });
    } catch (err) {
      console.error("Audit log post failed:", err);
    }
  };

  // Perform Personnel Search
  const handleSearch = async (targetNum) => {
    const numToSearch = targetNum || query;
    if (!numToSearch.trim()) return;

    setSuggestions([]);
    setError('');
    setLoading(true);
    setPersonnel(null);

    // Reset secure reveal toggles
    setRevealBank(false);
    setRevealAadhaar(false);
    setRevealPan(false);

    try {
      const res = await fetch(`/api/personnel/${numToSearch.trim()}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPersonnel(data.record);
        setSearchedNumber(numToSearch.trim().toUpperCase());
        
        // Add to history
        if (!recentSearches.includes(numToSearch.trim().toUpperCase())) {
          setRecentSearches(prev => [numToSearch.trim().toUpperCase(), ...prev.slice(0, 4)]);
        }
      } else {
        setError(data.message || 'Record not found in military base.');
      }
    } catch (err) {
      setError('Connection timeout. Secure database unreachable.');
    } finally {
      setLoading(false);
    }
  };

  // Security action triggers
  const triggerRevealBank = () => {
    const newState = !revealBank;
    setRevealBank(newState);
    if (newState) {
      logSecurityEvent("Secure Field Decrypt", `Decrypted Bank Details for Army No: ${personnel.personalInfo.armyNumber}`);
    }
  };

  const triggerRevealAadhaar = () => {
    const newState = !revealAadhaar;
    setRevealAadhaar(newState);
    if (newState) {
      logSecurityEvent("Secure Field Decrypt", `Decrypted Aadhaar ID for Army No: ${personnel.personalInfo.armyNumber}`);
    }
  };

  const triggerRevealPan = () => {
    const newState = !revealPan;
    setRevealPan(newState);
    if (newState) {
      logSecurityEvent("Secure Field Decrypt", `Decrypted PAN Card for Army No: ${personnel.personalInfo.armyNumber}`);
    }
  };

  const triggerDocumentDownload = (docName, fileData = '') => {
    logSecurityEvent("Document Downloaded", `Operator downloaded: ${docName} - Army No: ${personnel.personalInfo.armyNumber}`);
    if (fileData && fileData.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = fileData;
      const ext = fileData.split(';')[0].split('/')[1] || 'png';
      link.download = `${docName.replace(/\s+/g, '_').toLowerCase()}_${personnel.personalInfo.armyNumber}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Downloading ${docName} locally under security compliance protocol.`);
    }
  };

  // Printing & PDF triggers
  const handlePrintRecord = () => {
    setPrintActionType('print');
    setShowPrintModal(true);
  };

  const handleExportPDF = () => {
    setPrintActionType('pdf');
    setShowPrintModal(true);
  };

  const executePrintExport = () => {
    setShowPrintModal(false);
    logSecurityEvent(
      printActionType === 'print' ? "Record Printed" : "PDF Export",
      `Printed selected sections for Army No: ${personnel.personalInfo.armyNumber}. Sections: ${Object.keys(selectedSections).filter(k => selectedSections[k]).join(', ')}`
    );
    // Let state changes render, then call native print
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="w-full font-mono text-tactical-khaki space-y-6">
      
      {/* Search Bar HUD */}
      <div className="no-print glass-panel p-5 rounded-lg border border-army-green/45 relative">
        <div className="absolute top-0 left-4 bg-military-black border border-army-green px-2 py-0.5 rounded text-[9px] font-bold text-tactical-gold tracking-widest uppercase">
          FORCE REGISTRY DATABASE SEARCH
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col sm:flex-row gap-3 items-center mt-2 relative">
          <div className="w-full relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-olive-drab" />
            <input 
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="ENTER ARMY NUMBER (e.g. IC-102938A, IC-582910M, JC-481920K)..."
              className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2.5 pl-10 text-xs font-bold text-white uppercase placeholder-army-green/50 focus:outline-none"
            />

            {/* Smart Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute w-full mt-1 bg-military-black border border-tactical-gold/40 rounded shadow-2xl z-50 divide-y divide-army-green/20">
                {suggestions.map((num, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectSuggestion(num)}
                    className="w-full text-left px-4 py-2 hover:bg-army-green/20 text-white text-xs font-bold font-mono transition-colors"
                  >
                    &gt; {num} ({num === 'IC-102938A' ? 'Gen. Pande' : num === 'IC-582910M' ? 'Col. Batra' : 'Sub. Chopra'})
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-tactical-gold hover:bg-amber-600 text-military-black font-bold text-xs uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>RETRIEVE RECORDS</span>
          </button>
        </form>
      </div>

      {/* Loading Radar Sweep */}
      {loading && (
        <div className="glass-panel p-12 rounded-lg text-center border border-army-green/45 flex flex-col items-center justify-center gap-3">
          <div className="relative w-16 h-16 border-2 border-dashed border-tactical-gold rounded-full flex items-center justify-center animate-spin-slow">
            <div className="w-12 h-12 border-2 border-tactical-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-xs font-bold tracking-widest text-tactical-gold animate-pulse">
            SCANNING FORCE COMPLEMENT DATABASE...
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="glass-panel p-6 rounded-lg text-center border border-red-900/40 flex flex-col items-center justify-center gap-2">
          <AlertCircle size={32} className="text-red-500 animate-bounce" />
          <h3 className="text-sm font-bold text-white uppercase">REGISTRY ACCESS FAILURE</h3>
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Personnel Dossier Presentation */}
      {personnel && !loading && (
        <div className="space-y-6 no-print">
          {/* Top Profile Card Viewer */}
          <IDCardView 
            personnel={personnel} 
            onPrint={handlePrintRecord} 
            onExportPDF={handleExportPDF} 
          />

          {/* Dossier Tabs Navigation */}
          <div className="no-print border-b border-army-green/30 flex flex-wrap gap-1">
            {[
              { id: 'personal', label: 'PERSONAL INFO', icon: User },
              { id: 'documents', label: 'DOCUMENTS', icon: FileText },
              { id: 'address', label: 'ADDRESS DETAILS', icon: MapPin },
              { id: 'family', label: 'FAMILY TREE', icon: Users },
              { id: 'leave', label: 'LEAVE TRACKER', icon: Calendar },
              { id: 'bank', label: 'BANK ACCOUNTS', icon: CreditCard },
              { id: 'service', label: 'SERVICE RECORD', icon: History },
              { id: 'medical', label: 'MEDICAL BOARD', icon: HeartPulse },
              { id: 'awards', label: 'AWARDS & MEDALS', icon: Award }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold tracking-wider transition-all border-t border-x rounded-t cursor-pointer ${
                    activeSubTab === tab.id
                      ? 'bg-army-dark border-army-green/60 text-tactical-gold border-b-2 border-b-tactical-gold'
                      : 'border-transparent text-olive-drab hover:text-tactical-khaki hover:bg-army-green/10'
                  }`}
                >
                  <TabIcon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display Container */}
          <div className="glass-panel p-5 rounded-lg border border-army-green/45 print-content">
            
            {/* TAB 1: PERSONAL DETAILS */}
            {activeSubTab === 'personal' && (
              <div className="space-y-4">
                <div className="text-xs text-tactical-gold font-bold uppercase tracking-widest border-b border-army-green/20 pb-1.5">
                  OFFICIAL PERSONAL DOSSIER
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "FULL NAME", value: personnel.personalInfo.fullName },
                    { title: "FATHER'S NAME", value: personnel.personalInfo.fatherName },
                    { title: "MOTHER'S NAME", value: personnel.personalInfo.motherName },
                    { title: "DATE OF BIRTH", value: personnel.personalInfo.dob },
                    { title: "GENDER", value: personnel.personalInfo.gender },
                    { title: "RELIGION", value: personnel.personalInfo.religion },
                    { title: "MARITAL STATUS", value: personnel.personalInfo.maritalStatus },
                    { title: "NATIONALITY", value: personnel.personalInfo.nationality },
                    { title: "EDUCATION QUALIFICATION", value: personnel.personalInfo.education }
                  ].map((field, i) => (
                    <div key={i} className="p-3 bg-military-black/80 border border-army-green/30 rounded">
                      <span className="text-[9px] text-olive-drab block uppercase font-sans">{field.title}</span>
                      <span className="text-xs font-semibold text-white">{field.value}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-amber-950/20 border border-tactical-gold/30 rounded-lg">
                  <div className="text-xs font-bold text-tactical-gold uppercase mb-2">EMERGENCY NOTIFICATION NODE</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[9px] text-olive-drab block uppercase font-sans">CONTACT PERSON</span>
                      <span className="font-semibold text-white">{personnel.personalInfo.emergencyContact.name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-olive-drab block uppercase font-sans">RELATIONSHIP</span>
                      <span className="font-semibold text-white">{personnel.personalInfo.emergencyContact.relation}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-olive-drab block uppercase font-sans">HOTLINE TELEPHONE</span>
                      <span className="font-semibold text-white">{personnel.personalInfo.emergencyContact.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DOCUMENTS VAULT */}
            {activeSubTab === 'documents' && (
              <div className="space-y-6">
                <div className="text-xs text-tactical-gold font-bold uppercase tracking-widest border-b border-army-green/20 pb-1.5 flex justify-between items-center">
                  <span>SECURE GOVERNMENT RECORD VAULT</span>
                  <span className="text-[10px] text-red-400">ENCRYPTED STORAGE</span>
                </div>

                {/* Previews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aadhaar Card Preview */}
                  <div className="p-4 bg-military-black/80 border border-army-green/45 rounded-lg flex flex-col justify-between h-48">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-white uppercase">AADHAAR IDENTIFICATION</span>
                        <button onClick={triggerRevealAadhaar} className="text-olive-drab hover:text-tactical-gold cursor-pointer">
                          {revealAadhaar ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {personnel.documents.aadhaar.frontPreview && personnel.documents.aadhaar.frontPreview.startsWith('data:image') ? (
                        <div className="w-full h-24 overflow-hidden rounded border border-army-green/30 bg-military-black/60 flex items-center justify-center">
                          <img 
                            src={personnel.documents.aadhaar.frontPreview} 
                            alt="Aadhaar Front" 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      ) : (
                        <div className="bg-army-dark/50 p-3 rounded border border-army-green/20 font-sans text-xs text-slate-300">
                          <div className="text-[9px] font-bold text-tactical-gold">GOVERNMENT OF INDIA</div>
                          <div className="mt-1 font-semibold text-white">{personnel.personalInfo.fullName}</div>
                          <div className="text-[11px] font-bold tracking-widest mt-2">
                            {revealAadhaar ? personnel.documents.aadhaar.number.replace('XXXX-XXXX', '5819-2041') : personnel.documents.aadhaar.number}
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => triggerDocumentDownload("Aadhaar Card", personnel.documents.aadhaar.frontPreview)}
                      className="w-full mt-3 py-1 bg-army-green text-[10px] border border-army-green text-tactical-khaki font-bold rounded hover:border-tactical-gold hover:text-tactical-gold transition-colors cursor-pointer"
                    >
                      DOWNLOAD FILE
                    </button>
                  </div>

                  {/* PAN Card Preview */}
                  <div className="p-4 bg-military-black/80 border border-army-green/45 rounded-lg flex flex-col justify-between h-48">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-white uppercase">INCOME TAX DEPT (PAN CARD)</span>
                        <button onClick={triggerRevealPan} className="text-olive-drab hover:text-tactical-gold cursor-pointer">
                          {revealPan ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {personnel.documents.pan.preview && personnel.documents.pan.preview.startsWith('data:image') ? (
                        <div className="w-full h-24 overflow-hidden rounded border border-army-green/30 bg-military-black/60 flex items-center justify-center">
                          <img 
                            src={personnel.documents.pan.preview} 
                            alt="PAN Card" 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      ) : (
                        <div className="bg-army-dark/50 p-3 rounded border border-army-green/20 font-sans text-xs text-slate-300">
                          <div className="text-[9px] font-bold text-tactical-gold">INCOME TAX DEPARTMENT INDIA</div>
                          <div className="mt-1 font-semibold text-white">{personnel.personalInfo.fullName.toUpperCase()}</div>
                          <div className="text-[11px] font-bold tracking-wider mt-2">
                            {revealPan ? personnel.documents.pan.number : "XXXXX1234X"}
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => triggerDocumentDownload("PAN Card", personnel.documents.pan.preview)}
                      className="w-full mt-3 py-1 bg-army-green text-[10px] border border-army-green text-tactical-khaki font-bold rounded hover:border-tactical-gold hover:text-tactical-gold transition-colors cursor-pointer"
                    >
                      DOWNLOAD FILE
                    </button>
                  </div>

                  {/* Passport Card Preview */}
                  <div className="p-4 bg-military-black/80 border border-army-green/45 rounded-lg flex flex-col justify-between h-48">
                    <div>
                      <span className="text-[10px] font-bold text-white uppercase block mb-2">PASSPORT DETECT RECORD</span>
                      {personnel.documents.passport.preview && personnel.documents.passport.preview.startsWith('data:image') ? (
                        <div className="w-full h-24 overflow-hidden rounded border border-army-green/30 bg-military-black/60 flex items-center justify-center">
                          <img 
                            src={personnel.documents.passport.preview} 
                            alt="Passport" 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      ) : (
                        <div className="bg-navy-900/30 bg-army-dark/50 p-3 rounded border border-army-green/20 font-sans text-xs text-slate-300">
                          <div className="text-[9px] font-bold text-tactical-gold">REPUBLIC OF INDIA PASSPORT</div>
                          <div className="mt-1 font-semibold text-white">No: {personnel.documents.passport.number}</div>
                          <div className="text-[10px] text-slate-400 mt-1">NATIONALITY: {personnel.personalInfo.nationality.toUpperCase()}</div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => triggerDocumentDownload("Passport Scan", personnel.documents.passport.preview)}
                      className="w-full mt-3 py-1 bg-army-green text-[10px] border border-army-green text-tactical-khaki font-bold rounded hover:border-tactical-gold hover:text-tactical-gold transition-colors cursor-pointer"
                    >
                      DOWNLOAD FILE
                    </button>
                  </div>

                  {/* Driving License Preview */}
                  <div className="p-4 bg-military-black/80 border border-army-green/45 rounded-lg flex flex-col justify-between h-48">
                    <div>
                      <span className="text-[10px] font-bold text-white uppercase block mb-2">DRIVING LICENCE DATA</span>
                      <div className="bg-army-dark/50 p-3 rounded border border-army-green/20 font-sans text-xs text-slate-300">
                        <div className="text-[9px] font-bold text-tactical-gold">UNION OF INDIA DRIVING LICENCE</div>
                        <div className="mt-1 font-semibold text-white">No: {personnel.documents.drivingLicense.number}</div>
                        <div className="text-[10px] text-slate-400 mt-1">HOLDER: {personnel.personalInfo.fullName}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => triggerDocumentDownload("Driving Licence", personnel.documents.drivingLicense.preview)}
                      className="w-full mt-3 py-1 bg-army-green text-[10px] border border-army-green text-tactical-khaki font-bold rounded hover:border-tactical-gold hover:text-tactical-gold transition-colors cursor-pointer"
                    >
                      DOWNLOAD FILE
                    </button>
                  </div>

                  {/* Bank Passbook Preview */}
                  <div className="p-4 bg-military-black/80 border border-army-green/45 rounded-lg flex flex-col justify-between h-48">
                    <div>
                      <span className="text-[10px] font-bold text-white uppercase block mb-2">BANK PASSBOOK</span>
                      {personnel.documents.bankPassbook && personnel.documents.bankPassbook.preview && personnel.documents.bankPassbook.preview.startsWith('data:image') ? (
                        <div className="w-full h-24 overflow-hidden rounded border border-army-green/30 bg-military-black/60 flex items-center justify-center">
                          <img 
                            src={personnel.documents.bankPassbook.preview} 
                            alt="Bank Passbook" 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      ) : (
                        <div className="bg-army-dark/50 p-3 rounded border border-army-green/20 font-sans text-xs text-slate-300">
                          <div className="text-[9px] font-bold text-tactical-gold">BANK ACCOUNT PASSBOOK</div>
                          <div className="mt-1 font-semibold text-white">BANK: {personnel.bankInfo.bankName}</div>
                          <div className="text-[10px] text-slate-400 mt-1">HOLDER: {personnel.bankInfo.accountHolderName}</div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => triggerDocumentDownload("Bank Passbook", personnel.documents.bankPassbook ? personnel.documents.bankPassbook.preview : '')}
                      className="w-full mt-3 py-1 bg-army-green text-[10px] border border-army-green text-tactical-khaki font-bold rounded hover:border-tactical-gold hover:text-tactical-gold transition-colors cursor-pointer"
                    >
                      DOWNLOAD FILE
                    </button>
                  </div>
                </div>

                {/* PDF Viewer Container */}
                <div className="border border-tactical-gold/30 rounded-lg overflow-hidden bg-military-black/90">
                  <div className="bg-army-dark border-b border-army-green/40 px-4 py-2.5 flex items-center justify-between font-mono text-xs">
                    <span className="text-tactical-gold font-bold">SERVICE_DOSSIER_CONFIDENTIAL.PDF</span>
                    
                    {/* PDF Controls */}
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPdfZoom(z => Math.max(0.6, z - 0.2))} className="text-olive-drab hover:text-white cursor-pointer" title="Zoom Out">
                        <ZoomOut size={14} />
                      </button>
                      <span className="text-[10px] text-tactical-khaki bg-military-black px-1.5 py-0.5 rounded font-bold">{Math.round(pdfZoom * 100)}%</span>
                      <button onClick={() => setPdfZoom(z => Math.min(1.8, z + 0.2))} className="text-olive-drab hover:text-white cursor-pointer" title="Zoom In">
                        <ZoomIn size={14} />
                      </button>
                      <button onClick={() => setPdfRotation(r => (r + 90) % 360)} className="text-olive-drab hover:text-white cursor-pointer" title="Rotate">
                        <RotateCw size={14} />
                      </button>
                      <button onClick={() => triggerDocumentDownload("Service Record PDF")} className="text-olive-drab hover:text-white cursor-pointer" title="Download">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Simulated PDF Page */}
                  <div className="p-8 flex items-center justify-center overflow-auto bg-slate-950/40 min-h-80">
                    <div 
                      style={{ 
                        transform: `scale(${pdfZoom}) rotate(${pdfRotation}deg)`, 
                        transition: 'transform 0.2s ease-out',
                        transformOrigin: 'center center'
                      }}
                      className="w-full max-w-md bg-white border border-gray-400 p-6 shadow-2xl text-black font-sans relative"
                    >
                      {/* Confidential Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                        <div className="text-4xl font-extrabold text-red-600 border-4 border-red-600 px-6 py-2 rounded-lg -rotate-45 uppercase tracking-widest">CONFIDENTIAL</div>
                      </div>

                      {/* PDF Content */}
                      <div className="border border-double border-gray-800 p-4 min-h-64 flex flex-col justify-between text-[11px] leading-relaxed">
                        <div className="text-center pb-2 border-b border-gray-600 mb-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider">INDIAN ARMY SERVICE DOCUMENT</h4>
                          <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">MINISTRY OF DEFENCE // SECRET RECORD</p>
                        </div>
                        
                        <div className="space-y-2 text-gray-700">
                          <div><strong className="text-black">SOLDIER ID:</strong> {personnel.personalInfo.armyNumber}</div>
                          <div><strong className="text-black">OFFICIAL RANK:</strong> {personnel.personalInfo.rank}</div>
                          <div><strong className="text-black">REGIMENT LINK:</strong> {personnel.personalInfo.regiment}</div>
                          <div><strong className="text-black">ENLISTMENT DATE:</strong> {personnel.personalInfo.dateOfJoining}</div>
                          <div className="text-justify text-[9.5px] mt-2 italic text-gray-600">
                            This dossier certifies that the aforementioned officer has completed the required physical, military training and commissioned operations under the Army Act. All achievements are logged with administrative verification.
                          </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-gray-400 pt-3 mt-4 text-[8px] text-gray-500 font-mono">
                          <div>BARCODE: *{personnel.personalInfo.armyNumber}*</div>
                          <div className="text-right">
                            <span className="block border-b border-gray-400 w-16 mb-0.5 ml-auto"></span>
                            <span>HQ ADJUTANT GENERAL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: ADDRESS & MAP */}
            {activeSubTab === 'address' && (
              <div className="space-y-5">
                <div className="text-xs text-tactical-gold font-bold uppercase tracking-widest border-b border-army-green/20 pb-1.5">
                  RESIDENCE AND DEPLOYMENT COORDINATES
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Permanent Address */}
                  <div className="p-4 bg-military-black/80 border border-army-green/30 rounded-lg">
                    <span className="text-[10px] text-tactical-gold font-bold uppercase block mb-2">PERMANENT RESIDENCE</span>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div>House: <strong className="text-white">{personnel.address.permanent.houseNumber}</strong></div>
                      <div>Village/Sector: <strong className="text-white">{personnel.address.permanent.village}</strong></div>
                      <div>Post Office: <strong className="text-white">{personnel.address.permanent.postOffice}</strong></div>
                      <div>District: <strong className="text-white">{personnel.address.permanent.district}</strong></div>
                      <div>State/PIN: <strong className="text-white">{personnel.address.permanent.state} - {personnel.address.permanent.pinCode}</strong></div>
                    </div>
                  </div>

                  {/* Posting Address */}
                  <div className="p-4 bg-military-black/80 border border-army-green/30 rounded-lg">
                    <span className="text-[10px] text-tactical-gold font-bold uppercase block mb-2">CURRENT POSTING / DEPOT</span>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div>Unit Location: <strong className="text-white">{personnel.address.currentPosting.unitLocation}</strong></div>
                      <div>Active Station: <strong className="text-white">{personnel.address.currentPosting.station}</strong></div>
                      <div>State/PIN: <strong className="text-white">{personnel.address.currentPosting.state} - {personnel.address.currentPosting.pin}</strong></div>
                      <div className="text-[10px] text-olive-drab italic mt-1">Operational Area Protection Level: SECURE</div>
                    </div>
                  </div>
                </div>

                {/* Leaflet Map integration */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-olive-drab uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin size={12} className="text-tactical-gold" />
                    <span>SATELLITE SECTOR MAP VIEW</span>
                  </div>
                  <LeafletMap 
                    lat={personnel.address.currentPosting.lat} 
                    lng={personnel.address.currentPosting.lng} 
                    station={personnel.address.currentPosting.station} 
                    unit={personnel.address.currentPosting.unitLocation} 
                  />
                </div>
              </div>
            )}

            {/* TAB 4: FAMILY RELATION TREE */}
            {activeSubTab === 'family' && (
              <div className="space-y-4">
                <div className="text-xs text-tactical-gold font-bold uppercase tracking-widest border-b border-army-green/20 pb-1.5">
                  EXPANDABLE FAMILY TREE MATRIX
                </div>
                <FamilyTree family={personnel.family} />
              </div>
            )}

            {/* TAB 5: LEAVE TRACKER */}
            {activeSubTab === 'leave' && (
              <div className="space-y-6">
                <div className="text-xs text-tactical-gold font-bold uppercase tracking-widest border-b border-army-green/20 pb-1.5">
                  FORCE LEAVE BALANCE AND ANALYTICS
                </div>

                {/* Dials Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "ANNUAL LEAVE", value: personnel.leave.balance.annual, color: "text-green-500 border-green-500/30" },
                    { title: "CASUAL LEAVE", value: personnel.leave.balance.casual, color: "text-tactical-gold border-tactical-gold/30" },
                    { title: "MEDICAL LEAVE", value: personnel.leave.balance.medical, color: "text-blue-500 border-blue-500/30" },
                    { title: "SPECIAL LEAVE", value: personnel.leave.balance.special, color: "text-purple-500 border-purple-500/30" }
                  ].map((dial, i) => (
                    <div key={i} className={`p-4 bg-military-black/80 border rounded-lg text-center flex flex-col justify-between ${dial.color}`}>
                      <span className="text-[9px] text-olive-drab block uppercase font-sans font-semibold mb-1">{dial.title}</span>
                      <div className="text-3xl font-extrabold text-white leading-none font-mono my-2">{dial.value.remaining}</div>
                      <span className="text-[9px] text-olive-drab block">REMAINING OF {dial.value.total} DAYS</span>
                    </div>
                  ))}
                </div>

                {/* Analytics graphs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Yearly Leaves Bar Chart */}
                  <div className="bg-military-black/70 border border-army-green/35 p-4 rounded-lg">
                    <span className="text-[10px] font-bold text-white uppercase block mb-3">YEARLY LEAVE UTILIZATION</span>
                    <div className="h-44 text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={personnel.leave.analytics.yearlyLeaveTaken} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <XAxis dataKey="year" stroke="#486e48" />
                          <YAxis stroke="#486e48" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f180f', borderColor: '#d4af37' }} />
                          <Bar dataKey="days" fill="#d4af37" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Monthly Trend Line Chart */}
                  <div className="bg-military-black/70 border border-army-green/35 p-4 rounded-lg">
                    <span className="text-[10px] font-bold text-white uppercase block mb-3">MONTHLY TREND DISTRIBUTION</span>
                    <div className="h-44 text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={personnel.leave.analytics.monthlyTrend} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <XAxis dataKey="month" stroke="#486e48" />
                          <YAxis stroke="#486e48" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f180f', borderColor: '#d4af37' }} />
                          <Bar dataKey="days" fill="#486e48" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* History Table */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-olive-drab uppercase block">DETAILED LEAVE REGISTRATION LOG</span>
                  <div className="overflow-x-auto border border-army-green/30 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-army-dark border-b border-army-green/30 text-olive-drab uppercase font-bold text-[10px]">
                          <th className="p-2.5">LEAVE TYPE</th>
                          <th className="p-2.5">START DATE</th>
                          <th className="p-2.5">END DATE</th>
                          <th className="p-2.5">DAYS</th>
                          <th className="p-2.5">APPROVAL STATUS</th>
                          <th className="p-2.5">APPROVED BY</th>
                          <th className="p-2.5">REMARKS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-army-green/10 text-slate-300">
                        {personnel.leave.history.map((log, index) => (
                          <tr key={index} className="hover:bg-army-green/5">
                            <td className="p-2.5 font-semibold text-white">{log.leaveType}</td>
                            <td className="p-2.5">{log.startDate}</td>
                            <td className="p-2.5">{log.endDate}</td>
                            <td className="p-2.5 font-bold text-white">{log.days}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded border border-green-500/40 text-green-400 bg-green-950/20 text-[9px] font-bold uppercase">
                                {log.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-[11px] text-slate-400">{log.approvedBy}</td>
                            <td className="p-2.5 italic text-slate-400 font-sans">{log.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 6: BANK ACCOUNT INFO */}
            {activeSubTab === 'bank' && (
              <div className="space-y-4">
                <div className="text-xs text-tactical-gold font-bold uppercase tracking-widest border-b border-army-green/20 pb-1.5 flex items-center justify-between">
                  <span>FINANCIAL SALARY DISBURSAL REGISTRY</span>
                  <span className="text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle size={10} />
                    <span>ENCRYPTED DATABASE FIELD</span>
                  </span>
                </div>

                <div className="max-w-xl mx-auto p-5 bg-military-black/95 border border-tactical-gold/30 rounded-lg space-y-4 relative shadow-lg">
                  <div className="flex justify-between items-start border-b border-army-green/20 pb-2 mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{personnel.bankInfo.bankName}</h4>
                      <p className="text-[9px] text-olive-drab">MILITARY LE Link Disbursed Account</p>
                    </div>
                    
                    {/* Secure decrypt button */}
                    <button 
                      onClick={triggerRevealBank}
                      className={`flex items-center gap-1.5 px-3 py-1 text-[10px] border font-bold uppercase rounded cursor-pointer transition-colors ${
                        revealBank 
                          ? 'border-red-500/40 bg-red-950/20 text-red-400' 
                          : 'border-tactical-gold/40 bg-tactical-gold/15 text-tactical-gold hover:bg-tactical-gold/30'
                      }`}
                    >
                      {revealBank ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span>{revealBank ? "MASK SECURE DATA" : "REVEAL SECURE DATA"}</span>
                    </button>
                  </div>

                  {/* Bank Credentials */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[9px] text-olive-drab block uppercase font-sans">ACCOUNT HOLDER</span>
                      <span className="font-semibold text-white uppercase">{personnel.bankInfo.accountHolderName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-olive-drab block uppercase font-sans">ACCOUNT NUMBER</span>
                      <span className="font-bold text-white tracking-widest font-mono">
                        {revealBank ? "392019029103" : personnel.bankInfo.accountNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-olive-drab block uppercase font-sans">IFSC CODE</span>
                      <span className="font-bold text-white font-mono">{personnel.bankInfo.ifscCode}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-olive-drab block uppercase font-sans">BRANCH OFFICE</span>
                      <span className="font-semibold text-slate-300 font-sans">{personnel.bankInfo.branchName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-olive-drab block uppercase font-sans">UPI ID CODE</span>
                      <span className="text-slate-300 font-mono">{personnel.bankInfo.upiId}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-olive-drab block uppercase font-sans">SALARY CREDENTIAL LINK STATUS</span>
                      <span className="px-2 py-0.5 rounded border border-green-500/30 text-green-400 text-[9px] font-bold uppercase bg-green-950/10 inline-block mt-0.5">
                        {personnel.bankInfo.salaryAccountStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: SERVICE RECORD POSTINGS TIMELINE */}
            {activeSubTab === 'service' && (
              <div className="space-y-6">
                <div className="text-xs text-tactical-gold font-bold uppercase tracking-widest border-b border-army-green/20 pb-1.5">
                  MILITARY SERVICE HISTORY AND PROMOTIONS TIMELINE
                </div>

                {/* posting history timeline */}
                <div className="relative border-l border-tactical-gold/30 ml-4 pl-6 space-y-6">
                  {personnel.serviceRecord.postingHistory.map((post, i) => (
                    <div key={i} className="relative group">
                      
                      {/* Timeline dot */}
                      <span className="absolute left-[-31px] top-1.5 w-3.5 h-3.5 rounded-full border border-tactical-gold bg-military-black flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-tactical-gold group-hover:scale-125 transition-transform"></span>
                      </span>

                      <div>
                        <span className="text-[10px] text-tactical-gold font-bold font-mono bg-army-dark border border-army-green px-2 py-0.5 rounded shadow">
                          {post.period}
                        </span>
                        <div className="mt-2 text-sm font-bold text-white">{post.role}</div>
                        <div className="text-xs text-slate-300">{post.unit} — <span className="text-olive-drab font-semibold">{post.station}</span></div>
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-military-black/50 border border-army-green/30 text-olive-drab text-[9px] font-bold uppercase rounded font-mono">
                          {post.type} CATEGORY
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sub sections: Promotions, Training, Deployments */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-army-green/20 pt-5">
                  {/* Promotions */}
                  <div className="p-3 bg-military-black/60 border border-army-green/25 rounded-lg space-y-2">
                    <span className="text-[9px] font-bold text-tactical-gold uppercase block">OFFICIAL PROMOTIONS</span>
                    <div className="space-y-2 divide-y divide-army-green/10">
                      {personnel.serviceRecord.promotions.map((prom, index) => (
                        <div key={index} className="pt-1.5 text-xs text-slate-300">
                          <div className="font-bold text-white">{prom.rank}</div>
                          <div className="text-[10px] text-olive-drab font-mono">{prom.date} // {prom.authority}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Training */}
                  <div className="p-3 bg-military-black/60 border border-army-green/25 rounded-lg space-y-2">
                    <span className="text-[9px] font-bold text-tactical-gold uppercase block">SPECIALIZED COURSES</span>
                    <div className="space-y-2 divide-y divide-army-green/10">
                      {personnel.serviceRecord.training.map((trn, index) => (
                        <div key={index} className="pt-1.5 text-xs text-slate-300">
                          <div className="font-bold text-white">{trn.name}</div>
                          <div className="text-[10px] text-olive-drab font-mono">{trn.location} — <strong className="text-green-500">{trn.status}</strong></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deployments */}
                  <div className="p-3 bg-military-black/60 border border-army-green/25 rounded-lg space-y-2">
                    <span className="text-[9px] font-bold text-tactical-gold uppercase block">TACTICAL COMBAT DEPLOYMENTS</span>
                    <div className="space-y-2 divide-y divide-army-green/10">
                      {personnel.serviceRecord.deployments.map((dep, index) => (
                        <div key={index} className="pt-1.5 text-xs text-slate-300">
                          <div className="font-bold text-white">{dep.operation} ({dep.year})</div>
                          <div className="text-[10px] text-olive-drab font-mono">{dep.sector} // {dep.role}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: MEDICAL DASHBOARD */}
            {activeSubTab === 'medical' && (
              <div className="space-y-6">
                <div className="text-xs text-tactical-gold font-bold uppercase tracking-widest border-b border-army-green/20 pb-1.5 flex justify-between items-center">
                  <span>MILITARY PHYSICAL HEALTH & MEDICAL BOARD RATING</span>
                  <span className="text-[10px] text-green-500 font-bold bg-green-950/20 px-2 py-0.5 rounded border border-green-500/30">SHAPE CATEGORY SHAPE-1</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Medical Stats */}
                  <div className="p-4 bg-military-black/80 border border-army-green/30 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-olive-drab block uppercase font-sans">PHYSICAL PROFILE STATUS</span>
                      <h4 className="text-sm font-bold text-white mt-1 uppercase">{personnel.medicalInfo.fitnessStatus}</h4>
                      <p className="text-[10px] text-olive-drab font-mono mt-1">Last Examined: {personnel.medicalInfo.lastMedicalCheckup}</p>
                    </div>
                    <div className="pt-3 border-t border-army-green/20 mt-4 text-[11px] text-slate-300 leading-relaxed">
                      <strong>Medical notes:</strong> {personnel.medicalInfo.medicalNotes}
                    </div>
                  </div>

                  {/* Vitals HUD */}
                  <div className="p-4 bg-military-black/80 border border-army-green/30 rounded-lg space-y-2">
                    <span className="text-[9px] text-tactical-gold font-bold uppercase block">BIOMETRIC VITALS ASSIGNED</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] text-olive-drab block uppercase font-sans">PULSE RATE</span>
                        <span className="font-bold text-white">{personnel.medicalInfo.vitals.pulse}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-olive-drab block uppercase font-sans">BLOOD PRESSURE</span>
                        <span className="font-bold text-white">{personnel.medicalInfo.vitals.bp}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-olive-drab block uppercase font-sans">HEIGHT</span>
                        <span className="font-bold text-white">{personnel.medicalInfo.vitals.height}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-olive-drab block uppercase font-sans">WEIGHT</span>
                        <span className="font-bold text-white">{personnel.medicalInfo.vitals.weight}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[9px] text-olive-drab block uppercase font-sans">BODY MASS INDEX (BMI)</span>
                        <span className="font-bold text-white">{personnel.medicalInfo.vitals.bmi} (Normal range)</span>
                      </div>
                    </div>
                  </div>

                  {/* Vaccination ledger */}
                  <div className="p-4 bg-military-black/80 border border-army-green/30 rounded-lg space-y-2">
                    <span className="text-[9px] text-tactical-gold font-bold uppercase block">VACCINATION LEDGER RECORD</span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[10px] divide-y divide-army-green/10">
                      {personnel.medicalInfo.vaccinations.map((vac, i) => (
                        <div key={i} className="pt-1.5 flex items-center justify-between text-slate-300">
                          <div>
                            <span className="font-semibold text-white">{vac.name}</span>
                            <span className="text-[8px] text-olive-drab block">DATE: {vac.date}</span>
                          </div>
                          <span className="text-[8px] font-bold text-green-500 uppercase border border-green-500/30 px-1 py-0.5 rounded bg-green-950/20">
                            {vac.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: AWARDS AND ACHIEVEMENTS */}
            {activeSubTab === 'awards' && (
              <div className="space-y-6">
                <div className="text-xs text-tactical-gold font-bold uppercase tracking-widest border-b border-army-green/20 pb-1.5">
                  DECORATIONS, GALLANTRY MEDALS, AND DISTINCTIONS
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personnel.awards.map((award, i) => {
                    let ribbonColorCss = "from-amber-600 via-amber-800 to-amber-600";
                    if (award.ribbonColor === "purple") {
                      ribbonColorCss = "from-indigo-700 via-indigo-900 to-indigo-700";
                    } else if (award.ribbonColor === "silver-blue") {
                      ribbonColorCss = "from-slate-400 via-sky-800 to-slate-400";
                    } else if (award.ribbonColor === "gold-blue") {
                      ribbonColorCss = "from-amber-500 via-sky-900 to-amber-500";
                    }

                    return (
                      <div key={i} className="p-4 bg-military-black/80 border border-tactical-gold/20 hover:border-tactical-gold/45 rounded-lg flex items-start gap-4 transition-all duration-300 group shadow-md">
                        {/* Ribbon Medal graphic representation */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-14 h-6 bg-gradient-to-r ${ribbonColorCss} border border-black shadow-inner relative rounded-sm`}>
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.25)_0%,transparent_50%,rgba(0,0,0,0.25)_100%)]"></div>
                          </div>
                          <div className="w-1.5 h-4 bg-tactical-gold/60 border-x border-black"></div>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border border-yellow-300 flex items-center justify-center font-extrabold text-white text-[10px] shadow-lg group-hover:scale-105 transition-transform duration-300">
                            {award.badgeCode}
                          </div>
                        </div>

                        {/* Medal details */}
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="text-xs font-bold text-white uppercase group-hover:text-tactical-gold transition-colors">{award.name}</h4>
                            <span className="text-[9px] text-olive-drab font-bold">{award.date.substring(0,4)}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal font-sans">{award.description}</p>
                          <div className="text-[8px] text-olive-drab font-mono uppercase">CONFERRED BY: PRESIDENT OF INDIA</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Landing display if no search is active */}
      {!personnel && !loading && (
        <div className="glass-panel p-10 rounded-lg text-center border border-army-green/45 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full border border-army-green/40 flex items-center justify-center text-olive-drab animate-pulse bg-army-dark/40 shadow-inner">
            <Search size={30} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase">PORTAL READ STATE</h3>
            <p className="text-xs text-olive-drab mt-1.5 max-w-sm mx-auto leading-relaxed">
              Enter a valid Army Number in the force registry database indexer at the top of the command screen to retrieve complete officer dossiers.
            </p>
          </div>
        </div>
      )}

      {/* TACTICAL PRINT CONFIGURATION MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-military-black/85 backdrop-blur-md p-4 no-print">
          <div className="glass-panel border-2 border-tactical-gold p-6 rounded-lg max-w-md w-full font-mono text-tactical-khaki space-y-4 shadow-[0_0_25px_rgba(212,175,55,0.25)]">
            <div className="flex items-center gap-2 border-b border-army-green/40 pb-2">
              <Printer size={18} className="text-tactical-gold animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {printActionType === 'print' ? 'Tactical Print Configuration' : 'Secure PDF Export Config'}
              </h3>
            </div>
            <p className="text-[10px] text-olive-drab uppercase tracking-wider leading-relaxed">
              Select dossier sections to include in the generated print document:
            </p>

            {/* Select All / Clear All buttons */}
            <div className="flex justify-between text-[9px] text-tactical-gold border-b border-army-green/20 pb-2 font-bold">
              <button 
                type="button" 
                onClick={() => setSelectedSections({
                  idCard: true,
                  personal: true,
                  documents: true,
                  address: true,
                  family: true,
                  leave: true,
                  bank: true,
                  service: true,
                  medical: true,
                  awards: true
                })}
                className="hover:text-white cursor-pointer"
              >
                [ SELECT ALL ]
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedSections({
                  idCard: false,
                  personal: false,
                  documents: false,
                  address: false,
                  family: false,
                  leave: false,
                  bank: false,
                  service: false,
                  medical: false,
                  awards: false
                })}
                className="hover:text-white cursor-pointer"
              >
                [ DESELECT ALL ]
              </button>
            </div>

            {/* Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs py-2">
              {[
                { key: 'idCard', label: '1. ID CARD VIEW' },
                { key: 'personal', label: '2. PERSONAL DOSSIER' },
                { key: 'documents', label: '3. DOCUMENTS VAULT' },
                { key: 'address', label: '4. ADDRESS & POSTING' },
                { key: 'family', label: '5. FAMILY DECLARATION' },
                { key: 'leave', label: '6. LEAVE HISTORY' },
                { key: 'bank', label: '7. BANK DETAILS' },
                { key: 'service', label: '8. TIMELINE RECORD' },
                { key: 'medical', label: '9. PHYSICAL RATING' },
                { key: 'awards', label: '10. GALLANTRY AWARDS' }
              ].map(sec => (
                <label key={sec.key} className="flex items-center gap-2.5 p-1.5 rounded hover:bg-army-green/15 cursor-pointer text-slate-300 hover:text-white transition-colors">
                  <input 
                    type="checkbox"
                    checked={selectedSections[sec.key]}
                    onChange={(e) => setSelectedSections(prev => ({ ...prev, [sec.key]: e.target.checked }))}
                    className="cursor-pointer accent-tactical-gold"
                  />
                  <span className="font-mono text-[10px] tracking-wide">{sec.label}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-army-green/35 pt-3 flex justify-end gap-2.5">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-3.5 py-1.5 border border-army-green text-[10px] font-bold text-tactical-khaki hover:text-white rounded cursor-pointer transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={executePrintExport}
                className="px-5 py-1.5 bg-tactical-gold hover:bg-amber-600 text-military-black text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-colors shadow-md hover:shadow-tactical-gold/25"
              >
                {printActionType === 'print' ? 'EXECUTE PRINT' : 'GENERATE PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY DOSSIER LAYOUT */}
      {personnel && (
        <div className="hidden print:block w-full text-black font-sans space-y-8 bg-white p-6">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-xl font-bold uppercase tracking-widest">INDIAN ARMY PERSONNEL PROFILE DOSSIER</h1>
            <p className="text-xs uppercase tracking-wider text-gray-500 mt-1 font-bold">CONFIDENTIAL // OFFICIAL RECORD DOCUMENT</p>
            <p className="text-[10px] text-gray-400 mt-0.5 font-mono">GENERATED ON: {new Date().toLocaleString()}</p>
          </div>

          {/* Section 1: ID Card */}
          {selectedSections.idCard && (
            <div className="pb-6 border-b border-gray-300 page-break-after-avoid flex flex-col items-center">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-4 w-full text-left">1. IDENTIFICATION CREDENTIAL CARD</h2>
              <IDCardView personnel={personnel} onPrint={() => {}} onExportPDF={() => {}} />
            </div>
          )}

          {/* Section 2: Personal Details */}
          {selectedSections.personal && (
            <div className="pb-6 border-b border-gray-300 page-break-after-avoid">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-3">2. OFFICIAL PERSONAL DETAILS</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
                {[
                  { title: "FULL NAME", value: personnel.personalInfo.fullName },
                  { title: "ARMY NUMBER", value: personnel.personalInfo.armyNumber },
                  { title: "RANK", value: personnel.personalInfo.rank },
                  { title: "REGIMENT / CORPS", value: personnel.personalInfo.regiment },
                  { title: "UNIT / STATION", value: personnel.personalInfo.unit },
                  { title: "BRANCH / WING", value: personnel.personalInfo.branch },
                  { title: "BLOOD GROUP", value: personnel.personalInfo.bloodGroup },
                  { title: "FATHER'S NAME", value: personnel.personalInfo.fatherName },
                  { title: "MOTHER'S NAME", value: personnel.personalInfo.motherName },
                  { title: "DATE OF BIRTH", value: personnel.personalInfo.dob },
                  { title: "GENDER", value: personnel.personalInfo.gender },
                  { title: "RELIGION", value: personnel.personalInfo.religion },
                  { title: "MARITAL STATUS", value: personnel.personalInfo.maritalStatus },
                  { title: "NATIONALITY", value: personnel.personalInfo.nationality },
                  { title: "EDUCATION QUALIFICATION", value: personnel.personalInfo.education }
                ].map((field, i) => (
                  <div key={i} className="border-b border-gray-100 py-1.5 flex justify-between">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">{field.title}</span>
                    <span className="font-semibold text-right">{field.value}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs">
                <div className="font-bold text-gray-700 uppercase mb-2 border-b border-gray-200 pb-0.5">EMERGENCY CONTACT REFERENCE</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase">NAME:</span>
                    <span className="font-semibold">{personnel.personalInfo.emergencyContact.name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase">RELATION:</span>
                    <span className="font-semibold">{personnel.personalInfo.emergencyContact.relation}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase">PHONE:</span>
                    <span className="font-semibold">{personnel.personalInfo.emergencyContact.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Documents Vault */}
          {selectedSections.documents && (
            <div className="pb-6 border-b border-gray-300 page-break-after-avoid">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-3">3. SECURE IDENTIFICATION RECORDS</h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="border border-gray-300 p-3 rounded">
                  <span className="text-[9px] text-gray-500 font-bold block uppercase">AADHAAR ID</span>
                  <span className="font-mono text-sm font-bold">{revealAadhaar ? personnel.documents.aadhaar.number.replace('XXXX-XXXX', '5819-2041') : personnel.documents.aadhaar.number}</span>
                </div>
                <div className="border border-gray-300 p-3 rounded">
                  <span className="text-[9px] text-gray-500 font-bold block uppercase">PAN CARD</span>
                  <span className="font-mono text-sm font-bold">{revealPan ? personnel.documents.pan.number : "XXXXX1234X"}</span>
                </div>
                <div className="border border-gray-300 p-3 rounded">
                  <span className="text-[9px] text-gray-500 font-bold block uppercase">PASSPORT RECORD</span>
                  <span className="font-mono text-sm font-bold">No: {personnel.documents.passport.number}</span>
                </div>
                <div className="border border-gray-300 p-3 rounded">
                  <span className="text-[9px] text-gray-500 font-bold block uppercase">DRIVING LICENCE</span>
                  <span className="font-mono text-sm font-bold">No: {personnel.documents.drivingLicense.number}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Address Details */}
          {selectedSections.address && (
            <div className="pb-6 border-b border-gray-300 page-break-after-avoid">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-3">4. ADDRESS & POSTING COORDINATES</h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="border border-gray-200 p-3 rounded">
                  <span className="font-bold text-gray-700 block mb-1 uppercase">PERMANENT RESIDENCE</span>
                  <div className="space-y-1">
                    <div>House: <strong>{personnel.address.permanent.houseNumber}</strong></div>
                    <div>Village: <strong>{personnel.address.permanent.village}</strong></div>
                    <div>District: <strong>{personnel.address.permanent.district}</strong></div>
                    <div>State/PIN: <strong>{personnel.address.permanent.state} - {personnel.address.permanent.pinCode}</strong></div>
                  </div>
                </div>
                <div className="border border-gray-200 p-3 rounded">
                  <span className="font-bold text-gray-700 block mb-1 uppercase">CURRENT POSTING ACTIVE STATION</span>
                  <div className="space-y-1">
                    <div>Unit Location: <strong>{personnel.address.currentPosting.unitLocation}</strong></div>
                    <div>Active Station: <strong>{personnel.address.currentPosting.station}</strong></div>
                    <div>State/PIN: <strong>{personnel.address.currentPosting.state} - {personnel.address.currentPosting.pin}</strong></div>
                    <div>Coordinates: <strong>{personnel.address.currentPosting.lat}° N, {personnel.address.currentPosting.lng}° E</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Family Tree */}
          {selectedSections.family && (
            <div className="pb-6 border-b border-gray-300 page-break-after-avoid">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-3">5. IMMEDIATE FAMILY MEMBERS DECLARATION</h2>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Father", ...personnel.family.father },
                  { label: "Mother", ...personnel.family.mother },
                  personnel.family.wife ? { label: "Spouse", ...personnel.family.wife } : null
                ].filter(Boolean).map((member, i) => (
                  <div key={i} className="border border-gray-200 p-3 rounded grid grid-cols-4 gap-2">
                    <div><span className="text-[9px] text-gray-500 block uppercase">RELATION:</span><strong>{member.label}</strong></div>
                    <div><span className="text-[9px] text-gray-500 block uppercase">FULL NAME:</span><strong>{member.name}</strong></div>
                    <div><span className="text-[9px] text-gray-500 block uppercase">AGE / BLOOD:</span><strong>{member.age} Yrs // {member.bloodGroup}</strong></div>
                    <div><span className="text-[9px] text-gray-500 block uppercase">OCCUPATION:</span><strong>{member.occupation}</strong></div>
                  </div>
                ))}
                {personnel.family.children && personnel.family.children.length > 0 && (
                  <div className="border border-gray-200 p-3 rounded space-y-2">
                    <span className="text-[9px] text-gray-500 font-bold block mb-1 uppercase">CHILDREN DECLARATION:</span>
                    {personnel.family.children.map((child, idx) => (
                      <div key={idx} className="grid grid-cols-4 gap-2 border-t border-gray-100 pt-1.5 text-slate-700">
                        <div>Relation: <strong>Child</strong></div>
                        <div>Name: <strong>{child.name}</strong></div>
                        <div>Age / Blood: <strong>{child.age} Yrs // {child.bloodGroup}</strong></div>
                        <div>Status: <strong>Declared</strong></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 6: Leave Tracker */}
          {selectedSections.leave && (
            <div className="pb-6 border-b border-gray-300 page-break-after-avoid">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-3">6. LEAVE ACCOUNT & VACATION HISTORY</h2>
              <div className="grid grid-cols-4 gap-3 text-center text-xs mb-4">
                {[
                  { label: "ANNUAL LEAVE", value: personnel.leave.balance.annual },
                  { label: "CASUAL LEAVE", value: personnel.leave.balance.casual },
                  { label: "MEDICAL LEAVE", value: personnel.leave.balance.medical },
                  { label: "SPECIAL LEAVE", value: personnel.leave.balance.special }
                ].map((bal, i) => (
                  <div key={i} className="border border-gray-200 p-2 rounded">
                    <span className="text-[9px] text-gray-500 block uppercase">{bal.label}</span>
                    <strong className="text-lg">{bal.value.remaining}</strong>
                    <span className="text-[8px] text-gray-400 block">of {bal.value.total} days</span>
                  </div>
                ))}
              </div>

              {personnel.leave.history && personnel.leave.history.length > 0 && (
                <div className="border border-gray-300 rounded overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300 text-[9px] font-bold text-gray-600 uppercase">
                        <th className="p-2">LEAVE TYPE</th>
                        <th className="p-2">START DATE</th>
                        <th className="p-2">END DATE</th>
                        <th className="p-2">DAYS</th>
                        <th className="p-2">STATUS</th>
                        <th className="p-2">APPROVED BY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {personnel.leave.history.map((log, index) => (
                        <tr key={index}>
                          <td className="p-2 font-bold">{log.leaveType}</td>
                          <td className="p-2">{log.startDate}</td>
                          <td className="p-2">{log.endDate}</td>
                          <td className="p-2 font-bold">{log.days}</td>
                          <td className="p-2 uppercase font-bold text-[9px]">{log.status}</td>
                          <td className="p-2 text-gray-500">{log.approvedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Section 7: Bank Account */}
          {selectedSections.bank && (
            <div className="pb-6 border-b border-gray-300 page-break-after-avoid">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-3">7. SALARY DISBURSAL BANK DETAILS</h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><span className="text-[9px] text-gray-500 block uppercase">BANK NAME:</span><strong>{personnel.bankInfo.bankName}</strong></div>
                <div><span className="text-[9px] text-gray-500 block uppercase">ACCOUNT NUMBER:</span><strong className="font-mono tracking-wider">{revealBank ? "392019029103" : personnel.bankInfo.accountNumber}</strong></div>
                <div><span className="text-[9px] text-gray-500 block uppercase">IFSC CODE:</span><strong className="font-mono">{personnel.bankInfo.ifscCode}</strong></div>
                <div><span className="text-[9px] text-gray-500 block uppercase">ACCOUNT HOLDER:</span><strong>{personnel.bankInfo.accountHolderName}</strong></div>
                <div><span className="text-[9px] text-gray-500 block uppercase">BRANCH STATION:</span><strong>{personnel.bankInfo.branchName}</strong></div>
                <div><span className="text-[9px] text-gray-500 block uppercase">UPI VPA ADDRESS:</span><strong>{personnel.bankInfo.upiId || 'Not Configured'}</strong></div>
              </div>
            </div>
          )}

          {/* Section 8: Service Record */}
          {selectedSections.service && (
            <div className="pb-6 border-b border-gray-300 page-break-after-avoid">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-3">8. TACTICAL RECORD AND TIMELINE</h2>
              <div className="space-y-3 text-xs">
                <div className="font-bold text-gray-700 uppercase">POSTING DETAILS:</div>
                {personnel.serviceRecord.postingHistory.map((post, i) => (
                  <div key={i} className="border-l-2 border-black pl-3 py-1">
                    <span className="font-bold">{post.period}</span> — <strong>{post.role}</strong>
                    <div className="text-gray-500 text-[11px]">{post.unit} ({post.station}) // Type: {post.type}</div>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  <div>
                    <span className="font-bold text-gray-700 block mb-1 uppercase">PROMOTIONS AUTHORITY:</span>
                    {personnel.serviceRecord.promotions.map((prom, index) => (
                      <div key={index} className="text-[11px] border-b border-gray-100 py-1">
                        <strong>{prom.rank}</strong> — <span className="text-gray-500">{prom.date} ({prom.authority})</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <span className="font-bold text-gray-700 block mb-1 uppercase">COMPLETED SPECIALIST COURSES:</span>
                    {personnel.serviceRecord.training.map((trn, index) => (
                      <div key={index} className="text-[11px] border-b border-gray-100 py-1">
                        <strong>{trn.name}</strong> — <span className="text-gray-500">{trn.location} ({trn.status})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 9: Medical Board */}
          {selectedSections.medical && (
            <div className="pb-6 border-b border-gray-300 page-break-after-avoid">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-3">9. MEDICAL BOARD CLASSIFICATION</h2>
              <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                <div><span className="text-[9px] text-gray-500 block uppercase">MEDICAL RATING:</span><strong>{personnel.medicalInfo.medicalCategory}</strong></div>
                <div><span className="text-[9px] text-gray-500 block uppercase">FITNESS STATUS:</span><strong>{personnel.medicalInfo.fitnessStatus}</strong></div>
                <div><span className="text-[9px] text-gray-500 block uppercase">LAST BOARD DATE:</span><strong>{personnel.medicalInfo.lastMedicalCheckup}</strong></div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs border border-gray-200 p-3 rounded mb-3">
                <div><span className="text-[9px] text-gray-400 block uppercase">PULSE:</span><strong>{personnel.medicalInfo.vitals.pulse}</strong></div>
                <div><span className="text-[9px] text-gray-400 block uppercase">BP:</span><strong>{personnel.medicalInfo.vitals.bp}</strong></div>
                <div><span className="text-[9px] text-gray-400 block uppercase">HEIGHT / WEIGHT:</span><strong>{personnel.medicalInfo.vitals.height} / {personnel.medicalInfo.vitals.weight}</strong></div>
                <div><span className="text-[9px] text-gray-400 block uppercase">BMI:</span><strong>{personnel.medicalInfo.vitals.bmi}</strong></div>
              </div>
              <div className="text-xs">
                <strong>Board Assessment Notes:</strong> <span className="text-gray-600 font-serif italic">{personnel.medicalInfo.medicalNotes}</span>
              </div>
            </div>
          )}

          {/* Section 10: Awards & Medals */}
          {selectedSections.awards && (
            <div className="pb-6 border-b border-gray-300 page-break-after-avoid">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-3">10. DECORATIONS AND GALLANTRY MEDALS</h2>
              <div className="space-y-3">
                {personnel.awards.map((award, i) => (
                  <div key={i} className="border border-gray-200 p-3 rounded flex gap-4 text-xs">
                    <div className="text-center font-bold font-mono border border-black p-1 w-10 h-10 flex items-center justify-center bg-gray-100 shrink-0">
                      {award.badgeCode}
                    </div>
                    <div>
                      <div className="font-bold uppercase">{award.name} ({award.date.substring(0,4)})</div>
                      <p className="text-gray-600 text-[11px] mt-0.5">{award.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Footer */}
          <div className="flex justify-between items-end text-[9px] text-gray-400 pt-6 font-mono border-t border-black mt-8">
            <div>
              REPORT CLASSIFICATION: CONFIDENTIAL RECORD // SECRET SECURE PORTAL
            </div>
            <div className="text-right">
              SYSTEM AUDIT CODE: {personnel.personalInfo.armyNumber}-{Math.floor(100000+Math.random()*900000)}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
