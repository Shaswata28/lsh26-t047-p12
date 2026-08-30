'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Save, Target, TrendingUp, Info } from 'lucide-react';
import { usePocketStore } from '@/lib/store/pocketStore';
import { type Pocket } from '@/types';
import { calculateDPS, DPS_RATE_DISPLAY, pocketCompletionMonths, DPS_COMPOUNDING, getDPSInsightText } from '@/lib/engine/dps';
import { formatBDT } from '@/lib/utils/currency';

interface PocketDetailModalProps {
  pocket: Pocket;
  forecastSurplus: number;
  onClose: () => void;
}

export default function PocketDetailModal({ pocket, forecastSurplus, onClose }: PocketDetailModalProps) {
  const { updatePocket } = usePocketStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: pocket.name,
    target_amount: String(pocket.target_amount),
    item_details: pocket.item_details ?? '',
    monthly_contribution: String(pocket.monthly_contribution),
  });

  const target = parseFloat(form.target_amount) || 0;
  const contrib = parseFloat(form.monthly_contribution) || 0;

  const months = pocketCompletionMonths(
    target,
    pocket.saved_amount,
    contrib,
    forecastSurplus
  );

  const effectiveContrib = Math.min(contrib, Math.max(forecastSurplus, 0));
  const dpsRows = months && months > 0 ? calculateDPS(effectiveContrib, Math.min(months, 24)) : [];
  const dpsInsight = getDPSInsightText(target, pocket.saved_amount, contrib, forecastSurplus);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || target <= 0 || contrib <= 0) return;

    setSaving(true);
    await updatePocket(pocket.id, {
      name: form.name.trim(),
      target_amount: target,
      item_details: form.item_details.trim() || undefined,
      monthly_contribution: contrib,
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
            <h2 className="text-sm font-bold text-white tracking-tight">Pocket Details & DPS Simulation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#1A1D2A] border border-[#272D40]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-3.5 overflow-y-auto">
          {/* Inputs Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1 col-span-2">
              <label className="text-[11px] font-semibold text-slate-300 block">Goal Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-[11px] font-semibold text-slate-300 block">Item Specs / Details</label>
              <input
                type="text"
                value={form.item_details}
                onChange={(e) => setForm({ ...form, item_details: e.target.value })}
                placeholder="e.g. MacBook Air M4"
                className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 block">Target Cost (BDT)</label>
              <input
                type="number"
                required
                min="1"
                value={form.target_amount}
                onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 block">Monthly Deposit (BDT)</label>
              <input
                type="number"
                required
                min="1"
                value={form.monthly_contribution}
                onChange={(e) => setForm({ ...form, monthly_contribution: e.target.value })}
                className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Stated DPS Opportunity Insight */}
          {dpsInsight.months && (
            <div className="p-3 rounded-2xl bg-[#0A1316] border border-emerald-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{DPS_RATE_DISPLAY} Compound Insight</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {dpsInsight.detail}
              </p>
            </div>
          )}

          {/* Full DPS Compound Schedule Table */}
          {dpsRows.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  DPS Schedule ({DPS_RATE_DISPLAY}, {DPS_COMPOUNDING.toLowerCase()} compound)
                </span>
                <span className="text-[10px] text-slate-400">{months} months runway</span>
              </div>

              <div className="bg-[#0B0C12] border border-[#1E2333] rounded-2xl overflow-hidden">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-[#1E2333] bg-[#0E1018] text-slate-400 font-semibold">
                      <th className="text-left py-2 px-3">Month</th>
                      <th className="text-right py-2 px-2">Plain Cash</th>
                      <th className="text-right py-2 px-2 text-teal-400">Interest</th>
                      <th className="text-right py-2 px-3 text-emerald-400">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181B26]">
                    {dpsRows
                      .filter((_, i) => i < 6 || i === dpsRows.length - 1 || i % Math.max(1, Math.floor(dpsRows.length / 5)) === 0)
                      .map((row) => (
                        <tr key={row.month} className="hover:bg-[#141620]">
                          <td className="py-1.5 px-3 text-slate-400 font-medium">Mo. {row.month}</td>
                          <td className="py-1.5 px-2 text-right text-slate-300">{formatBDT(row.totalWithout)}</td>
                          <td className="py-1.5 px-2 text-right font-semibold text-teal-400">+{formatBDT(row.interestEarned)}</td>
                          <td className="py-1.5 px-3 text-right font-extrabold text-emerald-300">{formatBDT(row.totalWith)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#262C3E] text-slate-400 font-semibold text-xs hover:text-white"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07080C] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
