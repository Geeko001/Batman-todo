import React, { useState } from 'react';
import { Challenge, DailyLog, Habit, Task, UserProfile } from '../types';
import { calculateHabitStats, calculateLikelihood, calculateStreaks } from '../utils/analytics';
import { diffInDays, getTodayDateString } from '../utils/date';
import { sound } from '../utils/audio';
import { Flame, Target, Shield, HelpCircle, Activity, Award, X, TrendingUp } from 'lucide-react';

interface IntelligenceViewProps {
  challenge: Challenge;
  habits: Habit[];
  tasks: Task[];
  dailyLogs: DailyLog[];
  profile: UserProfile;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({
  challenge,
  habits,
  tasks,
  dailyLogs,
  profile
}) => {
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const today = getTodayDateString();

  // Streak calculations
  const streaks = calculateStreaks(challenge, habits, tasks, dailyLogs, today, profile.streakThreshold);

  // Honest likelihood calculation
  const likelihood = calculateLikelihood(challenge, habits, tasks, dailyLogs, today);

  // Challenge elapsed days
  const elapsed = Math.max(0, diffInDays(challenge.startDate, today) + 1);
  const remaining = Math.max(0, challenge.durationDays - elapsed);
  const challengeProgressPct = Math.min(100, Math.round((elapsed / challenge.durationDays) * 100));

  // Habit breakdown
  const habitBreakdowns = habits.map(h => ({
    habit: h,
    stats: calculateHabitStats(h, challenge, dailyLogs, today)
  }));

  // Overall missions completed
  const totalCompletedMissions = dailyLogs.filter(l => l.completed).length;

  return (
    <div className="p-4 space-y-5 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[#E0B34C]" />
          <h1 className="text-xl font-tactical font-bold text-[#F3F5F7] tracking-wide">
            TACTICAL INTELLIGENCE
          </h1>
        </div>
        <p className="text-xs text-[#9AA4B2] mt-0.5">
          Empirical telemetry, discipline momentum, and finish likelihood.
        </p>
      </div>

      {/* Completion Likelihood Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1C2230] via-[#141821] to-[#141821] border border-[#242C3D] p-5 shadow-panel-subtle relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#E0B34C] uppercase tracking-wider mb-1">
              <TrendingUp size={14} />
              COMPLETION LIKELIHOOD
            </div>
            {likelihood.status === 'building_baseline' ? (
              <div>
                <h2 className="text-lg font-tactical font-bold text-[#F3F5F7]">
                  Building Your Baseline
                </h2>
                <p className="text-xs text-[#9AA4B2] mt-1 leading-relaxed">
                  {likelihood.summaryExplanation}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-bold text-[#5BC69A]">
                    {likelihood.percentage}%
                  </span>
                  <span className="text-xs font-mono text-[#9AA4B2] uppercase">
                    CONFIDENCE: {likelihood.confidence.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#9AA4B2] mt-1 leading-relaxed">
                  {likelihood.summaryExplanation}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsExplainerOpen(true);
            }}
            title="Inspect calculation parameters"
            className="p-1.5 text-[#9AA4B2] hover:text-[#E0B34C] rounded-lg hover:bg-[#1C2230] transition-colors"
          >
            <HelpCircle size={18} />
          </button>
        </div>

        {/* Actionable Recommendation */}
        <div className="mt-3 pt-3 border-t border-[#242C3D] flex items-center justify-between text-xs text-[#E0B34C]">
          <span className="italic">{likelihood.actionableRecommendation}</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak */}
        <div className="p-3.5 rounded-2xl bg-[#141821] border border-[#242C3D]">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9AA4B2] uppercase">
            <Flame size={14} className="text-[#E0B34C]" />
            CURRENT STREAK
          </div>
          <div className="text-2xl font-mono font-bold text-[#F3F5F7] mt-1">
            {streaks.currentStreak}{' '}
            <span className="text-xs font-normal text-[#9AA4B2]">Days</span>
          </div>
          <div className="text-[10px] font-mono text-[#9AA4B2] mt-1">
            Best streak: {streaks.bestStreak} days (&ge;{Math.round(profile.streakThreshold * 100)}% target)
          </div>
        </div>

