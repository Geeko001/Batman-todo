import { describe, it, expect } from 'vitest';
import { addDays, diffInDays, getChallengeDayNumber, isDayScheduledForHabit } from '../date';
import { Habit } from '../../types';

describe('Date Utilities', () => {
  it('correctly calculates difference in calendar days without timezone drift', () => {
    expect(diffInDays('2026-10-01', '2026-10-01')).toBe(0);
    expect(diffInDays('2026-10-01', '2026-10-31')).toBe(30);
    expect(diffInDays('2026-10-01', '2026-11-30')).toBe(60);
  });

  it('correctly adds days across month boundaries', () => {
    expect(addDays('2026-10-30', 2)).toBe('2026-11-01');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('calculates 1-indexed challenge day numbers', () => {
    expect(getChallengeDayNumber('2026-10-01', '2026-10-01')).toBe(1);
    expect(getChallengeDayNumber('2026-10-01', '2026-10-12')).toBe(12);
  });

  it('handles habit schedules (daily, weekdays, custom)', () => {
    const dailyHabit: Habit = {
      id: 'h1',
      challengeId: 'c1',
      name: 'Workout',
      schedule: 'daily',
      activeFrom: '2026-10-01',
      sortOrder: 0
    };

    const weekdayHabit: Habit = {
      id: 'h2',
      challengeId: 'c1',
      name: 'Deep Work',
      schedule: 'weekdays',
      activeFrom: '2026-10-01',
      sortOrder: 1
    };

    // 2026-10-04 is Sunday (day 0), 2026-10-05 is Monday (day 1)
    expect(isDayScheduledForHabit(dailyHabit, '2026-10-04')).toBe(true);
    expect(isDayScheduledForHabit(dailyHabit, '2026-10-05')).toBe(true);

    expect(isDayScheduledForHabit(weekdayHabit, '2026-10-04')).toBe(false); // Sunday
    expect(isDayScheduledForHabit(weekdayHabit, '2026-10-05')).toBe(true); // Monday
  });
});
