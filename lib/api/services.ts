import { api } from './http'
import type {
  AddDevicePreferenceInput,
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
  System,
  TrustLevel,
  User,
  UserPreferences,
  UserProfile,
} from '@/types'

// Listings
export const listingsService = {
  getListings: (input: GetListingsInput) => 
    api.get<GetListingsResponse>('/trpc/mobile.getListings', { params: { input: JSON.stringify({ json: input }) } }),
    
  getFeaturedListings: () => 
    api.get<Listing[]>('/trpc/mobile.getFeaturedListings'),
    
  getListingsByGame: (input: GetListingsByGameInput) => 
    api.get<Listing[]>('/trpc/mobile.getListingsByGame', { params: { input: JSON.stringify({ json: input }) } }),
    
  getListingById: (input: GetListingByIdInput) => 
    api.get<Listing | null>('/trpc/mobile.getListingById', { params: { input: JSON.stringify({ json: input }) } }),
    
  createListing: (input: CreateListingInput) => 
    api.post<Listing>('/trpc/mobile.createListing', { json: input }),
    
  updateListing: (input: UpdateListingInput) => 
    api.post<Listing>('/trpc/mobile.updateListing', { json: input }),
    
  deleteListing: (input: DeleteListingInput) => 
    api.post<Listing>('/trpc/mobile.deleteListing', { json: input }),
}

// Games
export const gamesService = {
  getGames: (input: GetGamesInput) => 
    api.get<Game[]>('/trpc/mobile.getGames', { params: { input: JSON.stringify({ json: input }) } }),
    
  getPopularGames: () => 
    api.get<Game[]>('/trpc/mobile.getPopularGames'),
    
  searchGames: (input: SearchGamesInput) => 
    api.get<Game[]>('/trpc/mobile.searchGames', { params: { input: JSON.stringify({ json: input }) } }),
    
  getGameById: (input: GetGameByIdInput) => 
    api.get<Game | null>('/trpc/mobile.getGameById', { params: { input: JSON.stringify({ json: input }) } }),
}

// App Info
export const appService = {
  getAppStats: () => 
    api.get<AppStats>('/trpc/mobile.getAppStats'),
    
  getSystems: () => 
    api.get<System[]>('/trpc/mobile.getSystems'),
    
  getEmulators: (input: GetEmulatorsInput) => 
    api.get<Emulator[]>('/trpc/mobile.getEmulators', { params: { input: JSON.stringify({ json: input }) } }),
    
  getDevices: (input: GetDevicesInput) => 
    api.get<Device[]>('/trpc/mobile.getDevices', { params: { input: JSON.stringify({ json: input }) } }),
    
  getDeviceBrands: () => 
    api.get<DeviceBrand[]>('/trpc/mobile.getDeviceBrands'),
    
  getSocs: () => 
    api.get<Soc[]>('/trpc/mobile.getSocs'),
    
  getPerformanceScales: () => 
    api.get<PerformanceScale[]>('/trpc/mobile.getPerformanceScales'),
    
  getSearchSuggestions: (input: SearchSuggestionsInput) => 
    api.get<SearchSuggestion[]>('/trpc/mobile.getSearchSuggestions', { params: { input: JSON.stringify({ json: input }) } }),
}

// Comments
export const commentsService = {
  getListingComments: (input: GetListingCommentsInput) => 
    api.get<Comment[]>('/trpc/mobile.getListingComments', { params: { input: JSON.stringify({ json: input }) } }),
    
  createComment: (input: CreateCommentInput) => 
    api.post<Comment>('/trpc/mobile.createComment', { json: input }),
    
  updateComment: (input: UpdateCommentInput) => 
    api.post<Comment>('/trpc/mobile.updateComment', { json: input }),
    
  deleteComment: (input: DeleteCommentInput) => 
    api.post<Comment>('/trpc/mobile.deleteComment', { json: input }),
}

// Votes
export const votesService = {
  voteListing: (input: VoteListingInput) => 
    api.post<{ id: string; value: boolean }>('/trpc/mobile.voteListing', { json: input }),
    
  getUserVote: (input: GetUserVoteInput) => 
    api.get<boolean | null>('/trpc/mobile.getUserVote', { params: { input: JSON.stringify({ json: input }) } }),
}

// User
export const userService = {
  getUserProfile: (input: GetUserProfileInput) => 
    api.get<UserProfile | null>('/trpc/mobile.getUserProfile', { params: { input: JSON.stringify({ json: input }) } }),
    
  getUserListings: (input: GetUserListingsInput) => 
    api.get<Listing[]>('/trpc/mobile.getUserListings', { params: { input: JSON.stringify({ json: input }) } }),
    
  updateProfile: (input: UpdateProfileInput) => 
    api.post<User>('/trpc/mobile.updateProfile', { json: input }),
    
  getUserPreferences: () => 
    api.get<UserPreferences>('/trpc/mobile.getUserPreferences'),
}

// User Preferences
export const preferencesService = {
  updateUserPreferences: (input: UpdateUserPreferencesInput) => 
    api.post<UserPreferences>('/trpc/mobile.updateUserPreferences', { json: input }),
    
  addDevicePreference: (input: AddDevicePreferenceInput) => 
    api.post<DevicePreference>('/trpc/mobile.addDevicePreference', { json: input }),
    
  removeDevicePreference: (input: RemoveDevicePreferenceInput) => 
    api.post<{ success: boolean }>('/trpc/mobile.removeDevicePreference', { json: input }),
    
}

// Notifications
export const notificationsService = {
  getNotifications: (input: GetNotificationsInput) => 
    api.get<GetNotificationsResponse>('/trpc/mobile.getNotifications', { params: { input: JSON.stringify({ json: input }) } }),
    
  getUnreadNotificationCount: () => 
    api.get<number>('/trpc/mobile.getUnreadNotificationCount'),
    
  markNotificationAsRead: (input: MarkNotificationReadInput) => 
    api.post<{ success: boolean }>('/trpc/mobile.markNotificationAsRead', { json: input }),
    
  markAllNotificationsAsRead: () => 
    api.post<{ success: boolean }>('/trpc/mobile.markAllNotificationsAsRead', { json: {} }),
}

// Verified Developers
export const verificationService = {
  getMyVerifiedEmulators: () => 
    api.get<Emulator[]>('/trpc/mobile.getMyVerifiedEmulators'),
    
  isVerifiedDeveloper: (input: IsVerifiedDeveloperInput) => 
    api.get<boolean>('/trpc/mobile.isVerifiedDeveloper', { params: { input: JSON.stringify({ json: input }) } }),
    
  verifyListing: (input: VerifyListingInput) => 
    api.post<ListingVerification>('/trpc/mobile.verifyListing', { json: input }),
    
  removeVerification: (input: RemoveVerificationInput) => 
    api.post<{ message: string }>('/trpc/mobile.removeVerification', { json: input }),
    
  getListingVerifications: (input: GetListingVerificationsInput) => 
    api.get<ListingVerification[]>('/trpc/mobile.getListingVerifications', { params: { input: JSON.stringify({ json: input }) } }),
    
  getMyVerifications: (input: GetMyVerificationsInput) => 
    api.get<GetMyVerificationsResponse>('/trpc/mobile.getMyVerifications', { params: { input: JSON.stringify({ json: input }) } }),
}

// Trust System
export const trustService = {
  getTrustLevels: () => 
    api.get<TrustLevel[]>('/trpc/mobile.getTrustLevels'),
}