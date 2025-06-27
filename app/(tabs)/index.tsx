import React from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Button, Card } from '../../components/ui'
import {
  useAppStats,
  useFeaturedListings,
  usePopularGames,
} from '../../lib/api/hooks'

export default function HomeScreen() {
  const router = useRouter()

  // Fetch data using our API hooks
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useAppStats()
  const {
    data: featuredListings,
    isLoading: listingsLoading,
    error: listingsError,
  } = useFeaturedListings()
  const {
    data: popularGames,
    isLoading: gamesLoading,
    error: gamesError,
  } = usePopularGames()

  const handleCreateListing = () => {
    router.push('/(tabs)/create')
  }

  const handleBrowseListings = () => {
    router.push('/(tabs)/browse')
  }

  const handleViewListing = (listingId: string) => {
    ;(router.push as any)(`/listing/${listingId}`)
  }

  const handleViewGame = (gameId: string) => {
    ;(router.push as any)(`/game/${gameId}`)
  }

  // Loading state for critical data
  if (statsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading EmuReady...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Error state
  if (statsError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to Connect</Text>
          <Text style={styles.errorText}>
            Please check your internet connection and try again.
          </Text>
          <Button
            title="Retry"
            variant="primary"
            onPress={() => window.location.reload()}
          />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>EmuReady</Text>
          <Text style={styles.subtitle}>
            Discover the best emulation setups
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Community Stats</Text>
          <View style={styles.statsGrid}>
            {[
              {
                label: 'Listings',
                value: stats?.totalListings?.toLocaleString() || '0',
                color: '#3b82f6',
                icon: '📊',
              },
              {
                label: 'Games',
                value: stats?.totalGames?.toLocaleString() || '0',
                color: '#10b981',
                icon: '🎮',
              },
              {
                label: 'Success Rate',
                value: stats?.successRate
                  ? `${Math.round(stats.successRate)}%`
                  : '0%',
                color: '#f59e0b',
                icon: '⭐',
              },
              {
                label: 'Users',
                value: stats?.totalUsers?.toLocaleString() || '0',
                color: '#ef4444',
                icon: '👥',
              },
            ].map((stat) => (
              <Card key={stat.label} style={styles.statCard} padding="md">
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Featured Listings */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Listings</Text>
            <Button
              title="View All"
              variant="ghost"
              size="sm"
              onPress={handleBrowseListings}
            />
          </View>

          {listingsLoading ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading listings...</Text>
            </View>
          ) : listingsError ? (
            <Card style={styles.errorCard} padding="md">
              <Text style={styles.errorText}>
                Unable to load featured listings
              </Text>
            </Card>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {featuredListings?.slice(0, 5).map((listing) => (
                <Card
                  key={listing.id}
                  style={styles.featuredCard}
                  padding="md"
                  onPress={() => handleViewListing(listing.id)}
                >
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredTitle} numberOfLines={2}>
                      {listing.game?.title || 'Unknown Game'}
                    </Text>
                    <Text style={styles.featuredSystem}>
                      {listing.game?.system?.name || 'Unknown System'}
                    </Text>
                    <Text style={styles.featuredDevice}>
                      {listing.device?.modelName || 'Unknown Device'}
                    </Text>

                    <View style={styles.performanceBadge}>
                      <Text style={styles.performanceText}>
                        {listing.performance?.label || 'Not Rated'}
                      </Text>
                    </View>

                    <View style={styles.listingStats}>
                      <Text style={styles.listingVotes}>
                        👍 {listing.upvotes || 0}
                      </Text>
                      <Text style={styles.listingComments}>
                        💬 {listing._count?.comments || 0}
                      </Text>
                    </View>
                  </View>
                </Card>
              )) || (
                <Card style={styles.emptyCard} padding="md">
                  <Text style={styles.emptyText}>
                    No featured listings available
                  </Text>
                </Card>
              )}
            </ScrollView>
          )}
        </View>

        {/* Popular Games */}
        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>Popular Games</Text>

          {gamesLoading ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading games...</Text>
            </View>
          ) : gamesError ? (
            <Card style={styles.errorCard} padding="md">
              <Text style={styles.errorText}>Unable to load popular games</Text>
            </Card>
          ) : (
            <View style={styles.gamesGrid}>
              {popularGames?.slice(0, 6).map((game) => (
                <Card
                  key={game.id}
                  style={styles.gameCard}
                  padding="sm"
                  onPress={() => handleViewGame(game.id)}
                >
                  <Text style={styles.gameTitle} numberOfLines={2}>
                    {game.title}
                  </Text>
                  <Text style={styles.gameSystem}>
                    {game.system?.name || 'Multiple Systems'}
                  </Text>
                  <Text style={styles.gameListings}>Popular game</Text>
                </Card>
              )) || (
                <Card style={styles.emptyCard} padding="md">
                  <Text style={styles.emptyText}>
                    No popular games available
                  </Text>
                </Card>
              )}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsList}>
            <Card
              style={styles.actionCard}
              padding="md"
              onPress={handleCreateListing}
            >
              <View style={styles.actionContent}>
                <Text style={styles.actionIcon}>➕</Text>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>Add Listing</Text>
                  <Text style={styles.actionDescription}>
                    Share your emulation setup
                  </Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </View>
            </Card>

            <Card
              style={styles.actionCard}
              padding="md"
              onPress={handleBrowseListings}
            >
              <View style={styles.actionContent}>
                <Text style={styles.actionIcon}>🔍</Text>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>Browse Listings</Text>
                  <Text style={styles.actionDescription}>
                    Find performance data
                  </Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </View>
            </Card>

            <Card
              style={styles.actionCard}
              padding="md"
              onPress={() => router.push('/(tabs)/profile')}
            >
              <View style={styles.actionContent}>
                <Text style={styles.actionIcon}>👤</Text>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>Your Profile</Text>
                  <Text style={styles.actionDescription}>
                    Manage your account
                  </Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </View>
            </Card>
          </View>
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorCard: {
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  featuredSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  horizontalScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  featuredCard: {
    width: 280,
    marginRight: 16,
  },
  featuredContent: {
    gap: 8,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  featuredSystem: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  featuredDevice: {
    fontSize: 14,
    color: '#6b7280',
  },
  performanceBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  performanceText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  listingStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  listingVotes: {
    fontSize: 12,
    color: '#6b7280',
  },
  listingComments: {
    fontSize: 12,
    color: '#6b7280',
  },
  gamesSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gameCard: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  gameSystem: {
    fontSize: 12,
    color: '#3b82f6',
    marginBottom: 2,
  },
  gameListings: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  actionsList: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#ffffff',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 24,
  },
})
