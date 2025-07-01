import React, { useEffect, useState, useMemo } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  Pressable,
  TextInput,
  Animated,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Sharing from 'expo-sharing'
import { Button, Card } from '@/components/ui'
import { useAuth } from '@/lib/auth/clerk'
import { useListingById, useListingComments, useVoteListing, useCreateComment } from '@/lib/api/hooks'
import type { Comment, CustomFieldValue } from '@/types'

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const [commentText, setCommentText] = useState('')
  const [showCommentForm, setShowCommentForm] = useState(false)
  const fadeAnim = useMemo(() => new Animated.Value(0), [])

  // React Query hooks
  const listingQuery = useListingById({ id: id! }, { enabled: !!id })
  const commentsQuery = useListingComments({ listingId: id! }, { enabled: !!id })
  const voteMutation = useVoteListing()
  const addCommentMutation = useCreateComment()

  useEffect(() => {
    if (!id) return  // Guard against missing id in effect
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim, id])

  // Guard against missing id parameter
  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Invalid listing ID</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    )
  }

  const handleVote = async (type: 'up' | 'down') => {
    if (!isSignedIn) {
      Alert.alert('Sign In Required', 'Please sign in to vote on listings.')
      return
    }

    try {
      await voteMutation.mutateAsync({
        listingId: id,
        value: type === 'up',
      })
      listingQuery.refetch()
    } catch {
      Alert.alert('Error', 'Failed to submit vote. Please try again.')
    }
  }

  const handleAddComment = async () => {
    if (!isSignedIn) {
      Alert.alert('Sign In Required', 'Please sign in to add comments.')
      return
    }

    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment.')
      return
    }

    try {
      await addCommentMutation.mutateAsync({
        listingId: id,
        content: commentText.trim(),
      })
      setCommentText('')
      setShowCommentForm(false)
      listingQuery.refetch()
    } catch {
      Alert.alert('Error', 'Failed to add comment. Please try again.')
    }
  }

  const handleShare = async () => {
    try {
      const shareContent = `Check out this ${listingQuery.data?.game?.title} performance listing on EmuReady!\n\n` +
        `Device: ${listingQuery.data?.device?.brand?.name} ${listingQuery.data?.device?.modelName}\n` +
        `Emulator: ${listingQuery.data?.emulator?.name}\n` +
        `Performance: ${listingQuery.data?.performance?.label}\n\n` +
        `View more details in the EmuReady app!`

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareContent, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Performance Listing',
        })
      } else {
        Alert.alert('Share', shareContent)
      }
    } catch (error) {
      console.error('Share error:', error)
      Alert.alert('Error', 'Failed to share listing. Please try again.')
    }
  }

  if (listingQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading listing details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!listingQuery.data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to Load Listing</Text>
          <Text style={styles.errorText}>
            This listing may have been removed or you may not have permission to
            view it.
          </Text>
          <Button
            title="Go Back"
            variant="primary"
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {listingQuery.data.game?.title || 'Listing Details'}
        </Text>
        <Pressable onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#111827" />
        </Pressable>
      </View>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Info */}
        <Card style={styles.gameCard} padding="lg">
          <Text style={styles.gameTitle}>{listingQuery.data.game?.title}</Text>
          <Text style={styles.systemName}>{listingQuery.data.game?.system?.name}</Text>

          <View style={styles.gameDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Device:</Text>
              <Text style={styles.detailValue}>
                {listingQuery.data.device?.brand?.name} {listingQuery.data.device?.modelName}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Emulator:</Text>
              <Text style={styles.detailValue}>{listingQuery.data.emulator?.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Performance:</Text>
              <View
                style={[
                  styles.performanceBadge,
                  {
                    backgroundColor: getPerformanceColor(
                      listingQuery.data.performance?.rank,
                    ),
                  },
                ]}
              >
                <Text style={styles.performanceText}>
                  {listingQuery.data.performance?.label}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Voting Section */}
        <Card style={styles.votingCard} padding="md">
          <View style={styles.votingContainer}>
            <Pressable
              style={[styles.voteButton, styles.upvoteButton]}
              onPress={() => handleVote('up')}
              disabled={voteMutation.isPending}
            >
              <Ionicons name="thumbs-up" size={20} color="#10b981" />
              <Text style={styles.voteCount}>{listingQuery.data.upVotes || 0}</Text>
            </Pressable>

            <View style={styles.votingStats}>
              <Text style={styles.votingLabel}>Community Rating</Text>
              <Text style={styles.votingScore}>
                {(listingQuery.data.upVotes || 0) - (listingQuery.data.downVotes || 0)} points
              </Text>
            </View>

            <Pressable
              style={[styles.voteButton, styles.downvoteButton]}
              onPress={() => handleVote('down')}
              disabled={voteMutation.isPending}
            >
              <Ionicons name="thumbs-down" size={20} color="#ef4444" />
              <Text style={styles.voteCount}>{listingQuery.data.downVotes || 0}</Text>
            </Pressable>
          </View>
        </Card>

        {/* Custom Fields */}
        {listingQuery.data.customFieldValues && listingQuery.data.customFieldValues.length > 0 && (
          <Card style={styles.customFieldsCard} padding="md">
            <Text style={styles.sectionTitle}>Configuration Details</Text>
            {listingQuery.data.customFieldValues.map((field: CustomFieldValue, index: number) => (
              <View key={index} style={styles.customField}>
                <Text style={styles.customFieldLabel}>
                  {field.customFieldDefinition.label}:
                </Text>
                <Text style={styles.customFieldValue}>{field.value}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Notes */}
        {listingQuery.data.notes && (
          <Card style={styles.notesCard} padding="md">
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{listingQuery.data.notes}</Text>
          </Card>
        )}

        {/* Comments Section */}
        <Card style={styles.commentsCard} padding="md">
          <View style={styles.commentsHeader}>
            <Text style={styles.sectionTitle}>
              Comments ({commentsQuery.data?.length || 0})
            </Text>
            <Button
              title="Add Comment"
              variant="outline"
              size="sm"
              onPress={() => setShowCommentForm(!showCommentForm)}
            />
          </View>

          {/* Comment Form */}
          {showCommentForm && (
            <View style={styles.commentForm}>
              <TextInput
                style={styles.commentInput}
                placeholder="Share your thoughts about this listing..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9ca3af"
              />
              <View style={styles.commentActions}>
                <Button
                  title="Cancel"
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    setShowCommentForm(false)
                    setCommentText('')
                  }}
                />
                <Button
                  title="Post Comment"
                  variant="primary"
                  size="sm"
                  onPress={handleAddComment}
                  loading={addCommentMutation.isPending}
                />
              </View>
            </View>
          )}

          {/* Comments List */}
          {commentsQuery.isLoading ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading comments...</Text>
            </View>
          ) : commentsQuery.data && commentsQuery.data.length > 0 ? (
            <View style={styles.commentsList}>
              {commentsQuery.data.map((comment: Comment) => (
                <View key={comment.id} style={styles.comment}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>
                      {comment.user?.name || 'Anonymous'}
                    </Text>
                    <Text style={styles.commentDate}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noComments}>
              No comments yet. Be the first to share your thoughts!
            </Text>
          )}
        </Card>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

function getPerformanceColor(rank?: number): string {
  if (!rank) return '#6b7280'
  if (rank >= 4) return '#10b981' // Green for excellent
  if (rank >= 3) return '#f59e0b' // Yellow for good
  if (rank >= 2) return '#ef4444' // Red for poor
  return '#6b7280' // Gray for unknown
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  shareButton: {
    padding: 8,
    marginRight: -8,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  gameCard: {
    margin: 20,
    marginBottom: 16,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  systemName: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  gameDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  performanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  performanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  votingCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  votingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  upvoteButton: {
    backgroundColor: '#f0fdf4',
  },
  downvoteButton: {
    backgroundColor: '#fef2f2',
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  votingStats: {
    alignItems: 'center',
  },
  votingLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  votingScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  customFieldsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  customField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  customFieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  customFieldValue: {
    fontSize: 14,
    color: '#111827',
  },
  notesCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  commentsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentForm: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  loadingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  commentsList: {
    gap: 16,
  },
  comment: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  commentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  commentContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  noComments: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  bottomSpacing: {
    height: 20,
  },
})
