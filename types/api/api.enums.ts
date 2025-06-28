/**
 * Enums
 */
export const Role = {
  USER: 'USER',
  AUTHOR: 'AUTHOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const CustomFieldType = {
  TEXT: 'TEXT',
  TEXTAREA: 'TEXTAREA',
  URL: 'URL',
  BOOLEAN: 'BOOLEAN',
  SELECT: 'SELECT',
  RANGE: 'RANGE',
} as const

export type CustomFieldType =
  (typeof CustomFieldType)[keyof typeof CustomFieldType]

export const ApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export type ApprovalStatus =
  (typeof ApprovalStatus)[keyof typeof ApprovalStatus]

export const NotificationType = {
  LISTING_COMMENT: 'LISTING_COMMENT',
  LISTING_VOTE_UP: 'LISTING_VOTE_UP',
  LISTING_VOTE_DOWN: 'LISTING_VOTE_DOWN',
  COMMENT_REPLY: 'COMMENT_REPLY',
  USER_MENTION: 'USER_MENTION',
  NEW_DEVICE_LISTING: 'NEW_DEVICE_LISTING',
  NEW_SOC_LISTING: 'NEW_SOC_LISTING',
  GAME_ADDED: 'GAME_ADDED',
  EMULATOR_UPDATED: 'EMULATOR_UPDATED',
  MAINTENANCE_NOTICE: 'MAINTENANCE_NOTICE',
  FEATURE_ANNOUNCEMENT: 'FEATURE_ANNOUNCEMENT',
  POLICY_UPDATE: 'POLICY_UPDATE',
  LISTING_APPROVED: 'LISTING_APPROVED',
  LISTING_REJECTED: 'LISTING_REJECTED',
  CONTENT_FLAGGED: 'CONTENT_FLAGGED',
  ACCOUNT_WARNING: 'ACCOUNT_WARNING',
  ROLE_CHANGED: 'ROLE_CHANGED',
} as const

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType]

export const NotificationCategory = {
  ENGAGEMENT: 'ENGAGEMENT',
  CONTENT: 'CONTENT',
  SYSTEM: 'SYSTEM',
  MODERATION: 'MODERATION',
} as const

export type NotificationCategory =
  (typeof NotificationCategory)[keyof typeof NotificationCategory]

export const DeliveryChannel = {
  IN_APP: 'IN_APP',
  EMAIL: 'EMAIL',
  BOTH: 'BOTH',
} as const

export type DeliveryChannel =
  (typeof DeliveryChannel)[keyof typeof DeliveryChannel]

export const NotificationDeliveryStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const

export type NotificationDeliveryStatus =
  (typeof NotificationDeliveryStatus)[keyof typeof NotificationDeliveryStatus]

export const TrustAction = {
  UPVOTE: 'UPVOTE',
  DOWNVOTE: 'DOWNVOTE',
  LISTING_CREATED: 'LISTING_CREATED',
  LISTING_APPROVED: 'LISTING_APPROVED',
  LISTING_REJECTED: 'LISTING_REJECTED',
  MONTHLY_ACTIVE_BONUS: 'MONTHLY_ACTIVE_BONUS',
  LISTING_RECEIVED_UPVOTE: 'LISTING_RECEIVED_UPVOTE',
  LISTING_RECEIVED_DOWNVOTE: 'LISTING_RECEIVED_DOWNVOTE',
  ADMIN_ADJUSTMENT_POSITIVE: 'ADMIN_ADJUSTMENT_POSITIVE',
  ADMIN_ADJUSTMENT_NEGATIVE: 'ADMIN_ADJUSTMENT_NEGATIVE',
}

export type TrustAction = (typeof TrustAction)[keyof typeof TrustAction]
