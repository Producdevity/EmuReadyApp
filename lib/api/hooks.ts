import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query'
import {
  listingsService,
  gamesService,
  appService,
  commentsService,
  votesService,
  userService,
  preferencesService,
  notificationsService,
  verificationService,
  trustService,
} from './services'
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
  SocPreference,
  System,
  TrustLevel,
  User,
  UserPreferences,
  UserProfile,
} from '@/types'

// Query Keys
export const queryKeys = {
  // Listings
  listings: (params?: GetListingsInput) => ['listings', params] as const,
  featuredListings: () => ['listings', 'featured'] as const,
  listingsByGame: (params: GetListingsByGameInput) => ['listings', 'byGame', params] as const,
  listingById: (id: string) => ['listings', id] as const,
  
  // Games
  games: (params?: GetGamesInput) => ['games', params] as const,
  popularGames: () => ['games', 'popular'] as const,
  searchGames: (params: SearchGamesInput) => ['games', 'search', params] as const,
  gameById: (id: string) => ['games', id] as const,
  
  // App Info
  appStats: () => ['app', 'stats'] as const,
  systems: () => ['app', 'systems'] as const,
  emulators: (params?: GetEmulatorsInput) => ['app', 'emulators', params] as const,
  devices: (params?: GetDevicesInput) => ['app', 'devices', params] as const,
  deviceBrands: () => ['app', 'deviceBrands'] as const,
  socs: () => ['app', 'socs'] as const,
  performanceScales: () => ['app', 'performanceScales'] as const,
  searchSuggestions: (params: SearchSuggestionsInput) => ['app', 'searchSuggestions', params] as const,
  
  // Comments
  listingComments: (params: GetListingCommentsInput) => ['comments', 'listing', params] as const,
  
  // Votes
  userVote: (params: GetUserVoteInput) => ['votes', 'user', params] as const,
  
  // User
  userProfile: (params: GetUserProfileInput) => ['user', 'profile', params] as const,
  userListings: (params: GetUserListingsInput) => ['user', 'listings', params] as const,
  userPreferences: () => ['user', 'preferences'] as const,
  
  // Notifications
  notifications: (params?: GetNotificationsInput) => ['notifications', params] as const,
  unreadNotificationCount: () => ['notifications', 'unreadCount'] as const,
  
  // Verifications
  myVerifiedEmulators: () => ['verifications', 'myEmulators'] as const,
  isVerifiedDeveloper: (params: IsVerifiedDeveloperInput) => ['verifications', 'isDeveloper', params] as const,
  listingVerifications: (params: GetListingVerificationsInput) => ['verifications', 'listing', params] as const,
  myVerifications: (params?: GetMyVerificationsInput) => ['verifications', 'my', params] as const,
  
  // Trust
  trustLevels: () => ['trust', 'levels'] as const,
}

// Listings Hooks
export const useListings = (
  input?: GetListingsInput,
  options?: Omit<UseQueryOptions<GetListingsResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.listings(input),
    queryFn: () => listingsService.getListings(input || {}),
    ...options,
  })
}

export const useFeaturedListings = (options?: Omit<UseQueryOptions<Listing[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.featuredListings(),
    queryFn: listingsService.getFeaturedListings,
    ...options,
  })
}

export const useListingsByGame = (
  input: GetListingsByGameInput,
  options?: Omit<UseQueryOptions<Listing[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.listingsByGame(input),
    queryFn: () => listingsService.getListingsByGame(input),
    ...options,
  })
}

export const useListingById = (
  input: GetListingByIdInput,
  options?: Omit<UseQueryOptions<Listing | null, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.listingById(input.id),
    queryFn: () => listingsService.getListingById(input),
    ...options,
  })
}

export const useCreateListing = (
  options?: UseMutationOptions<Listing, Error, CreateListingInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: listingsService.createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    ...options,
  })
}

