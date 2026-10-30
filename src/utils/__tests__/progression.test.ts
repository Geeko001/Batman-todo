import { describe, it, expect } from 'vitest';
import { calculateTotalXP, getRankFromXP, rebuildProgressBonuses } from '../progression';
import { Challenge, DailyLog, Habit, UserProfile, XPEvent } from '../../types';

describe('Progression & XP Engine', () => {
  it('correctly maps XP to ranks and progress percentage', () => {
    // 0 XP -> Recruit
    const r0 = getRankFromXP(0);
    expect(r0.currentRank.title).toBe('Recruit');
    expect(r0.nextRank?.title).toBe('Detective');
    expect(r0.progressPercent).toBe(0);

    // 50 XP -> Recruit (50% to Detective at 100 XP)
    const r50 = getRankFromXP(50);
    expect(r50.currentRank.title).toBe('Recruit');
    expect(r50.progressPercent).toBe(50);

    // 100 XP -> Detective
    const r100 = getRankFromXP(100);
    expect(r100.currentRank.title).toBe('Detective');
    expect(r100.nextRank?.title).toBe('Vigilante');

    // 1000 XP -> Dark Knight
    const r1000 = getRankFromXP(1000);
    expect(r1000.currentRank.title).toBe('Dark Knight');

    // 2000 XP -> Legend of Gotham (cap)
    const r2000 = getRankFromXP(2000);
    expect(r2000.currentRank.title).toBe('Legend of Gotham');
    expect(r2000.nextRank).toBeNull();
    expect(r2000.progressPercent).toBe(100);
  });

  it('calculates XP deterministically from ledger', () => {
    const events: XPEvent[] = [
      { id: '1', challengeId: 'c1', sourceId: 'h1', date: '2026-10-01', amount: 10, reason: 'habit_completed', createdAt: '' },
      { id: '2', challengeId: 'c1', sourceId: 'h2', date: '2026-10-01', amount: 10, reason: 'habit_completed', createdAt: '' },
      { id: '3', challengeId: 'c1', sourceId: 'bonus', date: '2026-10-01', amount: 15, reason: 'daily_clean_sweep', createdAt: '' }
    ];
    expect(calculateTotalXP(events)).toBe(35);
  });

  it('awards clean-sweep and seven-day bonuses deterministically', () => {
    const challenge: Challenge = {
      id: 'c1', title: 'Test', durationDays: 30, startDate: '2026-10-01', endDate: '2026-10-30', status: 'active', createdAt: '', updatedAt: ''
    };
    const habit: Habit = { id: 'h1', challengeId: 'c1', name: 'Habit', schedule: 'daily', activeFrom: '2026-10-01', sortOrder: 0 };
    const logs: DailyLog[] = Array.from({ length: 7 }, (_, index) => ({
      id: `l${index}`, challengeId: 'c1', itemId: 'h1', itemType: 'habit' as const, date: `2026-10-0${index + 1}`, completed: true
    }));
    const profile: UserProfile = {
      callsign: 'Test', totalXP: 0, unlockedItemIds: [], selectedCowl: '', selectedEmblem: '', selectedHudTheme: '', streakThreshold: 0.7, hapticEnabled: false, soundEnabled: false, reducedMotion: false
    };
    const bonuses = rebuildProgressBonuses([], challenge, [habit], [], logs, profile, '2026-10-07');
    expect(bonuses.filter(event => event.reason === 'daily_clean_sweep')).toHaveLength(7);
    expect(bonuses.filter(event => event.reason === 'weekly_milestone')).toHaveLength(1);
    expect(bonuses.filter(event => event.reason === 'streak_milestone')).toHaveLength(1);
  });
});
