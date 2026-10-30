import React, { useState, useEffect } from 'react';
import { Challenge, DailyLog, Habit, Task, UserProfile, XPEvent } from './types';
import { AppStorage, DEFAULT_PROFILE } from './storage/db';
import { calculateTotalXP, getRankFromXP, rebuildProgressBonuses, UNLOCKABLES, XP_VALUES } from './utils/progression';
import { getTodayDateString, isDayScheduledForHabit } from './utils/date';
import { calculateStreaks } from './utils/analytics';
import { sound } from './utils/audio';

import { Header } from './components/Header';
import { NavBar, NavTab } from './components/NavBar';
import { RecoveryModal } from './components/RecoveryModal';
import { PersonaRevealModal } from './components/PersonaRevealModal';

import { OnboardingView } from './views/OnboardingView';
import { MissionControlView } from './views/MissionControlView';
import { MissionsView } from './views/MissionsView';
import { HeatMapView } from './views/HeatMapView';
import { IntelligenceView } from './views/IntelligenceView';
import { ProfileView } from './views/ProfileView';

export const App: React.FC = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [xpEvents, setXpEvents] = useState<XPEvent[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [reflections, setReflections] = useState<Record<string, string>>({});

  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Initialize and load from local storage
  const reloadData = () => {
    let savedChallenge = AppStorage.getChallenge();
    let savedHabits = AppStorage.getHabits();
    let savedTasks = AppStorage.getTasks();

    if (!savedChallenge) {
      // First launch: Seed starter challenge
      const seeded = AppStorage.seedStarterChallenge();
      savedChallenge = seeded.challenge;
      savedHabits = seeded.habits;
      savedTasks = seeded.tasks;
    }

    const savedLogs = AppStorage.getDailyLogs();
    const savedXP = AppStorage.getXPEvents();
    const savedProf = AppStorage.getUserProfile();
    const savedReflections = AppStorage.getReflections();

    setChallenge(savedChallenge);
    setHabits(savedHabits);
    setTasks(savedTasks);
    setDailyLogs(savedLogs);
    setXpEvents(savedXP);
    setProfile(savedProf);
    setReflections(savedReflections);
    sound.enabled = savedProf.soundEnabled;
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Compute Rank & XP
  const totalXP = calculateTotalXP(xpEvents);
  const { currentRank, nextRank, progressPercent } = getRankFromXP(totalXP);
  const currentStreak = challenge ? calculateStreaks(challenge, habits, tasks, dailyLogs, getTodayDateString(), profile.streakThreshold).currentStreak : 0;

  // Sync profile totalXP
  useEffect(() => {
    if (profile.totalXP !== totalXP) {
      const updated = { ...profile, totalXP };
      setProfile(updated);
      AppStorage.saveUserProfile(updated);
    }
  }, [totalXP]);

  // Handle habit completion toggle
  const handleToggleHabit = (habitId: string, dateStr: string) => {
    if (!challenge) return;
    const existingLog = dailyLogs.find(l => l.itemId === habitId && l.date === dateStr);
    const isNowCompleted = !existingLog?.completed;

    let updatedLogs: DailyLog[];
    if (existingLog) {
      updatedLogs = dailyLogs.map(l =>
        l.id === existingLog.id ? { ...l, completed: isNowCompleted, completedAt: isNowCompleted ? new Date().toISOString() : undefined } : l
      );
    } else {
      const newLog: DailyLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        challengeId: challenge.id,
        itemId: habitId,
        itemType: 'habit',
        date: dateStr,
        completed: true,
        completedAt: new Date().toISOString()
      };
      updatedLogs = [...dailyLogs, newLog];
    }

    setDailyLogs(updatedLogs);
    AppStorage.saveDailyLogs(updatedLogs);

    // Update XP Ledger deterministically
    let updatedXP = [...xpEvents];
    const eventKey = `habit-${habitId}-${dateStr}`;

    if (isNowCompleted) {
      sound.playCheck();
      // Add XP event if not already present
      if (!updatedXP.some(e => e.id === eventKey)) {
        updatedXP.push({
          id: eventKey,
          challengeId: challenge.id,
          sourceId: habitId,
          date: dateStr,
          amount: XP_VALUES.HABIT_COMPLETED,
          reason: 'habit_completed',
          createdAt: new Date().toISOString()
        });
      }

      // Check clean sweep for the day
      const scheduledHabits = habits.filter(h => isDayScheduledForHabit(h, dateStr));
      const scheduledTasks = tasks.filter(t => t.dueDate === dateStr);
      const totalOpportunities = scheduledHabits.length + scheduledTasks.length;

      let completedCount = 0;
      scheduledHabits.forEach(h => {
        const log = updatedLogs.find(l => l.itemId === h.id && l.date === dateStr);
        if (log && log.completed) completedCount++;
      });
      scheduledTasks.forEach(t => {
        const log = updatedLogs.find(l => l.itemId === t.id && l.date === dateStr);
        if (log ? log.completed : t.status === 'completed') completedCount++;
      });

      if (totalOpportunities > 0 && completedCount === totalOpportunities) {
        const sweepKey = `sweep-${dateStr}`;
        if (!updatedXP.some(e => e.id === sweepKey)) {
          updatedXP.push({
            id: sweepKey,
            challengeId: challenge.id,
            sourceId: 'clean_sweep',
            date: dateStr,
            amount: XP_VALUES.CLEAN_SWEEP_BONUS,
            reason: 'daily_clean_sweep',
            createdAt: new Date().toISOString()
          });
        }
      }
    } else {
      sound.playClick();
      // Remove habit completion event
      updatedXP = updatedXP.filter(e => e.id !== eventKey);
      // Remove clean sweep bonus for this day
      updatedXP = updatedXP.filter(e => e.id !== `sweep-${dateStr}`);
    }

    updatedXP = rebuildProgressBonuses(updatedXP, challenge, habits, tasks, updatedLogs, profile);
    setXpEvents(updatedXP);
    AppStorage.saveXPEvents(updatedXP);

    // Check for rank tier progression unlocks
    const newTotalXP = calculateTotalXP(updatedXP);
    const newRank = getRankFromXP(newTotalXP).currentRank;
    if (newRank.tier > currentRank.tier) {
      sound.playRankUp();
      // Unlock tier cosmetic
      const unlockedItem = UNLOCKABLES.find(u => u.requiredRankTier === newRank.tier);
      if (unlockedItem && !profile.unlockedItemIds.includes(unlockedItem.id)) {
        const nextIds = [...profile.unlockedItemIds, unlockedItem.id];
        const nextProf = { ...profile, unlockedItemIds: nextIds };
        setProfile(nextProf);
        AppStorage.saveUserProfile(nextProf);
      }
      setIsPersonaModalOpen(true);
    }
  };

  // Handle task completion toggle
  const handleToggleTask = (taskId: string, dateStr: string) => {
    if (!challenge) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const existingLog = dailyLogs.find(l => l.itemId === taskId && l.date === dateStr);
    const isNowCompleted = existingLog ? !existingLog.completed : task.status !== 'completed';

    let updatedLogs: DailyLog[];
    if (existingLog) {
      updatedLogs = dailyLogs.map(l =>
        l.id === existingLog.id ? { ...l, completed: isNowCompleted, completedAt: isNowCompleted ? new Date().toISOString() : undefined } : l
      );
    } else {
      const newLog: DailyLog = {
        id: `task-log-${Date.now()}`,
        challengeId: challenge.id,
        itemId: taskId,
        itemType: 'task',
        date: dateStr,
        completed: isNowCompleted,
        completedAt: new Date().toISOString()
      };
      updatedLogs = [...dailyLogs, newLog];
    }

    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: isNowCompleted ? ('completed' as const) : ('pending' as const) } : t
    );

    setDailyLogs(updatedLogs);
    setTasks(updatedTasks);
    AppStorage.saveDailyLogs(updatedLogs);
    AppStorage.saveTasks(updatedTasks);

    // XP update
    let updatedXP = [...xpEvents];
    const eventKey = `task-${taskId}-${dateStr}`;

    if (isNowCompleted) {
      sound.playCheck();
      if (!updatedXP.some(e => e.id === eventKey)) {
        updatedXP.push({
          id: eventKey,
          challengeId: challenge.id,
          sourceId: taskId,
          date: dateStr,
          amount: XP_VALUES.TASK_COMPLETED,
          reason: 'task_completed',
          createdAt: new Date().toISOString()
        });
      }
    } else {
      sound.playClick();
      updatedXP = updatedXP.filter(e => e.id !== eventKey);
    }

    updatedXP = rebuildProgressBonuses(updatedXP, challenge, habits, tasks, updatedLogs, profile);
    setXpEvents(updatedXP);
    AppStorage.saveXPEvents(updatedXP);
  };

  const handleToggleTaskDirect = (taskId: string) => {
    const today = getTodayDateString();
    handleToggleTask(taskId, today);
  };

  const handleAddHabit = (newHabit: Omit<Habit, 'id' | 'challengeId' | 'sortOrder'>) => {
    if (!challenge) return;
    const habit: Habit = {
      ...newHabit,
      id: `habit-${Date.now()}`,
      challengeId: challenge.id,
      sortOrder: habits.length
    };
    const updated = [...habits, habit];
    setHabits(updated);
    AppStorage.saveHabits(updated);
  };

  const handleArchiveHabit = (habitId: string) => {
    const today = getTodayDateString();
    const updated = habits.map(h => (h.id === habitId ? { ...h, archivedAt: today } : h));
    setHabits(updated);
    AppStorage.saveHabits(updated);
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'challengeId' | 'createdAt' | 'status'>) => {
    if (!challenge) return;
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      challengeId: challenge.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const updated = [...tasks, task];
    setTasks(updated);
    AppStorage.saveTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    AppStorage.saveTasks(updated);
  };

  const handleSaveReflection = (date: string, note: string) => {
    AppStorage.saveReflection(date, note);
    setReflections(prev => ({ ...prev, [date]: note }));
  };

  const handleUpdateProfile = (updatedFields: Partial<UserProfile>) => {
    const updated = { ...profile, ...updatedFields };
    setProfile(updated);
    AppStorage.saveUserProfile(updated);
  };

  const handleResetData = () => {
    AppStorage.wipeAllData();
    setIsOnboardingOpen(true);
    setChallenge(null);
    setHabits([]);
    setTasks([]);
    setDailyLogs([]);
    setXpEvents([]);
    setProfile(DEFAULT_PROFILE);
    setReflections({});
  };

  const handleOnboardingComplete = (newChallenge: Challenge, newHabits: Habit[]) => {
    setChallenge(newChallenge);
    setHabits(newHabits);
    setTasks([]);
    setDailyLogs([]);
    setXpEvents([]);
    AppStorage.saveChallenge(newChallenge);
    AppStorage.saveHabits(newHabits);
    AppStorage.saveTasks([]);
    AppStorage.saveDailyLogs([]);
    AppStorage.saveXPEvents([]);
    setIsOnboardingOpen(false);
    setCurrentTab('home');
  };

  // Pending missions count for bottom nav badge
  const today = getTodayDateString();
  const scheduledTodayHabits = habits.filter(h => isDayScheduledForHabit(h, today));
  const scheduledTodayTasks = tasks.filter(t => t.dueDate === today);
  let pendingCount = 0;
  scheduledTodayHabits.forEach(h => {
    const l = dailyLogs.find(log => log.itemId === h.id && log.date === today);
    if (!l || !l.completed) pendingCount++;
  });
  scheduledTodayTasks.forEach(t => {
    const l = dailyLogs.find(log => log.itemId === t.id && log.date === today);
    const isComp = l ? l.completed : t.status === 'completed';
    if (!isComp) pendingCount++;
  });

  if (isOnboardingOpen || !challenge) {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F3F5F7] font-sans antialiased selection:bg-[#E0B34C] selection:text-black">
      {/* Top Tactical Telemetry Header */}
      <Header
        challenge={challenge}
        profile={profile}
        currentRank={currentRank}
        onOpenRecovery={() => setIsRecoveryOpen(true)}
        onToggleSound={() => {
          const next = !profile.soundEnabled;
          sound.enabled = next;
          handleUpdateProfile({ soundEnabled: next });
        }}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="transition-opacity duration-200">
        {currentTab === 'home' && (
          <MissionControlView
            challenge={challenge}
            habits={habits}
            tasks={tasks}
            dailyLogs={dailyLogs}
            profile={profile}
            currentRank={currentRank}
            nextRank={nextRank}
            xpEvents={xpEvents}
            currentStreak={currentStreak}
            reflections={reflections}
            onToggleHabit={handleToggleHabit}
            onToggleTask={handleToggleTask}
            onAddTask={(title, category) => handleAddTask({ title, category, dueDate: today })}
            onSaveReflection={handleSaveReflection}
            onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
            onOpenRecovery={() => setIsRecoveryOpen(true)}
          />
        )}

        {currentTab === 'missions' && (
          <MissionsView
            habits={habits}
            tasks={tasks}
            onAddHabit={handleAddHabit}
            onArchiveHabit={handleArchiveHabit}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onToggleTaskDirect={handleToggleTaskDirect}
          />
        )}

        {currentTab === 'heatmap' && (
          <HeatMapView
            challenge={challenge}
            habits={habits}
            tasks={tasks}
            dailyLogs={dailyLogs}
            reflections={reflections}
            onSaveReflection={handleSaveReflection}
            onToggleItem={(itemId, type, date) => {
              if (type === 'habit') {
                handleToggleHabit(itemId, date);
              } else {
                handleToggleTask(itemId, date);
              }
            }}
          />
        )}

        {currentTab === 'stats' && (
          <IntelligenceView
            challenge={challenge}
            habits={habits}
            tasks={tasks}
            dailyLogs={dailyLogs}
            profile={profile}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            profile={profile}
            currentRank={currentRank}
            nextRank={nextRank}
            progressPercent={progressPercent}
            onUpdateProfile={handleUpdateProfile}
            onDataImported={reloadData}
            onResetData={handleResetData}
            onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Tactical Navigation Bar */}
      <NavBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingMissionsCount={pendingCount}
      />

      {/* Recovery Protocol Modal */}
      {isRecoveryOpen && (
        <RecoveryModal
          onClose={() => setIsRecoveryOpen(false)}
          onResume={() => setCurrentTab('home')}
        />
      )}

      {/* Persona Reveal Modal */}
      {isPersonaModalOpen && (
        <PersonaRevealModal
          profile={profile}
          currentRank={currentRank}
          onClose={() => setIsPersonaModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
