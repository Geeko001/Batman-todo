import React, { useState } from 'react';
import { X, CheckCircle2, Circle, Calendar, Edit3, Save } from 'lucide-react';
import { Challenge, DailyLog, Habit, Task } from '../types';
import { formatDisplayDate, getChallengeDayNumber, isDayScheduledForHabit } from '../utils/date';
import { sound } from '../utils/audio';

interface DateDetailsSheetProps {
  date: string;
  challenge: Challenge;
  habits: Habit[];
  tasks: Task[];
  dailyLogs: DailyLog[];
  reflection?: string;
  onSaveReflection: (date: string, note: string) => void;
  onToggleItem: (itemId: string, itemType: 'habit' | 'task', date: string) => void;
  onClose: () => void;
}

export const DateDetailsSheet: React.FC<DateDetailsSheetProps> = ({
  date,
  challenge,
  habits,
  tasks,
  dailyLogs,
  reflection = '',
  onSaveReflection,
  onToggleItem,
  onClose
}) => {
  const [reflectionText, setReflectionText] = useState(reflection);
  const [isEditingNote, setIsEditingNote] = useState(false);

  const dayNumber = getChallengeDayNumber(challenge.startDate, date);
  const scheduledHabits = habits.filter(h => isDayScheduledForHabit(h, date));
  const scheduledTasks = tasks.filter(t => t.dueDate === date);
  const totalScheduled = scheduledHabits.length + scheduledTasks.length;

  let completedCount = 0;
  scheduledHabits.forEach(h => {
    const log = dailyLogs.find(l => l.itemId === h.id && l.date === date);
    if (log && log.completed) completedCount++;
  });
  scheduledTasks.forEach(t => {
    const log = dailyLogs.find(l => l.itemId === t.id && l.date === date);
    if (log ? log.completed : t.status === 'completed') completedCount++;
  });

  const rate = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;

  const handleSaveNote = () => {
    sound.playClick();
    onSaveReflection(date, reflectionText);
    setIsEditingNote(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0B0D12]/90 backdrop-blur-md">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-[#141821] border border-[#242C3D] max-h-[85vh] overflow-y-auto p-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#242C3D]">
          <div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#E0B34C]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#9AA4B2]">
                PROTOCOL LOG • DAY {dayNumber > 0 ? dayNumber : 'PRE-LAUNCH'}
              </span>
            </div>
            <h3 className="text-lg font-tactical font-bold text-[#F3F5F7] mt-0.5">
              {formatDisplayDate(date, 'full')}
            </h3>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-[#9AA4B2] hover:text-[#F3F5F7] rounded-lg hover:bg-[#1C2230] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tactical completion badge summary */}
        <div className="my-4 p-3 rounded-xl bg-[#1C2230] border border-[#242C3D] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#9AA4B2]">OPERATIONAL SCORE</div>
            <div className="text-xl font-mono font-bold text-[#F3F5F7]">
              {completedCount} / {totalScheduled}{' '}
              <span className="text-xs font-normal text-[#9AA4B2]">Missions</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-lg text-sm font-tactical font-bold tracking-wide ${
            totalScheduled === 0
              ? 'bg-[#242C3D] text-[#9AA4B2]'
              : rate >= 100
              ? 'bg-[#5BC69A]/20 border border-[#5BC69A] text-[#5BC69A]'
              : rate >= 70
              ? 'bg-[#E0B34C]/20 border border-[#E0B34C] text-[#E0B34C]'
              : 'bg-[#E36C70]/20 border border-[#E36C70] text-[#E36C70]'
          }`}>
            {totalScheduled === 0 ? 'REST / UNASSIGNED' : `${rate}% COMPLETED`}
          </div>
        </div>

        {/* Scheduled Missions List */}
        <div className="space-y-2 mb-5">
          <h4 className="text-xs font-mono uppercase text-[#9AA4B2] tracking-wider">
            SCHEDULED MISSIONS
          </h4>

          {totalScheduled === 0 ? (
            <div className="p-4 rounded-xl bg-[#1C2230]/40 border border-dashed border-[#242C3D] text-center text-xs text-[#9AA4B2]">
              No habits or tasks were active on this date.
            </div>
          ) : (
            <>
              {scheduledHabits.map(habit => {
                const isCompleted = dailyLogs.some(l => l.itemId === habit.id && l.date === date && l.completed);
                return (
                  <div
                    key={habit.id}
                    onClick={() => onToggleItem(habit.id, 'habit', date)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#1C2230] border border-[#242C3D] cursor-pointer hover:border-[#323E54] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle2 size={18} className="text-[#5BC69A]" />
                      ) : (
                        <Circle size={18} className="text-[#9AA4B2]" />
                      )}
                      <div>
                        <div className={`text-sm font-medium ${isCompleted ? 'line-through text-[#9AA4B2]' : 'text-[#F3F5F7]'}`}>
                          {habit.name}
                        </div>
                        {habit.targetValue && habit.targetUnit && (
                          <div className="text-[11px] text-[#9AA4B2]">
                            Target: {habit.targetValue} {habit.targetUnit}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141821] text-[#E0B34C]">
                      HABIT
                    </span>
                  </div>
                );
              })}

              {scheduledTasks.map(task => {
                const log = dailyLogs.find(l => l.itemId === task.id && l.date === date);
                const isCompleted = log ? log.completed : task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    onClick={() => onToggleItem(task.id, 'task', date)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#1C2230] border border-[#242C3D] cursor-pointer hover:border-[#323E54] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle2 size={18} className="text-[#5BC69A]" />
                      ) : (
                        <Circle size={18} className="text-[#9AA4B2]" />
                      )}
                      <div>
                        <div className={`text-sm font-medium ${isCompleted ? 'line-through text-[#9AA4B2]' : 'text-[#F3F5F7]'}`}>
                          {task.title}
                        </div>
                        {task.category && (
                          <div className="text-[11px] text-[#9AA4B2] capitalize">
                            {task.category}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141821] text-[#6AA9FF]">
                      TASK
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Daily Reflection Note */}
        <div className="border-t border-[#242C3D] pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-[#9AA4B2] tracking-wider">
              DAILY DEBRIEF & REFLECTION
            </span>
            {!isEditingNote && (
              <button
                onClick={() => setIsEditingNote(true)}
                className="text-xs text-[#E0B34C] hover:underline flex items-center gap-1"
              >
                <Edit3 size={12} /> {reflectionText ? 'Edit' : 'Add Note'}
              </button>
            )}
          </div>

          {isEditingNote ? (
            <div className="space-y-2">
              <textarea
                value={reflectionText}
                onChange={e => setReflectionText(e.target.value)}
                placeholder="Log energy levels, obstacles faced, or tactical adjustments..."
                rows={3}
                className="w-full rounded-xl bg-[#0B0D12] border border-[#323E54] p-3 text-sm text-[#F3F5F7] placeholder-[#9AA4B2]/60 focus:border-[#E0B34C] focus:outline-none resize-none font-sans"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#9AA4B2] hover:bg-[#1C2230]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E0B34C] text-[#0B0D12] text-xs font-tactical font-bold"
                >
                  <Save size={12} /> Save Debrief
                </button>
              </div>
            </div>
          ) : reflectionText ? (
            <div className="p-3 rounded-xl bg-[#0B0D12] border border-[#242C3D] text-sm text-[#F3F5F7] italic">
              "{reflectionText}"
            </div>
          ) : (
            <p className="text-xs text-[#9AA4B2]/70 italic">
              No debrief recorded for this operational cycle.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
