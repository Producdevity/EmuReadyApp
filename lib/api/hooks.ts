import { trpc } from './client'

// Query keys for consistent caching
export const queryKeys = {
  listings: {
    all: ['listings'] as const,
    featured: ['listings', 'featured'] as const,
    byGame: (gameId: string) => ['listings', 'game', gameId] as const,
    byUser: (userId: string) => ['listings', 'user', userId] as const,
    detail: (id: string) => ['listings', id] as const,
    comments: (id: string) => ['listings', id, 'comments'] as const,
  },
  games: {
    all: ['games'] as const,
    popular: ['games', 'popular'] as const,
    search: (query: string) => ['games', 'search', query] as const,
    detail: (id: string) => ['games', id] as const,
  },
  users: {
    profile: ['users', 'profile'] as const,
    detail: (id: string) => ['users', id] as const,
  },
  systems: {
    all: ['systems'] as const,
  },
  devices: {
    all: ['devices'] as const,
  },
} as const

// Listing API hooks using tRPC mobile endpoints
export function useFeaturedListings() {
  return (trpc as any).mobile.getFeaturedListings.useQuery()
}

export function usePopularGames() {
  return (trpc as any).mobile.getPopularGames.useQuery()
}

export function useAppStats() {
  return (trpc as any).mobile.getAppStats.useQuery()
}

export function useListingsByGame(gameId: string) {
  return (trpc as any).mobile.getListingsByGame.useQuery({ gameId })
}

export function useListing(id: string) {
  return (trpc as any).mobile.getListingById.useQuery({ id })
}

export function useListingComments(listingId: string) {
  return (trpc as any).mobile.getListingComments.useQuery({ listingId })
}

export function useGame(id: string) {
  return (trpc as any).mobile.getGameById.useQuery({ id })
}

export function useGames(query?: string) {
  return (trpc as any).mobile.searchGames.useQuery(
    { query: query || '' },
    { enabled: !!query }
  )
}

export function useUserListings(userId: string) {
  return (trpc as any).mobile.getUserListings.useQuery({ userId })
}

export function useUserProfile() {
  return (trpc as any).mobile.getUserProfile.useQuery()
}

export function useSystems() {
  return (trpc as any).mobile.getSystems.useQuery()
}

export function useDevices() {
  return (trpc as any).mobile.getDevices.useQuery()
}

// Enhanced listings hook that accepts filter parameters
export function useListings(params?: {
  gameId?: string;
  systemId?: string;
  deviceId?: string;
  page?: number;
  limit?: number;
}) {
  const featuredListings = useFeaturedListings()
  const gameListings = useListingsByGame(params?.gameId || '')
  
  // Return the appropriate data based on parameters
  if (params?.gameId) {
    return gameListings
  }
  return featuredListings
}

// Mutation hooks using tRPC
export function useCreateListing() {
  return (trpc as any).mobile.createListing.useMutation({
    onSuccess: () => {
      console.log('Listing created successfully')
    },
  })
}

export function useUpdateListing() {
  return (trpc as any).mobile.updateListing.useMutation({
    onSuccess: () => {
      console.log('Listing updated successfully')
    },
  })
}

export function useDeleteListing() {
  return (trpc as any).mobile.deleteListing.useMutation({
    onSuccess: () => {
      console.log('Listing deleted successfully')
    },
  })
}

export function useVoteListing() {
  return (trpc as any).mobile.voteListing.useMutation({
    onSuccess: () => {
      console.log('Vote submitted successfully')
    },
  })
}

export function useAddComment() {
  return (trpc as any).mobile.createComment.useMutation({
    onSuccess: () => {
      console.log('Comment added successfully')
    },
  })
}

export function useUpdateComment() {
  return (trpc as any).mobile.updateComment.useMutation({
    onSuccess: () => {
      console.log('Comment updated successfully')
    },
  })
}

export function useDeleteComment() {
  return (trpc as any).mobile.deleteComment.useMutation({
    onSuccess: () => {
      console.log('Comment deleted successfully')
    },
  })
}

export function useUpdateProfile() {
  return (trpc as any).mobile.updateProfile.useMutation({
    onSuccess: () => {
      console.log('Profile updated successfully')
    },
  })
}

// Aliases to match component expectations
export { useGame as useGameById }
export { useListing as useListingById }
