import type {
  AddDevicePreferenceInput,
  AppStats,
  Comment,
  CreateCommentInput,
  CreateListingInput,
  DeleteCommentInput,
  DeleteListingInput,
  Device,
  DeviceBrand,
  DevicePreference,
  Emulator,
  Game,
  GetDevicesInput,
  GetEmulatorsInput,
  GetGameByIdInput,
  GetGamesInput,
  GetListingByIdInput,
  GetListingCommentsInput,
  GetListingVerificationsInput,
  GetListingsByGameInput,
  GetListingsInput,
  GetListingsResponse,
  GetMyVerificationsInput,
  GetMyVerificationsResponse,
  GetNotificationsInput,
  GetNotificationsResponse,
  GetUserListingsInput,
  GetUserProfileInput,
  GetUserVoteInput,
  IsVerifiedDeveloperInput,
  Listing,
  ListingVerification,
  MarkNotificationReadInput,
  PerformanceScale,
  RemoveDevicePreferenceInput,
  RemoveVerificationInput,
  SearchGamesInput,
  SearchSuggestion,
  SearchSuggestionsInput,
  Soc,
  System,
  TrustLevel,
  UpdateCommentInput,
  UpdateListingInput,
  UpdateProfileInput,
  UpdateUserPreferencesInput,
  User,
  UserPreferences,
  UserProfile,
  VerifyListingInput,
  VoteListingInput,
} from '@/types'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseInfiniteQueryOptions,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  appService,
  commentsService,
  cpusService,
  developersService,
  gamesService,
  gpusService,
  listingReportsService,
  listingsService,
  notificationsService,
  pcListingsService,
  preferencesService,
  rawgService,
  tgdbService,
  trustService,
  userService,
  votesService,
} from './services'

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
  searchSuggestions: (params: SearchSuggestionsInput) =>
    ['app', 'searchSuggestions', params] as const,

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
  isVerifiedDeveloper: (params: IsVerifiedDeveloperInput) =>
    ['verifications', 'isDeveloper', params] as const,
  listingVerifications: (params: GetListingVerificationsInput) =>
    ['verifications', 'listing', params] as const,
  myVerifications: (params?: GetMyVerificationsInput) => ['verifications', 'my', params] as const,

  // Trust
  trustLevels: () => ['trust', 'levels'] as const,
}

// Listings Hooks
export const useListings = (
  input?: GetListingsInput,
  options?: Omit<UseQueryOptions<GetListingsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.listings(input),
    queryFn: () => listingsService.getListings(input || {}),
    ...options,
  })
}

export const useInfiniteListings = (
  input?: Omit<GetListingsInput, 'page'>,
  options?: Partial<UseInfiniteQueryOptions<GetListingsResponse, Error>>,
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.listings(input),
    queryFn: ({ pageParam }) => listingsService.getListings({ ...input, page: pageParam as number }),
    getNextPageParam: (lastPage: GetListingsResponse) => {
      return lastPage.pagination.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined
    },
    initialPageParam: 1,
    ...options,
  })
}

export const useFeaturedListings = (
  options?: Omit<UseQueryOptions<Listing[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.featuredListings(),
    queryFn: listingsService.getFeaturedListings,
    ...options,
  })
}

export const useListingsByGame = (
  input: GetListingsByGameInput,
  options?: Omit<UseQueryOptions<Listing[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.listingsByGame(input),
    queryFn: () => listingsService.getListingsByGame(input),
    ...options,
  })
}

export const useListingById = (
  input: GetListingByIdInput,
  options?: Omit<UseQueryOptions<Listing | null, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.listingById(input.id),
    queryFn: () => listingsService.getListingById(input),
    ...options,
  })
}

export const useCreateListing = (
  options?: UseMutationOptions<Listing, Error, CreateListingInput>,
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
  options?: UseMutationOptions<Listing, Error, UpdateListingInput>,
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
  options?: UseMutationOptions<Listing, Error, DeleteListingInput>,
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
  options?: Omit<UseQueryOptions<Game[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.games(input),
    queryFn: () => gamesService.getGames(input || {}),
    ...options,
  })
}

