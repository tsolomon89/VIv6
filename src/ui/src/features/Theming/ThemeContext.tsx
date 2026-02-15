import { create } from 'zustand';
import type { ThemeTokens } from './TokenRegistry';
import { DEFAULT_THEME } from './TokenRegistry';

interface ThemeState {
    theme: ThemeTokens;
    setTheme: (theme: Partial<ThemeTokens>) => void;
    updateColor: (key: keyof ThemeTokens['colors'], value: string) => void;
    updateTypography: (key: keyof ThemeTokens['typography'], value: any) => void;
    reset: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: DEFAULT_THEME,
    
    setTheme: (updates: Partial<ThemeTokens>) => set((state: ThemeState) => ({ 
        theme: { ...state.theme, ...updates } 
    })),

    updateColor: (key: keyof ThemeTokens['colors'], value: string) => set((state: ThemeState) => ({
        theme: {
            ...state.theme,
            colors: {
                ...state.theme.colors,
                [key]: value
            }
        }
    })),

    updateTypography: (key: keyof ThemeTokens['typography'], value: any) => set((state: ThemeState) => ({
        theme: {
            ...state.theme,
            typography: {
                ...state.theme.typography,
                [key]: value
            }
        }
    })),

    reset: () => set({ theme: DEFAULT_THEME }),
}));
