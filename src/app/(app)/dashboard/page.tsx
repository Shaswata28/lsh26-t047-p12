'use client';

import { useEffect, useMemo, useState } from 'react';
import { useExpenseStore } from '@/lib/store/expenseStore';
import { useProfileStore } from '@/lib/store/profileStore';
import { usePocketStore } from '@/lib/store/pocketStore';
import { computeForecast, computeCategorySummaries, generateInsights } from '@/lib/engine/forecast';
import { formatBDT } from '@/lib/utils/currency';
import { daysRemaining, currentMonthStr, lastMonthStr, monthYear } from '@/lib/utils/date';
import KPIBar from '@/components/dashboard/KPIBar';
import CategoryDonut from '@/components/charts/CategoryDonut';
import TopExpenses from '@/components/dashboard/TopExpenses';
import MonthDeltaTable from '@/components/dashboard/MonthDeltaTable';
import AddExpenseModal from '@/components/expense/AddExpenseModal';
import SetSalaryModal from '@/components/dashboard/SetSalaryModal';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Sparkles, Scan, Plus, ChevronRight, DollarSign, Wallet, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const { expenses, loading, fetchExpenses } = useExpenseStore();
  const { profile, fetchProfile } = useProfileStore();
  const { pockets, fetchPockets } = usePocketStore();

  const [addModalTab, setAddModalTab] = useState<'manual' | 'receipt' | 'income' | null>(null);
  const [showSalaryModal, setShowSalaryModal] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchProfile();
    fetchPockets();
  }, [fetchExpenses, fetchProfile, fetchPockets]);

  const salary = profile?.monthly_salary ?? 50000;
  const forecast = useMemo(() => computeForecast(expenses, salary), [expenses, salary]);
  const summaries = useMemo(() => computeCategorySummaries(expenses, salary), [expenses, salary]);
  const insights = useMemo(() => generateInsights(expenses, salary, forecast), [expenses, salary, forecast]);

  const thisMonth = currentMonthStr();
  const lastMonth = lastMonthStr();
  const thisMonthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(thisMonth)),
    [expenses, thisMonth]
  );
  
  const recentExpenses = useMemo(
    () => [...thisMonthExpenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [thisMonthExpenses]
  );

  const topInsight = insights[0] ?? null;

  if (loading && expenses.length === 0) {
    return (
      <div className="space-y-3 pt-1">
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-44 rounded-3xl" />
        <SkeletonCard className="h-16" />
        <SkeletonCard className="h-48" />
      </div>
    );
  }

  const hasData = thisMonthExpenses.length > 0;

  return (
    <div className="space-y-3.5 pb-6">

      {/* ========================================================================= */}
      {/* UNMISSABLE START-OF-MONTH SALARY / INCOME CARD */}
      {/* ========================================================================= */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-[#11241E] to-[#121824] border border-emerald-500/30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm flex-shrink-0 border border-emerald-500/30">
            ৳
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider block">
              {monthYear(thisMonth)} Salary
            </span>
            <p className="text-sm font-black text-white truncate">
              {formatBDT(salary)}
            </p>
          </div>
        </div>

        <button
          id="set-month-income-btn"
          type="button"
          onClick={() => setShowSalaryModal(true)}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07080C] font-black text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all flex-shrink-0"
        >
          <span>Set Salary</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main KPI Cash Runway Card */}
      <KPIBar forecast={forecast} />

      {/* Quick 3-Action Bar: Scan | Add Spend | Add Income */}
      <div className="grid grid-cols-3 gap-2">
        <button
          id="quick-scan-btn"
          onClick={() => setAddModalTab('receipt')}
          className="py-2.5 px-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#07080C] font-extrabold text-[11px] flex flex-col items-center justify-center gap-1 shadow-md active:scale-[0.98] transition-all"
        >
          <Scan className="w-4 h-4 stroke-[2.5]" />
          <span>Scan Receipt</span>
        </button>

        <button
          id="quick-spend-btn"
          onClick={() => setAddModalTab('manual')}
          className="py-2.5 px-2 rounded-2xl bg-[#181B26] hover:bg-[#202434] border border-[#2B3146] text-white font-bold text-[11px] flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          <span>Record Spend</span>
        </button>

        <button
          id="quick-income-btn"
          onClick={() => setAddModalTab('income')}
          className="py-2.5 px-2 rounded-2xl bg-[#141824] hover:bg-[#1A2030] border border-emerald-500/25 text-emerald-300 font-bold text-[11px] flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all"
        >
          <Wallet className="w-4 h-4 text-emerald-400 stroke-[2]" />
          <span>Add Income</span>
        </button>
      </div>

      {/* Priority Dynamic Insight Highlight */}
      {topInsight && (
        <Link
          href="/forecast"
          className="block p-3 rounded-2xl bg-[#121520] border border-[#23283B] border-l-4 border-l-emerald-500 hover:bg-[#161926] transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-xs font-bold text-white tracking-tight truncate">
                {topInsight.title}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1 pl-5.5 line-clamp-2 leading-relaxed">
            {topInsight.description}
          </p>
        </Link>
      )}

      {!hasData ? (
        <div className="mobile-card p-6 text-center space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#1D2130] text-emerald-400 flex items-center justify-center mx-auto text-base">
            ৳
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">No expenses recorded this month</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mx-auto">
              Tap Scan Receipt or Record Spend to track your daily expenses against your salary.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Spending Category Breakdown */}
          <div className="mobile-card p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Category Spending
              </h2>
              <span className="text-[10px] text-slate-500">
                {summaries.length} categories
              </span>
            </div>

            <CategoryDonut summaries={summaries} />

            {/* Top 3 Progress Bars */}
            <div className="space-y-1.5 pt-2 border-t border-[#1F2332]">
              {summaries.slice(0, 3).map((cat) => (
                <div key={cat.category} className="space-y-0.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-medium text-slate-300">{cat.category}</span>
                    <span className="font-bold text-white">{formatBDT(cat.total)} ({cat.percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-1 bg-[#1B1E2B] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mobile-card p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Recent Transactions
              </h2>
              <Link
                href="/expenses"
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
              >
                View all ({thisMonthExpenses.length})
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <TopExpenses expenses={recentExpenses} />
          </div>

          {/* Month over Month Snapshot */}
          <div className="mobile-card p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                vs Last Month ({monthYear(lastMonth)})
              </h2>
            </div>
            <MonthDeltaTable summaries={summaries} />
          </div>
        </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {addModalTab && (
          <AddExpenseModal
            initialTab={addModalTab}
            onClose={() => setAddModalTab(null)}
          />
        )}
        {showSalaryModal && (
          <SetSalaryModal
            currentSalary={salary}
            onClose={() => setShowSalaryModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
