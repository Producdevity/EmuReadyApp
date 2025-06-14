// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000' // Development
    : 'https://your-production-url.com', // Production
  ENDPOINTS: {
    TRPC: '/api/trpc',
    MOBILE: '/api/mobile',
  },
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'EmuReady',
  VERSION: '1.0.0',
  STORE_VERSION: 1,
} as const;

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
  VERY_SLOW: 500,
} as const;

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const;

// Screen Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  CACHED_DATA: 'cached_data',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

// Performance Scales
export const PERFORMANCE_SCALES = {
  PERFECT: { rank: 1, label: 'Perfect', color: '#22c55e' },
  GREAT: { rank: 2, label: 'Great', color: '#84cc16' },
  GOOD: { rank: 3, label: 'Good', color: '#eab308' },
  OKAY: { rank: 4, label: 'Okay', color: '#f97316' },
  POOR: { rank: 5, label: 'Poor', color: '#ef4444' },
} as const;

// Tab Icons
export const TAB_ICONS = {
  HOME: 'home',
  BROWSE: 'search',
  CREATE: 'plus-circle',
  PROFILE: 'user',
} as const; 