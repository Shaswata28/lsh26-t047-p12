'use client';

interface ForecastCardProps {
  label: string;
  value: string;
  subtitle: string;
  variant: 'neutral' | 'success' | 'danger';
}

const variants = {
  neutral: {
    border: 'border-indigo-500/20',
    bg: 'bg-indigo-600/10',
    valueColor: 'text-indigo-300',
    dot: 'bg-indigo-400',
  },
  success: {
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-600/10',
    valueColor: 'text-emerald-300',
    dot: 'bg-emerald-400',
  },
  danger: {
    border: 'border-red-500/20',
    bg: 'bg-red-600/10',
    valueColor: 'text-red-300',
    dot: 'bg-red-400',
  },
};

export default function ForecastCard({ label, value, subtitle, variant }: ForecastCardProps) {
  const v = variants[variant];
  return (
    <div className={`glass rounded-2xl p-5 border ${v.border} ${v.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${v.dot} pulse-dot`} />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-3xl font-bold ${v.valueColor} mb-1`}>{value}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}
