import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  Pressable,
  RefreshControl,
  SafeAreaView,
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
  runOnJS,
  SlideInLeft,
  SlideInRight,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated'

import { ListingCard } from '@/components/cards'
import QuickAccessSection from '@/components/sections/QuickAccessSection'
import { GlowText, HeroText, TypewriterText } from '@/components/themed/ThemedText'
import { HolographicView, MagneticView } from '@/components/themed/ThemedView'
import { Card, SearchSuggestions } from '@/components/ui'
import FluidGradient, { AuroraGradient, CosmicGradient } from '@/components/ui/FluidGradient'
import { AnimatedPressable, FloatingElement } from '@/components/ui/MicroInteractions'
import { EnhancedSkeletonCard } from '@/components/ui/MorphingSkeleton'
import { useTheme } from '@/contexts/ThemeContext'
import { useDevices, useListings, useSearchSuggestions, useSystems } from '@/lib/api/hooks'
import { appStorage } from '@/lib/storage'
import type { Listing, System } from '@/types'

interface SearchFilters {
  query: string
  systemId: string | null
  deviceId: string | null
  performanceRank: number | null
  sortBy: 'newest' | 'oldest' | 'rating' | 'performance'
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25

export default function BrowseScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    systemId: null,
    deviceId: null,
    performanceRank: null,
    sortBy: 'newest',
  })
  const [showFilters, setShowFilters] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const scrollY = useSharedValue(0)
  const filtersOpacity = useSharedValue(0)
  const filtersHeight = useSharedValue(0)

  // Enhanced 2025 animation values
  const heroGlow = useSharedValue(0)
  const searchPulse = useSharedValue(1)
  const particleFlow = useSharedValue(0)
  const backgroundShift = useSharedValue(0)

  useEffect(() => {
    // Initialize premium animations
    heroGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 3000 }), withTiming(0.3, { duration: 3000 })),
      -1,
      true,
    )

    // searchPulse animation - DISABLED
    // searchPulse.value = withRepeat(
    //   withSequence(withTiming(1.01, { duration: 2000 }), withTiming(1, { duration: 2000 })),
    //   -1,
    //   true,
    // )

    particleFlow.value = withRepeat(withTiming(1, { duration: 8000 }), -1, false)

    backgroundShift.value = withRepeat(withTiming(1, { duration: 15000 }), -1, true)
  }, [backgroundShift, heroGlow, particleFlow, searchPulse])

  // API calls
  const listingsQuery = useListings({
    gameId: undefined,
    systemId: filters.systemId || undefined,
    deviceId: filters.deviceId || undefined,
    emulatorId: undefined,
    page: 1,
    limit: 50,
  })
  const systemsQuery = useSystems()
  const devicesQuery = useDevices()
  const suggestionsQuery = useSearchSuggestions(
    { query: debouncedQuery, limit: 10 },
    { enabled: debouncedQuery.length > 0 },
  )

  const listings = listingsQuery.data?.listings || []

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(filters.query)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [filters.query])

  // Load recent searches on mount
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const saved = (await appStorage.get<string[]>('recent_searches')) || []
        setRecentSearches(saved.slice(0, 5))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
    loadRecentSearches()
  }, [])

  // Filter listings based on search query and performance
  const filteredListings = listings.filter((listing: Listing) => {
    const matchesQuery =
      !debouncedQuery ||
      listing.game?.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      listing.device?.modelName?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      listing.emulator?.name?.toLowerCase().includes(debouncedQuery.toLowerCase())

    const matchesPerformance =
      !filters.performanceRank || listing.performance?.rank === filters.performanceRank

    return matchesQuery && matchesPerformance
  })

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'rating':
        return (b.upVotes || 0) - (a.upVotes || 0)
      case 'performance':
        return (b.performance?.rank || 0) - (a.performance?.rank || 0)
      default:
        return 0
    }
  })

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT * 0.3, HEADER_HEIGHT * 0.7],
      [1, 0.8, 0.3],
      Extrapolation.CLAMP,
    )

    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT * 0.5],
      Extrapolation.CLAMP,
    )

    return {
      opacity,
      transform: [{ translateY }] as any,
    }
  })

  const filtersAnimatedStyle = useAnimatedStyle(() => ({
    opacity: filtersOpacity.value,
    transform: [{ scaleY: filtersHeight.value }] as any,
  }))

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    runOnJS(Haptics.selectionAsync)()
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      systemId: null,
      deviceId: null,
      performanceRank: null,
      sortBy: 'newest',
    })
  }

  const handleListingPress = (listingId: string) => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
    router.push(`/listing/${listingId}`)
  }

  const toggleFilters = () => {
    const newState = !showFilters
    setShowFilters(newState)

    if (newState) {
      filtersOpacity.value = withTiming(1, { duration: 300 })
      filtersHeight.value = withSpring(1, { damping: 15, stiffness: 150 })
    } else {
      filtersOpacity.value = withTiming(0, { duration: 200 })
      filtersHeight.value = withTiming(0, { duration: 200 })
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await listingsQuery.refetch()
    } catch (error) {
      console.error('Error refreshing listings:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const saveSearchToHistory = async (query: string) => {
    if (!query.trim()) return

    try {
      const current = (await appStorage.get<string[]>('recent_searches')) || []
      const updated = [query, ...current.filter((s) => s !== query)].slice(0, 5)
      await appStorage.set('recent_searches', updated)
      setRecentSearches(updated)
    } catch (error) {
      console.error('Error saving search:', error)
    }
  }

  const handleSuggestionPress = (suggestion: string) => {
    handleFilterChange('query', suggestion)
    saveSearchToHistory(suggestion)
    setShowSuggestions(false)
  }

  const handleClearHistory = async () => {
    try {
      await appStorage.delete('recent_searches')
      setRecentSearches([])
    } catch (error) {
      console.error('Error clearing search history:', error)
    }
  }

  const handleSearchFocus = () => {
    setShowSuggestions(true)
  }

  const handleSearchBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200)
  }

  const performanceOptions = [
    { rank: 5, label: 'Perfect', color: theme.colors.performance.perfect },
    { rank: 4, label: 'Great', color: theme.colors.performance.great },
    { rank: 3, label: 'Good', color: theme.colors.performance.good },
    { rank: 2, label: 'Poor', color: theme.colors.performance.poor },
    {
      rank: 1,
      label: 'Unplayable',
      color: theme.colors.performance.unplayable,
    },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'performance', label: 'Best Performing' },
  ]

  const heroGlowStyle = useAnimatedStyle(() => ({
    opacity: heroGlow.value,
  }))

  const searchPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 }],
  }))

  const particleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(particleFlow.value, [0, 1], [-100, 100], Extrapolation.CLAMP) },
    ],
  }))

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Revolutionary Background */}
      <AuroraGradient
        style={[
          styles.backgroundGradient,
          {
            height: HEADER_HEIGHT + 100,
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
        {Array.from({ length: 6 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              particleStyle,
              {
                left: `${index * 15 + 5}%`,
                top: `${15 + (index % 2) * 20}%`,
              },
            ]}
          >
            <FloatingElement intensity={3} duration={2000 + index * 300}>
              <View style={[styles.particleDot, { backgroundColor: `${theme.colors.accent}60` }]} />
            </FloatingElement>
          </Animated.View>
        ))}
      </View>

      {/* Secondary gradient for depth */}
      <CosmicGradient
        style={[
          styles.depthGradient,
          {
            top: HEADER_HEIGHT - 50,
          },
        ]}
        opacity={0.4}
        speed="normal"
      />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressViewOffset={HEADER_HEIGHT * 0.7}
          />
        }
        contentContainerStyle={{ paddingBottom: theme.spacing.xxxl }}
      >
        {/* Revolutionary Header */}
        <View style={styles.headerContainer}>
          <Animated.View style={headerAnimatedStyle}>
            <SafeAreaView style={styles.headerSafeArea}>
              <View style={styles.headerContent}>
                <Animated.View entering={BounceIn.delay(200).springify()}>
                  <HeroText
                    gradient
                    animated
                    variant="scale"
                    glow
                    style={styles.headerTitle}
                    customColors={['#ffffff', theme.colors.primary, theme.colors.accent]}
                  >
                    Browse Listings
                  </HeroText>

                  <TypewriterText
                    animated
                    delay={600}
                    style={[
                      styles.headerSubtitle,
                      {
                        color: theme.isDark
                          ? `${theme.colors.textInverse}CC`
                          : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    Find performance data for your favorite games
                  </TypewriterText>
                </Animated.View>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>

        {/* Revolutionary Search Bar */}
        <Animated.View
          entering={SlideInLeft.delay(800).springify()}
          style={[styles.searchContainer, searchPulseStyle]}
        >
          <MagneticView borderRadius={24} animated hoverable style={styles.searchMagnetic}>
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
                opacity={0.08}
              />

              <View style={styles.searchInputContainer}>
                <FloatingElement intensity={2} duration={2000}>
                  <Ionicons name="search" size={22} color={theme.colors.primary} />
                </FloatingElement>

                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Search games, systems, or devices..."
                  value={filters.query}
                  onChangeText={(text) => handleFilterChange('query', text)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  onSubmitEditing={() => {
                    if (filters.query.trim()) {
                      saveSearchToHistory(filters.query.trim())
                      setShowSuggestions(false)
                    }
                  }}
                  placeholderTextColor={theme.colors.textMuted}
                />

                <AnimatedPressable onPress={toggleFilters}>
                  <HolographicView
                    morphing
                    borderRadius={12}
                    style={[
                      styles.filtersButton,
                      {
                        backgroundColor: showFilters
                          ? theme.colors.primary
                          : 'rgba(255,255,255,0.1)',
                      },
                    ]}
                  >
                    <FloatingElement intensity={1} duration={1500}>
                      <Ionicons
                        name="filter"
                        size={18}
                        color={showFilters ? theme.colors.textInverse : theme.colors.primary}
                      />
                    </FloatingElement>

                    <GlowText
                      style={[
                        styles.filtersButtonText,
                        {
                          color: showFilters ? theme.colors.textInverse : theme.colors.primary,
                        },
                      ]}
                    >
                      Filters
                    </GlowText>
                  </HolographicView>
                </AnimatedPressable>
              </View>
            </BlurView>
          </MagneticView>
        </Animated.View>

        {/* Search Suggestions */}
        <SearchSuggestions
          visible={
            showSuggestions &&
            (recentSearches.length > 0 ||
              filters.query.length === 0 ||
              (suggestionsQuery.data?.length ?? 0) > 0)
          }
          recentSearches={recentSearches}
          popularSuggestions={
            suggestionsQuery.data?.map((s: any) => s.title || '') || [
              'Super Mario',
              'Zelda',
              'Pokemon',
              'Final Fantasy',
              'Sonic',
            ]
          }
          onSuggestionPress={handleSuggestionPress}
          onClearHistory={handleClearHistory}
        />

        {/* Enhanced Filters Panel */}
        {showFilters && (
          <Animated.View
            style={[
              {
                marginHorizontal: theme.spacing.lg,
                marginBottom: theme.spacing.lg,
              },
              filtersAnimatedStyle,
            ]}
            entering={SlideInLeft.delay(100).springify()}
          >
            <Card style={{ overflow: 'hidden' }}>
              <LinearGradient
                colors={theme.colors.gradients.card}
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
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.xl,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.text,
                    }}
                  >
                    Filters
                  </Text>
                  <Pressable
                    onPress={clearFilters}
                    style={{
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      borderRadius: theme.borderRadius.md,
                      backgroundColor: theme.colors.surface,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.textMuted,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                      }}
                    >
                      Clear All
                    </Text>
                  </Pressable>
                </View>

                {/* Enhanced System Filter */}
                <View style={{ marginBottom: theme.spacing.lg }}>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    System
                  </Text>
                  <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: theme.spacing.sm,
                        paddingRight: theme.spacing.lg,
                      }}
                    >
                      <Pressable
                        onPress={() => handleFilterChange('systemId', null)}
                        style={{
                          backgroundColor: !filters.systemId
                            ? theme.colors.primary
                            : theme.colors.surface,
                          paddingHorizontal: theme.spacing.md,
                          paddingVertical: theme.spacing.sm,
                          borderRadius: theme.borderRadius.lg,
                          borderWidth: 1,
                          borderColor: !filters.systemId
                            ? theme.colors.primary
                            : theme.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            fontWeight: theme.typography.fontWeight.medium,
                            color: !filters.systemId ? theme.colors.textInverse : theme.colors.text,
                          }}
                        >
                          All
                        </Text>
                      </Pressable>
                      {systemsQuery.data?.map((system: System) => (
                        <Pressable
                          key={system.id}
                          onPress={() => handleFilterChange('systemId', system.id)}
                          style={{
                            backgroundColor:
                              filters.systemId === system.id
                                ? theme.colors.primary
                                : theme.colors.surface,
                            paddingHorizontal: theme.spacing.md,
                            paddingVertical: theme.spacing.sm,
                            borderRadius: theme.borderRadius.lg,
                            borderWidth: 1,
                            borderColor:
                              filters.systemId === system.id
                                ? theme.colors.primary
                                : theme.colors.border,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: theme.typography.fontSize.sm,
                              fontWeight: theme.typography.fontWeight.medium,
                              color:
                                filters.systemId === system.id
                                  ? theme.colors.textInverse
                                  : theme.colors.text,
                            }}
                          >
                            {system.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </Animated.ScrollView>
                </View>

                {/* Enhanced Performance Filter */}
                <View style={{ marginBottom: theme.spacing.lg }}>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    Performance
                  </Text>
                  <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: theme.spacing.sm,
                        paddingRight: theme.spacing.lg,
                      }}
                    >
                      <Pressable
                        onPress={() => handleFilterChange('performanceRank', null)}
                        style={{
                          backgroundColor: !filters.performanceRank
                            ? theme.colors.primary
                            : theme.colors.surface,
                          paddingHorizontal: theme.spacing.md,
                          paddingVertical: theme.spacing.sm,
                          borderRadius: theme.borderRadius.lg,
                          borderWidth: 1,
                          borderColor: !filters.performanceRank
                            ? theme.colors.primary
                            : theme.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            fontWeight: theme.typography.fontWeight.medium,
                            color: !filters.performanceRank
                              ? theme.colors.textInverse
                              : theme.colors.text,
                          }}
                        >
                          All
                        </Text>
                      </Pressable>
                      {performanceOptions.map((option) => (
                        <Pressable
                          key={option.rank}
                          onPress={() => handleFilterChange('performanceRank', option.rank)}
                          style={{
                            backgroundColor:
                              filters.performanceRank === option.rank
                                ? option.color
                                : theme.colors.surface,
                            paddingHorizontal: theme.spacing.md,
                            paddingVertical: theme.spacing.sm,
                            borderRadius: theme.borderRadius.lg,
                            borderWidth: 1,
                            borderColor:
                              filters.performanceRank === option.rank
                                ? option.color
                                : theme.colors.border,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: theme.spacing.sm,
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor:
                                filters.performanceRank === option.rank
                                  ? theme.colors.textInverse
                                  : option.color,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: theme.typography.fontSize.sm,
                              fontWeight: theme.typography.fontWeight.medium,
                              color:
                                filters.performanceRank === option.rank
                                  ? theme.colors.textInverse
                                  : theme.colors.text,
                            }}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </Animated.ScrollView>
                </View>

                {/* Device Filter */}
                <View style={{ marginBottom: theme.spacing.lg }}>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    Device
                  </Text>
                  <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: theme.spacing.sm,
                        paddingRight: theme.spacing.lg,
                      }}
                    >
                      <Pressable
                        onPress={() => handleFilterChange('deviceId', null)}
                        style={{
                          backgroundColor: !filters.deviceId
                            ? theme.colors.primary
                            : theme.colors.surface,
                          paddingHorizontal: theme.spacing.md,
                          paddingVertical: theme.spacing.sm,
                          borderRadius: theme.borderRadius.lg,
                          borderWidth: 1,
                          borderColor: !filters.deviceId
                            ? theme.colors.primary
                            : theme.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            fontWeight: theme.typography.fontWeight.medium,
                            color: !filters.deviceId ? theme.colors.textInverse : theme.colors.text,
                          }}
                        >
                          All
                        </Text>
                      </Pressable>
                      {devicesQuery.data?.slice(0, 10).map((device: any) => (
                        <Pressable
                          key={device.id}
                          onPress={() => handleFilterChange('deviceId', device.id)}
                          style={{
                            backgroundColor:
                              filters.deviceId === device.id
                                ? theme.colors.primary
                                : theme.colors.surface,
                            paddingHorizontal: theme.spacing.md,
                            paddingVertical: theme.spacing.sm,
                            borderRadius: theme.borderRadius.lg,
                            borderWidth: 1,
                            borderColor:
                              filters.deviceId === device.id
                                ? theme.colors.primary
                                : theme.colors.border,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: theme.typography.fontSize.sm,
                              fontWeight: theme.typography.fontWeight.medium,
                              color:
                                filters.deviceId === device.id
                                  ? theme.colors.textInverse
                                  : theme.colors.text,
                            }}
                          >
                            {device.brand?.name || ''} {device.modelName}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </Animated.ScrollView>
                </View>

                {/* Enhanced Sort Options */}
                <View>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.text,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    Sort By
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: theme.spacing.sm,
                    }}
                  >
                    {sortOptions.map((option) => (
                      <Pressable
                        key={option.value}
                        onPress={() => handleFilterChange('sortBy', option.value)}
                        style={{
                          backgroundColor:
                            filters.sortBy === option.value
                              ? theme.colors.secondary
                              : theme.colors.surface,
                          paddingHorizontal: theme.spacing.md,
                          paddingVertical: theme.spacing.sm,
                          borderRadius: theme.borderRadius.lg,
                          borderWidth: 1,
                          borderColor:
                            filters.sortBy === option.value
                              ? theme.colors.secondary
                              : theme.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            fontWeight: theme.typography.fontWeight.medium,
                            color:
                              filters.sortBy === option.value
                                ? theme.colors.textInverse
                                : theme.colors.text,
                          }}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </Card>
          </Animated.View>
        )}

        {/* Enhanced Results Section */}
        <View
          style={{
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.xl,
          }}
        >
          <Animated.View
            entering={FadeInUp.delay(600).springify()}
            style={{ marginBottom: theme.spacing.lg }}
          >
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.xs,
              }}
            >
              {sortedListings.length} Results
            </Text>
            {(filters.query || filters.systemId || filters.deviceId || filters.performanceRank) && (
              <Text
                style={{
                  fontSize: theme.typography.fontSize.md,
                  color: theme.colors.textMuted,
                  lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
                }}
              >
                {filters.query && `"${filters.query}"`}
                {filters.systemId &&
                  ` in ${systemsQuery.data?.find((s: System) => s.id === filters.systemId)?.name}`}
                {filters.deviceId &&
                  ` on ${devicesQuery.data?.find((d: any) => d.id === filters.deviceId)?.modelName || 'device'}`}
                {filters.performanceRank &&
                  ` with ${performanceOptions.find((p) => p.rank === filters.performanceRank)?.label} performance`}
              </Text>
            )}
          </Animated.View>

          {listingsQuery.isLoading ? (
            <View style={styles.loadingContainer}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Animated.View
                  key={index}
                  entering={SlideInRight.delay(700 + index * 150).springify()}
                  style={styles.skeletonWrapper}
                >
                  <EnhancedSkeletonCard variant="listing" animated style={styles.skeletonCard} />
                </Animated.View>
              ))}
            </View>
          ) : listingsQuery.error && sortedListings.length === 0 ? (
            <Animated.View entering={ZoomIn.delay(300).springify()}>
              <Card style={{ overflow: 'hidden' }}>
                <LinearGradient
                  colors={[`${theme.colors.error}10`, `${theme.colors.error}05`]}
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
                      backgroundColor: `${theme.colors.error}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: theme.spacing.lg,
                    }}
                  >
                    <Ionicons name="cloud-offline" size={40} color={theme.colors.error} />
                  </View>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.xl,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.text,
                      marginBottom: theme.spacing.sm,
                      textAlign: 'center',
                    }}
                  >
                    Unable to Load Listings
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.md,
                      color: theme.colors.textMuted,
                      textAlign: 'center',
                      marginBottom: theme.spacing.lg,
                      lineHeight:
                        theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
                    }}
                  >
                    Please check your connection and try again.
                  </Text>
                  <Pressable
                    onPress={() => listingsQuery.refetch()}
                    style={{
                      backgroundColor: theme.colors.error,
                      paddingHorizontal: theme.spacing.lg,
                      paddingVertical: theme.spacing.md,
                      borderRadius: theme.borderRadius.lg,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: theme.spacing.sm,
                    }}
                  >
                    <Ionicons name="refresh" size={20} color={theme.colors.textInverse} />
                    <Text
                      style={{
                        color: theme.colors.textInverse,
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.semibold,
                      }}
                    >
                      Retry
                    </Text>
                  </Pressable>
                </LinearGradient>
              </Card>
            </Animated.View>
          ) : sortedListings.length > 0 ? (
            <View style={{ gap: theme.spacing.md }}>
              {sortedListings.map((listing, index) => (
                <Animated.View
                  key={listing.id}
                  entering={SlideInLeft.delay(700 + index * 100).springify()}
                >
                  <ListingCard listing={listing} onPress={() => handleListingPress(listing.id)} />
                </Animated.View>
              ))}
            </View>
          ) : (
            <Animated.View entering={ZoomIn.delay(300).springify()}>
              <Card style={{ overflow: 'hidden' }}>
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
                    <Ionicons name="search" size={40} color={theme.colors.textInverse} />
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
                    No Results Found
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
                    Try adjusting your search terms or filters to find what you&apos;re looking for.
                  </Text>
                  <Pressable
                    onPress={clearFilters}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      paddingHorizontal: theme.spacing.lg,
                      paddingVertical: theme.spacing.md,
                      borderRadius: theme.borderRadius.lg,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.textInverse,
                        fontSize: theme.typography.fontSize.md,
                        fontWeight: theme.typography.fontWeight.semibold,
                      }}
                    >
                      Clear Filters
                    </Text>
                  </Pressable>
                </LinearGradient>
              </Card>
            </Animated.View>
          )}
        </View>

        {/* Quick Access to New Features */}
        {!filters.query && !filters.systemId && !filters.performanceRank && (
          <Animated.View
            entering={FadeInUp.delay(800).springify()}
            style={{
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <QuickAccessSection />
          </Animated.View>
        )}

        {/* Enhanced Quick Actions */}
        {!filters.query && !filters.systemId && !filters.performanceRank && (
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
            }}
          >
            <Animated.Text
              entering={FadeInUp.delay(900).springify()}
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.lg,
              }}
            >
              Quick Actions
            </Animated.Text>
            <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: theme.spacing.md,
                  paddingRight: theme.spacing.lg,
                }}
              >
                <Animated.View entering={SlideInLeft.delay(1000).springify()}>
                  <Pressable
                    onPress={() => router.push('/(tabs)/create')}
                    style={{
                      width: 180,
                      borderRadius: theme.borderRadius.lg,
                      overflow: 'hidden',
                    }}
                  >
                    <LinearGradient
                      colors={theme.colors.gradients.primary}
                      style={{
                        padding: theme.spacing.lg,
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: theme.spacing.md,
                        }}
                      >
                        <Ionicons name="add" size={24} color={theme.colors.textInverse} />
                      </View>
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.md,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.textInverse,
                          marginBottom: theme.spacing.xs,
                          textAlign: 'center',
                        }}
                      >
                        Create Listing
                      </Text>
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: `${theme.colors.textInverse}CC`,
                          textAlign: 'center',
                          lineHeight:
                            theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
                        }}
                      >
                        Share your emulation experience
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                <Animated.View entering={SlideInRight.delay(1100).springify()}>
                  <Pressable
                    onPress={() => handleFilterChange('performanceRank', 5)}
                    style={{
                      width: 180,
                      borderRadius: theme.borderRadius.lg,
                      overflow: 'hidden',
                    }}
                  >
                    <LinearGradient
                      colors={theme.colors.gradients.gaming}
                      style={{
                        padding: theme.spacing.lg,
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: theme.spacing.md,
                        }}
                      >
                        <Ionicons name="star" size={24} color={theme.colors.textInverse} />
                      </View>
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.md,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.textInverse,
                          marginBottom: theme.spacing.xs,
                          textAlign: 'center',
                        }}
                      >
                        Perfect Games
                      </Text>
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: `${theme.colors.textInverse}CC`,
                          textAlign: 'center',
                          lineHeight:
                            theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
                        }}
                      >
                        Browse flawless performance
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </View>
            </Animated.ScrollView>
          </View>
        )}
      </Animated.ScrollView>
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
    height: HEADER_HEIGHT + 50,
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
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  depthGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 150,
  },
  headerContainer: {
    height: HEADER_HEIGHT,
  },
  headerSafeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 16,
    fontSize: 18,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: -24,
  },
  searchMagnetic: {
    // MagneticView handles its own styling
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
    gap: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },
  filtersButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filtersButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    gap: 12,
  },
  skeletonWrapper: {
    // Animation wrapper
  },
  skeletonCard: {
    borderRadius: 20,
    height: 120,
  },
})
