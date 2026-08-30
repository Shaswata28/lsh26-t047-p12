'use client';

import { type Insight } from '@/types';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShoppingBag,
  Zap,
} from 'lucide-react';

const severityConfig = {
  info: {
    border: 'border-cyan-500/25',
    bg: 'bg-cyan-500/5',
    iconBg: 'bg-cyan-500/15 text-cyan-400',
    tag: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25',
  },
  warning: {
    border: 'border-amber-500/25',
    bg: 'bg-amber-500/5',
    iconBg: 'bg-amber-500/15 text-amber-400',
    tag: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
  },
  danger: {
    border: 'border-rose-500/25',
    bg: 'bg-rose-500/5',
    iconBg: 'bg-rose-500/15 text-rose-400',
    tag: 'bg-rose-500/15 text-rose-300 border border-rose-500/25',
  },
  success: {
    border: 'border-emerald-500/25',
    bg: 'bg-emerald-500/5',
    iconBg: 'bg-emerald-500/15 text-emerald-400',
    tag: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  },
};

const typeIcons = {
  top_category: ShoppingBag,
  mom_spike: TrendingUp,
  burn_warning: AlertTriangle,
  surplus: CheckCircle2,
  weekend_spend: Calendar,
  large_purchase: Zap,
};

interface InsightCardProps {
  insight: Insight;
  delay?: number;
}

export default function InsightCard({ insight, delay = 0 }: InsightCardProps) {
  const config = severityConfig[insight.severity] ?? severityConfig.info;
  const Icon = typeIcons[insight.type] ?? Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      className={`p-3.5 rounded-2xl border ${config.border} ${config.bg} flex items-start gap-3`}
    >
      <div className={`w-9 h-9 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="text-xs font-bold text-white tracking-tight">
            {insight.title}
          </span>
          {insight.category && (
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${config.tag}`}>
              {insight.category}
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          {insight.description}
        </p>
      </div>
    </motion.div>
  );
}
