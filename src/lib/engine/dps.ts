import { type DPSProjection } from '@/types';

// DPS Rate: 6% per annum, compounded monthly
// Each month: balance = balance + deposit, then interest = balance × rate/12 added
// This matches standard Bangladeshi DPS practice
export const DPS_ANNUAL_RATE = 0.06;
export const DPS_RATE_DISPLAY = '6% p.a.';
export const DPS_COMPOUNDING = 'Monthly';

/**
 * Calculate DPS projections month-by-month.
 * Formula: balance = (balance + deposit) × (1 + r/12) each month
 */
export function calculateDPS(
  monthlyDeposit: number,
  months: number
): DPSProjection[] {
  const monthlyRate = DPS_ANNUAL_RATE / 12;
  const projections: DPSProjection[] = [];
  let balance = 0;
  let totalWithout = 0;

  for (let m = 1; m <= months; m++) {
    balance += monthlyDeposit;
    const interest = balance * monthlyRate;
    balance += interest;
    totalWithout += monthlyDeposit;

    projections.push({
      month: m,
      deposit: monthlyDeposit,
      balance: Math.round(balance * 100) / 100,
      interestEarned: Math.round((balance - totalWithout) * 100) / 100,
      totalWithout,
      totalWith: Math.round(balance * 100) / 100,
    });
  }

  return projections;
}

/**
 * Get final DPS value after N months
 */
export function dpsTotal(monthlyDeposit: number, months: number): number {
  if (months <= 0) return 0;
  const projections = calculateDPS(monthlyDeposit, months);
  return projections[projections.length - 1].totalWith;
}

/**
 * Total interest earned over N months
 */
export function dpsInterest(monthlyDeposit: number, months: number): number {
  if (months <= 0) return 0;
  const projections = calculateDPS(monthlyDeposit, months);
  return projections[projections.length - 1].interestEarned;
}

/**
 * Compute expected completion date for a pocket given forecast surplus.
 * Effective monthly contribution = min(pocket.monthlyContribution, forecastSurplus)
 */
export function pocketCompletionMonths(
  target: number,
  saved: number,
  monthlyContribution: number,
  forecastSurplus: number
): number | null {
  const remaining = target - saved;
  if (remaining <= 0) return 0;

  const effective = Math.min(monthlyContribution, Math.max(forecastSurplus, 0));
  if (effective <= 0) return null; // Cannot complete — no surplus

  return Math.ceil(remaining / effective);
}

export function pocketCompletionDate(
  target: number,
  saved: number,
  monthlyContribution: number,
  forecastSurplus: number
): Date | null {
  const months = pocketCompletionMonths(
    target,
    saved,
    monthlyContribution,
    forecastSurplus
  );
  if (months === null) return null;
  if (months === 0) return new Date();

  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}
