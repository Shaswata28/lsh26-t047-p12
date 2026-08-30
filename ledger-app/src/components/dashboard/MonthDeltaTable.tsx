'use client';

import { type CategorySummary } from '@/types';
import { CATEGORY_META } from '@/lib/utils/categories';
import { formatBDT } from '@/lib/utils/currency';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MonthDeltaTable({ summaries }: { summaries: CategorySummary[] }) {
  if (summaries.length === 0) {
    return <p className="text-slate-500 text-xs py-2 text-center">No comparison data available.</p>;
  }

  return (
    <div className="space-y-2">
      {summaries.slice(0, 5).map((s) => {
        const meta = CATEGORY_META[s.category] ?? CATEGORY_META['Other'];
        const isUp = s.change > 0;
        const isDown = s.change < 0;

        return (
          <div key={s.category} className="flex items-center justify-between p-2.5 rounded-xl bg-[#181B26] border border-[#232738]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 ${meta.bg} ${meta.color}`}>
                {meta.code}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{s.category}</p>
                <p className="text-[10px] text-slate-400">
                  {formatBDT(s.total)} {s.lastMonthTotal > 0 && <span className="text-slate-500">(prev: {formatBDT(s.lastMonthTotal)})</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <div
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                  isUp
                    ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                    : isDown
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-slate-400 bg-slate-800'
                }`}
              >
                {isUp ? (
                  <TrendingUp className="w-3 h-3 text-rose-400" />
                ) : isDown ? (
                  <TrendingDown className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Minus className="w-3 h-3 text-slate-400" />
                )}
                <span>
                  {s.lastMonthTotal > 0 ? `${Math.abs(s.change).toFixed(0)}%` : 'New'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
