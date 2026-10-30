import React, { useState, useRef } from 'react';
import { RankInfo, UserProfile } from '../types';
import { CowlSilhouette } from '../components/CowlSilhouette';
import { RANKS, UNLOCKABLES } from '../utils/progression';
import { sound } from '../utils/audio';
import { User, Shield, Check, Download, Upload, AlertTriangle, Sliders, Volume2, Sparkles } from 'lucide-react';
import { AppStorage } from '../storage/db';
import { DeviceStatusCard } from '../components/DeviceStatusCard';

interface ProfileViewProps {
  profile: UserProfile;
  currentRank: RankInfo;
  nextRank: RankInfo | null;
  progressPercent: number;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onDataImported: () => void;
  onResetData: () => void;
  onOpenPersonaModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  currentRank,
  nextRank,
  progressPercent,
  onUpdateProfile,
  onDataImported,
  onResetData,
  onOpenPersonaModal
}) => {
  const [callsignInput, setCallsignInput] = useState(profile.callsign);
  const [isEditingCallsign, setIsEditingCallsign] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveCallsign = () => {
    if (!callsignInput.trim()) return;
    sound.playClick();
    onUpdateProfile({ callsign: callsignInput.trim() });
    setIsEditingCallsign(false);
  };

  const handleEquipCowl = (cowlId: string, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    sound.playCheck();
    onUpdateProfile({ selectedCowl: cowlId });
  };

  const handleExportBackup = () => {
    sound.playClick();
    const json = AppStorage.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batman-protocol-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const res = AppStorage.importBackup(content);
      if (res.success) {
        sound.playRankUp();
        setImportStatus('Backup restored successfully.');
        onDataImported();
      } else {
        setImportStatus(`Restore failed: ${res.error}`);
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const cowls = UNLOCKABLES.filter(u => u.type === 'cowl');

  return (
    <div className="p-4 space-y-5 pb-28 max-w-md mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <User size={18} className="text-[#E0B34C]" />
          <h1 className="text-xl font-tactical font-bold text-[#F3F5F7] tracking-wide">
            THE BATCAVE VAULT
          </h1>
        </div>
        <p className="text-xs text-[#9AA4B2] mt-0.5">
          Tactical progression, unlocked persona assets, and data safeguards.
        </p>
      </div>

      {/* Profile Card & Equipped Cowl */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1C2230] via-[#141821] to-[#141821] border border-[#242C3D] p-5 shadow-panel-subtle text-center relative">
        <button
          onClick={() => {
            sound.playClick();
            onOpenPersonaModal();
          }}
          className="mx-auto w-24 h-24 rounded-full bg-[#0B0D12] border-2 border-[#E0B34C] flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(224,179,76,0.3)] hover:scale-105 transition-transform"
        >
          <CowlSilhouette variant={profile.selectedCowl} size={64} glow />
        </button>

        <div className="flex items-center justify-center gap-2">
          {isEditingCallsign ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={callsignInput}
                onChange={e => setCallsignInput(e.target.value)}
                className="bg-[#0B0D12] border border-[#E0B34C] rounded-lg px-2.5 py-1 text-sm font-tactical font-bold text-[#F3F5F7] text-center w-36"
                autoFocus
              />
              <button
                onClick={handleSaveCallsign}
                className="px-2.5 py-1 rounded-lg bg-[#E0B34C] text-[#0B0D12] text-xs font-bold"
              >
                Save
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingCallsign(true)}
              className="text-lg font-tactical font-bold text-[#F3F5F7] cursor-pointer hover:text-[#E0B34C] flex items-center gap-1.5"
            >
              <span>{profile.callsign}</span>
              <span className="text-[10px] text-[#9AA4B2] font-mono">(Edit)</span>
            </div>
          )}
        </div>

        <div className="text-xs font-mono text-[#E0B34C] uppercase tracking-widest mt-0.5">
          {currentRank.title} • TIER {currentRank.tier}
        </div>

        {/* Rank XP Progress */}
        <div className="mt-4 pt-3 border-t border-[#242C3D]">
          <div className="flex justify-between text-[11px] font-mono text-[#9AA4B2] mb-1">
            <span>{profile.totalXP} XP EARNED</span>
            <span>{nextRank ? `Next: ${nextRank.title} (${nextRank.minXP} XP)` : 'MAX RANK ACHIEVED'}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#0B0D12] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#B88B2A] to-[#E0B34C] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Unlockable Cowl Silhouettes */}
      <div className="p-4 rounded-2xl bg-[#141821] border border-[#242C3D] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase text-[#9AA4B2] tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#E0B34C]" />
            COWL SILHOUETTE ARSENAL
          </h3>
          <span className="text-[10px] font-mono text-[#E0B34C]">
            {profile.unlockedItemIds.length} / {UNLOCKABLES.length} UNLOCKED
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {cowls.map(cowl => {
            const isUnlocked = currentRank.tier >= cowl.requiredRankTier || profile.unlockedItemIds.includes(cowl.id);
            const isEquipped = profile.selectedCowl === cowl.id;

            return (
              <button
                key={cowl.id}
                onClick={() => handleEquipCowl(cowl.id, isUnlocked)}
                disabled={!isUnlocked}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isEquipped
                    ? 'bg-[#1C2230] border-[#E0B34C] shadow-[0_0_12px_rgba(224,179,76,0.3)]'
                    : isUnlocked
                    ? 'bg-[#141821] border-[#242C3D] hover:border-[#323E54]'
                    : 'bg-[#0B0D12] border-[#242C3D]/40 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="relative mb-2">
                  <CowlSilhouette variant={cowl.id} size={42} glow={isEquipped} />
                  {isEquipped && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E0B34C] text-[#0B0D12] flex items-center justify-center">
                      <Check size={10} className="stroke-[3]" />
                    </div>
                  )}
                </div>

                <span className="text-[10px] font-tactical font-bold text-[#F3F5F7] truncate max-w-full">
                  {cowl.name}
                </span>

                <span className="text-[9px] font-mono mt-0.5 text-[#9AA4B2]">
                  {isUnlocked ? (isEquipped ? 'EQUIPPED' : 'EQUIP') : `TIER ${cowl.requiredRankTier}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ranks Progression Hierarchy */}
      <div className="p-4 rounded-2xl bg-[#141821] border border-[#242C3D] space-y-2.5">
        <h3 className="text-xs font-mono uppercase text-[#9AA4B2] tracking-wider flex items-center gap-1.5">
          <Shield size={14} className="text-[#6AA9FF]" />
          RANKS HIERARCHY
        </h3>

        <div className="space-y-2">
          {RANKS.map(r => {
            const isReached = currentRank.tier >= r.tier;
            return (
              <div
                key={r.tier}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  r.tier === currentRank.tier
                    ? 'bg-[#1C2230] border-[#E0B34C] text-[#F3F5F7]'
                    : isReached
                    ? 'bg-[#141821] border-[#242C3D] text-[#9AA4B2]'
                    : 'bg-[#0B0D12] border-[#242C3D]/40 text-[#9AA4B2]/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold ${
                    isReached ? 'bg-[#E0B34C] text-[#0B0D12]' : 'bg-[#242C3D] text-[#9AA4B2]'
                  }`}>
                    {r.tier}
                  </span>
                  <div>
                    <span className="font-tactical font-bold">{r.title}</span>
                    <span className="text-[10px] block font-sans opacity-70 italic">{r.motto}</span>
                  </div>
                </div>

                <span className="font-mono text-[10px] shrink-0">
                  {r.minXP} XP
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Settings */}
      <div className="p-4 rounded-2xl bg-[#141821] border border-[#242C3D] space-y-4">
        <h3 className="text-xs font-mono uppercase text-[#9AA4B2] tracking-wider flex items-center gap-1.5">
          <Sliders size={14} className="text-[#E0B34C]" />
          TELEMETRY CONTROLS
        </h3>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-[#F3F5F7] flex items-center gap-1.5">
              <Volume2 size={14} className="text-[#9AA4B2]" />
              Tactical Synthesizer Audio
            </div>
            <div className="text-[10px] text-[#9AA4B2]">
              Crisp Web Audio feedback for clicks, checks, and timers
            </div>
          </div>
          <button
            onClick={() => {
              const next = !profile.soundEnabled;
              sound.enabled = next;
              sound.playClick();
              onUpdateProfile({ soundEnabled: next });
            }}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              profile.soundEnabled ? 'bg-[#E0B34C]' : 'bg-[#242C3D]'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-[#0B0D12] absolute top-1 transition-transform ${
              profile.soundEnabled ? 'right-1' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Streak Threshold Slider */}
        <div className="pt-2 border-t border-[#242C3D]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#F3F5F7]">Daily Streak Qualification Target</span>
            <span className="font-mono font-bold text-[#E0B34C]">
              {Math.round(profile.streakThreshold * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={Math.round(profile.streakThreshold * 100)}
            onChange={e => {
              onUpdateProfile({ streakThreshold: parseInt(e.target.value, 10) / 100 });
            }}
            className="w-full accent-[#E0B34C]"
          />
          <span className="text-[10px] text-[#9AA4B2] block mt-0.5">
            Default 70%. Day counts toward unbroken streak if this percentage of scheduled items is met.
          </span>
        </div>
      </div>

      {/* Backup, Restore & Reset */}
      <DeviceStatusCard />

      <div className="p-4 rounded-2xl bg-[#141821] border border-[#242C3D] space-y-3">
        <h3 className="text-xs font-mono uppercase text-[#9AA4B2] tracking-wider">
          DATA SAFEGUARDS
        </h3>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-[#1C2230] border border-[#E0B34C] text-xs text-[#E0B34C] text-center font-mono">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1C2230] border border-[#242C3D] hover:border-[#323E54] text-[#F3F5F7] text-xs font-tactical font-bold uppercase transition-colors"
          >
            <Download size={14} className="text-[#6AA9FF]" />
            Export Backup
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1C2230] border border-[#242C3D] hover:border-[#323E54] text-[#F3F5F7] text-xs font-tactical font-bold uppercase transition-colors"
          >
            <Upload size={14} className="text-[#5BC69A]" />
            Import Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>

        {/* Reset / Factory Wipe */}
        <div className="pt-2 border-t border-[#242C3D]">
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="w-full py-2 px-3 rounded-xl border border-[#E36C70]/40 text-[#E36C70] hover:bg-[#E36C70]/10 text-xs font-mono transition-colors"
          >
            Reset Protocol Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D12]/95 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-[#141821] border border-[#E36C70] p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#E36C70]/20 text-[#E36C70] flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-tactical font-bold text-[#F3F5F7] mb-1">
              Confirm Protocol Wipe
            </h3>
            <p className="text-xs text-[#9AA4B2] leading-relaxed mb-4">
              This will permanently delete your active challenge, habit logs, streak records, and XP ledger. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#1C2230] text-[#9AA4B2] text-xs font-tactical"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onResetData();
                  setResetConfirmOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#E36C70] text-[#0B0D12] text-xs font-tactical font-bold uppercase"
              >
                Wipe All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
