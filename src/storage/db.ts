import { Challenge, DailyLog, Habit, Task, UserProfile, XPEvent } from '../types';
import { addDays, getTodayDateString } from '../utils/date';

const STORAGE_KEYS = {
  SCHEMA_VERSION: 'batman_proto_version',
  CHALLENGE: 'batman_proto_challenge',
  HABITS: 'batman_proto_habits',
  TASKS: 'batman_proto_tasks',
  DAILY_LOGS: 'batman_proto_logs',
  XP_EVENTS: 'batman_proto_xp_events',
  USER_PROFILE: 'batman_proto_profile',
  REFLECTIONS: 'batman_proto_reflections'
} as const;

const CURRENT_SCHEMA_VERSION = 1;

export interface AppDataBackup {
  version: number;
  exportedAt: string;
  challenge: Challenge | null;
  habits: Habit[];
  tasks: Task[];
  dailyLogs: DailyLog[];
  xpEvents: XPEvent[];
  userProfile: UserProfile;
  reflections: Record<string, string>;
}

export const DEFAULT_PROFILE: UserProfile = {
  callsign: 'Bruce',
  totalXP: 0,
  unlockedItemIds: ['cowl-recruit', 'emblem-classic', 'theme-graphite'],
  selectedCowl: 'cowl-recruit',
  selectedEmblem: 'emblem-classic',
  selectedHudTheme: 'theme-graphite',
  streakThreshold: 0.7,
  hapticEnabled: true,
  soundEnabled: true,
  reducedMotion: false,
  dailyReminderTime: '21:00'
};

export class AppStorage {
  private static isClient(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  static isAvailable(): boolean {
    if (!this.isClient()) return false;
    try {
      const probe = '__batman_protocol_storage_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  }

  private static read<T>(key: string, fallback: T): T {
    if (!this.isClient()) return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : fallback;
    } catch {
      return fallback;
    }
  }

  private static write(key: string, value: unknown): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Keep the active session usable if browser storage is unavailable or full.
    }
  }

  static getChallenge(): Challenge | null {
    if (!this.isClient()) return null;
    return this.read<Challenge | null>(STORAGE_KEYS.CHALLENGE, null);
  }

