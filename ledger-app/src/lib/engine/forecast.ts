import { type Expense, type ForecastData, type Insight, type CategorySummary } from '@/types';
import {
  daysInCurrentMonth,
  daysPassed,
  currentMonthStr,
  lastMonthStr,
  isWeekendDate,
  formatDate,
} from '@/lib/utils/date';
import { formatBDT } from '@/lib/utils/currency';

// ── Forecast Engine ─────────────────────────────────────────
export function computeForecast(
  expenses: Expense[],
  salary: number
): ForecastData {
  const thisMonth = currentMonthStr();
  const thisMonthExpenses = expenses.filter((e) =>
    e.date.startsWith(thisMonth)
  );

  const totalSpentThisMonth = thisMonthExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const passed = daysPassed();
  const inMonth = daysInCurrentMonth();

  const dailyAverage = passed > 0 ? totalSpentThisMonth / passed : 0;
  const projectedSpend = dailyAverage * inMonth;
  const forecastBalance = salary - projectedSpend;

  return {
    salary,
    totalSpentThisMonth,
    daysPassed: passed,
    daysInMonth: inMonth,
    dailyAverage,
    projectedSpend,
    forecastBalance,
    isOverspending: forecastBalance < 0,
    percentBurned: salary > 0 ? (totalSpentThisMonth / salary) * 100 : 0,
  };
}

