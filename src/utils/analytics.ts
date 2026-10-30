import { Challenge, DailyLog, Habit, LikelihoodAssessment, Task } from '../types';
import { diffInDays, getTodayDateString, isDayScheduledForHabit, addDays } from './date';

export interface DayBreakdown {
  date: string;
  scheduledCount: number;
  completedCount: number;
  rate: number;
  isEligible: boolean; // Has at least 1 scheduled mission
  isSuccessful: boolean; // rate >= streakThreshold
  isNeutral: boolean; // 0 scheduled items
}

/**
 * Calculates scheduled and completed items for a specific date
 */
export function getDayBreakdown(
  dateStr: string,
  habits: Habit[],
  tasks: Task[],
  dailyLogs: DailyLog[],
  streakThreshold: number = 0.7
): DayBreakdown {
  // Scheduled habits for this day
  const scheduledHabits = habits.filter(h => isDayScheduledForHabit(h, dateStr));
  
  // Tasks due on this day
  const scheduledTasks = tasks.filter(t => t.dueDate === dateStr);

  const totalScheduled = scheduledHabits.length + scheduledTasks.length;

  if (totalScheduled === 0) {
    return {
      date: dateStr,
      scheduledCount: 0,
      completedCount: 0,
      rate: 0,
      isEligible: false,
      isSuccessful: false,
      isNeutral: true
    };
  }

  // Count completions from logs
  let completed = 0;

  for (const habit of scheduledHabits) {
    const log = dailyLogs.find(l => l.itemId === habit.id && l.date === dateStr);
    if (log && log.completed) {
      completed++;
    }
  }

  for (const task of scheduledTasks) {
    const log = dailyLogs.find(l => l.itemId === task.id && l.date === dateStr);
    if (log ? log.completed : task.status === 'completed') {
      completed++;
    }
  }

  const rate = completed / totalScheduled;
  const isSuccessful = rate >= streakThreshold;

  return {
    date: dateStr,
    scheduledCount: totalScheduled,
    completedCount: completed,
    rate,
    isEligible: true,
    isSuccessful,
    isNeutral: false
  };
}

/**
 * Calculates current streak and best streak within challenge boundaries
 */
