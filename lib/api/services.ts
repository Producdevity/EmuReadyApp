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
    
  getUserListings: (input: GetUserListingsInput) => 
    api.get<Listing[]>('/trpc/mobile.getUserListings', { params: { input: JSON.stringify({ json: input }) } }),
    
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
    
  findSwitchTitleId: (input: { gameName: string }) => 
    api.get<string[]>('/trpc/mobile.games.findSwitchTitleId', { params: { input: JSON.stringify({ json: input }) } }),
    
  getBestSwitchTitleId: (input: { gameName: string }) => 
    api.get<string | null>('/trpc/mobile.games.getBestSwitchTitleId', { params: { input: JSON.stringify({ json: input }) } }),
    
  getSwitchGamesStats: () => 
    api.get<{ totalGames: number; lastUpdated: string }>('/trpc/mobile.games.getSwitchGamesStats'),
}

// App Info  
export const appService = {
  getAppStats: () => 
    api.get<AppStats>('/trpc/mobile.getAppStats'),
    
  getSystems: () => 
    api.get<System[]>('/trpc/mobile.getSystems'),
    
  getPerformanceScales: () => 
    api.get<PerformanceScale[]>('/trpc/mobile.getPerformanceScales'),
    
  getSearchSuggestions: (input: SearchSuggestionsInput) => 
    api.get<SearchSuggestion[]>('/trpc/mobile.getSearchSuggestions', { params: { input: JSON.stringify({ json: input }) } }),
    
  getTrustLevels: () => 
    api.get<TrustLevel[]>('/trpc/mobile.getTrustLevels'),
    
  getEmulators: (input: GetEmulatorsInput) => 
    api.get<Emulator[]>('/trpc/mobile.getEmulators', { params: { input: JSON.stringify({ json: input }) } }),
    
  getDevices: (input: GetDevicesInput) => 
    api.get<Device[]>('/trpc/mobile.getDevices', { params: { input: JSON.stringify({ json: input }) } }),
    
  getDeviceBrands: () => 
    api.get<DeviceBrand[]>('/trpc/mobile.getDeviceBrands'),
    
  getSocs: () => 
    api.get<Soc[]>('/trpc/mobile.getSocs'),
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
  getUserById: (input: { id: string }) => 
    api.get<User | null>('/trpc/mobile.getUserById', { params: { input: JSON.stringify({ json: input }) } }),
}

// User Preferences
export const preferencesService = {
  getUserPreferences: () => 
    api.get<UserPreferences>('/trpc/mobile.getUserPreferences'),
    
  updateUserPreferences: (input: UpdateUserPreferencesInput) => 
    api.post<UserPreferences>('/trpc/mobile.updateUserPreferences', { json: input }),
    
  addDevicePreference: (input: AddDevicePreferenceInput) => 
    api.post<DevicePreference>('/trpc/mobile.preferences.addDevicePreference', { json: input }),
    
  removeDevicePreference: (input: RemoveDevicePreferenceInput) => 
    api.post<{ success: boolean }>('/trpc/mobile.preferences.removeDevicePreference', { json: input }),
    
  bulkUpdateDevicePreferences: (input: { preferences: { deviceId: string; preferred: boolean }[] }) => 
    api.post<UserPreferences>('/trpc/mobile.preferences.bulkUpdateDevicePreferences', { json: input }),
    
  bulkUpdateSocPreferences: (input: { preferences: { socId: string; preferred: boolean }[] }) => 
    api.post<UserPreferences>('/trpc/mobile.preferences.bulkUpdateSocPreferences', { json: input }),
    
  getUserProfile: (input?: GetUserProfileInput) => 
    api.get<UserProfile | null>('/trpc/mobile.preferences.getUserProfile', { params: input ? { input: JSON.stringify({ json: input }) } : {} }),
    
  updateProfile: (input: UpdateProfileInput) => 
    api.post<User>('/trpc/mobile.preferences.updateProfile', { json: input }),
}

// Notifications
export const notificationsService = {
  getNotifications: (input: GetNotificationsInput) => 
    api.get<GetNotificationsResponse>('/trpc/mobile.notifications.getNotifications', { params: { input: JSON.stringify({ json: input }) } }),
    
  getUnreadNotificationCount: () => 
    api.get<number>('/trpc/mobile.notifications.getUnreadNotificationCount'),
    
  markNotificationAsRead: (input: MarkNotificationReadInput) => 
    api.post<{ success: boolean }>('/trpc/mobile.notifications.markNotificationAsRead', { json: input }),
    
  markAllNotificationsAsRead: () => 
    api.post<{ success: boolean }>('/trpc/mobile.notifications.markAllNotificationsAsRead', { json: {} }),
}

// Verified Developers
export const developersService = {
  getMyVerifiedEmulators: () => 
    api.get<Emulator[]>('/trpc/mobile.developers.getMyVerifiedEmulators'),
    
  isVerifiedDeveloper: (input: IsVerifiedDeveloperInput) => 
    api.get<boolean>('/trpc/mobile.developers.isVerifiedDeveloper', { params: { input: JSON.stringify({ json: input }) } }),
    
  verifyListing: (input: VerifyListingInput) => 
    api.post<ListingVerification>('/trpc/mobile.developers.verifyListing', { json: input }),
    
  removeVerification: (input: RemoveVerificationInput) => 
    api.post<{ message: string }>('/trpc/mobile.developers.removeVerification', { json: input }),
    
  getListingVerifications: (input: GetListingVerificationsInput) => 
    api.get<ListingVerification[]>('/trpc/mobile.developers.getListingVerifications', { params: { input: JSON.stringify({ json: input }) } }),
    
  getMyVerifications: (input: GetMyVerificationsInput) => 
    api.get<GetMyVerificationsResponse>('/trpc/mobile.developers.getMyVerifications', { params: { input: JSON.stringify({ json: input }) } }),
}

