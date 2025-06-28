import { trpc } from './client'
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
  SearchSuggestion,
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
  MarkNotificationReadInput,
} from '@/types'

/**
 * Type-safe hook wrapper that extracts data from tRPC response structure
 */
function createTypedHook<TInput, TOutput>(
  hookFn: (input?: TInput) => any
): TInput extends void 
  ? () => {
      data: TOutput | undefined
      isLoading: boolean
      error: any
      refetch: () => void
    }
  : (input: TInput) => {
      data: TOutput | undefined
      isLoading: boolean
      error: any
      refetch: () => void
    } {
  return ((input?: TInput) => {
    const result = hookFn(input)
    return {
      ...result,
      // Extract data from tRPC's nested structure: result.data.json
      data: result.data?.result?.data?.json ?? result.data,
    }
  }) as any
}

/**
 * Hook to fetch application statistics
 * This includes counts of listings, games, users, etc.
 */
export const useAppStats = createTypedHook<void, AppStats>(
  () => trpc.mobile.getAppStats.useQuery()
)

/**
 * Hook to fetch popular games with their stats
 */
export const usePopularGames = createTypedHook<void, Game[]>(
  () => trpc.mobile.getPopularGames.useQuery()
)

/**
 * Hook to fetch featured listings
 */
export const useFeaturedListings = createTypedHook<void, Listing[]>(
  () => trpc.mobile.getFeaturedListings.useQuery()
)

/**
 * Hook to fetch listings with optional filters
 */
export const useListings = createTypedHook<GetListingsInput, GetListingsResponse>(
  (params: GetListingsInput = {}) => trpc.mobile.getListings.useQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    gameId: params.gameId,
    systemId: params.systemId,
    deviceId: params.deviceId,
    emulatorId: params.emulatorId,
    search: params.search,
  })
)

/**
 * Hook to fetch a single listing by ID
 */
export function useListing(input: GetListingByIdInput) {
  const result = trpc.mobile.getListingById.useQuery(input)
  return {
    ...result,
    data: result.data?.result?.data?.json ?? result.data,
  } as {
    data: Listing | null | undefined
    isLoading: boolean
    error: any
    refetch: () => void
  }
}

/**
 * Hook to fetch comments for a listing
 */
export function useListingComments(input: GetListingCommentsInput) {
  const result = trpc.mobile.getListingComments.useQuery(input)
  return {
    ...result,
    data: result.data?.result?.data?.json ?? result.data,
  } as {
    data: Comment[] | undefined
    isLoading: boolean
    error: any
    refetch: () => void
  }
}

/**
 * Hook to fetch a single game by ID
 */
export function useGame(input: GetGameByIdInput) {
  const result = trpc.mobile.getGameById.useQuery(input)
  return {
    ...result,
    data: result.data?.result?.data?.json ?? result.data,
  } as {
    data: Game | null | undefined
    isLoading: boolean
    error: any
    refetch: () => void
  }
}

/**
 * Hook to fetch games with optional search and filters
 */
export const useGames = createTypedHook<GetGamesInput, Game[]>(
  (input: GetGamesInput = {}) => trpc.mobile.getGames.useQuery({
    search: input.search,
    systemId: input.systemId,
    limit: input.limit ?? 20,
  })
)

/**
 * Hook to fetch devices with optional search and brand filter
 */
export const useDevices = createTypedHook<GetDevicesInput, Device[]>(
  (input: GetDevicesInput = {}) => trpc.mobile.getDevices.useQuery({
    search: input.search,
    brandId: input.brandId,
    limit: input.limit ?? 50,
  })
)

/**
 * Hook to fetch emulators with optional filters
 */
export const useEmulators = createTypedHook<GetEmulatorsInput, Emulator[]>(
  (input: GetEmulatorsInput = {}) => trpc.mobile.getEmulators.useQuery({
    systemId: input.systemId,
    search: input.search,
    limit: input.limit ?? 50,
  })
)

/**
 * Hook to fetch all systems
 */
export const useSystems = createTypedHook<void, System[]>(
  () => trpc.mobile.getSystems.useQuery()
)

/**
 * Hook to fetch current authenticated user
 */
export const useMe = createTypedHook<void, User>(
  () => trpc.mobile.me.useQuery()
)

/**
 * Hook to fetch user profile (with conditional enabling)
 */
