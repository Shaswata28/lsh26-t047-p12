'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { formatBDT } from '@/lib/utils/currency';
import { daysPassed } from '@/lib/utils/date';

interface DailyBarChartProps {
  data: { day: number; amount: number }[];
}

export default function DailyBarChart({ data }: DailyBarChartProps) {
  const today = daysPassed();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length && payload[0].value > 0) {
      return (
        <div className="glass rounded-lg px-3 py-2 border border-slate-700">
          <p className="text-xs text-slate-400">Day {label}</p>
          <p className="text-sm font-semibold text-white">{formatBDT(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={6} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#475569' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.day}
                fill={
                  entry.day === today
                    ? '#6366f1'
                    : entry.day < today
                    ? '#3730a3'
                    : '#1e2a40'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
