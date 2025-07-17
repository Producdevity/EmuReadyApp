import { useTheme } from '@/contexts/ThemeContext'
import { ANIMATION_CONFIG } from '@/lib/animation/config'
import { useVoteListing } from '@/lib/api/hooks'
import type { Listing } from '@/types'
import { useAuth } from '@clerk/clerk-expo'
import * as Haptics from 'expo-haptics'
import React, { memo, useState } from 'react'
import { Alert, StyleSheet, Text, View, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Card } from '../ui'

interface ListingCardProps {
  listing: Listing
  onPress?: () => void
  onVote?: (vote: 'up' | 'down') => void
  compact?: boolean
  style?: ViewStyle
  disableAnimations?: boolean
}

function ListingCardComponent(props: ListingCardProps) {
  const { isSignedIn } = useAuth()
  const { theme } = useTheme()
  const voteMutation = useVoteListing()
  const [isVoting, setIsVoting] = useState<'up' | 'down' | null>(null)

  // Animation values
  const voteUpScale = useSharedValue(1)
  const voteDownScale = useSharedValue(1)
  const performanceBadgeScale = useSharedValue(1)
  const cardScale = useSharedValue(1)

  const animateVoteButton = (vote: 'up' | 'down') => {
    const scaleValue = vote === 'up' ? voteUpScale : voteDownScale

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Smooth scale animation with better spring values
    scaleValue.value = withSequence(
      withSpring(0.9, { damping: 30, stiffness: 400 }),
      withSpring(1.08, { damping: 25, stiffness: 350 }),
      withSpring(1, { damping: 28, stiffness: 380 }),
    )
  }

  const handleVote = async (vote: 'up' | 'down') => {
    if (props.onVote) {
      animateVoteButton(vote)
      props.onVote(vote)
      return
    }

    if (!isSignedIn) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      Alert.alert('Sign In Required', 'Please sign in to vote on listings.')
      return
    }

    if (voteMutation.isPending || isVoting) {
      return // Prevent multiple votes while one is in progress
    }

    setIsVoting(vote)
    animateVoteButton(vote)

    try {
      await voteMutation.mutateAsync({
        listingId: props.listing.id,
        value: vote === 'up',
      })

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch {
      // Error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Error', 'Failed to submit vote. Please try again.')
    } finally {
      setIsVoting(null)
    }
  }

  const getPerformanceColor = (rank: number) => {
    if (rank >= 4) return theme.colors.performance.perfect
    if (rank >= 3) return theme.colors.performance.great
    if (rank >= 2) return theme.colors.performance.good
    return theme.colors.performance.poor
  }

  const handleCardPress = () => {
    if (props.onPress) {
      // Smooth card press animation
      cardScale.value = withSequence(
        withTiming(0.98, {
          duration: 100,
          easing: ANIMATION_CONFIG.easing.out,
        }),
        withSpring(1, {
          damping: 25,
          stiffness: 350,
        }),
      )

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      // Call the onPress immediately for better responsiveness
      props.onPress()
    }
  }

  const handlePerformanceBadgePress = () => {
    performanceBadgeScale.value = withSequence(
      withSpring(0.92, { damping: 28, stiffness: 400 }),
      withSpring(1, { damping: 25, stiffness: 350 }),
    )
    Haptics.selectionAsync()
  }

  // Animated styles
  const voteUpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voteUpScale.value }],
  }))

  const voteDownAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voteDownScale.value }],
  }))

  const performanceBadgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: performanceBadgeScale.value }],
  }))

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }))

  const styles = createStyles(theme)
  const containerStyle = StyleSheet.flatten([styles.container, props.style])

  return (
    <Animated.View style={cardAnimatedStyle}>
      <Card
        style={containerStyle}
        padding="md"
        onPress={handleCardPress}
        disableAnimations={props.disableAnimations}
      >
        <View style={styles.header}>
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle} numberOfLines={props.compact ? 1 : 2}>
              {props.listing.game?.title || 'Unknown Game'}
            </Text>
            <Text style={styles.systemName}>
              {props.listing.game?.system?.name || 'Unknown System'}
            </Text>
          </View>

          <Animated.View style={performanceBadgeAnimatedStyle}>
            <Card
              style={{
                ...styles.performanceBadge,
                backgroundColor: getPerformanceColor(props.listing.performance?.rank || 0),
              }}
              padding="none"
              onPress={handlePerformanceBadgePress}
            >
              <View style={styles.performanceBadgeContent}>
                <Text style={styles.performanceText}>
                  {props.listing.performance?.label || 'Not Rated'}
                </Text>
              </View>
            </Card>
          </Animated.View>
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>
            📱 {props.listing.device?.modelName || 'Unknown Device'}
          </Text>
          <Text style={styles.emulatorName}>
            ⚡ {props.listing.emulator?.name || 'Unknown Emulator'}
          </Text>
        </View>

        {!props.compact && (
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{props.listing.successRate || 0}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{props.listing.upVotes || 0}</Text>
              <Text style={styles.statLabel}>Upvotes</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{props.listing._count?.comments || 0}</Text>
              <Text style={styles.statLabel}>Comments</Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>By {props.listing.author?.name || 'Anonymous'}</Text>
            <Text style={styles.createdDate}>
              {new Date(props.listing.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.voteButtons}>
            <Animated.View style={voteUpAnimatedStyle}>
              <Card
                style={StyleSheet.flatten([
                  styles.voteButton,
                  props.listing.userVote === true && styles.voteButtonActive,
                  (voteMutation.isPending || isVoting === 'up') && styles.voteButtonDisabled,
                ])}
                padding="sm"
                onPress={() => handleVote('up')}
              >
                <Text
                  style={[
                    styles.voteButtonText,
                    props.listing.userVote === true && styles.voteButtonTextActive,
                    (voteMutation.isPending || isVoting === 'up') && styles.voteButtonDisabled,
                  ]}
                >
                  👍 {props.listing.upVotes || 0}
                </Text>
              </Card>
            </Animated.View>

            <Animated.View style={voteDownAnimatedStyle}>
              <Card
                style={StyleSheet.flatten([
                  styles.voteButton,
                  props.listing.userVote === false && styles.voteButtonActive,
                  (voteMutation.isPending || isVoting === 'down') && styles.voteButtonDisabled,
                ])}
                padding="sm"
                onPress={() => handleVote('down')}
              >
                <Text
                  style={[
                    styles.voteButtonText,
                    props.listing.userVote === false && styles.voteButtonTextActive,
                    (voteMutation.isPending || isVoting === 'down') && styles.voteButtonDisabled,
                  ]}
                >
                  👎 {props.listing.downVotes || 0}
                </Text>
              </Card>
            </Animated.View>
          </View>
        </View>
      </Card>
    </Animated.View>
  )
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      marginBottom: theme.spacing.md,
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    gameInfo: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    gameTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: 4,
    },
    systemName: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    performanceBadge: {
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 2,
    },
    performanceBadgeContent: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    performanceText: {
      fontSize: theme.typography.fontSize.xs,
      color: '#ffffff',
      fontWeight: theme.typography.fontWeight.semibold,
    },
    deviceInfo: {
      gap: 6,
      marginBottom: theme.spacing.sm,
    },
    deviceName: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    emulatorName: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderLight,
      marginBottom: theme.spacing.sm,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    authorInfo: {
      flex: 1,
    },
    authorName: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.medium,
      marginBottom: 2,
    },
    createdDate: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    voteButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    voteButton: {
      minWidth: 70,
      paddingHorizontal: 16,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      overflow: 'hidden',
      position: 'relative',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    voteButtonActive: {
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    voteButtonDisabled: {
      opacity: 0.5,
    },
    voteButtonText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      position: 'relative',
      zIndex: 1,
    },
    voteButtonTextActive: {
      color: '#ffffff',
    },
  })
}

export default memo(ListingCardComponent)
