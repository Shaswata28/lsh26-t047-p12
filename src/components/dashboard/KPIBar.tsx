'use client';

import { useState } from 'react';
import { type ForecastData } from '@/types';
import { formatBDT } from '@/lib/utils/currency';
import { Clock, Pencil, ArrowUpRight, TrendingDown, TrendingUp, AlertCircle, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import SetSalaryModal from './SetSalaryModal';
import { AnimatePresence } from 'framer-motion';

interface KPIBarProps {
  forecast: ForecastData;
}

export default function KPIBar({ forecast }: KPIBarProps) {
  const [showSalaryModal, setShowSalaryModal] = useState(false);

  const remaining = forecast.salary - forecast.totalSpentThisMonth;
  const isSurplus = remaining >= 0;
  const daysLeft = Math.max(1, forecast.daysInMonth - forecast.daysPassed);
  const dailySafeSpend = isSurplus ? remaining / daysLeft : 0;
  const burnPercent = forecast.salary > 0 ? Math.min(100, (forecast.totalSpentThisMonth / forecast.salary) * 100) : 0;

  return (
    <>
      <div className="space-y-2.5">
        {/* Main Cash Runway Card */}
        <div className="fintech-card p-4 relative text-white">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold text-emerald-400/90 tracking-wider uppercase">
              Monthly Runway
            </span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-slate-300 font-medium backdrop-blur-sm">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{daysLeft} days remaining</span>
            </div>
          </div>

          {/* Large Available Cash */}
          <div className="mb-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-medium text-emerald-400/80">৳</span>
              <span className="text-3xl font-black tracking-tight text-white">
                {new Intl.NumberFormat('en-BD').format(Math.max(0, remaining))}
              </span>
            </div>

            {/* Income line with Direct Edit Button */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-slate-300">
                Left from {formatBDT(forecast.salary)} income
              </span>
              <button
                type="button"
                onClick={() => setShowSalaryModal(true)}
                className="px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-emerald-300 text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
                title="Edit Monthly Salary"
              >
                <Pencil className="w-2.5 h-2.5" />
                <span>Edit Income</span>
              </button>
            </div>
          </div>

          {/* Spend progress bar */}
          <div className="space-y-1 mb-2.5">
            <div className="flex justify-between text-[10px] font-medium text-slate-300">
              <span>Spent: {formatBDT(forecast.totalSpentThisMonth)}</span>
              <span>{burnPercent.toFixed(0)}% consumed</span>
            </div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  forecast.isOverspending
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-300'
                }`}
                style={{ width: `${burnPercent}%` }}
              />
            </div>
          </div>

          {/* Bottom Guideline */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-emerald-400 font-bold">{formatBDT(dailySafeSpend)}</span>
              <span className="text-slate-400 text-[10px]">/ day safe limit</span>
            </div>

            <Link
              href="/forecast"
              className="text-emerald-400 hover:text-emerald-300 text-[10px] font-bold flex items-center gap-0.5"
            >
              <span>Full Forecast</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Set Salary Modal */}
      <AnimatePresence>
        {showSalaryModal && (
          <SetSalaryModal
            currentSalary={forecast.salary}
            onClose={() => setShowSalaryModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
