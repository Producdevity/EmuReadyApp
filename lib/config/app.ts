import { Platform } from 'react-native'

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

// App Information
export const APP_INFO = {
  NAME: 'EmuReady',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  DEVELOPER: 'EmuReady Team',
  SUPPORT_EMAIL: 'support@emuready.com',
  PRIVACY_URL: 'https://emuready.com/privacy',
  TERMS_URL: 'https://emuready.com/terms',
} as const

// Performance Settings
export const PERFORMANCE = {
  // List configurations
  LIST_INITIAL_BATCH_SIZE: 10,
  LIST_PAGE_SIZE: 20,
  LIST_SCROLL_THRESHOLD: 0.8,

  // Image caching
  IMAGE_CACHE_SIZE: Platform.select({
    ios: 50, // MB
    android: 30, // MB - Android has more memory constraints
    default: 20,
  }),

  // Animation settings
  ANIMATION_DURATION_FAST: 150,
  ANIMATION_DURATION_NORMAL: 300,
  ANIMATION_DURATION_SLOW: 500,

  // Debounce timings
  SEARCH_DEBOUNCE: 500,
  INPUT_DEBOUNCE: 300,
  SCROLL_DEBOUNCE: 100,
} as const

// Theme and Styling
export const THEME = {
  COLORS: {
    PRIMARY: '#3b82f6',
    PRIMARY_DARK: '#1d4ed8',
    SECONDARY: '#6b7280',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',

    // Neutral colors
    WHITE: '#ffffff',
    BLACK: '#000000',
    GRAY_50: '#f9fafb',
    GRAY_100: '#f3f4f6',
    GRAY_200: '#e5e7eb',
    GRAY_300: '#d1d5db',
    GRAY_400: '#9ca3af',
    GRAY_500: '#6b7280',
    GRAY_600: '#4b5563',
    GRAY_700: '#374151',
    GRAY_800: '#1f2937',
    GRAY_900: '#111827',

    // Background colors
    BACKGROUND_LIGHT: '#f9fafb',
    BACKGROUND_DARK: '#111827',
    SURFACE_LIGHT: '#ffffff',
    SURFACE_DARK: '#1f2937',
  },

  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },

  BORDER_RADIUS: {
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 24,
    FULL: 9999,
  },

  SHADOWS: {
    SM: Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
      default: {},
    }),
    MD: Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      default: {},
    }),
    LG: Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
} as const

// Feature Flags
export const FEATURES = {
  // Core features
  LISTINGS_ENABLED: true,
  GAMES_ENABLED: true,
  COMMENTS_ENABLED: true,
  VOTING_ENABLED: true,

  // Social features
  USER_PROFILES_ENABLED: true,
  SHARING_ENABLED: true,

  // Advanced features
  PUSH_NOTIFICATIONS_ENABLED: false, // Not implemented yet
  OFFLINE_MODE_ENABLED: false, // Future feature
  ANALYTICS_ENABLED: !__DEV__,

  // Debug features
  DEBUG_MODE: __DEV__,
  PERFORMANCE_MONITORING: __DEV__,
} as const

// Storage Keys
export const STORAGE_KEYS = {
  // User preferences
  USER_PREFERENCES: '@emuready:user_preferences',
  THEME_PREFERENCE: '@emuready:theme',
  LANGUAGE_PREFERENCE: '@emuready:language',

  // App state
  LAST_APP_VERSION: '@emuready:last_app_version',
  FIRST_LAUNCH: '@emuready:first_launch',
  ONBOARDING_COMPLETED: '@emuready:onboarding_completed',

  // Cache
  API_CACHE: '@emuready:api_cache',
  IMAGE_CACHE: '@emuready:image_cache',

  // Auth
  AUTH_TOKEN: '@emuready:auth_token',
  USER_DATA: '@emuready:user_data',
} as const

// Network Configuration
export const NETWORK = {
  // Request timeouts
  DEFAULT_TIMEOUT: 10000,
  UPLOAD_TIMEOUT: 30000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RETRY_MULTIPLIER: 2,

  // Cache configuration
  CACHE_DURATION: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: {
    CONNECTION_ERROR:
      'Unable to connect to the server. Please check your internet connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    NOT_FOUND: 'The requested resource was not found.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access to this resource is forbidden.',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
    INVALID_FORMAT: 'Invalid format provided.',
  },
  GENERAL: {
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    OFFLINE: 'You are currently offline. Please check your connection.',
    MAINTENANCE:
      'The app is currently under maintenance. Please try again later.',
  },
} as const

// Default Export
export default {
  API_CONFIG,
  APP_INFO,
  PERFORMANCE,
  THEME,
  FEATURES,
  STORAGE_KEYS,
  NETWORK,
  ERROR_MESSAGES,
} as const
