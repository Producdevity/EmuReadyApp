import React, { useState } from 'react'
import {
  ScrollView,
  View,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { useTheme } from '@/contexts/ThemeContext'
import { useNotifications, useUnreadNotificationCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/lib/api/hooks'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { router } from 'expo-router'
import Animated, { FadeInUp } from 'react-native-reanimated'
import type { Notification as ApiNotification } from '@/types/api/api.response'

export default function NotificationsScreen() {
  const { theme } = useTheme()
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const notificationsQuery = useNotifications({ page: 1, unreadOnly: showUnreadOnly })
  const unreadCountQuery = useUnreadNotificationCount()

  const markAsReadMutation = useMarkNotificationAsRead()
  const markAllAsReadMutation = useMarkAllNotificationsAsRead()

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([notificationsQuery.refetch(), unreadCountQuery.refetch()])
    setRefreshing(false)
  }

  const handleNotificationPress = async (notification: any) => {
    if (!notification.read) {
      try {
        await markAsReadMutation.mutateAsync({
          notificationId: notification.id,
        })
        notificationsQuery.refetch()
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
      }
    }

    // Navigate to notification action URL if exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All Read',
          onPress: async () => {
            try {
              await markAllAsReadMutation.mutateAsync()
              notificationsQuery.refetch()
            } catch (err) {
              console.error(err)
              Alert.alert('Error', 'Failed to mark all notifications as read')
            }
          },
        },
      ]
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LISTING_APPROVED':
      case 'LISTING_REJECTED':
        return 'checkmark.circle.fill'
      case 'NEW_COMMENT':
        return 'message.fill'
      case 'LISTING_VOTED':
        return 'hand.thumbsup.fill'
      case 'ROLE_CHANGED':
        return 'person.badge.key.fill'
      default:
        return 'bell.fill'
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
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationDate.getTime()) / (1000 * 60)
    )

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
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </ThemedView>
    )
  }

  if (notificationsQuery.error) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <IconSymbol name="exclamationmark.triangle" size={48} color={theme.colors.error} />
        <ThemedText style={{ textAlign: 'center', marginTop: 16, fontSize: 16 }}>
          Failed to load notifications
        </ThemedText>
        <Button
          title="Try Again"
          onPress={() => notificationsQuery.refetch()}
          style={{ marginTop: 16 }}
        />
      </ThemedView>
    )
  }

  const notifications = (notificationsQuery.data?.notifications || []) as ApiNotification[]
  const localUnreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ThemedView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border
        }}>
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
            Notifications
          </ThemedText>

          {/* Filter Toggle */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <TouchableOpacity
              onPress={() => setShowUnreadOnly(!showUnreadOnly)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: showUnreadOnly ? theme.colors.primary : theme.colors.card,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
              }}
            >
              <ThemedText style={{
                                 color: showUnreadOnly ? theme.colors.card : theme.colors.text,
                fontSize: 14,
                fontWeight: '500'
              }}>
                {showUnreadOnly ? 'Unread Only' : 'All'}
              </ThemedText>
            </TouchableOpacity>

            {(unreadCountQuery.data ?? localUnreadCount) > 0 && (
              <Button
                title="Mark All Read"
                onPress={handleMarkAllAsRead}
                variant="outline"
                disabled={markAllAsReadMutation.isPending}
              />
            )}
          </View>
        </View>

        {/* Notifications List */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 40
            }}>
              <IconSymbol name="bell" size={64} color={theme.colors.textSecondary} />
              <ThemedText style={{
                textAlign: 'center',
                marginTop: 16,
                fontSize: 16,
                color: theme.colors.textSecondary
              }}>
                {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
              </ThemedText>
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              {notifications.map((notification, index) => (
                <Animated.View
                  key={notification.id}
                  entering={FadeInUp.delay(index * 100)}
                >
                  <TouchableOpacity
                    onPress={() => handleNotificationPress(notification)}
                    style={{ marginBottom: 12 }}
                  >
                    <Card style={{
                      padding: 16,
                      backgroundColor: notification.isRead
                                                 ? theme.colors.card
                        : `${theme.colors.primary}10`,
                      borderLeftWidth: notification.isRead ? 0 : 3,
                      borderLeftColor: notification.isRead ? 'transparent' : theme.colors.primary,
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        {/* Notification Icon */}
                        <View style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: `${getNotificationColor(notification.type)}20`,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}>
                          <IconSymbol
                            name={getNotificationIcon(notification.type)}
                            size={20}
                            color={getNotificationColor(notification.type)}
                          />
                        </View>

                        {/* Notification Content */}
                        <View style={{ flex: 1 }}>
                          <ThemedText style={{
                            fontSize: 16,
                            fontWeight: notification.isRead ? '400' : '600',
                            marginBottom: 4,
                          }}>
                            {notification.title}
                          </ThemedText>

                          <ThemedText style={{
                            fontSize: 14,
                            color: theme.colors.textSecondary,
                            marginBottom: 8,
                          }}>
                            {notification.message}
                          </ThemedText>

                          <ThemedText style={{
                            fontSize: 12,
                            color: theme.colors.textSecondary
                          }}>
                            {formatTimeAgo(notification.createdAt)}
                          </ThemedText>
                        </View>

                        {/* Unread Indicator */}
                        {!notification.isRead && (
                          <View style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: theme.colors.primary,
                            marginLeft: 8,
                            marginTop: 6,
                          }} />
                        )}
                      </View>
                    </Card>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}
