import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ArrowRight, AlertCircle, ShoppingBag, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose, pendingActionText }) {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot-password'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { login, register, resetPassword, signInWithGoogle } = useAuth();

  // Form States
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    fullName: '', email: '', phone: '', password: '', confirmPassword: '' 
  });
  const [forgotEmail, setForgotEmail] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    // Reset states on close
    setError('');
    setSuccessMsg('');
    setView('login');
    onClose();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      setView('success');
      setSuccessMsg('Login successful!');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
      setView('success');
      setSuccessMsg('Google sign-in successful!');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (registerForm.password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      return setError('Passwords do not match.');
    }
    
    setLoading(true);
    try {
      await register(registerForm.email, registerForm.password, registerForm.fullName, registerForm.phone);
      setView('success');
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await resetPassword(forgotEmail);
      setSuccessMsg('Password reset email sent! Check your inbox.');
      setForgotEmail('');
    } catch (err) {
      setError(getFirebaseErrorMessage(err.code) || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const getFirebaseErrorMessage = (code) => {
    switch (code) {
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password.';
      case 'auth/email-already-in-use': return 'Email is already registered.';
      case 'auth/weak-password': return 'Password is too weak.';
      case 'auth/invalid-email': return 'Invalid email format.';
      case 'auth/network-request-failed': return 'Network error. Please try again.';
      default: return null;
    }
  };

  const handleError = (err) => {
    console.error("Firebase Auth Error:", err);
    return getFirebaseErrorMessage(err.code) || `Error: ${err.message}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[450px] overflow-hidden relative animate-fade-in-up border border-slate-100 max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-accent-400" />
            <span className="font-heading font-bold text-base">
              {view === 'login' && 'Sign In'}
              {view === 'register' && 'Create Account'}
              {view === 'forgot-password' && 'Reset Password'}
              {view === 'success' && 'Success'}
            </span>
          </div>
          <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto">
          
          {/* Friendly Interruption Message */}
          {pendingActionText && view === 'login' && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Lock size={20} className="text-orange-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 font-medium leading-snug">
                Please sign in to continue with your purchase.<br/>
                <span className="text-xs text-slate-500 font-normal mt-1 block">Your selected items and preferences are saved.</span>
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {successMsg && view !== 'success' && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SUCCESS VIEW */}
          {view === 'success' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-5 animate-fade-in-up">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <div className="animate-ping absolute w-20 h-20 bg-emerald-400 rounded-full opacity-20"></div>
                <Check size={40} className="text-emerald-500 relative z-10 animate-[bounce_1s_ease-in-out_infinite]" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-4">{successMsg}</h3>
              <p className="text-slate-500 text-sm font-medium">Please wait while we redirect you...</p>
            </div>
          )}

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="email" required
                    className="w-full bg-slate-50 border border-slate-300 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20"
                    placeholder="you@example.com"
                    value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                  <button type="button" onClick={() => setView('forgot-password')} className="text-xs text-primary-600 hover:text-primary-800 hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="password" required
                    className="w-full bg-slate-50 border border-slate-300 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20"
                    placeholder="••••••••"
                    value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  />
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={16} />
              </button>

              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">OR</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <button 
                type="button" 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold py-3 rounded-xl transition-all shadow-sm text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="text-center mt-6">
                <span className="text-sm text-slate-500">New to Mirror Solar Store? </span>
                <button type="button" onClick={() => setView('register')} className="text-sm font-bold text-accent-600 hover:text-accent-700 hover:underline">Create Account</button>
              </div>
            </form>
          )}

          {/* REGISTER VIEW */}
          {view === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" required
                    className="w-full bg-slate-50 border border-slate-300 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20"
                    placeholder="John Doe"
                    value={registerForm.fullName} onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="email" required
                    className="w-full bg-slate-50 border border-slate-300 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20"
                    placeholder="you@example.com"
                    value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="tel" required
                    className="w-full bg-slate-50 border border-slate-300 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20"
                    placeholder="10-digit number"
                    value={registerForm.phone} onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                  <input 
                    type="password" required minLength="8"
                    className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent-500"
                    placeholder="Min 8 chars"
                    value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Confirm</label>
                  <input 
                    type="password" required
                    className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent-500"
                    placeholder="Repeat password"
                    value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">OR</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <button 
                type="button" 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold py-3 rounded-xl transition-all shadow-sm text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="text-center mt-4">
                <span className="text-sm text-slate-500">Already have an account? </span>
                <button type="button" onClick={() => setView('login')} className="text-sm font-bold text-slate-900 hover:underline">Sign In</button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot-password' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-sm text-slate-600 mb-2">Enter your email address and we'll send you a link to reset your password.</p>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="email" required
                    className="w-full bg-slate-50 border border-slate-300 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-accent-500"
                    placeholder="you@example.com"
                    value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm text-sm mt-2 disabled:opacity-70">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center mt-4">
                <button type="button" onClick={() => setView('login')} className="text-sm font-bold text-slate-900 hover:underline">Back to Sign In</button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
