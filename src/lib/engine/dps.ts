import { type DPSProjection } from '@/types';
import { format } from 'date-fns';
import { formatBDT } from '../utils/currency';

// Stated rate in UI: 7.5% Annual DPS, compounded monthly
export const DPS_ANNUAL_RATE = 0.075;
export const DPS_RATE_DISPLAY = '7.5% Annual DPS';
export const DPS_COMPOUNDING = 'Monthly';

/**
 * Standard compound interest formula for regular regular monthly DPS deposits:
 * FV = P * [((1 + r/12)^n - 1) / (r/12)] * (1 + r/12)
 *
 * P = Effective monthly contribution (e.g. 4,000 BDT)
 * r = 0.075 (7.5% Annual DPS)
 * n = Forecasted months to completion (e.g. 15)
 */
export function calculateFutureValueDPS(
  monthlyDeposit: number,
  months: number,
  annualRate = DPS_ANNUAL_RATE
): number {
  if (months <= 0 || monthlyDeposit <= 0) return 0;
  const r = annualRate;
  const mRate = r / 12;
  const fv = monthlyDeposit * ((Math.pow(1 + mRate, months) - 1) / mRate) * (1 + mRate);
  return Math.round(fv * 100) / 100;
}

/**
 * Calculate DPS projections month-by-month for tables & charts.
 */
export function calculateDPS(
  monthlyDeposit: number,
  months: number,
  annualRate = DPS_ANNUAL_RATE
): DPSProjection[] {
  const monthlyRate = annualRate / 12;
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
 * Get final DPS value after N months using standard formula
 */
export function dpsTotal(monthlyDeposit: number, months: number): number {
  if (months <= 0 || monthlyDeposit <= 0) return 0;
  return calculateFutureValueDPS(monthlyDeposit, months);
}

/**
 * Total interest earned over N months: FV - (P * n)
 */
export function dpsInterest(monthlyDeposit: number, months: number): number {
  if (months <= 0 || monthlyDeposit <= 0) return 0;
  const fv = calculateFutureValueDPS(monthlyDeposit, months);
  const principal = monthlyDeposit * months;
  return Math.max(0, Math.round((fv - principal) * 100) / 100);
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
  if (effective <= 0) return null; // Cannot complete — zero surplus

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

/**
 * Generates the user-requested DPS suggestion insight string:
 * "Based on your current spending, you will reach this goal in November 2027 (15 months).
 *  If you deposited this amount into a 7.5% DPS instead, you would earn an extra 4,250 BDT in interest over the same period."
 */
export function getDPSInsightText(
  target: number,
  saved: number,
  monthlyContribution: number,
  forecastSurplus: number
): {
  headline: string;
  detail: string;
  interestEarned: number;
  months: number | null;
  completionDate: Date | null;
} {
  const months = pocketCompletionMonths(target, saved, monthlyContribution, forecastSurplus);
  const completionDate = pocketCompletionDate(target, saved, monthlyContribution, forecastSurplus);
  const effectiveContrib = Math.min(monthlyContribution, Math.max(forecastSurplus, 0));

  if (!months || months <= 0 || !completionDate) {
    return {
      headline: 'Delayed (Zero forecast surplus)',
      detail: 'Increase your monthly cash surplus to establish an active DPS schedule.',
      interestEarned: 0,
      months: null,
      completionDate: null,
    };
  }

  const interest = dpsInterest(effectiveContrib, months);
  const formattedDate = format(completionDate, 'MMMM yyyy');

  return {
    headline: `Reach goal in ${formattedDate} (${months} month${months > 1 ? 's' : ''})`,
    detail: `Based on your current spending, you will reach this goal in ${formattedDate} (${months} month${months > 1 ? 's' : ''}). If you deposited this amount into a ${DPS_RATE_DISPLAY} instead, you would earn an extra ${formatBDT(interest)} in interest over the same period.`,
    interestEarned: interest,
    months,
    completionDate,
  };
}
