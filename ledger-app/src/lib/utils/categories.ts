import { type Category } from '@/types';

export const CATEGORIES: Category[] = [
  'Rent',
  'Groceries',
  'Food',
  'Transport',
  'Utilities',
  'Mobile',
  'Health',
  'Education',
  'Entertainment',
  'Clothing',
  'Shopping',
  'Savings',
  'Other',
];

export const CATEGORY_META: Record<
  Category,
  { color: string; bg: string; code: string; hex: string; tagBg: string }
> = {
  Rent: {
    color: 'text-violet-300',
    bg: 'bg-violet-500/15 border border-violet-500/25',
    tagBg: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    code: 'RN',
    hex: '#a78bfa',
  },
  Groceries: {
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/15 border border-emerald-500/25',
    tagBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    code: 'GR',
    hex: '#34d399',
  },
  Food: {
    color: 'text-amber-300',
    bg: 'bg-amber-500/15 border border-amber-500/25',
    tagBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    code: 'FD',
    hex: '#fbbf24',
  },
  Transport: {
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/15 border border-cyan-500/25',
    tagBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    code: 'TR',
    hex: '#22d3ee',
  },
  Utilities: {
    color: 'text-sky-300',
    bg: 'bg-sky-500/15 border border-sky-500/25',
    tagBg: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    code: 'UT',
    hex: '#38bdf8',
  },
  Mobile: {
    color: 'text-rose-300',
    bg: 'bg-rose-500/15 border border-rose-500/25',
    tagBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    code: 'MB',
    hex: '#fb7185',
  },
  Health: {
    color: 'text-red-300',
    bg: 'bg-red-500/15 border border-red-500/25',
    tagBg: 'bg-red-500/10 text-red-400 border border-red-500/20',
    code: 'HL',
    hex: '#f87171',
  },
  Education: {
    color: 'text-indigo-300',
    bg: 'bg-indigo-500/15 border border-indigo-500/25',
    tagBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    code: 'ED',
    hex: '#818cf8',
  },
  Entertainment: {
    color: 'text-yellow-300',
    bg: 'bg-yellow-500/15 border border-yellow-500/25',
    tagBg: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    code: 'EN',
    hex: '#facc15',
  },
  Clothing: {
    color: 'text-pink-300',
    bg: 'bg-pink-500/15 border border-pink-500/25',
    tagBg: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
    code: 'CL',
    hex: '#f472b6',
  },
  Shopping: {
    color: 'text-teal-300',
    bg: 'bg-teal-500/15 border border-teal-500/25',
    tagBg: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
    code: 'SH',
    hex: '#2dd4bf',
  },
  Savings: {
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/20 border border-emerald-500/30',
    tagBg: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
    code: 'SV',
    hex: '#10b981',
  },
  Other: {
    color: 'text-slate-300',
    bg: 'bg-slate-700/20 border border-slate-700/30',
    tagBg: 'bg-slate-700/20 text-slate-400 border border-slate-700/30',
    code: 'OT',
    hex: '#94a3b8',
  },
};

/**
 * Returns a recognizable brand avatar color & initial for Dhaka merchants
 */
export function getMerchantBadge(shopName: string, category: Category): { initial: string; bg: string; textColor: string } {
  const name = (shopName || '').toLowerCase();
  
  if (name.includes('meena') || name.includes('bazar')) return { initial: 'MB', bg: 'bg-emerald-950 border border-emerald-800/60', textColor: 'text-emerald-300' };
  if (name.includes('shwapno')) return { initial: 'SW', bg: 'bg-red-950 border border-red-800/60', textColor: 'text-red-300' };
  if (name.includes('unimart')) return { initial: 'UM', bg: 'bg-amber-950 border border-amber-800/60', textColor: 'text-amber-300' };
  if (name.includes('agora')) return { initial: 'AG', bg: 'bg-green-950 border border-green-800/60', textColor: 'text-green-300' };
  if (name.includes('desco') || name.includes('wasa') || name.includes('titas')) return { initial: 'DS', bg: 'bg-sky-950 border border-sky-800/60', textColor: 'text-sky-300' };
  if (name.includes('uber')) return { initial: 'UB', bg: 'bg-zinc-900 border border-zinc-700/60', textColor: 'text-zinc-100' };
  if (name.includes('pathao')) return { initial: 'PA', bg: 'bg-red-950 border border-red-800/60', textColor: 'text-red-400' };
  if (name.includes('bkash')) return { initial: 'bK', bg: 'bg-pink-950 border border-pink-800/60', textColor: 'text-pink-400' };
  if (name.includes('robi') || name.includes('gp') || name.includes('grameen')) return { initial: 'GP', bg: 'bg-blue-950 border border-blue-800/60', textColor: 'text-blue-300' };
  if (name.includes('star cineplex') || name.includes('cineplex')) return { initial: 'SC', bg: 'bg-yellow-950 border border-yellow-800/60', textColor: 'text-yellow-400' };
  if (name.includes('lazz') || name.includes('pharma')) return { initial: 'LP', bg: 'bg-emerald-950 border border-emerald-800/60', textColor: 'text-emerald-400' };
  if (name.includes('popular') || name.includes('diagnostic')) return { initial: 'PD', bg: 'bg-cyan-950 border border-cyan-800/60', textColor: 'text-cyan-400' };
  if (name.includes('udemy')) return { initial: 'UD', bg: 'bg-purple-950 border border-purple-800/60', textColor: 'text-purple-300' };
  if (name.includes('landlord') || name.includes('rent')) return { initial: 'LL', bg: 'bg-violet-950 border border-violet-800/60', textColor: 'text-violet-300' };
  if (name.includes('yellow') || name.includes('aarong') || name.includes('cats eye')) return { initial: 'YL', bg: 'bg-amber-950 border border-amber-800/60', textColor: 'text-amber-300' };
  
  // Default to first letters of shop or category
  const letters = (shopName || category).replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'TX';
  return { initial: letters, bg: 'bg-[#1D2130] border border-[#2D3349]', textColor: 'text-slate-200' };
}
