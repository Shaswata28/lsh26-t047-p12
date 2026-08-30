'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Save, Store, Calendar, ChevronDown } from 'lucide-react';
import { useExpenseStore } from '@/lib/store/expenseStore';
import { CATEGORIES } from '@/lib/utils/categories';
import { type Expense, type Category } from '@/types';

interface EditExpenseModalProps {
  expense: Expense;
  onClose: () => void;
}

export default function EditExpenseModal({ expense, onClose }: EditExpenseModalProps) {
  const { updateExpense } = useExpenseStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    amount: String(expense.amount),
    date: expense.date,
    shop: expense.shop ?? '',
    category: expense.category,
    notes: expense.notes ?? '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(form.amount);
    if (!form.amount || isNaN(numAmount) || numAmount <= 0) return;

    setSaving(true);
    await updateExpense(expense.id, {
      amount: numAmount,
      date: form.date,
      shop: form.shop.trim() || form.category,
      category: form.category as Category,
      notes: form.notes.trim() || undefined,
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
        className="w-full max-w-md bg-[#11131C] border-t sm:border border-[#262B3D] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="pt-2.5 pb-1 flex justify-center cursor-grab sm:hidden">
          <div className="w-10 h-1.5 rounded-full bg-[#2C3144]" />
        </div>

        <div className="px-4 py-3 border-b border-[#1E2333] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-tight">Edit Transaction</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#1A1D2A] border border-[#272D40]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto">
          {/* Amount */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">Amount (BDT)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-emerald-400">৳</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-[#0E1018] border border-[#262C3E] rounded-2xl pl-9 pr-4 py-2.5 text-lg font-black text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">Shop / Merchant</label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={form.shop}
                onChange={(e) => setForm({ ...form, shop: e.target.value })}
                placeholder="e.g. Meena Bazar"
                className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Date & Category Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 block">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 block">Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                  className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3 py-2 pr-8 text-xs text-white focus:outline-none focus:border-emerald-500 appearance-none font-medium cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#11131C] text-white py-1">
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 block">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#07080C] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
