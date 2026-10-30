import React, { useState } from 'react';
import { Challenge, DailyLog, Habit, RankInfo, Task, UserProfile, XPEvent } from '../types';
import { formatDisplayDate, getChallengeDayNumber, getTodayDateString, isDayScheduledForHabit } from '../utils/date';
import { sound } from '../utils/audio';
import { CheckCircle2, Circle, Plus, Zap, Shield, Sparkles, BookOpen, Target, CalendarDays, X } from 'lucide-react';
import { FocusModeModal } from '../components/FocusModeModal';
import { GamificationPanel } from '../components/GamificationPanel';

interface MissionControlViewProps {
  challenge: Challenge;
  habits: Habit[];
  tasks: Task[];
  dailyLogs: DailyLog[];
  profile: UserProfile;
  currentRank: RankInfo;
  nextRank: RankInfo | null;
  xpEvents: XPEvent[];
  currentStreak: number;
  reflections: Record<string, string>;
  onToggleHabit: (habitId: string, date: string) => void;
  onToggleTask: (taskId: string, date: string) => void;
  onAddTask: (title: string, category: 'tactical' | 'intel' | 'physical' | 'recovery' | 'discipline') => void;
  onSaveReflection: (date: string, note: string) => void;
  onOpenPersonaModal: () => void;
  onOpenRecovery: () => void;
}

