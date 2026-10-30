import React, { useState } from 'react';
import { Challenge, ChallengeDuration, Habit, ScheduleFrequency } from '../types';
import { addDays, getTodayDateString } from '../utils/date';
import { BatLogo } from '../components/BatLogo';
import { sound } from '../utils/audio';
import { Check, Shield, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (challenge: Challenge, habits: Habit[]) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [duration, setDuration] = useState<ChallengeDuration>(30);
  const [title, setTitle] = useState('Project Dark Knight');
  const [description, setDescription] = useState('Forging iron physical conditioning, focused intellect, and disciplined routine.');
  const [startDate, setStartDate] = useState(getTodayDateString());

  // Starter habits
  const [habitsList, setHabitsList] = useState<Array<{
    id: string;
    name: string;
    description: string;
    targetValue?: number;
    targetUnit?: string;
    schedule: ScheduleFrequency;
    selected: boolean;
  }>>([
    {
      id: 'h-1',
      name: 'Physical Conditioning',
      description: 'Tactical strength, mobility, or cardio training',
      targetValue: 45,
      targetUnit: 'mins',
      schedule: 'daily',
      selected: true
    },
    {
      id: 'h-2',
      name: 'Deep Strategic Focus',
      description: 'Uninterrupted deep work on primary project or craft',
      targetValue: 90,
      targetUnit: 'mins',
      schedule: 'daily',
      selected: true
    },
    {
      id: 'h-3',
      name: 'Combat Intel / Reading',
      description: 'Technical manuals, tactical texts, or non-fiction books',
      targetValue: 20,
      targetUnit: 'pages',
      schedule: 'daily',
      selected: true
    },
    {
      id: 'h-4',
      name: 'Digital Curfew / Sleep',
      description: 'No screens 45 mins before sleep; lights out on time',
      targetValue: 8,
      targetUnit: 'hrs',
      schedule: 'daily',
      selected: true
    }
  ]);

  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitTarget, setNewHabitTarget] = useState('');
  const [newHabitUnit, setNewHabitUnit] = useState('');

  const handleAddCustomHabit = () => {
    if (!newHabitName.trim()) return;
    sound.playClick();
    const id = `custom-${Date.now()}`;
    setHabitsList(prev => [
      ...prev,
      {
        id,
        name: newHabitName.trim(),
        description: 'Custom discipline protocol',
        targetValue: newHabitTarget ? parseFloat(newHabitTarget) : undefined,
        targetUnit: newHabitUnit.trim() || undefined,
        schedule: 'daily',
        selected: true
      }
    ]);
    setNewHabitName('');
    setNewHabitTarget('');
    setNewHabitUnit('');
  };

  const handleToggleHabit = (id: string) => {
    sound.playClick();
    setHabitsList(prev =>
      prev.map(h => (h.id === id ? { ...h, selected: !h.selected } : h))
    );
  };

  const handleRemoveHabit = (id: string) => {
    sound.playClick();
    setHabitsList(prev => prev.filter(h => h.id !== id));
  };

  const handleFinish = () => {
    sound.playRankUp();
    const challenge: Challenge = {
      id: `challenge-${Date.now()}`,
      title: title.trim() || 'Batman Protocol',
      description: description.trim(),
      durationDays: duration,
      startDate,
      endDate: addDays(startDate, duration - 1),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const finalHabits: Habit[] = habitsList
      .filter(h => h.selected)
      .map((h, idx) => ({
        id: h.id,
        challengeId: challenge.id,
        name: h.name,
        description: h.description,
        targetValue: h.targetValue,
        targetUnit: h.targetUnit,
        schedule: h.schedule,
        activeFrom: startDate,
        sortOrder: idx
      }));

    onComplete(challenge, finalHabits);
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F3F5F7] p-5 max-w-md mx-auto flex flex-col justify-between">
      {/* Top Brand Header */}
      <div>
        <div className="flex items-center justify-between mb-6 pt-2">
          <div className="flex items-center gap-2">
            <BatLogo size={32} />
            <span className="font-tactical font-bold text-lg tracking-wider text-[#F3F5F7]">
              BATMAN PROTOCOL
            </span>
          </div>
          <div className="text-xs font-mono text-[#E0B34C] px-2 py-0.5 rounded bg-[#141821] border border-[#242C3D]">
            STEP {step} / 4
          </div>
        </div>

        {/* STEP 1: Duration & Start Date */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-tactical font-bold text-[#F3F5F7]">
                Initialize Protocol Duration
              </h2>
              <p className="text-xs text-[#9AA4B2] mt-1 leading-relaxed">
                True habit formation demands focused, unbroken commitment. Choose your operational timeframe.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setDuration(30);
                }}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  duration === 30
                    ? 'bg-[#1C2230] border-[#E0B34C] shadow-[0_0_15px_rgba(224,179,76,0.2)]'
                    : 'bg-[#141821] border-[#242C3D] hover:border-[#323E54]'
                }`}
              >
                <div className="text-3xl font-mono font-bold text-[#E0B34C] mb-1">
                  30
                </div>
                <div className="text-sm font-tactical font-bold text-[#F3F5F7]">
                  DAY PROTOCOL
                </div>
                <div className="text-[11px] text-[#9AA4B2] mt-1">
                  High-intensity habit reboot. Rapid consistency.
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setDuration(60);
                }}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  duration === 60
                    ? 'bg-[#1C2230] border-[#E0B34C] shadow-[0_0_15px_rgba(224,179,76,0.2)]'
                    : 'bg-[#141821] border-[#242C3D] hover:border-[#323E54]'
                }`}
              >
                <div className="text-3xl font-mono font-bold text-[#6AA9FF] mb-1">
                  60
                </div>
                <div className="text-sm font-tactical font-bold text-[#F3F5F7]">
                  DAY PROTOCOL
                </div>
                <div className="text-[11px] text-[#9AA4B2] mt-1">
                  Complete identity shift. Permanent mastery.
                </div>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#141821] border border-[#242C3D]">
              <label className="block text-xs font-mono text-[#9AA4B2] uppercase mb-1">
                START DATE
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-[#0B0D12] border border-[#242C3D] rounded-lg px-3 py-2 text-sm text-[#F3F5F7] font-mono focus:border-[#E0B34C] focus:outline-none"
              />
              <span className="text-[10px] text-[#9AA4B2] block mt-1">
                Protocol will conclude on {addDays(startDate, duration - 1)}.
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: Name the challenge */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-tactical font-bold text-[#F3F5F7]">
                Name Your Mission
              </h2>
              <p className="text-xs text-[#9AA4B2] mt-1">
                Every operation has an objective. Define the purpose of this challenge.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-mono text-[#9AA4B2] uppercase mb-1">
                  PROTOCOL CALLSIGN
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Project Dark Knight, Fitness Reset..."
                  className="w-full bg-[#141821] border border-[#242C3D] rounded-xl px-4 py-3 text-sm text-[#F3F5F7] font-tactical font-bold focus:border-[#E0B34C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#9AA4B2] uppercase mb-1">
                  MISSION BRIEFING / MOTIVATION
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Why are you undertaking this challenge? What must be achieved?"
                  rows={3}
                  className="w-full bg-[#141821] border border-[#242C3D] rounded-xl px-4 py-3 text-sm text-[#F3F5F7] resize-none focus:border-[#E0B34C] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Select or create habits */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-tactical font-bold text-[#F3F5F7]">
                Select Daily Disciplines
              </h2>
              <p className="text-xs text-[#9AA4B2] mt-1">
                Select your daily recurring habits. Quality over volume: 3 to 5 core disciplines is ideal.
              </p>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[36vh] overflow-y-auto pr-1">
              {habitsList.map(h => (
                <div
                  key={h.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    h.selected
                      ? 'bg-[#1C2230] border-[#E0B34C]/60'
                      : 'bg-[#141821] border-[#242C3D] opacity-60'
                  }`}
                >
                  <div
                    onClick={() => handleToggleHabit(h.id)}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      h.selected
                        ? 'bg-[#E0B34C] border-[#E0B34C] text-[#0B0D12]'
                        : 'border-[#9AA4B2] text-transparent'
                    }`}>
                      <Check size={14} className="stroke-[3]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#F3F5F7]">
                        {h.name}
                      </div>
                      {h.targetValue && h.targetUnit && (
                        <div className="text-[11px] text-[#9AA4B2]">
                          Target: {h.targetValue} {h.targetUnit} / day
                        </div>
                      )}
                    </div>
                  </div>

                  {h.id.startsWith('custom-') && (
                    <button
                      onClick={() => handleRemoveHabit(h.id)}
                      className="p-1 text-[#E36C70] hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Quick add custom habit */}
            <div className="p-3 rounded-xl bg-[#141821] border border-[#242C3D] space-y-2">
              <span className="text-[11px] font-mono uppercase text-[#9AA4B2] block">
                ADD CUSTOM DISCIPLINE
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Discipline name (e.g. Cold Shower)"
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  className="flex-1 bg-[#0B0D12] border border-[#242C3D] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F5F7] focus:border-[#E0B34C] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Target"
                  value={newHabitTarget}
                  onChange={e => setNewHabitTarget(e.target.value)}
                  className="w-16 bg-[#0B0D12] border border-[#242C3D] rounded-lg px-2 py-1.5 text-xs text-[#F3F5F7] focus:border-[#E0B34C] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={newHabitUnit}
                  onChange={e => setNewHabitUnit(e.target.value)}
                  className="w-16 bg-[#0B0D12] border border-[#242C3D] rounded-lg px-2 py-1.5 text-xs text-[#F3F5F7] focus:border-[#E0B34C] focus:outline-none"
                />
                <button
                  onClick={handleAddCustomHabit}
                  className="p-2 rounded-lg bg-[#E0B34C] text-[#0B0D12] hover:bg-[#B88B2A]"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review protocol */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-tactical font-bold text-[#F3F5F7]">
                Review Protocol Briefing
              </h2>
              <p className="text-xs text-[#9AA4B2] mt-1">
                Verify parameters before locking in the operational matrix.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#141821] border border-[#242C3D] space-y-3">
              <div>
                <span className="text-[10px] font-mono text-[#9AA4B2] uppercase">CHALLENGE</span>
                <div className="text-base font-tactical font-bold text-[#E0B34C]">{title}</div>
                {description && <div className="text-xs text-[#9AA4B2] mt-0.5">{description}</div>}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#242C3D]">
                <div>
                  <span className="text-[10px] font-mono text-[#9AA4B2] uppercase">DURATION</span>
                  <div className="text-sm font-mono font-bold text-[#F3F5F7]">{duration} DAYS</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#9AA4B2] uppercase">WINDOW</span>
                  <div className="text-xs font-mono text-[#F3F5F7]">{startDate} → {addDays(startDate, duration - 1)}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#242C3D]">
                <span className="text-[10px] font-mono text-[#9AA4B2] uppercase block mb-1">
                  ACTIVE DISCIPLINES ({habitsList.filter(h => h.selected).length})
                </span>
                <div className="space-y-1">
                  {habitsList.filter(h => h.selected).map(h => (
                    <div key={h.id} className="text-xs text-[#F3F5F7] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E0B34C]" />
                      <span>{h.name}</span>
                      {h.targetValue && h.targetUnit && (
                        <span className="text-[#9AA4B2]">({h.targetValue} {h.targetUnit})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="pt-6 border-t border-[#242C3D] flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={() => {
              sound.playClick();
              setStep((step - 1) as 1 | 2 | 3);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#141821] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#242C3D] text-xs font-tactical font-bold"
          >
            <ArrowLeft size={16} /> Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            onClick={() => {
              sound.playClick();
              setStep((step + 1) as 2 | 3 | 4);
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#E0B34C] text-[#0B0D12] hover:bg-[#B88B2A] text-xs font-tactical font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(224,179,76,0.3)]"
          >
            Next Step <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5BC69A] hover:bg-[#48b286] text-[#0B0D12] text-sm font-tactical font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(91,198,154,0.4)]"
          >
            <Shield size={18} /> Initiate Protocol
          </button>
        )}
      </div>
    </div>
  );
};
