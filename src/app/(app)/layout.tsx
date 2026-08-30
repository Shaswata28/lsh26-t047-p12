'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  History,
  TrendingUp,
  PiggyBank,
  Plus,
} from 'lucide-react';
import { useProfileStore } from '@/lib/store/profileStore';
import { useExpenseStore } from '@/lib/store/expenseStore';
import AddExpenseModal from '@/components/expense/AddExpenseModal';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/expenses', label: 'History', icon: History },
  { href: '/forecast', label: 'Forecast', icon: TrendingUp },
  { href: '/pockets', label: 'Pockets', icon: PiggyBank },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, fetchProfile } = useProfileStore();
  const { fetchExpenses } = useExpenseStore();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [initialTab, setInitialTab] = useState<'manual' | 'receipt'>('manual');

  useEffect(() => {
    fetchProfile();
    fetchExpenses();
  }, [fetchProfile, fetchExpenses]);

  return (
    <div className="min-h-screen bg-[#07080C] text-[#F3F4F6] flex justify-center selection:bg-emerald-500/30">
      {/* Sleek Mobile Canvas */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-[#0B0C12] border-x border-[#1C2030]/60 relative shadow-2xl overflow-hidden pb-20">
        
        {/* Clean, Native Mobile Header with clickable User Profile */}
        <header className="sticky top-0 z-30 bg-[#0B0C12]/95 backdrop-blur-md px-4 py-3 border-b border-[#1A1D2B]/80 flex items-center justify-between safe-top">
          <Link
            href="/settings"
            className="flex items-center gap-2.5 hover:opacity-85 active:scale-95 transition-all p-1 -m-1 rounded-xl group"
            title="View Profile & Settings"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-[#07080C] font-black text-xs flex items-center justify-center shadow-sm group-hover:ring-2 group-hover:ring-emerald-500/40 transition-all">
              {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'PL'}
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-tight leading-tight group-hover:text-emerald-400 transition-colors">
                {profile?.name || 'Personal Ledger'}
              </p>
            </div>
          </Link>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-3.5 py-3">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile Fixed Bottom Dock Navigation */}
        <nav className="fixed bottom-0 z-40 w-full max-w-md bg-[#0D0E15]/95 backdrop-blur-xl border-t border-[#1E2232] px-3 pt-1.5 safe-bottom shadow-2xl">
          <div className="flex items-center justify-around relative">
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-150 ${
                    active ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className={`p-1 rounded-xl transition-all ${active ? 'bg-emerald-500/15' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${active ? 'font-bold text-emerald-300' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Elevated Primary Action "+" Button */}
            <div className="relative -top-2.5">
              <button
                id="fab-add-expense"
                onClick={() => {
                  setInitialTab('manual');
                  setShowAddExpense(true);
                }}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-[#07080C] shadow-lg shadow-emerald-500/25 flex items-center justify-center active:scale-90 transition-transform ring-4 ring-[#0B0C12]"
                aria-label="Add transaction"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>

            {navItems.slice(2, 4).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-150 ${
                    active ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className={`p-1 rounded-xl transition-all ${active ? 'bg-emerald-500/15' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${active ? 'font-bold text-emerald-300' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Add Expense Bottom Sheet */}
      <AnimatePresence>
        {showAddExpense && (
          <AddExpenseModal
            initialTab={initialTab}
            onClose={() => setShowAddExpense(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
