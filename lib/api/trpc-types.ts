/**
 * Type augmentation for tRPC to provide proper typing
 * This gives us type safety without complex router definitions
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
  GetListingsByGameInput,
  GetListingVerificationsInput,
  GetMyVerificationsInput,
  GetMyVerificationsResponse,
  IsVerifiedDeveloperInput,
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
  VerifyListingInput,
  RemoveVerificationInput,
  MarkNotificationReadInput,
} from '@/types'

// Type helper for query results
export type QueryResult<TData> = {
  data: TData | undefined
  isLoading: boolean
  error: any
  refetch: () => void
  isError: boolean
  isSuccess: boolean
  isFetching: boolean
}

// Type helper for mutation results
export type MutationResult<TData, TInput> = {
  mutate: (input: TInput) => void
  mutateAsync: (input: TInput) => Promise<TData>
  data: TData | undefined
  isLoading: boolean
  error: any
  isError: boolean
  isSuccess: boolean
  isPending: boolean
}

// Mobile router type definitions
export interface TRPCMobileRouter {
    // Queries
    getListings: {
      useQuery: (input: GetListingsInput, options?: any) => QueryResult<GetListingsResponse>
    }
    getFeaturedListings: {
      useQuery: (options?: any) => QueryResult<Listing[]>
    }
    getGames: {
      useQuery: (input: GetGamesInput, options?: any) => QueryResult<Game[]>
    }
    getPopularGames: {
      useQuery: (options?: any) => QueryResult<Game[]>
    }
    getAppStats: {
      useQuery: (options?: any) => QueryResult<AppStats>
    }
    getEmulators: {
      useQuery: (input: GetEmulatorsInput, options?: any) => QueryResult<Emulator[]>
    }
    getEmulatorById: {
      useQuery: (input: { id: string }, options?: any) => QueryResult<Emulator | null>
    }
    getDevices: {
      useQuery: (input: GetDevicesInput, options?: any) => QueryResult<Device[]>
    }
    getDeviceBrands: {
      useQuery: (options?: any) => QueryResult<DeviceBrand[]>
    }
    getSocs: {
      useQuery: (options?: any) => QueryResult<Soc[]>
    }
    getPerformanceScales: {
      useQuery: (options?: any) => QueryResult<PerformanceScale[]>
    }
    getSystems: {
      useQuery: (options?: any) => QueryResult<System[]>
    }
    getSearchSuggestions: {
      useQuery: (input: SearchSuggestionsInput, options?: any) => QueryResult<SearchSuggestion[]>
    }
    getListingsByGame: {
      useQuery: (input: GetListingsByGameInput, options?: any) => QueryResult<Listing[]>
    }
    searchGames: {
      useQuery: (input: SearchGamesInput, options?: any) => QueryResult<Game[]>
    }
    getGameById: {
      useQuery: (input: GetGameByIdInput, options?: any) => QueryResult<Game | null>
    }
    getListingComments: {
      useQuery: (input: GetListingCommentsInput, options?: any) => QueryResult<Comment[]>
    }
    getListingById: {
      useQuery: (input: GetListingByIdInput, options?: any) => QueryResult<Listing | null>
    }
    getListingVerifications: {
      useQuery: (input: GetListingVerificationsInput, options?: any) => QueryResult<ListingVerification[]>
    }
    getTrustLevels: {
      useQuery: (options?: any) => QueryResult<TrustLevel[]>
    }
    getNotifications: {
      useQuery: (input: GetNotificationsInput, options?: any) => QueryResult<GetNotificationsResponse>
    }
    getUnreadNotificationCount: {
      useQuery: (options?: any) => QueryResult<number>
    }
    getUserVote: {
      useQuery: (input: GetUserVoteInput, options?: any) => QueryResult<boolean | null>
    }
    getUserPreferences: {
      useQuery: (options?: any) => QueryResult<UserPreferences>
    }
    getUserProfile: {
      useQuery: (input: GetUserProfileInput, options?: any) => QueryResult<UserProfile | null>
    }
    getUserListings: {
      useQuery: (input: GetUserListingsInput, options?: any) => QueryResult<Listing[]>
    }
    getMyVerifiedEmulators: {
      useQuery: (options?: any) => QueryResult<Emulator[]>
    }
    isVerifiedDeveloper: {
      useQuery: (input: IsVerifiedDeveloperInput, options?: any) => QueryResult<boolean>
    }
    getMyVerifications: {
      useQuery: (input: GetMyVerificationsInput, options?: any) => QueryResult<GetMyVerificationsResponse>
    }
    me: {
      useQuery: (options?: any) => QueryResult<User>
    }

    // Mutations
    markNotificationAsRead: {
      useMutation: (options?: any) => MutationResult<{ success: boolean }, MarkNotificationReadInput>
    }
    markAllNotificationsAsRead: {
      useMutation: (options?: any) => MutationResult<{ success: boolean }, void>
    }
    updateUserPreferences: {
      useMutation: (options?: any) => MutationResult<UserPreferences, UpdateUserPreferencesInput>
    }
    addDevicePreference: {
      useMutation: (options?: any) => MutationResult<DevicePreference, AddDevicePreferenceInput>
    }
    removeDevicePreference: {
      useMutation: (options?: any) => MutationResult<{ success: boolean }, RemoveDevicePreferenceInput>
    }
    bulkUpdateDevicePreferences: {
      useMutation: (options?: any) => MutationResult<DevicePreference[], BulkUpdateDevicePreferencesInput>
    }
    bulkUpdateSocPreferences: {
      useMutation: (options?: any) => MutationResult<SocPreference[], BulkUpdateSocPreferencesInput>
    }
    createComment: {
      useMutation: (options?: any) => MutationResult<Comment, CreateCommentInput>
    }
    voteListing: {
      useMutation: (options?: any) => MutationResult<{ value: boolean; listingId: string; userId: string }, VoteListingInput>
    }
    createListing: {
      useMutation: (options?: any) => MutationResult<Listing, CreateListingInput>
    }
    updateListing: {
      useMutation: (options?: any) => MutationResult<Listing, UpdateListingInput>
    }
    deleteListing: {
      useMutation: (options?: any) => MutationResult<Listing, DeleteListingInput>
    }
    updateComment: {
      useMutation: (options?: any) => MutationResult<Comment, UpdateCommentInput>
    }
    deleteComment: {
      useMutation: (options?: any) => MutationResult<Comment, DeleteCommentInput>
    }
    updateProfile: {
      useMutation: (options?: any) => MutationResult<UserProfile, UpdateProfileInput>
    }
    verifyListing: {
      useMutation: (options?: any) => MutationResult<ListingVerification, VerifyListingInput>
    }
    removeVerification: {
      useMutation: (options?: any) => MutationResult<{ message: string }, RemoveVerificationInput>
    }
  }