// ── Category Summaries ───────────────────────────────────────
export function computeCategorySummaries(
  expenses: Expense[],
  salary: number
): CategorySummary[] {
  const thisMonth = currentMonthStr();
  const lastMonth = lastMonthStr();

  const thisMonthExp = expenses.filter((e) => e.date.startsWith(thisMonth));
  const lastMonthExp = expenses.filter((e) => e.date.startsWith(lastMonth));

  const totalThisMonth = thisMonthExp.reduce((s, e) => s + e.amount, 0);

  const categoryMap = new Map<string, { this: number; last: number; count: number }>();

  thisMonthExp.forEach((e) => {
    const prev = categoryMap.get(e.category) ?? { this: 0, last: 0, count: 0 };
    categoryMap.set(e.category, {
      ...prev,
      this: prev.this + e.amount,
      count: prev.count + 1,
    });
  });

  lastMonthExp.forEach((e) => {
    const prev = categoryMap.get(e.category) ?? { this: 0, last: 0, count: 0 };
    categoryMap.set(e.category, { ...prev, last: prev.last + e.amount });
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category: category as CategorySummary['category'],
      total: data.this,
      count: data.count,
      percentage: totalThisMonth > 0 ? (data.this / totalThisMonth) * 100 : 0,
      lastMonthTotal: data.last,
      change:
        data.last > 0
          ? ((data.this - data.last) / data.last) * 100
          : data.this > 0
          ? 100
          : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

// ── Insight Generator ────────────────────────────────────────
export function generateInsights(
  expenses: Expense[],
  salary: number,
  forecast: ForecastData
): Insight[] {
  const thisMonth = currentMonthStr();
  const lastMonth = lastMonthStr();
  const thisMonthExp = expenses.filter((e) => e.date.startsWith(thisMonth));

  // Need at least 3 days of data
  if (forecast.daysPassed < 3 || thisMonthExp.length < 3) return [];

  const insights: Insight[] = [];
  const summaries = computeCategorySummaries(expenses, salary);
  const totalSpent = forecast.totalSpentThisMonth;

  // 1. Top category > 35% of total
  const topCat = summaries[0];
  if (topCat && topCat.percentage > 35) {
    insights.push({
      id: 'top_category',
      type: 'top_category',
      title: `${topCat.category} dominates your spending`,
      description: `${topCat.category} accounts for ${formatBDT(topCat.total)} — ${topCat.percentage.toFixed(0)}% of all spending this month.`,
      amount: topCat.total,
      category: topCat.category,
      severity: topCat.percentage > 50 ? 'danger' : 'warning',
    });
  }

  // 2. Category up > 20% vs last month
  const spikes = summaries
    .filter((s) => s.lastMonthTotal > 0 && s.change > 20)
    .sort((a, b) => b.change - a.change);
  if (spikes.length > 0) {
    const spike = spikes[0];
    insights.push({
      id: 'mom_spike',
      type: 'mom_spike',
      title: `${spike.category} spending jumped this month`,
      description: `You spent ${formatBDT(spike.total)} on ${spike.category} — up ${formatBDT(spike.total - spike.lastMonthTotal)} (+${spike.change.toFixed(0)}%) compared to last month.`,
      amount: spike.total - spike.lastMonthTotal,
      category: spike.category,
      severity: spike.change > 50 ? 'danger' : 'warning',
    });
  }

  // 3. Burn rate warning — projected > 90% of salary
  const burnPct = salary > 0 ? (forecast.projectedSpend / salary) * 100 : 0;
  if (burnPct > 90) {
    const daysLeft = forecast.daysInMonth - forecast.daysPassed;
    const overshoot = forecast.projectedSpend - salary;
    insights.push({
      id: 'burn_warning',
      type: 'burn_warning',
      title: overshoot > 0 ? 'Overspend alert' : 'Tight month ahead',
      description:
        overshoot > 0
          ? `At your current pace you'll exceed your salary by ${formatBDT(overshoot)} with ${daysLeft} days left this month.`
          : `Projected spend (${formatBDT(forecast.projectedSpend)}) is ${burnPct.toFixed(0)}% of your salary — very little room left.`,
      amount: Math.abs(overshoot),
      severity: overshoot > 0 ? 'danger' : 'warning',
    });
  }

  // 4. Surplus opportunity
  if (forecast.forecastBalance > 2000) {
    insights.push({
      id: 'surplus',
      type: 'surplus',
      title: "You're on track for a surplus",
      description: `You're projected to have ${formatBDT(forecast.forecastBalance)} left at month end. Consider allocating to your savings goals.`,
      amount: forecast.forecastBalance,
      severity: 'success',
    });
  }

  // 5. Weekend vs weekday spend
  const weekendExp = thisMonthExp.filter((e) => isWeekendDate(e.date));
  const weekdayExp = thisMonthExp.filter((e) => !isWeekendDate(e.date));
  if (weekendExp.length >= 2 && weekdayExp.length >= 3) {
    const weekendDays = new Set(weekendExp.map((e) => e.date)).size;
    const weekdayDays = new Set(weekdayExp.map((e) => e.date)).size;
    const weekendAvg =
      weekendExp.reduce((s, e) => s + e.amount, 0) / weekendDays;
    const weekdayAvg =
      weekdayExp.reduce((s, e) => s + e.amount, 0) / weekdayDays;
    if (weekendAvg > weekdayAvg * 1.5) {
      const ratio = ((weekendAvg / weekdayAvg - 1) * 100).toFixed(0);
      insights.push({
        id: 'weekend_spend',
        type: 'weekend_spend',
        title: 'Weekend spending is elevated',
        description: `You spend ${ratio}% more per day on weekends (${formatBDT(weekendAvg)}/day) vs weekdays (${formatBDT(weekdayAvg)}/day).`,
        amount: weekendAvg - weekdayAvg,
        severity: 'info',
      });
    }
  }

  // 6. Single large purchase > 15% of salary
  const largePurchase = thisMonthExp
    .filter((e) => salary > 0 && e.amount > salary * 0.15)
    .sort((a, b) => b.amount - a.amount)[0];
  if (largePurchase) {
    insights.push({
      id: 'large_purchase',
      type: 'large_purchase',
      title: 'Large single expense this month',
      description: `Your ${formatBDT(largePurchase.amount)} spend at ${largePurchase.shop} on ${formatDate(largePurchase.date)} was your biggest single transaction — ${((largePurchase.amount / salary) * 100).toFixed(0)}% of your salary.`,
      amount: largePurchase.amount,
      category: largePurchase.category,
      severity: 'info',
    });
  }

  return insights;
}

// ── Daily Spending Array for Charts ─────────────────────────
export function getDailySpending(
  expenses: Expense[]
): { day: number; amount: number }[] {
  const thisMonth = currentMonthStr();
  const thisMonthExp = expenses.filter((e) => e.date.startsWith(thisMonth));
  const inMonth = daysInCurrentMonth();

  const map = new Map<number, number>();
  thisMonthExp.forEach((e) => {
    const day = parseInt(e.date.split('-')[2]);
    map.set(day, (map.get(day) ?? 0) + e.amount);
  });

  return Array.from({ length: inMonth }, (_, i) => ({
    day: i + 1,
    amount: map.get(i + 1) ?? 0,
  }));
}