        {/* Elapsed / Days Left */}
        <div className="p-3.5 rounded-2xl bg-[#141821] border border-[#242C3D]">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9AA4B2] uppercase">
            <Target size={14} className="text-[#6AA9FF]" />
            TIMELINE HORIZON
          </div>
          <div className="text-2xl font-mono font-bold text-[#F3F5F7] mt-1">
            {remaining}{' '}
            <span className="text-xs font-normal text-[#9AA4B2]">Days Left</span>
          </div>
          <div className="text-[10px] font-mono text-[#9AA4B2] mt-1">
            Day {elapsed} of {challenge.durationDays} ({challengeProgressPct}%)
          </div>
        </div>

        {/* Total Missions Cleared */}
        <div className="p-3.5 rounded-2xl bg-[#141821] border border-[#242C3D]">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9AA4B2] uppercase">
            <Award size={14} className="text-[#5BC69A]" />
            TOTAL MISSIONS
          </div>
          <div className="text-2xl font-mono font-bold text-[#5BC69A] mt-1">
            {totalCompletedMissions}
          </div>
          <div className="text-[10px] font-mono text-[#9AA4B2] mt-1">
            Verified completions
          </div>
        </div>

        {/* Total XP Earned */}
        <div className="p-3.5 rounded-2xl bg-[#141821] border border-[#242C3D]">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9AA4B2] uppercase">
            <Shield size={14} className="text-[#E0B34C]" />
            OPERATIONAL XP
          </div>
          <div className="text-2xl font-mono font-bold text-[#E0B34C] mt-1">
            {profile.totalXP}
          </div>
          <div className="text-[10px] font-mono text-[#9AA4B2] mt-1">
            Progression ledger total
          </div>
        </div>
      </div>

      {/* Habit Consistency Breakdown */}
      <div className="p-4 rounded-2xl bg-[#141821] border border-[#242C3D] space-y-3">
        <h3 className="text-xs font-mono uppercase text-[#9AA4B2] tracking-wider">
          DISCIPLINE PERFORMANCE BREAKDOWN
        </h3>

        <div className="space-y-3">
          {habitBreakdowns.map(({ habit, stats }) => {
            const pct = Math.round(stats.rate * 100);
            return (
              <div key={habit.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#F3F5F7]">{habit.name}</span>
                  <span className="font-mono text-[#E0B34C] font-bold">{pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#0B0D12] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pct >= 80 ? 'bg-[#5BC69A]' : pct >= 50 ? 'bg-[#E0B34C]' : 'bg-[#E36C70]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#9AA4B2]">
                  <span>{stats.completedCount} completed</span>
                  <span>{stats.scheduledCount} scheduled opportunities</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transparent Calculation Explainer Modal */}
      {isExplainerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D12]/95 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-[#141821] border border-[#242C3D] p-5 shadow-2xl relative text-left">
            <button
              onClick={() => setIsExplainerOpen(false)}
              className="absolute top-4 right-4 text-[#9AA4B2] hover:text-[#F3F5F7]"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-tactical font-bold text-[#F3F5F7] mb-2">
              Transparent Likelihood Heuristic
            </h3>

            <p className="text-xs text-[#9AA4B2] leading-relaxed mb-3">
              We do not fabricate AI prophecies or claim certainty. Your completion likelihood is computed using an honest, tested heuristic:
            </p>

            <div className="space-y-2 text-xs text-[#F3F5F7] bg-[#0B0D12] p-3 rounded-xl border border-[#242C3D] font-mono text-[11px] mb-4">
              <div>• Baseline check: Minimum 5 days logged before activating estimate.</div>
              <div>• Recent momentum: 60% weight on latest 7 operational days.</div>
              <div>• Historical stability: 40% weight on overall eligible challenge days.</div>
              <div>• Guardrails: Extreme values capped softly so early fluctuations don't claim 0% or 100%.</div>
            </div>

            <p className="text-xs text-[#9AA4B2] leading-relaxed">
              Every scheduled mission you check off directly elevates both your recent momentum and your overall trajectory.
            </p>

            <button
              onClick={() => setIsExplainerOpen(false)}
              className="w-full mt-4 py-2 rounded-xl bg-[#1C2230] text-[#F3F5F7] text-xs font-tactical font-bold uppercase hover:bg-[#242C3D]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
