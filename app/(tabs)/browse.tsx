import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import Animated, {
  FadeInUp,
  runOnJS,
  SlideInLeft,
  SlideInRight,
  useAnimatedScrollHandler,
  useSharedValue,
  ZoomIn,
} from 'react-native-reanimated'

import { ListingCard } from '@/components/cards'
import QuickAccessSection from '@/components/sections/QuickAccessSection'
import { ThemedText } from '@/components/themed/ThemedText'
import { Button, Card, SearchSuggestions, ScreenLayout, ScreenHeader } from '@/components/ui'
import { AnimatedPressable } from '@/components/ui/MicroInteractions'
import { EnhancedSkeletonCard } from '@/components/ui/MorphingSkeleton'
import FiltersModal from '@/components/modals/FiltersModal'
import { useTheme } from '@/contexts/ThemeContext'
import { useInfiniteListings, useSearchSuggestions } from '@/lib/api/hooks'
import { appStorage } from '@/lib/storage'
import type { Listing } from '@/types'

interface SearchFilters {
  query: string
  systemIds: string[]
  deviceIds: string[]
  emulatorIds: string[]
  performanceRanks: number[]
  sortBy: 'newest' | 'oldest' | 'rating' | 'performance'
}


export default function BrowseScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    systemIds: [],
    deviceIds: [],
    emulatorIds: [],
    performanceRanks: [],
    sortBy: 'newest',
  })
  const [showFilterModal, setShowFilterModal] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const scrollY = useSharedValue(0)


  // API calls
  const listingsQuery = useInfiniteListings({
    gameId: undefined,
    systemId: filters.systemIds.length === 1 ? filters.systemIds[0] : undefined,
    deviceId: filters.deviceIds.length === 1 ? filters.deviceIds[0] : undefined,
    emulatorId: filters.emulatorIds.length === 1 ? filters.emulatorIds[0] : undefined, // Fallback for single emulator
    emulatorIds: filters.emulatorIds.length > 0 ? filters.emulatorIds : undefined, // Support for multiple emulators
    search: debouncedQuery || undefined,
    limit: 50,
  })
  const suggestionsQuery = useSearchSuggestions(
    { query: debouncedQuery, limit: 10 },
    { enabled: debouncedQuery.length > 0 },
  )

  const listings = (listingsQuery.data as any)?.pages?.flatMap((page: any) => page.listings) || []
  const hasNextPage = listingsQuery.hasNextPage
  const isFetchingNextPage = listingsQuery.isFetchingNextPage
  const _totalCount = (listingsQuery.data as any)?.pages?.[0]?.pagination.total || 0

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
      } catch {
        // Silent failure - recent searches are not critical
      }
    }
    loadRecentSearches()
  }, [])

  // Filter listings based on performance and other client-side filters
  const filteredListings = listings.filter((listing: Listing) => {
    // Performance filter
    const matchesPerformance =
      filters.performanceRanks.length === 0 || 
      (listing.performance?.rank && filters.performanceRanks.includes(listing.performance.rank))

    // Additional client-side filtering for multiple systems/devices if needed
    const matchesSystem = 
      filters.systemIds.length === 0 || 
      filters.systemIds.includes(listing.game?.systemId || '')
      
    const matchesDevice = 
      filters.deviceIds.length === 0 || 
      filters.deviceIds.includes(listing.device?.id || '')

    return matchesPerformance && matchesSystem && matchesDevice
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


  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    runOnJS(Haptics.selectionAsync)()
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      systemIds: [],
      deviceIds: [],
      emulatorIds: [],
      performanceRanks: [],
      sortBy: 'newest',
    })
  }

  const handleListingPress = (listingId: string) => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
    router.push(`/listing/${listingId}`)
  }

  const toggleFilters = () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
    setShowFilterModal(true)
  }
  
  const handleFiltersApply = (newFilters: { systemIds: string[], deviceIds: string[], emulatorIds: string[], performanceRanks: number[] }) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await listingsQuery.refetch()
    } catch {
      // Silent failure - error will be displayed in UI
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
    } catch {
      // Silent failure - search history is not critical
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
    } catch {
      // Silent failure - clearing history is not critical
    }
  }

  const handleSearchFocus = () => {
    setShowSuggestions(true)
  }

  const handleSearchBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200)
  }



  return (
    <ScreenLayout
      scrollable={false}
      style={{ backgroundColor: theme.colors.background }}
    >
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
          />
        }
        contentContainerStyle={{ paddingBottom: theme.spacing.xxxl }}
      >
        {/* Header */}
        <ScreenHeader
          title="Browse Listings"
          subtitle="Find performance data for your favorite games"
          variant="hero"
          animated
        />

        {/* Revolutionary Search Bar */}
        <Animated.View
          entering={SlideInLeft.delay(800).springify()}
          style={styles.searchContainer}
        >
          <View style={styles.searchMagnetic}>
            <BlurView
              intensity={100}
              tint={theme.isDark ? 'dark' : 'light'}
              style={styles.searchBlur}
            >

              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={22} color={theme.colors.primary} />

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
                
                {filters.query && (
                  <Pressable
                    onPress={() => handleFilterChange('query', '')}
                    style={styles.clearSearchButton}
                  >
                    <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                  </Pressable>
                )}

                <AnimatedPressable onPress={toggleFilters}>
                  <View
                    style={[
                      styles.filtersButton,
                      {
                        backgroundColor: (filters.systemIds.length > 0 || 
                          filters.deviceIds.length > 0 || 
                          filters.emulatorIds.length > 0 || 
                          filters.performanceRanks.length > 0)
                          ? theme.colors.primary
                          : theme.colors.surface,
                        borderWidth: 1,
                        borderColor: (filters.systemIds.length > 0 || 
                          filters.deviceIds.length > 0 || 
                          filters.emulatorIds.length > 0 || 
                          filters.performanceRanks.length > 0)
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="filter"
                      size={18}
                      color={(filters.systemIds.length > 0 || 
                        filters.deviceIds.length > 0 || 
                        filters.emulatorIds.length > 0 || 
                        filters.performanceRanks.length > 0)
                        ? theme.colors.textInverse 
                        : theme.colors.text}
                    />
                    <ThemedText
                      style={[
                        styles.filtersButtonText,
                        {
                          color: (filters.systemIds.length > 0 || 
                            filters.deviceIds.length > 0 || 
                            filters.emulatorIds.length > 0 || 
                            filters.performanceRanks.length > 0)
                            ? theme.colors.textInverse 
                            : theme.colors.text,
                        },
                      ]}
                    >
                      Filters
                    </ThemedText>
                    {(filters.systemIds.length > 0 || 
                      filters.deviceIds.length > 0 || 
                      filters.emulatorIds.length > 0 || 
                      filters.performanceRanks.length > 0) && (
                      <View style={styles.filterBadge}>
                        <ThemedText style={styles.filterBadgeText}>
                          {filters.systemIds.length + 
                           filters.deviceIds.length + 
                           filters.emulatorIds.length + 
                           filters.performanceRanks.length}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </AnimatedPressable>
              </View>
            </BlurView>
          </View>
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
            <ThemedText
              type="title"
              style={{
                fontSize: theme.typography.fontSize.xl,
                marginBottom: theme.spacing.xs,
              }}
            >
              {sortedListings.length} Results
            </ThemedText>
            {(filters.query || filters.systemIds.length > 0 || filters.deviceIds.length > 0 || filters.emulatorIds.length > 0 || filters.performanceRanks.length > 0) && (
              <ThemedText
                type="subtitle"
                style={{
                  fontSize: theme.typography.fontSize.md,
                  color: theme.colors.textMuted,
                  lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
                }}
              >
                {filters.query && `"${filters.query}"`}
                {filters.systemIds.length > 0 &&
                  ` in ${filters.systemIds.length} system${filters.systemIds.length > 1 ? 's' : ''}`}
                {filters.deviceIds.length > 0 &&
                  ` on ${filters.deviceIds.length} device${filters.deviceIds.length > 1 ? 's' : ''}`}
                {filters.emulatorIds.length > 0 &&
                  ` using ${filters.emulatorIds.length} emulator${filters.emulatorIds.length > 1 ? 's' : ''}`}
                {filters.performanceRanks.length > 0 &&
                  ` with ${filters.performanceRanks.length} performance level${filters.performanceRanks.length > 1 ? 's' : ''}`}
              </ThemedText>
            )}
          </Animated.View>

          {listingsQuery.isLoading ? (
            <View style={styles.loadingContainer}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Animated.View
                  key={index}
                  entering={SlideInRight.delay(700 + index * 150).springify()}
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
                  <ThemedText
                    type="title"
                    style={{
                      fontSize: theme.typography.fontSize.xl,
                      marginBottom: theme.spacing.sm,
                      textAlign: 'center',
                    }}
                  >
                    Unable to Load Listings
                  </ThemedText>
                  <ThemedText
                    type="subtitle"
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
                  </ThemedText>
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
                    <ThemedText
                      type="defaultSemiBold"
                      style={{
                        color: theme.colors.textInverse,
                        fontSize: theme.typography.fontSize.md,
                      }}
                    >
                      Retry
                    </ThemedText>
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
              
              {/* Load More Button */}
              {hasNextPage && (
                <Animated.View entering={SlideInLeft.delay(800).springify()} style={{ marginTop: theme.spacing.lg }}>
                  <Button
                    title={isFetchingNextPage ? "Loading..." : "Load More"}
                    onPress={() => listingsQuery.fetchNextPage()}
                    loading={isFetchingNextPage}
                    disabled={isFetchingNextPage}
                    variant="outline"
                    size="lg"
                    style={{
                      borderColor: theme.colors.primary,
                      backgroundColor: theme.colors.background,
                    }}
                  />
                </Animated.View>
              )}
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
                  <ThemedText
                    type="title"
                    style={{
                      fontSize: theme.typography.fontSize.xl,
                      color: theme.colors.textInverse,
                      marginBottom: theme.spacing.sm,
                      textAlign: 'center',
                    }}
                  >
                    No Results Found
                  </ThemedText>
                  <ThemedText
                    type="subtitle"
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
                  </ThemedText>
                  <Pressable
                    onPress={clearFilters}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      paddingHorizontal: theme.spacing.lg,
                      paddingVertical: theme.spacing.md,
                      borderRadius: theme.borderRadius.lg,
                    }}
                  >
                    <ThemedText
                      type="defaultSemiBold"
                      style={{
                        color: theme.colors.textInverse,
                        fontSize: theme.typography.fontSize.md,
                      }}
                    >
                      Clear Filters
                    </ThemedText>
                  </Pressable>
                </LinearGradient>
              </Card>
            </Animated.View>
          )}
        </View>

        {/* Quick Access to New Features */}
        {!filters.query && filters.systemIds.length === 0 && filters.deviceIds.length === 0 && filters.emulatorIds.length === 0 && filters.performanceRanks.length === 0 && (
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
        {!filters.query && filters.systemIds.length === 0 && filters.deviceIds.length === 0 && filters.emulatorIds.length === 0 && filters.performanceRanks.length === 0 && (
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
            }}
          >
            <Animated.View entering={FadeInUp.delay(900).springify()}>
              <ThemedText
                type="title"
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  marginBottom: theme.spacing.lg,
                }}
              >
                Quick Actions
              </ThemedText>
            </Animated.View>
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
                      <ThemedText
                        type="defaultSemiBold"
                        style={{
                          fontSize: theme.typography.fontSize.md,
                          color: theme.colors.textInverse,
                          marginBottom: theme.spacing.xs,
                          textAlign: 'center',
                        }}
                      >
                        Create Listing
                      </ThemedText>
                      <ThemedText
                        type="caption"
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: `${theme.colors.textInverse}CC`,
                          textAlign: 'center',
                          lineHeight:
                            theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
                        }}
                      >
                        Share your emulation experience
                      </ThemedText>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                <Animated.View entering={SlideInRight.delay(1100).springify()}>
                  <Pressable
                    onPress={() => handleFiltersApply({ 
                      systemIds: filters.systemIds,
                      deviceIds: filters.deviceIds,
                      emulatorIds: filters.emulatorIds,
                      performanceRanks: [5]
                    })}
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
                      <ThemedText
                        type="defaultSemiBold"
                        style={{
                          fontSize: theme.typography.fontSize.md,
                          color: theme.colors.textInverse,
                          marginBottom: theme.spacing.xs,
                          textAlign: 'center',
                        }}
                      >
                        Perfect Games
                      </ThemedText>
                      <ThemedText
                        type="caption"
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: `${theme.colors.textInverse}CC`,
                          textAlign: 'center',
                          lineHeight:
                            theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
                        }}
                      >
                        Browse flawless performance
                      </ThemedText>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </View>
            </Animated.ScrollView>
          </View>
        )}
      </Animated.ScrollView>
      
      {/* Filters Modal */}
      <FiltersModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFiltersApply}
        currentFilters={{
          systemIds: filters.systemIds,
          deviceIds: filters.deviceIds,
          emulatorIds: filters.emulatorIds,
          performanceRanks: filters.performanceRanks,
        }}
      />
    </ScreenLayout>
  )
}

const styles = StyleSheet.create({
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: -24,
  },
  searchMagnetic: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'transparent',
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
    gap: 6,
    borderRadius: 12,
  },
  filtersButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: -8,
  },
  loadingContainer: {
    gap: 12,
  },
  skeletonCard: {
    borderRadius: 20,
    height: 120,
  },
})
