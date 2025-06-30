import React, { createContext, useContext, useState, useEffect, type PropsWithChildren } from 'react'
import AsyncStorage                                                                 from '@react-native-async-storage/async-storage'
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

    // Background colors
    background: string
    surface: string
    card: string

    // Text colors
    text: string
    textSecondary: string
    textMuted: string

    // Border colors
    border: string
    borderLight: string

    // Status colors
    success: string
    warning: string
    error: string
    info: string

    // Special colors
    overlay: string
    shadow: string

    // Performance colors (matching the website)
    performance: {
      perfect: string
      great: string
      good: string
      poor: string
      unplayable: string
    }
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    xxl: number
  }
  borderRadius: {
    sm: number
    md: number
    lg: number
    xl: number
  }
  typography: {
    fontSize: {
      xs: number
      sm: number
      md: number
      lg: number
      xl: number
      xxl: number
    }
    fontWeight: {
      normal: '400'
      medium: '500'
      semibold: '600'
      bold: '700'
    }
  }
}

const lightTheme: Theme = {
  mode: 'light',
  isDark: false,
  colors: {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#8b5cf6',

    secondary: '#06b6d4',
    accent: '#f59e0b',

    background: '#fafafa',
    surface: '#ffffff',
    card: '#ffffff',

    text: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',

    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',

    overlay: 'rgba(15, 23, 42, 0.4)',
    shadow: 'rgba(15, 23, 42, 0.08)',

    performance: {
      perfect: '#22c55e',
      great: '#3b82f6',
      good: '#f59e0b',
      poor: '#ef4444',
      unplayable: '#64748b',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
}

const darkTheme: Theme = {
  ...lightTheme,
  mode: 'dark',
  isDark: true,
  colors: {
    ...lightTheme.colors,

    background: '#0f172a',
    surface: '#1e293b',
    card: '#1e293b',

    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',

    border: '#334155',
    borderLight: '#475569',

    overlay: 'rgba(15, 23, 42, 0.8)',
    shadow: 'rgba(0, 0, 0, 0.4)',
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

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  )
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
