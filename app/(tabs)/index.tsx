import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, {
  BounceIn,
  Extrapolation,
  FadeInUp,
  interpolate,
  SlideInLeft,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ListingCard } from '@/components/cards'
import { GlowText, GradientTitle, HeroText, TypewriterText } from '@/components/themed/ThemedText'
import { HolographicView, MagneticView } from '@/components/themed/ThemedView'
import { Button, CachedImage, Card, SkeletonLoader } from '@/components/ui'
import FloatingActionButton from '@/components/ui/FloatingActionButton'
import FluidGradient, { AuroraGradient, CosmicGradient } from '@/components/ui/FluidGradient'
import {
  AnimatedPressable,
  FloatingElement,
  MICRO_SPRING_CONFIG,
} from '@/components/ui/MicroInteractions'
import { EnhancedSkeletonCard } from '@/components/ui/MorphingSkeleton'
import { useTheme } from '@/contexts/ThemeContext'
import { useOrientationOptimized } from '@/hooks/useGamepadNavigation'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ANIMATION_CONFIG, getBaseDelay, getStaggerDelay } from '@/lib/animation/config'
import { useAppStats, useFeaturedListings, usePopularGames } from '@/lib/api/hooks'
import type { Game, Listing } from '@/types'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const HEADER_HEIGHT_PORTRAIT = SCREEN_HEIGHT * 0.45
const HEADER_HEIGHT_LANDSCAPE = SCREEN_HEIGHT * 0.3
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.45

