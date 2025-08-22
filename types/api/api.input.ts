/**
 * Input Types
 */
import type { ListingVerification, Pagination } from '@/types'

export interface GetListingsInput {
  page?: number
  limit?: number
  gameId?: string
  systemId?: string
  deviceId?: string
  emulatorId?: string
  emulatorIds?: string[] // Support for multiple emulator IDs
  search?: string
}

export interface GetGamesInput {
  search?: string
  systemId?: string
  limit?: number
}

export interface GetEmulatorsInput {
  systemId?: string
  search?: string
  limit?: number
}

export interface GetEmulatorByIdInput {
  id: string
}

export interface GetDevicesInput {
  search?: string
  brandId?: string
  limit?: number
}

export interface SearchSuggestionsInput {
  query: string
  limit?: number
}

export interface GetNotificationsInput {
  page?: number
  limit?: number
  unreadOnly?: boolean
}

export interface GetNotificationsResponse {
  notifications: Notification[]
  pagination: Pagination
}

export interface GetListingsByGameInput {
  gameId: string
}

export interface SearchGamesInput {
  query: string
}

export interface GetGameByIdInput {
  id: string
}

export interface GetListingCommentsInput {
  listingId: string
}

export interface CreateCommentInput {
  content: string
  listingId: string
}

export interface VoteListingInput {
  listingId: string
  value: boolean
}

export interface GetUserVoteInput {
  listingId: string
}

export interface GetUserProfileInput {
  userId: string
}

export interface GetUserListingsInput {
  userId: string
}

export interface GetListingByIdInput {
  id: string
}

export interface CustomFieldValueInput {
  customFieldDefinitionId: string
  value: string
}

export interface CreateListingInput {
  gameId: string
  deviceId: string
  emulatorId: string
  performanceId: number
  notes?: string
  customFieldValues?: CustomFieldValueInput[]
}

export interface UpdateListingInput {
  id: string
  deviceId?: string
  emulatorId?: string
  performanceId?: number
  notes?: string
  customFieldValues?: CustomFieldValueInput[]
}

export interface DeleteListingInput {
  id: string
}

export interface UpdateCommentInput {
  commentId: string
  content: string
}

export interface DeleteCommentInput {
  commentId: string
}

export interface UpdateProfileInput {
  name?: string
  bio?: string
}

export interface MarkNotificationReadInput {
  notificationId: string
}

export interface UpdateUserPreferencesInput {
  defaultToUserDevices?: boolean
  defaultToUserSocs?: boolean
  notifyOnNewListings?: boolean
  bio?: string
}

export interface AddDevicePreferenceInput {
  deviceId: string
}

export interface RemoveDevicePreferenceInput {
  deviceId: string
}

export interface BulkUpdateDevicePreferencesInput {
  deviceIds: string[]
}

export interface BulkUpdateSocPreferencesInput {
  socIds: string[]
}

export interface IsVerifiedDeveloperInput {
  userId: string
  emulatorId: string
}

export interface VerifyListingInput {
  listingId: string
  notes?: string
}

export interface RemoveVerificationInput {
  verificationId: string
}

export interface GetListingVerificationsInput {
  listingId: string
}

export interface GetMyVerificationsInput {
  limit?: number
  page?: number
}

export interface GetMyVerificationsResponse {
  verifications: ListingVerification[]
  pagination: Pagination
}
