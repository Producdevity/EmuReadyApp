import React, { useState, useEffect, useRef } from 'react'
import {
  SafeAreaView,
  Text,
  TextInput,
  View,
  RefreshControl,
  StatusBar,
  Pressable,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import Animated, {
  FadeInUp,
  FadeInDown,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

import { Card, SearchSuggestions, SkeletonLoader } from '@/components/ui'
import { ListingCard } from '@/components/cards'
import QuickAccessSection from '@/components/sections/QuickAccessSection'
import { useListings, useSystems, useSearchSuggestions } from '@/lib/api/hooks'
import { useTheme } from '@/contexts/ThemeContext'
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Enhanced Gradient Background */}
      <LinearGradient
        colors={theme.colors.gradients.hero as [string, string, ...string[]]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT + 100,
        }}
      />

      {/* Secondary gradient for depth */}
      <LinearGradient
        colors={['transparent', `${theme.colors.background}80`, theme.colors.background]}
        style={{
          position: 'absolute',
          top: HEADER_HEIGHT - 50,
          left: 0,
          right: 0,
          height: 150,
        }}
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
        {/* Enhanced Header */}
        <View style={{ height: HEADER_HEIGHT }}>
          <Animated.View style={headerAnimatedStyle}>
            <SafeAreaView style={{ flex: 1, paddingHorizontal: theme.spacing.lg }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.xxxl,
                      fontWeight: theme.typography.fontWeight.extrabold,
                      color: theme.isDark ? theme.colors.textInverse : theme.colors.text,
                      marginBottom: theme.spacing.sm,
                      textAlign: 'center',
                      lineHeight:
                        theme.typography.lineHeight.tight * theme.typography.fontSize.xxxl,
                    }}
                  >
                    Browse Listings
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
                      paddingHorizontal: theme.spacing.lg,
                    }}
                  >
                    Find performance data for your favorite games
                  </Text>
                </Animated.View>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>

        {/* Enhanced Search Bar with Glass Morphism */}
        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={{
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            marginTop: -theme.spacing.xl,
          }}
        >
          <BlurView
            intensity={80}
            tint={theme.isDark ? 'dark' : 'light'}
            style={{
              borderRadius: theme.borderRadius.xl,
              overflow: 'hidden',
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
                gap: theme.spacing.md,
              }}
            >
              <Ionicons name="search" size={22} color={theme.colors.primary} />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: theme.typography.fontSize.lg,
                  color: theme.colors.text,
                  fontWeight: theme.typography.fontWeight.medium,
                }}
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
              <Pressable
                onPress={toggleFilters}
                style={({ pressed }) => [
                  {
                    backgroundColor: showFilters ? theme.colors.primary : theme.colors.surface,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Ionicons
                  name="filter"
                  size={18}
                  color={showFilters ? theme.colors.textInverse : theme.colors.primary}
                />
                <Text
                  style={{
                    color: showFilters ? theme.colors.textInverse : theme.colors.primary,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                  }}
                >
                  Filters
                </Text>
              </Pressable>
            </View>
          </BlurView>
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
                colors={theme.colors.gradients.card as [string, string, ...string[]]}
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
            {(filters.query || filters.systemId || filters.performanceRank) && (
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
                {filters.performanceRank &&
                  ` with ${performanceOptions.find((p) => p.rank === filters.performanceRank)?.label} performance`}
              </Text>
            )}
          </Animated.View>

          {listingsQuery.isLoading ? (
            <View style={{ gap: theme.spacing.md }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Animated.View
                  key={index}
                  entering={SlideInRight.delay(700 + index * 150).springify()}
                >
                  <Card style={{ height: 120, padding: theme.spacing.lg }}>
                    <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                      <SkeletonLoader width={80} height={80} borderRadius={theme.borderRadius.md} />
                      <View style={{ flex: 1, justifyContent: 'space-between' }}>
                        <SkeletonLoader width="90%" height={18} />
                        <SkeletonLoader width="70%" height={14} />
                        <SkeletonLoader width="60%" height={14} />
                        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                          <SkeletonLoader width={60} height={12} />
                          <SkeletonLoader width={40} height={12} />
                        </View>
                      </View>
                    </View>
                  </Card>
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
                      colors={theme.colors.gradients.primary as [string, string, ...string[]]}
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
                      colors={theme.colors.gradients.gaming as [string, string, ...string[]]}
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