export const MissionControlView: React.FC<MissionControlViewProps> = ({
  challenge,
  habits,
  tasks,
  dailyLogs,
  profile,
  currentRank,
  nextRank,
  xpEvents,
  currentStreak,
  reflections,
  onToggleHabit,
  onToggleTask,
  onAddTask,
  onSaveReflection,
  onOpenPersonaModal,
  onOpenRecovery
}) => {
  const today = getTodayDateString();
  const dayNumber = getChallengeDayNumber(challenge.startDate, today);

  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [focusItem, setFocusItem] = useState<{ id: string; title: string; subtitle?: string; isHabit: boolean } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'tactical' | 'intel' | 'physical' | 'recovery' | 'discipline'>('tactical');

  // Daily reflection state
  const [isEditingDebrief, setIsEditingDebrief] = useState(false);
  const [debriefText, setDebriefText] = useState(reflections[today] || '');

  // Scheduled today
  const scheduledHabits = habits.filter(h => isDayScheduledForHabit(h, today));
  const scheduledTasks = tasks.filter(t => t.dueDate === today);
  const totalMissions = scheduledHabits.length + scheduledTasks.length;

  let completedMissions = 0;
  scheduledHabits.forEach(h => {
    const log = dailyLogs.find(l => l.itemId === h.id && l.date === today);
    if (log && log.completed) completedMissions++;
  });
  scheduledTasks.forEach(t => {
    const log = dailyLogs.find(l => l.itemId === t.id && l.date === today);
    if (log ? log.completed : t.status === 'completed') completedMissions++;
  });

  const remainingMissions = Math.max(0, totalMissions - completedMissions);
  const completionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
  const isCleanSweep = totalMissions > 0 && completedMissions === totalMissions;

  const handleStartFocus = (item: { id: string; title: string; subtitle?: string; isHabit: boolean }) => {
    sound.playClick();
    setFocusItem(item);
    setIsFocusOpen(true);
  };

  const handleCompleteFocus = () => {
    if (!focusItem) return;
    if (focusItem.isHabit) {
      onToggleHabit(focusItem.id, today);
    } else {
      onToggleTask(focusItem.id, today);
    }
  };

  const handleSaveDebrief = () => {
    sound.playClick();
    onSaveReflection(today, debriefText);
    setIsEditingDebrief(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    sound.playClick();
    onAddTask(newTaskTitle.trim(), newTaskCategory);
    setNewTaskTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-4 space-y-5 pb-24 max-w-md mx-auto">
      {/* Tactical Status Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141821] via-[#1C2230] to-[#141821] border border-[#242C3D] p-5 shadow-panel-subtle">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#242C3D15_1px,transparent_1px),linear-gradient(to_bottom,#242C3D15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#5BC69A] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9AA4B2]">
                STATUS: {challenge.status.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl font-tactical font-bold text-[#F3F5F7] tracking-wide">
              {challenge.title}
            </h1>
            <p className="text-xs text-[#E0B34C] font-mono mt-0.5">
              DAY {Math.max(1, dayNumber)} OF {challenge.durationDays} • {formatDisplayDate(today, 'full')}
            </p>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono text-[#9AA4B2] uppercase">DAILY PROGRESS</div>
            <div className="text-2xl font-mono font-bold text-[#E0B34C]">
              {completionRate}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 mt-4">
          <div className="flex justify-between text-[11px] text-[#9AA4B2] mb-1 font-mono">
            <span>{completedMissions} of {totalMissions} missions completed</span>
            <span>{remainingMissions} remaining</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#0B0D12] border border-[#242C3D] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#B88B2A] to-[#E0B34C] transition-all duration-500 shadow-[0_0_8px_rgba(224,179,76,0.5)]"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Clean Sweep Alert */}
        {isCleanSweep && (
          <div className="relative z-10 mt-3 pt-3 border-t border-[#323E54] flex items-center justify-between text-xs text-[#5BC69A] font-tactical font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} /> CLEAN SWEEP ACHIEVED (+15 BONUS XP)
            </span>
            <span className="text-[10px] font-mono uppercase text-[#F3F5F7] bg-[#5BC69A]/20 px-2 py-0.5 rounded">
              OPTIMAL
            </span>
          </div>
        )}

        {/* Persona & Recovery Quick Bar */}
        <div className="relative z-10 mt-3 pt-3 border-t border-[#242C3D] flex items-center justify-between text-xs">
          <button
            onClick={() => {
              sound.playClick();
              onOpenPersonaModal();
            }}
            className="flex items-center gap-1.5 text-[#E0B34C] hover:underline font-mono text-[11px]"
          >
            <span>{currentRank.title} (Tier {currentRank.tier})</span>
            <span className="text-[#9AA4B2]">• {profile.totalXP} XP</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenRecovery();
            }}
            className="text-[11px] text-[#9AA4B2] hover:text-[#6AA9FF] font-mono"
          >
            Recovery Guide →
          </button>
        </div>
      </div>

      <GamificationPanel
        xpEvents={xpEvents}
        totalXP={profile.totalXP}
        nextRank={nextRank}
        streak={currentStreak}
        today={today}
      />

      {/* Quick Action Matrix */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => {
            sound.playClick();
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#141821] border border-[#242C3D] hover:border-[#E0B34C]/50 text-[#F3F5F7] text-xs font-tactical font-bold tracking-wider uppercase transition-colors"
        >
          <Plus size={16} className="text-[#E0B34C]" />
          Add Mission
        </button>

        <button
          onClick={() => {
            if (scheduledHabits.length > 0) {
              handleStartFocus({
                id: scheduledHabits[0].id,
                title: scheduledHabits[0].name,
                subtitle: scheduledHabits[0].description,
                isHabit: true
              });
            } else if (scheduledTasks.length > 0) {
              handleStartFocus({
                id: scheduledTasks[0].id,
                title: scheduledTasks[0].title,
                isHabit: false
              });
            } else {
              setIsAddModalOpen(true);
            }
          }}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1C2230] border border-[#323E54] hover:border-[#6AA9FF]/50 text-[#F3F5F7] text-xs font-tactical font-bold tracking-wider uppercase transition-colors"
        >
          <Zap size={16} className="text-[#6AA9FF]" />
          Focus Sprint
        </button>
      </div>

      {/* Today's Missions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#E0B34C]" />
            <h2 className="text-sm font-tactical font-bold uppercase tracking-wider text-[#F3F5F7]">
              Today's Missions ({totalMissions})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#9AA4B2]">
            {remainingMissions === 0 ? 'All missions cleared' : `${remainingMissions} pending`}
          </span>
        </div>

        {totalMissions === 0 ? (
          <div className="p-6 rounded-2xl bg-[#141821] border border-dashed border-[#242C3D] text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#1C2230] text-[#9AA4B2] flex items-center justify-center mx-auto">
              <CalendarDays size={20} />
            </div>
            <div>
              <div className="text-sm font-tactical font-bold text-[#F3F5F7]">
                No Active Missions Scheduled
              </div>
              <p className="text-xs text-[#9AA4B2] mt-1 max-w-xs mx-auto">
                No habits are configured for today or you have cleared your roster. Add a mission or review your habit schedule.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E0B34C] text-[#0B0D12] text-xs font-tactical font-bold uppercase"
            >
              <Plus size={14} /> Add Mission
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Habits first */}
            {scheduledHabits.map(habit => {
              const log = dailyLogs.find(l => l.itemId === habit.id && l.date === today);
              const isCompleted = log ? log.completed : false;

              return (
                <div
                  key={habit.id}
                  className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-[#141821]/60 border-[#242C3D]'
                      : 'bg-[#141821] border-[#242C3D] hover:border-[#323E54]'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => {
                        onToggleHabit(habit.id, today);
                      }}
                      className="shrink-0 transition-transform active:scale-90"
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={22} className="text-[#5BC69A] fill-[#5BC69A]/20" />
                      ) : (
                        <Circle size={22} className="text-[#9AA4B2] hover:text-[#E0B34C]" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium truncate ${
                        isCompleted ? 'line-through text-[#9AA4B2]' : 'text-[#F3F5F7]'
                      }`}>
                        {habit.name}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#9AA4B2]">
                        {habit.targetValue && habit.targetUnit && (
                          <span className="flex items-center gap-1">
                            <Target size={11} className="text-[#E0B34C]" />
                            {habit.targetValue} {habit.targetUnit}
                          </span>
                        )}
                        <span className="text-[#242C3D]">•</span>
                        <span className="font-mono text-[#E0B34C] text-[10px]">+10 XP</span>
                      </div>
                    </div>
                  </div>

                  {!isCompleted && (
                    <button
                      onClick={() => handleStartFocus({
                        id: habit.id,
                        title: habit.name,
                        subtitle: habit.description,
                        isHabit: true
                      })}
                      title="Focus on this mission"
                      className="p-2 rounded-lg bg-[#1C2230] text-[#9AA4B2] hover:text-[#6AA9FF] hover:border-[#6AA9FF]/40 border border-[#242C3D] transition-colors ml-2"
                    >
                      <Zap size={14} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* One-off tasks */}
            {scheduledTasks.map(task => {
              const log = dailyLogs.find(l => l.itemId === task.id && l.date === today);
              const isCompleted = log ? log.completed : task.status === 'completed';

              return (
                <div
                  key={task.id}
                  className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-[#141821]/60 border-[#242C3D]'
                      : 'bg-[#141821] border-[#242C3D] hover:border-[#323E54]'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id, today)}
                      className="shrink-0 transition-transform active:scale-90"
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={22} className="text-[#5BC69A] fill-[#5BC69A]/20" />
                      ) : (
                        <Circle size={22} className="text-[#9AA4B2] hover:text-[#6AA9FF]" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium truncate ${
                        isCompleted ? 'line-through text-[#9AA4B2]' : 'text-[#F3F5F7]'
                      }`}>
                        {task.title}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#9AA4B2]">
                        <span className="capitalize px-1.5 py-0.2 rounded bg-[#1C2230] text-[10px] text-[#6AA9FF]">
                          {task.category || 'task'}
                        </span>
                        <span className="font-mono text-[#6AA9FF] text-[10px]">+5 XP</span>
                      </div>
                    </div>
                  </div>

                  {!isCompleted && (
                    <button
                      onClick={() => handleStartFocus({
                        id: task.id,
                        title: task.title,
                        subtitle: task.notes,
                        isHabit: false
                      })}
                      title="Focus on this task"
                      className="p-2 rounded-lg bg-[#1C2230] text-[#9AA4B2] hover:text-[#6AA9FF] hover:border-[#6AA9FF]/40 border border-[#242C3D] transition-colors ml-2"
                    >
                      <Zap size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily Debrief / Reflection Card */}
      <div className="rounded-2xl bg-[#141821] border border-[#242C3D] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#E0B34C]" />
            <h3 className="text-xs font-tactical font-bold uppercase tracking-wider text-[#F3F5F7]">
              Daily Tactical Debrief
            </h3>
          </div>
          {!isEditingDebrief && (
            <button
              onClick={() => {
                sound.playClick();
                setIsEditingDebrief(true);
              }}
              className="text-xs text-[#E0B34C] hover:underline"
            >
              {debriefText ? 'Edit' : 'Record Reflection'}
            </button>
          )}
        </div>

        {isEditingDebrief ? (
          <div className="space-y-2 mt-2">
            <textarea
              value={debriefText}
              onChange={e => setDebriefText(e.target.value)}
              placeholder="Record operational insights, mental friction, or tactical breakthroughs..."
              rows={3}
              className="w-full rounded-xl bg-[#0B0D12] border border-[#323E54] p-3 text-xs text-[#F3F5F7] placeholder-[#9AA4B2]/60 focus:border-[#E0B34C] focus:outline-none resize-none font-sans"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingDebrief(false)}
                className="px-3 py-1 rounded-lg text-xs text-[#9AA4B2] hover:bg-[#1C2230]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDebrief}
                className="px-3 py-1 rounded-lg bg-[#E0B34C] text-[#0B0D12] text-xs font-tactical font-bold"
              >
                Save Log
              </button>
            </div>
          </div>
        ) : debriefText ? (
          <p className="text-xs text-[#9AA4B2] italic leading-relaxed bg-[#0B0D12] p-3 rounded-xl border border-[#242C3D]">
            "{debriefText}"
          </p>
        ) : (
          <p className="text-xs text-[#9AA4B2]/70 italic">
            Log today's mental discipline and challenges to refine your operational habit loop.
          </p>
        )}
      </div>

      {/* Focus Mode Modal */}
      {isFocusOpen && focusItem && (
        <FocusModeModal
          missionTitle={focusItem.title}
          missionSubtitle={focusItem.subtitle}
          onComplete={handleCompleteFocus}
          onClose={() => {
            setIsFocusOpen(false);
            setFocusItem(null);
          }}
        />
      )}

      {/* Add Mission Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D12]/95 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-[#141821] border border-[#242C3D] p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#242C3D] mb-4">
              <h3 className="text-base font-tactical font-bold text-[#F3F5F7]">
                Deploy One-Off Mission
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#9AA4B2] hover:text-[#F3F5F7]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-[#9AA4B2] uppercase mb-1">
                  MISSION OBJECTIVE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Calibrate sensor kit, Review logistics..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full bg-[#0B0D12] border border-[#242C3D] rounded-xl px-3 py-2.5 text-xs text-[#F3F5F7] focus:border-[#E0B34C] focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9AA4B2] uppercase mb-1">
                  CATEGORY
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['tactical', 'intel', 'physical', 'recovery', 'discipline'] as const).map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setNewTaskCategory(cat)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-mono capitalize border transition-colors ${
                        newTaskCategory === cat
                          ? 'bg-[#E0B34C] text-[#0B0D12] border-[#E0B34C] font-bold'
                          : 'bg-[#1C2230] text-[#9AA4B2] border-[#242C3D]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#E0B34C] text-[#0B0D12] text-xs font-tactical font-bold uppercase tracking-wider hover:bg-[#B88B2A] transition-colors"
              >
                Commit Mission (+5 XP)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
