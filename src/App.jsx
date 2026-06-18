import React, { useState, useEffect } from 'react';
import SecurityBanner from './components/SecurityBanner';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RecordViewer from './pages/RecordViewer';
import AuditLogs from './components/AuditLogs';
import { mockPersonnelData } from './mockData';
import CommissionPanel from './pages/CommissionPanel';

export default function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('ia-token') || null);
  const [operatorName, setOperatorName] = useState(localStorage.getItem('ia-operator') || null);
  
  // Navigation: 'dashboard' | 'search' | 'audit'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Personnel Search states
  const [searchedNumber, setSearchedNumber] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ia-recent-searches')) || [];
    } catch {
      return [];
    }
  });

  // Theme states
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('ia-dark-mode') === 'true' || true;
  });

  // DB Backup simulation state
  const [dbData, setDbData] = useState(mockPersonnelData);
  
  // Security audit log state
  const [auditLogs, setAuditLogs] = useState([]);
  const [notification, setNotification] = useState(null);

  // Apply dark mode theme class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#080a08';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f4f3ec';
    }
    localStorage.setItem('ia-dark-mode', darkMode);
  }, [darkMode]);

  // Sync recent searches with localStorage
  useEffect(() => {
    localStorage.setItem('ia-recent-searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Fetch security audit logs from backend
  const fetchAuditLogs = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/audit/logs', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuditLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to load audit registry:", err);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchAuditLogs();
      // Poll audit logs every 10 seconds for real-time security alerts (simulated feed)
      const interval = setInterval(fetchAuditLogs, 10000);
      return () => clearInterval(interval);
    }
  }, [authToken]);

  // Trigger brief visual alerts on tactical terminal
  const showTacticalAlert = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLoginSuccess = (token, username) => {
    setAuthToken(token);
    setOperatorName(username);
    localStorage.setItem('ia-token', token);
    localStorage.setItem('ia-operator', username);
    showTacticalAlert("TERMINAL ACCESS GRANTED. LEVEL 5 SHIELD IS ENGAGED.");
  };

  const handleLogout = async () => {
    // Audit log logout action
    if (authToken) {
      try {
        await fetch('/api/audit/log', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            operator: operatorName,
            action: "User Session Terminated",
            details: "Operator initiated terminal logout sequence."
          })
        });
      } catch (e) {}
    }
    
    setAuthToken(null);
    setOperatorName(null);
    localStorage.removeItem('ia-token');
    localStorage.removeItem('ia-operator');
    setActiveTab('dashboard');
    setSearchedNumber('');
  };

  // Redirect to personnel records tab
  const handleSearchTrigger = (armyNumber) => {
    setSearchedNumber(armyNumber);
    setActiveTab('search');
  };

  // Database restoration
  const handleImportDb = (newData) => {
    setDbData(newData);
    showTacticalAlert("FORCE DATABASE BACKUP RESTORED SUCCESSFULLY.");
  };

  // Login screen if session token is missing
  if (!authToken) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans ${darkMode ? 'text-tactical-khaki bg-military-black' : 'text-army-dark bg-[#f8f7f0]'}`}>
      
      {/* Top Classification Banner */}
      <SecurityBanner />

      {/* Main Framework Dashboard Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          recentSearches={recentSearches}
          onHistoryClick={handleSearchTrigger}
          onLogout={handleLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          dbData={dbData}
          onImportDb={handleImportDb}
        />

        {/* Dashboard Panels */}
        <main className="flex-grow p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full relative">
          
          {/* Tactical Notification Banner */}
          {notification && (
            <div className="no-print fixed bottom-4 right-4 bg-tactical-gold border-2 border-military-black text-military-black text-xs font-bold font-mono px-4 py-2.5 rounded shadow-2xl z-50 flex items-center gap-2 animate-bounce">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
              <span>{notification}</span>
            </div>
          )}

          {/* Router Views */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              onSearchTrigger={handleSearchTrigger} 
              setActiveTab={setActiveTab} 
              authToken={authToken}
            />
          )}

          {activeTab === 'search' && (
            <RecordViewer 
              searchedNumber={searchedNumber}
              setSearchedNumber={setSearchedNumber}
              recentSearches={recentSearches}
              setRecentSearches={setRecentSearches}
              authToken={authToken}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogs 
              logs={auditLogs} 
              onRefresh={fetchAuditLogs} 
            />
          )}

          {activeTab === 'commission' && (
            <CommissionPanel 
              authToken={authToken} 
              onOnboardSuccess={(newArmyNumber) => {
                setActiveTab('search');
                setSearchedNumber(newArmyNumber);
                fetchAuditLogs();
              }}
            />
          )}

        </main>
      </div>
    </div>
  );
}
