import {
  format,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  getDate,
  parseISO,
  isWeekend,
  subMonths,
} from 'date-fns';

export function today(): Date {
  return new Date();
}

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function currentMonthStr(): string {
  return format(new Date(), 'yyyy-MM');
}

export function lastMonthStr(): string {
  return format(subMonths(new Date(), 1), 'yyyy-MM');
}

export function daysInCurrentMonth(): number {
  return getDaysInMonth(new Date());
}

export function daysPassed(): number {
  return getDate(new Date());
}

export function daysRemaining(): number {
  return getDaysInMonth(new Date()) - getDate(new Date());
}

export function startOfCurrentMonth(): Date {
  return startOfMonth(new Date());
}

export function endOfCurrentMonth(): Date {
  return endOfMonth(new Date());
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy');
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM');
}

export function isWeekendDate(dateStr: string): boolean {
  return isWeekend(parseISO(dateStr));
}

export function monthYear(dateStr: string): string {
  return format(parseISO(dateStr + '-01'), 'MMM yyyy');
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
