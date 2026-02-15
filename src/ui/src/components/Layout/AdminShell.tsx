import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useKonamiCode } from '../../hooks/useKonamiCode';
import { useSystemStore } from '../../lib/systemStore';
import { Unlock } from 'lucide-react';

export function AdminShell() {
  const { unlockSandbox, isSandboxUnlocked } = useSystemStore();
  const [showUnlockMsg, setShowUnlockMsg] = useState(false);

  useKonamiCode(() => {
    if (!isSandboxUnlocked) {
      unlockSandbox();
      setShowUnlockMsg(true);
      setTimeout(() => setShowUnlockMsg(false), 3000);
    }
  });

  return (
    <div className="flex h-screen bg-zinc-950 text-white relative">
      {showUnlockMsg && (
        <div className="absolute top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-2">
           <Unlock className="w-5 h-5" />
           <div>
             <div className="text-sm font-bold">Sandbox Mode Unlocked</div>
             <div className="text-xs opacity-80">Visual Overlay enabled</div>
           </div>
        </div>
      )}
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
