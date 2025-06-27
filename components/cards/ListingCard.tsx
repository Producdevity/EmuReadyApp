import React, { memo } from 'react'
import { StyleSheet, Text, View, Alert, type ViewStyle } from 'react-native'
import { useAuth } from '@clerk/clerk-expo'
import { Card } from '../ui'
import { useVoteListing } from '@/lib/api/hooks'
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
    if (rank >= 4) return '#10b981' // Perfect - Green
    if (rank >= 3) return '#3b82f6' // Great - Blue
    if (rank >= 2) return '#f59e0b' // Good - Yellow
    return '#ef4444' // Poor - Red
  }

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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gameInfo: {
    flex: 1,
    marginRight: 12,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  systemName: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  performanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  performanceText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  deviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 14,
    color: '#6b7280',
  },
  emulatorName: {
    fontSize: 14,
    color: '#6b7280',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
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
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  createdDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  voteButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  voteButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 50,
    alignItems: 'center',
  },
  voteButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  voteButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    opacity: 0.6,
  },
  voteButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  voteButtonTextActive: {
    color: '#ffffff',
  },
  voteButtonTextDisabled: {
    color: '#9ca3af',
  },
})

export const ListingCard = memo(ListingCardComponent)