export const useUpdateListing = (
  options?: UseMutationOptions<Listing, Error, UpdateListingInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: listingsService.updateListing,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.setQueryData(queryKeys.listingById(data.id), data)
    },
    ...options,
  })
}

export const useDeleteListing = (
  options?: UseMutationOptions<Listing, Error, DeleteListingInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: listingsService.deleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    ...options,
  })
}

// Games Hooks
export const useGames = (
  input?: GetGamesInput,
  options?: Omit<UseQueryOptions<Game[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.games(input),
    queryFn: () => gamesService.getGames(input || {}),
    ...options,
  })
}

export const usePopularGames = (options?: Omit<UseQueryOptions<Game[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.popularGames(),
    queryFn: gamesService.getPopularGames,
    ...options,
  })
}

export const useSearchGames = (
  input: SearchGamesInput,
  options?: Omit<UseQueryOptions<Game[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.searchGames(input),
    queryFn: () => gamesService.searchGames(input),
    enabled: !!input.query,
    ...options,
  })
}

export const useGameById = (
  input: GetGameByIdInput,
  options?: Omit<UseQueryOptions<Game | null, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.gameById(input.id),
    queryFn: () => gamesService.getGameById(input),
    ...options,
  })
}

// App Info Hooks
export const useAppStats = (options?: Omit<UseQueryOptions<AppStats, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.appStats(),
    queryFn: appService.getAppStats,
    ...options,
  })
}

export const useSystems = (options?: Omit<UseQueryOptions<System[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.systems(),
    queryFn: appService.getSystems,
    ...options,
  })
}

export const useEmulators = (
  input?: GetEmulatorsInput,
  options?: Omit<UseQueryOptions<Emulator[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.emulators(input),
    queryFn: () => appService.getEmulators(input || {}),
    ...options,
  })
}

export const useDevices = (
  input?: GetDevicesInput,
  options?: Omit<UseQueryOptions<Device[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.devices(input),
    queryFn: () => appService.getDevices(input || {}),
    ...options,
  })
}

export const useDeviceBrands = (options?: Omit<UseQueryOptions<DeviceBrand[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.deviceBrands(),
    queryFn: appService.getDeviceBrands,
    ...options,
  })
}

export const useSocs = (options?: Omit<UseQueryOptions<Soc[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.socs(),
    queryFn: appService.getSocs,
    ...options,
  })
}

export const usePerformanceScales = (options?: Omit<UseQueryOptions<PerformanceScale[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.performanceScales(),
    queryFn: appService.getPerformanceScales,
    ...options,
  })
}

export const useSearchSuggestions = (
  input: SearchSuggestionsInput,
  options?: Omit<UseQueryOptions<SearchSuggestion[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.searchSuggestions(input),
    queryFn: () => appService.getSearchSuggestions(input),
    enabled: !!input.query,
    ...options,
  })
}

// Comments Hooks
export const useListingComments = (
  input: GetListingCommentsInput,
  options?: Omit<UseQueryOptions<Comment[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.listingComments(input),
    queryFn: () => commentsService.getListingComments(input),
    ...options,
  })
}

export const useCreateComment = (
  options?: UseMutationOptions<Comment, Error, CreateCommentInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: commentsService.createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
    ...options,
  })
}

export const useUpdateComment = (
  options?: UseMutationOptions<Comment, Error, UpdateCommentInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: commentsService.updateComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
    ...options,
  })
}

export const useDeleteComment = (
  options?: UseMutationOptions<Comment, Error, DeleteCommentInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: commentsService.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
    ...options,
  })
}

// Votes Hooks
export const useVoteListing = (
  options?: UseMutationOptions<{ id: string; value: boolean }, Error, VoteListingInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: votesService.voteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    ...options,
  })
}

export const useUserVote = (
  input: GetUserVoteInput,
  options?: Omit<UseQueryOptions<boolean | null, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.userVote(input),
    queryFn: () => votesService.getUserVote(input),
    ...options,
  })
}

