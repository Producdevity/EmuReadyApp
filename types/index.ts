// Navigation Types
import { type User } from '@/types/api'

export * from './api'

export type RootStackParamList = {
  '(tabs)': undefined
  'listing/[id]': { id: string }
  'game/[id]': { id: string }
  'user/[id]': { id: string }
  'auth/login': undefined
  'auth/register': undefined
}

export type TabParamList = {
  index: undefined
  browse: undefined
  create: undefined
  profile: undefined
}

// Form Types
export interface CreateListingForm {
  gameId: string
  deviceId: string
  emulatorId: string
  performanceId: string
  customFields?: Record<string, any>
}

export type SearchFiltersSortBy = 'newest' | 'oldest' | 'rating' | 'performance'

export interface SearchFilters {
  query?: string
  systemId?: string
  deviceId?: string
  emulatorId?: string
  performanceRank?: number
  sortBy?: SearchFiltersSortBy
}

// Store Types
export interface AppState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  preferences: UserPreferences
}

export type ThemePreference = 'light' | 'dark' | 'system'

export interface UserPreferences {
  theme: ThemePreference
  notifications: {
    push: boolean
    email: boolean
    comments: boolean
    votes: boolean
  }
  defaultFilters: SearchFilters
}

// Animation Types
export interface AnimationConfig {
  duration: number
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
  delay?: number
}

// Error Types
export interface AppError {
  message: string
  code?: string
  details?: any
}
