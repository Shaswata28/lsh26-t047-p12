'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Camera,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Calendar,
  Store,
  FileText,
  ScanLine,
  ArrowLeft,
  Wallet,
  ChevronDown,
} from 'lucide-react';
import { useExpenseStore } from '@/lib/store/expenseStore';
import { useProfileStore } from '@/lib/store/profileStore';
import { CATEGORIES } from '@/lib/utils/categories';
import { todayStr } from '@/lib/utils/date';
import { type OCRResult, type Category } from '@/types';

const CONFIDENCE_THRESHOLD = 0.85;

interface AddExpenseModalProps {
  initialTab?: 'manual' | 'receipt' | 'income';
  onClose: () => void;
}

export default function AddExpenseModal({ initialTab = 'manual', onClose }: AddExpenseModalProps) {
  const { addExpense } = useExpenseStore();
  const { profile, updateProfile } = useProfileStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'manual' | 'scan_upload' | 'scan_confirm' | 'income'>(
    initialTab === 'receipt' ? 'scan_upload' : initialTab === 'income' ? 'income' : 'manual'
  );
  
  const [saving, setSaving] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Expense Form State
  const [form, setForm] = useState({
    amount: '',
    date: todayStr(),
    shop: '',
    category: 'Food' as Category,
    notes: '',
  });

  // Income Form State
  const [incomeAmount, setIncomeAmount] = useState(String(profile?.monthly_salary || '50000'));
  const [incomeSource, setIncomeSource] = useState('Monthly Salary');

  // Confidence & unsure tracking
  const [fieldConfidence, setFieldConfidence] = useState<{
    amount?: number;
    date?: number;
    shop?: number;
    category?: number;
  }>({});
  const [unsureFields, setUnsureFields] = useState<Set<string>>(new Set());

  // Quick Dhaka merchant suggestions for manual entry
  const quickMerchants = [
    { name: 'Meena Bazar', category: 'Groceries' as Category },
    { name: 'Shwapno', category: 'Groceries' as Category },
    { name: 'DESCO', category: 'Utilities' as Category },
    { name: 'Pathao', category: 'Transport' as Category },
    { name: 'Uber', category: 'Transport' as Category },
    { name: 'Landlord', category: 'Rent' as Category },
    { name: 'bKash', category: 'Mobile' as Category },
    { name: 'Madchef', category: 'Food' as Category },
  ];

  const incomePresets = ['30000', '50000', '75000', '80000', '100000'];

  const handleSelectQuickMerchant = (item: { name: string; category: Category }) => {
    setForm((prev) => ({
      ...prev,
      shop: item.name,
      category: item.category,
    }));
  };

  const handleProcessFile = async (file: File) => {
    setOcrLoading(true);
    setUnsureFields(new Set());
    setFieldConfidence({});

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await fetch('/api/ocr', { method: 'POST', body: fd });
      const result: OCRResult = await res.json();
      setOcrResult(result);

      const newUnsure = new Set<string>();
      const updates: Partial<typeof form> = {};
      const amountConf = result?.confidence?.amount ?? 0;
      const dateConf = result?.confidence?.date ?? 0;
      const shopConf = result?.confidence?.shop ?? 0;
      const catConf = result?.confidence?.category ?? 0;

      const confidences: typeof fieldConfidence = {
        amount: amountConf,
        date: dateConf,
        shop: shopConf,
        category: catConf,
      };

      // CONSTRAINT: If confidence < 0.85, DO NOT auto-fill amount! Leave blank.
      if (result?.amount !== null && result?.amount !== undefined && amountConf >= CONFIDENCE_THRESHOLD) {
        updates.amount = String(result.amount);
      } else {
        newUnsure.add('amount');
        updates.amount = ''; // Left empty for user to fill
      }

      if (result?.date) {
        updates.date = result.date;
        if (dateConf < CONFIDENCE_THRESHOLD) newUnsure.add('date');
      }

      if (result?.shop) {
        updates.shop = result.shop;
        if (shopConf < CONFIDENCE_THRESHOLD) newUnsure.add('shop');
      }

      if (result?.category) {
        updates.category = result.category;
        if (catConf < CONFIDENCE_THRESHOLD) newUnsure.add('category');
      }

      setForm((prev) => ({ ...prev, ...updates }));
      setUnsureFields(newUnsure);
      setFieldConfidence(confidences);
      
      // Transition to Confirmation & Edit
      setMode('scan_confirm');
    } catch (err) {
      console.error('OCR processing error:', err);
      // Fallback transition so user can enter data manually on confirmation screen
      setUnsureFields(new Set(['amount', 'shop']));
      setFieldConfidence({ amount: 0, date: 0, shop: 0, category: 0 });
      setMode('scan_confirm');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleProcessFile(file);
  }, []);

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(form.amount);
    if (!form.amount || isNaN(numAmount) || numAmount <= 0) return;

    setSaving(true);
    await addExpense({
      amount: numAmount,
      date: form.date,
      shop: form.shop.trim() || form.category,
      category: form.category,
      notes: form.notes.trim() || undefined,
    });
    setSaving(false);
    onClose();
  };

  const handleSubmitIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(incomeAmount);
    if (isNaN(num) || num <= 0) return;

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
        className="w-full max-w-md bg-[#11131C] border-t sm:border border-[#262B3D] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Mobile Pull Handle */}
        <div className="pt-2 pb-1 flex justify-center cursor-grab sm:hidden">
          <div className="w-10 h-1.5 rounded-full bg-[#2C3144]" />
        </div>

        {/* Header */}
        <div className="px-4 py-2.5 border-b border-[#1E2333] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'scan_confirm' && (
              <button
                type="button"
                onClick={() => setMode('scan_upload')}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-sm font-bold text-white tracking-tight">
              {mode === 'income'
                ? 'Set Monthly Income'
                : mode === 'manual'
                ? 'Record Expense'
                : mode === 'scan_upload'
                ? 'Scan Bill or Receipt'
                : 'Confirm Extracted Receipt'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#1A1D2A] border border-[#272D40]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Way Mode Switcher */}
        {mode !== 'scan_confirm' && (
          <div className="px-4 pt-2.5 pb-1">
            <div className="grid grid-cols-3 bg-[#0A0C12] p-1 rounded-2xl border border-[#1E2333]">
              <button
                type="button"
                onClick={() => setMode('income')}
                className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  mode === 'income'
                    ? 'bg-emerald-500 text-[#07080C] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Income</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  mode === 'manual'
                    ? 'bg-[#1C2030] text-emerald-400 shadow-sm border border-[#2B324A]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('scan_upload')}
                className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  mode === 'scan_upload'
                    ? 'bg-emerald-600 text-[#07080C] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Scan</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 pb-6">

          {/* ========================================================================= */}
          {/* TAB 1: RECORD MONTHLY INCOME */}
          {/* ========================================================================= */}
          {mode === 'income' && (
            <form onSubmit={handleSubmitIncome} className="space-y-4 py-1">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <p className="font-bold">Set this month's net salary</p>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">
                  Your monthly available runway, daily safe burn pace, and savings pockets will immediately update with this salary.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Quick Select (Dhaka Benchmarks)
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {incomePresets.map((p) => {
                    const val = parseInt(p);
                    const isSelected = incomeAmount === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setIncomeAmount(p)}
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

              {/* Big Hero Amount */}
              <div className="space-y-1">
                <label htmlFor="income-amount-input" className="text-[11px] font-semibold text-slate-300 block">
                  Monthly Take-Home Salary (BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-400">৳</span>
                  <input
                    id="income-amount-input"
                    type="number"
                    min="1"
                    step="500"
                    required
                    autoFocus
                    placeholder="50000"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    className="w-full bg-[#0E1018] border border-[#262C3E] rounded-2xl pl-10 pr-4 py-3 text-2xl font-black text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Income Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">Income Source</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Monthly Salary', 'Bonus / Extra', 'Side Income'].map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setIncomeSource(src)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-medium transition-all ${
                        incomeSource === src
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                          : 'bg-[#141620] text-slate-400 border border-[#232738]'
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving || !incomeAmount}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#07080C] font-black text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Monthly Income'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SCAN & UPLOAD */}
          {/* ========================================================================= */}
          {mode === 'scan_upload' && (
            <div className="space-y-4 py-2">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all bg-[#0E1018] ${
                  dragOver
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-[#262C3E] hover:border-emerald-500/50'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                  <Camera className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-white">
                  Upload Receipt Photo
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Upload your paper bill or mobile money screenshot (bKash/Nagad). Gemini AI will parse the details for confirmation.
                </p>
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-[#07080C] text-xs font-bold shadow-md">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {ocrLoading && (
                <div className="p-4 rounded-2xl bg-[#0E1018] border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Analyzing receipt with Gemini Vision OCR...</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: RECEIPT CONFIRMATION & EDIT STEP */}
          {/* ========================================================================= */}
          {mode === 'scan_confirm' && (
            <form onSubmit={handleSubmitExpense} className="space-y-3.5">
              {imagePreview && (
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#090A0F] border border-[#1F2332]">
                  <img
                    src={imagePreview}
                    alt="Receipt thumbnail"
                    className="w-14 h-14 object-cover rounded-xl border border-white/10 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Extracted by Gemini AI</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Review and correct any field below before saving.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setMode('scan_upload');
                    }}
                    className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded bg-[#181B26]"
                  >
                    Retake
                  </button>
                </div>
              )}

              {unsureFields.size > 0 && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <p className="font-semibold text-amber-300">
                      Unsure fields detected — please verify
                    </p>
                    <p className="text-amber-200/80 mt-0.5">
                      {unsureFields.has('amount')
                        ? 'Amount was unclear in photo — left empty so you can enter the exact number.'
                        : 'Review the highlighted fields below.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Amount Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <label htmlFor="confirm-amount" className="font-semibold text-slate-300">
                    Amount Paid (BDT)
                  </label>
                  {unsureFields.has('amount') && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Needs Entry</span>
                    </span>
                  )}
                  {!unsureFields.has('amount') && fieldConfidence.amount !== undefined && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Read from bill</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-emerald-400">৳</span>
                  <input
                    id="confirm-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={`w-full bg-[#0E1018] rounded-2xl pl-9 pr-4 py-3 text-xl font-black text-white focus:outline-none focus:border-emerald-500 ${
                      unsureFields.has('amount') && !form.amount
                        ? 'field-unsure-border border'
                        : 'border border-[#262C3E]'
                    }`}
                  />
                </div>
              </div>

              {/* Shop Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <label htmlFor="confirm-shop" className="font-semibold text-slate-300">
                    Shop / Payee
                  </label>
                  {unsureFields.has('shop') && (
                    <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Verify</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="confirm-shop"
                    type="text"
                    required
                    placeholder="e.g. Meena Bazar"
                    value={form.shop}
                    onChange={(e) => setForm({ ...form, shop: e.target.value })}
                    className={`w-full bg-[#0E1018] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 ${
                      unsureFields.has('shop') ? 'field-unsure-border border' : 'border border-[#262C3E]'
                    }`}
                  />
                </div>
              </div>

              {/* Date & Category Dropdown */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label htmlFor="confirm-date" className="text-[11px] font-semibold text-slate-300 block">Date</label>
                  <input
                    id="confirm-date"
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="confirm-category" className="text-[11px] font-semibold text-slate-300 block">Category</label>
                  <div className="relative">
                    <select
                      id="confirm-category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                      className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3 py-2.5 pr-8 text-xs text-white focus:outline-none focus:border-emerald-500 appearance-none font-medium cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-[#11131C] text-white py-1">{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label htmlFor="confirm-notes" className="text-[11px] font-semibold text-slate-400 block">Notes (Optional)</label>
                <input
                  id="confirm-notes"
                  type="text"
                  placeholder="Additional memo..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  id="confirm-save-btn"
                  type="submit"
                  disabled={saving || !form.amount}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#07080C] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Save Expense'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MANUAL EXPENSE ENTRY (Clean Dropdown for Category) */}
          {/* ========================================================================= */}
          {mode === 'manual' && (
            <form onSubmit={handleSubmitExpense} className="space-y-3.5">
              <div className="space-y-1">
                <label htmlFor="manual-amount-input" className="text-[11px] font-semibold text-slate-300 block">
                  Amount Spent
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-400">৳</span>
                  <input
                    id="manual-amount-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    autoFocus
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-[#0E1018] border border-[#262C3E] rounded-2xl pl-10 pr-4 py-3 text-2xl font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="manual-shop-input" className="text-[11px] font-semibold text-slate-300 block">
                  Merchant / Payee
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="manual-shop-input"
                    type="text"
                    required
                    placeholder="e.g. Meena Bazar, Landlord, DESCO"
                    value={form.shop}
                    onChange={(e) => setForm({ ...form, shop: e.target.value })}
                    className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {quickMerchants.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleSelectQuickMerchant(item)}
                      className="px-2 py-0.5 rounded-lg bg-[#141620] border border-[#232738] text-[10px] text-slate-400 hover:text-emerald-300 hover:border-emerald-500/30 whitespace-nowrap"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Dropdown Box */}
              <div className="space-y-1">
                <label htmlFor="manual-category-select" className="text-[11px] font-semibold text-slate-300 block">
                  Category
                </label>
                <div className="relative">
                  <select
                    id="manual-category-select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                    className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3.5 py-2.5 pr-9 text-xs text-white focus:outline-none focus:border-emerald-500 appearance-none font-medium cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#11131C] text-white py-1">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label htmlFor="manual-date-input" className="text-[11px] font-semibold text-slate-400 block">Date</label>
                  <input
                    id="manual-date-input"
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="manual-notes-input" className="text-[11px] font-semibold text-slate-400 block">Notes (Optional)</label>
                  <input
                    id="manual-notes-input"
                    type="text"
                    placeholder="e.g. Lunch"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full bg-[#0E1018] border border-[#262C3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="save-manual-expense-btn"
                  type="submit"
                  disabled={saving || !form.amount}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#07080C] font-black text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Expense'}
                </button>
              </div>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
}
