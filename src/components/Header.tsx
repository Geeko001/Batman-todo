import React from 'react';
import { Challenge, RankInfo, UserProfile } from '../types';
import { getChallengeDayNumber, getTodayDateString } from '../utils/date';
import { CowlSilhouette } from './CowlSilhouette';
import { Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  challenge: Challenge | null;
  profile: UserProfile;
  currentRank: RankInfo;
  onOpenRecovery?: () => void;
  onToggleSound?: () => void;
  onOpenPersonaModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  challenge,
  profile,
  currentRank,
  onOpenRecovery,
  onToggleSound,
  onOpenPersonaModal
}) => {
  const today = getTodayDateString();
  const dayNumber = challenge ? getChallengeDayNumber(challenge.startDate, today) : 0;
  const isChallengeActive = challenge && challenge.status === 'active';

  return (
    <header className="sticky top-0 z-30 bg-[#0B0D12]/90 backdrop-blur-md border-b border-[#242C3D] px-4 py-2.5 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        {/* Left: User Cowl & Callsign */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onOpenPersonaModal?.();
            }}
            title="Inspect Batman Persona"
            className="relative p-1 rounded-lg bg-[#141821] border border-[#242C3D] hover:border-[#E0B34C]/50 transition-colors group"
          >
            <CowlSilhouette variant={profile.selectedCowl} size={28} />
            <div className="absolute -bottom-1 -right-1 bg-[#E0B34C] text-[#0B0D12] text-[9px] font-bold px-1 rounded-sm">
              T{currentRank.tier}
            </div>
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-[#9AA4B2] tracking-wider uppercase">
                AGENT:
              </span>
              <span className="text-sm font-tactical font-bold text-[#F3F5F7] tracking-wider uppercase">
                {profile.callsign}
              </span>
            </div>
            <div className="text-[11px] font-medium text-[#E0B34C] flex items-center gap-1">
              <span>{currentRank.title}</span>
              <span className="text-[#9AA4B2]">•</span>
              <span className="font-mono text-[10px] text-[#9AA4B2]">{profile.totalXP} XP</span>
            </div>
          </div>
        </div>

        {/* Right: Challenge Status & Controls */}
        <div className="flex items-center gap-2">
          {isChallengeActive && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#9AA4B2]">
                PROTOCOL
              </span>
              <div className="px-2 py-0.5 rounded bg-[#1C2230] border border-[#323E54] text-[11px] font-tactical font-bold text-[#E0B34C] tracking-wide">
                DAY {Math.max(1, dayNumber)} / {challenge.durationDays}
              </div>
            </div>
          )}

          {/* Quick Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound?.();
            }}
            title={profile.soundEnabled ? 'Mute tactical audio' : 'Enable tactical audio'}
            className="p-2 rounded-lg bg-[#141821] border border-[#242C3D] text-[#9AA4B2] hover:text-[#F3F5F7] hover:border-[#323E54] transition-colors"
          >
            {profile.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-[#E36C70]" />}
          </button>

          {/* Recovery Protocol trigger if missed */}
          {onOpenRecovery && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenRecovery();
              }}
              title="Recovery Protocol"
              className="p-2 rounded-lg bg-[#141821] border border-[#242C3D] text-[#9AA4B2] hover:text-[#E0B34C] hover:border-[#E0B34C]/40 transition-colors"
            >
              <ShieldAlert size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
