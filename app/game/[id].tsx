import { getErrorMessage } from '@/lib/utils'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  Platform,
  Share,
  StyleSheet,
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
} from 'react-native-reanimated'

import { ListingCard } from '@/components/cards'
import GameMediaSection from '@/components/game/GameMediaSection'
import { GlowText, GradientTitle, TypewriterText } from '@/components/themed/ThemedText'
import { GlassView } from '@/components/themed/ThemedView'
import { CachedImage, EmptyState, SkeletonLoader, ScreenLayout } from '@/components/ui'
import {
  AnimatedPressable,
  MICRO_SPRING_CONFIG,
} from '@/components/ui/MicroInteractions'
import { useTheme } from '@/contexts/ThemeContext'
import { ANIMATION_CONFIG, getBaseDelay, getStaggerDelay } from '@/lib/animation/config'
import { useGameById, useListingsByGame } from '@/lib/api/hooks'
import { EMULATOR_PRESETS, EmulatorService } from '@/lib/services/emulator'
import type { Listing } from '@/types'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.5
const PARALLAX_HEIGHT = HEADER_HEIGHT * 1.2
const _isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { theme } = useTheme()
  const [selectedTab, setSelectedTab] = useState<'overview' | 'listings' | 'stats'>('overview')
  const [_refreshing, _setRefreshing] = useState(false)

  const scrollY = useSharedValue(0)
  const headerOpacity = useSharedValue(1)

  // Enhanced 2025 animation values
  const heroGlow = useSharedValue(0)
  const gameFloat = useSharedValue(0)
  const backgroundShift = useSharedValue(0)
  const tabScale = useSharedValue(1)
  const statsFloat = useSharedValue(0)
  const particleFlow = useSharedValue(0)
  const coverScale = useSharedValue(0.9)

  // API hooks - MUST be called before any conditional returns
  const gameQuery = useGameById({ id: id! }, { enabled: !!id })
  const listingsQuery = useListingsByGame({ gameId: id! }, { enabled: !!id })

  // Animated styles - MUST be defined before any conditional returns
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT * 0.3],
      Extrapolation.CLAMP,
    )

    const scale = interpolate(scrollY.value, [0, HEADER_HEIGHT], [1, 1.2], Extrapolation.CLAMP)

    return {
      transform: [{ translateY }, { scale }],
      opacity: headerOpacity.value,
    }
  })

  const headerOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT * 0.4, HEADER_HEIGHT * 0.8],
      [0, 0.5, 0.9],
      Extrapolation.CLAMP,
    )

    return {
      opacity,
    }
  })


  const heroGlowStyle = useAnimatedStyle(() => ({
    opacity: heroGlow.value,
  }))

  const gameFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: 0 }],
  }))

  const coverScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coverScale.value }],
  }))

  const statsFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: 0 }],
  }))


  useEffect(() => {
    // Initialize cosmic background animation
    backgroundShift.value = withRepeat(
      withSequence(withTiming(1, { duration: 20000 }), withTiming(0, { duration: 20000 })),
      -1,
      true,
    )

    // Hero glow animation
    heroGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 3000 }), withTiming(0.3, { duration: 3000 })),
      -1,
      true,
    )

    // Game floating animation
    // gameFloat.value = withRepeat(
    //   withSequence(withTiming(10, { duration: 5000 }), withTiming(-10, { duration: 5000 })),
    //   -1,
    //   true,
    // )

    // Stats floating animation
    // statsFloat.value = withRepeat(
    //   withSequence(withTiming(5, { duration: 4000 }), withTiming(-5, { duration: 4000 })),
    //   -1,
    //   true,
    // )

    // Particle flow animation
    particleFlow.value = withRepeat(withTiming(1, { duration: 12000 }), -1, false)

    // Cover scale entrance
    coverScale.value = withSpring(1, MICRO_SPRING_CONFIG.bouncy)
  }, [backgroundShift, coverScale, gameFloat, heroGlow, particleFlow, statsFloat])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y

      // Update header opacity
      const opacity = interpolate(
        scrollY.value,
        [0, HEADER_HEIGHT * 0.3, HEADER_HEIGHT * 0.7],
        [1, 0.8, 0],
        Extrapolation.CLAMP,
      )
      headerOpacity.value = withSpring(opacity)
    },
  })

  const _onRefresh = async () => {
    _setRefreshing(true)
    try {
      await Promise.all([gameQuery.refetch(), listingsQuery.refetch()])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      _setRefreshing(false)
    }
  }

  const handleShare = async () => {
    if (!gameQuery.data) return

    try {
      await Share.share({
        message: `Check out ${gameQuery.data.title} on EmuReady!`,
        url: `https://emuready.com/game/${id}`,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleLaunchEmulator = async (presetName: string) => {
    if (!gameQuery.data) return

    try {
      // For now, using a hardcoded title ID - in the future this would come from game data
      const titleId = '0100000000010000'

      await EmulatorService.launchGameWithPreset(titleId, presetName)
    } catch (error) {
      console.error('Error launching emulator:', error)

      if (error instanceof Error) {
        if (error.message.includes('not installed') || error.message.includes('Failed to launch')) {
          Alert.alert(
            'Eden Emulator Required',
            'The Eden emulator app was not found on your device. Eden emulator is a custom application that needs to be installed separately.\n\nPlease ensure you have the Eden emulator APK installed on your device.',
            [
              {
                text: 'OK',
                style: 'default',
              },
            ],
          )
        } else {
          Alert.alert('Launch Error', getErrorMessage(error))
        }
      }
    }
  }

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverviewTab()
      case 'listings':
        return renderListingsTab()
      case 'stats':
        return renderStatsTab()
      default:
        return renderOverviewTab()
    }
  }

  const renderOverviewTab = () => (
    <View style={{ padding: theme.spacing.lg }}>
      {/* Game Info Card - Enhanced with 2025 design */}
      <Animated.View
        entering={FadeInUp.delay(getBaseDelay('fast')).duration(ANIMATION_CONFIG.timing.fast)}
        style={statsFloatStyle}
      >
        <GlassView
          borderRadius={theme.borderRadius.xl}
          blurIntensity={20}
          style={{
            marginBottom: theme.spacing.lg,
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.surface,
          }}
        >
            <GradientTitle
              animated
              style={{
                fontSize: theme.typography.fontSize.xxl,
                fontWeight: theme.typography.fontWeight.bold,
                marginBottom: theme.spacing.sm,
              }}
            >
              Game Information
            </GradientTitle>

            <View style={{ flexDirection: 'row', marginBottom: theme.spacing.md }}>
              <GlowText
                style={{
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.textMuted,
                  width: 80,
                }}
              >
                System:
              </GlowText>
              <TypewriterText
                animated
                delay={800}
                style={{
                  fontSize: theme.typography.fontSize.md,
                  color: theme.colors.text,
                  flex: 1,
                }}
              >
                {gameQuery.data?.system?.name || 'Unknown'}
              </TypewriterText>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: theme.spacing.md }}>
              <GlowText
                style={{
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.textMuted,
                  width: 80,
                }}
              >
                Status:
              </GlowText>
              <View
                style={{
                  backgroundColor: theme.colors.successLight,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borderRadius.sm,
                }}
              >
                <GlowText
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.success,
                  }}
                >
                  Approved
                </GlowText>
              </View>
            </View>
          </GlassView>
      </Animated.View>

      {/* Performance Stats - Enhanced with holographic effects */}
      <Animated.View
        entering={FadeInUp.delay(getBaseDelay('normal')).duration(ANIMATION_CONFIG.timing.fast)}
      >
        <LinearGradient
          colors={theme.colors.gradients.primary}
          style={{
            marginBottom: theme.spacing.lg,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.xl,
          }}
        >
            <GradientTitle
              animated
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.textInverse,
                marginBottom: theme.spacing.md,
              }}
            >
              Performance Overview
            </GradientTitle>

            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.md,
              }}
            >
              <GlowText
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.textInverse,
                  textAlign: 'center',
                }}
              >
                {listingsQuery.data?.length || 0} Performance Reports
              </GlowText>
            </View>
          </LinearGradient>
      </Animated.View>

      {/* Emulator Launch Options - Enhanced for Gamepad */}
      {Platform.OS === 'android' && (
        <Animated.View
          entering={FadeInUp.delay(getBaseDelay('normal')).duration(ANIMATION_CONFIG.timing.fast)}
        >
          <GlassView
            borderRadius={theme.borderRadius.xl}
            blurIntensity={20}
            style={{ 
              marginBottom: theme.spacing.lg,
              padding: theme.spacing.lg,
              backgroundColor: theme.colors.surface,
            }}
          >
              <GradientTitle
                animated
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.bold,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Launch with Eden Emulator
              </GradientTitle>

              <TypewriterText
                animated
                delay={600}
                style={{
                  fontSize: theme.typography.fontSize.md,
                  color: theme.colors.textMuted,
                  marginBottom: theme.spacing.md,
                }}
              >
                Launch this game directly with optimized settings using the Eden Nintendo Switch
                emulator (requires Eden emulator APK to be installed)
              </TypewriterText>

              {EMULATOR_PRESETS.map((preset, index) => (
                <Animated.View
                  key={preset.name}
                  entering={FadeInUp.delay(getStaggerDelay(index, 'normal', 'fast')).duration(
                    ANIMATION_CONFIG.timing.fast,
                  )}
                  style={{ marginBottom: theme.spacing.sm }}
                >
                  <AnimatedPressable
                    onPress={() => {
                      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
                      handleLaunchEmulator(preset.name)
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.colors.surface,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        padding: theme.spacing.md,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: theme.spacing.sm,
                        borderRadius: theme.borderRadius.lg,
                      }}
                    >
                      <Ionicons name="play" size={24} color={theme.colors.primary} />
                      <View style={{ flex: 1 }}>
                        <GlowText
                          style={{
                            fontSize: theme.typography.fontSize.md,
                            fontWeight: theme.typography.fontWeight.semibold,
                            color: theme.colors.text,
                            marginBottom: 2,
                          }}
                        >
                          {preset.name}
                        </GlowText>
                        <TypewriterText
                          animated
                          delay={700 + index * 100}
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.textMuted,
                          }}
                        >
                          {preset.description}
                        </TypewriterText>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </View>
                  </AnimatedPressable>
                </Animated.View>
              ))}
            </GlassView>
        </Animated.View>
      )}

      {/* Game Media Section */}
      <Animated.View
        entering={FadeInUp.delay(getBaseDelay('fast')).duration(ANIMATION_CONFIG.timing.fast)}
      >
        <GameMediaSection gameName={gameQuery.data?.title || ''} gameId={gameQuery.data?.id} />
      </Animated.View>
    </View>
  )

  const renderListingsTab = () => (
    <View style={{ padding: theme.spacing.lg }}>
      {listingsQuery.isLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp.delay(index * 100).springify()}
            style={{ marginBottom: theme.spacing.md }}
          >
            <SkeletonLoader width="100%" height={120} borderRadius={theme.borderRadius.lg} />
          </Animated.View>
        ))
      ) : listingsQuery.data && listingsQuery.data.length > 0 ? (
        listingsQuery.data.map((listing: Listing, index: number) => (
          <Animated.View
            key={listing.id}
            entering={FadeInUp.delay(getStaggerDelay(index, 'fast', 'fast')).duration(
              ANIMATION_CONFIG.timing.fast,
            )}
            style={{ marginBottom: theme.spacing.md }}
          >
            <ListingCard
              listing={listing}
              onPress={() => router.push(`/listing/${listing.id}`)}
            />
          </Animated.View>
        ))
      ) : (
        <EmptyState
          icon="game-controller"
          title="No Performance Reports"
          subtitle="Be the first to share how this game runs on your device!"
          actionLabel="Create Report"
          onAction={() => router.push('/(tabs)/create')}
        />
      )}
    </View>
  )

  const renderStatsTab = () => (
    <View style={{ padding: theme.spacing.lg }}>
      <Animated.View
        entering={FadeInUp.delay(getBaseDelay('fast')).duration(ANIMATION_CONFIG.timing.fast)}
      >
        <GlassView
          borderRadius={theme.borderRadius.xl}
          blurIntensity={20}
          style={{ 
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.surface,
          }}
        >
            <GradientTitle
              animated
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                textAlign: 'center',
              }}
            >
              Game Statistics
            </GradientTitle>
            <TypewriterText
              animated
              delay={500}
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.textMuted,
                textAlign: 'center',
                marginTop: theme.spacing.sm,
              }}
            >
              Coming soon...
            </TypewriterText>
          </GlassView>
      </Animated.View>
    </View>
  )

  // Guard against missing id
  if (!id) {
    return (
      <ScreenLayout scrollable={false}>
        <EmptyState
          icon="alert-circle"
          title="Invalid Game"
          subtitle="The game you're looking for could not be found."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </ScreenLayout>
    )
  }

  // Loading state
  if (gameQuery.isLoading) {
    return (
      <ScreenLayout scrollable={false}>
        {/* Header Skeleton */}
        <View style={{ height: HEADER_HEIGHT }}>
          <SkeletonLoader width="100%" height={HEADER_HEIGHT} />
          <View
            style={{
              position: 'absolute',
              bottom: theme.spacing.xl,
              left: theme.spacing.lg,
              right: theme.spacing.lg,
            }}
          >
            <SkeletonLoader
              width="80%"
              height={32}
              borderRadius={theme.borderRadius.sm}
              style={{ marginBottom: theme.spacing.sm }}
            />
            <SkeletonLoader width="60%" height={20} borderRadius={theme.borderRadius.sm} />
          </View>
        </View>

        {/* Tab Skeleton */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            backgroundColor: theme.colors.surface,
          }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonLoader
              key={index}
              width={80}
              height={32}
              borderRadius={theme.borderRadius.lg}
              style={{ marginRight: theme.spacing.sm }}
            />
          ))}
        </View>

        {/* Content Skeleton */}
        <View style={{ flex: 1, padding: theme.spacing.lg, gap: theme.spacing.md }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonLoader
              key={index}
              width="100%"
              height={120}
              borderRadius={theme.borderRadius.lg}
            />
          ))}
        </View>
      </ScreenLayout>
    )
  }

  // Error state
  if (gameQuery.error) {
    return (
      <ScreenLayout scrollable={false}>
        <EmptyState
          icon="alert-circle"
          title="Error Loading Game"
          subtitle="We couldn't load this game. Please try again."
          actionLabel="Retry"
          onAction={() => gameQuery.refetch()}
        />
      </ScreenLayout>
    )
  }

  const game = gameQuery.data

  return (
    <ScreenLayout scrollable={false}>
      {/* Simple gradient background */}
      <LinearGradient
        colors={theme.isDark ? [theme.colors.background, '#000000'] : [theme.colors.background, '#f5f5f5']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Enhanced Parallax Header with Holographic Effects */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: PARALLAX_HEIGHT,
            zIndex: 1,
          },
          headerAnimatedStyle,
        ]}
      >
        <Animated.View style={coverScaleStyle}>
          <CachedImage
            source={{
              uri:
                game?.imageUrl || game?.boxartUrl || game?.bannerUrl || 'https://via.placeholder.com/400x600',
            }}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </Animated.View>

        {/* Enhanced Gradient Overlay with Glow */}
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
              'rgba(0, 0, 0, 0.3)',
              'rgba(0, 0, 0, 0.7)',
              theme.colors.background,
            ]}
            style={{ flex: 1 }}
          />
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              heroGlowStyle,
              {
                backgroundColor: theme.colors.primary,
                opacity: 0.1,
              },
            ]}
          />
        </Animated.View>
      </Animated.View>

      {/* Navigation Header */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <BlurView
          intensity={80}
          tint={theme.isDark ? 'dark' : 'light'}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            paddingTop: theme.spacing.xxl,
          }}
        >
          <AnimatedPressable
            onPress={() => {
              runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
              router.back()
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                backgroundColor: theme.colors.glass,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 22,
              }}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </View>
          </AnimatedPressable>

          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <AnimatedPressable
              onPress={() => {
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
                handleShare()
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: theme.colors.glass,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 22,
                }}
              >
                <Ionicons name="share" size={20} color={theme.colors.text} />
              </View>
            </AnimatedPressable>
          </View>
        </BlurView>
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT - theme.spacing.xxl,
        }}
      >
        {/* Enhanced Game Title Section with Animations */}
        <Animated.View
          entering={FadeInDown.delay(getBaseDelay('instant')).duration(
            ANIMATION_CONFIG.timing.fast,
          )}
          style={[
            {
              padding: theme.spacing.lg,
              paddingBottom: 0,
            },
            gameFloatStyle,
          ]}
        >
          <GradientTitle
            animated
            style={{
              fontSize: theme.typography.fontSize.xxxl,
              fontWeight: theme.typography.fontWeight.extrabold,
              marginBottom: theme.spacing.sm,
              lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize.xxxl,
            }}
          >
            {game?.title}
          </GradientTitle>

          {game?.system && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: theme.spacing.lg,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.xs,
                  marginRight: theme.spacing.sm,
                  borderRadius: theme.borderRadius.lg,
                }}
              >
                <GlowText
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.textInverse,
                  }}
                >
                  {game.system.name}
                </GlowText>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Enhanced Tab Navigation - Gamepad Optimized */}
        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          style={{
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
          }}
        >
          <GlassView
            borderRadius={theme.borderRadius.xl}
            blurIntensity={30}
            style={{
              flexDirection: 'row',
              backgroundColor: theme.colors.glass,
              padding: theme.spacing.xs,
            }}
          >
            {[
              {
                key: 'overview',
                label: 'Overview',
                icon: 'information-circle',
              },
              { key: 'listings', label: 'Reports', icon: 'list' },
              { key: 'stats', label: 'Stats', icon: 'stats-chart' },
            ].map((tab) => (
              <AnimatedPressable
                key={tab.key}
                onPress={() => {
                  runOnJS(Haptics.selectionAsync)()
                  tabScale.value = withSequence(
                    withSpring(0.95, MICRO_SPRING_CONFIG.instant),
                    withSpring(1, MICRO_SPRING_CONFIG.bouncy),
                  )
                  setSelectedTab(tab.key as any)
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: theme.spacing.md,
                    paddingHorizontal: theme.spacing.sm,
                    backgroundColor: selectedTab === tab.key ? theme.colors.primary : 'transparent',
                    borderRadius: theme.borderRadius.lg,
                  }}
                >
                  {selectedTab === tab.key && (
                    <LinearGradient
                      colors={theme.colors.gradients.primary}
                      style={[StyleSheet.absoluteFillObject, { opacity: 0.9 }]}
                    />
                  )}
                  <Ionicons
                    name={tab.icon as any}
                    size={16}
                    color={
                      selectedTab === tab.key ? theme.colors.textInverse : theme.colors.textMuted
                    }
                    style={{ marginRight: theme.spacing.xs }}
                  />
                  <GlowText
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color:
                        selectedTab === tab.key ? theme.colors.textInverse : theme.colors.textMuted,
                    }}
                  >
                    {tab.label}
                  </GlowText>
                </View>
              </AnimatedPressable>
            ))}
          </GlassView>
        </Animated.View>

        {/* Tab Content */}
        {renderTabContent()}
      </Animated.ScrollView>
    </ScreenLayout>
  )
}
