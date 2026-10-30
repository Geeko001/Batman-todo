import React from 'react';
import { X, Sparkles, Shield, Award } from 'lucide-react';
import { RankInfo, UserProfile } from '../types';
import { CowlSilhouette } from './CowlSilhouette';
import { sound } from '../utils/audio';

interface PersonaRevealModalProps {
  profile: UserProfile;
  currentRank: RankInfo;
  onClose: () => void;
}

export const PersonaRevealModal: React.FC<PersonaRevealModalProps> = ({
  profile,
  currentRank,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D12]/95 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl bg-[#141821] border border-[#242C3D] p-6 shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-[#9AA4B2] hover:text-[#F3F5F7] rounded-lg hover:bg-[#1C2230] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Tactical Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C2230] border border-[#323E54] text-[#E0B34C] text-xs font-mono tracking-widest uppercase mb-4">
          <Sparkles size={14} />
          PERSONA PROTOCOL
        </div>

        {/* Animated Cowl Avatar */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-b from-[#1C2230] to-[#0E121A] border-2 border-[#E0B34C]/60 flex items-center justify-center shadow-[0_0_30px_rgba(224,179,76,0.3)]">
            <CowlSilhouette variant={profile.selectedCowl} size={84} glow />
          </div>
        </div>

        {/* Rank & Identity */}
        <h3 className="text-2xl font-tactical font-bold text-[#F3F5F7] uppercase tracking-wide">
          {currentRank.title}
        </h3>
        <p className="text-xs font-mono text-[#E0B34C] uppercase tracking-widest mt-0.5 mb-3">
          TIER {currentRank.tier} • {profile.totalXP} TOTAL XP
        </p>

        {/* Lore / Human discipline statement */}
        <div className="p-3.5 rounded-xl bg-[#0B0D12] border border-[#242C3D] mb-5 text-xs text-[#9AA4B2] leading-relaxed italic">
          "{currentRank.motto}"
        </div>

        <p className="text-xs text-[#F3F5F7] font-medium leading-relaxed mb-6">
          You are not waiting to become disciplined. You are actively building it—mission by mission, in the dark, before the world wakes.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-6 text-left">
          <div className="p-2.5 rounded-xl bg-[#1C2230] border border-[#242C3D]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9AA4B2] uppercase">
              <Shield size={12} className="text-[#6AA9FF]" />
              ACTIVE COWL
            </div>
            <div className="text-xs font-tactical font-bold text-[#F3F5F7] mt-1 capitalize">
              {profile.selectedCowl.replace('cowl-', '').replace('-', ' ')}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#1C2230] border border-[#242C3D]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9AA4B2] uppercase">
              <Award size={12} className="text-[#5BC69A]" />
              UNLOCKED TIERS
            </div>
            <div className="text-xs font-mono font-bold text-[#5BC69A] mt-1">
              {profile.unlockedItemIds.length} ITEMS
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1C2230] hover:bg-[#242C3D] border border-[#323E54] text-[#F3F5F7] font-tactical font-bold text-xs tracking-wider uppercase transition-colors"
        >
          Return to Mission Control
        </button>
      </div>
    </div>
  );
};
