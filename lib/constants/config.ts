// App configuration constants
export const CONFIG = {
  // API Configuration
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://dev.emuready.com',

  // Clerk Authentication
  CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '',

  // App Settings
  APP_NAME: 'EmuReady',
  APP_VERSION: '1.0.0',

  // Development
  IS_DEV: process.env.EXPO_PUBLIC_ENV === 'development' || __DEV__,

  // Cache Settings
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes

  // Pagination
  DEFAULT_PAGE_SIZE: 20,

  // Animation Durations (deprecated - use DESIGN_CONSTANTS.ANIMATION instead)
  ANIMATION_DURATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500,
  },

  // Legal URLs
  PRIVACY_URL: 'https://emuready.com/privacy',
  TERMS_URL: 'https://emuready.com/terms',
} as const

// Feature flags
export const FEATURES = {
  AUTHENTICATION: true,
  PUSH_NOTIFICATIONS: false, // Will be enabled later
  OFFLINE_MODE: false, // Will be enabled later
  ANALYTICS: false, // Will be enabled later
} as const
