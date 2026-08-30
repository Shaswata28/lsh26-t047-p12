/**
 * Seed script — loads PUB-01 sample data into Supabase for the logged-in user.
 * Run with: npx tsx scripts/seed.ts
 * Set env vars before running:
 * $env:NEXT_PUBLIC_SUPABASE_URL="..."
 * $env:NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
 */

import { createClient } from '@supabase/supabase-js';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://tbeynyjfbvvmqbxjfyws.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable___h4dmCEAZ5yMwryl8EeDw_YhsZslZ0';


const supabase = createClient(supabaseUrl, supabaseKey);

// ── Sample data from PUB-01 ──────────────────────────────────
const SALARY = 50000;
const USER_NAME = 'Rahim Uddin'; // Change to your name

// PUB-01 expenses (March + April 2026)
const EXPENSES = [
  { date: '2026-03-02', category: 'Groceries', shop: 'Meena Bazar', amount: 2475.00 },
  { date: '2026-03-04', category: 'Rent', shop: 'Landlord', amount: 16000.00 },
  { date: '2026-03-04', category: 'Utilities', shop: 'DESCO', amount: 856.50 },
  { date: '2026-03-05', category: 'Education', shop: 'Udemy', amount: 1329.00 },
  { date: '2026-03-05', category: 'Food', shop: 'Madchef', amount: 304.00 },
  { date: '2026-03-06', category: 'Education', shop: 'Udemy', amount: 719.00 },
  { date: '2026-03-06', category: 'Transport', shop: 'Uber', amount: 421.00 },
  { date: '2026-03-07', category: 'Education', shop: 'Bookworm', amount: 501.00 },
  { date: '2026-03-07', category: 'Food', shop: 'Panda Garden', amount: 505.00 },
  { date: '2026-03-07', category: 'Food', shop: 'Panda Garden', amount: 585.00 },
  { date: '2026-03-08', category: 'Health', shop: 'Lazz Pharma', amount: 1477.00 },
  { date: '2026-03-11', category: 'Mobile', shop: 'GP recharge', amount: 422.00 },
  { date: '2026-03-12', category: 'Health', shop: 'Lazz Pharma', amount: 710.50 },
  { date: '2026-03-16', category: 'Education', shop: 'Udemy', amount: 2563.00 },
  { date: '2026-03-16', category: 'Food', shop: 'Panda Garden', amount: 348.00 },
  { date: '2026-03-17', category: 'Entertainment', shop: 'Netflix', amount: 882.50 },
  { date: '2026-03-17', category: 'Health', shop: 'Popular Diagnostic', amount: 2474.00 },
  { date: '2026-03-18', category: 'Transport', shop: 'Pathao', amount: 415.00 },
  { date: '2026-03-20', category: 'Entertainment', shop: 'Steam', amount: 1132.00 },
  { date: '2026-03-23', category: 'Education', shop: 'Bookworm', amount: 1742.00 },
  { date: '2026-03-28', category: 'Groceries', shop: 'Shwapno', amount: 497.00 },
  { date: '2026-03-28', category: 'Groceries', shop: 'Unimart', amount: 3153.00 },
  { date: '2026-03-29', category: 'Groceries', shop: 'Meena Bazar', amount: 1398.00 },
  { date: '2026-03-29', category: 'Mobile', shop: 'Robi recharge', amount: 667.00 },
  { date: '2026-03-30', category: 'Groceries', shop: 'Agora', amount: 736.50 },
  { date: '2026-03-31', category: 'Education', shop: 'Udemy', amount: 1223.00 },
  { date: '2026-04-03', category: 'Rent', shop: 'Landlord', amount: 16000.00 },
  { date: '2026-04-04', category: 'Food', shop: 'Sultans Dine', amount: 364.00 },
  { date: '2026-04-06', category: 'Food', shop: 'Panda Garden', amount: 492.00 },
  { date: '2026-04-07', category: 'Mobile', shop: 'GP recharge', amount: 535.50 },
  { date: '2026-04-07', category: 'Utilities', shop: 'DESCO', amount: 2599.50 },
  { date: '2026-04-08', category: 'Mobile', shop: 'bKash', amount: 679.00 },
  { date: '2026-04-11', category: 'Groceries', shop: 'Unimart', amount: 546.50 },
  { date: '2026-04-11', category: 'Mobile', shop: 'Robi recharge', amount: 691.00 },
  { date: '2026-04-12', category: 'Transport', shop: 'BRTC bus', amount: 461.00 },
  { date: '2026-04-13', category: 'Entertainment', shop: 'Star Cineplex', amount: 1326.00 },
  { date: '2026-04-13', category: 'Entertainment', shop: 'Star Cineplex', amount: 738.00 },
  { date: '2026-04-15', category: 'Mobile', shop: 'GP recharge', amount: 919.50 },
  { date: '2026-04-15', category: 'Mobile', shop: 'bKash', amount: 764.00 },
  { date: '2026-04-15', category: 'Transport', shop: 'CNG', amount: 232.00 },
  { date: '2026-04-17', category: 'Food', shop: 'Madchef', amount: 735.00 },
];

const POCKETS = [
  { name: 'Wedding', item_details: 'Reception hall booking', target_amount: 300000, monthly_contribution: 20000 },
  { name: 'Laptop', item_details: 'MacBook Air M4', target_amount: 145000, monthly_contribution: 12000 },
  { name: 'Bike', item_details: 'Honda Livo', target_amount: 150000, monthly_contribution: 9000 },
];

async function seed() {
  // Get the current user — must be logged in via service role or provide email
  const { data: { users }, error: listError } = await (supabase as any).auth.admin.listUsers();
  
  if (listError || !users?.length) {
    console.error('No users found. Log in first, then run seed.');
    console.log('Hint: Use service role key for admin operations, or sign in a user first.');
    process.exit(1);
  }

  const user = users[0]; // First user
  const userId = user.id;
  console.log(`Seeding for user: ${user.email} (${userId})`);

  // Upsert profile
  await supabase.from('profiles').upsert({
    user_id: userId,
    name: USER_NAME,
    monthly_salary: SALARY,
  }, { onConflict: 'user_id' });
  console.log('✓ Profile upserted');

  // Insert expenses
  const expenseRows = EXPENSES.map((e) => ({
    ...e,
    user_id: userId,
  }));
  const { error: expErr } = await supabase.from('expenses').insert(expenseRows);
  if (expErr) console.error('Expenses error:', expErr.message);
  else console.log(`✓ ${EXPENSES.length} expenses inserted`);

  // Insert pockets
  const pocketRows = POCKETS.map((p) => ({
    ...p,
    user_id: userId,
    saved_amount: 0,
  }));
  const { error: pocketErr } = await supabase.from('pockets').insert(pocketRows);
  if (pocketErr) console.error('Pockets error:', pocketErr.message);
  else console.log(`✓ ${POCKETS.length} pockets inserted`);

  console.log('\n✅ Seed complete!');
}

seed().catch(console.error);
