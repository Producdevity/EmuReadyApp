import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useColorScheme as useSystemColorScheme } from 'react-native'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface Theme {
  mode: ThemeMode
  isDark: boolean
  colors: {
    // Primary colors matching the website
    primary: string
    primaryDark: string
    primaryLight: string

    // Secondary colors
    secondary: string
    accent: string

    // Background colors with depth
    background: string
    backgroundSecondary: string
    surface: string
    surfaceElevated: string
    card: string
    cardElevated: string

    // Text colors
    text: string
    textSecondary: string
    textMuted: string
    textInverse: string

    // Border colors
    border: string
    borderLight: string
    borderFocus: string

    // Status colors
    success: string
    successLight: string
    warning: string
    warningLight: string
    error: string
    errorLight: string
    info: string
    infoLight: string

    // Special colors
    overlay: string
    shadow: string
    shadowLight: string
    glass: string

    // Performance colors (matching the website)
    performance: {
      perfect: string
      great: string
      good: string
      poor: string
      unplayable: string
    }

    // Gradients
    gradients: {
      primary: string[]
      secondary: string[]
      card: string[]
      hero: string[]
      gaming: string[]
    }
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    xxl: number
    xxxl: number
  }
  borderRadius: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    xxl: number
  }
  typography: {
    fontSize: {
      xs: number
      sm: number
      md: number
      lg: number
      xl: number
      xxl: number
      xxxl: number
    }
    fontWeight: {
      light: '300'
      normal: '400'
      medium: '500'
      semibold: '600'
      bold: '700'
      extrabold: '800'
    }
    lineHeight: {
      tight: number
      normal: number
      relaxed: number
    }
  }
  shadows: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  animations: {
    timing: {
      quick: number
      normal: number
      slow: number
    }
    easing: {
      ease: string
      spring: string
    }
  }
}

const lightTheme: Theme = {
  mode: 'light',
  isDark: false,
  colors: {
    // Modern primary colors with more vibrant gradients
    primary: '#6366f1',
    primaryDark: '#4338ca',
    primaryLight: '#8b5cf6',

    secondary: '#06b6d4',
    accent: '#f59e0b',

    // Layered backgrounds for depth
    background: '#f8fafc',
    backgroundSecondary: '#f1f5f9',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    card: '#ffffff',
    cardElevated: '#ffffff',

    // Refined text hierarchy
    text: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    textInverse: '#ffffff',

    // Enhanced borders
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderFocus: '#6366f1',

    // Status colors with lighter variants
    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    info: '#06b6d4',
    infoLight: '#cffafe',

    // Glass morphism and shadows
    overlay: 'rgba(15, 23, 42, 0.4)',
    shadow: 'rgba(15, 23, 42, 0.08)',
    shadowLight: 'rgba(15, 23, 42, 0.04)',
    glass: 'rgba(255, 255, 255, 0.8)',

    performance: {
      perfect: '#22c55e',
      great: '#3b82f6',
      good: '#f59e0b',
      poor: '#ef4444',
      unplayable: '#64748b',
    },

    // Modern gradients
    gradients: {
      primary: ['#6366f1', '#8b5cf6'],
      secondary: ['#06b6d4', '#0891b2'],
      card: ['#ffffff', '#f8fafc'],
      hero: ['#6366f1', '#8b5cf6', '#06b6d4'],
      gaming: ['#8b5cf6', '#6366f1', '#06b6d4'],
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
  },
  typography: {
    fontSize: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 19,
      xxl: 24,
      xxxl: 32,
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    sm: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    md: '0 10px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
    lg: '0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
    xl: '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 25px rgba(0, 0, 0, 0.1)',
  },
  animations: {
    timing: {
      quick: 150,
      normal: 250,
      slow: 350,
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
}

const darkTheme: Theme = {
  ...lightTheme,
  mode: 'dark',
  isDark: true,
  colors: {
    ...lightTheme.colors,

    // Enhanced dark backgrounds with depth
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    surface: '#1e293b',
    surfaceElevated: '#334155',
    card: '#1e293b',
    cardElevated: '#334155',

    // Refined dark text
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textInverse: '#0f172a',

    // Enhanced dark borders
    border: '#334155',
    borderLight: '#475569',
    borderFocus: '#8b5cf6',

    // Dark status variants
    successLight: '#064e3b',
    warningLight: '#451a03',
    errorLight: '#450a0a',
    infoLight: '#0c4a6e',

    // Dark glass and shadows
    overlay: 'rgba(15, 23, 42, 0.9)',
    shadow: 'rgba(0, 0, 0, 0.5)',
    shadowLight: 'rgba(0, 0, 0, 0.25)',
    glass: 'rgba(30, 41, 59, 0.8)',

    // Dark gradients
    gradients: {
      primary: ['#6366f1', '#8b5cf6'],
      secondary: ['#06b6d4', '#0891b2'],
      card: ['#1e293b', '#334155'],
      hero: ['#1e293b', '#6366f1', '#8b5cf6'],
      gaming: ['#0f172a', '#6366f1', '#8b5cf6'],
    },
  },
}

interface ThemeContextType {
  theme: Theme
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = '@emuready_theme_mode'

export function ThemeProvider(props: PropsWithChildren) {
  const systemColorScheme = useSystemColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system')

  // Load saved theme mode from storage
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY)
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode)
        }
      } catch (error) {
        console.log('Error loading theme mode:', error)
      }
    }
    loadThemeMode()
  }, [])

  // Save theme mode to storage
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode)
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode)
    } catch (error) {
      console.log('Error saving theme mode:', error)
    }
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark'
    setThemeMode(newMode)
  }

  // Determine the actual theme to use
  const getActiveTheme = (): Theme => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme
    }
    return themeMode === 'dark' ? darkTheme : lightTheme
  }

  const theme = getActiveTheme()

  const value: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Utility hook for colors
export function useColors() {
  const { theme } = useTheme()
  return theme.colors
}

// Utility hook for spacing
export function useSpacing() {
  const { theme } = useTheme()
  return theme.spacing
}
