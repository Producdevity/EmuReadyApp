import React, { memo } from 'react'
import { StyleSheet, Text, View, Alert, type ViewStyle } from 'react-native'
import { useAuth } from '@clerk/clerk-expo'
import { Card } from '../ui'
import { useVoteListing } from '@/lib/api/hooks'
import { useTheme } from '@/contexts/ThemeContext'
import type { Listing } from '@/types'

interface Props {
  listing: Listing
  onPress?: () => void
  onVote?: (vote: 'up' | 'down') => void
  compact?: boolean
  style?: ViewStyle
}

function ListingCardComponent(props: Props) {
  const { isSignedIn } = useAuth()
  const { theme } = useTheme()
  const voteMutation = useVoteListing()

  const handleVote = async (vote: 'up' | 'down') => {
    if (props.onVote) {
      props.onVote(vote)
      return
    }

    if (!isSignedIn) {
      Alert.alert('Sign In Required', 'Please sign in to vote on listings.')
      return
    }

    if (voteMutation.isPending) {
      return // Prevent multiple votes while one is in progress
    }

    try {
      await voteMutation.mutateAsync({
        listingId: props.listing.id,
        voteType: vote,
      })
    } catch {
      Alert.alert('Error', 'Failed to submit vote. Please try again.')
    }
  }

  const getPerformanceColor = (rank: number) => {
    if (rank >= 4) return theme.colors.performance.perfect
    if (rank >= 3) return theme.colors.performance.great
    if (rank >= 2) return theme.colors.performance.good
    return theme.colors.performance.poor
  }

  const styles = createStyles(theme)
  const containerStyle = StyleSheet.flatten([styles.container, props.style])

  return (
    <Card style={containerStyle} padding="md" onPress={props.onPress}>
      <View style={styles.header}>
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle} numberOfLines={props.compact ? 1 : 2}>
            {props.listing.game?.title || 'Unknown Game'}
          </Text>
          <Text style={styles.systemName}>
            {props.listing.game?.system?.name || 'Unknown System'}
          </Text>
        </View>

        <View
          style={[
            styles.performanceBadge,
            {
              backgroundColor: getPerformanceColor(
                props.listing.performance?.rank || 0,
              ),
            },
          ]}
        >
          <Text style={styles.performanceText}>
            {props.listing.performance?.label || 'Not Rated'}
          </Text>
        </View>
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
            <Text style={styles.statValue}>
              {props.listing.successRate || 0}%
            </Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{props.listing.upvotes || 0}</Text>
            <Text style={styles.statLabel}>Upvotes</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {props.listing._count?.comments || 0}
            </Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>
            By {props.listing.author?.name || 'Anonymous'}
          </Text>
          <Text style={styles.createdDate}>
            {new Date(props.listing.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.voteButtons}>
          <Card
            style={StyleSheet.flatten([
              styles.voteButton,
              props.listing.userVote === 'UP' && styles.voteButtonActive,
              voteMutation.isPending && styles.voteButtonDisabled,
            ])}
            padding="sm"
            onPress={() => handleVote('up')}
          >
            <Text
              style={[
                styles.voteButtonText,
                props.listing.userVote === 'UP' && styles.voteButtonTextActive,
                voteMutation.isPending && styles.voteButtonTextDisabled,
              ]}
            >
              👍 {props.listing.upvotes || 0}
            </Text>
          </Card>

          <Card
            style={StyleSheet.flatten([
              styles.voteButton,
              props.listing.userVote === 'DOWN' && styles.voteButtonActive,
              voteMutation.isPending && styles.voteButtonDisabled,
            ])}
            padding="sm"
            onPress={() => handleVote('down')}
          >
            <Text
              style={[
                styles.voteButtonText,
                props.listing.userVote === 'DOWN' &&
                  styles.voteButtonTextActive,
                voteMutation.isPending && styles.voteButtonTextDisabled,
              ]}
            >
              👎 {props.listing.downvotes || 0}
            </Text>
          </Card>
        </View>
      </View>
    </Card>
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
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.lg,
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
