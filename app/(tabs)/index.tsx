import React, { useState, useMemo } from 'react'
import {
  ScrollView,
  View,
  Text,
  TextInput,
  RefreshControl,
  StatusBar,
  Pressable,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import Animated, {
  FadeInUp,
  FadeInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

import { useTheme } from '@/contexts/ThemeContext'
import { useAppStats, useFeaturedListings, usePopularGames } from '@/lib/api/hooks'
import { Card, Button, CachedImage, SkeletonLoader } from '@/components/ui'
import { ListingCard } from '@/components/cards'
import { getStaggerDelay, getBaseDelay, ANIMATION_CONFIG } from '@/lib/animation/config'
import type { Listing, Game } from '@/types'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.45

export default function HomeScreen() {
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const scrollY = useSharedValue(0)

  const statsQuery = useAppStats()
  console.log('Stats Query:', JSON.stringify(statsQuery.data, null, 2))
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
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}`)
  }

  const handleListingPress = (listingId: string) => {
    router.push(`/listing/${listingId}`)
  }

  const renderStatsCard = (
    stat: { label: string; value: string; color: string; icon: string },
    index: number,
  ) => (
    <Animated.View
      key={stat.label}
      entering={ZoomIn.delay(getStaggerDelay(index, 'fast', 'fast')).duration(
        ANIMATION_CONFIG.timing.fast,
      )}
      style={{ flex: 1, marginHorizontal: theme.spacing.xs }}
    >
      <Card style={{ overflow: 'hidden', alignItems: 'center' }}>
        <LinearGradient
          colors={[`${stat.color}10`, `${stat.color}05`]}
          style={{
            width: '100%',
            alignItems: 'center',
            paddingVertical: theme.spacing.lg,
            paddingHorizontal: theme.spacing.md,
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: `${stat.color}20`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.md,
              borderWidth: 2,
              borderColor: `${stat.color}30`,
            }}
          >
            <Text style={{ fontSize: 24 }}>{stat.icon}</Text>
          </View>
          <Text
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.extrabold,
              color: theme.colors.text,
              marginBottom: theme.spacing.xs,
            }}
          >
            {stat.value}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.textMuted,
              textAlign: 'center',
            }}
          >
            {stat.label}
          </Text>
        </LinearGradient>
      </Card>
    </Animated.View>
  )

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
        <Card style={{ height: 220, overflow: 'hidden' }}>
          <View
            style={{
              width: '100%',
              height: 140,
              backgroundColor: theme.colors.surface,
              position: 'relative',
            }}
          >
            {game.coverImageUrl || game.boxArtUrl ? (
              <>
                <CachedImage
                  source={{ uri: game.coverImageUrl || game.boxArtUrl || '' }}
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
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text,
                marginBottom: theme.spacing.xs,
                lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize.md,
              }}
              numberOfLines={2}
            >
              {game.title}
            </Text>
            <View
              style={{
                backgroundColor: `${theme.colors.primary}10`,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.sm,
                alignSelf: 'flex-start',
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Dynamic Gradient Background */}
      <LinearGradient
        colors={theme.colors.gradients.hero as [string, string, ...string[]]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT + 200,
        }}
      />

      {/* Secondary gradient for depth */}
      <LinearGradient
        colors={['transparent', `${theme.colors.background}80`, theme.colors.background]}
        style={{
          position: 'absolute',
          top: HEADER_HEIGHT - 100,
          left: 0,
          right: 0,
          height: 200,
        }}
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
        {/* Header Section */}
        <View style={{ height: HEADER_HEIGHT }}>
          <Animated.View style={headerAnimatedStyle}>
            <SafeAreaView style={{ flex: 1, paddingHorizontal: 20 }}>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Animated.View
                  entering={FadeInDown.delay(getBaseDelay('instant')).duration(
                    ANIMATION_CONFIG.timing.fast,
                  )}
                >
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.xxxl + 8,
                      fontWeight: theme.typography.fontWeight.extrabold,
                      color: theme.isDark ? theme.colors.textInverse : theme.colors.text,
                      marginBottom: theme.spacing.md,
                      textAlign: 'center',
                      lineHeight:
                        theme.typography.lineHeight.tight * (theme.typography.fontSize.xxxl + 8),
                    }}
                  >
                    Welcome to EmuReady
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.isDark
                        ? `${theme.colors.textInverse}CC`
                        : theme.colors.textSecondary,
                      textAlign: 'center',
                      lineHeight:
                        theme.typography.lineHeight.relaxed * theme.typography.fontSize.lg,
                      marginBottom: theme.spacing.xxl,
                      paddingHorizontal: theme.spacing.lg,
                    }}
                  >
                    Discover the best emulation performance for your favorite games
                  </Text>
                </Animated.View>

                {/* Enhanced Search Bar with Glass Morphism */}
                <Animated.View
                  style={[searchBarAnimatedStyle]}
                  entering={FadeInUp.delay(getBaseDelay('fast')).duration(
                    ANIMATION_CONFIG.timing.fast,
                  )}
                >
                  <BlurView
                    intensity={80}
                    tint={theme.isDark ? 'dark' : 'light'}
                    style={{
                      borderRadius: theme.borderRadius.xl,
                      overflow: 'hidden',
                      marginBottom: theme.spacing.xl,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: theme.colors.glass,
                        paddingHorizontal: theme.spacing.lg,
                        paddingVertical: theme.spacing.md,
                        borderWidth: 1,
                        borderColor: theme.colors.borderLight,
                      }}
                    >
                      <Ionicons
                        name="search"
                        size={22}
                        color={theme.colors.primary}
                        style={{ marginRight: theme.spacing.md }}
                      />
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: theme.typography.fontSize.lg,
                          color: theme.colors.text,
                          fontWeight: theme.typography.fontWeight.medium,
                        }}
                        placeholder="Search games, devices, emulators..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                      />
                      {searchQuery.length > 0 && (
                        <Pressable
                          onPress={handleSearch}
                          style={{
                            backgroundColor: theme.colors.primary,
                            paddingHorizontal: theme.spacing.md,
                            paddingVertical: theme.spacing.sm,
                            borderRadius: theme.borderRadius.md,
                          }}
                        >
                          <Text
                            style={{
                              color: theme.colors.textInverse,
                              fontSize: theme.typography.fontSize.sm,
                              fontWeight: theme.typography.fontWeight.semibold,
                            }}
                          >
                            Search
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </BlurView>
                </Animated.View>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>

        {/* Enhanced Stats Section */}
        <View style={{ paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.xxl }}>
          <Animated.Text
            entering={FadeInUp.delay(getBaseDelay('normal')).duration(ANIMATION_CONFIG.timing.fast)}
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text,
              marginBottom: theme.spacing.lg,
              textAlign: 'center',
            }}
          >
            Community Overview
          </Animated.Text>

          <Animated.View
            entering={FadeInUp.delay(getBaseDelay('normal')).duration(ANIMATION_CONFIG.timing.fast)}
            style={{
              flexDirection: 'row',
              gap: theme.spacing.md,
            }}
          >
            {statsQuery.isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Animated.View
                    key={index}
                    entering={ZoomIn.delay(getStaggerDelay(index, 'normal', 'fast')).duration(
                      ANIMATION_CONFIG.timing.fast,
                    )}
                    style={{ flex: 1 }}
                  >
                    <Card style={{ alignItems: 'center', padding: theme.spacing.lg }}>
                      <SkeletonLoader
                        width={60}
                        height={60}
                        borderRadius={30}
                        style={{ marginBottom: theme.spacing.md }}
                      />
                      <SkeletonLoader
                        width="60%"
                        height={20}
                        style={{ marginBottom: theme.spacing.xs }}
                      />
                      <SkeletonLoader width="80%" height={14} />
                    </Card>
                  </Animated.View>
                ))
              : statsData.map(renderStatsCard)}
          </Animated.View>
        </View>

        {/* Popular Games Section */}
        <View style={{ marginBottom: 32 }}>
          <Animated.View
            entering={FadeInUp.delay(getBaseDelay('normal')).duration(ANIMATION_CONFIG.timing.fast)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
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
              Popular Games
            </Text>
            <Button
              title="See All"
              variant="ghost"
              size="sm"
              onPress={() => router.push('/browse')}
              rightIcon={<Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />}
            />
          </Animated.View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
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
                    <Card style={{ height: 220, padding: 0, overflow: 'hidden' }}>
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
              : Array.isArray(popularGamesQuery.data)
                ? popularGamesQuery.data.slice(0, 8).map(renderGameCard)
                : []}
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
                    <Card style={{ height: 120, padding: theme.spacing.lg }}>
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
                <Card style={{ overflow: 'hidden' }}>
                  <LinearGradient
                    colors={theme.colors.gradients.secondary as [string, string, ...string[]]}
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
                  colors={theme.colors.gradients.primary as [string, string, ...string[]]}
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
    </View>
  )
}
