'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { type CategorySummary } from '@/types';
import { CATEGORY_META } from '@/lib/utils/categories';
import { formatBDT } from '@/lib/utils/currency';

interface CategoryDonutProps {
  summaries: CategorySummary[];
}

export default function CategoryDonut({ summaries }: CategoryDonutProps) {
  const topCategories = summaries.slice(0, 6);
  const data = topCategories.map((s) => ({
    name: s.category,
    value: s.total,
    color: CATEGORY_META[s.category]?.hex ?? '#10B981',
  }));

  const totalSpent = summaries.reduce((acc, curr) => acc + curr.total, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const item = payload[0];
      return (
        <div className="bg-[#0E1017] border border-[#2B3044] rounded-xl px-2.5 py-1.5 shadow-xl text-center">
          <p className="text-[10px] text-slate-400 font-medium">{item.name}</p>
          <p className="text-xs font-bold text-white">{formatBDT(item.value)}</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="h-36 flex items-center justify-center text-slate-500 text-xs">
        No expense data yet
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      {/* Donut Chart with Center Total */}
      <div className="h-36 w-36 relative flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={62}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Total</span>
          <span className="text-[11px] font-extrabold text-white">৳{Math.round(totalSpent / 1000)}k</span>
        </div>
      </div>

      {/* Legend List */}
      <div className="flex-1 space-y-1.5 min-w-0 pr-1">
        {topCategories.slice(0, 4).map((cat) => {
          const meta = CATEGORY_META[cat.category] ?? CATEGORY_META['Other'];
          return (
            <div key={cat.category} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.hex }} />
                <span className="text-slate-300 font-medium truncate">{cat.category}</span>
              </div>
              <span className="text-slate-400 font-semibold flex-shrink-0">
                {cat.percentage.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
