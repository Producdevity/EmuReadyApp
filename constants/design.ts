/**
 * @deprecated Many values in this file overlap with ThemeContext.
 * Use ThemeContext for theme-related values:
 * - spacing: use theme.spacing
 * - borderRadius: use theme.borderRadius
 * - typography: use theme.typography
 * - animations: use theme.animations
 * 
 * This file should only be used for non-theme constants like:
 * - Screen dimensions
 * - Z-index system
 * - Performance thresholds
 * - Component-specific constants (FAB, TAB_BAR)
 */

import { Dimensions } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

export const DESIGN_CONSTANTS = {
  // Screen dimensions
  SCREEN_WIDTH,
  SCREEN_HEIGHT,

  // @deprecated Use theme.spacing instead
  SPACING: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  // @deprecated Use theme.borderRadius instead
  RADIUS: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20, // Updated to match theme.borderRadius.xl
    xxl: 28, // Added to match theme
    pill: 9999,
  },

  // @deprecated Use theme.animations.timing instead
  ANIMATION: {
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
    slowest: 1200,
  },

  // Glass morphism values
  GLASS: {
    blur: {
      light: 20,
      medium: 40,
      heavy: 80,
    },
    opacity: {
      subtle: 0.05,
      light: 0.1,
      medium: 0.25,
      heavy: 0.4,
    },
  },

  // @deprecated Use theme.shadows instead
  // These shadow configs include platform-specific properties not in theme
  SHADOW: {
    small: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Floating Action Button constants
  FAB: {
    sizes: {
      small: { size: 48, iconSize: 20, padding: 12 },
      medium: { size: 56, iconSize: 24, padding: 16 },
      large: { size: 64, iconSize: 28, padding: 20 },
    },
    animation: {
      distance: 70,
      magneticThreshold: 20,
      maxActions: 8,
    },
  },

  // Tab bar constants
  TAB_BAR: {
    height: 80,
    paddingHorizontal: 16,
    borderRadius: 24,
  },

  // @deprecated Use theme.typography instead
  TYPOGRAPHY: {
    sizes: {
      xs: 11, // Updated to match theme
      sm: 13, // Updated to match theme
      base: 15, // Updated to match theme.typography.fontSize.md
      lg: 17, // Updated to match theme
      xl: 19, // Updated to match theme
      '2xl': 24, // Matches theme.typography.fontSize.xxl
      '3xl': 32, // Matches theme.typography.fontSize.xxxl
      '4xl': 36,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },

  // Color opacity levels
  OPACITY: {
    disabled: 0.4,
    muted: 0.6,
    secondary: 0.8,
    primary: 1,
  },

  // Z-index system
  Z_INDEX: {
    background: -1,
    default: 0,
    dropdown: 1000,
    sticky: 1020,
    modal: 1030,
    popover: 1040,
    tooltip: 1050,
    notification: 1060,
  },

  // Performance optimization thresholds
  PERFORMANCE: {
    maxParticles: 8,
    maxAnimationLayers: 5,
    lowEndDeviceThreshold: 2, // GB of RAM
  },
} as const

// Responsive breakpoints
export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

// Helper functions for responsive design
export const isSmallScreen = () => SCREEN_WIDTH < BREAKPOINTS.sm
export const isMediumScreen = () => SCREEN_WIDTH >= BREAKPOINTS.sm && SCREEN_WIDTH < BREAKPOINTS.md
export const isLargeScreen = () => SCREEN_WIDTH >= BREAKPOINTS.md

// Helper to get responsive value
export function getResponsiveValue<T>(small: T, medium?: T, large?: T): T {
  if (isSmallScreen() && large !== undefined) return small
  if (isLargeScreen() && large !== undefined) return large
  if (isMediumScreen() && medium !== undefined) return medium
  return small
}

// Animation easing functions
export const EASING = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const
