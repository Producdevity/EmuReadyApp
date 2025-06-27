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
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    primaryLight: '#60a5fa',

    secondary: '#10b981',
    accent: '#f59e0b',

    background: '#ffffff',
    surface: '#f8fafc',
    card: '#ffffff',

    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',

    border: '#e5e7eb',
    borderLight: '#f3f4f6',

    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',

    performance: {
      perfect: '#10b981',
      great: '#3b82f6',
      good: '#f59e0b',
      poor: '#ef4444',
      unplayable: '#6b7280',
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

    background: '#111827',
    surface: '#1f2937',
    card: '#1f2937',

    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textMuted: '#9ca3af',

    border: '#374151',
    borderLight: '#4b5563',

    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.3)',
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
