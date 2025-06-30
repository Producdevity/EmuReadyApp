import React, { useState } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  Pressable,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  SlideInRight,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Sharing from 'expo-sharing'
import { useGameById, useListingsByGame } from '@/lib/api/hooks'
import {
  Button,
  Card,
  SkeletonListingCard,
  SkeletonLoader,
  CachedImage,
  EmptyListings,
} from '@/components/ui'
import { ListingCard } from '@/components/cards'
import { useTheme } from '@/contexts/ThemeContext'
import {
  useScrollHeaderAnimation,
  useRefreshableQuery,
  useListAnimation,
} from '@/hooks'
import type { Listing } from '@/types'

const HEADER_HEIGHT = 280

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { theme } = useTheme()
  const [selectedTab, setSelectedTab] = useState<'overview' | 'listings'>(
    'overview',
  )

  // ✅ Direct tRPC usage - no wrapper hooks needed!
  const gameQuery = trpc.mobile.getGameById.useQuery({ id: id || '' })
  const listingsQuery = trpc.mobile.getListings.useQuery({
    gameId: id || '',
    page: 1,
    limit: 50,
  })

  const { scrollHandler, headerAnimatedStyle } = useScrollHeaderAnimation({
    headerHeight: HEADER_HEIGHT,
  })

  const { refreshing, onRefresh } = useRefreshableQuery({
    queries: [gameQuery.refetch, listingsQuery.refetch],
  })

  const { getItemAnimation, getHeaderAnimation } = useListAnimation()

  const styles = createStyles(theme)
  const listings = listingsQuery.data?.listings || []

  // Guard against missing id parameter
  if (!id) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text>Invalid game ID</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    )
  }

  const handleShare = async () => {
    try {
      const shareContent =
        `Check out ${gameQuery.data?.title} on EmuReady!\n\n` +
        `System: ${gameQuery.data?.system?.name}\n` +
        `${listings.length} performance listing${listings.length !== 1 ? 's' : ''} available\n\n` +
        `Discover how well this game runs on different devices and emulators!`

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareContent, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Game',
        })
      } else {
        Alert.alert('Share', shareContent)
      }
    } catch (error) {
      console.error('Share error:', error)
      Alert.alert('Error', 'Failed to share game. Please try again.')
    }
  }

  const handleListingPress = (listingId: string) => {
    ;(router.push as any)(`/listing/${listingId}`)
  }

  if (gameQuery.isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />

        <LinearGradient
          colors={
            theme.isDark
              ? ['#1e293b', '#0f172a', '#0f172a']
              : ['#f8fafc', '#ffffff', '#ffffff']
          }
          style={styles.gradientBackground}
        />

        <SafeAreaView style={{ flex: 1 }}>
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.header}
          >
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Loading...
            </Text>
          </Animated.View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
          >
            <Animated.View entering={FadeInUp.delay(200).springify()}>
              <Card variant="glass" padding="lg" style={{ marginBottom: 24 }}>
                <SkeletonLoader
                  width="80%"
                  height={32}
                  style={{ marginBottom: 12 }}
                />
                <SkeletonLoader
                  width="60%"
                  height={16}
                  style={{ marginBottom: 24 }}
                />
                <SkeletonLoader width="100%" height={200} borderRadius={12} />
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400).springify()}>
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonListingCard key={index} style={{ marginBottom: 16 }} />
              ))}
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </View>
    )
  }

  if (gameQuery.error || !gameQuery.data) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />

        <LinearGradient
          colors={
            theme.isDark
              ? ['#1e293b', '#0f172a', '#0f172a']
              : ['#f8fafc', '#ffffff', '#ffffff']
          }
          style={styles.gradientBackground}
        />

        <SafeAreaView style={{ flex: 1 }}>
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.header}
          >
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Error
            </Text>
          </Animated.View>

          <View style={styles.errorContainer}>
            <Animated.View entering={FadeInUp.delay(200).springify()}>
              <Card
                variant="glass"
                padding="lg"
                style={{ alignItems: 'center' }}
              >
                <Ionicons
                  name="game-controller-outline"
                  size={64}
                  color={theme.colors.textMuted}
                  style={{ marginBottom: 24 }}
                />
                <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
                  Game Not Found
                </Text>
                <Text
                  style={[styles.errorText, { color: theme.colors.textMuted }]}
                >
                  This game may have been removed or you may not have permission
                  to view it.
                </Text>
                <Button
                  title="Go Back"
                  variant="gradient"
                  onPress={() => router.back()}
                  leftIcon={
                    <Ionicons name="arrow-back" size={16} color="#ffffff" />
                  }
                />
              </Card>
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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

      {/* Fixed Header */}
      <SafeAreaView>
        <Animated.View entering={getHeaderAnimation()} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text
            style={[styles.headerTitle, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {gameQuery.data.title}
          </Text>
          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Ionicons
              name="share-outline"
              size={24}
              color={theme.colors.text}
            />
          </Pressable>
        </Animated.View>
      </SafeAreaView>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Section */}
        <Animated.View
          style={[styles.heroSection, headerAnimatedStyle]}
          entering={FadeInUp.delay(200).springify()}
        >
          <Card variant="glass" padding="lg" style={styles.heroCard}>
            <View style={styles.heroContent}>
              {gameQuery.data.coverImageUrl || gameQuery.data.boxArtUrl ? (
                <Animated.View
                  entering={SlideInRight.delay(300).springify()}
                  style={styles.gameImageContainer}
                >
                  <CachedImage
                    source={{
                      uri:
                        gameQuery.data.coverImageUrl ||
                        gameQuery.data.boxArtUrl ||
                        '',
                    }}
                    style={styles.gameImage}
                    resizeMode="cover"
                    priority="high"
                    cachePolicy="memory-disk"
                    blurhash="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
                    errorPlaceholder={
                      <View style={styles.placeholderImage}>
                        <Ionicons
                          name="game-controller"
                          size={48}
                          color={theme.colors.textMuted}
                        />
                      </View>
                    }
                  />
                </Animated.View>
              ) : (
                <Animated.View
                  style={styles.placeholderImage}
                  entering={SlideInRight.delay(300).springify()}
                >
                  <Ionicons
                    name="game-controller"
                    size={48}
                    color={theme.colors.textMuted}
                  />
                </Animated.View>
              )}

              <View style={styles.gameInfo}>
                <Animated.Text
                  style={[styles.gameTitle, { color: theme.colors.text }]}
                  entering={FadeInUp.delay(400).springify()}
                >
                  {gameQuery.data.title}
                </Animated.Text>
                <Animated.Text
                  style={[
                    styles.systemName,
                    { color: theme.colors.textSecondary },
                  ]}
                  entering={FadeInUp.delay(500).springify()}
                >
                  {gameQuery.data.system?.name}
                </Animated.Text>

                <Animated.View
                  style={styles.gameStats}
                  entering={FadeInUp.delay(600).springify()}
                >
                  <View
                    style={[
                      styles.statItem,
                      { backgroundColor: theme.colors.primaryLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statValue,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {listings.length}
                    </Text>
                    <Text
                      style={[styles.statLabel, { color: theme.colors.text }]}
                    >
                      Listings
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statItem,
                      { backgroundColor: theme.colors.surface },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statValue,
                        { color: theme.colors.success },
                      ]}
                    >
                      {listings.reduce(
                        (sum: number, listing: Listing) =>
                          sum + (listing.upVotes || 0),
                        0,
                      )}
                    </Text>
                    <Text
                      style={[styles.statLabel, { color: theme.colors.text }]}
                    >
                      Upvotes
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statItem,
                      { backgroundColor: theme.colors.surface },
                    ]}
                  >
                    <Text
                      style={[styles.statValue, { color: theme.colors.info }]}
                    >
                      {listings.reduce(
                        (sum: number, listing: Listing) =>
                          sum + (listing._count?.comments || 0),
                        0,
                      )}
                    </Text>
                    <Text
                      style={[styles.statLabel, { color: theme.colors.text }]}
                    >
                      Comments
                    </Text>
                  </View>
                </Animated.View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Tab Navigation */}
        <Animated.View
          style={styles.tabContainer}
          entering={FadeInUp.delay(700).springify()}
        >
          <Card variant="glass" padding="sm">
            <View style={styles.tabButtons}>
              <Pressable
                style={[
                  styles.tab,
                  {
                    backgroundColor:
                      selectedTab === 'overview'
                        ? theme.colors.primary
                        : 'transparent',
                  },
                ]}
                onPress={() => setSelectedTab('overview')}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        selectedTab === 'overview'
                          ? '#ffffff'
                          : theme.colors.text,
                      fontWeight: selectedTab === 'overview' ? '600' : '500',
                    },
                  ]}
                >
                  Overview
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.tab,
                  {
                    backgroundColor:
                      selectedTab === 'listings'
                        ? theme.colors.primary
                        : 'transparent',
                  },
                ]}
                onPress={() => setSelectedTab('listings')}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        selectedTab === 'listings'
                          ? '#ffffff'
                          : theme.colors.text,
                      fontWeight: selectedTab === 'listings' ? '600' : '500',
                    },
                  ]}
                >
                  Listings ({listings.length})
                </Text>
              </Pressable>
            </View>
          </Card>
        </Animated.View>

        {/* Tab Content */}
        {selectedTab === 'overview' ? (
          <View style={styles.tabContent}>
            {/* System Information */}
            <Card style={styles.infoCard} padding="md">
              <Text style={styles.sectionTitle}>System Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Platform:</Text>
                <Text style={styles.infoValue}>
                  {gameQuery.data.system?.name}
                </Text>
              </View>
              {gameQuery.data.system?.key && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>System Key:</Text>
                  <Text style={styles.infoValue}>
                    {gameQuery.data.system.key}
                  </Text>
                </View>
              )}
            </Card>

            {/* Performance Overview */}
            {listings.length > 0 && (
              <Card style={styles.performanceCard} padding="md">
                <Text style={styles.sectionTitle}>Performance Overview</Text>
                <View style={styles.performanceGrid}>
                  {getPerformanceStats(listings).map((stat, index) => (
                    <View key={index} style={styles.performanceItem}>
                      <View
                        style={[
                          styles.performanceDot,
                          { backgroundColor: stat.color },
                        ]}
                      />
                      <Text style={styles.performanceLabel}>{stat.label}</Text>
                      <Text style={styles.performanceCount}>{stat.count}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Popular Devices */}
            {listings.length > 0 && (
              <Card style={styles.devicesCard} padding="md">
                <Text style={styles.sectionTitle}>Popular Devices</Text>
                <View style={styles.devicesList}>
                  {getPopularDevices(listings)
                    .slice(0, 5)
                    .map((device: any, index) => (
                      <View key={index} style={styles.deviceItem}>
                        <Text style={styles.deviceName}>
                          {device.brand} {device.model}
                        </Text>
                        <Text style={styles.deviceCount}>
                          {device.count} listings
                        </Text>
                      </View>
                    ))}
                </View>
              </Card>
            )}

            {/* Quick Actions */}
            <Card style={styles.actionsCard} padding="md">
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionButtons}>
                <Button
                  title="Create Listing"
                  variant="primary"
                  onPress={() => router.push('/(tabs)/create')}
                  style={styles.actionButton}
                />
                <Button
                  title="Browse Similar"
                  variant="outline"
                  onPress={() => router.push('/(tabs)/browse')}
                  style={styles.actionButton}
                />
              </View>
            </Card>
          </View>
        ) : (
          <View style={styles.tabContent}>
            {/* Listings List */}
            {listingsQuery.isLoading ? (
              <Animated.View
                entering={FadeInUp.delay(800).springify()}
                style={styles.loadingSection}
              >
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonListingCard
                    key={index}
                    style={{ marginBottom: 16 }}
                  />
                ))}
              </Animated.View>
            ) : listings.length > 0 ? (
              <View style={styles.listingsContainer}>
                {listings.map((listing: Listing, index: number) => (
                  <Animated.View
                    key={listing.id}
                    entering={getItemAnimation(index)}
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
              <EmptyListings onAction={() => router.push('/(tabs)/create')} />
            )}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  )
}

function getPerformanceStats(listings: any[]) {
  const stats = listings.reduce(
    (acc, listing) => {
      const rank = listing.performance?.rank || 0
      const label = listing.performance?.label || 'Unknown'

      if (!acc[label]) {
        acc[label] = { count: 0, rank }
      }
      acc[label].count++
      return acc
    },
    {} as Record<string, { count: number; rank: number }>,
  )

  return Object.entries(stats)
    .map(([label, data]: any) => ({
      label,
      count: data.count,
      color: getPerformanceColor(data.rank),
    }))
    .sort((a: any, b: any) => b.count - a.count)
}

function getPopularDevices(listings: any[]) {
  const devices = listings.reduce(
    (acc, listing) => {
      const key = `${listing.device?.brand?.name || 'Unknown'} ${listing.device?.modelName || 'Device'}`
      if (!acc[key]) {
        acc[key] = {
          brand: listing.device?.brand?.name || 'Unknown',
          model: listing.device?.modelName || 'Device',
          count: 0,
        }
      }
      acc[key].count++
      return acc
    },
    {} as Record<string, { brand: string; model: string; count: number }>,
  )

  return Object.values(devices).sort((a: any, b: any) => b.count - a.count)
}

function getPerformanceColor(rank: number): string {
  if (rank >= 4) return '#10b981' // Green for excellent
  if (rank >= 3) return '#f59e0b' // Yellow for good
  if (rank >= 2) return '#ef4444' // Red for poor
  return '#6b7280' // Gray for unknown
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    gradientBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 400,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingTop: 60,
      backgroundColor: 'transparent',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    },
    backButton: {
      padding: 8,
      marginLeft: -8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 16,
    },
    shareButton: {
      padding: 8,
      marginRight: -8,
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    loadingText: {
      fontSize: 16,
      color: '#6b7280',
      marginTop: 12,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 8,
    },
    errorText: {
      fontSize: 16,
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: 24,
    },
    heroSection: {
      paddingHorizontal: 20,
      paddingTop: 80,
      paddingBottom: 24,
    },
    heroCard: {
      marginBottom: 24,
    },
    heroContent: {
      gap: 16,
    },
    gameImageContainer: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
    },
    gameImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
    },
    placeholderImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      backgroundColor: '#f3f4f6',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    gameInfo: {
      alignItems: 'center',
    },
    gameTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#111827',
      textAlign: 'center',
      marginBottom: 4,
    },
    systemName: {
      fontSize: 16,
      color: '#6b7280',
      marginBottom: 16,
    },
    gameStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#111827',
    },
    statLabel: {
      fontSize: 12,
      color: '#6b7280',
      marginTop: 2,
    },
    tabContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    tabButtons: {
      flexDirection: 'row',
      backgroundColor: 'transparent',
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: '#3b82f6',
    },
    tabText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#6b7280',
    },
    activeTabText: {
      color: '#3b82f6',
    },
    tabContent: {
      padding: 20,
    },
    infoCard: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: '#374151',
    },
    infoValue: {
      fontSize: 14,
      color: '#111827',
    },
    performanceCard: {
      marginBottom: 16,
    },
    performanceGrid: {
      gap: 12,
    },
    performanceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    performanceDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
    },
    performanceLabel: {
      fontSize: 14,
      color: '#374151',
      flex: 1,
    },
    performanceCount: {
      fontSize: 14,
      fontWeight: '600',
      color: '#111827',
    },
    devicesCard: {
      marginBottom: 16,
    },
    devicesList: {
      gap: 12,
    },
    deviceItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    deviceName: {
      fontSize: 14,
      fontWeight: '500',
      color: '#111827',
    },
    deviceCount: {
      fontSize: 12,
      color: '#6b7280',
    },
    actionsCard: {
      marginBottom: 16,
    },
    actionButtons: {
      gap: 12,
    },
    actionButton: {
      width: '100%',
    },
    loadingSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      gap: 8,
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
    bottomSpacing: {
      height: 20,
    },
  })
