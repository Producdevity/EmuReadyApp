// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'https://dev.emuready.com' // Development
    : 'https://emuready.com', // Production
  ENDPOINTS: {
    TRPC: '/api/trpc',
    MOBILE: '/api/mobile',
  },
} as const

// App Configuration
export const APP_CONFIG = {
  NAME: 'EmuReady',
  VERSION: '1.0.0',
  STORE_VERSION: 1,
} as const

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
  VERY_SLOW: 500,
} as const

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const

// Screen Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  CACHED_DATA: 'cached_data',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const

// Performance Scales
// Note: Colors should be retrieved from theme context for consistency
// These are fallback values only
export const PERFORMANCE_SCALES = {
  PERFECT: { rank: 1, label: 'Perfect', colorKey: 'perfect' },
  GREAT: { rank: 2, label: 'Great', colorKey: 'great' },
  GOOD: { rank: 3, label: 'Good', colorKey: 'good' },
  OKAY: { rank: 4, label: 'Okay', colorKey: 'poor' },
  POOR: { rank: 5, label: 'Poor', colorKey: 'unplayable' },
} as const

// Tab Icons
export const TAB_ICONS = {
  HOME: 'home',
  BROWSE: 'search',
  CREATE: 'plus-circle',
  PROFILE: 'user',
} as const
