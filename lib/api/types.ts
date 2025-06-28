// API types generated from OpenAPI specification
import { type ApprovalStatus, type Role } from '@/types'
export interface ApiResponse<T> {
  result: T
}

// ======= App Stats Types =======
export interface AppStats {
  totalListings: number
  totalGames: number
  totalUsers: number
  totalComments: number
  totalVotes: number
  recentListings: number
  recentGames: number
  successRate: number
  popularDevices: PopularItem[]
  popularEmulators: PopularItem[]
}

export interface PopularItem {
  id: string
  name: string
  count: number
}

// ======= User Types =======
export interface User {
  id: string
  firstName?: string
  lastName?: string
  username: string
  email: string
  imageUrl?: string | null
  profileImage: string | null
  role: Role
  bio?: string | null
  createdAt: Date
  updatedAt: string
  stats?: UserStats
  // Additional properties needed by UI components
  name: string | null // Computed property used in UI
}

export interface UserStats {
  totalListings: number
  totalUpvotes: number
  totalComments: number
  joinedDate: string
}

export interface UserProfile extends User {
  listings?: Listing[]
  activity?: UserActivity[]
}

export interface UserActivity {
  id: string
  type: 'comment' | 'vote' | 'listing'
  targetId: string
  targetType: 'listing' | 'comment'
  targetTitle: string
  createdAt: string
}

// ======= System Types =======
export interface System {
  id: string
  name: string
  key: string | null
  tgdbPlatformId: number | null
}

// ======= Game Types =======
export interface Game {
  id: string
  title: string
  system: System
  imageUrl: string | null
  boxartUrl: string | null
  bannerUrl: string | null
  tgdbGameId: number | null
  status: ApprovalStatus
  submittedAt: Date | null
  submitter: User | null
  releaseYear?: number
  publisher?: string
  developer?: string
  listingsCount?: number
  upvotesCount?: number
  commentsCount?: number
  // Additional properties needed by UI components
  _count?: {
    listings?: number
    comments?: number
  }
}

// ======= Device Types =======
export interface Device {
  id: string
  modelName: string
  type: string
  brand: DeviceBrand
  imageUrl?: string | null
  soc: SoC | null
  specs?: DeviceSpecs | null
  // Additional properties needed by UI components
  _count?: {
    listings?: number
  }
}

export interface DeviceBrand {
  id: string
  name: string
  logoUrl?: string | null
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

export interface DeviceSpecs {
  ram?: string
  storage?: string
  display?: string
  resolution?: string
  batteryCapacity?: string
  weight?: string
  dimensions?: string
}

// ======= Emulator Types =======
export interface Emulator {
  id: string
  name: string
  logo: string | null
  systems: System[]
  system?: System
  version?: string
  logoUrl?: string | null
  website?: string | null
  description?: string | null
  // Additional properties needed by UI components
  _count?: {
    listings?: number
  }
}

// ======= Performance Types =======
export interface PerformanceScale {
  id: string
  rank: number
  label: string
  description: string | null
  color?: string
}

// ======= Listing Types =======
export interface Listing {
  id: string
  author: User | null
  userId: string
  game: Game
  device: Device
  emulator: Emulator
  performance: PerformanceScale
  upvotes: number
  downvotes: number
  notes: string | null
  customFieldValues: CustomFieldValue[]
  status: ApprovalStatus
  createdAt: Date
  updatedAt: Date
  _count: {
    comments: number
  }
  // Additional properties needed by UI components
  userVote: 'UP' | 'DOWN' | null
  successRate: number
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

export interface ListingsResponse {
  listings: Listing[]
  totalCount: number
  pageCount: number
  currentPage: number
}

// ======= Comment Types =======
export interface Comment {
  id: string
  content: string
  author?: User
  authorId: string
  listingId: string
  createdAt: string
  updatedAt: string
}

// ======= Vote Types =======
export interface Vote {
  id: string
  type: 'up' | 'down'
  userId: string
  listingId: string
  createdAt: string
}

// ======= Notification Types =======
export interface Notification {
  id: string
  userId: string
  type: 'comment' | 'vote' | 'system'
  read: boolean
  title: string
  message: string
  linkUrl?: string | null
  sourceId?: string | null
  sourceType?: string | null
  createdAt: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  totalCount: number
  unreadCount: number
}

// ======= Search Types =======
export interface SearchSuggestion {
  id: string
  type: 'game' | 'device' | 'emulator' | 'listing'
  title: string
  subtitle?: string
  imageUrl?: string | null
}