export const usePopularGames = (
  options?: Omit<UseQueryOptions<Game[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.popularGames(),
    queryFn: gamesService.getPopularGames,
    ...options,
  })
}

export const useSearchGames = (
  input: SearchGamesInput,
  options?: Omit<UseQueryOptions<Game[], Error>, 'queryKey' | 'queryFn'>,
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
  options?: Omit<UseQueryOptions<Game | null, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.gameById(input.id),
    queryFn: () => gamesService.getGameById(input),
    ...options,
  })
}

// General Info Hooks
export const useAppStats = (
  options?: Omit<UseQueryOptions<AppStats, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.appStats(),
    queryFn: appService.getAppStats,
    ...options,
  })
}

export const useSystems = (
  options?: Omit<UseQueryOptions<System[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.systems(),
    queryFn: appService.getSystems,
    ...options,
  })
}

export const usePerformanceScales = (
  options?: Omit<UseQueryOptions<PerformanceScale[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.performanceScales(),
    queryFn: appService.getPerformanceScales,
    ...options,
  })
}

export const useSearchSuggestions = (
  input: SearchSuggestionsInput,
  options?: Omit<UseQueryOptions<SearchSuggestion[]>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.searchSuggestions(input),
    queryFn: () => appService.getSearchSuggestions(input),
    enabled: !!input.query,
    ...options,
  })
}

export const useTrustLevels = (
  options?: Omit<UseQueryOptions<TrustLevel[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.trustLevels(),
    queryFn: appService.getTrustLevels,
    ...options,
  })
}

// Devices Hooks
export const useDevices = (
  input?: GetDevicesInput,
  options?: Omit<UseQueryOptions<Device[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.devices(input),
    queryFn: () => appService.getDevices(input || {}),
    ...options,
  })
}

export const useDeviceBrands = (
  options?: Omit<UseQueryOptions<DeviceBrand[], Error>, 'queryKey' | 'queryFn'>,
) => {
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

// Emulators Hooks
export const useEmulators = (
  input?: GetEmulatorsInput,
  options?: Omit<UseQueryOptions<Emulator[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.emulators(input),
    queryFn: () => appService.getEmulators(input || {}),
    ...options,
  })
}

// Note: getEmulatorById method doesn't exist in appService, this hook is removed

// Comments Hooks
export const useListingComments = (
  input: GetListingCommentsInput,
  options?: Omit<UseQueryOptions<Comment[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.listingComments(input),
    queryFn: () => commentsService.getListingComments(input),
    ...options,
  })
}

export const useCreateComment = (
  options?: UseMutationOptions<Comment, Error, CreateCommentInput>,
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
  options?: UseMutationOptions<Comment, Error, UpdateCommentInput>,
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
  options?: UseMutationOptions<Comment, Error, DeleteCommentInput>,
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
  options?: UseMutationOptions<{ id: string; value: boolean }, Error, VoteListingInput>,
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
  options?: Omit<UseQueryOptions<boolean | null, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.userVote(input),
    queryFn: () => votesService.getUserVote(input),
    ...options,
  })
}

// User Hooks
export const useUserById = (
  input: { id: string },
  options?: Omit<UseQueryOptions<User | null, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['users', input.id],
    queryFn: () => userService.getUserById(input),
    ...options,
  })
}

export const useUserProfile = (
  input?: GetUserProfileInput,
  options?: Omit<UseQueryOptions<UserProfile | null>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: input ? queryKeys.userProfile(input) : ['user', 'profile', 'current'],
    queryFn: () => preferencesService.getUserProfile(input),
    ...options,
  })
}

export const useUserListings = (
  input: GetUserListingsInput,
  options?: Omit<UseQueryOptions<Listing[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.userListings(input),
    queryFn: () => listingsService.getUserListings(input),
    ...options,
  })
}

export const useUpdateProfile = (options?: UseMutationOptions<User, Error, UpdateProfileInput>) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: preferencesService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    ...options,
  })
}

export const useUserPreferences = (
  options?: Omit<UseQueryOptions<UserPreferences, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.userPreferences(),
    queryFn: preferencesService.getUserPreferences,
    ...options,
  })
}

