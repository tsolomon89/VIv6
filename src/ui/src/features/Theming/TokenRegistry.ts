export interface ThemeTokens {
    colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
        accent: string;
        border: string;
    };
    typography: {
        fontFamily: string;
        headingFont: string;
        baseSize: string;
        scaleRatio: number; // e.g., 1.2
    };
    spacing: {
        base: string; // e.g., 4px or 0.25rem
        container: string;
    };
    borderRadius: {
        base: string;
    };
}

export const DEFAULT_THEME: ThemeTokens = {
    colors: {
        primary: '#6366f1', // Indigo 500
        secondary: '#10b981', // Emerald 500
        background: '#ffffff',
        text: '#18181b', // Zinc 900
        accent: '#f59e0b', // Amber 500
        border: '#e4e4e7', // Zinc 200
    },
    typography: {
        fontFamily: '"Inter", sans-serif',
        headingFont: '"Inter", sans-serif',
        baseSize: '16px',
        scaleRatio: 1.2,
    },
    spacing: {
        base: '0.25rem',
        container: '1280px',
    },
    borderRadius: {
        base: '0.5rem',
    },
};
