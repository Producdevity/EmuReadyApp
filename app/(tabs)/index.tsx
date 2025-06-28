import React, { useState, useEffect } from 'react'
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
} from '@/lib/api/hooks'
import { useTheme } from '@/contexts/ThemeContext'
import { checkApiAvailability } from '@/lib/api/client'
import type { Listing, Game } from '@/types'

export default function HomeScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const [isApiAvailable, setIsApiAvailable] = useState<boolean | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Fetch data using our API hooks (now with proper type safety)
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useAppStats()
  const {
    data: featuredListings,
    isLoading: listingsLoading,
    error: listingsError,
    refetch: refetchListings,
  } = useFeaturedListings()
  const {
    data: popularGames,
    isLoading: gamesLoading,
    error: gamesError,
    refetch: refetchGames,
  } = usePopularGames()

  // Check API availability on mount and when retry is attempted
  useEffect(() => {
    const checkApi = async () => {
      const available = await checkApiAvailability()
      setIsApiAvailable(available)

      // If API is available but we had errors, retry the data fetches
      if (available && (statsError || listingsError || gamesError)) {
        refetchStats()
        refetchListings()
        refetchGames()
      }
    }

    checkApi()
  }, [
    retryCount,
    statsError,
    listingsError,
    gamesError,
    refetchGames,
    refetchListings,
    refetchStats,
  ])

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

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  // Create themed styles
  const styles = createStyles(theme)

  // Loading state for critical data
  if (statsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
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
          <Text style={styles.errorTitle}>
            {isApiAvailable === false
              ? 'Unable to Connect'
              : 'Error Loading Data'}
          </Text>
          <Text style={styles.errorText}>
            {isApiAvailable === false
              ? "We couldn't connect to the EmuReady server. Please check your internet connection and try again."
              : 'We encountered an error while loading data. Please try again.'}
          </Text>
          {isApiAvailable === false && (
            <Text style={styles.errorDetail}>
              Server:{' '}
              {process.env.EXPO_PUBLIC_API_URL || 'https://dev.emuready.com'}
            </Text>
          )}
          <Button
            title="Retry"
            variant="primary"
            onPress={handleRetry}
            style={styles.retryButton}
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
                color: theme.colors.primary,
                icon: '📊',
              },
              {
                label: 'Games',
                value: stats?.totalGames?.toLocaleString() || '0',
                color: theme.colors.secondary,
                icon: '🎮',
              },
              {
                label: 'Users',
                value: stats?.totalUsers?.toLocaleString() || '0',
                color: theme.colors.error,
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
              <ActivityIndicator size="small" color={theme.colors.primary} />
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
              {(featuredListings || []).slice(0, 5).map((listing: Listing) => (
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
                        👍 {listing.upVotes || 0}
                      </Text>
                      <Text style={styles.listingComments}>
                        💬 {listing._count?.comments || 0}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Popular Games */}
        <View style={styles.gamesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Games</Text>
            <Button
              title="Browse All"
              variant="ghost"
              size="sm"
              onPress={handleBrowseListings}
            />
          </View>

          {gamesLoading ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading games...</Text>
            </View>
          ) : gamesError ? (
            <Card style={styles.errorCard} padding="md">
              <Text style={styles.errorText}>Unable to load popular games</Text>
            </Card>
          ) : (
            <View style={styles.gamesGrid}>
              {(popularGames || []).slice(0, 6).map((game: Game) => (
                <Card
                  key={game.id}
                  style={styles.gameCard}
                  padding="md"
                  onPress={() => handleViewGame(game.id)}
                >
                  <Text style={styles.gameTitle} numberOfLines={2}>
                    {game.title}
                  </Text>
                  <Text style={styles.gameSystem}>{game.system?.name}</Text>
                  <Text style={styles.gameListings}>
                    {game._count?.listings || 0} listings
                  </Text>
                </Card>
              ))}
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
                <Text style={styles.actionIcon}>✨</Text>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>Create New Listing</Text>
                  <Text style={styles.actionDescription}>
                    Share your emulation performance data
                  </Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
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
                    Find performance data for your games
                  </Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </View>
            </Card>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  )
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    loadingSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    loadingText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    errorCard: {
      alignItems: 'center',
    },
    errorTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.error,
      marginBottom: theme.spacing.sm,
    },
    errorText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    errorDetail: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    retryButton: {
      marginTop: theme.spacing.md,
      width: '100%',
    },
    header: {
      padding: theme.spacing.lg,
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.xxl + 8,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    statsSection: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    statIcon: {
      fontSize: theme.typography.fontSize.lg + 4,
      marginBottom: theme.spacing.sm,
    },
    statValue: {
      fontSize: theme.typography.fontSize.lg + 4,
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    featuredSection: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    horizontalScroll: {
      marginHorizontal: -theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
    },
    featuredCard: {
      width: 280,
      marginRight: theme.spacing.md,
    },
    featuredContent: {
      gap: theme.spacing.sm,
    },
    featuredTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    featuredSystem: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    featuredDevice: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    performanceBadge: {
      backgroundColor: theme.colors.secondary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.md,
      alignSelf: 'flex-start',
      marginTop: 4,
    },
    performanceText: {
      fontSize: theme.typography.fontSize.xs,
      color: '#ffffff',
      fontWeight: theme.typography.fontWeight.medium,
    },
    listingStats: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    listingVotes: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    listingComments: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    gamesSection: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    gamesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    gameCard: {
      flex: 1,
      minWidth: '45%',
      maxWidth: '48%',
    },
    gameTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: 4,
    },
    gameSystem: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.primary,
      marginBottom: 2,
    },
    gameListings: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    actionsSection: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    actionsList: {
      gap: theme.spacing.sm,
    },
    actionCard: {
      backgroundColor: theme.colors.card,
    },
    actionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    actionIcon: {
      fontSize: theme.typography.fontSize.lg + 4,
    },
    actionText: {
      flex: 1,
    },
    actionTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: 2,
    },
    actionDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    actionArrow: {
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.textSecondary,
    },
    emptyCard: {
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    emptyText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    bottomSpacing: {
      height: theme.spacing.lg,
    },
  })
}
