import { Habit } from '../types';

export function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  const now = new Date();
  return formatDateKey(now);
}

/**
 * Formats a Date object as YYYY-MM-DD using local calendar year, month, and date
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = padZero(date.getMonth() + 1);
  const d = padZero(date.getDate());
  return `${y}-${m}-${d}`;
}

/**
 * Parses a YYYY-MM-DD string into a local Date with hours set to 00:00:00
 */
export function parseDateKey(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return new Date();
  }
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return new Date(y, m, d, 0, 0, 0, 0);
}

/**
 * Adds or subtracts days to a YYYY-MM-DD string safely
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseDateKey(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateKey(d);
}

/**
 * Returns the difference in calendar days between two YYYY-MM-DD strings (end - start)
 */
export function diffInDays(startStr: string, endStr: string): number {
  const s = parseDateKey(startStr);
  const e = parseDateKey(endStr);
  const utc1 = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
  const utc2 = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / msPerDay);
}

/**
 * Gets 1-indexed challenge day number (e.g. Day 1, Day 12).
 * Returns <= 0 if targetDate is before startDate.
 */
export function getChallengeDayNumber(startDateStr: string, targetDateStr: string): number {
  const diff = diffInDays(startDateStr, targetDateStr);
  return diff >= 0 ? diff + 1 : diff;
}

/**
 * Checks whether a given calendar day is scheduled for a habit
 */
export function isDayScheduledForHabit(habit: Habit, dateStr: string): boolean {
  // If habit was archived prior to this date, not scheduled
  if (habit.archivedAt && habit.archivedAt < dateStr) {
    return false;
  }
  // If habit activeFrom is after this date, not scheduled
  if (habit.activeFrom && habit.activeFrom > dateStr) {
    return false;
  }

  const d = parseDateKey(dateStr);
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday

  if (habit.schedule === 'daily') {
    return true;
  }

  if (habit.schedule === 'weekdays') {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  if (habit.schedule === 'custom' && habit.customDays) {
    return habit.customDays.includes(dayOfWeek);
  }

  return true;
}

/**
 * Generates an array of all date strings (YYYY-MM-DD) for a challenge
 */
export function generateDateRange(startDateStr: string, duration: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < duration; i++) {
    dates.push(addDays(startDateStr, i));
  }
  return dates;
}

/**
 * Friendly readable format: e.g. "Wed, Oct 29" or "Oct 29, 2026"
 */
export function formatDisplayDate(dateStr: string, style: 'short' | 'full' | 'day_month' = 'short'): string {
  const d = parseDateKey(dateStr);
  if (style === 'day_month') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (style === 'full') {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
