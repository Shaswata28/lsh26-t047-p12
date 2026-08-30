'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    setSuccess('');

    const supabase = createClient();

    if (mode === 'signup') {
      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });

      if (authError) {
        setError(authError.message);
      } else {
        if (signUpData?.session) {
          // Immediately redirect new user to the welcome setup screen
          router.push('/welcome');
        } else {
          // Try signing in directly if email confirmation is disabled
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (!signInErr && signInData?.session) {
            router.push('/welcome');
          } else {
            setSuccess('Account created successfully! Please sign in.');
            setMode('signin');
          }
        }
      }
    } else {
      const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(
          authError.message === 'Invalid login credentials'
            ? 'Incorrect email or password. Tap "Create Account" if you are new.'
            : authError.message
        );
      } else {
        // Check if user has completed profile setup
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, monthly_salary')
          .eq('user_id', signInData.user.id)
          .single();

        if (!profile?.name || !profile?.monthly_salary) {
          router.push('/welcome');
        } else {
          router.push('/dashboard');
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#07080C] text-[#F3F4F6] flex justify-center selection:bg-emerald-500/30">
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between bg-[#0B0C12] border-x border-[#1C2030]/60 p-5 safe-top safe-bottom">
        
        {/* Brand Header */}
        <div className="pt-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1.5px] mx-auto shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0B0C12] rounded-[14px] flex items-center justify-center">
              <span className="text-2xl font-black text-emerald-400">৳</span>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Personal Ledger</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Smart monthly cash flow & savings for Dhaka
            </p>
          </div>
        </div>

        {/* Auth Box */}
        <div className="mobile-card p-5 space-y-4 shadow-xl my-auto">
          {/* Segmented Mode Switcher */}
          <div className="flex bg-[#0A0C12] p-1 rounded-2xl border border-[#1E2333]">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'signin'
                  ? 'bg-emerald-500 text-[#07080C] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-emerald-500 text-[#07080C] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder={mode === 'signup' ? 'Create a secure password' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs leading-relaxed">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs leading-relaxed">
                {success}
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#07080C] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Ledger Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center pb-4 text-[11px] text-slate-500">
          <span>Private, encrypted personal finance ledger</span>
        </div>
      </div>
    </div>
  );
}
