import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, View } from 'react-native'
import Animated, {
  FadeInUp,
  SlideInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { ThemedText } from '@/components/themed'
import { GlassView } from '@/components/themed/ThemedView'
import { Card, EmptyState, LoadingSpinner, ScreenLayout, ScreenHeader } from '@/components/ui'
import { AnimatedPressable } from '@/components/ui/MicroInteractions'
import { useTheme } from '@/contexts/ThemeContext'
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationCount,
} from '@/lib/api/hooks'
import type { Notification as ApiNotification } from '@/types/api/api.response'

export default function NotificationsScreen() {
  const { theme } = useTheme()
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const notificationsQuery = useNotifications({ page: 1, unreadOnly: showUnreadOnly })
  const unreadCountQuery = useUnreadNotificationCount()

  const markAsReadMutation = useMarkNotificationAsRead()
  const markAllAsReadMutation = useMarkAllNotificationsAsRead()

  // Animation values
  const filterScale = useSharedValue(1)

  // Animated styles
  const filterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filterScale.value }],
  }))

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([notificationsQuery.refetch(), unreadCountQuery.refetch()])
    setRefreshing(false)
  }

  const handleNotificationPress = async (notification: ApiNotification) => {
    if (!notification.isRead) {
      try {
        await markAsReadMutation.mutateAsync({
          notificationId: notification.id,
        })
        await notificationsQuery.refetch()
        await unreadCountQuery.refetch()
      } catch {
        // Silent failure - notification state will be refreshed
      }
    }

    // Navigate to notification action URL if exists
    if ((notification as any).actionUrl) {
      router.push((notification as any).actionUrl)
    }
  }

  const handleMarkAllAsRead = () => {
    Alert.alert('Mark All as Read', 'Are you sure you want to mark all notifications as read?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark All Read',
        onPress: async () => {
          try {
            await markAllAsReadMutation.mutateAsync()
            await notificationsQuery.refetch()
            await unreadCountQuery.refetch()
          } catch {
            Alert.alert('Error', 'Failed to mark all notifications as read')
          }
        },
      },
    ])
  }

  const toggleFilter = () => {
    filterScale.value = withSpring(0.9, { damping: 10 }, () => {
      filterScale.value = withSpring(1)
    })
    setShowUnreadOnly(!showUnreadOnly)
  }

  const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'LISTING_APPROVED':
        return 'checkmark-circle'
      case 'LISTING_REJECTED':
        return 'close-circle'
      case 'NEW_COMMENT':
        return 'chatbubble'
      case 'LISTING_VOTED':
        return 'thumbs-up'
      case 'ROLE_CHANGED':
        return 'key'
      default:
        return 'notifications'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'LISTING_APPROVED':
        return theme.colors.success
      case 'LISTING_REJECTED':
        return theme.colors.error
      case 'NEW_COMMENT':
        return theme.colors.primary
      case 'LISTING_VOTED':
        return theme.colors.warning
      case 'ROLE_CHANGED':
        return theme.colors.info
      default:
        return theme.colors.text
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return notificationDate.toLocaleDateString()
  }

  if (notificationsQuery.isLoading) {
    return (
      <ScreenLayout scrollable={false}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LoadingSpinner size="large" />
        </View>
      </ScreenLayout>
    )
  }

  if (notificationsQuery.error) {
    return (
      <ScreenLayout scrollable={false}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.lg,
          }}
        >
          <EmptyState
            icon="alert-circle"
            title="Unable to Load Notifications"
            subtitle="There was an error loading your notifications. Please try again."
            actionLabel="Retry"
            onAction={() => notificationsQuery.refetch()}
          />
        </View>
      </ScreenLayout>
    )
  }

  const notifications = (notificationsQuery.data?.notifications ||
    []) as unknown as ApiNotification[]
  const unreadCount = unreadCountQuery.data ?? notifications.filter((n) => !n.isRead).length

  return (
    <ScreenLayout refreshing={refreshing} onRefresh={onRefresh}>
      <ScreenHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''} waiting` : undefined}
        badge={unreadCount > 0 ? { count: unreadCount } : undefined}
      />

      {/* Filter Bar */}
      <Animated.View
        entering={FadeInUp.delay(300).springify()}
        style={{
          paddingHorizontal: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
        }}
      >
        <GlassView
          borderRadius={theme.borderRadius.lg}
          style={{
            padding: theme.spacing.md,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <Animated.View style={filterAnimatedStyle}>
                <AnimatedPressable
                  onPress={() => {
                    if (showUnreadOnly) {
                      toggleFilter()
                    }
                  }}
                >
                  <View
                    style={{
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      borderRadius: theme.borderRadius.md,
                      backgroundColor: !showUnreadOnly
                        ? theme.colors.primary
                        : theme.colors.surface,
                    }}
                  >
                    <ThemedText
                      style={{
                        color: !showUnreadOnly ? theme.colors.textInverse : theme.colors.text,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                      }}
                    >
                      All
                    </ThemedText>
                  </View>
                </AnimatedPressable>
              </Animated.View>

              <Animated.View style={filterAnimatedStyle}>
                <AnimatedPressable
                  onPress={() => {
                    if (!showUnreadOnly) {
                      toggleFilter()
                    }
                  }}
                >
                  <View
                    style={{
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      borderRadius: theme.borderRadius.md,
                      backgroundColor: showUnreadOnly
                        ? theme.colors.primary
                        : theme.colors.surface,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: theme.spacing.xs,
                    }}
                  >
                    <ThemedText
                      style={{
                        color: showUnreadOnly ? theme.colors.textInverse : theme.colors.text,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                      }}
                    >
                      Unread
                    </ThemedText>
                    {unreadCount > 0 && (
                      <View
                        style={{
                          backgroundColor: showUnreadOnly
                            ? 'rgba(255,255,255,0.3)'
                            : theme.colors.primary,
                          paddingHorizontal: theme.spacing.sm,
                          paddingVertical: 2,
                          borderRadius: theme.borderRadius.sm,
                          minWidth: 20,
                          alignItems: 'center',
                        }}
                      >
                        <ThemedText
                          style={{
                            color: theme.colors.textInverse,
                            fontSize: theme.typography.fontSize.xs,
                            fontWeight: theme.typography.fontWeight.bold,
                          }}
                        >
                          {unreadCount}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </AnimatedPressable>
              </Animated.View>
            </View>

            {unreadCount > 0 && (
              <AnimatedPressable
                onPress={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <View
                  style={{
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    opacity: markAllAsReadMutation.isPending ? 0.7 : 1,
                  }}
                >
                  <ThemedText
                    style={{
                      color: theme.colors.primary,
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                    }}
                  >
                    Mark All Read
                  </ThemedText>
                </View>
              </AnimatedPressable>
            )}
          </View>
        </GlassView>
      </Animated.View>

      {/* Notifications List */}
      <View style={{ flex: 1 }}>
        {notifications.length === 0 ? (
          <Animated.View
            entering={ZoomIn.delay(400).springify()}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.xxxl,
            }}
          >
            <Card style={{ overflow: 'hidden', width: '100%' }}>
              <LinearGradient
                colors={theme.colors.gradients.secondary}
                style={{
                  padding: theme.spacing.xxl,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.spacing.lg,
                  }}
                >
                  <Ionicons
                    name="notifications-off"
                    size={40}
                    color={theme.colors.textInverse}
                  />
                </View>
                <ThemedText
                  style={{
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.textInverse,
                    marginBottom: theme.spacing.sm,
                    textAlign: 'center',
                  }}
                >
                  {showUnreadOnly ? 'No Unread Notifications' : 'No Notifications Yet'}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: theme.typography.fontSize.md,
                    color: `${theme.colors.textInverse}CC`,
                    textAlign: 'center',
                    lineHeight:
                      theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
                  }}
                >
                  {showUnreadOnly
                    ? 'All caught up! Check back later for new updates.'
                    : "When you receive notifications, they'll appear here."}
                </ThemedText>
              </LinearGradient>
            </Card>
          </Animated.View>
        ) : (
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            {notifications.map((notification, index) => (
              <Animated.View
                key={notification.id}
                entering={SlideInRight.delay(index * 100).springify()}
                style={{ marginBottom: theme.spacing.md }}
              >
                <AnimatedPressable onPress={() => handleNotificationPress(notification)}>
                  <Card
                    style={{
                      backgroundColor: notification.isRead
                        ? theme.colors.surface
                        : theme.colors.surfaceElevated,
                      borderWidth: notification.isRead ? 0 : 2,
                      borderColor: notification.isRead ? 'transparent' : theme.colors.primary,
                      overflow: 'hidden',
                    }}
                  >
                    {!notification.isRead && (
                      <LinearGradient
                        colors={[`${theme.colors.primary}10`, 'transparent']}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                        }}
                      />
                    )}

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        padding: theme.spacing.lg,
                      }}
                    >
                      {/* Notification Icon */}
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: `${getNotificationColor(notification.type)}20`,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: theme.spacing.md,
                        }}
                      >
                        <Ionicons
                          name={getNotificationIcon(notification.type)}
                          size={24}
                          color={getNotificationColor(notification.type)}
                        />
                      </View>

                      {/* Notification Content */}
                      <View style={{ flex: 1 }}>
                        <ThemedText
                          style={{
                            fontSize: theme.typography.fontSize.md,
                            fontWeight: notification.isRead
                              ? theme.typography.fontWeight.medium
                              : theme.typography.fontWeight.bold,
                            color: theme.colors.text,
                            marginBottom: theme.spacing.xs,
                            lineHeight:
                              theme.typography.lineHeight.tight * theme.typography.fontSize.md,
                          }}
                        >
                          {notification.title}
                        </ThemedText>

                        <ThemedText
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.textSecondary,
                            marginBottom: theme.spacing.sm,
                            lineHeight:
                              theme.typography.lineHeight.relaxed *
                              theme.typography.fontSize.sm,
                          }}
                        >
                          {notification.message}
                        </ThemedText>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: theme.spacing.sm,
                          }}
                        >
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color={theme.colors.textMuted}
                          />
                          <ThemedText
                            style={{
                              fontSize: theme.typography.fontSize.xs,
                              color: theme.colors.textMuted,
                            }}
                          >
                            {formatTimeAgo(notification.createdAt)}
                          </ThemedText>
                        </View>
                      </View>

                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: theme.colors.primary,
                            marginLeft: theme.spacing.sm,
                            marginTop: theme.spacing.xs,
                          }}
                        />
                      )}
                    </View>
                  </Card>
                </AnimatedPressable>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </ScreenLayout>
  )
}