export type Category =
  | 'Rent'
  | 'Groceries'
  | 'Food'
  | 'Transport'
  | 'Utilities'
  | 'Mobile'
  | 'Health'
  | 'Education'
  | 'Entertainment'
  | 'Clothing'
  | 'Shopping'
  | 'Savings'
  | 'Other';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  date: string; // ISO date string YYYY-MM-DD
  shop: string;
  category: Category;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Pocket {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  item_details?: string;
  monthly_contribution: number;
  saved_amount: number;
  created_at: string;
  updated_at: string;
}

export interface PocketContribution {
  id: string;
  pocket_id: string;
  user_id: string;
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  monthly_salary: number;
  currency: string;
}

export interface OCRResult {
  amount: number | null;
  date: string | null;
  shop: string | null;
  category: Category | null;
  confidence: {
    amount: number;
    date: number;
    shop: number;
    category: number;
  };
  raw_text?: string;
}

export interface ForecastData {
  salary: number;
  totalSpentThisMonth: number;
  daysPassed: number;
  daysInMonth: number;
  dailyAverage: number;
  projectedSpend: number;
  forecastBalance: number;
  isOverspending: boolean;
  percentBurned: number;
}

export interface Insight {
  id: string;
  type:
    | 'top_category'
    | 'mom_spike'
    | 'burn_warning'
    | 'surplus'
    | 'weekend_spend'
    | 'large_purchase';
  title: string;
  description: string;
  amount?: number;
  category?: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
}

export interface CategorySummary {
  category: Category;
  total: number;
  count: number;
  percentage: number;
  lastMonthTotal: number;
  change: number; // percentage change vs last month
}

export interface DPSProjection {
  month: number;
  deposit: number;
  balance: number;
  interestEarned: number;
  totalWithout: number;
  totalWith: number;
}