export function useUserProfile(userId?: string) {
  const result = trpc.mobile.getUserProfile.useQuery(
    { userId: userId || '' },
    { enabled: !!userId }
  )
  return {
    ...result,
    data: result.data?.result?.data?.json ?? result.data,
  } as {
    data: UserProfile | null | undefined
    isLoading: boolean
    error: any
    refetch: () => void
  }
}

/**
 * Hook to fetch user listings
 */
export function useUserListings(input: GetUserListingsInput) {
  const result = trpc.mobile.getUserListings.useQuery(input)
  return {
    ...result,
    data: result.data?.result?.data?.json ?? result.data,
  } as {
    data: Listing[] | undefined
    isLoading: boolean
    error: any
    refetch: () => void
  }
}

/**
 * Hook to fetch notifications
 */
export const useNotifications = createTypedHook<GetNotificationsInput, GetNotificationsResponse>(
  (input: GetNotificationsInput = {}) => trpc.mobile.getNotifications.useQuery({
    page: input.page ?? 1,
    limit: input.limit ?? 20,
    unreadOnly: input.unreadOnly ?? false,
  })
)

/**
 * Type-safe mutation hook wrapper
 */
function createTypedMutation<TInput, TOutput>(
  mutationFn: () => any
) {
  return () => {
    const result = mutationFn()
    return {
      ...result,
      data: result.data?.result?.data?.json ?? result.data,
      isPending: result.isLoading || result.isPending,
    } as {
      mutate: (input: TInput) => void
      mutateAsync: (input: TInput) => Promise<TOutput>
      data: TOutput | undefined
      isLoading: boolean
      isPending: boolean
      error: any
    }
  }
}

// Mutation hooks using tRPC
export const useCreateListing = createTypedMutation<CreateListingInput, Listing>(
  () => trpc.mobile.createListing.useMutation()
)

export const useUpdateListing = createTypedMutation<UpdateListingInput, Listing>(
  () => trpc.mobile.updateListing.useMutation()
)

export const useDeleteListing = createTypedMutation<DeleteListingInput, Listing>(
  () => trpc.mobile.deleteListing.useMutation()
)

export const useVoteListing = createTypedMutation<VoteListingInput, { id: string; value: boolean }>(
  () => trpc.mobile.voteListing.useMutation()
)

export const useAddComment = createTypedMutation<CreateCommentInput, Comment>(
  () => trpc.mobile.createComment.useMutation()
)

export const useUpdateComment = createTypedMutation<UpdateCommentInput, Comment>(
  () => trpc.mobile.updateComment.useMutation()
)

export const useDeleteComment = createTypedMutation<DeleteCommentInput, Comment>(
  () => trpc.mobile.deleteComment.useMutation()
)

export const useUpdateProfile = createTypedMutation<UpdateProfileInput, UserProfile>(
  () => trpc.mobile.updateProfile.useMutation()
)

export const useMarkNotificationRead = createTypedMutation<MarkNotificationReadInput, { success: boolean }>(
  () => trpc.mobile.markNotificationAsRead.useMutation()
)

export const useMarkAllNotificationsRead = createTypedMutation<void, { success: boolean }>(
  () => trpc.mobile.markAllNotificationsAsRead.useMutation()
)

/**
 * Hook to fetch search suggestions (with conditional enabling)
 */
export function useSearchSuggestions(query: string) {
  const result = trpc.mobile.getSearchSuggestions.useQuery(
    { query, limit: 10 },
    { enabled: query.length > 0 }
  )
  return {
    ...result,
    data: result.data?.result?.data?.json ?? result.data,
  } as {
    data: SearchSuggestion[] | undefined
    isLoading: boolean
    error: any
    refetch: () => void
  }
}

/**
 * Hook to fetch user vote for a listing (with conditional enabling)
 */
export function useUserVote(listingId: string) {
  const result = trpc.mobile.getUserVote.useQuery(
    { listingId },
    { enabled: !!listingId }
  )
  return {
    ...result,
    data: result.data?.result?.data?.json ?? result.data,
  } as {
    data: boolean | null | undefined
    isLoading: boolean
    error: any
    refetch: () => void
  }
}

/**
 * Hook to fetch device brands
 */
export const useDeviceBrands = createTypedHook<void, DeviceBrand[]>(
  () => trpc.mobile.getDeviceBrands.useQuery()
)

// Aliases for backward compatibility
export { useGame as useGameById }
export { useListing as useListingById }
