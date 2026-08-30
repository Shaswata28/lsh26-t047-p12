'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePocketStore } from '@/lib/store/pocketStore';
import { useExpenseStore } from '@/lib/store/expenseStore';
import { useProfileStore } from '@/lib/store/profileStore';
import { computeForecast } from '@/lib/engine/forecast';
import PocketCard from '@/components/pockets/PocketCard';
import CreatePocketModal from '@/components/pockets/CreatePocketModal';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Plus, PiggyBank, Sparkles, TrendingUp, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { DPS_RATE_DISPLAY, DPS_COMPOUNDING } from '@/lib/engine/dps';
import { formatBDT } from '@/lib/utils/currency';

export default function PocketsPage() {
  const { pockets, loading, fetchPockets } = usePocketStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { profile, fetchProfile } = useProfileStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchPockets();
    fetchExpenses();
    fetchProfile();
  }, [fetchPockets, fetchExpenses, fetchProfile]);

  const salary = profile?.monthly_salary ?? 50000;
  const forecast = useMemo(() => computeForecast(expenses, salary), [expenses, salary]);

  const totalSaved = pockets.reduce((sum, p) => sum + p.saved_amount, 0);
  const totalTarget = pockets.reduce((sum, p) => sum + p.target_amount, 0);

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Savings Pockets</h1>
          <p className="text-[11px] text-slate-400">
            Target dates calculated from live forecast surplus
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07080C] font-bold text-xs flex items-center gap-1 active:scale-95 shadow-md transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Aggregate Savings Status Capsule */}
      {pockets.length > 0 && (
        <div className="p-3 rounded-2xl bg-[#121520] border border-[#212638] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Total Accumulated</span>
            <span className="text-sm font-extrabold text-emerald-400">
              {formatBDT(totalSaved)}{' '}
              <span className="text-slate-500 text-xs font-normal">/ {formatBDT(totalTarget)}</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-medium block">Pockets Active</span>
            <span className="text-xs font-bold text-slate-200">{pockets.length} goals</span>
          </div>
        </div>
      )}

      {/* Transparent DPS Rate Declaration Card (Constraint Requirement) */}
      <div className="p-3.5 rounded-2xl bg-[#0F131D] border border-emerald-500/20 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Stated DPS Reference: {DPS_RATE_DISPLAY} ({DPS_COMPOUNDING})</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Standard Bangladeshi DPS compounding formula:{' '}
          <code className="text-emerald-400 font-mono text-[10px] bg-[#090A0F] px-1.5 py-0.5 rounded">
            A = P × [((1 + 0.06/12)^(12×t) - 1) / (0.06/12)]
          </code>
          . Monthly contributions earn interest every month to accelerate your goal.
        </p>
      </div>

      {/* Pockets List */}
      {loading && pockets.length === 0 ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} className="h-44" />
          ))}
        </div>
      ) : pockets.length === 0 ? (
        <div className="mobile-card p-10 text-center space-y-3 mt-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1D2B] text-emerald-400 flex items-center justify-center mx-auto">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No Savings Pockets Created</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Attach a real target date to your goals like a Laptop, Bike, Wedding, or Deposit.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-[#07080C] font-extrabold text-xs inline-flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Create First Pocket
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {pockets.map((pocket, i) => (
            <motion.div
              key={pocket.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <PocketCard pocket={pocket} forecastSurplus={forecast.forecastBalance} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Pocket Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreatePocketModal onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