export default function HomeScreen() {
  const { theme } = useTheme()
  const { isLandscape, getLandscapeStyles } = useOrientationOptimized()
  const reduceMotion = useReducedMotion()
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const scrollY = useSharedValue(0)

  // Enhanced animation values for 2025 design - reduced for performance
  const heroGlow = useSharedValue(0)
  const backgroundShift = useSharedValue(0)

  useEffect(() => {
    if (!reduceMotion) {
      // Hero section ambient animations
      heroGlow.value = withRepeat(
        withSequence(withTiming(1, { duration: 3000 }), withTiming(0.3, { duration: 3000 })),
        -1,
        true,
      )

      // Background color shift
      backgroundShift.value = withRepeat(withTiming(1, { duration: 12000 }), -1, true)
    }
  }, [backgroundShift, heroGlow, reduceMotion])

  const statsQuery = useAppStats()
  const featuredListingsQuery = useFeaturedListings()
  const popularGamesQuery = usePopularGames()

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
      [1, 0.8, 0],
      Extrapolation.CLAMP,
    )

    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT / 2],
      Extrapolation.CLAMP,
    )

    return {
      opacity,
      transform: [{ translateY }],
    }
  })

  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 100], [0, -10], Extrapolation.CLAMP)

    const scale = interpolate(scrollY.value, [0, 100], [1, 0.95], Extrapolation.CLAMP)

    return {
      transform: [{ translateY }, { scale }],
    }
  })

  const handleSearch = () => {
    if (searchQuery.trim()) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleGamePress = (gameId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(`/game/${gameId}`)
  }

  const handleListingPress = (listingId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(`/listing/${listingId}`)
  }

  const StatsCard = ({
    stat,
    index,
  }: {
    stat: { label: string; value: string; color: string; icon: string }
    index: number
  }) => {
    const scale = useSharedValue(0.9)
    const glow = useSharedValue(0)

    useEffect(() => {
      const delay = index * 200
      // Use withDelay instead of setTimeout for animations
      scale.value = withDelay(delay, withSpring(1, MICRO_SPRING_CONFIG.bouncy))
      glow.value = withDelay(
        delay,
        withRepeat(
          withSequence(withTiming(1, { duration: 2000 }), withTiming(0.4, { duration: 2000 })),
          -1,
          true,
        )
      )
    }, [index, scale, glow])

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }, { translateY: 0 }], // No floating
    }))

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glow.value,
    }))

    return (
      <Animated.View key={stat.label} style={[styles.statsCard, animatedStyle]}>
        <HolographicView morphing borderRadius={20} style={styles.statsCardContainer}>
          {/* Glow effect */}
          <Animated.View style={[styles.statsGlow, glowStyle]}>
            <LinearGradient
              colors={[stat.color, `${stat.color}60`, 'transparent']}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>

          <FluidGradient
            variant="aurora"
            borderRadius={20}
            animated
            speed="slow"
            style={StyleSheet.absoluteFillObject}
            opacity={0.05}
          />

          <View style={styles.statsContent}>
            <FloatingElement intensity={3} duration={3000 + index * 500}>
              <View
                style={[
                  styles.statsIcon,
                  { backgroundColor: `${stat.color}20`, borderColor: `${stat.color}30` },
                ]}
              >
                <Text style={styles.statsEmoji}>{stat.icon}</Text>
              </View>
            </FloatingElement>

            <GlowText style={[styles.statsValue, { color: theme.colors.text }]}>
              {stat.value}
            </GlowText>

            <TypewriterText
              type="caption"
              animated
              delay={index * 100 + 300}
              style={[styles.statsLabel, { color: stat.color }]}
            >
              {stat.label}
            </TypewriterText>

            {/* Accent line */}
            <LinearGradient colors={[stat.color, `${stat.color}60`]} style={styles.statsAccent} />
          </View>
        </HolographicView>
      </Animated.View>
    )
  }

  const renderGameCard = (game: Game, index: number) => (
    <Animated.View
      key={game.id}
      entering={FadeInUp.delay(getStaggerDelay(index, 'normal', 'normal')).duration(
        ANIMATION_CONFIG.timing.fast,
      )}
      style={{ marginRight: theme.spacing.lg, width: 160 }}
    >
      <Pressable
        onPress={() => handleGamePress(game.id)}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <Card
          style={{
            height: 240,
            overflow: 'hidden',
          }}
          variant="default"
          elevation={2}
          disableAnimations={true}
        >
          <View
            style={{
              width: '100%',
              height: 140,
              backgroundColor: theme.colors.surface,
              position: 'relative',
            }}
          >
            {game.imageUrl || game.boxartUrl || game.bannerUrl ? (
              <>
                <CachedImage
                  source={{ uri: game.imageUrl || game.boxartUrl || game.bannerUrl || '' }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0, 0, 0, 0.3)']}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 40,
                  }}
                />
              </>
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.surfaceElevated,
                }}
              >
                <Ionicons name="game-controller" size={36} color={theme.colors.textMuted} />
              </View>
            )}
          </View>

          <View
            style={{
              padding: theme.spacing.md,
              flex: 1,
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.fontSize.md,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
                lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize.md,
              }}
              numberOfLines={2}
            >
              {game.title}
            </Text>
            <View
              style={{
                backgroundColor: `${theme.colors.primary}15`,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.md,
                alignSelf: 'flex-start',
                borderWidth: 1,
                borderColor: `${theme.colors.primary}25`,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.primary,
                }}
                numberOfLines={1}
              >
                {game.system?.name || 'Unknown'}
              </Text>
            </View>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  )

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        statsQuery.refetch(),
        featuredListingsQuery.refetch(),
        popularGamesQuery.refetch(),
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const statsData = useMemo(
    () => [
      {
        label: 'Listings',
        value: statsQuery.data?.totalListings?.toLocaleString() || '0',
        color: theme.colors.primary,
        icon: '📱',
      },
      {
        label: 'Games',
        value: statsQuery.data?.totalGames?.toLocaleString() || '0',
        color: theme.colors.secondary,
        icon: '🎮',
      },
      {
        label: 'Users',
        value: statsQuery.data?.totalUsers?.toLocaleString() || '0',
        color: theme.colors.accent,
        icon: '👥',
      },
    ],
    [statsQuery.data, theme],
  )

  const heroGlowStyle = useAnimatedStyle(() => ({
    opacity: heroGlow.value,
  }))

  const particleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: 0 },
    ],
  }))

  const searchPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 }],
  }))

  // Unused for now - will be used for dynamic background effects
  // const backgroundStyle = useAnimatedStyle(() => {
  //   const hue = interpolate(backgroundShift.value, [0, 1], [0, 60], Extrapolation.CLAMP)
  //   return {}
  // })

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        translucent
      />

      {/* Enhanced Dynamic Background */}
      <AuroraGradient
        style={[
          styles.backgroundGradient,
          {
            height: (isLandscape ? HEADER_HEIGHT_LANDSCAPE : HEADER_HEIGHT_PORTRAIT) + 200,
          },
        ]}
        speed="slow"
      />

      {/* Hero glow effect */}
      <Animated.View style={[styles.heroGlow, heroGlowStyle]}>
        <LinearGradient
          colors={['transparent', `${theme.colors.primary}15`, 'transparent']}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Floating particles */}
      <View style={styles.particlesContainer}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              particleStyle,
              {
                left: `${index * 12 + 10}%`,
                top: `${20 + (index % 3) * 15}%`,
                animationDelay: `${index * 0.5}s`,
              },
            ]}
          >
            <FloatingElement intensity={4} duration={3000 + index * 400}>
              <View
                style={[styles.particleDot, { backgroundColor: `${theme.colors.primary}40` }]}
              />
            </FloatingElement>
          </Animated.View>
        ))}
      </View>

      {/* Secondary gradient for depth */}
      <CosmicGradient
        style={[
          styles.depthGradient,
          {
            top: (isLandscape ? HEADER_HEIGHT_LANDSCAPE : HEADER_HEIGHT_PORTRAIT) - 100,
          },
        ]}
        opacity={0.3}
        speed="fast"
      />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Enhanced Hero Section */}
        <View style={{ height: isLandscape ? HEADER_HEIGHT_LANDSCAPE : HEADER_HEIGHT_PORTRAIT }}>
          <Animated.View style={headerAnimatedStyle}>
            <SafeAreaView style={styles.heroSafeArea}>
              <View style={styles.heroContent}>
                <Animated.View
                  entering={BounceIn.delay(200).springify()}
                  style={styles.heroTextContainer}
                >
                  <HeroText
                    gradient
                    animated
                    variant="scale"
                    glow
                    style={styles.heroTitle}
                    customColors={['#ffffff', theme.colors.primary, theme.colors.accent]}
                  >
                    Welcome to EmuReady
                  </HeroText>

                  <TypewriterText
                    animated
                    delay={800}
                    style={[
                      styles.heroSubtitle,
                      {
                        color: theme.isDark
                          ? `${theme.colors.textInverse}CC`
                          : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    Discover the best emulation performance for your favorite games
                  </TypewriterText>
                </Animated.View>

                {/* Revolutionary Search Bar */}
                <Animated.View
                  style={[searchBarAnimatedStyle, searchPulseStyle]}
                  entering={SlideInLeft.delay(1000).springify()}
                >
                  <MagneticView borderRadius={24} animated hoverable style={styles.searchContainer}>
                    <BlurView
                      intensity={100}
                      tint={theme.isDark ? 'dark' : 'light'}
                      style={styles.searchBlur}
                    >
                      <FluidGradient
                        variant="aurora"
                        borderRadius={24}
                        animated
                        speed="normal"
                        style={StyleSheet.absoluteFillObject}
                        opacity={0.1}
                      />

                      <View style={styles.searchInputContainer}>
                        <FloatingElement intensity={2} duration={2000}>
                          <Ionicons
                            name="search"
                            size={22}
                            color={theme.colors.primary}
                            style={styles.searchIcon}
                          />
                        </FloatingElement>

                        <TextInput
                          style={[
                            styles.searchInput,
                            {
                              color: theme.colors.text,
                            },
                          ]}
                          placeholder="Search games, devices, emulators..."
                          placeholderTextColor={theme.colors.textMuted}
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                          onSubmitEditing={handleSearch}
                          returnKeyType="search"
                        />

                        {searchQuery.length > 0 && (
                          <AnimatedPressable onPress={handleSearch}>
                            <MagneticView borderRadius={12} style={styles.searchButton}>
                              <LinearGradient
                                colors={theme.colors.gradients.primary}
                                style={StyleSheet.absoluteFillObject}
                              />
                              <GlowText style={styles.searchButtonText}>Search</GlowText>
                            </MagneticView>
                          </AnimatedPressable>
                        )}
                      </View>
                    </BlurView>
                  </MagneticView>
                </Animated.View>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>

        {/* Revolutionary Stats Section */}
        <View style={getLandscapeStyles(styles.statsSection, styles.statsSectionLandscape)}>
          <Animated.View entering={FadeInUp.delay(1200).springify()} style={styles.statsHeader}>
            <HolographicView morphing borderRadius={20} style={styles.statsBadge}>
              <GlowText style={styles.statsBadgeText}>Community Stats</GlowText>
            </HolographicView>

            <GradientTitle animated style={styles.statsTitle}>
              Growing Together
            </GradientTitle>

            <TypewriterText
              animated
              delay={1400}
              style={[styles.statsSubtitle, { color: theme.colors.textSecondary }]}
            >
              Join thousands of gamers sharing performance insights
            </TypewriterText>
          </Animated.View>

          <View
            style={getLandscapeStyles(
              styles.statsCardsContainer,
              styles.statsCardsContainerLandscape,
            )}
          >
            {statsQuery.isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Animated.View
                    key={index}
                    entering={ZoomIn.delay(1600 + index * 200).springify()}
                    style={styles.statsCard}
                  >
                    <EnhancedSkeletonCard variant="stats" animated style={styles.skeletonCard} />
                  </Animated.View>
                ))
              : statsData.map((stat, index) => (
                  <StatsCard key={stat.label} stat={stat} index={index} />
                ))}
          </View>
        </View>

        {/* Popular Games Section */}
        <View style={{ marginBottom: theme.spacing.xxl }}>
          <Animated.View
            entering={FadeInUp.delay(getBaseDelay('normal')).duration(ANIMATION_CONFIG.timing.fast)}
            style={getLandscapeStyles(
              {
                paddingHorizontal: theme.spacing.lg,
                marginBottom: theme.spacing.xl,
              },
              {
                paddingHorizontal: theme.spacing.xxl,
                marginBottom: theme.spacing.xl,
              },
            )}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.md,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xxl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  Popular Games
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.md,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Most tested by the community
                </Text>
              </View>
              <Button
                title="See All"
                variant="ghost"
                size="sm"
                onPress={() => router.push('/browse')}
                rightIcon={
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                }
              />
            </View>
          </Animated.View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={getLandscapeStyles(
              { paddingHorizontal: theme.spacing.lg },
              { paddingHorizontal: theme.spacing.xxl },
            )}
          >
            {popularGamesQuery.isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInUp.delay(getStaggerDelay(index, 'normal', 'normal')).duration(
                      ANIMATION_CONFIG.timing.fast,
                    )}
                    style={{ marginRight: theme.spacing.lg, width: 160 }}
                  >
                    <Card
                      style={{ height: 240, padding: 0, overflow: 'hidden' }}
                      disableAnimations={true}
                    >
                      <SkeletonLoader width="100%" height={140} />
                      <View style={{ padding: theme.spacing.md }}>
                        <SkeletonLoader
                          width="90%"
                          height={16}
                          style={{ marginBottom: theme.spacing.xs }}
                        />
                        <SkeletonLoader width="70%" height={12} />
                      </View>
                    </Card>
                  </Animated.View>
                ))
              : popularGamesQuery.error
                ? (
                    <View style={{ padding: theme.spacing.lg, width: '100%' }}>
                      <Text style={{ color: theme.colors.error, textAlign: 'center' }}>
                        Failed to load games: {popularGamesQuery.error?.message || 'Unknown error'}
                      </Text>
                    </View>
                  )
                : popularGamesQuery.data && Array.isArray(popularGamesQuery.data) && popularGamesQuery.data.length > 0
                  ? popularGamesQuery.data.slice(0, 8).map((game, index) => {
                      // Validate game object
                      if (!game || typeof game !== 'object' || !game.id) {
                        console.warn('Invalid game object:', game)
                        return null
                      }
                      return renderGameCard(game, index)
                    }).filter(Boolean)
                  : !popularGamesQuery.isLoading && (
                      <View style={{ padding: theme.spacing.lg, width: '100%' }}>
                        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
                          No popular games available
                        </Text>
                      </View>
                    )}
          </ScrollView>
        </View>

        {/* Featured Listings Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Animated.View
            entering={FadeInUp.delay(1000).springify()}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                color: theme.colors.text,
              }}
            >
              Featured Performance
            </Text>
            <Button
              title="See All"
              variant="ghost"
              size="sm"
              onPress={() => router.push('/browse')}
              rightIcon={<Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />}
            />
          </Animated.View>

          <View style={{ gap: theme.spacing.md }}>
            {featuredListingsQuery.isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInUp.delay(getStaggerDelay(index, 'normal', 'normal')).duration(
                      ANIMATION_CONFIG.timing.fast,
                    )}
                  >
                    <Card
                      style={{ height: 120, padding: theme.spacing.lg }}
                      disableAnimations={true}
                    >
                      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                        <SkeletonLoader
                          width={80}
                          height={80}
                          borderRadius={theme.borderRadius.md}
                        />
                        <View style={{ flex: 1, justifyContent: 'space-between' }}>
                          <SkeletonLoader width="90%" height={18} />
                          <SkeletonLoader width="70%" height={14} />
                          <SkeletonLoader width="60%" height={14} />
                        </View>
                      </View>
                    </Card>
                  </Animated.View>
                ))
              : Array.isArray(featuredListingsQuery.data)
                ? featuredListingsQuery.data.slice(0, 4).map((listing: Listing, index: number) => (
                    <Animated.View
                      key={listing.id}
                      entering={FadeInUp.delay(getStaggerDelay(index, 'normal', 'normal')).duration(
                        ANIMATION_CONFIG.timing.fast,
                      )}
                    >
                      <ListingCard
                        listing={listing}
                        onPress={() => handleListingPress(listing.id)}
                        disableAnimations={true}
                      />
                    </Animated.View>
                  ))
                : []}
          </View>

          {(!Array.isArray(featuredListingsQuery.data) ||
            featuredListingsQuery.data.length === 0) &&
            !featuredListingsQuery.isLoading && (
              <Animated.View
                entering={FadeInUp.delay(getBaseDelay('normal')).duration(
                  ANIMATION_CONFIG.timing.fast,
                )}
              >
                <Card style={{ overflow: 'hidden' }} disableAnimations={true}>
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
                      <Ionicons name="star" size={40} color={theme.colors.textInverse} />
                    </View>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.xl,
                        fontWeight: theme.typography.fontWeight.bold,
                        color: theme.colors.textInverse,
                        marginBottom: theme.spacing.sm,
                        textAlign: 'center',
                      }}
                    >
                      No Featured Content Yet
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.md,
                        color: `${theme.colors.textInverse}CC`,
                        textAlign: 'center',
                        marginBottom: theme.spacing.lg,
                        lineHeight:
                          theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
                      }}
                    >
                      Be among the first to share your emulation experiences and get featured!
                    </Text>
                    <Pressable
                      onPress={() => router.push('/(tabs)/create')}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        paddingHorizontal: theme.spacing.lg,
                        paddingVertical: theme.spacing.md,
                        borderRadius: theme.borderRadius.lg,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: theme.spacing.sm,
                      }}
                    >
                      <Ionicons name="add" size={20} color={theme.colors.textInverse} />
                      <Text
                        style={{
                          color: theme.colors.textInverse,
                          fontSize: theme.typography.fontSize.md,
                          fontWeight: theme.typography.fontWeight.semibold,
                        }}
                      >
                        Create Listing
                      </Text>
                    </Pressable>
                  </LinearGradient>
                </Card>
              </Animated.View>
            )}
        </View>

        {/* Enhanced Quick Actions */}
        <View style={{ paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.xxl }}>
          <Animated.View
            entering={FadeInUp.delay(1400).springify()}
            style={{
              flexDirection: 'row',
              gap: theme.spacing.md,
            }}
          >
            <Animated.View
              style={{ flex: 1 }}
              entering={FadeInUp.delay(getBaseDelay('normal')).duration(
                ANIMATION_CONFIG.timing.fast,
              )}
            >
              <Pressable
                onPress={() => router.push('/browse')}
                style={({ pressed }) => [
                  {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.lg,
                    paddingVertical: theme.spacing.lg,
                    paddingHorizontal: theme.spacing.md,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: `${theme.colors.primary}30`,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <Ionicons
                  name="grid"
                  size={24}
                  color={theme.colors.primary}
                  style={{ marginBottom: theme.spacing.sm }}
                />
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontSize: theme.typography.fontSize.md,
                    fontWeight: theme.typography.fontWeight.semibold,
                  }}
                >
                  Browse All
                </Text>
              </Pressable>
            </Animated.View>

            <Animated.View
              style={{ flex: 1 }}
              entering={FadeInUp.delay(getBaseDelay('normal')).duration(
                ANIMATION_CONFIG.timing.fast,
              )}
            >
              <Pressable
                onPress={() => router.push('/(tabs)/create')}
                style={({ pressed }) => [
                  {
                    borderRadius: theme.borderRadius.lg,
                    paddingVertical: theme.spacing.lg,
                    paddingHorizontal: theme.spacing.md,
                    alignItems: 'center',
                    overflow: 'hidden',
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <LinearGradient
                  colors={theme.colors.gradients.primary}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
                <Ionicons
                  name="add"
                  size={24}
                  color={theme.colors.textInverse}
                  style={{ marginBottom: theme.spacing.sm }}
                />
                <Text
                  style={{
                    color: theme.colors.textInverse,
                    fontSize: theme.typography.fontSize.md,
                    fontWeight: theme.typography.fontWeight.semibold,
                  }}
                >
                  Create Listing
                </Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {/* Enhanced Floating Action Button */}
      <FloatingActionButton
        variant="gradient"
        actions={[
          {
            id: 'create',
            icon: 'add',
            label: 'Create Listing',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
              router.push('/(tabs)/create')
            },
          },
          {
            id: 'search',
            icon: 'search',
            label: 'Advanced Search',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.push('/browse')
            },
          },
          {
            id: 'profile',
            icon: 'person',
            label: 'My Profile',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.push('/(tabs)/profile')
            },
          },
        ]}
        position="bottom-right"
        size="medium"
        expandDirection="up"
        glowEffect={true}
        hapticFeedback={true}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  heroGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT + 100,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
  },
  particleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  depthGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 200,
  },
  heroSafeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 16,
    fontSize: 18,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    position: 'relative',
    zIndex: 1,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  statsSectionLandscape: {
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  statsHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  statsBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  statsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  statsSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statsCardsContainerLandscape: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    justifyContent: 'center',
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsCardContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  statsGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 30,
  },
  statsContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    position: 'relative',
    zIndex: 1,
  },
  statsIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
  },
  statsEmoji: {
    fontSize: 28,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  statsAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.3,
  },
  skeletonCard: {
    borderRadius: 20,
  },
})
