import { useThemeStore } from './ThemeContext';
import type { ThemeTokens } from './TokenRegistry';

function generateCssVariables(theme: ThemeTokens): string {
    const { colors, typography, spacing, borderRadius } = theme;

    return `
        :root {
            /* Colors */
            --color-primary: ${colors.primary};
            --color-secondary: ${colors.secondary};
            --color-background: ${colors.background};
            --color-text: ${colors.text};
            --color-accent: ${colors.accent};
            --color-border: ${colors.border};

            /* Typography */
            --font-family: ${typography.fontFamily};
            --font-heading: ${typography.headingFont};
            --font-base-size: ${typography.baseSize};
            --font-scale: ${typography.scaleRatio};

            /* Spacing */
            --spacing-base: ${spacing.base};
            --container-width: ${spacing.container};

            /* Border Radius */
            --radius-base: ${borderRadius.base};
        }
    `;
}

export function StyleInjector() {
    const { theme } = useThemeStore();
    const css = generateCssVariables(theme);

    return (
        <style dangerouslySetInnerHTML={{ __html: css }} />
    );
}
