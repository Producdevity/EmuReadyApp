import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeInUp,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import { GlowText, GradientTitle, TypewriterText } from '@/components/themed/ThemedText'
import { GlassView, HolographicView, MagneticView } from '@/components/themed/ThemedView'
import { Button, CachedImage, Card, EmptyState, SkeletonLoader } from '@/components/ui'
import FluidGradient from '@/components/ui/FluidGradient'
import {
  AnimatedPressable,
  FloatingElement,
  MICRO_SPRING_CONFIG,
} from '@/components/ui/MicroInteractions'
import ReportButton from '@/components/ui/ReportButton'
import { useTheme } from '@/contexts/ThemeContext'
import { getStaggerDelay } from '@/lib/animation/config'
import {
  useCreateComment,
  useListingById,
  useListingComments,
  useUserVote,
  useVoteListing,
} from '@/lib/api/hooks'
import { useAuth } from '@/lib/auth/clerk'
import type { Comment } from '@/types'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.4
const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { theme } = useTheme()
  const { isSignedIn } = useAuth()

  const [refreshing, setRefreshing] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showCommentForm, setShowCommentForm] = useState(false)

  const scrollY = useSharedValue(0)

  // Enhanced 2025 animation values
  const heroGlow = useSharedValue(0)
  const listingFloat = useSharedValue(0)
  const backgroundShift = useSharedValue(0)
  const voteScale = useSharedValue(1)
  const statsFloat = useSharedValue(0)
  const particleFlow = useSharedValue(0)
  const performanceGlow = useSharedValue(0)

  // API hooks
  const listingQuery = useListingById({ id: id! }, { enabled: !!id })
  const commentsQuery = useListingComments({ listingId: id! }, { enabled: !!id })
  const userVoteQuery = useUserVote({ listingId: id! }, { enabled: !!id && isSignedIn })
  const voteMutation = useVoteListing()
  const addCommentMutation = useCreateComment()

  useEffect(() => {
    // Initialize cosmic background animation
    backgroundShift.value = withRepeat(
      withSequence(withTiming(1, { duration: 18000 }), withTiming(0, { duration: 18000 })),
      -1,
      true,
    )

    // Hero glow animation
    heroGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 3500 }), withTiming(0.3, { duration: 3500 })),
      -1,
      true,
    )

    // Listing floating animation
    listingFloat.value = withRepeat(
      withSequence(withTiming(15, { duration: 5500 }), withTiming(-15, { duration: 5500 })),
      -1,
      true,
    )

    // Stats floating animation
    statsFloat.value = withRepeat(
      withSequence(withTiming(8, { duration: 4500 }), withTiming(-8, { duration: 4500 })),
      -1,
      true,
    )

    // Particle flow animation
    particleFlow.value = withRepeat(withTiming(1, { duration: 15000 }), -1, false)

    // Performance glow animation
    performanceGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 2000 }), withTiming(0.5, { duration: 2000 })),
      -1,
      true,
    )
  }, [])

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
      Extrapolation.CLAMP,
    )

    const scale = interpolate(scrollY.value, [0, HEADER_HEIGHT], [1, 1.1], Extrapolation.CLAMP)

    return {
      transform: [{ translateY }, { scale }],
    }
  })

  const headerOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT * 0.3, HEADER_HEIGHT * 0.7],
      [0, 0.3, 0.8],
      Extrapolation.CLAMP,
    )

    return { opacity }
  })

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([listingQuery.refetch(), commentsQuery.refetch(), userVoteQuery.refetch()])
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
      await Promise.all([listingQuery.refetch(), userVoteQuery.refetch()])
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
      case 49:
        return theme.colors.performance.perfect
      case 50:
        return theme.colors.performance.great
      case 51:
        return theme.colors.performance.good
      case 52:
        return theme.colors.performance.poor
      default:
        return theme.colors.performance.unplayable
    }
  }

  const getPerformanceLabel = (performanceId: number) => {
    switch (performanceId) {
      case 49:
        return 'Perfect'
      case 50:
        return 'Great'
      case 51:
        return 'Playable'
      case 52:
        return 'Poor'
      default:
        return 'Unplayable'
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
          <SkeletonLoader
            width="100%"
            height={200}
            borderRadius={theme.borderRadius.lg}
            style={{ marginBottom: theme.spacing.lg }}
          />
          <SkeletonLoader
            width="100%"
            height={150}
            borderRadius={theme.borderRadius.lg}
            style={{ marginBottom: theme.spacing.lg }}
          />
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

  // Animated styles for cosmic background
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(backgroundShift.value, [0, 1], [-100, 100], Extrapolation.CLAMP),
      },
    ],
  }))

  const heroGlowStyle = useAnimatedStyle(() => ({
    opacity: heroGlow.value,
  }))

  const listingFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: listingFloat.value }],
  }))

  const voteScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voteScale.value }],
  }))

  const statsFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: statsFloat.value }],
  }))

  const performanceGlowStyle = useAnimatedStyle(() => ({
    opacity: performanceGlow.value,
  }))

  const particleFlowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          particleFlow.value,
          [0, 1],
          [-200, SCREEN_WIDTH + 200],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(particleFlow.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
  }))

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Revolutionary Cosmic Background */}
      <Animated.View style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}>
        <FluidGradient
          variant="aurora"
          animated
          speed="slow"
          style={StyleSheet.absoluteFillObject}
          opacity={0.3}
        />
      </Animated.View>

      {/* Floating Particles */}
      <Animated.View style={[{ position: 'absolute', top: '25%' }, particleFlowStyle]}>
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: `${theme.colors.primary}30`,
          }}
        />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', top: '55%' }, particleFlowStyle]}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: `${theme.colors.secondary}30`,
          }}
        />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', top: '85%' }, particleFlowStyle]}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: `${theme.colors.accent}30`,
          }}
        />
      </Animated.View>

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
            uri:
              listing?.game?.coverImageUrl ||
              listing?.game?.boxArtUrl ||
              'https://via.placeholder.com/400x600',
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
        <BlurView
          intensity={80}
          tint={theme.isDark ? 'dark' : 'light'}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
          }}
        >
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

            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.colors.glass,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ReportButton
                listingId={id!}
                listingTitle={listing?.game?.title}
                variant="button"
                size="sm"
                showText={false}
              />
            </View>
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
          <Text
            style={{
              fontSize: theme.typography.fontSize.xxxl,
              fontWeight: theme.typography.fontWeight.extrabold,
              color: theme.colors.text,
              marginBottom: theme.spacing.sm,
              lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize.xxxl,
            }}
          >
            {listing?.game?.title}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: theme.spacing.lg,
              flexWrap: 'wrap',
              gap: theme.spacing.sm,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.lg,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.textInverse,
                }}
              >
                {listing?.game?.system?.name}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: getPerformanceColor(listing?.performance?.id || 0),
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.lg,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.textInverse,
                }}
              >
                {getPerformanceLabel(listing?.performance?.id || 0)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Setup Information */}
        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          style={{ padding: theme.spacing.lg }}
        >
          <Card style={{ marginBottom: theme.spacing.lg, overflow: 'hidden' }}>
            <LinearGradient
              colors={theme.colors.gradients.card}
              style={{ padding: theme.spacing.lg }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text,
                  marginBottom: theme.spacing.lg,
                }}
              >
                Setup Information
              </Text>

              <View style={{ gap: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: `${theme.colors.primary}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: theme.spacing.md,
                    }}
                  >
                    <Ionicons name="hardware-chip" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.textMuted,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      Device
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text,
                      }}
                    >
                      {listing?.device?.brand?.name} {listing?.device?.modelName}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: `${theme.colors.secondary}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: theme.spacing.md,
                    }}
                  >
                    <Ionicons name="apps" size={20} color={theme.colors.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.textMuted,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      Emulator
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text,
                      }}
                    >
                      {listing?.emulator?.name}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Card>

          {/* Enhanced Performance Notes */}
          {listing?.notes && (
            <HolographicView
              morphing
              borderRadius={theme.borderRadius.xl}
              style={{ marginBottom: theme.spacing.lg }}
            >
              <GlassView
                borderRadius={theme.borderRadius.xl}
                blurIntensity={20}
                style={{ padding: theme.spacing.lg }}
              >
                <GradientTitle
                  animated
                  style={{
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.bold,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Performance Notes
                </GradientTitle>
                <TypewriterText
                  animated
                  delay={700}
                  style={{
                    fontSize: theme.typography.fontSize.md,
                    color: theme.colors.textSecondary,
                    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
                  }}
                >
                  {listing.notes}
                </TypewriterText>
              </GlassView>
            </HolographicView>
          )}

          {/* Enhanced Voting Section - Gamepad Optimized */}
          <HolographicView
            morphing
            borderRadius={theme.borderRadius.xl}
            style={{ marginBottom: theme.spacing.lg, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={theme.colors.gradients.primary}
              style={{ padding: theme.spacing.lg }}
            >
              <GradientTitle
                animated
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.textInverse,
                  marginBottom: theme.spacing.lg,
                  textAlign: 'center',
                }}
              >
                Was this helpful?
              </GradientTitle>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                }}
              >
                <AnimatedPressable
                  onPress={() => {
                    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
                    voteScale.value = withSequence(
                      withSpring(0.95, MICRO_SPRING_CONFIG.instant),
                      withSpring(1, MICRO_SPRING_CONFIG.bouncy),
                    )
                    handleVote(true)
                  }}
                  disabled={voteMutation.isPending}
                >
                  <Animated.View style={voteScaleStyle}>
                    <MagneticView
                      borderRadius={theme.borderRadius.lg}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        paddingHorizontal: theme.spacing.lg,
                        paddingVertical: theme.spacing.md,
                        opacity: userVoteQuery.data === true ? 1 : 0.7,
                      }}
                    >
                      <FloatingElement intensity={1} duration={2000}>
                        <Ionicons
                          name={userVoteQuery.data === true ? 'thumbs-up' : 'thumbs-up-outline'}
                          size={24}
                          color={theme.colors.textInverse}
                        />
                      </FloatingElement>
                      <GlowText
                        style={{
                          fontSize: theme.typography.fontSize.lg,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.textInverse,
                          marginLeft: theme.spacing.sm,
                        }}
                      >
                        {listing?.upVotes || 0}
                      </GlowText>
                    </MagneticView>
                  </Animated.View>
                </AnimatedPressable>

                <AnimatedPressable
                  onPress={() => {
                    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
                    voteScale.value = withSequence(
                      withSpring(0.95, MICRO_SPRING_CONFIG.instant),
                      withSpring(1, MICRO_SPRING_CONFIG.bouncy),
                    )
                    handleVote(false)
                  }}
                  disabled={voteMutation.isPending}
                >
                  <Animated.View style={voteScaleStyle}>
                    <MagneticView
                      borderRadius={theme.borderRadius.lg}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        paddingHorizontal: theme.spacing.lg,
                        paddingVertical: theme.spacing.md,
                        opacity: userVoteQuery.data === false ? 1 : 0.7,
                      }}
                    >
                      <FloatingElement intensity={1} duration={2000}>
                        <Ionicons
                          name={
                            userVoteQuery.data === false ? 'thumbs-down' : 'thumbs-down-outline'
                          }
                          size={24}
                          color={theme.colors.textInverse}
                        />
                      </FloatingElement>
                      <GlowText
                        style={{
                          fontSize: theme.typography.fontSize.lg,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.textInverse,
                          marginLeft: theme.spacing.sm,
                        }}
                      >
                        {listing?.downVotes || 0}
                      </GlowText>
                    </MagneticView>
                  </Animated.View>
                </AnimatedPressable>
              </View>
            </LinearGradient>
          </HolographicView>

          {/* Enhanced Comments Section */}
          <HolographicView morphing borderRadius={theme.borderRadius.xl}>
            <GlassView
              borderRadius={theme.borderRadius.xl}
              blurIntensity={20}
              style={{ padding: theme.spacing.lg }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: theme.spacing.lg,
                }}
              >
                <GradientTitle
                  animated
                  style={{
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.bold,
                  }}
                >
                  Comments ({commentsQuery.data?.length || 0})
                </GradientTitle>

                {isSignedIn && (
                  <Button
                    title={showCommentForm ? 'Cancel' : 'Add Comment'}
                    variant={showCommentForm ? 'outline' : 'primary'}
                    size="sm"
                    onPress={() => setShowCommentForm(!showCommentForm)}
                  />
                )}
              </View>

              {/* Comment Form */}
              {showCommentForm && (
                <Animated.View entering={ZoomIn.springify()}>
                  <View
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.borderRadius.lg,
                      padding: theme.spacing.md,
                      marginBottom: theme.spacing.lg,
                    }}
                  >
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
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        marginTop: theme.spacing.md,
                        gap: theme.spacing.sm,
                      }}
                    >
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
                    entering={FadeInUp.delay(getStaggerDelay(index, 'fast', 'fast')).springify()}
                    style={{ marginBottom: theme.spacing.md }}
                  >
                    <FloatingElement intensity={1} duration={3000 + index * 200}>
                      <MagneticView
                        borderRadius={theme.borderRadius.md}
                        style={{
                          backgroundColor: theme.colors.surface,
                          padding: theme.spacing.md,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: theme.spacing.sm,
                          }}
                        >
                          <GlowText
                            style={{
                              fontSize: theme.typography.fontSize.sm,
                              fontWeight: theme.typography.fontWeight.semibold,
                              color: theme.colors.primary,
                            }}
                          >
                            {(comment as any).author?.name || 'Anonymous'}
                          </GlowText>
                          <TypewriterText
                            animated
                            delay={800 + index * 100}
                            style={{
                              fontSize: theme.typography.fontSize.xs,
                              color: theme.colors.textMuted,
                            }}
                          >
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </TypewriterText>
                        </View>
                        <TypewriterText
                          animated
                          delay={900 + index * 100}
                          style={{
                            fontSize: theme.typography.fontSize.md,
                            color: theme.colors.text,
                            lineHeight:
                              theme.typography.lineHeight.normal * theme.typography.fontSize.md,
                          }}
                        >
                          {comment.content}
                        </TypewriterText>
                      </MagneticView>
                    </FloatingElement>
                  </Animated.View>
                ))
              ) : (
                <HolographicView morphing borderRadius={theme.borderRadius.xl}>
                  <EmptyState
                    icon="chatbubble"
                    title="No Comments Yet"
                    subtitle="Be the first to share your thoughts!"
                    actionLabel={isSignedIn ? 'Add Comment' : 'Sign In to Comment'}
                    onAction={() => {
                      if (isSignedIn) {
                        setShowCommentForm(true)
                      } else {
                        router.push('/(auth)/sign-in')
                      }
                    }}
                  />
                </HolographicView>
              )}
            </GlassView>
          </HolographicView>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  )
}
