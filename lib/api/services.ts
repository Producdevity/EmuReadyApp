import { api } from './http'
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

// Listings
export const listingsService = {
  getListings: (input: GetListingsInput) => 
    api.get<GetListingsResponse>('/mobile/getListings', { params: input }),
    
  getFeaturedListings: () => 
    api.get<Listing[]>('/mobile/getFeaturedListings'),
    
  getListingsByGame: (input: GetListingsByGameInput) => 
    api.get<Listing[]>('/mobile/getListingsByGame', { params: input }),
    
  getListingById: (input: GetListingByIdInput) => 
    api.get<Listing | null>('/mobile/getListingById', { params: input }),
    
  createListing: (input: CreateListingInput) => 
    api.post<Listing>('/mobile/createListing', input),
    
  updateListing: (input: UpdateListingInput) => 
    api.put<Listing>('/mobile/updateListing', input),
    
  deleteListing: (input: DeleteListingInput) => 
    api.delete<Listing>('/mobile/deleteListing', { params: input }),
}

// Games
export const gamesService = {
  getGames: (input: GetGamesInput) => 
    api.get<Game[]>('/mobile/getGames', { params: input }),
    
  getPopularGames: () => 
    api.get<Game[]>('/mobile/getPopularGames'),
    
  searchGames: (input: SearchGamesInput) => 
    api.get<Game[]>('/mobile/searchGames', { params: input }),
    
  getGameById: (input: GetGameByIdInput) => 
    api.get<Game | null>('/mobile/getGameById', { params: input }),
}

// App Info
export const appService = {
  getAppStats: () => 
    api.get<AppStats>('/mobile/getAppStats'),
    
  getSystems: () => 
    api.get<System[]>('/mobile/getSystems'),
    
  getEmulators: (input: GetEmulatorsInput) => 
    api.get<Emulator[]>('/mobile/getEmulators', { params: input }),
    
  getDevices: (input: GetDevicesInput) => 
    api.get<Device[]>('/mobile/getDevices', { params: input }),
    
  getDeviceBrands: () => 
    api.get<DeviceBrand[]>('/mobile/getDeviceBrands'),
    
  getSocs: () => 
    api.get<Soc[]>('/mobile/getSocs'),
    
  getPerformanceScales: () => 
    api.get<PerformanceScale[]>('/mobile/getPerformanceScales'),
    
  getSearchSuggestions: (input: SearchSuggestionsInput) => 
    api.get<SearchSuggestion[]>('/mobile/getSearchSuggestions', { params: input }),
}

// Comments
export const commentsService = {
  getListingComments: (input: GetListingCommentsInput) => 
    api.get<Comment[]>('/mobile/getListingComments', { params: input }),
    
  createComment: (input: CreateCommentInput) => 
    api.post<Comment>('/mobile/createComment', input),
    
  updateComment: (input: UpdateCommentInput) => 
    api.put<Comment>('/mobile/updateComment', input),
    
  deleteComment: (input: DeleteCommentInput) => 
    api.delete<Comment>('/mobile/deleteComment', { params: input }),
}

// Votes
export const votesService = {
  voteListing: (input: VoteListingInput) => 
    api.post<{ id: string; value: boolean }>('/mobile/voteListing', input),
    
  getUserVote: (input: GetUserVoteInput) => 
    api.get<boolean | null>('/mobile/getUserVote', { params: input }),
}

// User
export const userService = {
  getUserProfile: (input: GetUserProfileInput) => 
    api.get<UserProfile | null>('/mobile/getUserProfile', { params: input }),
    
  getUserListings: (input: GetUserListingsInput) => 
    api.get<Listing[]>('/mobile/getUserListings', { params: input }),
    
  updateProfile: (input: UpdateProfileInput) => 
    api.put<User>('/mobile/updateProfile', input),
    
  getUserPreferences: () => 
    api.get<UserPreferences>('/mobile/getUserPreferences'),
}

// User Preferences
export const preferencesService = {
  updateUserPreferences: (input: UpdateUserPreferencesInput) => 
    api.put<UserPreferences>('/mobile/updateUserPreferences', input),
    
  addDevicePreference: (input: AddDevicePreferenceInput) => 
    api.post<DevicePreference>('/mobile/addDevicePreference', input),
    
  removeDevicePreference: (input: RemoveDevicePreferenceInput) => 
    api.delete<{ success: boolean }>('/mobile/removeDevicePreference', { params: input }),
    
  bulkUpdateDevicePreferences: (input: BulkUpdateDevicePreferencesInput) => 
    api.put<DevicePreference[]>('/mobile/bulkUpdateDevicePreferences', input),
    
  bulkUpdateSocPreferences: (input: BulkUpdateSocPreferencesInput) => 
    api.put<SocPreference[]>('/mobile/bulkUpdateSocPreferences', input),
}

// Notifications
export const notificationsService = {
  getNotifications: (input: GetNotificationsInput) => 
    api.get<GetNotificationsResponse>('/mobile/getNotifications', { params: input }),
    
  getUnreadNotificationCount: () => 
    api.get<number>('/mobile/getUnreadNotificationCount'),
    
  markNotificationAsRead: (input: MarkNotificationReadInput) => 
    api.post<{ success: boolean }>('/mobile/markNotificationAsRead', input),
    
  markAllNotificationsAsRead: () => 
    api.post<{ success: boolean }>('/mobile/markAllNotificationsAsRead'),
}

// Verified Developers
export const verificationService = {
  getMyVerifiedEmulators: () => 
    api.get<Emulator[]>('/mobile/getMyVerifiedEmulators'),
    
  isVerifiedDeveloper: (input: IsVerifiedDeveloperInput) => 
    api.get<boolean>('/mobile/isVerifiedDeveloper', { params: input }),
    
  verifyListing: (input: VerifyListingInput) => 
    api.post<ListingVerification>('/mobile/verifyListing', input),
    
  removeVerification: (input: RemoveVerificationInput) => 
    api.delete<{ message: string }>('/mobile/removeVerification', { params: input }),
    
  getListingVerifications: (input: GetListingVerificationsInput) => 
    api.get<ListingVerification[]>('/mobile/getListingVerifications', { params: input }),
    
  getMyVerifications: (input: GetMyVerificationsInput) => 
    api.get<GetMyVerificationsResponse>('/mobile/getMyVerifications', { params: input }),
}

// Trust System
export const trustService = {
  getTrustLevels: () => 
    api.get<TrustLevel[]>('/mobile/getTrustLevels'),
}