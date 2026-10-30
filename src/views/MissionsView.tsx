import React, { useState } from 'react';
import { Habit, ScheduleFrequency, Task, TaskCategory } from '../types';
import { getTodayDateString } from '../utils/date';
import { sound } from '../utils/audio';
import { Plus, Archive, Trash2, CheckCircle2, Circle, Target, Calendar } from 'lucide-react';

interface MissionsViewProps {
  habits: Habit[];
  tasks: Task[];
  onAddHabit: (habit: Omit<Habit, 'id' | 'challengeId' | 'sortOrder'>) => void;
  onArchiveHabit: (habitId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'challengeId' | 'createdAt' | 'status'>) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTaskDirect: (taskId: string) => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  habits,
  tasks,
  onAddHabit,
  onArchiveHabit,
  onAddTask,
  onDeleteTask,
  onToggleTaskDirect
}) => {
  const [filter, setFilter] = useState<'all' | 'habits' | 'tasks'>('all');
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // New habit form state
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitTarget, setHabitTarget] = useState('');
  const [habitUnit, setHabitUnit] = useState('');
  const [habitSchedule, setHabitSchedule] = useState<ScheduleFrequency>('daily');

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(getTodayDateString());
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('tactical');
  const [taskNotes, setTaskNotes] = useState('');

  const activeHabits = habits.filter(h => !h.archivedAt);
  const archivedHabits = habits.filter(h => h.archivedAt);

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    sound.playClick();
    onAddHabit({
      name: habitName.trim(),
      description: habitDescription.trim() || undefined,
      targetValue: habitTarget ? parseFloat(habitTarget) : undefined,
      targetUnit: habitUnit.trim() || undefined,
      schedule: habitSchedule,
      activeFrom: getTodayDateString()
    });
    setHabitName('');
    setHabitDescription('');
    setHabitTarget('');
    setHabitUnit('');
    setIsAddHabitOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    sound.playClick();
    onAddTask({
      title: taskTitle.trim(),
      notes: taskNotes.trim() || undefined,
      dueDate: taskDueDate,
      category: taskCategory
    });
    setTaskTitle('');
    setTaskNotes('');
    setIsAddTaskOpen(false);
  };

  return (
    <div className="p-4 space-y-5 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-tactical font-bold text-[#F3F5F7] tracking-wide">
            MISSION DIRECTORY
          </h1>
          <p className="text-xs text-[#9AA4B2] mt-0.5">
            Configure recurring habits and tactical assignments
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setIsAddHabitOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E0B34C] text-[#0B0D12] text-xs font-tactical font-bold uppercase"
          >
            <Plus size={14} /> Habit
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setIsAddTaskOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1C2230] border border-[#323E54] text-[#F3F5F7] text-xs font-tactical font-bold uppercase"
          >
            <Plus size={14} /> Task
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-xl bg-[#141821] border border-[#242C3D] p-1">
        {(['all', 'habits', 'tasks'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              sound.playClick();
              setFilter(tab);
            }}
            className={`flex-1 py-1.5 text-xs font-mono uppercase rounded-lg transition-colors ${
              filter === tab
                ? 'bg-[#E0B34C] text-[#0B0D12] font-bold shadow-sm'
                : 'text-[#9AA4B2] hover:text-[#F3F5F7]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Habits Section */}
      {(filter === 'all' || filter === 'habits') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#9AA4B2] uppercase">
            <span>RECURRING HABITS ({activeHabits.length})</span>
            <span>SCHEDULE</span>
          </div>

          <div className="space-y-2">
            {activeHabits.map(habit => (
              <div
                key={habit.id}
                className="p-3.5 rounded-xl bg-[#141821] border border-[#242C3D] flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-[#F3F5F7]">
                    {habit.name}
                  </div>
                  {habit.description && (
                    <div className="text-xs text-[#9AA4B2] mt-0.5">
                      {habit.description}
                    </div>
                  )}
                  {habit.targetValue && habit.targetUnit && (
                    <div className="flex items-center gap-1 text-[11px] text-[#E0B34C] mt-1 font-mono">
                      <Target size={12} />
                      <span>Target: {habit.targetValue} {habit.targetUnit}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C2230] text-[#9AA4B2] uppercase">
                    {habit.schedule}
                  </span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onArchiveHabit(habit.id);
                    }}
                    title="Archive habit (preserves past logs)"
                    className="p-1.5 text-[#9AA4B2] hover:text-[#E36C70] rounded-lg transition-colors"
                  >
                    <Archive size={16} />
                  </button>
                </div>
              </div>
            ))}

            {archivedHabits.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase text-[#9AA4B2]/70 block mb-1">
                  ARCHIVED HABITS ({archivedHabits.length})
                </span>
                {archivedHabits.map(h => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-xl bg-[#0B0D12] border border-[#242C3D]/60 flex items-center justify-between text-xs text-[#9AA4B2] opacity-70 mb-1"
                  >
                    <span className="line-through">{h.name}</span>
                    <span className="text-[10px] font-mono">Archived</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tasks Section */}
      {(filter === 'all' || filter === 'tasks') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#9AA4B2] uppercase">
            <span>TACTICAL ONE-OFF TASKS ({tasks.length})</span>
            <span>DUE DATE</span>
          </div>

          {tasks.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#141821] border border-dashed border-[#242C3D] text-center text-xs text-[#9AA4B2]">
              No individual missions created yet.
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-[#141821] border border-[#242C3D] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          sound.playCheck();
                          onToggleTaskDirect(task.id);
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} className="text-[#5BC69A]" />
                        ) : (
                          <Circle size={18} className="text-[#9AA4B2]" />
                        )}
                      </button>

                      <div>
                        <div className={`text-sm font-medium ${isCompleted ? 'line-through text-[#9AA4B2]' : 'text-[#F3F5F7]'}`}>
                          {task.title}
                        </div>
                        {task.notes && (
                          <div className="text-xs text-[#9AA4B2] mt-0.5">
                            {task.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C2230] text-[#6AA9FF]">
                        {task.dueDate}
                      </span>
                      <button
                        onClick={() => {
                          sound.playClick();
                          onDeleteTask(task.id);
                        }}
                        className="p-1.5 text-[#9AA4B2] hover:text-[#E36C70]"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Habit Modal */}
      {isAddHabitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D12]/95 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-[#141821] border border-[#242C3D] p-5 shadow-2xl">
            <h3 className="text-base font-tactical font-bold text-[#F3F5F7] mb-4">
              Add Recurring Habit
            </h3>
            <form onSubmit={handleCreateHabit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#9AA4B2] uppercase mb-1">
                  HABIT NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. Strength Training, Nightly Read"
                  value={habitName}
                  onChange={e => setHabitName(e.target.value)}
                  className="w-full bg-[#0B0D12] border border-[#242C3D] rounded-xl px-3 py-2 text-xs text-[#F3F5F7] focus:border-[#E0B34C] focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9AA4B2] uppercase mb-1">
                  DESCRIPTION (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5x5 compound lifts"
                  value={habitDescription}
                  onChange={e => setHabitDescription(e.target.value)}
                  className="w-full bg-[#0B0D12] border border-[#242C3D] rounded-xl px-3 py-2 text-xs text-[#F3F5F7] focus:border-[#E0B34C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-[#9AA4B2] uppercase mb-1">
                    TARGET VALUE
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 30"
                    value={habitTarget}
                    onChange={e => setHabitTarget(e.target.value)}
                    className="w-full bg-[#0B0D12] border border-[#242C3D] rounded-xl px-3 py-2 text-xs text-[#F3F5F7] focus:border-[#E0B34C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#9AA4B2] uppercase mb-1">
                    UNIT
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. mins, pages"
                    value={habitUnit}
                    onChange={e => setHabitUnit(e.target.value)}
                    className="w-full bg-[#0B0D12] border border-[#242C3D] rounded-xl px-3 py-2 text-xs text-[#F3F5F7] focus:border-[#E0B34C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9AA4B2] uppercase mb-1">
                  FREQUENCY
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHabitSchedule('daily')}
                    className={`py-2 text-xs font-mono rounded-xl border transition-colors ${
                      habitSchedule === 'daily'
                        ? 'bg-[#E0B34C] text-[#0B0D12] border-[#E0B34C] font-bold'
                        : 'bg-[#1C2230] text-[#9AA4B2] border-[#242C3D]'
                    }`}
                  >
                    Every Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setHabitSchedule('weekdays')}
                    className={`py-2 text-xs font-mono rounded-xl border transition-colors ${
                      habitSchedule === 'weekdays'
                        ? 'bg-[#E0B34C] text-[#0B0D12] border-[#E0B34C] font-bold'
                        : 'bg-[#1C2230] text-[#9AA4B2] border-[#242C3D]'
                    }`}
                  >
                    Mon - Fri
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddHabitOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1C2230] text-[#9AA4B2] text-xs font-tactical"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#E0B34C] text-[#0B0D12] text-xs font-tactical font-bold uppercase"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D12]/95 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-[#141821] border border-[#242C3D] p-5 shadow-2xl">
            <h3 className="text-base font-tactical font-bold text-[#F3F5F7] mb-4">
              Add One-Off Mission
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#9AA4B2] uppercase mb-1">
                  MISSION TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. File evidence log, Calibrate equipment"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="w-full bg-[#0B0D12] border border-[#242C3D] rounded-xl px-3 py-2 text-xs text-[#F3F5F7] focus:border-[#E0B34C] focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9AA4B2] uppercase mb-1">
                  DUE DATE
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    className="w-full bg-[#0B0D12] border border-[#242C3D] rounded-xl px-3 py-2 text-xs text-[#F3F5F7] font-mono focus:border-[#E0B34C] focus:outline-none"
                  />
                  <Calendar size={14} className="absolute right-3 top-3 text-[#9AA4B2] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9AA4B2] uppercase mb-1">
                  CATEGORY
                </label>
                <select
                  value={taskCategory}
                  onChange={e => setTaskCategory(e.target.value as TaskCategory)}
                  className="w-full bg-[#0B0D12] border border-[#242C3D] rounded-xl px-3 py-2 text-xs text-[#F3F5F7] capitalize focus:border-[#E0B34C] focus:outline-none"
                >
                  <option value="tactical">Tactical</option>
                  <option value="intel">Intel</option>
                  <option value="physical">Physical</option>
                  <option value="recovery">Recovery</option>
                  <option value="discipline">Discipline</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9AA4B2] uppercase mb-1">
                  NOTES (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="Additional parameters..."
                  value={taskNotes}
                  onChange={e => setTaskNotes(e.target.value)}
                  className="w-full bg-[#0B0D12] border border-[#242C3D] rounded-xl px-3 py-2 text-xs text-[#F3F5F7] focus:border-[#E0B34C] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1C2230] text-[#9AA4B2] text-xs font-tactical"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#E0B34C] text-[#0B0D12] text-xs font-tactical font-bold uppercase"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