export function calculateStreaks(
  challenge: Challenge,
  habits: Habit[],
  tasks: Task[],
  dailyLogs: DailyLog[],
  todayStr: string = getTodayDateString(),
  streakThreshold: number = 0.7
): { currentStreak: number; bestStreak: number } {
  const start = challenge.startDate;
  // If challenge hasn't started yet
  if (todayStr < start) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const totalElapsed = diffInDays(start, todayStr);
  const breakdowns: DayBreakdown[] = [];

  for (let i = 0; i <= totalElapsed; i++) {
    const dStr = addDays(start, i);
    breakdowns.push(getDayBreakdown(dStr, habits, tasks, dailyLogs, streakThreshold));
  }

  let bestStreak = 0;
  let runningStreak = 0;

  for (const b of breakdowns) {
    if (b.isNeutral) {
      // Neutral days preserve streak without incrementing
      continue;
    }
    if (b.isSuccessful) {
      runningStreak++;
      if (runningStreak > bestStreak) {
        bestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
  }

  // Current streak counting backwards from today or yesterday
  let currentStreak = 0;
  let idx = breakdowns.length - 1;

  // Check today first
  const todayBreakdown = breakdowns[idx];
  if (todayBreakdown && !todayBreakdown.isNeutral && todayBreakdown.isSuccessful) {
    currentStreak++;
    idx--;
  } else if (todayBreakdown && (todayBreakdown.isNeutral || todayBreakdown.completedCount > 0)) {
    // If today is neutral or partially in progress, step back to yesterday to preserve the unbroken active streak
    idx--;
  } else {
    // Today has scheduled items and 0 completed yet. Still allow today to be completed without immediately breaking yesterday's streak
    idx--;
  }

  while (idx >= 0) {
    const b = breakdowns[idx];
    if (b.isNeutral) {
      idx--;
      continue;
    }
    if (b.isSuccessful) {
      currentStreak++;
      idx--;
    } else {
      break;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak)
  };
}

/**
 * Responsible finish likelihood estimate
 */
export function calculateLikelihood(
  challenge: Challenge,
  habits: Habit[],
  tasks: Task[],
  dailyLogs: DailyLog[],
  todayStr: string = getTodayDateString()
): LikelihoodAssessment {
  const start = challenge.startDate;
  const elapsed = Math.max(0, diffInDays(start, todayStr));
  const remainingDays = Math.max(0, challenge.durationDays - elapsed);

  // Collect historical eligible days up to yesterday (or today if completed)
  const eligibleDays: DayBreakdown[] = [];

  for (let i = 0; i < elapsed; i++) {
    const dStr = addDays(start, i);
    const bd = getDayBreakdown(dStr, habits, tasks, dailyLogs);
    if (bd.isEligible) {
      eligibleDays.push(bd);
    }
  }

  // Check if fewer than 5 eligible days completed
  if (eligibleDays.length < 5) {
    return {
      status: 'building_baseline',
      percentage: 0,
      confidence: 'low',
      recentConsistency: 0,
      overallConsistency: 0,
      eligibleDaysCount: eligibleDays.length,
      remainingDays,
      summaryExplanation: `Building your baseline. We need at least 5 logged operational days to formulate a transparent trajectory. Logged so far: ${eligibleDays.length} day(s).`,
      actionableRecommendation: 'Focus on securing a clean sweep for today’s active missions.'
    };
  }

  // Calculate overall consistency
  const totalCompletedRateSum = eligibleDays.reduce((acc, d) => acc + d.rate, 0);
  const overallConsistency = totalCompletedRateSum / eligibleDays.length;

  // Calculate recent consistency (last 7 eligible days)
  const recentSlice = eligibleDays.slice(-7);
  const recentRateSum = recentSlice.reduce((acc, d) => acc + d.rate, 0);
  const recentConsistency = recentRateSum / recentSlice.length;

  // Blended consistency: 60% recent momentum, 40% historical stability
  const blendedRate = (recentConsistency * 0.6) + (overallConsistency * 0.4);

  // Confidence based on days completed
  let confidence: 'low' | 'moderate' | 'high' = 'low';
  if (eligibleDays.length >= 20) {
    confidence = 'high';
  } else if (eligibleDays.length >= 10) {
    confidence = 'moderate';
  }

  // Convert to percentage and soften extremes
  let rawPercent = Math.round(blendedRate * 100);
  // Cap between 10% and 95% to avoid false certainty early on
  const clampedPercent = Math.min(95, Math.max(10, rawPercent));

  let summary = `Trajectory modeled from ${eligibleDays.length} eligible days (Recent 7-day momentum: ${Math.round(recentConsistency * 100)}%, Overall: ${Math.round(overallConsistency * 100)}%).`;
  let recommendation = 'Execute today’s scheduled habits to protect your momentum curve.';

  if (recentConsistency < overallConsistency) {
    recommendation = 'Recent completion dipped slightly. Complete a key habit today to reverse the trajectory.';
  } else if (recentConsistency >= 0.85) {
    recommendation = 'Tactical rhythm is exceptional. Maintain discipline through the upcoming checkpoint.';
  }

  return {
    status: 'calculated',
    percentage: clampedPercent,
    confidence,
    recentConsistency: Math.round(recentConsistency * 100),
    overallConsistency: Math.round(overallConsistency * 100),
    eligibleDaysCount: eligibleDays.length,
    remainingDays,
    summaryExplanation: summary,
    actionableRecommendation: recommendation
  };
}

/**
 * Habit individual consistency
 */
export function calculateHabitStats(
  habit: Habit,
  challenge: Challenge,
  dailyLogs: DailyLog[],
  todayStr: string = getTodayDateString()
): { scheduledCount: number; completedCount: number; rate: number } {
  const start = challenge.startDate;
  const elapsed = Math.max(0, diffInDays(start, todayStr));
  let scheduled = 0;
  let completed = 0;

  for (let i = 0; i <= elapsed; i++) {
    const dStr = addDays(start, i);
    if (isDayScheduledForHabit(habit, dStr)) {
      scheduled++;
      const log = dailyLogs.find(l => l.itemId === habit.id && l.date === dStr);
      if (log && log.completed) {
        completed++;
      }
    }
  }

  const rate = scheduled > 0 ? completed / scheduled : 0;
  return { scheduledCount: scheduled, completedCount: completed, rate };
}