// Preferences Hooks
export const useUpdateUserPreferences = (
  options?: UseMutationOptions<UserPreferences, Error, UpdateUserPreferencesInput>,
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
  options?: UseMutationOptions<DevicePreference, Error, AddDevicePreferenceInput>,
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
  options?: UseMutationOptions<{ success: boolean }, Error, RemoveDevicePreferenceInput>,
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
  options?: Omit<UseQueryOptions<GetNotificationsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.notifications(input),
    queryFn: () => notificationsService.getNotifications(input || {}),
    ...options,
  })
}

export const useUnreadNotificationCount = (
  options?: Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.unreadNotificationCount(),
    queryFn: notificationsService.getUnreadNotificationCount,
    ...options,
  })
}

export const useMarkNotificationAsRead = (
  options?: UseMutationOptions<{ success: boolean }, Error, MarkNotificationReadInput>,
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
  options?: UseMutationOptions<{ success: boolean }, Error, void>,
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
export const useMyVerifiedEmulators = (
  options?: Omit<UseQueryOptions<Emulator[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.myVerifiedEmulators(),
    queryFn: developersService.getMyVerifiedEmulators,
    ...options,
  })
}

export const useIsVerifiedDeveloper = (
  input: IsVerifiedDeveloperInput,
  options?: Omit<UseQueryOptions<boolean, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.isVerifiedDeveloper(input),
    queryFn: () => developersService.isVerifiedDeveloper(input),
    ...options,
  })
}

export const useVerifyListing = (
  options?: UseMutationOptions<ListingVerification, Error, VerifyListingInput>,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: developersService.verifyListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verifications'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    ...options,
  })
}

export const useRemoveVerification = (
  options?: UseMutationOptions<{ message: string }, Error, RemoveVerificationInput>,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: developersService.removeVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verifications'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
    ...options,
  })
}

export const useListingVerifications = (
  input: GetListingVerificationsInput,
  options?: Omit<UseQueryOptions<ListingVerification[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.listingVerifications(input),
    queryFn: () => developersService.getListingVerifications(input),
    ...options,
  })
}

export const useMyVerifications = (
  input?: GetMyVerificationsInput,
  options?: Omit<UseQueryOptions<GetMyVerificationsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.myVerifications(input),
    queryFn: () => developersService.getMyVerifications(input || {}),
    ...options,
  })
}

// Trust Hooks
export const useMyTrustInfo = (
  options?: Omit<UseQueryOptions<{ score: number; level: string }, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['trust', 'my'],
    queryFn: trustService.getMyTrustInfo,
    ...options,
  })
}

export const useUserTrustInfo = (
  input: { userId: string },
  options?: Omit<UseQueryOptions<{ score: number; level: string }, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['trust', 'user', input.userId],
    queryFn: () => trustService.getUserTrustInfo(input),
    ...options,
  })
}

// PC Listings Hooks (New Feature)
export const usePcListings = (
  input?: {
    page?: number
    limit?: number
    search?: string
    gameId?: string
    cpuId?: string
    gpuId?: string
  },
  options?: Omit<
    UseQueryOptions<
      {
        listings: any[]
        pagination: { page: number; limit: number; total: number; totalPages: number }
      },
      Error
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: ['pcListings', input],
    queryFn: () => pcListingsService.getPcListings(input),
    ...options,
  })
}

export const usePcListingById = (
  input: { id: string },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['pcListings', input.id],
    queryFn: () => pcListingsService.getPcListingById(input),
    ...options,
  })
}

export const useCreatePcListing = (
  options?: UseMutationOptions<
    any,
    Error,
    {
      gameId: string
      cpuId: string
      gpuId: string
      performanceId: string
      notes?: string
      fps?: number
      resolution?: string
      settings?: string
    }
  >,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: pcListingsService.createPcListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pcListings'] })
    },
    ...options,
  })
}

export const useUpdatePcListing = (
  options?: UseMutationOptions<
    any,
    Error,
    {
      id: string
      gameId?: string
      cpuId?: string
      gpuId?: string
      performanceId?: string
      notes?: string
      fps?: number
      resolution?: string
      settings?: string
    }
  >,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: pcListingsService.updatePcListing,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pcListings'] })
      queryClient.invalidateQueries({ queryKey: ['pcListings', variables.id] })
    },
    ...options,
  })
}

