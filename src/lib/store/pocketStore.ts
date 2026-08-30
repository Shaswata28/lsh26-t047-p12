import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { type Pocket, type PocketContribution } from '@/types';
import { useExpenseStore } from './expenseStore';

interface PocketState {
  pockets: Pocket[];
  contributions: PocketContribution[];
  loading: boolean;
  error: string | null;
  fetchPockets: () => Promise<void>;
  addPocket: (data: Omit<Pocket, 'id' | 'user_id' | 'saved_amount' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePocket: (id: string, data: Partial<Pocket>) => Promise<void>;
  deletePocket: (id: string) => Promise<void>;
  addContribution: (pocketId: string, amount: number, date: string, notes?: string) => Promise<void>;
  fetchContributions: (pocketId: string) => Promise<void>;
}

export const usePocketStore = create<PocketState>((set, get) => ({
  pockets: [],
  contributions: [],
  loading: false,
  error: null,

  fetchPockets: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pockets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) set({ error: error.message, loading: false });
    else set({ pockets: data ?? [], loading: false });
  },

  addPocket: async (pocketData) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('pockets')
      .insert({ ...pocketData, user_id: user.id, saved_amount: 0 })
      .select()
      .single();

    if (error) { set({ error: error.message }); return; }
    set((state) => ({ pockets: [data, ...state.pockets] }));
  },

  updatePocket: async (id, pocketData) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pockets')
      .update(pocketData)
      .eq('id', id)
      .select()
      .single();

    if (error) { set({ error: error.message }); return; }
    set((state) => ({
      pockets: state.pockets.map((p) => (p.id === id ? data : p)),
    }));
  },

  deletePocket: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from('pockets').delete().eq('id', id);
    if (error) { set({ error: error.message }); return; }
    set((state) => ({ pockets: state.pockets.filter((p) => p.id !== id) }));
  },

  addContribution: async (pocketId, amount, date, notes) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Record contribution in pocket_contributions table
    const { error: contribError } = await supabase
      .from('pocket_contributions')
      .insert({ pocket_id: pocketId, user_id: user.id, amount, date, notes });

    if (contribError) { set({ error: contribError.message }); return; }

    // 2. Update saved_amount on pocket
    const pocket = get().pockets.find((p) => p.id === pocketId);
    const pocketName = pocket?.name || 'Savings Goal';

    if (pocket) {
      const newSaved = pocket.saved_amount + amount;
      await get().updatePocket(pocketId, { saved_amount: newSaved });
    }

    // 3. Deduct from available cash balance by recording ledger expense entry
    await supabase.from('expenses').insert({
      user_id: user.id,
      amount,
      date,
      shop: `Pocket Deposit: ${pocketName}`,
      category: 'Other',
      notes: notes || `Transferred to savings pocket: ${pocketName}`,
    });

    // 4. Refresh global expenses store so dashboard runway and forecast balances update immediately
    useExpenseStore.getState().fetchExpenses();
  },

  fetchContributions: async (pocketId) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pocket_contributions')
      .select('*')
      .eq('pocket_id', pocketId)
      .order('date', { ascending: false });

    if (!error) set({ contributions: data ?? [] });
  },
}));
