export type ChallengeDuration = 30 | 60;

export type ChallengeStatus = 'upcoming' | 'active' | 'paused' | 'completed' | 'archived';

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  durationDays: ChallengeDuration;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: ChallengeStatus;
  pausedDateRanges?: { start: string; end?: string }[];
  createdAt: string;
  updatedAt: string;
}

export type ScheduleFrequency = 'daily' | 'weekdays' | 'custom';

export interface Habit {
  id: string;
  challengeId: string;
  name: string;
  description?: string;
  targetValue?: number;
  targetUnit?: string;
  schedule: ScheduleFrequency;
  customDays?: number[]; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  activeFrom: string; // YYYY-MM-DD
  archivedAt?: string; // YYYY-MM-DD
  sortOrder: number;
}

export type TaskCategory = 'tactical' | 'intel' | 'physical' | 'recovery' | 'discipline';

export interface Task {
  id: string;
  challengeId: string;
  title: string;
  notes?: string;
  dueDate: string; // YYYY-MM-DD
  status: 'pending' | 'completed';
  category?: TaskCategory;
  createdAt: string;
  completedAt?: string;
}

export interface DailyLog {
  id: string;
  challengeId: string;
  itemId: string; // habitId or taskId
  itemType: 'habit' | 'task';
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface XPEvent {
  id: string;
  challengeId: string;
  sourceId: string; // habitId, taskId, or milestoneKey
  date: string; // YYYY-MM-DD
  amount: number;
  reason: 'habit_completed' | 'task_completed' | 'daily_clean_sweep' | 'weekly_milestone' | 'streak_milestone';
  createdAt: string;
}

export interface RankInfo {
  tier: number;
  title: string;
  minXP: number;
  cowlSilhouette: string; // silhouette variant identifier
  motto: string;
  description: string;
}

export interface UnlockableCosmetic {
  id: string;
  name: string;
  type: 'cowl' | 'emblem' | 'hud_theme' | 'title';
  requiredRankTier: number;
  requiredStreak?: number;
  unlockedAt?: string;
  previewColor?: string;
  description: string;
}

export interface UserProfile {
  callsign: string;
  totalXP: number;
  unlockedItemIds: string[];
  selectedCowl: string;
  selectedEmblem: string;
  selectedHudTheme: string;
  streakThreshold: number; // default 0.7 (70%)
  hapticEnabled: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  dailyReminderTime?: string;
  lastActiveDate?: string;
}

export interface LikelihoodAssessment {
  status: 'building_baseline' | 'calculated';
  percentage: number;
  confidence: 'low' | 'moderate' | 'high';
  recentConsistency: number;
  overallConsistency: number;
  eligibleDaysCount: number;
  remainingDays: number;
  summaryExplanation: string;
  actionableRecommendation: string;
}

export interface DailyStats {
  date: string;
  scheduledOpportunities: number;
  completedOpportunities: number;
  rate: number; // 0 to 1
  isRestDay: boolean;
  isToday: boolean;
  isFuture: boolean;
}
