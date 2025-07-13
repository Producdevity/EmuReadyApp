import React, { memo, useState } from 'react'
import { StyleSheet, Text, View, Alert, type ViewStyle } from 'react-native'
import { useAuth } from '@clerk/clerk-expo'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Card } from '../ui'
import { useVoteListing } from '@/lib/api/hooks'
import { useTheme } from '@/contexts/ThemeContext'
import type { Listing } from '@/types'

interface ListingCardProps {
  listing: Listing
  onPress?: () => void
  onVote?: (vote: 'up' | 'down') => void
  compact?: boolean
  style?: ViewStyle
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

    // Scale animation
    scaleValue.value = withSequence(
      withSpring(0.8, { damping: 15, stiffness: 300 }),
      withSpring(1.1, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 }),
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
      // Card press animation
      cardScale.value = withSequence(
        withTiming(0.98, { duration: 100 }),
        withTiming(1, { duration: 100 }),
      )

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      // Call the onPress after a small delay to let animation start
      setTimeout(() => {
        props.onPress!()
      }, 50)
    }
  }

  const handlePerformanceBadgePress = () => {
    performanceBadgeScale.value = withSequence(
      withSpring(0.9, { damping: 15, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 }),
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
      <Card style={containerStyle} padding="md" onPress={handleCardPress}>
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
                    (voteMutation.isPending || isVoting === 'up') && styles.voteButtonTextDisabled,
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
                    (voteMutation.isPending || isVoting === 'down') &&
                      styles.voteButtonTextDisabled,
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
      marginBottom: theme.spacing.sm,
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
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    performanceBadgeContent: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
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
      gap: theme.spacing.sm,
    },
    voteButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 50,
      alignItems: 'center',
    },
    voteButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    voteButtonDisabled: {
      opacity: 0.5,
    },
    voteButtonText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    voteButtonTextActive: {
      color: '#ffffff',
    },
    voteButtonTextDisabled: {
      color: theme.colors.textMuted,
    },
  })
}

export default memo(ListingCardComponent)
