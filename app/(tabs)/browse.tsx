import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Card, Button, SearchSuggestions } from '@/components/ui'
import { ListingCard } from '@/components/cards'
import { useListings, useSystems } from '@/lib/api/hooks'
import { appStorage } from '@/lib/storage'

interface SearchFilters {
  query: string
  systemId: string | null
  deviceId: string | null
  performanceRank: number | null
  sortBy: 'newest' | 'oldest' | 'rating' | 'performance'
}

export default function BrowseScreen() {
  const router = useRouter()
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    systemId: null,
    deviceId: null,
    performanceRank: null,
    sortBy: 'newest',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const fadeAnim = new Animated.Value(1)

  // API calls
  const {
    data: listingsData,
    isLoading,
    error,
    refetch,
  } = useListings({
    gameId: undefined,
    systemId: filters.systemId || undefined,
    deviceId: filters.deviceId || undefined,
    page: 1,
    limit: 20,
  })
  const { data: systems } = useSystems()

  const listings = listingsData?.listings || []

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      setDebouncedQuery(filters.query)
    }, 500)

    setSearchTimeout(timeout as unknown as number)

    return () => {
      if (timeout) clearTimeout(timeout)
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
  const filteredListings = listings.filter((listing) => {
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
        return (b.upvotes || 0) - (a.upvotes || 0)
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
    setShowFilters(!showFilters)
    Animated.timing(fadeAnim, {
      toValue: showFilters ? 1 : 0.3,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
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
    { rank: 5, label: 'Perfect', color: '#10b981' },
    { rank: 4, label: 'Great', color: '#3b82f6' },
    { rank: 3, label: 'Good', color: '#f59e0b' },
    { rank: 2, label: 'Poor', color: '#ef4444' },
    { rank: 1, label: 'Unplayable', color: '#6b7280' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'performance', label: 'Best Performance' },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Browse Listings</Text>
          <Text style={styles.subtitle}>
            Find performance data for your favorite games
          </Text>
        </View>

        {/* Search Bar */}
        <Card style={styles.searchCard} padding="md">
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#9ca3af"
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
              placeholderTextColor="#9ca3af"
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
                  color={showFilters ? '#ffffff' : '#374151'}
                />
              }
            />
          </View>
        </Card>

        {/* Search Suggestions */}
        <SearchSuggestions
          visible={
            showSuggestions &&
            (recentSearches.length > 0 || filters.query.length === 0)
          }
          recentSearches={recentSearches}
          popularSuggestions={[
            'Super Mario',
            'Zelda',
            'Pokemon',
            'Final Fantasy',
            'Sonic',
          ]}
          onSuggestionPress={handleSuggestionPress}
          onClearHistory={handleClearHistory}
        />

        {/* Filters Panel */}
        {showFilters && (
          <Animated.View style={[styles.filtersPanel, { opacity: fadeAnim }]}>
            <Card padding="md">
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
                    {systems?.map((system) => (
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
                        styles.sortOption,
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
                  ` in ${systems?.find((s) => s.id === filters.systemId)?.name}`}
                {filters.performanceRank &&
                  ` with ${performanceOptions.find((p) => p.rank === filters.performanceRank)?.label} performance`}
              </Text>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading listings...</Text>
            </View>
          ) : error ? (
            <Card style={styles.errorCard} padding="md">
              <Text style={styles.errorTitle}>Unable to Load Listings</Text>
              <Text style={styles.errorText}>
                Please check your connection and try again.
              </Text>
              <Button
                title="Retry"
                variant="primary"
                onPress={() => refetch()}
                style={styles.retryButton}
              />
            </Card>
          ) : sortedListings.length > 0 ? (
            <View style={styles.listingsContainer}>
              {sortedListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onPress={() => handleListingPress(listing.id)}
                  style={styles.listingCard}
                />
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard} padding="lg">
              <Ionicons
                name="search"
                size={48}
                color="#9ca3af"
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
          )}
        </View>

        {/* Quick Actions */}
        {!filters.query && !filters.systemId && !filters.performanceRank && (
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
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
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
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
    fontSize: 16,
    color: '#111827',
    paddingVertical: 4,
  },
  filtersPanel: {
    marginHorizontal: 20,
    marginBottom: 16,
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
    color: '#111827',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  filterOption: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterOptionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#374151',
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
    gap: 8,
  },
  sortOption: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    color: '#111827',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
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
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
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
    color: '#111827',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
})
