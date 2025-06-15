export enum Role {
  USER = 'USER',
  AUTHOR = 'AUTHOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Base Types
export interface User {
  id: string
  name: string | null
  email: string
  profileImage: string | null
  role: Role
  createdAt: Date
}

export interface Game {
  id: string
  title: string
  imageUrl: string | null
  boxartUrl: string | null
  bannerUrl: string | null
  system: System
  tgdbGameId: number | null
  status: ApprovalStatus
  submittedAt: Date | null
  submitter: User | null
}

export interface System {
  id: string
  name: string
  key: string | null
  tgdbPlatformId: number | null
}

export interface Device {
  id: string
  modelName: string
  brand: DeviceBrand
  soc: SoC | null
}

export interface DeviceBrand {
  id: string
  name: string
}

export interface SoC {
  id: string
  name: string
  manufacturer: string
  architecture: string | null
  processNode: string | null
  cpuCores: number | null
  gpuModel: string | null
}

export interface Emulator {
  id: string
  name: string
  logo: string | null
  systems: System[]
}

export interface PerformanceScale {
  id: string
  label: string
  rank: number
  description: string | null
}

export interface Listing {
  id: string
  game: Game
  device: Device
  emulator: Emulator
  performance: PerformanceScale
  author: User | null
  userId: string
  status: ApprovalStatus
  createdAt: Date
  updatedAt: Date
  upvotes: number
  downvotes: number
  userVote: 'UP' | 'DOWN' | null
  successRate: number
  notes: string | null
  customFieldValues: CustomFieldValue[]
  _count: {
    comments: number
  }
}

export interface CustomFieldValue {
  id: string
  value: any
  customFieldDefinition: {
    id: string
    name: string
    label: string
    type: string
  }
}

export interface Comment {
  id: string
  content: string
  author: User
  createdAt: Date
  updatedAt: Date
  upvotes: number
  downvotes: number
  userVote: 'UP' | 'DOWN' | null
}

// API Response Types
export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface FeaturedListingsResponse {
  listings: Listing[]
  totalCount: number
  successRate: number
}

// Navigation Types
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
