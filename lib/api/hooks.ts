import { trpc } from './client'

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
