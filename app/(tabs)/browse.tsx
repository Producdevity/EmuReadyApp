import React, { useState, useEffect, useRef } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  RefreshControl,
  StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import {
  Card,
  Button,
  SearchSuggestions,
  SkeletonListingCard,
} from '@/components/ui'
import { ListingCard } from '@/components/cards'
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

  const filtersOpacity = useSharedValue(0)
  const filtersHeight = useSharedValue(0)

  // API calls
  const listingsQuery = useListings({
    gameId:     undefined,
    systemId:   filters.systemId || undefined,
    deviceId:   filters.deviceId || undefined,
    emulatorId: undefined,
    page:       1,
    limit:      50,
  })
  const systemsQuery = useSystems()
  const suggestionsQuery = useSearchSuggestions(
    { query: debouncedQuery, limit: 10 },
    { enabled: debouncedQuery.length > 0 }
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
    const loadRecentSearches = () => {
      try {
        const saved = appStorage.get<string[]>('recent_searches') || []
        setRecentSearches(saved.slice(0, 5)) // Keep only last 5 searches
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
      listing.game?.title
        ?.toLowerCase()
        .includes(debouncedQuery.toLowerCase()) ||
      listing.device?.modelName
        ?.toLowerCase()
        .includes(debouncedQuery.toLowerCase()) ||
      listing.emulator?.name
        ?.toLowerCase()
        .includes(debouncedQuery.toLowerCase())

    const matchesPerformance =
      !filters.performanceRank ||
      listing.performance?.rank === filters.performanceRank

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
    ;(router.push as any)(`/listing/${listingId}`)
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

  const filtersAnimatedStyle = useAnimatedStyle(() => ({
    opacity: filtersOpacity.value,
    transform: [{ scaleY: filtersHeight.value }],
  }))

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

  const saveSearchToHistory = (query: string) => {
    if (!query.trim()) return

    try {
      const current = appStorage.get<string[]>('recent_searches') || []
      const updated = [query, ...current.filter((s) => s !== query)].slice(0, 5)
      appStorage.set('recent_searches', updated)
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

  const handleClearHistory = () => {
    try {
      appStorage.delete('recent_searches')
      setRecentSearches([])
    } catch (error) {
      console.error('Error clearing search history:', error)
    }
  }

  const handleSearchFocus = () => {
    setShowSuggestions(true)
  }

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow for suggestion taps
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

  // Create themed styles
  const styles = createStyles(theme)

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Gradient Background */}
      <LinearGradient
        colors={
          theme.isDark
            ? ['#1e293b', '#0f172a', '#0f172a']
            : ['#f8fafc', '#ffffff', '#ffffff']
        }
        style={styles.gradientBackground}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <SafeAreaView>
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.header}
          >
            <Text style={styles.title}>Browse Listings</Text>
            <Text style={styles.subtitle}>
              Find performance data for your favorite games
            </Text>
          </Animated.View>
        </SafeAreaView>

        {/* Search Bar */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <Card variant="glass" style={styles.searchCard} padding="md">
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={theme.colors.textMuted}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
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
              <Button
                title="Filters"
                variant={showFilters ? 'primary' : 'outline'}
                size="sm"
                onPress={toggleFilters}
                rightIcon={
                  <Ionicons
                    name="filter"
                    size={16}
                    color={showFilters ? '#ffffff' : theme.colors.primary}
                  />
                }
              />
            </View>
          </Card>
        </Animated.View>

        {/* Search Suggestions */}
        <SearchSuggestions
          visible={
            showSuggestions &&
            (recentSearches.length > 0 || filters.query.length === 0 || (suggestionsQuery.data?.length ?? 0) > 0)
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

        {/* Filters Panel */}
        {showFilters && (
          <Animated.View
            style={[styles.filtersPanel, filtersAnimatedStyle]}
            entering={FadeInUp.delay(100).springify()}
          >
            <Card variant="glass" padding="md">
              <View style={styles.filtersHeader}>
                <Text style={styles.filtersTitle}>Filters</Text>
                <Button
                  title="Clear All"
                  variant="ghost"
                  size="sm"
                  onPress={clearFilters}
                />
              </View>

              {/* System Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>System</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterOptions}>
                    <Card
                      style={StyleSheet.flatten([
                        styles.filterOption,
                        !filters.systemId && styles.filterOptionSelected,
                      ])}
                      padding="sm"
                      onPress={() => handleFilterChange('systemId', null)}
                    >
                      <Text style={styles.filterOptionText}>All</Text>
                    </Card>
                    {systemsQuery.data?.map((system: System) => (
                      <Card
                        key={system.id}
                        style={StyleSheet.flatten([
                          styles.filterOption,
                          filters.systemId === system.id &&
                            styles.filterOptionSelected,
                        ])}
                        padding="sm"
                        onPress={() =>
                          handleFilterChange('systemId', system.id)
                        }
                      >
                        <Text style={styles.filterOptionText}>
                          {system.name}
                        </Text>
                      </Card>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Performance Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Performance</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterOptions}>
                    <Card
                      style={StyleSheet.flatten([
                        styles.filterOption,
                        !filters.performanceRank && styles.filterOptionSelected,
                      ])}
                      padding="sm"
                      onPress={() =>
                        handleFilterChange('performanceRank', null)
                      }
                    >
                      <Text style={styles.filterOptionText}>All</Text>
                    </Card>
                    {performanceOptions.map((option) => (
                      <Card
                        key={option.rank}
                        style={StyleSheet.flatten([
                          styles.filterOption,
                          filters.performanceRank === option.rank &&
                            styles.filterOptionSelected,
                        ])}
                        padding="sm"
                        onPress={() =>
                          handleFilterChange('performanceRank', option.rank)
                        }
                      >
                        <View style={styles.performanceFilter}>
                          <View
                            style={[
                              styles.performanceDot,
                              { backgroundColor: option.color },
                            ]}
                          />
                          <Text style={styles.filterOptionText}>
                            {option.label}
                          </Text>
                        </View>
                      </Card>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Sort Options */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Sort By</Text>
                <View style={styles.sortOptions}>
                  {sortOptions.map((option) => (
                    <Card
                      key={option.value}
                      style={StyleSheet.flatten([
                        styles.filterOption,
                        filters.sortBy === option.value &&
                          styles.filterOptionSelected,
                      ])}
                      padding="sm"
                      onPress={() => handleFilterChange('sortBy', option.value)}
                    >
                      <Text style={styles.filterOptionText}>
                        {option.label}
                      </Text>
                    </Card>
                  ))}
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Results */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {sortedListings.length} Results
            </Text>
            {(filters.query || filters.systemId || filters.performanceRank) && (
              <Text style={styles.resultsSubtitle}>
                {filters.query && `"${filters.query}"`}
                {filters.systemId &&
                  ` in ${systemsQuery.data?.find((s: System) => s.id === filters.systemId)?.name}`}
                {filters.performanceRank &&
                  ` with ${performanceOptions.find((p) => p.rank === filters.performanceRank)?.label} performance`}
              </Text>
            )}
          </View>

          {listingsQuery.isLoading ? (
            <Animated.View
              entering={FadeInUp.delay(400).springify()}
              style={styles.loadingContainer}
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.delay(500 + index * 100).springify()}
                  style={{ marginBottom: 16 }}
                >
                  <SkeletonListingCard />
                </Animated.View>
              ))}
            </Animated.View>
          ) : listingsQuery.error && sortedListings.length === 0 ? (
            <Animated.View entering={FadeInUp.delay(300).springify()}>
              <Card variant="glass" style={styles.errorCard} padding="lg">
                <Ionicons
                  name="cloud-offline"
                  size={48}
                  color={theme.colors.textMuted}
                  style={{ marginBottom: 16 }}
                />
                <Text style={styles.errorTitle}>Unable to Load Listings</Text>
                <Text style={styles.errorText}>
                  Please check your connection and try again.
                </Text>
                <Button
                  title="Retry"
                  variant="gradient"
                  onPress={() => listingsQuery.refetch()}
                  style={styles.retryButton}
                  leftIcon={
                    <Ionicons name="refresh" size={16} color="#ffffff" />
                  }
                />
              </Card>
            </Animated.View>
          ) : sortedListings.length > 0 ? (
            <View style={styles.listingsContainer}>
              {sortedListings.map((listing, index) => (
                <Animated.View
                  key={listing.id}
                  entering={FadeInUp.delay(300 + index * 50).springify()}
                >
                  <ListingCard
                    listing={listing}
                    onPress={() => handleListingPress(listing.id)}
                    style={styles.listingCard}
                  />
                </Animated.View>
              ))}
            </View>
          ) : (
            <Animated.View entering={FadeInUp.delay(300).springify()}>
              <Card variant="glass" style={styles.emptyCard} padding="lg">
                <Ionicons
                  name="search"
                  size={48}
                  color={theme.colors.textMuted}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No Results Found</Text>
                <Text style={styles.emptyText}>
                  Try adjusting your search terms or filters to find what
                  you&apos;re looking for.
                </Text>
                <Button
                  title="Clear Filters"
                  variant="outline"
                  onPress={clearFilters}
                  style={styles.emptyButton}
                />
              </Card>
            </Animated.View>
          )}
        </View>

        {/* Quick Actions */}
        {!filters.query && !filters.systemId && !filters.performanceRank && (
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.actionGrid}>
                <Card
                  style={styles.actionCard}
                  padding="md"
                  onPress={() => router.push('/(tabs)/create')}
                >
                  <Text style={styles.actionIcon}>➕</Text>
                  <Text style={styles.actionTitle}>Create Listing</Text>
                  <Text style={styles.actionDescription}>
                    Share your emulation experience
                  </Text>
                </Card>
                <Card
                  style={styles.actionCard}
                  padding="md"
                  onPress={() => handleFilterChange('performanceRank', 5)}
                >
                  <Text style={styles.actionIcon}>⭐</Text>
                  <Text style={styles.actionTitle}>Perfect Games</Text>
                  <Text style={styles.actionDescription}>
                    Browse flawless performance
                  </Text>
                </Card>
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  )
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    gradientBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 300,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    searchCard: {
      marginHorizontal: 20,
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    searchIcon: {
      marginLeft: 4,
    },
    searchInput: {
      flex: 1,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      paddingVertical: 4,
    },
    filtersPanel: {
      marginHorizontal: 20,
      marginBottom: 20,
    },
    filtersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    filtersTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    filterSection: {
      marginBottom: 20,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    filterOptions: {
      flexDirection: 'row',
      gap: 8,
      paddingRight: 20,
    },
    filterOption: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterOptionSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    filterOptionText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
    performanceFilter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    performanceDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    sortOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    resultsSection: {
      marginHorizontal: 20,
      marginBottom: 24,
    },
    resultsHeader: {
      marginBottom: 16,
    },
    resultsTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    resultsSubtitle: {
      fontSize: 14,
      color: theme.colors.textMuted,
    },
    loadingContainer: {
      paddingVertical: 20,
    },
    loadingText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textMuted,
      marginTop: 12,
      textAlign: 'center',
    },
    errorCard: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 14,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      width: '100%',
    },
    listingsContainer: {
      gap: 16,
    },
    listingCard: {
      marginBottom: 0,
    },
    emptyCard: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginBottom: 24,
    },
    emptyButton: {
      width: '100%',
    },
    quickActions: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    actionGrid: {
      flexDirection: 'row',
      gap: 12,
      paddingRight: 20,
    },
    actionCard: {
      width: 160,
      alignItems: 'center',
    },
    actionIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    actionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    actionDescription: {
      fontSize: 12,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    bottomSpacing: {
      height: 100,
    },
  })
}
