'use client';

import { useEffect, useMemo, useState } from 'react';
import { useExpenseStore } from '@/lib/store/expenseStore';
import { formatBDT } from '@/lib/utils/currency';
import { formatDate, formatDateShort, currentMonthStr } from '@/lib/utils/date';
import { CATEGORY_META, CATEGORIES, getMerchantBadge } from '@/lib/utils/categories';
import { type Expense } from '@/types';
import { Search, Receipt, Plus, Trash2 } from 'lucide-react';
import AddExpenseModal from '@/components/expense/AddExpenseModal';
import { AnimatePresence } from 'framer-motion';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function ExpensesPage() {
  const { expenses, loading, fetchExpenses, deleteExpense } = useExpenseStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        search === '' ||
        e.shop?.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        String(e.amount).includes(search);
      const matchesCategory =
        selectedCategory === 'all' || e.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, selectedCategory]);

  // Group by date (immutable ledger format)
  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>();
    filtered.forEach((e) => {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    });
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remove this transaction record from your ledger?')) return;
    setDeletingId(id);
    await deleteExpense(id);
    setDeletingId(null);
  };

  const thisMonthTotal = useMemo(
    () =>
      expenses
        .filter((e) => e.date.startsWith(currentMonthStr()))
        .reduce((s, e) => s + e.amount, 0),
    [expenses]
  );

  if (loading && expenses.length === 0) {
    return (
      <div className="space-y-3 pt-1">
        <SkeletonCard className="h-14" />
        <SkeletonCard className="h-10" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      {/* Header Summary */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Spending History</h1>
          <p className="text-[11px] text-slate-400">
            Total this month:{' '}
            <span className="text-emerald-400 font-semibold">{formatBDT(thisMonthTotal)}</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          id="search-transactions-input"
          type="text"
          placeholder="Search by merchant, note, or amount..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#12141D] border border-[#232738] rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Horizontal Scrollable Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-3.5 px-3.5 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-emerald-600 text-[#07080C] font-bold shadow-sm'
              : 'bg-[#141620] text-slate-400 border border-[#232738] hover:text-white'
          }`}
        >
          All ({expenses.length})
        </button>

        {CATEGORIES.map((c) => {
          const isSelected = selectedCategory === c;
          const count = expenses.filter((e) => e.category === c).length;
          if (count === 0) return null;

          return (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-[#07080C] font-bold shadow-sm'
                  : 'bg-[#141620] text-slate-400 border border-[#232738] hover:text-white'
              }`}
            >
              <span>{c}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Grouped Activity Ledger */}
      {grouped.length === 0 ? (
        <div className="mobile-card p-10 text-center space-y-2 mt-4">
          <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs font-medium text-slate-300">No matching transactions</p>
          <p className="text-[11px] text-slate-500">Try adjusting your search or category filter</p>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {grouped.map(([date, dayExpenses]) => {
            const daySum = dayExpenses.reduce((s, e) => s + e.amount, 0);

            return (
              <div key={date} className="space-y-1.5">
                {/* Date Header with Daily Subtotal */}
                <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-400">
                  <span>{formatDate(date)}</span>
                  <span className="text-slate-500 font-medium">Daily: {formatBDT(daySum)}</span>
                </div>

                {/* Day Card Group */}
                <div className="mobile-card divide-y divide-[#1F2332] overflow-hidden">
                  {dayExpenses.map((expense) => {
                    const meta = CATEGORY_META[expense.category] ?? CATEGORY_META['Other'];
                    const badge = getMerchantBadge(expense.shop, expense.category);

                    return (
                      <div
                        key={expense.id}
                        className="p-3 flex items-center gap-3"
                      >
                        {/* Merchant Avatar */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${badge.bg} ${badge.textColor}`}>
                          {badge.initial}
                        </div>

                        {/* Title & Category */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-white truncate">
                              {expense.shop || expense.category}
                            </p>
                            {expense.receipt_url && (
                              <Receipt className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${meta.tagBg}`}>
                              {expense.category}
                            </span>
                            {expense.notes && (
                              <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                                {expense.notes}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount & Delete */}
                        <div className="text-right flex-shrink-0 flex items-center gap-2">
                          <p className="text-xs font-extrabold text-slate-100">
                            - {formatBDT(expense.amount)}
                          </p>

                          <button
                            type="button"
                            onClick={(e) => handleDelete(expense.id, e)}
                            disabled={deletingId === expense.id}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-[#202434] transition-colors"
                            title="Remove transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddExpenseModal
            onClose={() => {
              setShowAddModal(false);
              fetchExpenses();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
