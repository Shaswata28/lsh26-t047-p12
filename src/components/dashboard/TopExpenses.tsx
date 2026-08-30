'use client';

import { type Expense } from '@/types';
import { CATEGORY_META, getMerchantBadge } from '@/lib/utils/categories';
import { formatBDT } from '@/lib/utils/currency';
import { formatDateShort } from '@/lib/utils/date';
import { Receipt } from 'lucide-react';

export default function TopExpenses({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return <p className="text-slate-500 text-xs py-2 text-center">No transactions recorded yet.</p>;
  }

  return (
    <div className="divide-y divide-[#1E2232]">
      {expenses.map((e) => {
        const meta = CATEGORY_META[e.category] ?? CATEGORY_META['Other'];
        const badge = getMerchantBadge(e.shop, e.category);

        return (
          <div
            key={e.id}
            className="py-2.5 flex items-center gap-3 first:pt-0 last:pb-0"
          >
            {/* Merchant Avatar */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${badge.bg} ${badge.textColor}`}>
              {badge.initial}
            </div>

            {/* Merchant details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white truncate">
                  {e.shop || e.category}
                </p>
                {e.receipt_url && (
                  <Receipt className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-400">
                  {formatDateShort(e.date)}
                </span>
                <span className="text-slate-600 text-[10px]">•</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${meta.tagBg}`}>
                  {e.category}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold text-slate-100">
                - {formatBDT(e.amount)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
