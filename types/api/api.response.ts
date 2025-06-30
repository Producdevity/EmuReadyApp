/**
 * Resources
 */
import type {
  NotificationType,
  CustomFieldType,
  ApprovalStatus,
  Role,
} from '@/types'

/**
 * Represents a generic API resource interface that defines the structure of an API result.
 *
 * @template T - The type of the data contained within the API resource.
 * @property {Object} result - The outer object of the API response.
 * @property {Object} result.data - The container object for the data.
 * @property {T} result.data.json - The data of type T retrieved from the API.
 */
export interface ApiResource<T> {
  result: {
    data: {
      json: T
    }
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export type Uuid = string

interface BaseResource {
  id: Uuid
}

/**
 * @endpoint /api/trpc/mobile.getSystems
 */
export interface System extends BaseResource {
  name: string
  key: string | null
  tgdbPlatformId: number | null
}

/**
 * @endpoint /api/trpc/mobile.getPerformanceScales
 */
export interface PerformanceScale {
  id: number
  label: string
  rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
}

/**
 * @endpoint /api/trpc/mobile.getSocs
 */
export interface Soc extends BaseResource {
  name: string
  manufacturer: string
}

/**
 * @endpoint /api/trpc/mobile.getDeviceBrands
 */
export interface DeviceBrand extends BaseResource {
  name: string
}

/**
 * Common Types
 */

export interface Pagination {
  total: number
  pages: number
  currentPage: number
  limit: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface User extends BaseResource {
  id: string
  name: string
  email: string
  role: Role
}

export interface UserProfile extends User {
  bio: string | null
  createdAt: string
  _count: {
    listings: number
    votes: number
    comments: number
  }
}

export interface Brand extends BaseResource {
  name: string
}

export interface Device extends BaseResource {
  modelName: string
  brand: Brand
  soc: Soc | null
  _count?: {
    listings: number
  }
}

export interface Emulator extends BaseResource {
  name: string
  logo: string | null
  systems: System[]
  description?: string | null
  repositoryUrl?: string | null
  officialUrl?: string | null
  _count?: {
    listings: number
  }
}

export interface Game extends BaseResource {
  title: string
  description: string | null
  releaseDate: string | null
  coverImageUrl: string | null
  boxArtUrl: string | null
  system: System
  status: ApprovalStatus
  _count?: {
    listings: number
  }
}

export interface CustomFieldDefinition extends BaseResource {
  name: string
  label: string
  type: CustomFieldType
  options: string[] | null
}

export interface CustomFieldValue extends BaseResource {
  value: string
  customFieldDefinition: CustomFieldDefinition
}

export interface Comment extends BaseResource {
  content: string
  createdAt: string
  updatedAt: string
  user: User
}

export interface Listing extends BaseResource {
  notes: string | null
  status: ApprovalStatus
  createdAt: string
  updatedAt: string
  game: Game
  device: Device
  emulator: Emulator
  performance: PerformanceScale
  author: User
  _count: {
    votes: number
    comments: number
  }
  customFieldValues?: CustomFieldValue[]
  // Additional calculated fields
  successRate: number
  upVotes: number
  downVotes: number
  totalVotes: number
  userVote: boolean | null
}

export interface Notification extends BaseResource {
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
  actionUrl: string | null
}

export interface AppStats {
  totalListings: number
  totalGames: number
  totalDevices: number
  totalEmulators: number
  totalUsers: number
}

export interface SearchSuggestion {
  id: string
  title: string
  type: 'game' | 'device' | 'emulator'
  subtitle?: string
}

export interface DevicePreference extends BaseResource {
  device: Device
}

export interface SocPreference extends BaseResource {
  soc: Soc
}

export interface UserPreferences {
  devicePreferences: DevicePreference[]
  socPreferences: SocPreference[]
  defaultToUserDevices: boolean
  defaultToUserSocs: boolean
  notifyOnNewListings: boolean
}

export interface VerifiedDeveloper extends BaseResource {
  userId: string
  emulatorId: string
  verifiedBy: string
  verifiedAt: string
  notes: string | null
  emulator: Emulator
}

export interface ListingVerification extends BaseResource {
  listingId: string
  verifiedBy: string
  verifiedAt: string
  notes: string | null
  developer: {
    id: string
    name: string
    profileImage: string | null
  }
}

export interface TrustLevel {
  name: string
  minScore: number
  color: string
  description: string
}

export interface GetListingsResponse {
  listings: Listing[]
  pagination: Pagination
}
