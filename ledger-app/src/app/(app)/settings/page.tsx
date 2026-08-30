'use client';

import { useEffect, useState } from 'react';
import { useProfileStore } from '@/lib/store/profileStore';
import { createClient } from '@/lib/supabase/client';
import { User, Save, Loader2, CheckCircle2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, fetchProfile, updateProfile } = useProfileStore();

  const [name, setName] = useState('');
  const [salary, setSalary] = useState('50000');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    fetchProfile();
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };
    getUser();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setSalary(String(profile.monthly_salary || '50000'));
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      name: name.trim(),
      monthly_salary: parseFloat(salary) || 0,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="px-1">
        <h1 className="text-lg font-bold text-white tracking-tight">Your Profile</h1>
        <p className="text-[11px] text-slate-400">Account settings and monthly salary</p>
      </div>

      {/* User Info Capsule */}
      <div className="p-3.5 rounded-2xl bg-[#131622] border border-[#23283B] flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-[#07080C] font-black text-sm flex items-center justify-center shadow-md">
          {name ? name.slice(0, 2).toUpperCase() : 'PL'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{name || 'Salaried Professional'}</p>
          <p className="text-[11px] text-slate-400 truncate">{userEmail || 'Account active'}</p>
        </div>
      </div>

      {/* Profile & Salary Form */}
      <div className="mobile-card p-4 space-y-3.5">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Profile & Salary Parameters
        </h2>

        <form onSubmit={handleSave} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">Your Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahim Uddin"
                className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-semibold text-slate-300">Monthly Net Salary (BDT)</label>
              <div className="flex gap-1">
                {['30000', '50000', '80000'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSalary(preset)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C2030] text-emerald-400 border border-[#282F48] hover:bg-[#252A40]"
                  >
                    ৳{parseInt(preset) / 1000}k
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-400">৳</span>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="50000"
                className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl pl-8 pr-3 py-2.5 text-sm font-extrabold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              The forecast engine computes your surplus or shortfall against this number.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-[#07080C] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#07080C]" />
                <span>Saved Successfully</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Logout Action Button */}
      <div className="pt-2">
        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/15 active:bg-rose-500/20 border border-rose-500/25 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          {loggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              <span>Log Out of Account</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
