'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Target, TrendingUp } from 'lucide-react';
import { usePocketStore } from '@/lib/store/pocketStore';
import { useExpenseStore } from '@/lib/store/expenseStore';
import { useProfileStore } from '@/lib/store/profileStore';
import { computeForecast } from '@/lib/engine/forecast';
import { getDPSInsightText, DPS_RATE_DISPLAY } from '@/lib/engine/dps';

interface CreatePocketModalProps {
  onClose: () => void;
}

export default function CreatePocketModal({ onClose }: CreatePocketModalProps) {
  const { addPocket } = usePocketStore();
  const { expenses } = useExpenseStore();
  const { profile } = useProfileStore();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    target_amount: '',
    item_details: '',
    monthly_contribution: '',
  });

  const salary = profile?.monthly_salary ?? 50000;
  const forecast = computeForecast(expenses, salary);
  const forecastSurplus = forecast.forecastBalance > 0 ? forecast.forecastBalance : salary;

  const targetNum = parseFloat(form.target_amount) || 0;
  const contribNum = parseFloat(form.monthly_contribution) || 0;

  // Live dynamic DPS insight calculation
  const dpsPreview = targetNum > 0 && contribNum > 0
    ? getDPSInsightText(targetNum, 0, contribNum, forecastSurplus)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || targetNum <= 0 || contribNum <= 0) return;

    setSaving(true);
    await addPocket({
      name: form.name.trim(),
      target_amount: targetNum,
      item_details: form.item_details.trim() || undefined,
      monthly_contribution: contribNum,
    });
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
        className="w-full max-w-md bg-[#11131C] border-t sm:border border-[#262B3D] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="pt-2.5 pb-1 flex justify-center cursor-grab sm:hidden">
          <div className="w-10 h-1.5 rounded-full bg-[#2C3144]" />
        </div>

        <div className="px-4 py-3 border-b border-[#1E2333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Create Savings Pocket</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#1A1D2A] border border-[#272D40]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto">
          {/* Goal Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Pocket Goal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Laptop, Wedding, Bike, Deposit"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Item Details */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Item Details & Specs (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. MacBook Air M4 16GB, Honda Livo CBS"
              value={form.item_details}
              onChange={(e) => setForm({ ...form, item_details: e.target.value })}
              className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Target Amount */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Target Cost (BDT)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-400">৳</span>
              <input
                type="number"
                required
                min="1"
                placeholder="150000"
                value={form.target_amount}
                onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl pl-8 pr-3 py-2.5 text-sm font-extrabold text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Monthly Contribution */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Monthly Planned Contribution (BDT)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-400">৳</span>
              <input
                type="number"
                required
                min="1"
                placeholder="10000"
                value={form.monthly_contribution}
                onChange={(e) => setForm({ ...form, monthly_contribution: e.target.value })}
                className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl pl-8 pr-3 py-2.5 text-sm font-extrabold text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Live DPS Suggestion Insight Box */}
          {dpsPreview && dpsPreview.months && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-[#0B1416] border border-emerald-500/30 space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{DPS_RATE_DISPLAY} Opportunity Insight</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {dpsPreview.detail}
              </p>
            </motion.div>
          )}

          <div className="flex gap-2 pt-2">
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
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Goal'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
