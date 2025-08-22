/**
 * @deprecated This hook is deprecated. Use ThemeContext hooks instead:
 * - useTheme() for full theme object
 * - useColors() for color values
 * - useSpacing() for spacing values
 * 
 * This hook is only kept for backward compatibility.
 * 
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'

// Default theme fallback
const DEFAULT_THEME = 'light' as const

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme() ?? DEFAULT_THEME
  const colorFromProps = props[theme]

  return colorFromProps ? colorFromProps : Colors[theme][colorName]
}
