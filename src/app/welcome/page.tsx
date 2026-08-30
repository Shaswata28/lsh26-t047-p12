'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowRight, ArrowLeft, Check, Plus, Trash2, Loader2, Sparkles, Home, Zap, Wifi, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useProfileStore } from '@/lib/store/profileStore';
import { useExpenseStore } from '@/lib/store/expenseStore';
import { todayStr } from '@/lib/utils/date';
import { type Category } from '@/types';

interface FixedExpenseItem {
  id: string;
  name: string;
  category: Category;
  amount: string;
  enabled: boolean;
}

export default function WelcomePage() {
  const router = useRouter();
  const { fetchProfile } = useProfileStore();
  const { fetchExpenses } = useExpenseStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [salary, setSalary] = useState('50000');
  const [loading, setLoading] = useState(false);

  // Common Dhaka fixed recurring commitments
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpenseItem[]>([
    { id: 'rent', name: 'House Rent (Landlord)', category: 'Rent', amount: '16000', enabled: true },
    { id: 'electricity', name: 'Electricity / DESCO', category: 'Utilities', amount: '2000', enabled: true },
    { id: 'internet', name: 'WiFi & Mobile Recharge', category: 'Mobile', amount: '1200', enabled: false },
    { id: 'groceries', name: 'Grocery Budget', category: 'Groceries', amount: '8000', enabled: false },
  ]);

  const [customName, setCustomName] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const salaryPresets = ['30000', '50000', '75000', '80000', '100000'];

  const toggleExpense = (id: string) => {
    setFixedExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const updateExpenseAmount = (id: string, newAmount: string) => {
    setFixedExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount: newAmount } : item))
    );
  };

  const addCustomExpense = () => {
    if (!customName.trim() || !customAmount || parseFloat(customAmount) <= 0) return;
    setFixedExpenses((prev) => [
      ...prev,
      {
        id: `custom_${Date.now()}`,
        name: customName.trim(),
        category: 'Other',
        amount: customAmount,
        enabled: true,
      },
    ]);
    setCustomName('');
    setCustomAmount('');
    setShowCustomInput(false);
  };

  const removeCustomExpense = (id: string) => {
    setFixedExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const handleComplete = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const numSalary = parseFloat(salary) || 50000;

      // 1. Upsert Profile with Name & Salary
      await supabase.from('profiles').upsert(
        {
          user_id: user.id,
          name: name.trim() || 'Salaried Professional',
          monthly_salary: numSalary,
          currency: 'BDT',
        },
        { onConflict: 'user_id' }
      );

      // 2. Insert any enabled fixed expenses for the current month
      const activeExpenses = fixedExpenses
        .filter((item) => item.enabled && parseFloat(item.amount) > 0)
        .map((item) => ({
          user_id: user.id,
          date: todayStr(),
          category: item.category,
          shop: item.name,
          amount: parseFloat(item.amount),
          notes: 'Fixed monthly commitment',
        }));

      if (activeExpenses.length > 0) {
        await supabase.from('expenses').insert(activeExpenses);
      }

      await fetchProfile();
      await fetchExpenses();

      router.push('/dashboard');
    } catch (err) {
      console.error('Welcome setup error:', err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080C] text-[#F3F4F6] flex justify-center selection:bg-emerald-500/30">
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between bg-[#0B0C12] border-x border-[#1C2030]/60 p-5 safe-top safe-bottom">
        
        {/* Top Stepper Bar */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Welcome Setup</span>
            <span className="text-emerald-400 font-mono">Step {step} of 3</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-emerald-500' : 'bg-[#1E2333]'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-emerald-500' : 'bg-[#1E2333]'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-emerald-500' : 'bg-[#1E2333]'}`} />
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="my-auto py-6">
          <AnimatePresence mode="wait">
            
            {/* ========================================================================= */}
            {/* STEP 1: ASK USER NAME */}
            {/* ========================================================================= */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mb-2">
                    <User className="w-6 h-6" />
                  </div>
                  <h1 className="text-xl font-extrabold text-white tracking-tight">
                    What should we call you?
                  </h1>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Let's personalize your personal ledger and spending dashboard.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">Your Full Name</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Rahim Uddin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) setStep(2); }}
                    className="w-full bg-[#0E1018] border border-[#262C3E] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  disabled={!name.trim()}
                  onClick={() => setStep(2)}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#07080C] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: MONTHLY INCOME / SALARY */}
            {/* ========================================================================= */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mb-2">
                    <span className="text-xl font-black">৳</span>
                  </div>
                  <h1 className="text-xl font-extrabold text-white tracking-tight">
                    What is your monthly take-home salary?
                  </h1>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This powers your daily safe burn pace, month-end surplus forecast, and savings goal dates.
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Quick Select (Dhaka Benchmarks)
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {salaryPresets.map((preset) => {
                      const val = parseInt(preset);
                      const isSelected = salary === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setSalary(preset)}
                          className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-500 text-[#07080C] shadow-sm'
                              : 'bg-[#141620] border border-[#232738] text-slate-300 hover:text-white'
                          }`}
                        >
                          ৳{val / 1000}k
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Big Salary Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">
                    Monthly Salary (BDT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-400">৳</span>
                    <input
                      type="number"
                      min="1000"
                      step="500"
                      required
                      autoFocus
                      placeholder="50000"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && parseFloat(salary) > 0) setStep(3); }}
                      className="w-full bg-[#0E1018] border border-[#262C3E] rounded-2xl pl-10 pr-4 py-3 text-2xl font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-3 px-4 rounded-2xl border border-[#262C3E] text-slate-400 text-xs font-bold hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!salary || parseFloat(salary) <= 0}
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-[#07080C] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
                  >
                    <span>Next: Fixed Expenses</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: FIXED EXPENSES */}
            {/* ========================================================================= */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h1 className="text-xl font-extrabold text-white tracking-tight">
                    Any fixed monthly commitments?
                  </h1>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Select recurring expenses paid at month start so your remaining cash runway is accurate from day 1.
                  </p>
                </div>

                {/* Fixed Expense Checklist */}
                <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-0.5">
                  {fixedExpenses.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleExpense(item.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        item.enabled
                          ? 'bg-[#151926] border-emerald-500/40 text-white'
                          : 'bg-[#0E1018] border-[#202434] text-slate-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                          item.enabled
                            ? 'bg-emerald-500 text-[#07080C]'
                            : 'border border-slate-600 bg-transparent'
                        }`}
                      >
                        {item.enabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{item.name}</p>
                        <span className="text-[10px] text-slate-400">{item.category}</span>
                      </div>

                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 flex-shrink-0"
                      >
                        <span className="text-xs font-bold text-emerald-400">৳</span>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateExpenseAmount(item.id, e.target.value)}
                          className="w-20 bg-[#090A0F] border border-[#232738] rounded-xl px-2 py-1 text-xs font-bold text-right text-white focus:outline-none focus:border-emerald-500"
                        />
                        {item.id.startsWith('custom_') && (
                          <button
                            type="button"
                            onClick={() => removeCustomExpense(item.id)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Custom Fixed Expense */}
                  {showCustomInput ? (
                    <div className="p-3 rounded-2xl bg-[#121520] border border-emerald-500/30 space-y-2">
                      <input
                        type="text"
                        placeholder="Commitment name (e.g. Loan, Tuition, Gym)"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full bg-[#090A0F] border border-[#232738] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">৳</span>
                          <input
                            type="number"
                            placeholder="Amount"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="w-full bg-[#090A0F] border border-[#232738] rounded-xl pl-6 pr-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={addCustomExpense}
                          className="px-3 py-2 rounded-xl bg-emerald-500 text-[#07080C] font-bold text-xs"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCustomInput(false)}
                          className="px-2.5 py-2 rounded-xl text-slate-400 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="w-full py-2 rounded-2xl border border-dashed border-[#262C3E] text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add another fixed expense</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="py-3 px-4 rounded-2xl border border-[#262C3E] text-slate-400 text-xs font-bold hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleComplete}
                    className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#07080C] font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Complete Setup & Open Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Clean Footer */}
        <div className="text-center pb-2 text-[10px] text-slate-500">
          <span>You can change these parameters anytime in Settings</span>
        </div>
      </div>
    </div>
  );
}
