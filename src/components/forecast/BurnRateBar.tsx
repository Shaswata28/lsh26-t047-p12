'use client';

import { type ForecastData } from '@/types';
import { formatBDT } from '@/lib/utils/currency';

export default function BurnRateBar({ forecast }: { forecast: ForecastData }) {
  const spentPct = Math.min(100, (forecast.totalSpentThisMonth / forecast.salary) * 100);
  const projectedPct = Math.min(100, (forecast.projectedSpend / forecast.salary) * 100);
  const monthProgressPct = Math.min(100, (forecast.daysPassed / forecast.daysInMonth) * 100);

  return (
    <div className="space-y-3 pt-1">
      {/* Visual Runway Progress Bar */}
      <div className="relative h-6 bg-[#0E1018] rounded-2xl overflow-hidden p-1 border border-[#212638]">
        {/* Projected spend shadow zone */}
        <div
          className="absolute inset-y-1 left-1 rounded-xl transition-all duration-700 opacity-30"
          style={{
            width: `calc(${projectedPct}% - 8px)`,
            background: forecast.isOverspending ? '#F43F5E' : '#10B981',
          }}
        />

        {/* Actual spend solid bar */}
        <div
          className="absolute inset-y-1 left-1 rounded-xl transition-all duration-700"
          style={{
            width: `calc(${spentPct}% - 8px)`,
            background: forecast.isOverspending
              ? 'linear-gradient(90deg, #F59E0B, #F43F5E)'
              : 'linear-gradient(90deg, #059669, #10B981)',
          }}
        />

        {/* Current day indicator */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white/70 rounded-full z-10"
          style={{ left: `${monthProgressPct}%` }}
          title={`Day ${forecast.daysPassed} of ${forecast.daysInMonth}`}
        />
      </div>

      {/* Legend & Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
        <div className="p-2 rounded-xl bg-[#141620] border border-[#212638]">
          <span className="text-[10px] text-slate-400 block font-medium">Spent So Far</span>
          <span className="font-bold text-white mt-0.5 block">{formatBDT(forecast.totalSpentThisMonth)}</span>
        </div>
        <div className="p-2 rounded-xl bg-[#141620] border border-[#212638]">
          <span className="text-[10px] text-slate-400 block font-medium">Projected Total</span>
          <span className={`font-bold mt-0.5 block ${forecast.isOverspending ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formatBDT(forecast.projectedSpend)}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-[#141620] border border-[#212638]">
          <span className="text-[10px] text-slate-400 block font-medium">Monthly Salary</span>
          <span className="font-bold text-slate-300 mt-0.5 block">{formatBDT(forecast.salary)}</span>
        </div>
      </div>
    </div>
  );
}
