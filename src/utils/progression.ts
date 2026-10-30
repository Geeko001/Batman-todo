import { Challenge, DailyLog, Habit, RankInfo, Task, UnlockableCosmetic, UserProfile, XPEvent } from '../types';
import { getDayBreakdown } from './analytics';
import { addDays, diffInDays, getTodayDateString } from './date';

export const RANKS: RankInfo[] = [
  {
    tier: 1,
    title: 'Recruit',
    minXP: 0,
    cowlSilhouette: 'cowl-recruit',
    motto: 'Shadows take form in quiet discipline.',
    description: 'Beginning tactical training. The foundations of habit are laid in the dark.'
  },
  {
    tier: 2,
    title: 'Detective',
    minXP: 100,
    cowlSilhouette: 'cowl-detective',
    motto: 'Patterns reveal truth. Consistency breeds certainty.',
    description: 'Analytical awareness sharpened. Daily routines executed with meticulous care.'
  },
  {
    tier: 3,
    title: 'Vigilante',
    minXP: 300,
    cowlSilhouette: 'cowl-vigilante',
    motto: 'Action over doubt. The city begins to take notice.',
    description: 'Unforgiving momentum. Missions are completed regardless of fleeting motivation.'
  },
  {
    tier: 4,
    title: 'Gotham Guardian',
    minXP: 600,
    cowlSilhouette: 'cowl-guardian',
    motto: 'A bulwark against chaos. Willpower forged into armor.',
    description: 'Unwavering resolve. Habits form an impenetrable operational baseline.'
  },
  {
    tier: 5,
    title: 'Dark Knight',
    minXP: 1000,
    cowlSilhouette: 'cowl-dark-knight',
    motto: 'I am the protocol. The symbol is alive.',
    description: 'Mastery of mind, body, and operational focus. Complete tactical discipline.'
  },
  {
    tier: 6,
    title: 'Legend of Gotham',
    minXP: 1500,
    cowlSilhouette: 'cowl-legend',
    motto: 'Beyond men. Transcending into legacy.',
    description: 'Peak transformation. The 30/60-day challenge conquered and internalized.'
  }
];

export const UNLOCKABLES: UnlockableCosmetic[] = [
  {
    id: 'cowl-recruit',
    name: 'Initiate Hood',
    type: 'cowl',
    requiredRankTier: 1,
    previewColor: '#9AA4B2',
    description: 'Minimalist shadow cowl silhouette.'
  },
  {
    id: 'cowl-detective',
    name: 'Tactical Cowl v1',
    type: 'cowl',
    requiredRankTier: 2,
    previewColor: '#6AA9FF',
    description: 'Enhanced ocular telemetry sensors.'
  },
  {
    id: 'cowl-vigilante',
    name: 'Reinforced Cowl',
    type: 'cowl',
    requiredRankTier: 3,
    previewColor: '#E0B34C',
    description: 'Heavy composite alloy brow plating.'
  },
  {
    id: 'cowl-guardian',
    name: 'Stealth Sonar Cowl',
    type: 'cowl',
    requiredRankTier: 4,
    previewColor: '#5BC69A',
    description: 'Active sonar mapping array.'
  },
  {
    id: 'cowl-dark-knight',
    name: 'The Dark Knight Plate',
    type: 'cowl',
    requiredRankTier: 5,
    previewColor: '#E0B34C',
    description: 'Full ballistic titanium cowl.'
  },
  {
    id: 'cowl-legend',
    name: 'Gotham Paragon Helm',
    type: 'cowl',
    requiredRankTier: 6,
    previewColor: '#F3F5F7',
    description: 'Mythic tactical armor.'
  },
  {
    id: 'emblem-classic',
    name: 'Delta Wing Insignia',
    type: 'emblem',
    requiredRankTier: 1,
    description: 'Sharp angular delta bat wing.'
  },
  {
    id: 'emblem-tactical',
    name: 'Armored Sigil',
    type: 'emblem',
    requiredRankTier: 2,
    description: 'Heavy plate cut-out chest insignia.'
  },
  {
    id: 'emblem-gold',
    name: 'Gilded Night Sigil',
    type: 'emblem',
    requiredRankTier: 4,
    description: 'Tactical amber bordered chest emblem.'
  },
  {
    id: 'theme-graphite',
    name: 'Batcave Core',
    type: 'hud_theme',
    requiredRankTier: 1,
    description: 'Default deep graphite and amber highlights.'
  },
  {
    id: 'theme-sonar-blue',
    name: 'Sonar Protocol',
    type: 'hud_theme',
    requiredRankTier: 3,
    description: 'Deep navy and signal blue telemetry.'
  },
  {
    id: 'theme-crimson',
    name: 'Red Hood Alert',
    type: 'hud_theme',
    requiredRankTier: 5,
    description: 'High-contrast emergency crimson accents.'
  }
];

