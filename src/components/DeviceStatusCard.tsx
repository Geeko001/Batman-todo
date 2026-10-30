import React, { useEffect, useState } from 'react';
import { CheckCircle2, HardDrive, MonitorSmartphone, ShieldCheck, Smartphone } from 'lucide-react';
import { AppStorage } from '../storage/db';

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.matchMedia?.('(display-mode: fullscreen)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const DeviceStatusCard: React.FC = () => {
  const [installed, setInstalled] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [storageProtected, setStorageProtected] = useState<boolean | null>(null);

  useEffect(() => {
    const displayMode = window.matchMedia?.('(display-mode: standalone)');
    const updateMode = () => setInstalled(isStandalone());
    updateMode();
    setStorageAvailable(AppStorage.isAvailable());

    if (navigator.storage?.persisted) {
      navigator.storage.persisted().then(setStorageProtected).catch(() => setStorageProtected(null));
    }

    displayMode?.addEventListener('change', updateMode);
    window.addEventListener('appinstalled', updateMode);
    return () => {
      displayMode?.removeEventListener('change', updateMode);
      window.removeEventListener('appinstalled', updateMode);
    };
  }, []);

  const requestStorageProtection = async () => {
    if (!navigator.storage?.persist) return;
    const granted = await navigator.storage.persist();
    setStorageProtected(granted);
  };

  return (
    <section className="p-4 rounded-2xl bg-[#141821] border border-[#242C3D] space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-mono uppercase text-[#9AA4B2] tracking-wider flex items-center gap-1.5">
            <HardDrive size={14} className="text-[#6AA9FF]" />
            DEVICE & APP STATUS
          </h3>
          <p className="text-[10px] text-[#9AA4B2] mt-1 leading-relaxed">
            Your protocol stays on this device. No account or server is used.
          </p>
        </div>
        <div className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-mono font-bold ${installed ? 'bg-[#5BC69A]/15 text-[#5BC69A]' : 'bg-[#6AA9FF]/10 text-[#6AA9FF]'}`}>
          {installed ? 'INSTALLED' : 'BROWSER'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-xl bg-[#0B0D12] border border-[#242C3D] p-2.5">
          <div className="flex items-center gap-1.5 text-[#F3F5F7] font-medium">
            {installed ? <Smartphone size={14} className="text-[#5BC69A]" /> : <MonitorSmartphone size={14} className="text-[#6AA9FF]" />}
            {installed ? 'PWA app' : 'Browser tab'}
          </div>
          <p className="mt-1 text-[10px] text-[#9AA4B2]">
            {installed ? 'Standalone mode detected.' : 'Install from your browser menu for app mode.'}
          </p>
        </div>
        <div className="rounded-xl bg-[#0B0D12] border border-[#242C3D] p-2.5">
          <div className="flex items-center gap-1.5 text-[#F3F5F7] font-medium">
            <CheckCircle2 size={14} className={storageAvailable ? 'text-[#5BC69A]' : 'text-[#E36C70]'} />
            {storageAvailable ? 'Local save active' : 'Storage unavailable'}
          </div>
          <p className="mt-1 text-[10px] text-[#9AA4B2]">
            {storageAvailable ? 'Changes save immediately in this browser.' : 'Check browser privacy settings.'}
          </p>
        </div>
      </div>

      {storageAvailable && storageProtected === false && (
        <button
          onClick={requestStorageProtection}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#6AA9FF]/40 text-[#6AA9FF] hover:bg-[#6AA9FF]/10 text-[10px] font-mono transition-colors"
        >
          <ShieldCheck size={13} />
          REQUEST DEVICE STORAGE PROTECTION
        </button>
      )}
      {storageProtected === true && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5BC69A]">
          <ShieldCheck size={13} /> Device storage protection is enabled.
        </div>
      )}
    </section>
  );
};
