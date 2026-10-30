import React, { useState } from 'react';
import { Challenge, DailyLog, Habit, Task } from '../types';
import { formatDisplayDate, generateDateRange, getChallengeDayNumber, getTodayDateString } from '../utils/date';
import { getDayBreakdown } from '../utils/analytics';
import { sound } from '../utils/audio';
import { DateDetailsSheet } from '../components/DateDetailsSheet';
import { Calendar, Info } from 'lucide-react';

interface HeatMapViewProps {
  challenge: Challenge;
  habits: Habit[];
  tasks: Task[];
  dailyLogs: DailyLog[];
  reflections: Record<string, string>;
  onSaveReflection: (date: string, note: string) => void;
  onToggleItem: (itemId: string, itemType: 'habit' | 'task', date: string) => void;
}

export const HeatMapView: React.FC<HeatMapViewProps> = ({
  challenge,
  habits,
  tasks,
  dailyLogs,
  reflections,
  onSaveReflection,
  onToggleItem
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = getTodayDateString();

  const allDates = generateDateRange(challenge.startDate, challenge.durationDays);

  // Group into weeks of 7 days
  const weeks: string[][] = [];
  for (let i = 0; i < allDates.length; i += 7) {
    weeks.push(allDates.slice(i, i + 7));
  }

  // Summary stats
  let totalActiveCompletedDays = 0;
  let totalOpportunities = 0;
  let totalCompletedOps = 0;

  allDates.forEach(date => {
    if (date <= today) {
      const bd = getDayBreakdown(date, habits, tasks, dailyLogs);
      if (bd.isEligible) {
        totalOpportunities += bd.scheduledCount;
        totalCompletedOps += bd.completedCount;
        if (bd.rate >= 0.7) {
          totalActiveCompletedDays++;
        }
      }
    }
  });

  const overallConsistencyRate = totalOpportunities > 0
    ? Math.round((totalCompletedOps / totalOpportunities) * 100)
    : 0;

  const getIntensityClass = (date: string) => {
    const isFuture = date > today;
    if (isFuture) {
      return 'bg-[#141821] border-[#242C3D] opacity-40';
    }

    const bd = getDayBreakdown(date, habits, tasks, dailyLogs);

    if (bd.isNeutral) {
      return 'bg-[#141821] border-dashed border-[#323E54]';
    }

    if (bd.completedCount === 0) {
      return 'bg-[#2A1719] border-[#E36C70]/40 text-[#E36C70]';
    }

    const pct = Math.round(bd.rate * 100);
    if (pct < 50) {
      return 'bg-[#403318] border-[#B88B2A]/50 text-[#E0B34C]';
    }
    if (pct < 100) {
      return 'bg-[#7A5B18] border-[#E0B34C] text-[#F3F5F7] shadow-[0_0_8px_rgba(224,179,76,0.3)]';
    }
    return 'bg-[#183B2E] border-[#5BC69A] text-[#5BC69A] shadow-[0_0_10px_rgba(91,198,154,0.4)]';
  };

  return (
    <div className="p-4 space-y-5 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#E0B34C]" />
          <h1 className="text-xl font-tactical font-bold text-[#F3F5F7] tracking-wide">
            OPERATIONAL HEAT MAP
          </h1>
        </div>
        <p className="text-xs text-[#9AA4B2] mt-0.5">
          {challenge.durationDays}-Day tactical consistency matrix. Tap any cell to inspect mission logs.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#141821] border border-[#242C3D]">
          <span className="text-[10px] font-mono uppercase text-[#9AA4B2] block mb-0.5">
            EFFECTIVE CONSISTENCY
          </span>
          <div className="text-2xl font-mono font-bold text-[#E0B34C]">
            {overallConsistencyRate}%
          </div>
          <span className="text-[10px] text-[#9AA4B2] mt-1 block">
            {totalCompletedOps} / {totalOpportunities} opportunities logged
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#141821] border border-[#242C3D]">
          <span className="text-[10px] font-mono uppercase text-[#9AA4B2] block mb-0.5">
            SUCCESSFUL DAYS
          </span>
          <div className="text-2xl font-mono font-bold text-[#5BC69A]">
            {totalActiveCompletedDays}
          </div>
          <span className="text-[10px] text-[#9AA4B2] mt-1 block">
            Days meeting &ge;70% threshold
          </span>
        </div>
      </div>

      {/* Calendar Heat Map Grid */}
      <div className="p-4 rounded-2xl bg-[#141821] border border-[#242C3D] space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-[#9AA4B2]">
          <span>START: {formatDisplayDate(challenge.startDate, 'day_month')}</span>
          <span>END: {formatDisplayDate(challenge.endDate, 'day_month')}</span>
        </div>

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-[#9AA4B2] pb-1 border-b border-[#242C3D]">
          {['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        {/* Weeks Matrix */}
        <div className="space-y-1.5">
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="grid grid-cols-7 gap-1.5">
              {week.map(date => {
                const dayNum = getChallengeDayNumber(challenge.startDate, date);
                const isToday = date === today;
                const isFuture = date > today;
                const intensity = getIntensityClass(date);
                const bd = getDayBreakdown(date, habits, tasks, dailyLogs);

                return (
                  <button
                    key={date}
                    onClick={() => {
                      sound.playClick();
                      setSelectedDate(date);
                    }}
                    title={`${date}: Day ${dayNum} (${Math.round(bd.rate * 100)}%)`}
                    className={`h-11 rounded-lg border flex flex-col items-center justify-center relative transition-all active:scale-95 ${intensity} ${
                      isToday ? 'ring-2 ring-[#E0B34C] ring-offset-1 ring-offset-[#0B0D12]' : ''
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold leading-none">
                      {dayNum}
                    </span>

                    {!isFuture && !bd.isNeutral && (
                      <span className="text-[9px] font-mono opacity-80 mt-1 leading-none">
                        {Math.round(bd.rate * 100)}%
                      </span>
                    )}

                    {isToday && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E0B34C] animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Tactical Legend */}
        <div className="pt-3 border-t border-[#242C3D] flex items-center justify-between text-[10px] font-mono text-[#9AA4B2]">
          <span className="flex items-center gap-1">
            <Info size={11} /> LEGEND:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#2A1719] border border-[#E36C70]/40" title="0% Completed" />
            <span className="w-3 h-3 rounded bg-[#403318] border border-[#B88B2A]/50" title="1-49%" />
            <span className="w-3 h-3 rounded bg-[#7A5B18] border border-[#E0B34C]" title="50-99%" />
            <span className="w-3 h-3 rounded bg-[#183B2E] border border-[#5BC69A]" title="100% Clean Sweep" />
            <span className="w-3 h-3 rounded bg-[#141821] border-dashed border-[#323E54]" title="Rest Day" />
          </div>
        </div>
      </div>

      {/* Date Details Modal */}
      {selectedDate && (
        <DateDetailsSheet
          date={selectedDate}
          challenge={challenge}
          habits={habits}
          tasks={tasks}
          dailyLogs={dailyLogs}
          reflection={reflections[selectedDate]}
          onSaveReflection={onSaveReflection}
          onToggleItem={onToggleItem}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
};
