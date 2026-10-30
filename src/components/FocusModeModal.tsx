import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface FocusModeModalProps {
  missionTitle: string;
  missionSubtitle?: string;
  onComplete: () => void;
  onClose: () => void;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  missionTitle,
  missionSubtitle,
  onComplete,
  onClose
}) => {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: number | null = null;
    if (isRunning && remaining > 0) {
      interval = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            sound.playTimerBell();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remaining]);

  const selectDuration = (mins: number) => {
    sound.playClick();
    const secs = mins * 60;
    setTotalSeconds(secs);
    setRemaining(secs);
    setIsRunning(false);
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeFormatted = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const progressRatio = (totalSeconds - remaining) / totalSeconds;

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
          <span className="w-2 h-2 rounded-full bg-[#E0B34C] animate-pulse" />
          FOCUS SPRINT
        </div>

        {/* Mission Title */}
        <h2 className="text-xl font-tactical font-bold text-[#F3F5F7] mb-1">
          {missionTitle}
        </h2>
        {missionSubtitle && (
          <p className="text-xs text-[#9AA4B2] mb-6">
            {missionSubtitle}
          </p>
        )}

        {/* Circular / Ring Progress Countdown */}
        <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="96"
              cy="96"
              r="84"
              stroke="#1C2230"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="96"
              cy="96"
              r="84"
              stroke="#E0B34C"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 84}
              strokeDashoffset={(2 * Math.PI * 84) * (1 - progressRatio)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-bold text-[#F3F5F7] tracking-wider">
              {timeFormatted}
            </span>
            <span className="text-[10px] font-mono text-[#9AA4B2] uppercase tracking-widest mt-1">
              {isRunning ? 'TACTICAL SPRINT' : remaining === 0 ? 'SPRINT COMPLETE' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Duration presets */}
        <div className="flex justify-center gap-2 mb-6">
          {[15, 25, 45].map(mins => (
            <button
              key={mins}
              onClick={() => selectDuration(mins)}
              className={`px-3 py-1 rounded-lg text-xs font-mono border transition-colors ${
                totalSeconds === mins * 60
                  ? 'bg-[#E0B34C] text-[#0B0D12] border-[#E0B34C] font-bold'
                  : 'bg-[#1C2230] text-[#9AA4B2] border-[#242C3D] hover:text-[#F3F5F7]'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => {
              sound.playClick();
              setIsRunning(!isRunning);
            }}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-[#E0B34C] text-[#0B0D12] hover:bg-[#B88B2A] transition-all shadow-[0_0_15px_rgba(224,179,76,0.4)]"
          >
            {isRunning ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setRemaining(totalSeconds);
              setIsRunning(false);
            }}
            title="Reset timer"
            className="p-3.5 rounded-full bg-[#1C2230] border border-[#242C3D] text-[#9AA4B2] hover:text-[#F3F5F7] hover:border-[#323E54] transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Mission Complete Button */}
        <button
          onClick={() => {
            sound.playCheck();
            onComplete();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#5BC69A] hover:bg-[#48b286] text-[#0B0D12] font-tactical font-bold text-sm tracking-wider uppercase transition-colors shadow-[0_0_12px_rgba(91,198,154,0.3)]"
        >
          <CheckCircle2 size={18} />
          Complete Mission (+XP)
        </button>
      </div>
    </div>
  );
};
