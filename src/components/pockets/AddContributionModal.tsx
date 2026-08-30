'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, PiggyBank, Calendar } from 'lucide-react';
import { usePocketStore } from '@/lib/store/pocketStore';
import { type Pocket } from '@/types';
import { todayStr } from '@/lib/utils/date';
import { formatBDT } from '@/lib/utils/currency';

interface AddContributionModalProps {
  pocket: Pocket;
  onClose: () => void;
}

export default function AddContributionModal({ pocket, onClose }: AddContributionModalProps) {
  const { addContribution } = usePocketStore();
  const [amount, setAmount] = useState(String(pocket.monthly_contribution));
  const [date, setDate] = useState(todayStr());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) return;

    setSaving(true);
    await addContribution(pocket.id, numAmount, date, notes.trim() || undefined);
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
        <div className="pt-1 pb-2 flex justify-center cursor-grab sm:hidden">
          <div className="w-10 h-1.5 rounded-full bg-[#2C3144]" />
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-[#1E2333]">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Deposit to Pocket</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#1A1D2A] border border-[#272D40]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-2.5 px-3 rounded-2xl bg-[#090A0F] border border-[#1E2333] my-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Goal</span>
            <span className="text-xs font-bold text-white">{pocket.name}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Currently Saved</span>
            <span className="text-xs font-bold text-emerald-400">{formatBDT(pocket.saved_amount)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">Contribution Amount (৳)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-400">৳</span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0E1018] border border-[#262C3E] rounded-2xl pl-9 pr-4 py-2.5 text-lg font-black text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 block">Notes</label>
            <input
              type="text"
              placeholder="e.g. March salary surplus allocation"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

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
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Deposit'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
