'use client';

import { useState } from 'react';
import { type Pocket } from '@/types';
import { usePocketStore } from '@/lib/store/pocketStore';
import { formatBDT } from '@/lib/utils/currency';
import {
  pocketCompletionDate,
  pocketCompletionMonths,
  calculateDPS,
  DPS_RATE_DISPLAY,
  DPS_COMPOUNDING,
  dpsTotal,
  dpsInterest,
  getDPSInsightText,
} from '@/lib/engine/dps';
import { format } from 'date-fns';
import { Target, Calendar, TrendingUp, Plus, Pencil, Trash2, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddContributionModal from './AddContributionModal';
import PocketDetailModal from './PocketDetailModal';

interface PocketCardProps {
  pocket: Pocket;
  forecastSurplus: number;
}

export default function PocketCard({ pocket, forecastSurplus }: PocketCardProps) {
  const { deletePocket } = usePocketStore();
  const [showContrib, setShowContrib] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDPS, setShowDPS] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const progress = pocket.target_amount > 0
    ? Math.min(100, (pocket.saved_amount / pocket.target_amount) * 100)
    : 0;

  const isComplete = pocket.saved_amount >= pocket.target_amount;

  // Expected completion derived strictly from forecast surplus constraint
  const completionDate = pocketCompletionDate(
    pocket.target_amount,
    pocket.saved_amount,
    pocket.monthly_contribution,
    forecastSurplus
  );

  const months = pocketCompletionMonths(
    pocket.target_amount,
    pocket.saved_amount,
    pocket.monthly_contribution,
    forecastSurplus
  );

  const effectiveContrib = Math.min(pocket.monthly_contribution, Math.max(forecastSurplus, 0));
  const dpsMonths = months ?? 0;
  const dpsTotalVal = dpsMonths > 0 ? dpsTotal(effectiveContrib, dpsMonths) : 0;
  const dpsInterestVal = dpsMonths > 0 ? dpsInterest(effectiveContrib, dpsMonths) : 0;

  const dpsInsight = getDPSInsightText(
    pocket.target_amount,
    pocket.saved_amount,
    pocket.monthly_contribution,
    forecastSurplus
  );

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    await deletePocket(pocket.id);
    setDeleting(false);
  };

  return (
    <>
      <div className="mobile-card p-4 space-y-3 relative overflow-hidden border border-[#232738] hover:border-[#343B52] transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white tracking-tight truncate">
                  {pocket.name}
                </h3>
                {isComplete && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Reached
                  </span>
                )}
              </div>
              {pocket.item_details && (
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {pocket.item_details}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDetail(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-[#1A1D2B] transition-colors"
              title="Edit Pocket"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#1A1D2B] transition-colors"
              title="Delete Pocket"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Goal Amount & Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="font-semibold text-white">
              {formatBDT(pocket.saved_amount)}
              <span className="text-slate-400 font-normal"> / {formatBDT(pocket.target_amount)}</span>
            </span>
            <span className="font-bold text-emerald-400">{progress.toFixed(0)}%</span>
          </div>

          <div className="h-2 w-full bg-[#1A1D2B] rounded-full overflow-hidden p-0.5 border border-[#262C3E]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isComplete ? 'bg-emerald-400' : 'bg-gradient-to-r from-emerald-600 to-teal-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Forecast-Driven Completion Date Badge */}
        <div className="p-2.5 rounded-xl bg-[#0F1118] border border-[#1E2333] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-400 truncate">Est. Completion:</span>
          </div>

          <div>
            {isComplete ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Goal achieved!
              </span>
            ) : completionDate ? (
              <span className="font-bold text-emerald-300">
                {format(completionDate, 'MMMM yyyy')} ({months} mos)
              </span>
            ) : (
              <span className="font-semibold text-amber-400 flex items-center gap-1 text-[10px]">
                <AlertCircle className="w-3 h-3" />
                Delayed (Zero surplus)
              </span>
            )}
          </div>
        </div>

        {/* Formatted DPS Suggestion Insight Note */}
        {!isComplete && dpsInsight.months && (
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#0C1518] to-[#0E1B18] border border-emerald-500/25 space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>{DPS_RATE_DISPLAY} Opportunity</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {dpsInsight.detail}
            </p>
          </div>
        )}

        {/* DPS Projection Accordion Toggle */}
        <div className="pt-2 border-t border-[#1F2332]">
          <button
            type="button"
            onClick={() => setShowDPS(!showDPS)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-300 hover:text-emerald-400 transition-colors py-1"
          >
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>DPS Simulation ({DPS_RATE_DISPLAY} compound)</span>
            </div>
            {showDPS ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          <AnimatePresence>
            {showDPS && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-2 overflow-hidden"
              >
                <div className="p-2.5 rounded-xl bg-[#0B0C12] border border-[#1E2333] grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Plain Cash</span>
                    <span className="text-xs font-bold text-slate-200 block mt-0.5">
                      {formatBDT(effectiveContrib * dpsMonths)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-400 block">With DPS</span>
                    <span className="text-xs font-bold text-emerald-300 block mt-0.5">
                      {formatBDT(dpsTotalVal)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-teal-400 block">+ Interest</span>
                    <span className="text-xs font-bold text-teal-300 block mt-0.5">
                      {formatBDT(dpsInterestVal)}
                    </span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 text-center leading-tight">
                  Calculated at {DPS_RATE_DISPLAY} annual rate, compounded {DPS_COMPOUNDING.toLowerCase()} over {dpsMonths} months runway.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Action Button: Add Contribution */}
        {!isComplete && (
          <button
            onClick={() => setShowContrib(true)}
            className="w-full py-2.5 rounded-xl bg-[#1D2130] hover:bg-[#252A3D] border border-[#2C3348] text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contribution</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showContrib && (
          <AddContributionModal pocket={pocket} onClose={() => setShowContrib(false)} />
        )}
        {showDetail && (
          <PocketDetailModal
            pocket={pocket}
            forecastSurplus={forecastSurplus}
            onClose={() => setShowDetail(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
