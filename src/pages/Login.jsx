import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Radio, Mail, Terminal, Send, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, googleProvider } from '../firebase';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';

const SSO_REDIRECT_FLAG = 'ia-google-sso-pending';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Only show redirect-pending loading screen when we KNOW a redirect was triggered
  const wasRedirecting = sessionStorage.getItem(SSO_REDIRECT_FLAG) === 'true';
  const [redirectPending, setRedirectPending] = useState(wasRedirecting);

  // OTP flow state
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState('');
  const [tempToken, setTempToken] = useState('');

  useEffect(() => {
    // Only run redirect result check if we came back from a Google SSO redirect
    if (!wasRedirecting) return;

    const handleRedirectAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        sessionStorage.removeItem(SSO_REDIRECT_FLAG); // Clear flag regardless of outcome

        if (result && result.user) {
          setLoading(true);
          const user = result.user;
          if (!user.email) {
            throw new Error('Could not retrieve email address from your Google Account.');
          }

          const response = await fetch('/api/auth/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, name: user.displayName })
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setUsername(user.email);
            setDispatchedOtp(data.otp !== 'DISPATCHED' ? data.otp : '');
            setTempToken(data.tempToken);
            setIsOtpStep(true);
          } else {
            setError(data.message || 'Access Denied. Google Authentication failed.');
          }
        } else {
          // No redirect result found — Google sign-in may have been cancelled
          setError('Google sign-in was not completed. Please try again.');
        }
      } catch (err) {
        console.error('Firebase Redirect Result Error:', err);
        sessionStorage.removeItem(SSO_REDIRECT_FLAG);
        setError(err.message || 'Google Authentication failed. Please try again.');
      } finally {
        setLoading(false);
        setRedirectPending(false);
      }
    };

    handleRedirectAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        setDispatchedOtp(data.otp);
        setTempToken(data.tempToken);
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
        body: JSON.stringify({ username, otp: otpCode, tempToken })
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

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Set flag so on redirect-back, we know to call getRedirectResult
      sessionStorage.setItem(SSO_REDIRECT_FLAG, 'true');
      await signInWithRedirect(auth, googleProvider);
      // Browser navigates away — code below never runs
    } catch (err) {
      console.error('Firebase Sign-In Error:', err);
      sessionStorage.removeItem(SSO_REDIRECT_FLAG);
      setError(err.message || 'Google Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  // Show full-page loading screen ONLY when coming back from Google redirect
  if (redirectPending) {
    return (
      <div className="min-h-screen bg-military-black flex flex-col items-center justify-center p-4 font-mono">
        <div className="flex flex-col items-center gap-4 text-tactical-gold">
          <Loader size={32} className="animate-spin" />
          <p className="text-sm tracking-widest uppercase">Verifying Google Credentials...</p>
          <p className="text-[10px] text-olive-drab">Please wait. Establishing secure channel.</p>
          <button
            onClick={() => {
              sessionStorage.removeItem(SSO_REDIRECT_FLAG);
              setRedirectPending(false);
            }}
            className="mt-4 text-[9px] text-olive-drab underline hover:text-tactical-gold transition-colors"
          >
            Cancel and return to login
          </button>
        </div>
      </div>
    );
  }

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
                {loading ? 'AUTHENTICATING...' : 'REQUEST SECURE CONNECTION'}
              </button>

              <div className="relative flex items-center justify-center my-4 uppercase tracking-widest text-[9px] text-olive-drab select-none">
                <span className="absolute left-0 w-1/4 border-t border-army-green/35"></span>
                <span>SECURE SINGLE SIGN-ON</span>
                <span className="absolute right-0 w-1/4 border-t border-army-green/35"></span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 border border-tactical-gold/40 hover:border-tactical-gold bg-army-dark/45 hover:bg-army-green/15 text-tactical-gold font-bold uppercase tracking-widest rounded transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(212,175,55,0.05)] text-[10px]"
              >
                {loading ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.377-2.87-6.377-6.38 0-3.51 2.87-6.377 6.377-6.377 1.637 0 3.125.617 4.269 1.625L18.29 4.31C16.63 2.76 14.505 1.8 12.24 1.8 6.605 1.8 2 6.405 2 12.04c0 5.635 4.605 10.24 10.24 10.24 5.8 0 10.24-4.11 10.24-10.24 0-.685-.06-1.355-.18-1.996h-10.06z" />
                  </svg>
                )}
                <span>{loading ? 'REDIRECTING TO GOOGLE...' : 'SIGN IN WITH GOOGLE SSO'}</span>
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
                <p className="text-[9px] text-tactical-khaki mt-1">
                  {username && username.includes('@') 
                    ? `A secure 6-digit cryptographic code has been dispatched to your Gmail address: ${username}`
                    : 'A secure verification code was sent to your administration terminal console.'}
                </p>
              </div>

              {/* Secure simulated OTP display */}
              {dispatchedOtp ? (
                <div className="border border-tactical-orange/40 bg-tactical-orange/5 p-3 rounded font-mono text-[11px] leading-relaxed relative">
                  <div className="absolute top-[-9px] left-3 bg-military-black border border-tactical-orange/40 text-tactical-orange text-[8px] font-bold px-1.5 py-0.5 rounded tracking-widest uppercase">
                    SIMULATED SECURE DISPATCH
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-tactical-orange font-bold">
                    <Mail size={12} />
                    <span>DISPATCH CODE FROM INDIAN ARMY HQ:</span>
                  </div>
                  <div className="text-white text-xs mt-1.5 select-all">
                    Your OTP is: <strong className="text-tactical-gold text-sm tracking-wider font-bold bg-military-black/80 px-2 py-0.5 border border-tactical-gold/20 rounded">{dispatchedOtp}</strong> (Valid for 5m)
                  </div>
                </div>
              ) : (
                <div className="border border-army-green/30 bg-army-dark/30 p-3 rounded text-[11px] text-olive-drab text-center">
                  <Mail size={14} className="mx-auto mb-1 text-tactical-gold" />
                  OTP has been sent to your registered email address.
                </div>
              )}

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
                  onClick={() => { setIsOtpStep(false); setError(''); setOtpCode(''); }}
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
                  <span>{loading ? 'VERIFYING...' : 'VERIFY SECURITY'}</span>
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
