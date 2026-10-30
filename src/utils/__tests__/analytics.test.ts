import { describe, it, expect } from 'vitest';
import { calculateLikelihood, calculateStreaks } from '../analytics';
import { Challenge, DailyLog, Habit } from '../../types';

describe('Analytics & Likelihood Heuristic', () => {
  const challenge: Challenge = {
    id: 'c1',
    title: 'Discipline Protocol',
    durationDays: 30,
    startDate: '2026-10-01',
    endDate: '2026-10-30',
    status: 'active',
    createdAt: '',
    updatedAt: ''
  };

  const habits: Habit[] = [
    { id: 'h1', challengeId: 'c1', name: 'Physical Conditioning', schedule: 'daily', activeFrom: '2026-10-01', sortOrder: 0 },
    { id: 'h2', challengeId: 'c1', name: 'Combat Intelligence', schedule: 'daily', activeFrom: '2026-10-01', sortOrder: 1 }
  ];

  it('shows building baseline when fewer than 5 eligible days logged', () => {
    const logs: DailyLog[] = [
      { id: 'l1', challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: '2026-10-01', completed: true },
      { id: 'l2', challengeId: 'c1', itemId: 'h2', itemType: 'habit', date: '2026-10-01', completed: true },
      { id: 'l3', challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: '2026-10-02', completed: true }
    ];

    const assessment = calculateLikelihood(challenge, habits, [], logs, '2026-10-04');
    expect(assessment.status).toBe('building_baseline');
    expect(assessment.percentage).toBe(0);
  });

  it('calculates transparent finish likelihood once 5+ days are completed', () => {
    const logs: DailyLog[] = [];
    // 6 days of 100% completion
    for (let i = 1; i <= 6; i++) {
      const d = `2026-10-0${i}`;
      logs.push({ id: `l1-${i}`, challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: d, completed: true });
      logs.push({ id: `l2-${i}`, challengeId: 'c1', itemId: 'h2', itemType: 'habit', date: d, completed: true });
    }

    const assessment = calculateLikelihood(challenge, habits, [], logs, '2026-10-07');
    expect(assessment.status).toBe('calculated');
    expect(assessment.percentage).toBeGreaterThanOrEqual(90);
    expect(assessment.percentage).toBeLessThanOrEqual(95); // capped softly
    expect(assessment.overallConsistency).toBe(100);
  });

  it('computes streaks correctly with 70% threshold', () => {
    const logs: DailyLog[] = [
      // Day 1: 2/2 = 100% (success)
      { id: '1', challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: '2026-10-01', completed: true },
      { id: '2', challengeId: 'c1', itemId: 'h2', itemType: 'habit', date: '2026-10-01', completed: true },
      // Day 2: 2/2 = 100% (success)
      { id: '3', challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: '2026-10-02', completed: true },
      { id: '4', challengeId: 'c1', itemId: 'h2', itemType: 'habit', date: '2026-10-02', completed: true },
      // Day 3: 1/2 = 50% (< 70%, miss)
      { id: '5', challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: '2026-10-03', completed: true },
      { id: '6', challengeId: 'c1', itemId: 'h2', itemType: 'habit', date: '2026-10-03', completed: false },
      // Day 4: 2/2 = 100% (success)
      { id: '7', challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: '2026-10-04', completed: true },
      { id: '8', challengeId: 'c1', itemId: 'h2', itemType: 'habit', date: '2026-10-04', completed: true }
    ];

    const streaks = calculateStreaks(challenge, habits, [], logs, '2026-10-04', 0.7);
    expect(streaks.currentStreak).toBe(1);
    expect(streaks.bestStreak).toBe(2);
  });
});
