'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, DollarSign, CheckCircle2, Sparkles } from 'lucide-react';
import { useProfileStore } from '@/lib/store/profileStore';
import { formatBDT } from '@/lib/utils/currency';

interface SetSalaryModalProps {
  currentSalary: number;
  onClose: () => void;
}

export default function SetSalaryModal({ currentSalary, onClose }: SetSalaryModalProps) {
  const { updateProfile } = useProfileStore();
  const [salary, setSalary] = useState(String(currentSalary || '50000'));
  const [saving, setSaving] = useState(false);

  const presets = ['30000', '50000', '75000', '80000', '100000'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(salary);
    if (isNaN(num) || num < 0) return;

    setSaving(true);
    await updateProfile({ monthly_salary: num });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bottom-sheet-backdrop p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="w-full max-w-md bg-[#11131C] border-t sm:border border-[#262B3D] rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl overflow-hidden"
      >
        {/* Pull handle */}
        <div className="pt-1 pb-2 flex justify-center cursor-grab sm:hidden">
          <div className="w-10 h-1.5 rounded-full bg-[#2C3144]" />
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-[#1E2333]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
              ৳
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight">Set Monthly Income</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#1A1D2A] border border-[#272D40]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-3 space-y-4">
          <p className="text-[11px] text-slate-400">
            Enter your monthly take-home salary. Your runway, daily burn limits, and savings projections will calculate automatically from this.
          </p>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Quick Select
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {presets.map((p) => {
                const val = parseInt(p);
                const isSelected = salary === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSalary(p)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-[#07080C] shadow-sm'
                        : 'bg-[#181B26] border border-[#262C3E] text-slate-300 hover:text-white'
                    }`}
                  >
                    ৳{val / 1000}k
                  </button>
                );
              })}
            </div>
          </div>

          {/* Large Hero Amount Input */}
          <div className="space-y-1">
            <label htmlFor="monthly-salary-input" className="text-[11px] font-semibold text-slate-300 block">
              Monthly Salary (BDT)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-emerald-400">৳</span>
              <input
                id="monthly-salary-input"
                type="number"
                min="0"
                step="500"
                required
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="50000"
                className="w-full bg-[#0E1018] border border-[#262C3E] rounded-2xl pl-9 pr-4 py-3 text-xl font-black text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#262C3E] text-slate-400 font-semibold text-xs hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07080C] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Monthly Income'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
