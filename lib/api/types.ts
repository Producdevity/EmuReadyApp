/**
 * tRPC Client Types for EmuReady Mobile API
 * 
 * Based on the actual tRPC response structure observed from the API:
 * All tRPC responses are wrapped in: { result: { data: { json: T } } }
 */

import type {
  AppStats,
  Game, 
  Listing,
  Device,
  DeviceBrand,
  Emulator,
  System,
  Soc,
  PerformanceScale,
  Comment,
  User,
  UserProfile,
  UserPreferences,
  DevicePreference,
  SocPreference,
  SearchSuggestion,
  ListingVerification,
  TrustLevel,
  GetListingsInput,
  GetListingsResponse,
  GetGamesInput,
  GetEmulatorsInput,
  GetDevicesInput,
  GetGameByIdInput,
  GetListingByIdInput,
  GetListingCommentsInput,
  GetUserProfileInput,
  GetUserListingsInput,
  GetUserVoteInput,
  GetNotificationsInput,
  GetNotificationsResponse,
  SearchGamesInput,
  SearchSuggestionsInput,
  CreateListingInput,
  UpdateListingInput,
  DeleteListingInput,
  CreateCommentInput,
  UpdateCommentInput,
  DeleteCommentInput,
  VoteListingInput,
  UpdateProfileInput,
  UpdateUserPreferencesInput,
  AddDevicePreferenceInput,
  RemoveDevicePreferenceInput,
  BulkUpdateDevicePreferencesInput,
  BulkUpdateSocPreferencesInput,
  MarkNotificationReadInput,
  IsVerifiedDeveloperInput,
  VerifyListingInput,
  RemoveVerificationInput,
  GetListingVerificationsInput,
  GetMyVerificationsInput,
  GetMyVerificationsResponse,
} from '@/types'

/**
 * tRPC response wrapper - all tRPC responses come wrapped in this structure
 */
export interface TRPCResponse<T> {
  result: {
    data: {
      json: T
    }
  }
}

/**
 * Define each tRPC procedure with its input and output types
 */
export interface MobileRouterProcedures {
  // App Stats & Info  
  getAppStats: {
    input: void
    output: AppStats
  }
  
  getSystems: {
    input: void
    output: System[]
  }
  
  getPerformanceScales: {
    input: void
    output: PerformanceScale[]
  }
  
  getSocs: {
    input: void
    output: Soc[]
  }

  // Games
  getPopularGames: {
    input: void
    output: Game[]
  }
  
  getGames: {
    input: GetGamesInput
    output: Game[]
  }
  
  searchGames: {
    input: SearchGamesInput
    output: Game[]
  }
  
  getGameById: {
    input: GetGameByIdInput
    output: Game | null
  }

  // Listings
  getListings: {
    input: GetListingsInput
    output: GetListingsResponse
  }
  
  getFeaturedListings: {
    input: void
    output: Listing[]
  }
  
  getListingById: {
    input: GetListingByIdInput
    output: Listing | null
  }
  
  createListing: {
    input: CreateListingInput
    output: Listing
  }
  
  updateListing: {
    input: UpdateListingInput
    output: Listing
  }
  
  deleteListing: {
    input: DeleteListingInput
    output: Listing
  }

  // Devices & Emulators
  getDevices: {
    input: GetDevicesInput
    output: Device[]
  }
  
  getDeviceBrands: {
    input: void
    output: DeviceBrand[]
  }
  
  getEmulators: {
    input: GetEmulatorsInput
    output: Emulator[]
  }

  // Comments
  getListingComments: {
    input: GetListingCommentsInput
    output: Comment[]
  }
  
  createComment: {
    input: CreateCommentInput
    output: Comment
  }
  
  updateComment: {
    input: UpdateCommentInput
    output: Comment
  }
  
  deleteComment: {
    input: DeleteCommentInput
    output: Comment
  }

  // Votes
  voteListing: {
    input: VoteListingInput
    output: { id: string; value: boolean }
  }
  
  getUserVote: {
    input: GetUserVoteInput
    output: boolean | null
  }

  // User & Profile
  me: {
    input: void
    output: User | null
  }
  
  getUserProfile: {
    input: GetUserProfileInput
    output: UserProfile | null
  }
  
  getUserListings: {
    input: GetUserListingsInput
    output: Listing[]
  }
  
  updateProfile: {
    input: UpdateProfileInput
    output: UserProfile
  }
  
  getUserPreferences: {
    input: void
    output: UserPreferences
  }

  // User Preferences
  updateUserPreferences: {
    input: UpdateUserPreferencesInput
    output: UserPreferences
  }
  
  addDevicePreference: {
    input: AddDevicePreferenceInput
    output: DevicePreference
  }
  
  removeDevicePreference: {
    input: RemoveDevicePreferenceInput
    output: { success: boolean }
  }
  
  bulkUpdateDevicePreferences: {
    input: BulkUpdateDevicePreferencesInput
    output: DevicePreference[]
  }
  
  bulkUpdateSocPreferences: {
    input: BulkUpdateSocPreferencesInput
    output: SocPreference[]
  }

  // Notifications
  getNotifications: {
    input: GetNotificationsInput
    output: GetNotificationsResponse
  }
  
  getUnreadNotificationCount: {
    input: void
    output: number
  }
  
  markNotificationAsRead: {
    input: MarkNotificationReadInput
    output: { success: boolean }
  }
  
  markAllNotificationsAsRead: {
    input: void
    output: { success: boolean }
  }

  // Search
  getSearchSuggestions: {
    input: SearchSuggestionsInput
    output: SearchSuggestion[]
  }

  // Verified Developers
  getMyVerifiedEmulators: {
    input: void
    output: Emulator[]
  }
  
  isVerifiedDeveloper: {
    input: IsVerifiedDeveloperInput
    output: boolean
  }

  // Listing Verifications
  verifyListing: {
    input: VerifyListingInput
    output: ListingVerification
  }
  
  removeVerification: {
    input: RemoveVerificationInput
    output: { message: string }
  }
  
  getListingVerifications: {
    input: GetListingVerificationsInput
    output: ListingVerification[]
  }
  
  getMyVerifications: {
    input: GetMyVerificationsInput
    output: GetMyVerificationsResponse
  }

  // Trust System
  getTrustLevels: {
    input: void
    output: TrustLevel[]
  }
}

/**
 * Transform a procedure definition into the actual tRPC client method
 */
export type TRPCProcedure<T extends { input: any; output: any }> = T['input'] extends void
  ? {
      useQuery: () => {
        data: T['output'] | undefined
        isLoading: boolean
        error: any
        refetch: () => void
      }
      useMutation?: () => {
        mutate: () => void
        data: T['output'] | undefined
        isLoading: boolean
        error: any
      }
    }
  : {
      useQuery: (input: T['input']) => {
        data: T['output'] | undefined
        isLoading: boolean
        error: any
        refetch: () => void
      }
      useMutation?: () => {
        mutate: (input: T['input']) => void
        data: T['output'] | undefined
        isLoading: boolean
        error: any
      }
    }

/**
 * Full tRPC mobile router type with proper procedure definitions
 */
export type MobileRouter = {
  [K in keyof MobileRouterProcedures]: TRPCProcedure<MobileRouterProcedures[K]>
}

/**
 * Full tRPC App Router structure
 */
export interface AppRouter {
  mobile: MobileRouter
}

/**
 * Create a type-safe tRPC client type
 */
export type TRPCClient = {
  mobile: {
    [K in keyof MobileRouterProcedures]: TRPCProcedure<MobileRouterProcedures[K]>
  }
}