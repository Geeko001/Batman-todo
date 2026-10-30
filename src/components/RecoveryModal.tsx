import React from 'react';
import { X, ShieldCheck, HeartHandshake, Compass, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';

interface RecoveryModalProps {
  onClose: () => void;
  onResume: () => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  onClose,
  onResume
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D12]/95 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl bg-[#141821] border border-[#242C3D] p-6 shadow-2xl relative text-left">
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C2230] border border-[#323E54] text-[#6AA9FF] text-xs font-mono tracking-widest uppercase mb-4">
          <ShieldCheck size={14} />
          RECOVERY PROTOCOL
        </div>

        <h3 className="text-xl font-tactical font-bold text-[#F3F5F7] mb-2">
          Protocol Interrupted? Re-engage.
        </h3>

        <p className="text-xs text-[#9AA4B2] leading-relaxed mb-4">
          Batman does not quit when Gotham tests him. Missing a day does not delete your progress, forfeit your unlocked ranks, or define your capability. It is simply a signal to adapt.
        </p>

        {/* Pillars of Recovery */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1C2230] border border-[#242C3D]">
            <HeartHandshake size={18} className="text-[#5BC69A] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[#F3F5F7] block mb-0.5">Zero XP Punishment</span>
              <span className="text-[#9AA4B2]">Every XP and rank level you have already earned is permanently secured.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1C2230] border border-[#242C3D]">
            <Compass size={18} className="text-[#E0B34C] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[#F3F5F7] block mb-0.5">Focus on the Next Action</span>
              <span className="text-[#9AA4B2]">Do not attempt to do double work today. Complete just 1 key mission to rekindle your rhythm.</span>
            </div>
          </div>
        </div>

        {/* Resume Button */}
        <button
          onClick={() => {
            sound.playCheck();
            onResume();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E0B34C] hover:bg-[#B88B2A] text-[#0B0D12] font-tactical font-bold text-sm tracking-wider uppercase transition-colors shadow-[0_0_15px_rgba(224,179,76,0.3)]"
        >
          <span>Resume Mission Control</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