export const useDeletePcListing = (
  options?: UseMutationOptions<{ success: boolean }, Error, { id: string }>,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: pcListingsService.deletePcListing,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pcListings'] })
      queryClient.removeQueries({ queryKey: ['pcListings', variables.id] })
    },
    ...options,
  })
}

export const useCpusForMobile = (
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['pcListings', 'cpus'],
    queryFn: pcListingsService.getCpusForMobile,
    ...options,
  })
}

export const useGpusForMobile = (
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['pcListings', 'gpus'],
    queryFn: pcListingsService.getGpusForMobile,
    ...options,
  })
}

// Enhanced Hardware Hooks
export const useCpus = (
  input?: { search?: string; page?: number; limit?: number; manufacturer?: string },
  options?: Omit<
    UseQueryOptions<
      {
        cpus: any[]
        pagination: { page: number; limit: number; total: number; totalPages: number }
      },
      Error
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: ['cpus', input],
    queryFn: () => cpusService.getCpus(input),
    ...options,
  })
}

export const useCpuById = (
  input: { id: string },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['cpus', input.id],
    queryFn: () => cpusService.getCpuById(input),
    ...options,
  })
}

export const useGpus = (
  input?: { search?: string; page?: number; limit?: number; manufacturer?: string },
  options?: Omit<
    UseQueryOptions<
      {
        gpus: any[]
        pagination: { page: number; limit: number; total: number; totalPages: number }
      },
      Error
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: ['gpus', input],
    queryFn: () => gpusService.getGpus(input),
    ...options,
  })
}

export const useGpuById = (
  input: { id: string },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['gpus', input.id],
    queryFn: () => gpusService.getGpuById(input),
    ...options,
  })
}

// Content Safety Hooks
export const useCreateListingReport = (
  options?: UseMutationOptions<
    { success: boolean; message: string },
    Error,
    { listingId: string; reason: string; description?: string }
  >,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: listingReportsService.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listingReports'] })
    },
    ...options,
  })
}

export const useCheckUserHasReports = (
  options?: Omit<
    UseQueryOptions<{ hasReports: boolean; reportCount: number }, Error>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: ['listingReports', 'userCheck'],
    queryFn: listingReportsService.checkUserHasReports,
    ...options,
  })
}

// RAWG Game Database Hooks
export const useRawgSearchGames = (
  input: { query: string; page?: number; pageSize?: number },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['rawg', 'searchGames', input],
    queryFn: () => rawgService.searchGames(input),
    enabled: !!input.query,
    ...options,
  })
}

export const useRawgSearchGameImages = (
  input: { query: string; page?: number; pageSize?: number },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['rawg', 'searchGameImages', input],
    queryFn: () => rawgService.searchGameImages(input),
    enabled: !!input.query,
    ...options,
  })
}

export const useRawgGameImages = (
  input: { gameId: string },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['rawg', 'gameImages', input.gameId],
    queryFn: () => rawgService.getGameImages(input),
    enabled: !!input.gameId,
    ...options,
  })
}

// TGDB Hooks
export const useTgdbSearchGames = (
  input: { name: string; platform?: string },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['tgdb', 'searchGames', input],
    queryFn: () => tgdbService.searchGames(input),
    enabled: !!input.name,
    ...options,
  })
}

export const useTgdbSearchGameImages = (
  input: { name: string; platform?: string },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['tgdb', 'searchGameImages', input],
    queryFn: () => tgdbService.searchGameImages(input),
    enabled: !!input.name,
    ...options,
  })
}

export const useTgdbGameImages = (
  input: { gameId: string },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['tgdb', 'gameImages', input.gameId],
    queryFn: () => tgdbService.getGameImages(input),
    enabled: !!input.gameId,
    ...options,
  })
}

export const useTgdbGameImageUrls = (
  input: { gameId: string },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['tgdb', 'gameImageUrls', input.gameId],
    queryFn: () => tgdbService.getGameImageUrls(input),
    enabled: !!input.gameId,
    ...options,
  })
}

export const useTgdbPlatforms = (
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['tgdb', 'platforms'],
    queryFn: tgdbService.getPlatforms,
    ...options,
  })
}
