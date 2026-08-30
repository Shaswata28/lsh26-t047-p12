'use client';

import { useEffect, useMemo } from 'react';
import { useExpenseStore } from '@/lib/store/expenseStore';
import { useProfileStore } from '@/lib/store/profileStore';
import { computeForecast, generateInsights } from '@/lib/engine/forecast';
import { formatBDT } from '@/lib/utils/currency';
import { daysRemaining, daysPassed, currentMonthStr, monthYear } from '@/lib/utils/date';
import InsightCard from '@/components/forecast/InsightCard';
import BurnRateBar from '@/components/forecast/BurnRateBar';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Sparkles, TrendingUp, TrendingDown, Clock, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ForecastPage() {
  const { expenses, loading, fetchExpenses } = useExpenseStore();
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    fetchExpenses();
    fetchProfile();
  }, [fetchExpenses, fetchProfile]);

  const salary = profile?.monthly_salary ?? 50000;
  const forecast = useMemo(() => computeForecast(expenses, salary), [expenses, salary]);
  const insights = useMemo(() => generateInsights(expenses, salary, forecast), [expenses, salary, forecast]);

  const daysLeft = Math.max(1, forecast.daysInMonth - forecast.daysPassed);
  const expectedRestOfSpend = forecast.dailyAverage * daysLeft;

  if (loading && expenses.length === 0) {
    return (
      <div className="space-y-3 pt-1">
        <SkeletonCard className="h-28" />
        <SkeletonCard className="h-44" />
        <div className="space-y-2">
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-lg font-bold text-white tracking-tight">Month-End Forecast</h1>
        <p className="text-[11px] text-slate-400">
          Projections computed from {daysPassed()} days of verified actual spending
        </p>
      </div>

      {/* Hero Projection Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Rest of Month Projection */}
        <div className="mobile-card p-3.5 space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Rest of Month</span>
          </div>
          <p className="text-lg font-extrabold text-white">
            {formatBDT(expectedRestOfSpend)}
          </p>
          <p className="text-[10px] text-slate-400 leading-tight">
            Expected spend for the next {daysLeft} days at {formatBDT(forecast.dailyAverage)}/day
          </p>
        </div>

        {/* Expected Left or Short at Month End */}
        <div className={`p-3.5 rounded-2xl border ${
          forecast.isOverspending
            ? 'bg-rose-500/10 border-rose-500/30'
            : 'bg-emerald-500/10 border-emerald-500/30'
        } space-y-1`}>
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
            {forecast.isOverspending ? (
              <>
                <TrendingDown className="w-3 h-3 text-rose-400" />
                <span className="text-rose-400">Projected Shortfall</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Projected Surplus</span>
              </>
            )}
          </div>
          <p className={`text-lg font-extrabold ${forecast.isOverspending ? 'text-rose-300' : 'text-emerald-300'}`}>
            {formatBDT(Math.abs(forecast.forecastBalance))}
          </p>
          <p className="text-[10px] text-slate-400 leading-tight">
            {forecast.isOverspending
              ? 'Estimated deficit against your monthly salary'
              : 'Estimated unallocated cash to save into pockets'}
          </p>
        </div>
      </div>

      {/* Burn Rate Runway Meter */}
      <div className="mobile-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Salary Consumption Runway
          </h2>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            forecast.isOverspending
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
          }`}>
            {forecast.percentBurned.toFixed(0)}% used
          </span>
        </div>

        <BurnRateBar forecast={forecast} />
      </div>

      {/* AI Written Insights with Concrete Categories & Amounts */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Specific Insights ({insights.length})
            </h2>
          </div>
          <span className="text-[10px] text-slate-500">Live data analysis</span>
        </div>

        {insights.length === 0 ? (
          <div className="mobile-card p-6 text-center space-y-2">
            <p className="text-sm font-medium text-white">Collecting your spending habits...</p>
            <p className="text-xs text-slate-400">
              Insights will automatically activate as transactions across multiple days and categories are recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {insights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} delay={i * 0.05} />
            ))}
          </div>
        )}
      </div>

      {/* Direct Pocket Allocation Prompt */}
      {forecast.forecastBalance > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-[#121E1C] border border-emerald-500/30 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-emerald-300">
              Put your {formatBDT(forecast.forecastBalance)} surplus to work
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Simulate 6% p.a. DPS growth on your active savings pockets
            </p>
          </div>
          <Link
            href="/pockets"
            className="px-3 py-2 rounded-xl bg-emerald-500 text-[#07080C] font-extrabold text-xs flex items-center gap-1 flex-shrink-0 active:scale-95 shadow-sm"
          >
            <span>Pockets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