// User Hooks
export const useUserProfile = (
  input: GetUserProfileInput,
  options?: Omit<UseQueryOptions<UserProfile | null>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.userProfile(input),
    queryFn: () => userService.getUserProfile(input),
    ...options,
  })
}

export const useUserListings = (
  input: GetUserListingsInput,
  options?: Omit<UseQueryOptions<Listing[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.userListings(input),
    queryFn: () => userService.getUserListings(input),
    ...options,
  })
}

export const useUpdateProfile = (
  options?: UseMutationOptions<User, Error, UpdateProfileInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    ...options,
  })
}

export const useUserPreferences = (options?: Omit<UseQueryOptions<UserPreferences, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.userPreferences(),
    queryFn: userService.getUserPreferences,
    ...options,
  })
}

// Preferences Hooks
export const useUpdateUserPreferences = (
  options?: UseMutationOptions<UserPreferences, Error, UpdateUserPreferencesInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: preferencesService.updateUserPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userPreferences() })
    },
    ...options,
  })
}

export const useAddDevicePreference = (
  options?: UseMutationOptions<DevicePreference, Error, AddDevicePreferenceInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: preferencesService.addDevicePreference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userPreferences() })
    },
    ...options,
  })
}

export const useRemoveDevicePreference = (
  options?: UseMutationOptions<{ success: boolean }, Error, RemoveDevicePreferenceInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: preferencesService.removeDevicePreference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userPreferences() })
    },
    ...options,
  })
}

// Notifications Hooks
export const useNotifications = (
  input?: GetNotificationsInput,
  options?: Omit<UseQueryOptions<GetNotificationsResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.notifications(input),
    queryFn: () => notificationsService.getNotifications(input || {}),
    ...options,
  })
}

export const useUnreadNotificationCount = (options?: Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.unreadNotificationCount(),
    queryFn: notificationsService.getUnreadNotificationCount,
    ...options,
  })
}

export const useMarkNotificationAsRead = (
  options?: UseMutationOptions<{ success: boolean }, Error, MarkNotificationReadInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationsService.markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    ...options,
  })
}

export const useMarkAllNotificationsAsRead = (
  options?: UseMutationOptions<{ success: boolean }, Error, void>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationsService.markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    ...options,
  })
}

// Verification Hooks
export const useMyVerifiedEmulators = (options?: Omit<UseQueryOptions<Emulator[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.myVerifiedEmulators(),
    queryFn: verificationService.getMyVerifiedEmulators,
    ...options,
  })
}

export const useIsVerifiedDeveloper = (
  input: IsVerifiedDeveloperInput,
  options?: Omit<UseQueryOptions<boolean, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.isVerifiedDeveloper(input),
    queryFn: () => verificationService.isVerifiedDeveloper(input),
    ...options,
  })
}

export const useVerifyListing = (
  options?: UseMutationOptions<ListingVerification, Error, VerifyListingInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: verificationService.verifyListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verifications'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    ...options,
  })
}

export const useRemoveVerification = (
  options?: UseMutationOptions<{ message: string }, Error, RemoveVerificationInput>
) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: verificationService.removeVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verifications'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    ...options,
  })
}

export const useListingVerifications = (
  input: GetListingVerificationsInput,
  options?: Omit<UseQueryOptions<ListingVerification[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.listingVerifications(input),
    queryFn: () => verificationService.getListingVerifications(input),
    ...options,
  })
}

export const useMyVerifications = (
  input?: GetMyVerificationsInput,
  options?: Omit<UseQueryOptions<GetMyVerificationsResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.myVerifications(input),
    queryFn: () => verificationService.getMyVerifications(input || {}),
    ...options,
  })
}

// Trust Hooks
export const useTrustLevels = (options?: Omit<UseQueryOptions<TrustLevel[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.trustLevels(),
    queryFn: trustService.getTrustLevels,
    ...options,
  })
}