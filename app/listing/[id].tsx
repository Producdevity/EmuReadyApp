import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Pressable,
  Dimensions,
  Share,
  Alert,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  ZoomIn,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/lib/auth/clerk'
import { 
  useListingById, 
  useListingComments, 
  useVoteListing, 
  useCreateComment,
  useUserVote 
} from '@/lib/api/hooks'
import { CachedImage, Button, Card, EmptyState, SkeletonLoader } from '@/components/ui'
import type { Comment } from '@/types'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.4

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { theme } = useTheme()
  const { isSignedIn } = useAuth()
  
  const [refreshing, setRefreshing] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showCommentForm, setShowCommentForm] = useState(false)
  
  const scrollY = useSharedValue(0)

  // API hooks
  const listingQuery = useListingById({ id: id! }, { enabled: !!id })
  const commentsQuery = useListingComments({ listingId: id! }, { enabled: !!id })
  const userVoteQuery = useUserVote({ listingId: id! }, { enabled: !!id && isSignedIn })
  const voteMutation = useVoteListing()
  const addCommentMutation = useCreateComment()

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT * 0.2],
      Extrapolation.CLAMP
    )
    
    const scale = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [1, 1.1],
      Extrapolation.CLAMP
    )

    return {
      transform: [{ translateY }, { scale }],
    }
  })

  const headerOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT * 0.3, HEADER_HEIGHT * 0.7],
      [0, 0.3, 0.8],
      Extrapolation.CLAMP
    )
    
    return { opacity }
  })

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        listingQuery.refetch(),
        commentsQuery.refetch(),
        userVoteQuery.refetch(),
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleVote = async (value: boolean) => {
    if (!isSignedIn) {
      Alert.alert('Sign In Required', 'Please sign in to vote on performance reports.')
      return
    }

    try {
      await voteMutation.mutateAsync({
        listingId: id!,
        value,
      })
      await Promise.all([
        listingQuery.refetch(),
        userVoteQuery.refetch(),
      ])
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
        listingId: id!,
        content: commentText.trim(),
      })
      setCommentText('')
      setShowCommentForm(false)
      await commentsQuery.refetch()
    } catch {
      Alert.alert('Error', 'Failed to add comment. Please try again.')
    }
  }

  const handleShare = async () => {
    if (!listingQuery.data) return
    
    try {
      await Share.share({
        message: `Check out this ${listingQuery.data.game?.title} performance report on EmuReady!`,
        url: `https://emuready.com/listing/${id}`,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const getPerformanceColor = (performanceId: number) => {
    switch (performanceId) {
      case 49: return theme.colors.performance.perfect
      case 50: return theme.colors.performance.great
      case 51: return theme.colors.performance.good
      case 52: return theme.colors.performance.poor
      default: return theme.colors.performance.unplayable
    }
  }

  const getPerformanceLabel = (performanceId: number) => {
    switch (performanceId) {
      case 49: return 'Perfect'
      case 50: return 'Great'
      case 51: return 'Playable'
      case 52: return 'Poor'
      default: return 'Unplayable'
    }
  }

  // Guard against missing id
  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <EmptyState
          icon="alert-circle"
          title="Invalid Listing"
          subtitle="The performance report you're looking for could not be found."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    )
  }

  // Loading state
  if (listingQuery.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        
        {/* Header Skeleton */}
        <View style={{ height: HEADER_HEIGHT }}>
          <SkeletonLoader width="100%" height={HEADER_HEIGHT} />
        </View>

        {/* Content Skeleton */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg }}>
          <SkeletonLoader width="100%" height={200} borderRadius={theme.borderRadius.lg} style={{ marginBottom: theme.spacing.lg }} />
          <SkeletonLoader width="100%" height={150} borderRadius={theme.borderRadius.lg} style={{ marginBottom: theme.spacing.lg }} />
          <SkeletonLoader width="100%" height={100} borderRadius={theme.borderRadius.lg} />
        </ScrollView>
      </View>
    )
  }

  // Error state
  if (listingQuery.error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <EmptyState
          icon="alert-circle"
          title="Error Loading Report"
          subtitle="We couldn't load this performance report. Please try again."
          actionLabel="Retry"
          onAction={() => listingQuery.refetch()}
        />
      </SafeAreaView>
    )
  }

  const listing = listingQuery.data

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      
      {/* Hero Header */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: HEADER_HEIGHT,
            zIndex: 1,
          },
          headerAnimatedStyle,
        ]}
      >
        <CachedImage
          source={{ 
            uri: listing?.game?.coverImageUrl || listing?.game?.boxArtUrl || 'https://via.placeholder.com/400x600'
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
        
        {/* Gradient Overlay */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            },
            headerOverlayStyle,
          ]}
        >
          <LinearGradient
            colors={[
              'transparent',
              'rgba(0, 0, 0, 0.4)',
              'rgba(0, 0, 0, 0.8)',
              theme.colors.background,
            ]}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </Animated.View>

      {/* Navigation Header */}
      <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <BlurView intensity={80} tint={theme.isDark ? 'dark' : 'light'} style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.colors.glass,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>

          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Pressable
              onPress={handleShare}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.colors.glass,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="share" size={20} color={theme.colors.text} />
            </Pressable>
          </View>
        </BlurView>
      </SafeAreaView>

      {/* Scrollable Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            progressViewOffset={HEADER_HEIGHT * 0.8}
          />
        }
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingTop: HEADER_HEIGHT - theme.spacing.xl,
        }}
      >
        {/* Game & Performance Header */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={{
            padding: theme.spacing.lg,
            paddingBottom: 0,
          }}
        >
          <Text style={{
            fontSize: theme.typography.fontSize.xxxl,
            fontWeight: theme.typography.fontWeight.extrabold,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
            lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize.xxxl,
          }}>
            {listing?.game?.title}
          </Text>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
            flexWrap: 'wrap',
            gap: theme.spacing.sm,
          }}>
            <View style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.borderRadius.lg,
            }}>
              <Text style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.textInverse,
              }}>
                {listing?.game?.system?.name}
              </Text>
            </View>
            
            <View style={{
              backgroundColor: getPerformanceColor(listing?.performance?.id || 0),
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.borderRadius.lg,
            }}>
              <Text style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.textInverse,
              }}>
                {getPerformanceLabel(listing?.performance?.id || 0)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Setup Information */}
        <Animated.View entering={FadeInUp.delay(300).springify()} style={{ padding: theme.spacing.lg }}>
          <Card style={{ marginBottom: theme.spacing.lg, overflow: 'hidden' }}>
            <LinearGradient
              colors={theme.colors.gradients.card as [string, string, ...string[]]}
              style={{ padding: theme.spacing.lg }}
            >
              <Text style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.lg,
              }}>
                Setup Information
              </Text>

              <View style={{ gap: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${theme.colors.primary  }20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: theme.spacing.md,
                  }}>
                    <Ionicons name="hardware-chip" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textMuted,
                      marginBottom: theme.spacing.xs,
                    }}>
                      Device
                    </Text>
                    <Text style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text,
                    }}>
                      {listing?.device?.brand?.name} {listing?.device?.modelName}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${theme.colors.secondary  }20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: theme.spacing.md,
                  }}>
                    <Ionicons name="apps" size={20} color={theme.colors.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textMuted,
                      marginBottom: theme.spacing.xs,
                    }}>
                      Emulator
                    </Text>
                    <Text style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text,
                    }}>
                      {listing?.emulator?.name}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Card>

          {/* Performance Notes */}
          {listing?.notes && (
            <Card style={{ marginBottom: theme.spacing.lg }}>
              <View style={{ padding: theme.spacing.lg }}>
                <Text style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text,
                  marginBottom: theme.spacing.md,
                }}>
                  Performance Notes
                </Text>
                <Text style={{
                  fontSize: theme.typography.fontSize.md,
                  color: theme.colors.textSecondary,
                  lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
                }}>
                  {listing.notes}
                </Text>
              </View>
            </Card>
          )}

          {/* Voting Section */}
          <Card style={{ marginBottom: theme.spacing.lg, overflow: 'hidden' }}>
            <LinearGradient
              colors={theme.colors.gradients.primary as [string, string, ...string[]]}
              style={{ padding: theme.spacing.lg }}
            >
              <Text style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.textInverse,
                marginBottom: theme.spacing.lg,
                textAlign: 'center',
              }}>
                Was this helpful?
              </Text>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}>
                <Pressable
                  onPress={() => handleVote(true)}
                  disabled={voteMutation.isPending}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.md,
                    borderRadius: theme.borderRadius.lg,
                    opacity: userVoteQuery.data === true ? 1 : 0.7,
                  }}
                >
                  <Ionicons 
                    name={userVoteQuery.data === true ? "thumbs-up" : "thumbs-up-outline"} 
                    size={24} 
                    color={theme.colors.textInverse}
                  />
                  <Text style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.textInverse,
                    marginLeft: theme.spacing.sm,
                  }}>
                    {listing?.upVotes || 0}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleVote(false)}
                  disabled={voteMutation.isPending}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.md,
                    borderRadius: theme.borderRadius.lg,
                    opacity: userVoteQuery.data === false ? 1 : 0.7,
                  }}
                >
                  <Ionicons 
                    name={userVoteQuery.data === false ? "thumbs-down" : "thumbs-down-outline"} 
                    size={24} 
                    color={theme.colors.textInverse}
                  />
                  <Text style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.textInverse,
                    marginLeft: theme.spacing.sm,
                  }}>
                    {listing?.downVotes || 0}
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>
          </Card>

          {/* Comments Section */}
          <Card>
            <View style={{ padding: theme.spacing.lg }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.lg,
              }}>
                <Text style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text,
                }}>
                  Comments ({commentsQuery.data?.length || 0})
                </Text>
                
                {isSignedIn && (
                  <Button
                    title={showCommentForm ? "Cancel" : "Add Comment"}
                    variant={showCommentForm ? "outline" : "primary"}
                    size="sm"
                    onPress={() => setShowCommentForm(!showCommentForm)}
                  />
                )}
              </View>

              {/* Comment Form */}
              {showCommentForm && (
                <Animated.View entering={ZoomIn.springify()}>
                  <View style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    marginBottom: theme.spacing.lg,
                  }}>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: theme.borderRadius.md,
                        padding: theme.spacing.md,
                        fontSize: theme.typography.fontSize.md,
                        color: theme.colors.text,
                        minHeight: 100,
                        textAlignVertical: 'top',
                      }}
                      placeholder="Share your thoughts..."
                      placeholderTextColor={theme.colors.textMuted}
                      value={commentText}
                      onChangeText={setCommentText}
                      multiline
                      numberOfLines={4}
                    />
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      marginTop: theme.spacing.md,
                      gap: theme.spacing.sm,
                    }}>
                      <Button
                        title="Cancel"
                        variant="outline"
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
                        disabled={!commentText.trim() || addCommentMutation.isPending}
                      />
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Comments List */}
              {commentsQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <View key={index} style={{ marginBottom: theme.spacing.md }}>
                    <SkeletonLoader width="100%" height={80} borderRadius={theme.borderRadius.md} />
                  </View>
                ))
              ) : commentsQuery.data && commentsQuery.data.length > 0 ? (
                commentsQuery.data.map((comment: Comment, index: number) => (
                  <Animated.View
                    key={comment.id}
                    entering={FadeInUp.delay(index * 100).springify()}
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: theme.spacing.sm,
                    }}>
                      <Text style={{
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.primary,
                      }}>
                        {(comment as any).author?.name || 'Anonymous'}
                      </Text>
                      <Text style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.textMuted,
                      }}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: theme.typography.fontSize.md,
                      color: theme.colors.text,
                      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.md,
                    }}>
                      {comment.content}
                    </Text>
                  </Animated.View>
                ))
              ) : (
                <EmptyState
                  icon="chatbubble"
                  title="No Comments Yet"
                  subtitle="Be the first to share your thoughts!"
                  actionLabel={isSignedIn ? "Add Comment" : "Sign In to Comment"}
                  onAction={() => {
                    if (isSignedIn) {
                      setShowCommentForm(true)
                    } else {
                      router.push('/(auth)/sign-in')
                    }
                  }}
                />
              )}
            </View>
          </Card>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  )
}