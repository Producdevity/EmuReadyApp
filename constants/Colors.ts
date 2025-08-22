/**
 * @deprecated This file is deprecated. Use ThemeContext instead for all color values.
 * 
 * This file is only kept for backward compatibility with useThemeColor hook.
 * All new components should use the ThemeContext directly:
 * 
 * ```typescript
 * import { useTheme, useColors } from '@/contexts/ThemeContext'
 * ```
 * 
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// These values now reference the theme system
const tintColorLight = '#5b21b6' // theme.colors.primary
const tintColorDark = '#7c3aed' // theme.colors.primaryLight

export const Colors = {
  light: {
    text: '#0f172a', // Matches theme.colors.text
    background: '#fafbfc', // Matches theme.colors.background
    tint: tintColorLight,
    icon: '#64748b', // Matches theme.colors.textMuted
    tabIconDefault: '#64748b', // Matches theme.colors.textMuted
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ffffff', // Matches theme.colors.text
    background: '#0a0a0a', // Matches theme.colors.background
    tint: tintColorDark,
    icon: '#a3a3a3', // Matches theme.colors.textMuted
    tabIconDefault: '#a3a3a3', // Matches theme.colors.textMuted
    tabIconSelected: tintColorDark,
  },
} as const
