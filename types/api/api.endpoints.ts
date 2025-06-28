/**
 * API Endpoints
 */
import type {
  AddDevicePreferenceInput,
  BulkUpdateDevicePreferencesInput,
  BulkUpdateSocPreferencesInput,
  CreateCommentInput,
  CreateListingInput,
  DeleteCommentInput,
  DeleteListingInput,
  GetDevicesInput,
  GetEmulatorsInput,
  GetGameByIdInput,
  GetGamesInput,
  GetListingByIdInput,
  GetListingCommentsInput,
  GetListingVerificationsInput,
  GetListingsByGameInput,
  GetListingsInput,
  GetMyVerificationsInput,
  GetMyVerificationsResponse,
  GetNotificationsInput,
  GetNotificationsResponse,
  GetUserListingsInput,
  GetUserProfileInput,
  GetUserVoteInput,
  IsVerifiedDeveloperInput,
  MarkNotificationReadInput,
  RemoveDevicePreferenceInput,
  RemoveVerificationInput,
  SearchGamesInput,
  SearchSuggestionsInput,
  UpdateCommentInput,
  UpdateListingInput,
  UpdateProfileInput,
  UpdateUserPreferencesInput,
  VerifyListingInput,
  VoteListingInput,
  AppStats,
  Comment,
  Device,
  DeviceBrand,
  DevicePreference,
  Emulator,
  Game,
  GetListingsResponse,
  Listing,
  ListingVerification,
  PerformanceScale,
  SearchSuggestion,
  Soc,
  SocPreference,
  System,
  TrustLevel,
  User,
  UserPreferences,
  UserProfile,
} from '@/types'

export interface Api {
  // Listings
  getListings: (input: GetListingsInput) => Promise<GetListingsResponse>
  getFeaturedListings: () => Promise<Listing[]>
  getListingsByGame: (input: GetListingsByGameInput) => Promise<Listing[]>
  getListingById: (input: GetListingByIdInput) => Promise<Listing | null>
  createListing: (input: CreateListingInput) => Promise<Listing>
  updateListing: (input: UpdateListingInput) => Promise<Listing>
  deleteListing: (input: DeleteListingInput) => Promise<Listing>

  // Games
  getGames: (input: GetGamesInput) => Promise<Game[]>
  getPopularGames: () => Promise<Game[]>
  searchGames: (input: SearchGamesInput) => Promise<Game[]>
  getGameById: (input: GetGameByIdInput) => Promise<Game | null>

  // App Info
  getAppStats: () => Promise<AppStats>
  getSystems: () => Promise<System[]>
  getEmulators: (input: GetEmulatorsInput) => Promise<Emulator[]>
  getDevices: (input: GetDevicesInput) => Promise<Device[]>
  getDeviceBrands: () => Promise<DeviceBrand[]>
  getSocs: () => Promise<Soc[]>
  getPerformanceScales: () => Promise<PerformanceScale[]>
  getSearchSuggestions: (
    input: SearchSuggestionsInput,
  ) => Promise<SearchSuggestion[]>

  // Comments
  getListingComments: (input: GetListingCommentsInput) => Promise<Comment[]>
  createComment: (input: CreateCommentInput) => Promise<Comment>
  updateComment: (input: UpdateCommentInput) => Promise<Comment>
  deleteComment: (input: DeleteCommentInput) => Promise<Comment>

  // Votes
  voteListing: (
    input: VoteListingInput,
  ) => Promise<{ id: string; value: boolean }>
  getUserVote: (input: GetUserVoteInput) => Promise<boolean | null>

  // User
  getUserProfile: (input: GetUserProfileInput) => Promise<UserProfile | null>
  getUserListings: (input: GetUserListingsInput) => Promise<Listing[]>
  updateProfile: (input: UpdateProfileInput) => Promise<User>
  getUserPreferences: () => Promise<UserPreferences>

  // User Preferences
  updateUserPreferences: (
    input: UpdateUserPreferencesInput,
  ) => Promise<UserPreferences>
  addDevicePreference: (
    input: AddDevicePreferenceInput,
  ) => Promise<DevicePreference>
  removeDevicePreference: (
    input: RemoveDevicePreferenceInput,
  ) => Promise<{ success: boolean }>
  bulkUpdateDevicePreferences: (
    input: BulkUpdateDevicePreferencesInput,
  ) => Promise<DevicePreference[]>
  bulkUpdateSocPreferences: (
    input: BulkUpdateSocPreferencesInput,
  ) => Promise<SocPreference[]>

  // Notifications
  getNotifications: (
    input: GetNotificationsInput,
  ) => Promise<GetNotificationsResponse>
  getUnreadNotificationCount: () => Promise<number>
  markNotificationAsRead: (
    input: MarkNotificationReadInput,
  ) => Promise<{ success: boolean }>
  markAllNotificationsAsRead: () => Promise<{ success: boolean }>

  // Verified Developers
  getMyVerifiedEmulators: () => Promise<Emulator[]>
  isVerifiedDeveloper: (input: IsVerifiedDeveloperInput) => Promise<boolean>

  // Listing Verifications
  verifyListing: (input: VerifyListingInput) => Promise<ListingVerification>
  removeVerification: (
    input: RemoveVerificationInput,
  ) => Promise<{ message: string }>
  getListingVerifications: (
    input: GetListingVerificationsInput,
  ) => Promise<ListingVerification[]>
  getMyVerifications: (
    input: GetMyVerificationsInput,
  ) => Promise<GetMyVerificationsResponse>

  // Trust System
  getTrustLevels: () => Promise<TrustLevel[]>
}