// Trust System
export const trustService = {
  getMyTrustInfo: () => 
    api.get<{ score: number; level: string }>('/trpc/mobile.trust.getMyTrustInfo'),
    
  getUserTrustInfo: (input: { userId: string }) => 
    api.get<{ score: number; level: string }>('/trpc/mobile.trust.getUserTrustInfo', { params: { input: JSON.stringify({ json: input }) } }),
    
  getTrustLevels: () => 
    api.get<TrustLevel[]>('/trpc/mobile.trust.getTrustLevels'),
}

// PC Listings (New Feature)
export const pcListingsService = {
  getPcListings: (input?: { page?: number; limit?: number; search?: string; gameId?: string; cpuId?: string; gpuId?: string }) => 
    api.get<{ listings: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/trpc/mobile.pcListings.getPcListings', { params: input ? { input: JSON.stringify({ json: input }) } : {} }),
    
  createPcListing: (input: { gameId: string; cpuId: string; gpuId: string; performanceId: string; notes?: string; fps?: number; resolution?: string; settings?: string }) => 
    api.post<any>('/trpc/mobile.pcListings.createPcListing', { json: input }),
    
  updatePcListing: (input: { id: string; gameId?: string; cpuId?: string; gpuId?: string; performanceId?: string; notes?: string; fps?: number; resolution?: string; settings?: string }) => 
    api.post<any>('/trpc/mobile.pcListings.updatePcListing', { json: input }),
    
  deletePcListing: (input: { id: string }) => 
    api.post<{ success: boolean }>('/trpc/mobile.pcListings.delete', { json: input }),
    
  getPcListingById: (input: { id: string }) => 
    api.get<any>('/trpc/mobile.pcListings.get', { params: { input: JSON.stringify({ json: input }) } }),
    
  getCpusForMobile: () => 
    api.get<any[]>('/trpc/mobile.pcListings.getCpus'),
    
  getGpusForMobile: () => 
    api.get<any[]>('/trpc/mobile.pcListings.getGpus'),
}

// Enhanced Hardware Services
export const cpusService = {
  getCpus: (input?: { search?: string; page?: number; limit?: number; manufacturer?: string }) => 
    api.get<{ cpus: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/trpc/mobile.cpus.get', { params: input ? { input: JSON.stringify({ json: input }) } : {} }),
    
  getCpuById: (input: { id: string }) => 
    api.get<any>('/trpc/mobile.cpus.getById', { params: { input: JSON.stringify({ json: input }) } }),
}

export const gpusService = {
  getGpus: (input?: { search?: string; page?: number; limit?: number; manufacturer?: string }) => 
    api.get<{ gpus: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/trpc/mobile.gpus.get', { params: input ? { input: JSON.stringify({ json: input }) } : {} }),
    
  getGpuById: (input: { id: string }) => 
    api.get<any>('/trpc/mobile.gpus.getById', { params: { input: JSON.stringify({ json: input }) } }),
}

// Content Safety
export const listingReportsService = {
  createReport: (input: { listingId: string; reason: string; description?: string }) => 
    api.post<{ success: boolean; message: string }>('/trpc/mobile.listingReports.create', { json: input }),
    
  checkUserHasReports: () => 
    api.get<{ hasReports: boolean; reportCount: number }>('/trpc/mobile.listingReports.checkUserHasReports'),
}

// RAWG Game Database
export const rawgService = {
  searchGames: (input: { query: string; page?: number; pageSize?: number }) => 
    api.get<any>('/trpc/mobile.rawg.searchGames', { params: { input: JSON.stringify({ json: input }) } }),
    
  searchGameImages: (input: { query: string; page?: number; pageSize?: number }) => 
    api.get<any>('/trpc/mobile.rawg.searchGameImages', { params: { input: JSON.stringify({ json: input }) } }),
    
  getGameImages: (input: { gameId: string }) => 
    api.get<any>('/trpc/mobile.rawg.getGameImages', { params: { input: JSON.stringify({ json: input }) } }),
}

// The Games Database (TGDB)
export const tgdbService = {
  searchGames: (input: { name: string; platform?: string }) => 
    api.get<any>('/trpc/mobile.tgdb.searchGames', { params: { input: JSON.stringify({ json: input }) } }),
    
  searchGameImages: (input: { name: string; platform?: string }) => 
    api.get<any>('/trpc/mobile.tgdb.searchGameImages', { params: { input: JSON.stringify({ json: input }) } }),
    
  getGameImages: (input: { gameId: string }) => 
    api.get<any>('/trpc/mobile.tgdb.getGameImages', { params: { input: JSON.stringify({ json: input }) } }),
    
  getGameImageUrls: (input: { gameId: string }) => 
    api.get<any>('/trpc/mobile.tgdb.getGameImageUrls', { params: { input: JSON.stringify({ json: input }) } }),
    
  getPlatforms: () => 
    api.get<any>('/trpc/mobile.tgdb.getPlatforms'),
}