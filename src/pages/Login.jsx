import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, Radio, Mail, Terminal, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP flow state
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState(''); // To display simulated OTP to user

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsOtpStep(true);
        setDispatchedOtp(data.otp); // Visual feedback for simulated SMS/Email OTP code
      } else {
        setError(data.message || 'Access Denied. Invalid credentials.');
      }
    } catch (err) {
      setError('Connection to secure server failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp: otpCode })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(data.token, data.username);
      } else {
        setError(data.message || 'OTP Verification Failed.');
      }
    } catch (err) {
      setError('Connection to authentication server lost.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-military-black flex flex-col items-center justify-center p-4 relative overflow-hidden military-grid font-mono">
      
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-army-green/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Main Terminal Frame */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-glass-bg border border-tactical-gold/40 rounded-lg shadow-2xl p-6 relative z-20 overflow-hidden backdrop-blur-md"
      >
        {/* Red blinking CRT line */}
        <div className="absolute w-full h-[2px] bg-red-600/30 top-0 left-0 animate-scanline"></div>

        {/* Visual Military Header */}
        <div className="flex flex-col items-center mb-6 border-b border-tactical-gold/25 pb-4 text-center">
          <img 
            src="/army-logo.png" 
            alt="Join Indian Army" 
            className="w-full max-w-[280px] object-contain mb-3 filter drop-shadow-[0_0_6px_rgba(212,175,55,0.3)]"
          />
          <h1 className="text-[13px] font-bold text-white tracking-widest uppercase">PERSONNEL MANAGEMENT PORTAL</h1>
          <p className="text-[9px] text-olive-drab tracking-widest mt-1">SECURE ADMINISTRATIVE TERMINAL V1.0</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded text-red-400 text-xs flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isOtpStep ? (
            /* STEP 1: CREDENTIALS ENTRY */
            <motion.form 
              key="credentials-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleCredentialsSubmit}
              className="space-y-4 text-xs text-tactical-khaki"
            >
              <div>
                <label className="block text-[10px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">ADMIN SECURITY HANDLE</label>
                <div className="relative">
                  <Terminal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-olive-drab" />
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. indianarmy_admin"
                    className="w-full bg-military-black border border-army-green/50 focus:border-tactical-gold rounded px-3 py-2.5 pl-9 text-white placeholder-army-green/60 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">CRYPTOGRAPHIC KEY (PASSWORD)</label>
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-olive-drab" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter military password"
                    className="w-full bg-military-black border border-army-green/50 focus:border-tactical-gold rounded px-3 py-2.5 pl-9 pr-10 text-white placeholder-army-green/60 focus:outline-none transition-colors"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-drab hover:text-tactical-gold transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-olive-drab leading-normal bg-army-dark/30 border border-army-green/20 p-2.5 rounded">
                <span className="font-bold text-tactical-gold">DEMO ACCOUNT:</span>
                <div className="mt-1">Username: <strong className="text-tactical-khaki">indianarmy_admin</strong></div>
                <div>Password: <strong className="text-tactical-khaki">SenaMedal@2026</strong></div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 bg-tactical-gold hover:bg-amber-600 text-military-black font-bold uppercase tracking-widest rounded transition-colors shadow-lg hover:shadow-tactical-gold/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "AUTHENTICATING..." : "REQUEST SECURE CONNECTION"}
              </button>
            </motion.form>
          ) : (
            /* STEP 2: TWO-FACTOR OTP ENTRY */
            <motion.form 
              key="otp-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleOtpVerify}
              className="space-y-4 text-xs text-tactical-khaki"
            >
              <div className="text-center p-3 bg-army-dark/40 border border-army-green/30 rounded">
                <Radio size={20} className="mx-auto text-tactical-gold animate-pulse mb-1" />
                <p className="text-[10px] text-olive-drab uppercase font-bold">Two-Factor OTP Security Challenge</p>
                <p className="text-[9px] text-tactical-khaki mt-1">A secure verification code was sent to your administration terminal console.</p>
              </div>

              {/* Secure simulated SMS display */}
              <div className="border border-tactical-orange/40 bg-tactical-orange/5 p-3 rounded font-mono text-[11px] leading-relaxed relative">
                <div className="absolute top-[-9px] left-3 bg-military-black border border-tactical-orange/40 text-tactical-orange text-[8px] font-bold px-1.5 py-0.5 rounded tracking-widest uppercase">
                  SIMULATED SECURE DISPATCH
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-tactical-orange font-bold">
                  <Mail size={12} />
                  <span>DISPATCH CODE FROM INDIAN ARMY HQ:</span>
                </div>
                <div className="text-white text-xs mt-1.5 select-all">
                  Your OTP for Indian Army Personnel Access is: <strong className="text-tactical-gold text-sm tracking-wider font-bold bg-military-black/80 px-2 py-0.5 border border-tactical-gold/20 rounded">{dispatchedOtp}</strong> (Valid for 5m)
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-olive-drab font-bold uppercase tracking-wider mb-1.5">ENTER 6-DIGIT SECURITY CODE</label>
                <div className="relative">
                  <Terminal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-olive-drab" />
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-military-black border border-army-green/50 focus:border-tactical-gold rounded px-3 py-2.5 pl-9 text-center text-sm font-bold text-white tracking-widest focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsOtpStep(false)}
                  className="flex-1 py-2 bg-transparent hover:bg-army-green/20 border border-army-green text-olive-drab font-bold uppercase tracking-widest rounded transition-colors text-[10px] cursor-pointer"
                >
                  BACK TO LOGIN
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2 bg-tactical-gold hover:bg-amber-600 text-military-black font-bold uppercase tracking-widest rounded transition-colors shadow-lg hover:shadow-tactical-gold/20 flex items-center justify-center gap-1.5 cursor-pointer text-[10px]"
                >
                  <Send size={12} />
                  <span>{loading ? "VERIFYING..." : "VERIFY SECURITY"}</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 text-[8px] text-olive-drab text-center border-t border-army-green/10 pt-3 uppercase">
          WARNING: Unauthorised access is strictly prohibited and subject to civil/military prosecution under national defense laws.
        </div>
      </motion.div>
    </div>
  );
}
