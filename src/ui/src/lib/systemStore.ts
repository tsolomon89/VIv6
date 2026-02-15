
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SystemState {
  isSandboxUnlocked: boolean;
  unlockSandbox: () => void;
  lockSandbox: () => void;
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set) => ({
      isSandboxUnlocked: false, // Default locked
      unlockSandbox: () => set({ isSandboxUnlocked: true }),
      lockSandbox: () => set({ isSandboxUnlocked: false }),
    }),
    {
      name: 'system-storage', // unique name
    }
  )
);
