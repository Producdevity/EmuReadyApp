import { trpc } from './client'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook to fetch application statistics
 * This includes counts of listings, games, users, etc.
 */
export function useAppStats() {
  // If you have a real API endpoint, you should use trpc like:
  // return trpc.mobile.getAppStats.useQuery()

  // For now, we'll return mock data since the endpoint might not exist yet
  return useQuery({
    queryKey: ['app-stats'],
    queryFn: () => {
      // Mock data to be replaced with actual API call
      return Promise.resolve({
        totalListings: 1254,
        totalGames: 587,
        totalUsers: 423,
        totalComments: 3251,
        totalVotes: 8745,
        recentListings: 42,
        recentGames: 12,
        successRate: 87, // Added success rate property
        popularDevices: [
          { id: '1', name: 'Steam Deck', count: 425 },
          { id: '2', name: 'ROG Ally', count: 352 },
          { id: '3', name: 'Nintendo Switch', count: 127 },
        ],
        popularEmulators: [
          { id: '1', name: 'Yuzu', count: 314 },
          { id: '2', name: 'Dolphin', count: 289 },
          { id: '3', name: 'PPSSPP', count: 245 },
        ]
      })
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch popular games with their stats
 */
export function usePopularGames() {
  // If you have a real API endpoint, you should use trpc like:
  // return trpc.mobile.getPopularGames.useQuery()

  // Mock data for now
  return useQuery({
    queryKey: ['popular-games'],
    queryFn: () => {
      return Promise.resolve([
        {
          id: '1',
          title: 'The Legend of Zelda: Breath of the Wild',
          system: { id: '1', name: 'Nintendo Switch', key: 'switch' },
          imageUrl: null,
          listingsCount: 168,
          upvotesCount: 523,
          averagePerformance: 4.2,
        },
        {
          id: '2',
          title: 'God of War',
          system: { id: '2', name: 'PlayStation 4', key: 'ps4' },
          imageUrl: null,
          listingsCount: 145,
          upvotesCount: 487,
          averagePerformance: 3.8,
        },
        {
          id: '3',
          title: 'Elden Ring',
          system: { id: '3', name: 'PC', key: 'pc' },
          imageUrl: null,
          listingsCount: 132,
          upvotesCount: 421,
          averagePerformance: 3.5,
        },
        {
          id: '4',
          title: 'Super Mario Odyssey',
          system: { id: '1', name: 'Nintendo Switch', key: 'switch' },
          imageUrl: null,
          listingsCount: 112,
          upvotesCount: 389,
          averagePerformance: 4.7,
        },
        {
          id: '5',
          title: 'Red Dead Redemption 2',
          system: { id: '2', name: 'PlayStation 4', key: 'ps4' },
          imageUrl: null,
          listingsCount: 98,
          upvotesCount: 376,
          averagePerformance: 3.3,
        }
      ])
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Direct hooks for EmuReady mobile tRPC endpoints
export function useFeaturedListings() {
  return trpc.mobile.getFeaturedListings.useQuery()
}

export function useListings(params?: {
  page?: number
  limit?: number
  gameId?: string
  systemId?: string
  deviceId?: string
  emulatorId?: string
  search?: string
}) {
  return trpc.mobile.getListings.useQuery({
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    gameId: params?.gameId,
    systemId: params?.systemId,
    deviceId: params?.deviceId,
    emulatorId: params?.emulatorId,
    search: params?.search,
  })
}

export function useListing(id: string) {
  return trpc.mobile.getListingById.useQuery({ id })
}

export function useListingComments(listingId: string) {
  return trpc.mobile.getListingComments.useQuery({ listingId })
}

export function useGame(id: string) {
  return trpc.mobile.getGameById.useQuery({ gameId: id })
}

export function useGames(query?: string, systemId?: string) {
  return trpc.mobile.getGames.useQuery({
    search: query,
    systemId,
    limit: 20,
  })
}

export function useDevices(search?: string, brandId?: string) {
  return trpc.mobile.getDevices.useQuery({
    search,
    brandId,
    limit: 50,
  })
}

export function useEmulators(systemId?: string, search?: string) {
  return trpc.mobile.getEmulators.useQuery({
    systemId,
    search,
    limit: 50,
  })
}

export function useSystems() {
  return trpc.systems.get.useQuery({})
}

export function useUserProfile(userId?: string) {
  return trpc.mobile.getUserProfile.useQuery(
    { userId: userId! },
    { enabled: !!userId }
  )
}

export function useUserListings(userId: string) {
  return trpc.mobile.getUserListings.useQuery({ userId })
}

export function useNotifications(page = 1, unreadOnly = false) {
  return trpc.mobile.getNotifications.useQuery({
    page,
    limit: 20,
    unreadOnly,
  })
}

// Mutation hooks using tRPC
export function useCreateListing() {
  return trpc.mobile.createListing.useMutation()
}

export function useUpdateListing() {
  return trpc.mobile.updateListing.useMutation()
}

export function useDeleteListing() {
  return trpc.mobile.deleteListing.useMutation()
}

export function useVoteListing() {
  return trpc.mobile.voteListing.useMutation()
}

export function useAddComment() {
  return trpc.mobile.createComment.useMutation()
}

export function useUpdateComment() {
  return trpc.mobile.updateComment.useMutation()
}

export function useDeleteComment() {
  return trpc.mobile.deleteComment.useMutation()
}

export function useUpdateProfile() {
  return trpc.mobile.updateProfile.useMutation()
}

export function useMarkNotificationRead() {
  return trpc.mobile.markNotificationAsRead.useMutation()
}

export function useMarkAllNotificationsRead() {
  return trpc.mobile.markAllNotificationsAsRead.useMutation()
}

// Search and suggestions
export function useSearchSuggestions(query: string) {
  return trpc.mobile.getSearchSuggestions.useQuery(
    { query, limit: 10 },
    { enabled: query.length > 0 }
  )
}

export function useUserVote(listingId: string) {
  return trpc.mobile.getUserVote.useQuery(
    { listingId },
    { enabled: !!listingId }
  )
}

// Aliases for backward compatibility
export { useGame as useGameById }
export { useListing as useListingById }

export function useDeviceBrands() {
  return trpc.mobile.getDeviceBrands.useQuery()
}
