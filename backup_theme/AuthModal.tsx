
import React, { useState } from 'react';
import { X, Loader2, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { signIn, signUp } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
        onClose();
      } else {
        const { data, error: signUpError } = await signUp(email, password, fullName);
        if (signUpError) throw signUpError;
        
        // If Supabase is configured for email confirmation, the user isn't logged in yet
        if (data.user && data.session === null) {
          setSuccess(true);
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={(e) => { e.stopPropagation(); onClose(); }} />
        <div className="relative bg-white w-full max-w-[440px] rounded-[2rem] shadow-2xl overflow-hidden p-12 text-center animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-green-500" size={40} />
            </div>
          </div>
          <h2 className="text-3xl font-display font-bold text-zinc-900 mb-4">Check Your Inbox</h2>
          <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
            We've sent a verification link to <span className="font-bold text-zinc-900">{email}</span>. 
            Please confirm your email to activate your account and access Denivo.
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all uppercase tracking-widest text-xs"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md transition-all duration-500" onClick={(e) => { e.stopPropagation(); onClose(); }} />
      <div className="relative bg-white w-full max-w-[440px] rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden animate-in fade-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        
        <div className="h-2 bg-gradient-to-r from-zinc-100 via-zinc-900 to-zinc-100" />
        
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-all text-zinc-400 hover:text-zinc-900 z-10"
        >
          <X size={20} />
        </button>

        <div className="p-10 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-display font-bold text-zinc-900 mb-3 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px] mx-auto">
              {isLogin 
                ? 'Sign in to access your curated wardrobe and orders.' 
                : 'Join Denivo to discover personalized luxury and style advice.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="space-y-5">
            {!isLogin && (
              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="E.g. Alexander McQueen"
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-200 transition-all placeholder:text-zinc-300"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-200 transition-all placeholder:text-zinc-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-200 transition-all placeholder:text-zinc-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-red-500 text-[11px] font-medium text-center leading-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center space-x-3 disabled:opacity-70 group mt-4 shadow-xl shadow-zinc-900/10 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="uppercase tracking-[0.1em] text-xs">{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors font-semibold uppercase tracking-widest"
            >
              {isLogin ? "New to Denivo? Create account" : "Have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