  static saveChallenge(challenge: Challenge | null): void {
    if (!this.isClient()) return;
    if (challenge) {
      this.write(STORAGE_KEYS.CHALLENGE, challenge);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CHALLENGE);
    }
  }

  static getHabits(): Habit[] {
    if (!this.isClient()) return [];
    return this.read<Habit[]>(STORAGE_KEYS.HABITS, []);
  }

  static saveHabits(habits: Habit[]): void {
    if (!this.isClient()) return;
    this.write(STORAGE_KEYS.HABITS, habits);
  }

  static getTasks(): Task[] {
    if (!this.isClient()) return [];
    return this.read<Task[]>(STORAGE_KEYS.TASKS, []);
  }

  static saveTasks(tasks: Task[]): void {
    if (!this.isClient()) return;
    this.write(STORAGE_KEYS.TASKS, tasks);
  }

  static getDailyLogs(): DailyLog[] {
    if (!this.isClient()) return [];
    return this.read<DailyLog[]>(STORAGE_KEYS.DAILY_LOGS, []);
  }

  static saveDailyLogs(logs: DailyLog[]): void {
    if (!this.isClient()) return;
    this.write(STORAGE_KEYS.DAILY_LOGS, logs);
  }

  static getXPEvents(): XPEvent[] {
    if (!this.isClient()) return [];
    return this.read<XPEvent[]>(STORAGE_KEYS.XP_EVENTS, []);
  }

  static saveXPEvents(events: XPEvent[]): void {
    if (!this.isClient()) return;
    this.write(STORAGE_KEYS.XP_EVENTS, events);
  }

  static getUserProfile(): UserProfile {
    if (!this.isClient()) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...this.read<Partial<UserProfile>>(STORAGE_KEYS.USER_PROFILE, {}) };
  }

  static saveUserProfile(profile: UserProfile): void {
    if (!this.isClient()) return;
    this.write(STORAGE_KEYS.USER_PROFILE, profile);
  }

  static getReflections(): Record<string, string> {
    if (!this.isClient()) return {};
    return this.read<Record<string, string>>(STORAGE_KEYS.REFLECTIONS, {});
  }

  static saveReflection(date: string, note: string): void {
    if (!this.isClient()) return;
    const current = this.getReflections();
    if (note.trim() === '') {
      delete current[date];
    } else {
      current[date] = note;
    }
    this.write(STORAGE_KEYS.REFLECTIONS, current);
  }

  /**
   * Seeds realistic initial protocol if user has no challenge configured
   */
  static seedStarterChallenge(): { challenge: Challenge; habits: Habit[]; tasks: Task[] } {
    const today = getTodayDateString();
    const challenge: Challenge = {
      id: 'proto-challenge-01',
      title: 'Project Dark Knight',
      description: 'Forging iron physical conditioning, focused intellect, and unwavering mental discipline.',
      durationDays: 30,
      startDate: today,
      endDate: addDays(today, 29),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const habits: Habit[] = [
      {
        id: 'habit-1',
        challengeId: challenge.id,
        name: 'Physical Conditioning',
        description: '45 mins tactical training, resistance, or mobility drills',
        targetValue: 45,
        targetUnit: 'mins',
        schedule: 'daily',
        activeFrom: today,
        sortOrder: 0
      },
      {
        id: 'habit-2',
        challengeId: challenge.id,
        name: 'Deep Strategic Focus',
        description: '90 mins uninterrupted deep work on core craft or mission',
        targetValue: 90,
        targetUnit: 'mins',
        schedule: 'daily',
        activeFrom: today,
        sortOrder: 1
      },
      {
        id: 'habit-3',
        challengeId: challenge.id,
        name: 'Combat Intel / Reading',
        description: 'Read 20 pages of technical, tactical, or philosophical texts',
        targetValue: 20,
        targetUnit: 'pages',
        schedule: 'daily',
        activeFrom: today,
        sortOrder: 2
      },
      {
        id: 'habit-4',
        challengeId: challenge.id,
        name: 'No Distractions / Recovery',
        description: 'Lights out by 23:00, zero mindless feeds after sunset',
        targetValue: 8,
        targetUnit: 'hrs',
        schedule: 'daily',
        activeFrom: today,
        sortOrder: 3
      }
    ];

    const tasks: Task[] = [
      {
        id: 'task-1',
        challengeId: challenge.id,
        title: 'Calibrate Batcave Mission Setup',
        notes: 'Review 30-day goals and clear desktop distractions',
        dueDate: today,
        status: 'pending',
        category: 'tactical',
        createdAt: new Date().toISOString()
      }
    ];

    this.saveChallenge(challenge);
    this.saveHabits(habits);
    this.saveTasks(tasks);
    return { challenge, habits, tasks };
  }

  static exportBackup(): string {
    const backup: AppDataBackup = {
      version: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      challenge: this.getChallenge(),
      habits: this.getHabits(),
      tasks: this.getTasks(),
      dailyLogs: this.getDailyLogs(),
      xpEvents: this.getXPEvents(),
      userProfile: this.getUserProfile(),
      reflections: this.getReflections()
    };
    return JSON.stringify(backup, null, 2);
  }

  static importBackup(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString) as AppDataBackup;
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Invalid backup format' };
      }
      if (data.challenge) this.saveChallenge(data.challenge);
      if (Array.isArray(data.habits)) this.saveHabits(data.habits);
      if (Array.isArray(data.tasks)) this.saveTasks(data.tasks);
      if (Array.isArray(data.dailyLogs)) this.saveDailyLogs(data.dailyLogs);
      if (Array.isArray(data.xpEvents)) this.saveXPEvents(data.xpEvents);
      if (data.userProfile) this.saveUserProfile(data.userProfile);
      if (data.reflections) {
        this.write(STORAGE_KEYS.REFLECTIONS, data.reflections);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  static wipeAllData(): void {
    if (!this.isClient()) return;
    try {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    } catch {
      // The UI remains usable if a privacy setting blocks storage access.
    }
  }
}
