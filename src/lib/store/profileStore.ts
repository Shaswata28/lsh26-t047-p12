import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { type Profile } from '@/types';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,

  fetchProfile: async () => {
    set({ loading: true });
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ loading: false }); return; }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    set({ profile: data ?? null, loading: false });
  },

  updateProfile: async (profileData) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...profileData, user_id: user.id }, { onConflict: 'user_id' })
      .select()
      .single();

    if (!error) set({ profile: data });
  },
}));
