import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { type Expense, type Category } from '@/types';

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  addExpense: (data: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Expense | null>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  loading: false,
  error: null,

  fetchExpenses: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ expenses: data ?? [], loading: false });
    }
  },

  addExpense: async (expenseData) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...expenseData, user_id: user.id })
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }

    set((state) => ({
      expenses: [data, ...state.expenses],
    }));
    return data;
  },

  updateExpense: async (id, expenseData) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('expenses')
      .update(expenseData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }

    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? data : e)),
    }));
  },

  deleteExpense: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from('expenses').delete().eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }

    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
  },
}));
