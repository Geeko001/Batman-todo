import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, diffInDays, getChallengeDayNumber, isDayScheduledForHabit } from '../src/utils/date.ts';
import { calculateTotalXP, getRankFromXP, rebuildProgressBonuses } from '../src/utils/progression.ts';
import { calculateLikelihood, calculateStreaks } from '../src/utils/analytics.ts';

describe('BATMAN PROTOCOL Unit Tests', () => {
  describe('Date Utilities', () => {
    it('correctly calculates difference in calendar days without timezone drift', () => {
      assert.equal(diffInDays('2026-10-01', '2026-10-01'), 0);
      assert.equal(diffInDays('2026-10-01', '2026-10-31'), 30);
      assert.equal(diffInDays('2026-10-01', '2026-11-30'), 60);
    });

    it('correctly adds days across month boundaries', () => {
      assert.equal(addDays('2026-10-30', 2), '2026-11-01');
      assert.equal(addDays('2026-02-28', 1), '2026-03-01');
    });

    it('calculates 1-indexed challenge day numbers', () => {
      assert.equal(getChallengeDayNumber('2026-10-01', '2026-10-01'), 1);
      assert.equal(getChallengeDayNumber('2026-10-01', '2026-10-12'), 12);
    });

    it('handles habit schedules (daily, weekdays, custom)', () => {
      const dailyHabit = {
        id: 'h1',
        challengeId: 'c1',
        name: 'Workout',
        schedule: 'daily',
        activeFrom: '2026-10-01',
        sortOrder: 0
      };

      const weekdayHabit = {
        id: 'h2',
        challengeId: 'c1',
        name: 'Deep Work',
        schedule: 'weekdays',
        activeFrom: '2026-10-01',
        sortOrder: 1
      };

      assert.equal(isDayScheduledForHabit(dailyHabit, '2026-10-04'), true);
      assert.equal(isDayScheduledForHabit(dailyHabit, '2026-10-05'), true);
      assert.equal(isDayScheduledForHabit(weekdayHabit, '2026-10-04'), false);
      assert.equal(isDayScheduledForHabit(weekdayHabit, '2026-10-05'), true);
    });
  });

  describe('Progression & XP Engine', () => {
    it('correctly maps XP to ranks and progress percentage', () => {
      const r0 = getRankFromXP(0);
      assert.equal(r0.currentRank.title, 'Recruit');
      assert.equal(r0.nextRank?.title, 'Detective');
      assert.equal(r0.progressPercent, 0);

      const r50 = getRankFromXP(50);
      assert.equal(r50.currentRank.title, 'Recruit');
      assert.equal(r50.progressPercent, 50);

      const r100 = getRankFromXP(100);
      assert.equal(r100.currentRank.title, 'Detective');
      assert.equal(r100.nextRank?.title, 'Vigilante');

      const r1000 = getRankFromXP(1000);
      assert.equal(r1000.currentRank.title, 'Dark Knight');

      const r2000 = getRankFromXP(2000);
      assert.equal(r2000.currentRank.title, 'Legend of Gotham');
      assert.equal(r2000.nextRank, null);
      assert.equal(r2000.progressPercent, 100);
    });

    it('calculates XP deterministically from ledger without farming abuse', () => {
      const events = [
        { id: '1', challengeId: 'c1', sourceId: 'h1', date: '2026-10-01', amount: 10, reason: 'habit_completed', createdAt: '' },
        { id: '2', challengeId: 'c1', sourceId: 'h2', date: '2026-10-01', amount: 10, reason: 'habit_completed', createdAt: '' },
        { id: '3', challengeId: 'c1', sourceId: 'bonus', date: '2026-10-01', amount: 15, reason: 'daily_clean_sweep', createdAt: '' }
      ];
      assert.equal(calculateTotalXP(events), 35);
    });

    it('rebuilds clean-sweep and seven-day rewards from completion history', () => {
      const challenge = { id: 'bonus-c1', title: 'Bonus Test', durationDays: 30, startDate: '2026-10-01', endDate: '2026-10-30', status: 'active', createdAt: '', updatedAt: '' };
      const habits = [{ id: 'bonus-h1', challengeId: 'bonus-c1', name: 'Daily Mission', schedule: 'daily', activeFrom: '2026-10-01', sortOrder: 0 }];
      const logs = Array.from({ length: 7 }, (_, index) => ({ id: `bonus-log-${index}`, challengeId: 'bonus-c1', itemId: 'bonus-h1', itemType: 'habit', date: `2026-10-0${index + 1}`, completed: true }));
      const profile = { callsign: 'Test', totalXP: 0, unlockedItemIds: [], selectedCowl: '', selectedEmblem: '', selectedHudTheme: '', streakThreshold: 0.7, hapticEnabled: false, soundEnabled: false, reducedMotion: false };
      const bonuses = rebuildProgressBonuses([], challenge, habits, [], logs, profile, '2026-10-07');

      assert.equal(bonuses.filter(event => event.reason === 'daily_clean_sweep').length, 7);
      assert.equal(bonuses.filter(event => event.reason === 'weekly_milestone').length, 1);
      assert.equal(bonuses.filter(event => event.reason === 'streak_milestone').length, 1);
    });
  });

  describe('Analytics & Likelihood Heuristic', () => {
    const challenge = {
      id: 'c1',
      title: 'Discipline Protocol',
      durationDays: 30,
      startDate: '2026-10-01',
      endDate: '2026-10-30',
      status: 'active',
      createdAt: '',
      updatedAt: ''
    };

    const habits = [
      { id: 'h1', challengeId: 'c1', name: 'Physical Conditioning', schedule: 'daily', activeFrom: '2026-10-01', sortOrder: 0 },
      { id: 'h2', challengeId: 'c1', name: 'Combat Intelligence', schedule: 'daily', activeFrom: '2026-10-01', sortOrder: 1 }
    ];

    it('shows building baseline when fewer than 5 eligible days logged', () => {
      const logs = [
        { id: 'l1', challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: '2026-10-01', completed: true },
        { id: 'l2', challengeId: 'c1', itemId: 'h2', itemType: 'habit', date: '2026-10-01', completed: true },
        { id: 'l3', challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: '2026-10-02', completed: true }
      ];

      const assessment = calculateLikelihood(challenge, habits, [], logs, '2026-10-04');
      assert.equal(assessment.status, 'building_baseline');
      assert.equal(assessment.percentage, 0);
    });

    it('calculates transparent finish likelihood once 5+ days are completed', () => {
      const logs = [];
      for (let i = 1; i <= 6; i++) {
        const d = `2026-10-0${i}`;
        logs.push({ id: `l1-${i}`, challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: d, completed: true });
        logs.push({ id: `l2-${i}`, challengeId: 'c1', itemId: 'h2', itemType: 'habit', date: d, completed: true });
      }

      const assessment = calculateLikelihood(challenge, habits, [], logs, '2026-10-07');
      assert.equal(assessment.status, 'calculated');
      assert.ok(assessment.percentage >= 90);
      assert.ok(assessment.percentage <= 95);
      assert.equal(assessment.overallConsistency, 100);
    });

    it('computes streaks correctly with 70% threshold', () => {
      const logs = [
        { id: '1', challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: '2026-10-01', completed: true },
        { id: '2', challengeId: 'c1', itemId: 'h2', itemType: 'habit', date: '2026-10-01', completed: true },
        { id: '3', challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: '2026-10-02', completed: true },
        { id: '4', challengeId: 'c1', itemId: 'h2', itemType: 'habit', date: '2026-10-02', completed: true },
        { id: '5', challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: '2026-10-03', completed: true },
        { id: '6', challengeId: 'c1', itemId: 'h2', itemType: 'habit', date: '2026-10-03', completed: false },
        { id: '7', challengeId: 'c1', itemId: 'h1', itemType: 'habit', date: '2026-10-04', completed: true },
        { id: '8', challengeId: 'c1', itemId: 'h2', itemType: 'habit', date: '2026-10-04', completed: true }
      ];

      const streaks = calculateStreaks(challenge, habits, [], logs, '2026-10-04', 0.7);
      assert.equal(streaks.currentStreak, 1);
      assert.equal(streaks.bestStreak, 2);
    });
  });
});