export const XP_VALUES = {
  HABIT_COMPLETED: 10,
  TASK_COMPLETED: 5,
  CLEAN_SWEEP_BONUS: 15,
  WEEKLY_MILESTONE: 30,
  STREAK_7_DAYS: 35
} as const;

/**
 * Computes the user's current rank given total XP
 */
export function getRankFromXP(totalXP: number): { currentRank: RankInfo; nextRank: RankInfo | null; progressPercent: number } {
  let currentRank = RANKS[0];
  let nextRank: RankInfo | null = RANKS[1] || null;

  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalXP >= RANKS[i].minXP) {
      currentRank = RANKS[i];
      nextRank = i < RANKS.length - 1 ? RANKS[i + 1] : null;
      break;
    }
  }

  if (!nextRank) {
    return { currentRank, nextRank: null, progressPercent: 100 };
  }

  const range = nextRank.minXP - currentRank.minXP;
  const earned = totalXP - currentRank.minXP;
  const progressPercent = Math.min(100, Math.max(0, Math.round((earned / range) * 100)));

  return { currentRank, nextRank, progressPercent };
}

/**
 * Recomputes total XP deterministically from ledger to prevent duplicate abuse
 */
export function calculateTotalXP(events: XPEvent[]): number {
  return events.reduce((sum, e) => sum + e.amount, 0);
}

/** Rebuilds achievement bonuses from completion history, preventing toggle farming. */
export function rebuildProgressBonuses(
  events: XPEvent[],
  challenge: Challenge,
  habits: Habit[],
  tasks: Task[],
  logs: DailyLog[],
  profile: UserProfile,
  today: string = getTodayDateString()
): XPEvent[] {
  const directEvents = events.filter(event => !['daily_clean_sweep', 'weekly_milestone', 'streak_milestone'].includes(event.reason));
  const bonuses: XPEvent[] = [];
  const lastDate = today < challenge.endDate ? today : challenge.endDate;
  const days = Math.max(0, diffInDays(challenge.startDate, lastDate));
  let successfulDays = 0;
  let runningStreak = 0;

  for (let index = 0; index <= days; index++) {
    const date = addDays(challenge.startDate, index);
    const breakdown = getDayBreakdown(date, habits, tasks, logs, profile.streakThreshold);
    if (breakdown.isNeutral) continue;

    if (breakdown.rate === 1) {
      bonuses.push({
        id: `sweep-${date}`,
        challengeId: challenge.id,
        sourceId: 'clean_sweep',
        date,
        amount: XP_VALUES.CLEAN_SWEEP_BONUS,
        reason: 'daily_clean_sweep',
        createdAt: new Date().toISOString()
      });
    }

    if (breakdown.isSuccessful) {
      successfulDays++;
      runningStreak++;
      if (successfulDays % 7 === 0) {
        bonuses.push({
          id: `weekly-${successfulDays}`,
          challengeId: challenge.id,
          sourceId: `successful-days-${successfulDays}`,
          date,
          amount: XP_VALUES.WEEKLY_MILESTONE,
          reason: 'weekly_milestone',
          createdAt: new Date().toISOString()
        });
      }
      if (runningStreak % 7 === 0) {
        bonuses.push({
          id: `streak-${runningStreak}-${date}`,
          challengeId: challenge.id,
          sourceId: `streak-${runningStreak}`,
          date,
          amount: XP_VALUES.STREAK_7_DAYS,
          reason: 'streak_milestone',
          createdAt: new Date().toISOString()
        });
      }
    } else {
      runningStreak = 0;
    }
  }

  return [...directEvents, ...bonuses];
}
