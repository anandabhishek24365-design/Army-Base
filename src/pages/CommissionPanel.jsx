import React, { useState, useRef } from 'react';
import { 
  UserPlus, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Loader,
  RefreshCw,
  Clipboard,
  Trash2,
  ListFilter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to construct full nested cadet structure from flat properties
const buildCadetObject = (parsedData) => {
  const fullName = parsedData.fullname || parsedData.name || 'GC Under Onboarding';
  const armyNumber = (parsedData.armynumber || parsedData.number || 'IA-CADET-' + Math.floor(1000 + Math.random()*9000)).toUpperCase();
  const rank = parsedData.rank || 'Cadet';
  const regiment = parsedData.regiment || 'Rajput Regiment';
  const branch = parsedData.branch || 'Infantry';
  const blood = parsedData.bloodgroup || parsedData.blood || 'A+';
  const phone = parsedData.contact || parsedData.phone || '+91 99999 00000';
  const email = parsedData.email || 'cadet@indianarmy.nic.in';
  const dob = parsedData.dob || '2004-01-01';
  const fatherName = parsedData.father || parsedData.fathername || 'Shri Parent Name';
  const motherName = parsedData.mother || parsedData.mothername || 'Smt. Parent Name';
  const village = parsedData.village || 'Ranikhet';
  const district = parsedData.district || 'Almora';
  const state = parsedData.state || 'Uttarakhand';
  const pin = parsedData.pincode || parsedData.pin || '263645';
  
  const bank = parsedData.bank || 'State Bank of India';
  const account = parsedData.account || 'XXXX-XXXX-0000';
  const ifsc = parsedData.ifsc || 'SBIN0000692';
  const upi = parsedData.upi || '';

  return {
    personalInfo: {
      fullName,
      rank,
      armyNumber,
      unit: 'Indian Military Academy (IMA)',
      regiment,
      branch,
      dateOfJoining: new Date().toISOString().slice(0, 10),
      serviceYears: 'Under Training',
      bloodGroup: blood,
      contactNumber: phone,
      email,
      status: 'Active',
      profilePicture: '',
      fatherName,
      motherName,
      dob,
      gender: 'Male',
      religion: 'Hinduism',
      maritalStatus: 'Single',
      nationality: 'Indian',
      education: 'IMA Cadet Training Program',
      emergencyContact: {
        name: fatherName,
        relation: 'Father',
        phone
      }
    },
    address: {
      permanent: {
        houseNumber: 'H.No 12/B',
        village,
        postOffice: village,
        district,
        state,
        pinCode: pin
      },
      currentPosting: {
        unitLocation: 'IMA Training Ground',
        station: 'Dehradun',
        state: 'Uttarakhand',
        pin: '248007',
        lat: 30.3302,
        lng: 77.9691
      }
    },
    documents: {
      aadhaar: { number: 'XXXX-XXXX-0000', frontPreview: '', backPreview: '' },
      pan: { number: 'XXXXX0000X', preview: '' },
      armyId: { number: 'IA-CADET-TEMP', frontPreview: 'ARMY_ID_FRONT_SIM', backPreview: 'ARMY_ID_BACK_SIM' },
      passport: { number: 'T0000000', preview: '' },
      drivingLicense: { number: 'DL-TEMP-0000', preview: 'DL_SIM' },
      bankPassbook: { preview: '' },
      serviceDocUrl: 'SERVICE_RECORD_PDF_SIM'
    },
    family: parsedData.family ? {
      father: { ...parsedData.family.father },
      mother: { ...parsedData.family.mother },
      wife: parsedData.family.wife ? { ...parsedData.family.wife } : null,
      children: [...(parsedData.family.children || [])]
    } : {
      father: { name: fatherName, relation: 'Father', age: parsedData.fatherage ? parseInt(parsedData.fatherage) : 52, occupation: parsedData.fatheroccupation || 'Govt Service', aadhaar: 'XXXX-XXXX-0000', contact: parsedData.fathercontact || phone, address: parsedData.fatheraddress || village, bloodGroup: parsedData.fatherblood || 'O+', profilePicture: parsedData.fatherphoto || '' },
      mother: { name: motherName, relation: 'Mother', age: parsedData.motherage ? parseInt(parsedData.motherage) : 48, occupation: parsedData.motheroccupation || 'Homemaker', aadhaar: 'XXXX-XXXX-0000', contact: parsedData.mothercontact || '', address: parsedData.motheraddress || village, bloodGroup: parsedData.motherblood || 'A+', profilePicture: parsedData.motherphoto || '' },
      wife: parsedData.spousename ? { name: parsedData.spousename, relation: 'Wife', age: parsedData.spouseage ? parseInt(parsedData.spouseage) : 45, occupation: parsedData.spouseoccupation || 'Social Worker', aadhaar: 'XXXX-XXXX-0000', contact: parsedData.spousecontact || '', address: parsedData.spouseaddress || village, bloodGroup: parsedData.spouseblood || 'B+', profilePicture: parsedData.spousephoto || '' } : null,
      children: (parsedData.children || []).map(c => ({ name: c.name || 'Child Name', relation: c.relation || 'Son', age: c.age ? parseInt(c.age) : 12, school: c.school || 'School Student', class: c.class || 'Class VII', dob: c.dob || '2014-01-01', bloodGroup: c.bloodGroup || 'O+', profilePicture: c.profilePicture || '' }))
    },
    leave: {
      balance: {
        annual: { remaining: 30, total: 30 },
        casual: { remaining: 15, total: 15 },
        medical: { remaining: 20, total: 20 },
        special: { remaining: 5, total: 5 }
      },
      history: [],
      analytics: {
        yearlyLeaveTaken: [{ year: '2026', days: 0 }],
        typeDistribution: [{ name: 'Annual', value: 0 }],
        monthlyTrend: [{ month: 'Jan', days: 0 }]
      }
    },
    bankInfo: {
      bankName: bank,
      accountHolderName: fullName.toUpperCase(),
      accountNumber: account,
      ifscCode: ifsc,
      branchName: 'IMA Branch, Dehradun',
      upiId: upi,
      salaryAccountStatus: 'Active - Cadet Stipend Disbursal'
    },
    serviceRecord: {
      postingHistory: [
        { period: '2026 - Present', unit: 'IMA Dehradun', station: 'Dehradun', role: 'Gentleman Cadet', type: 'Training' }
      ],
      promotions: [
        { date: '2026-06-12', rank: 'Gentleman Cadet', authority: 'IMA Commandant Order' }
      ],
      training: [
        { name: "Pre-Commissioning Cadet Training", location: "IMA Dehradun", status: "Ongoing" }
      ],
      deployments: []
    },
    medicalInfo: {
      bloodGroup: blood,
      medicalCategory: 'SHAPE-1 (FIT)',
      lastMedicalCheckup: '2026-06-01',
      fitnessStatus: 'Fully Fit',
      vitals: { pulse: '72 bpm', bp: '120/80 mmHg', height: '178 cm', weight: '70 kg', bmi: '22.1' },
      vaccinations: [
        { name: 'Yellow Fever Booster', date: '2026-05-15', status: 'Completed' }
      ],
      medicalNotes: "Passed enlistment board without caveats."
    },
    awards: []
  };
};

export default function CommissionPanel({ authToken, onOnboardSuccess }) {
  const [activeMode, setActiveMode] = useState('form'); // 'form' | 'upload'
  const [formStep, setFormStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Batch Parsing States
  const [uploadLoading, setUploadLoading] = useState(false);
  const [parsedFileName, setParsedFileName] = useState('');
  const [rawTextPaste, setRawTextPaste] = useState('');
  const [parsedCadets, setParsedCadets] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  
  const fileInputRef = useRef(null);

  // Form state for single manual entry
  const [formData, setFormData] = useState(buildCadetObject({}));

  const handleTextChange = (section, field, value, subField = null) => {
    setFormData(prev => {
      const updated = { ...prev };
      if (subField) {
        updated[section] = {
          ...updated[section],
          [field]: {
            ...updated[section][field],
            [subField]: value
          }
        };
      } else {
        updated[section] = {
          ...updated[section],
          [field]: value
        };
      }
      return updated;
    });
  };

  const handleFatherMotherChange = (parent, field, value) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        family: {
          ...prev.family,
          [parent]: {
            ...prev.family[parent],
            [field]: value
          }
        }
      };
      
      // Sync names to personalInfo as expected by DB
      if (parent === 'father' && field === 'name') {
        updated.personalInfo = {
          ...updated.personalInfo,
          fatherName: value
        };
      } else if (parent === 'mother' && field === 'name') {
        updated.personalInfo = {
          ...updated.personalInfo,
          motherName: value
        };
      }
      
      return updated;
    });
  };

  const handleSpouseToggle = (hasSpouse) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        family: {
          ...prev.family,
          wife: hasSpouse ? {
            name: '',
            relation: 'Wife',
            age: 45,
            occupation: 'Social Worker',
            aadhaar: 'XXXX-XXXX-0000',
            contact: '',
            address: prev.address.permanent.village || 'Ranikhet',
            bloodGroup: 'B+',
            profilePicture: ''
          } : null
        }
      };
      return updated;
    });
  };

  const handleSpouseChange = (field, value) => {
    setFormData(prev => {
      if (!prev.family.wife) return prev;
      const updated = {
        ...prev,
        family: {
          ...prev.family,
          wife: {
            ...prev.family.wife,
            [field]: value
          }
        }
      };
      return updated;
    });
  };

  const handleAddChild = () => {
    setFormData(prev => {
      const updated = {
        ...prev,
        family: {
          ...prev.family,
          children: [
            ...(prev.family.children || []),
            {
              name: '',
              relation: 'Son',
              age: 12,
              school: 'Army Public School',
              class: 'Class VII',
              dob: '2014-06-12',
              bloodGroup: 'O+',
              profilePicture: ''
            }
          ]
        }
      };
      return updated;
    });
  };

  const handleChildChange = (index, field, value) => {
    setFormData(prev => {
      const updatedChildren = [...(prev.family.children || [])];
      updatedChildren[index] = {
        ...updatedChildren[index],
        [field]: value
      };
      const updated = {
        ...prev,
        family: {
          ...prev.family,
          children: updatedChildren
        }
      };
      return updated;
    });
  };

  const handleRemoveChild = (index) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        family: {
          ...prev.family,
          children: (prev.family.children || []).filter((_, idx) => idx !== index)
        }
      };
      return updated;
    });
  };

  const handleFamilyImageUpload = (parent, e, isChild = false, childIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      if (isChild) {
        handleChildChange(childIndex, 'profilePicture', base64Data);
      } else if (parent === 'wife') {
        handleSpouseChange('profilePicture', base64Data);
      } else {
        handleFatherMotherChange(parent, 'profilePicture', base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCadetImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      handleTextChange('personalInfo', 'profilePicture', base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentUpload = (docType, e, subField = 'preview') => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      setFormData(prev => {
        const updated = { ...prev };
        updated.documents = {
          ...updated.documents,
          [docType]: {
            ...updated.documents[docType],
            [subField]: base64Data
          }
        };
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentNumberChange = (docType, value) => {
    setFormData(prev => {
      const updated = { ...prev };
      updated.documents = {
        ...updated.documents,
        [docType]: {
          ...updated.documents[docType],
          number: value
        }
      };
      return updated;
    });
  };

  // Real client-side parser for TXT/Notepad split by double newlines or '---'
  const parseTxtContent = (text) => {
    const blocks = text.split(/(?:---|(?:\r?\n){2,})/);
    const cadets = [];
    
    blocks.forEach(block => {
      if (!block.trim()) return;
      const lines = block.split(/\r?\n/);
      const parsedData = {};
      
      lines.forEach(line => {
        const index = line.indexOf(':');
        if (index !== -1) {
          const key = line.slice(0, index).trim().toLowerCase().replace(/[\s_]/g, '');
          const val = line.slice(index + 1).trim();
          parsedData[key] = val;
        }
      });

      if (parsedData.fullname || parsedData.name || parsedData.armynumber || parsedData.number) {
        cadets.push(buildCadetObject(parsedData));
      }
    });
    return cadets;
  };

  // Real client-side parser for CSV
  const parseCsvContent = (text) => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[\s_]/g, ''));
    const cadets = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      const parsedData = {};
      headers.forEach((header, idx) => {
        if (values[idx]) {
          parsedData[header] = values[idx].trim();
        }
      });
      
      if (parsedData.fullname || parsedData.name || parsedData.armynumber || parsedData.number) {
        cadets.push(buildCadetObject(parsedData));
      }
    }
    return cadets;
  };

  // Real client-side parser for JSON
  const parseJsonContent = (text) => {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        return data.map(item => buildCadetObject(item));
      } else {
        return [buildCadetObject(data)];
      }
    } catch (e) {
      alert("Invalid JSON format.");
      return [];
    }
  };

  // Process file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setParsedFileName(file.name);
    const extension = file.name.split('.').pop().toLowerCase();

    setUploadLoading(true);

    setTimeout(() => {
      setUploadLoading(false);
      let cadetsList = [];

      if (extension === 'txt') {
        const reader = new FileReader();
        reader.onload = (event) => {
          cadetsList = parseTxtContent(event.target.result);
          processParsedCadets(cadetsList);
        };
        reader.readAsText(file);
      } else if (extension === 'csv') {
        const reader = new FileReader();
        reader.onload = (event) => {
          cadetsList = parseCsvContent(event.target.result);
          processParsedCadets(cadetsList);
        };
        reader.readAsText(file);
      } else if (extension === 'json') {
        const reader = new FileReader();
        reader.onload = (event) => {
          cadetsList = parseJsonContent(event.target.result);
          processParsedCadets(cadetsList);
        };
        reader.readAsText(file);
      } else {
        // Mock Batch OCR Extractor for PDF/Word/Excel
        // Generates 3 mock Gentleman Cadets representing batch extract from PDF/Excel
        cadetsList = [
          buildCadetObject({ name: "Cadet Sunil Dev", armynumber: "IC-998811F", regiment: "Gorkha Rifles", blood: "O+", phone: "+91 99988 11111", village: "Dharamshala", district: "Kangra", state: "Himachal Pradesh", pincode: "176215" }),
          buildCadetObject({ name: "Cadet Rohan Singh", armynumber: "IC-998812M", regiment: "Rajput Regiment", blood: "A+", phone: "+91 99988 22222", village: "Shimla", district: "Shimla", state: "Himachal Pradesh", pincode: "171001" }),
          buildCadetObject({ name: "Cadet Amit Chopra", armynumber: "IC-998813K", regiment: "Rajputana Rifles", blood: "B+", phone: "+91 99988 33333", village: "Ambala", district: "Ambala", state: "Haryana", pincode: "133001" })
        ];
        processParsedCadets(cadetsList);
        setSuccessMsg(`Mock OCR scanned ${file.name} successfully. Extracted ${cadetsList.length} cadets.`);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    }, 2000); // 2-second tactical scanning delay
  };

  const processParsedCadets = (cadetsList) => {
    if (cadetsList.length === 0) {
      setError("No valid cadet records detected in the document.");
      return;
    }
    setParsedCadets(cadetsList);
    setSelectedIndices(cadetsList.map((_, idx) => idx)); // Select all by default
  };

  // Copy paste text parser
  const handleRawTextParse = () => {
    if (!rawTextPaste.trim()) return;
    const cadets = parseTxtContent(rawTextPaste);
    processParsedCadets(cadets);
    setRawTextPaste('');
  };

  // Toggle selection for batch onboarding
  const handleToggleSelect = (index) => {
    setSelectedIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIndices.length === parsedCadets.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(parsedCadets.map((_, idx) => idx));
    }
  };

  // Remove cadet from preview list
  const handleRemoveParsed = (index) => {
    setParsedCadets(prev => prev.filter((_, idx) => idx !== index));
    setSelectedIndices(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  // Onboard Single cadet from Manual Form
  const handleOnboardSingle = async (e) => {
    e.preventDefault();
    if (formStep < 4) {
      setFormStep(s => s + 1);
      return;
    }
    setError('');
    setLoading(true);

    if (!formData.personalInfo.armyNumber || !formData.personalInfo.fullName) {
      setError("Mandatory Fields Missing: Army Number and Full Name must be filled.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/personnel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg(data.message || "Cadet onboarded successfully!");
        onOnboardSuccess(formData.personalInfo.armyNumber);
        setFormData(buildCadetObject({}));
        setFormStep(1);
      } else {
        setError(data.message || "Failed to onboard cadet.");
      }
    } catch (err) {
      setError("Connection to database server failed.");
    } finally {
      setLoading(false);
    }
  };

  // Onboard Selected Batch of Cadets
  const handleOnboardBatch = async () => {
    setError('');
    setLoading(true);

    const cadetsToOnboard = parsedCadets.filter((_, idx) => selectedIndices.includes(idx));
    
    if (cadetsToOnboard.length === 0) {
      setError("No cadets selected for commission.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/personnel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(cadetsToOnboard)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg(data.message || `Successfully commissioned ${cadetsToOnboard.length} cadets.`);
        onOnboardSuccess(cadetsToOnboard[0].personalInfo.armyNumber); // Redirect to show first cadet
        
        // Clear preview list
        setParsedCadets([]);
        setSelectedIndices([]);
      } else {
        setError(data.message || "Failed to batch onboard cadets.");
      }
    } catch (err) {
      setError("Server connection lost. Unable to complete batch transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full font-mono text-tactical-khaki space-y-6">
      
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-army-green/40 pb-3">
        <div className="flex items-center gap-2">
          <UserPlus size={20} className="text-tactical-gold" />
          <h2 className="text-lg font-bold text-white tracking-widest uppercase">CADET COMMISSION ONBOARDING</h2>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="no-print flex gap-2 border-b border-army-green/20 pb-4">
        <button
          onClick={() => { setActiveMode('form'); setParsedCadets([]); }}
          className={`px-4 py-2 text-xs font-bold tracking-wider border transition-all rounded cursor-pointer ${
            activeMode === 'form'
              ? 'bg-army-green border-tactical-gold text-tactical-gold shadow-[0_0_8px_rgba(212,175,55,0.2)]'
              : 'border-army-green/40 text-olive-drab hover:text-tactical-khaki hover:bg-army-green/10'
          }`}
        >
          SINGLE MANUAL FORM
        </button>
        <button
          onClick={() => setActiveMode('upload')}
          className={`px-4 py-2 text-xs font-bold tracking-wider border transition-all rounded cursor-pointer ${
            activeMode === 'upload'
              ? 'bg-army-green border-tactical-gold text-tactical-gold shadow-[0_0_8px_rgba(212,175,55,0.2)]'
              : 'border-army-green/40 text-olive-drab hover:text-tactical-khaki hover:bg-army-green/10'
          }`}
        >
          BATCH DOCUMENT UPLOADER & OCR
        </button>
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="p-3.5 bg-green-950/60 border border-green-500/50 rounded text-green-400 text-xs flex items-center gap-2 animate-pulse">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-950/60 border border-red-500/50 rounded text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* MODE 2: BATCH DOCUMENT UPLOADER */}
      {activeMode === 'upload' && parsedCadets.length === 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Drag & Drop File Zone */}
            <div className="glass-panel p-6 rounded-lg border border-army-green/45 flex flex-col items-center justify-center text-center space-y-4">
              <UploadCloud size={48} className="text-tactical-gold animate-bounce" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Drag & Drop Batch Dossier</h3>
                <p className="text-[10px] text-olive-drab mt-1">Accepts Excel (.xlsx), PDF, Word, Notepad (.txt), CSV, JSON</p>
              </div>

              <button 
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-2 bg-army-green hover:bg-olive-drab border border-tactical-gold/30 text-xs font-bold text-tactical-khaki hover:text-tactical-gold hover:border-tactical-gold rounded cursor-pointer transition-colors"
              >
                BROWSE FILES
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.csv,.json,.pdf,.docx,.xlsx"
                className="hidden"
              />
            </div>

            {/* Notepad raw copy paste */}
            <div className="glass-panel p-6 rounded-lg border border-army-green/45 flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Clipboard size={16} className="text-tactical-gold" />
                <span>Notepad Batch Copy-Paste (Separate with ---)</span>
              </div>
              <textarea
                value={rawTextPaste}
                onChange={(e) => setRawTextPaste(e.target.value)}
                placeholder="Name: Cadet Sunil Dev&#13;Army Number: IC-998811F&#13;Regiment: Gorkha Rifles&#13;---&#13;Name: Cadet Rohan Singh&#13;Army Number: IC-998812M&#13;Regiment: Rajput Regiment"
                rows="5"
                className="w-full bg-military-black border border-army-green/40 focus:border-tactical-gold rounded p-2 text-xs text-white placeholder-army-green/40 focus:outline-none"
              />
              <button 
                onClick={handleRawTextParse}
                disabled={!rawTextPaste.trim()}
                className="w-full py-2 bg-tactical-gold/25 border border-tactical-gold text-tactical-gold text-xs font-bold rounded hover:bg-tactical-gold/45 cursor-pointer disabled:opacity-50 transition-colors"
              >
                PARSE BATCH TEXT
              </button>
            </div>

          </div>

          {/* OCR Scanning Overlay */}
          {uploadLoading && (
            <div className="glass-panel p-10 rounded-lg text-center border border-tactical-gold/30 flex flex-col items-center justify-center gap-3">
              <Loader className="animate-spin text-tactical-gold" size={28} />
              <div className="text-xs font-bold text-tactical-gold tracking-widest animate-pulse">
                RUNNING BATCH OCR STREAM EXTRACTION...
              </div>
              <div className="w-48 h-[2px] bg-army-green/30 relative overflow-hidden rounded">
                <div className="absolute top-0 left-0 h-full bg-tactical-gold animate-scanline w-1/2 rounded"></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BATCH REVIEW TABLE */}
      {activeMode === 'upload' && parsedCadets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-army-green/20 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ListFilter size={14} className="text-tactical-gold" />
              <span>DETECTED BATCH CADETS REVIEW</span>
            </span>
            <span className="text-[10px] text-tactical-gold bg-army-dark border border-army-green px-2 py-0.5 rounded font-bold">
              {selectedIndices.length} OF {parsedCadets.length} SELECTED
            </span>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-lg overflow-hidden border border-army-green/35">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-army-dark border-b border-army-green/30 text-olive-drab font-bold uppercase text-[10px]">
                    <th className="p-3 w-12 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedIndices.length === parsedCadets.length && parsedCadets.length > 0}
                        onChange={handleToggleSelectAll}
                        className="cursor-pointer accent-tactical-gold"
                      />
                    </th>
                    <th className="p-3">FULL NAME</th>
                    <th className="p-3">ARMY NUMBER</th>
                    <th className="p-3">RANK</th>
                    <th className="p-3">REGIMENT</th>
                    <th className="p-3">BLOOD GROUP</th>
                    <th className="p-3">HOME TOWN (VILLAGE)</th>
                    <th className="p-3 w-16 text-center">REMOVE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-army-green/15 text-slate-300">
                  {parsedCadets.map((cadet, idx) => (
                    <tr key={idx} className="hover:bg-army-green/5">
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox"
                          checked={selectedIndices.includes(idx)}
                          onChange={() => handleToggleSelect(idx)}
                          className="cursor-pointer accent-tactical-gold"
                        />
                      </td>
                      <td className="p-3 font-semibold text-white">{cadet.personalInfo.fullName}</td>
                      <td className="p-3 font-bold text-tactical-orange">{cadet.personalInfo.armyNumber}</td>
                      <td className="p-3 text-slate-400">{cadet.personalInfo.rank}</td>
                      <td className="p-3 text-slate-400">{cadet.personalInfo.regiment}</td>
                      <td className="p-3 text-center text-red-400 font-bold">{cadet.personalInfo.bloodGroup}</td>
                      <td className="p-3 text-slate-400 font-sans">{cadet.address.permanent.village}</td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleRemoveParsed(idx)}
                          className="text-red-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-3 font-mono pt-2">
            <button
              onClick={() => { setParsedCadets([]); setSelectedIndices([]); }}
              className="px-4 py-2 border border-army-green text-xs font-bold text-tactical-khaki hover:text-white rounded cursor-pointer transition-colors"
            >
              CLEAR PREVIEW
            </button>
            <button
              onClick={handleOnboardBatch}
              disabled={loading || selectedIndices.length === 0}
              className="px-6 py-2 bg-tactical-gold hover:bg-amber-600 text-military-black text-xs font-bold uppercase tracking-widest rounded cursor-pointer transition-colors flex items-center gap-1.5 shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin" size={14} /> : null}
              <span>COMMISSION {selectedIndices.length} SELECTED CADETS</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 1: MANUAL WIZARD FORM */}
      {activeMode === 'form' && (
        <form onSubmit={handleOnboardSingle} className="glass-panel p-5 rounded-lg border border-army-green/45 space-y-6">
          
          {/* Step indicators */}
          <div className="no-print flex items-center justify-between border-b border-army-green/20 pb-4 text-[10px] font-bold text-olive-drab">
            {[
              { step: 1, name: "BASIC COMMISSION FILE" },
              { step: 2, name: "GEOGRAPHIC COORDS" },
              { step: 3, name: "FINANCIAL ACCOUNTS" },
              { step: 4, name: "FAMILY DECLARATION" }
            ].map(s => (
              <div 
                key={s.step} 
                className={`flex items-center gap-1.5 ${formStep === s.step ? 'text-tactical-gold' : ''}`}
              >
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[9px] ${
                  formStep >= s.step 
                    ? 'border-tactical-gold bg-tactical-gold/15 text-tactical-gold font-extrabold' 
                    : 'border-army-green/45 text-olive-drab'
                }`}>
                  {s.step}
                </span>
                <span className="hidden md:inline">{s.name}</span>
              </div>
            ))}
          </div>

          {/* STEP 1: BASIC DETAILS */}
          {formStep === 1 && (
            <div className="space-y-4">
              <div className="text-xs text-tactical-gold font-bold uppercase tracking-widest">STEP 1: BASIC ENLISTMENT RECORD</div>
              
              {/* Cadet Profile Picture Upload */}
              <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-army-dark/30 border border-army-green/30 rounded-lg">
                <div className="w-20 h-20 rounded border border-tactical-gold/45 bg-military-black/80 flex items-center justify-center overflow-hidden relative shrink-0">
                  {formData.personalInfo.profilePicture ? (
                    <img 
                      src={formData.personalInfo.profilePicture} 
                      alt="Cadet Portrait" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = ''; }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-1">
                      <span className="text-[8px] font-bold text-olive-drab">NO PORTRAIT</span>
                    </div>
                  )}
                  {/* Dynamic CRT Scanline overlay */}
                  <div className="absolute w-full h-[1px] bg-tactical-gold/25 top-0 left-0 animate-scanline pointer-events-none"></div>
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <div className="text-[10px] text-tactical-gold font-bold uppercase tracking-wider">CADET PROFILE PORTRAIT</div>
                  <p className="text-[9px] text-olive-drab">Upload a portrait image for the official dossier record.</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <label className="px-3 py-1 bg-army-green hover:bg-olive-drab border border-tactical-gold/30 text-[9px] font-bold text-tactical-khaki hover:text-tactical-gold rounded cursor-pointer transition-colors flex items-center gap-1.5 shadow">
                      <span>UPLOAD IMAGE</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleCadetImageUpload}
                        className="hidden"
                      />
                    </label>
                    {formData.personalInfo.profilePicture && (
                      <button
                        type="button"
                        onClick={() => handleTextChange('personalInfo', 'profilePicture', '')}
                        className="px-2 py-1 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-[9px] font-bold text-red-400 rounded transition-colors"
                      >
                        REMOVE
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                
                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">FULL NAME (MANDATORY)</label>
                  <input 
                    type="text" 
                    required
                    value={formData.personalInfo.fullName}
                    onChange={(e) => {
                      handleTextChange('personalInfo', 'fullName', e.target.value);
                      handleTextChange('bankInfo', 'accountHolderName', e.target.value.toUpperCase());
                    }}
                    placeholder="e.g. Cadet Rajan Singh"
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white placeholder-army-green/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">ARMY NUMBER (MANDATORY)</label>
                  <input 
                    type="text" 
                    required
                    value={formData.personalInfo.armyNumber}
                    onChange={(e) => handleTextChange('personalInfo', 'armyNumber', e.target.value.toUpperCase())}
                    placeholder="e.g. IC-991028F"
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white placeholder-army-green/30 focus:outline-none font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">RANK DESIGNATION</label>
                  <select 
                    value={formData.personalInfo.rank}
                    onChange={(e) => handleTextChange('personalInfo', 'rank', e.target.value)}
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white focus:outline-none"
                  >
                    <optgroup label="TRAINING / CADET" className="text-olive-drab font-bold">
                      <option value="Cadet">GENTLEMAN CADET ( IMA )</option>
                    </optgroup>
                    <optgroup label="COMMISSIONED OFFICERS" className="text-olive-drab font-bold">
                      <option value="Field Marshal">FIELD MARSHAL (CEREMONIAL / FIVE-STAR)</option>
                      <option value="General">GENERAL (CHIEF OF THE ARMY STAFF)</option>
                      <option value="Lieutenant General">LIEUTENANT GENERAL</option>
                      <option value="Major General">MAJOR GENERAL</option>
                      <option value="Brigadier">BRIGADIER</option>
                      <option value="Colonel">COLONEL</option>
                      <option value="Lieutenant Colonel">LIEUTENANT COLONEL</option>
                      <option value="Major">MAJOR</option>
                      <option value="Captain">CAPTAIN</option>
                      <option value="Lieutenant">LIEUTENANT</option>
                    </optgroup>
                    <optgroup label="JUNIOR COMMISSIONED OFFICERS (JCOs)" className="text-olive-drab font-bold">
                      <option value="Subedar Major">SUBEDAR MAJOR</option>
                      <option value="Subedar">SUBEDAR</option>
                      <option value="Naib Subedar">NAIB SUBEDAR</option>
                    </optgroup>
                    <optgroup label="NON-COMMISSIONED OFFICERS (NCOs)" className="text-olive-drab font-bold">
                      <option value="Havildar">HAVILDAR</option>
                      <option value="Naik">NAIK</option>
                      <option value="Lance Naik">LANCE NAIK</option>
                    </optgroup>
                    <optgroup label="ENLISTED PERSONNEL" className="text-olive-drab font-bold">
                      <option value="Sepoy">SEPOY</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">REGIMENT ASSIGNED</label>
                  <input 
                    type="text" 
                    value={formData.personalInfo.regiment}
                    onChange={(e) => handleTextChange('personalInfo', 'regiment', e.target.value)}
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">BRANCH / SERVICES</label>
                  <input 
                    type="text" 
                    value={formData.personalInfo.branch}
                    onChange={(e) => handleTextChange('personalInfo', 'branch', e.target.value)}
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">BLOOD GROUP</label>
                  <select 
                    value={formData.personalInfo.bloodGroup}
                    onChange={(e) => {
                      handleTextChange('personalInfo', 'bloodGroup', e.target.value);
                      handleTextChange('medicalInfo', 'bloodGroup', e.target.value);
                    }}
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">CONTACT TELEPHONE</label>
                  <input 
                    type="text" 
                    value={formData.personalInfo.contactNumber}
                    onChange={(e) => handleTextChange('personalInfo', 'contactNumber', e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">SECURE EMAIL</label>
                  <input 
                    type="email" 
                    value={formData.personalInfo.email}
                    onChange={(e) => handleTextChange('personalInfo', 'email', e.target.value)}
                    placeholder="email@indianarmy.nic.in"
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">DATE OF BIRTH</label>
                  <input 
                    type="date" 
                    value={formData.personalInfo.dob}
                    onChange={(e) => handleTextChange('personalInfo', 'dob', e.target.value)}
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ADDRESSES */}
          {formStep === 2 && (
            <div className="space-y-4">
              <div className="text-xs text-tactical-gold font-bold uppercase tracking-widest">STEP 2: RESIDENTIAL & GEOGRAPHIC ADDRESS COORDS</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Permanent */}
                <div className="p-4 bg-military-black/80 border border-army-green/35 rounded-lg space-y-3 text-xs">
                  <span className="text-[10px] text-tactical-gold font-bold uppercase block">PERMANENT RESIDENCE ADDRESS</span>
                  <div>
                    <label className="block text-[8px] text-olive-drab mb-1">HOUSE NUMBER / SECTOR</label>
                    <input 
                      type="text" 
                      value={formData.address.permanent.houseNumber}
                      onChange={(e) => handleTextChange('address', 'permanent', e.target.value, 'houseNumber')}
                      placeholder="e.g. H.No 442/A"
                      className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-olive-drab mb-1">VILLAGE / LOCALITY</label>
                    <input 
                      type="text" 
                      value={formData.address.permanent.village}
                      onChange={(e) => handleTextChange('address', 'permanent', e.target.value, 'village')}
                      className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-olive-drab mb-1">DISTRICT</label>
                    <input 
                      type="text" 
                      value={formData.address.permanent.district}
                      onChange={(e) => handleTextChange('address', 'permanent', e.target.value, 'district')}
                      className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-olive-drab mb-1">STATE & PIN CODE</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={formData.address.permanent.state}
                        onChange={(e) => handleTextChange('address', 'permanent', e.target.value, 'state')}
                        placeholder="State"
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                      <input 
                        type="text" 
                        value={formData.address.permanent.pinCode}
                        onChange={(e) => handleTextChange('address', 'permanent', e.target.value, 'pinCode')}
                        placeholder="PIN"
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Current Posting */}
                <div className="p-4 bg-military-black/80 border border-army-green/35 rounded-lg space-y-3 text-xs">
                  <span className="text-[10px] text-tactical-gold font-bold uppercase block">ACTIVE STATION POSTING</span>
                  <div>
                    <label className="block text-[8px] text-olive-drab mb-1">UNIT LOCATION / DEPOT</label>
                    <input 
                      type="text" 
                      value={formData.address.currentPosting.unitLocation}
                      onChange={(e) => handleTextChange('address', 'currentPosting', e.target.value, 'unitLocation')}
                      className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-olive-drab mb-1">STATION STATION</label>
                    <input 
                      type="text" 
                      value={formData.address.currentPosting.station}
                      onChange={(e) => handleTextChange('address', 'currentPosting', e.target.value, 'station')}
                      className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-olive-drab mb-1">STATION COORDINATES (LAT / LNG)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="number" 
                        step="any"
                        value={formData.address.currentPosting.lat}
                        onChange={(e) => handleTextChange('address', 'currentPosting', parseFloat(e.target.value), 'lat')}
                        placeholder="Latitude"
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                      <input 
                        type="number" 
                        step="any"
                        value={formData.address.currentPosting.lng}
                        onChange={(e) => handleTextChange('address', 'currentPosting', parseFloat(e.target.value), 'lng')}
                        placeholder="Longitude"
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FINANCIAL DETAILS */}
          {formStep === 3 && (
            <div className="space-y-4">
              <div className="text-xs text-tactical-gold font-bold uppercase tracking-widest">STEP 3: BANK & STIPEND PAYMENT DISBURSAL</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                
                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">BANK NAME</label>
                  <input 
                    type="text" 
                    value={formData.bankInfo.bankName}
                    onChange={(e) => handleTextChange('bankInfo', 'bankName', e.target.value)}
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">ACCOUNT HOLDER NAME</label>
                  <input 
                    type="text" 
                    value={formData.bankInfo.accountHolderName}
                    onChange={(e) => handleTextChange('bankInfo', 'accountHolderName', e.target.value.toUpperCase())}
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white focus:outline-none uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">ACCOUNT NUMBER</label>
                  <input 
                    type="text" 
                    value={formData.bankInfo.accountNumber}
                    onChange={(e) => handleTextChange('bankInfo', 'accountNumber', e.target.value)}
                    placeholder="Enter Account Number"
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">IFSC SYSTEM CODE</label>
                  <input 
                    type="text" 
                    value={formData.bankInfo.ifscCode}
                    onChange={(e) => handleTextChange('bankInfo', 'ifscCode', e.target.value.toUpperCase())}
                    placeholder="SBIN00XXXXX"
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white focus:outline-none uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">UPI ID CODE</label>
                  <input 
                    type="text" 
                    value={formData.bankInfo.upiId}
                    onChange={(e) => handleTextChange('bankInfo', 'upiId', e.target.value)}
                    placeholder="e.g. cadetname@oksbi"
                    className="w-full bg-military-black border border-army-green focus:border-tactical-gold rounded px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Secure Identity & Financial Verification Documents */}
              <div className="mt-6 pt-6 border-t border-army-green/35 space-y-4">
                <div className="text-[10px] text-tactical-gold font-bold uppercase tracking-wider">SECURE IDENTITY & FINANCIAL VERIFICATION DOCUMENTS</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Aadhaar Card */}
                  <div className="p-3 bg-military-black/60 border border-army-green/30 rounded-lg flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white font-bold uppercase">AADHAAR CARD</span>
                        <span className="text-[8px] text-olive-drab">UIDAI CERTIFIED</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className="block text-[8px] text-olive-drab mb-1">AADHAAR NUMBER</label>
                          <input 
                            type="text"
                            value={formData.documents.aadhaar.number}
                            onChange={(e) => handleDocumentNumberChange('aadhaar', e.target.value)}
                            placeholder="XXXX-XXXX-XXXX"
                            className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none text-[11px]"
                          />
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="w-10 h-10 rounded border border-army-green/45 bg-military-black/80 flex items-center justify-center overflow-hidden shrink-0">
                            {formData.documents.aadhaar.frontPreview ? (
                              <img 
                                src={formData.documents.aadhaar.frontPreview} 
                                alt="Aadhaar" 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = ''; }}
                              />
                            ) : (
                              <span className="text-[8px] text-olive-drab">NO FILE</span>
                            )}
                          </div>
                          <div className="flex-grow">
                            <label className="px-3 py-1 bg-army-green hover:bg-olive-drab border border-tactical-gold/30 text-[9px] font-bold text-tactical-khaki hover:text-tactical-gold rounded cursor-pointer transition-colors block text-center">
                              <span>UPLOAD AADHAAR</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleDocumentUpload('aadhaar', e, 'frontPreview')}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {formData.documents.aadhaar.frontPreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => {
                                  const updated = { ...prev };
                                  updated.documents.aadhaar.frontPreview = '';
                                  return updated;
                                });
                              }}
                              className="px-2 py-1 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-[9px] font-bold text-red-400 rounded transition-colors"
                            >
                              REMOVE
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PAN Card */}
                  <div className="p-3 bg-military-black/60 border border-army-green/30 rounded-lg flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white font-bold uppercase">PAN CARD</span>
                        <span className="text-[8px] text-olive-drab">INCOME TAX DEPT</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className="block text-[8px] text-olive-drab mb-1">PAN NUMBER</label>
                          <input 
                            type="text"
                            value={formData.documents.pan.number}
                            onChange={(e) => handleDocumentNumberChange('pan', e.target.value.toUpperCase())}
                            placeholder="ABCDE1234F"
                            className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none text-[11px] uppercase font-bold"
                          />
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="w-10 h-10 rounded border border-army-green/45 bg-military-black/80 flex items-center justify-center overflow-hidden shrink-0">
                            {formData.documents.pan.preview ? (
                              <img 
                                src={formData.documents.pan.preview} 
                                alt="PAN" 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = ''; }}
                              />
                            ) : (
                              <span className="text-[8px] text-olive-drab">NO FILE</span>
                            )}
                          </div>
                          <div className="flex-grow">
                            <label className="px-3 py-1 bg-army-green hover:bg-olive-drab border border-tactical-gold/30 text-[9px] font-bold text-tactical-khaki hover:text-tactical-gold rounded cursor-pointer transition-colors block text-center">
                              <span>UPLOAD PAN</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleDocumentUpload('pan', e, 'preview')}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {formData.documents.pan.preview && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => {
                                  const updated = { ...prev };
                                  updated.documents.pan.preview = '';
                                  return updated;
                                });
                              }}
                              className="px-2 py-1 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-[9px] font-bold text-red-400 rounded transition-colors"
                            >
                              REMOVE
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Passbook */}
                  <div className="p-3 bg-military-black/60 border border-army-green/30 rounded-lg flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white font-bold uppercase">BANK PASSBOOK</span>
                        <span className="text-[8px] text-olive-drab">MANDATE / PASSBOOK SCAN</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-3 mt-1">
                          <div className="w-10 h-10 rounded border border-army-green/45 bg-military-black/80 flex items-center justify-center overflow-hidden shrink-0">
                            {formData.documents.bankPassbook.preview ? (
                              <img 
                                src={formData.documents.bankPassbook.preview} 
                                alt="Passbook" 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = ''; }}
                              />
                            ) : (
                              <span className="text-[8px] text-olive-drab">NO FILE</span>
                            )}
                          </div>
                          <div className="flex-grow">
                            <label className="px-3 py-1 bg-army-green hover:bg-olive-drab border border-tactical-gold/30 text-[9px] font-bold text-tactical-khaki hover:text-tactical-gold rounded cursor-pointer transition-colors block text-center">
                              <span>UPLOAD PASSBOOK</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleDocumentUpload('bankPassbook', e, 'preview')}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {formData.documents.bankPassbook.preview && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => {
                                  const updated = { ...prev };
                                  updated.documents.bankPassbook.preview = '';
                                  return updated;
                                });
                              }}
                              className="px-2 py-1 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-[9px] font-bold text-red-400 rounded transition-colors"
                            >
                              REMOVE
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Passport */}
                  <div className="p-3 bg-military-black/60 border border-army-green/30 rounded-lg flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white font-bold uppercase">PASSPORT SCAN</span>
                        <span className="text-[8px] text-olive-drab">REPUBLIC OF INDIA</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className="block text-[8px] text-olive-drab mb-1">PASSPORT NUMBER</label>
                          <input 
                            type="text"
                            value={formData.documents.passport.number}
                            onChange={(e) => handleDocumentNumberChange('passport', e.target.value.toUpperCase())}
                            placeholder="e.g. Z1234567"
                            className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none text-[11px] uppercase font-bold"
                          />
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="w-10 h-10 rounded border border-army-green/45 bg-military-black/80 flex items-center justify-center overflow-hidden shrink-0">
                            {formData.documents.passport.preview ? (
                              <img 
                                src={formData.documents.passport.preview} 
                                alt="Passport" 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = ''; }}
                              />
                            ) : (
                              <span className="text-[8px] text-olive-drab">NO FILE</span>
                            )}
                          </div>
                          <div className="flex-grow">
                            <label className="px-3 py-1 bg-army-green hover:bg-olive-drab border border-tactical-gold/30 text-[9px] font-bold text-tactical-khaki hover:text-tactical-gold rounded cursor-pointer transition-colors block text-center">
                              <span>UPLOAD PASSPORT</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleDocumentUpload('passport', e, 'preview')}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {formData.documents.passport.preview && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => {
                                  const updated = { ...prev };
                                  updated.documents.passport.preview = '';
                                  return updated;
                                });
                              }}
                              className="px-2 py-1 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-[9px] font-bold text-red-400 rounded transition-colors"
                            >
                              REMOVE
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* STEP 4: FAMILY DECLARATIONS */}
          {formStep === 4 && (
            <div className="space-y-6">
              <div className="text-xs text-tactical-gold font-bold uppercase tracking-widest border-b border-army-green/35 pb-1.5 flex justify-between items-center">
                <span>STEP 4: IMMEDIATE FAMILY DECLARATIONS</span>
                <span className="text-[10px] text-olive-drab">MILITARY REGISTRY VERIFICATION</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Father Node */}
                <div className="p-4 bg-military-black/80 border border-army-green/35 rounded-lg space-y-3">
                  <span className="text-[10px] text-tactical-gold font-bold uppercase block border-b border-army-green/20 pb-1">FATHER REGISTRATION</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">FULL NAME</label>
                      <input 
                        type="text" 
                        value={formData.family.father.name}
                        onChange={(e) => handleFatherMotherChange('father', 'name', e.target.value)}
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">AGE (YEARS)</label>
                      <input 
                        type="number" 
                        value={formData.family.father.age || ''}
                        onChange={(e) => handleFatherMotherChange('father', 'age', parseInt(e.target.value) || 0)}
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">BLOOD GROUP</label>
                      <input 
                        type="text" 
                        value={formData.family.father.bloodGroup || ''}
                        onChange={(e) => handleFatherMotherChange('father', 'bloodGroup', e.target.value)}
                        placeholder="e.g. O+"
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">OCCUPATION</label>
                      <input 
                        type="text" 
                        value={formData.family.father.occupation}
                        onChange={(e) => handleFatherMotherChange('father', 'occupation', e.target.value)}
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">CONTACT TELEPHONE</label>
                      <input 
                        type="text" 
                        value={formData.family.father.contact || ''}
                        onChange={(e) => handleFatherMotherChange('father', 'contact', e.target.value)}
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">RESIDENTIAL ADDRESS</label>
                      <input 
                        type="text" 
                        value={formData.family.father.address || ''}
                        onChange={(e) => handleFatherMotherChange('father', 'address', e.target.value)}
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">FATHER PHOTO</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border border-army-green/45 bg-military-black/80 flex items-center justify-center overflow-hidden shrink-0">
                          {formData.family.father.profilePicture ? (
                            <img 
                              src={formData.family.father.profilePicture} 
                              alt="Father" 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = ''; }}
                            />
                          ) : (
                            <span className="text-[9px] text-olive-drab">NO IMAGE</span>
                          )}
                        </div>
                        <div className="flex-grow space-y-2">
                          <div className="flex gap-2">
                            <label className="px-3 py-1 bg-army-green hover:bg-olive-drab border border-tactical-gold/30 text-[9px] font-bold text-tactical-khaki hover:text-tactical-gold rounded cursor-pointer transition-colors flex items-center gap-1">
                              <span>UPLOAD IMAGE</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleFamilyImageUpload('father', e)}
                                className="hidden"
                              />
                            </label>
                            {formData.family.father.profilePicture && (
                              <button
                                type="button"
                                onClick={() => handleFatherMotherChange('father', 'profilePicture', '')}
                                className="px-2 py-1 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-[9px] font-bold text-red-400 rounded transition-colors"
                              >
                                REMOVE
                              </button>
                            )}
                          </div>
                          <input 
                            type="text" 
                            value={formData.family.father.profilePicture || ''}
                            onChange={(e) => handleFatherMotherChange('father', 'profilePicture', e.target.value)}
                            placeholder="Or enter image URL here"
                            className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-[11px] text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mother Node */}
                <div className="p-4 bg-military-black/80 border border-army-green/35 rounded-lg space-y-3">
                  <span className="text-[10px] text-tactical-gold font-bold uppercase block border-b border-army-green/20 pb-1">MOTHER REGISTRATION</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">FULL NAME</label>
                      <input 
                        type="text" 
                        value={formData.family.mother.name}
                        onChange={(e) => handleFatherMotherChange('mother', 'name', e.target.value)}
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">AGE (YEARS)</label>
                      <input 
                        type="number" 
                        value={formData.family.mother.age || ''}
                        onChange={(e) => handleFatherMotherChange('mother', 'age', parseInt(e.target.value) || 0)}
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">BLOOD GROUP</label>
                      <input 
                        type="text" 
                        value={formData.family.mother.bloodGroup || ''}
                        onChange={(e) => handleFatherMotherChange('mother', 'bloodGroup', e.target.value)}
                        placeholder="e.g. A+"
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">OCCUPATION</label>
                      <input 
                        type="text" 
                        value={formData.family.mother.occupation}
                        onChange={(e) => handleFatherMotherChange('mother', 'occupation', e.target.value)}
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">CONTACT TELEPHONE</label>
                      <input 
                        type="text" 
                        value={formData.family.mother.contact || ''}
                        onChange={(e) => handleFatherMotherChange('mother', 'contact', e.target.value)}
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">RESIDENTIAL ADDRESS</label>
                      <input 
                        type="text" 
                        value={formData.family.mother.address || ''}
                        onChange={(e) => handleFatherMotherChange('mother', 'address', e.target.value)}
                        className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">MOTHER PHOTO</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border border-army-green/45 bg-military-black/80 flex items-center justify-center overflow-hidden shrink-0">
                          {formData.family.mother.profilePicture ? (
                            <img 
                              src={formData.family.mother.profilePicture} 
                              alt="Mother" 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = ''; }}
                            />
                          ) : (
                            <span className="text-[9px] text-olive-drab">NO IMAGE</span>
                          )}
                        </div>
                        <div className="flex-grow space-y-2">
                          <div className="flex gap-2">
                            <label className="px-3 py-1 bg-army-green hover:bg-olive-drab border border-tactical-gold/30 text-[9px] font-bold text-tactical-khaki hover:text-tactical-gold rounded cursor-pointer transition-colors flex items-center gap-1">
                              <span>UPLOAD IMAGE</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleFamilyImageUpload('mother', e)}
                                className="hidden"
                              />
                            </label>
                            {formData.family.mother.profilePicture && (
                              <button
                                type="button"
                                onClick={() => handleFatherMotherChange('mother', 'profilePicture', '')}
                                className="px-2 py-1 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-[9px] font-bold text-red-400 rounded transition-colors"
                              >
                                REMOVE
                              </button>
                            )}
                          </div>
                          <input 
                            type="text" 
                            value={formData.family.mother.profilePicture || ''}
                            onChange={(e) => handleFatherMotherChange('mother', 'profilePicture', e.target.value)}
                            placeholder="Or enter image URL here"
                            className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-[11px] text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spouse Toggle Option */}
                <div className="col-span-1 md:col-span-2 p-4 bg-military-black/80 border border-army-green/35 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="hasSpouseCheckbox"
                      checked={!!formData.family.wife}
                      onChange={(e) => handleSpouseToggle(e.target.checked)}
                      className="cursor-pointer accent-tactical-gold"
                    />
                    <label htmlFor="hasSpouseCheckbox" className="text-[10px] text-white font-bold uppercase tracking-wider cursor-pointer">
                      REGISTER SPOUSE / WIFE DECLARATION (IF APPLICABLE)
                    </label>
                  </div>

                  {formData.family.wife && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-army-green/20 pt-3 text-xs">
                      <div>
                        <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">WIFE FULL NAME</label>
                        <input 
                          type="text" 
                          required
                          value={formData.family.wife.name}
                          onChange={(e) => handleSpouseChange('name', e.target.value)}
                          className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">AGE (YEARS)</label>
                        <input 
                          type="number" 
                          value={formData.family.wife.age || ''}
                          onChange={(e) => handleSpouseChange('age', parseInt(e.target.value) || 0)}
                          className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">BLOOD GROUP</label>
                        <input 
                          type="text" 
                          value={formData.family.wife.bloodGroup}
                          onChange={(e) => handleSpouseChange('bloodGroup', e.target.value)}
                          className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">OCCUPATION</label>
                        <input 
                          type="text" 
                          value={formData.family.wife.occupation}
                          onChange={(e) => handleSpouseChange('occupation', e.target.value)}
                          className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">CONTACT NUMBER</label>
                        <input 
                          type="text" 
                          value={formData.family.wife.contact}
                          onChange={(e) => handleSpouseChange('contact', e.target.value)}
                          className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">WIFE PHOTO</label>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border border-army-green/45 bg-military-black/80 flex items-center justify-center overflow-hidden shrink-0">
                            {formData.family.wife.profilePicture ? (
                              <img 
                                src={formData.family.wife.profilePicture} 
                                alt="Wife" 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = ''; }}
                              />
                            ) : (
                              <span className="text-[9px] text-olive-drab">NO IMAGE</span>
                            )}
                          </div>
                          <div className="flex-grow space-y-2">
                            <div className="flex gap-2">
                              <label className="px-3 py-1 bg-army-green hover:bg-olive-drab border border-tactical-gold/30 text-[9px] font-bold text-tactical-khaki hover:text-tactical-gold rounded cursor-pointer transition-colors flex items-center gap-1">
                                <span>UPLOAD IMAGE</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => handleFamilyImageUpload('wife', e)}
                                  className="hidden"
                                />
                              </label>
                              {formData.family.wife.profilePicture && (
                                <button
                                  type="button"
                                  onClick={() => handleSpouseChange('profilePicture', '')}
                                  className="px-2 py-1 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-[9px] font-bold text-red-400 rounded transition-colors"
                                >
                                  REMOVE
                                </button>
                              )}
                            </div>
                            <input 
                              type="text" 
                              value={formData.family.wife.profilePicture || ''}
                              onChange={(e) => handleSpouseChange('profilePicture', e.target.value)}
                              placeholder="Or enter image URL here"
                              className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-[11px] text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">RESIDENTIAL ADDRESS</label>
                        <input 
                          type="text" 
                          value={formData.family.wife.address}
                          onChange={(e) => handleSpouseChange('address', e.target.value)}
                          className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Children Section */}
                <div className="col-span-1 md:col-span-2 p-4 bg-military-black/80 border border-army-green/35 rounded-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-army-green/20 pb-2">
                    <span className="text-[10px] text-tactical-gold font-bold uppercase tracking-wider">DEPENDENT CHILDREN REGISTER</span>
                    <button 
                      type="button" 
                      onClick={handleAddChild}
                      className="px-2.5 py-1 bg-tactical-gold/15 hover:bg-tactical-gold/35 border border-tactical-gold text-tactical-gold text-[9px] font-bold uppercase tracking-widest rounded cursor-pointer transition-colors"
                    >
                      + ADD CHILD NODE
                    </button>
                  </div>

                  {(!formData.family.children || formData.family.children.length === 0) ? (
                    <div className="text-center py-4 text-[10px] text-olive-drab italic uppercase">No children registered under this commission record</div>
                  ) : (
                    <div className="space-y-4">
                      {formData.family.children.map((child, idx) => (
                        <div key={idx} className="p-3 bg-army-dark/30 border border-army-green/30 rounded-lg space-y-3 text-xs relative">
                          <div className="flex justify-between items-center border-b border-army-green/10 pb-1 mb-2">
                            <span className="text-[9px] text-tactical-gold font-bold">CHILD NODE #{idx + 1} ({child.relation})</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveChild(idx)}
                              className="text-red-500 hover:text-red-400 font-bold text-[9px] uppercase cursor-pointer"
                            >
                              [ REMOVE CHILD ]
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">FULL NAME</label>
                              <input 
                                type="text" 
                                required
                                value={child.name}
                                onChange={(e) => handleChildChange(idx, 'name', e.target.value)}
                                className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">RELATION</label>
                              <select 
                                value={child.relation}
                                onChange={(e) => handleChildChange(idx, 'relation', e.target.value)}
                                className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none text-[11px]"
                              >
                                <option value="Son">SON</option>
                                <option value="Daughter">DAUGHTER</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">AGE (YEARS)</label>
                              <input 
                                type="number" 
                                value={child.age || ''}
                                onChange={(e) => handleChildChange(idx, 'age', parseInt(e.target.value) || 0)}
                                className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">BLOOD GROUP</label>
                              <input 
                                type="text" 
                                value={child.bloodGroup}
                                onChange={(e) => handleChildChange(idx, 'bloodGroup', e.target.value)}
                                className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">DATE OF BIRTH</label>
                              <input 
                                type="date" 
                                value={child.dob}
                                onChange={(e) => handleChildChange(idx, 'dob', e.target.value)}
                                className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none text-[10px]"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">SCHOOL / INSTITUTE</label>
                              <input 
                                type="text" 
                                value={child.school}
                                onChange={(e) => handleChildChange(idx, 'school', e.target.value)}
                                className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">CLASS / STUDY</label>
                              <input 
                                type="text" 
                                value={child.class}
                                onChange={(e) => handleChildChange(idx, 'class', e.target.value)}
                                className="w-full bg-military-black border border-army-green rounded px-3 py-1.5 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                               <label className="block text-[8px] text-olive-drab mb-1 uppercase font-bold">CHILD PHOTO</label>
                               <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full border border-army-green/45 bg-military-black/80 flex items-center justify-center overflow-hidden shrink-0">
                                   {child.profilePicture ? (
                                     <img 
                                       src={child.profilePicture} 
                                       alt="Child" 
                                       className="w-full h-full object-cover"
                                       onError={(e) => { e.target.src = ''; }}
                                     />
                                   ) : (
                                     <span className="text-[9px] text-olive-drab">NO IMAGE</span>
                                   )}
                                 </div>
                                 <div className="flex-grow space-y-1">
                                   <div className="flex gap-1.5">
                                     <label className="px-2 py-0.5 bg-army-green hover:bg-olive-drab border border-tactical-gold/30 text-[8px] font-bold text-tactical-khaki hover:text-tactical-gold rounded cursor-pointer transition-colors flex items-center gap-1">
                                       <span>UPLOAD</span>
                                       <input 
                                         type="file" 
                                         accept="image/*" 
                                         onChange={(e) => handleFamilyImageUpload(null, e, true, idx)}
                                         className="hidden"
                                       />
                                     </label>
                                     {child.profilePicture && (
                                       <button
                                         type="button"
                                         onClick={() => handleChildChange(idx, 'profilePicture', '')}
                                         className="px-1.5 py-0.5 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-[8px] font-bold text-red-400 rounded transition-colors"
                                       >
                                         REMOVE
                                       </button>
                                     )}
                                   </div>
                                   <input 
                                     type="text" 
                                     value={child.profilePicture || ''}
                                     onChange={(e) => handleChildChange(idx, 'profilePicture', e.target.value)}
                                     placeholder="Or URL here"
                                     className="w-full bg-military-black border border-army-green rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                                   />
                                 </div>
                               </div>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Form Wizard Navigation */}
          <div className="no-print border-t border-army-green/20 pt-4 flex justify-between gap-4 font-mono">
            {formStep > 1 ? (
              <button
                key="prev-btn"
                type="button"
                onClick={() => setFormStep(s => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2 bg-transparent hover:bg-army-green/25 border border-army-green text-xs font-bold text-tactical-khaki rounded cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} />
                <span>PREVIOUS SECTION</span>
              </button>
            ) : (
              <div key="prev-placeholder"></div>
            )}

            {formStep < 4 ? (
              <button
                key="next-btn"
                type="button"
                onClick={() => setFormStep(s => s + 1)}
                className="flex items-center gap-1.5 px-4 py-2 bg-tactical-gold/20 hover:bg-tactical-gold/30 border border-tactical-gold text-xs font-bold text-tactical-gold rounded cursor-pointer transition-colors ml-auto"
              >
                <span>NEXT SECTION</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                key="submit-btn"
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-6 py-2 bg-tactical-gold hover:bg-amber-600 text-military-black text-xs font-bold uppercase tracking-widest rounded cursor-pointer transition-colors ml-auto shadow-lg hover:shadow-tactical-gold/20"
              >
                {loading ? "COMMISSIONING..." : "COMMISSION CADET"}
              </button>
            )}
          </div>

        </form>
      )}

    </div>
  );
}
