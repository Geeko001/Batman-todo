import React from 'react';
import { Award, Flame, LockKeyhole, Sparkles, Zap } from 'lucide-react';
import { RankInfo, XPEvent } from '../types';

interface GamificationPanelProps {
  xpEvents: XPEvent[];
  totalXP: number;
  nextRank: RankInfo | null;
  streak: number;
  today: string;
}

export const GamificationPanel: React.FC<GamificationPanelProps> = ({ xpEvents, totalXP, nextRank, streak, today }) => {
  const xpToday = xpEvents.filter(event => event.date === today).reduce((sum, event) => sum + event.amount, 0);
  const distanceToRank = nextRank ? Math.max(0, nextRank.minXP - totalXP) : 0;
  const cleanSweeps = xpEvents.filter(event => event.reason === 'daily_clean_sweep').length;
  const earnedBadges = [
    { label: 'First signal', earned: xpEvents.some(event => event.reason === 'habit_completed' || event.reason === 'task_completed') },
    { label: 'Clean sweep', earned: cleanSweeps > 0 },
    { label: 'Seven-day run', earned: xpEvents.some(event => event.reason === 'streak_milestone') }
  ];

  return (
    <section className="rounded-2xl bg-[#141821] border border-[#242C3D] p-4 shadow-panel-subtle space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-tactical font-bold uppercase tracking-wider text-[#F3F5F7] flex items-center gap-2">
          <Zap size={16} className="text-[#E0B34C]" /> Progression loop
        </h2>
        <span className="text-[10px] font-mono text-[#E0B34C]">+{xpToday} XP TODAY</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-[#0B0D12] border border-[#242C3D] p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9AA4B2] uppercase"><Flame size={13} className="text-[#E36C70]" /> Current streak</div>
          <div className="mt-1 text-xl font-tactical font-bold text-[#F3F5F7]">{streak} <span className="text-[10px] text-[#9AA4B2]">DAYS</span></div>
        </div>
        <div className="rounded-xl bg-[#0B0D12] border border-[#242C3D] p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9AA4B2] uppercase"><Award size={13} className="text-[#6AA9FF]" /> Rank status</div>
          <div className="mt-1 text-xs font-tactical font-bold text-[#F3F5F7] truncate">{nextRank ? `${distanceToRank} XP to ${nextRank.title}` : 'Maximum rank reached'}</div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 pt-1">
        {earnedBadges.map(badge => (
          <div key={badge.label} className={`flex-1 min-w-0 rounded-lg border px-2 py-2 text-center ${badge.earned ? 'bg-[#5BC69A]/10 border-[#5BC69A]/30 text-[#5BC69A]' : 'bg-[#0B0D12] border-[#242C3D] text-[#9AA4B2]'}`}>
            {badge.earned ? <Sparkles size={13} className="mx-auto mb-1" /> : <LockKeyhole size={13} className="mx-auto mb-1" />}
            <span className="block text-[9px] font-mono truncate">{badge.label}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#9AA4B2] leading-relaxed">Complete a mission for XP. Clear every scheduled mission for a +15 clean-sweep bonus. Every 7 successful days earns a +30 checkpoint; an unbroken 7-day run earns +35 more.</p>
    </section>
  );
};
