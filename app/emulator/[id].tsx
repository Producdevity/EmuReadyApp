import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Sharing from 'expo-sharing'
import React, { useState } from 'react'
import {
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
// TODO: Update to use new hooks when implementing emulator details
import { ListingCard } from '@/components/cards'
import { Button, Card, SkeletonListingCard, SkeletonLoader } from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import type { Listing } from '@/types'

const HEADER_HEIGHT = 280

export default function EmulatorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { theme } = useTheme()
  const [selectedTab, setSelectedTab] = useState<'overview' | 'listings'>('overview')
  const [refreshing, setRefreshing] = useState(false)
  const scrollY = useSharedValue(0)

  // TODO: Replace with proper API hooks  (react query)
  const emulatorsQuery = {
    data: [],
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  }
  const emulator = null as {
    name: string
    systems: { name: string }[]
    description?: string
  } | null

  const emulatorQuery = {
    ...emulatorsQuery,
    data: emulator,
  }

  // TODO: Replace with proper API hooks (react query)
  const listingsQuery = {
    data: { listings: [] },
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  }

  const styles = createStyles(theme)

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

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([emulatorQuery.refetch(), listingsQuery.refetch()])
    setRefreshing(false)
  }

  // Guard against missing id parameter
  if (!id) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />

        <LinearGradient
          colors={
            theme.isDark ? ['#1e293b', '#0f172a', '#0f172a'] : ['#f8fafc', '#ffffff', '#ffffff']
          }
          style={styles.gradientBackground}
        />

        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text }}>Invalid emulator ID</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </SafeAreaView>
      </View>
    )
  }

  const handleShare = async () => {
    try {
      const shareContent =
        `Check out ${emulatorQuery.data?.name} on EmuReady!\n\n` +
        `System: ${emulatorQuery.data?.systems?.map((s: any) => s.name).join(', ')}\n` +
        `${listings.length} performance listing${listings.length !== 1 ? 's' : ''} available\n\n` +
        `Discover how well games run with this emulator!`

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareContent, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Emulator',
        })
      } else {
        Alert.alert('Share', shareContent)
      }
    } catch (error) {
      console.error('Share error:', error)
      Alert.alert('Error', 'Failed to share emulator. Please try again.')
    }
  }

  const handleListingPress = (listingId: string) => {
    router.push(`/listing/${listingId}`)
  }

  if (emulatorQuery.isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />

        <LinearGradient
          colors={
            theme.isDark ? ['#1e293b', '#0f172a', '#0f172a'] : ['#f8fafc', '#ffffff', '#ffffff']
          }
          style={styles.gradientBackground}
        />

        <SafeAreaView style={{ flex: 1 }}>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Loading...</Text>
          </Animated.View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            <Animated.View entering={FadeInUp.delay(200).springify()}>
              <Card variant="glass" padding="lg" style={{ marginBottom: 24 }}>
                <SkeletonLoader width="80%" height={32} style={{ marginBottom: 12 }} />
                <SkeletonLoader width="60%" height={16} style={{ marginBottom: 24 }} />
                <SkeletonLoader width="100%" height={120} borderRadius={12} />
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

  if (emulatorQuery.error || !emulatorQuery.data) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />

        <LinearGradient
          colors={
            theme.isDark ? ['#1e293b', '#0f172a', '#0f172a'] : ['#f8fafc', '#ffffff', '#ffffff']
          }
          style={styles.gradientBackground}
        />

        <SafeAreaView style={{ flex: 1 }}>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Error</Text>
          </Animated.View>

          <View style={styles.errorContainer}>
            <Animated.View entering={FadeInUp.delay(200).springify()}>
              <Card variant="glass" padding="lg" style={{ alignItems: 'center' }}>
                <Ionicons
                  name="game-controller-outline"
                  size={64}
                  color={theme.colors.textMuted}
                  style={{ marginBottom: 24 }}
                />
                <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
                  Emulator Not Found
                </Text>
                <Text style={[styles.errorText, { color: theme.colors.textMuted }]}>
                  This emulator may have been removed or you may not have permission to view it.
                </Text>
                <Button
                  title="Go Back"
                  variant="gradient"
                  onPress={() => router.back()}
                  leftIcon={<Ionicons name="arrow-back" size={16} color="#ffffff" />}
                />
              </Card>
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  const listings = listingsQuery.data?.listings || []

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Gradient Background */}
      <LinearGradient
        colors={
          theme.isDark ? ['#1e293b', '#0f172a', '#0f172a'] : ['#f8fafc', '#ffffff', '#ffffff']
        }
        style={styles.gradientBackground}
      />

      {/* Fixed Header */}
      <SafeAreaView>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {emulatorQuery.data?.name || 'Emulator'}
          </Text>
          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
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
              <View style={styles.emulatorIcon}>
                <Ionicons name="game-controller" size={48} color={theme.colors.primary} />
              </View>

              <View style={styles.emulatorInfo}>
                <Animated.Text
                  style={[styles.emulatorTitle, { color: theme.colors.text }]}
                  entering={FadeInUp.delay(400).springify()}
                >
                  {emulatorQuery.data?.name || 'Emulator'}
                </Animated.Text>
                <Animated.Text
                  style={[styles.systemName, { color: theme.colors.textSecondary }]}
                  entering={FadeInUp.delay(500).springify()}
                >
                  {emulatorQuery.data?.systems?.map((s: any) => s.name).join(', ')}
                </Animated.Text>

                <Animated.View
                  style={styles.emulatorStats}
                  entering={FadeInUp.delay(600).springify()}
                >
                  <View style={[styles.statItem, { backgroundColor: theme.colors.primaryLight }]}>
                    <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                      {listings.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.text }]}>Listings</Text>
                  </View>
                  <View style={[styles.statItem, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.statValue, { color: theme.colors.success }]}>
                      {listings.reduce(
                        (sum: number, listing: Listing) => sum + (listing.upVotes || 0),
                        0,
                      )}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.text }]}>Upvotes</Text>
                  </View>
                  <View style={[styles.statItem, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.statValue, { color: theme.colors.info }]}>
                      {emulatorQuery.data?.systems?.length || 0}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.text }]}>Systems</Text>
                  </View>
                </Animated.View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Tab Navigation */}
        <Animated.View style={styles.tabContainer} entering={FadeInUp.delay(700).springify()}>
          <Card variant="glass" padding="sm">
            <View style={styles.tabButtons}>
              <Pressable
                style={[
                  styles.tab,
                  {
                    backgroundColor:
                      selectedTab === 'overview' ? theme.colors.primary : 'transparent',
                  },
                ]}
                onPress={() => setSelectedTab('overview')}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: selectedTab === 'overview' ? '#ffffff' : theme.colors.text,
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
                      selectedTab === 'listings' ? theme.colors.primary : 'transparent',
                  },
                ]}
                onPress={() => setSelectedTab('listings')}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: selectedTab === 'listings' ? '#ffffff' : theme.colors.text,
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
            {/* Emulator Information */}
            <Animated.View entering={FadeInUp.delay(800).springify()}>
              <Card variant="glass" style={styles.infoCard} padding="lg">
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Emulator Information
                </Text>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>Name:</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {emulatorQuery.data?.name || 'Emulator'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>
                    Supported Systems:
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {emulatorQuery.data?.systems?.map((s: any) => s.name).join(', ') || 'None'}
                  </Text>
                </View>
                {emulatorQuery.data?.description && (
                  <View
                    style={[styles.infoRow, { flexDirection: 'column', alignItems: 'flex-start' }]}
                  >
                    <Text
                      style={[styles.infoLabel, { color: theme.colors.textMuted, marginBottom: 8 }]}
                    >
                      Description:
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      {emulatorQuery.data?.description}
                    </Text>
                  </View>
                )}
              </Card>
            </Animated.View>

            {/* Performance Overview */}
            {listings.length > 0 && (
              <Animated.View entering={FadeInUp.delay(900).springify()}>
                <Card variant="glass" style={styles.performanceCard} padding="lg">
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Performance Overview
                  </Text>
                  <View style={styles.performanceGrid}>
                    {getPerformanceStats(listings).map((stat, index) => (
                      <View key={index} style={styles.performanceItem}>
                        <View style={[styles.performanceDot, { backgroundColor: stat.color }]} />
                        <Text style={[styles.performanceLabel, { color: theme.colors.text }]}>
                          {stat.label}
                        </Text>
                        <Text style={[styles.performanceCount, { color: theme.colors.textMuted }]}>
                          {stat.count}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </Animated.View>
            )}

            {/* Quick Actions */}
            <Animated.View entering={FadeInUp.delay(1000).springify()}>
              <Card variant="glass" style={styles.actionsCard} padding="lg">
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Quick Actions
                </Text>
                <View style={styles.actionButtons}>
                  <Button
                    title="Create Listing"
                    variant="gradient"
                    onPress={() => router.push('/(tabs)/create')}
                    style={styles.actionButton}
                    leftIcon={<Ionicons name="add" size={16} color="#ffffff" />}
                  />
                  <Button
                    title="Browse Games"
                    variant="outline"
                    onPress={() => router.push('/(tabs)/browse')}
                    style={styles.actionButton}
                    leftIcon={<Ionicons name="grid" size={16} color={theme.colors.primary} />}
                  />
                </View>
              </Card>
            </Animated.View>
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
                  <SkeletonListingCard key={index} style={{ marginBottom: 16 }} />
                ))}
              </Animated.View>
            ) : listings.length > 0 ? (
              <View style={styles.listingsContainer}>
                {listings.map((listing: Listing, index: number) => (
                  <Animated.View
                    key={listing.id}
                    entering={FadeInUp.delay(800 + index * 100).springify()}
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
              <Animated.View entering={FadeInUp.delay(800).springify()}>
                <Card variant="glass" style={styles.emptyCard} padding="lg">
                  <Ionicons
                    name="list-outline"
                    size={48}
                    color={theme.colors.textMuted}
                    style={styles.emptyIcon}
                  />
                  <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                    No Listings Yet
                  </Text>
                  <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                    Be the first to share your experience with this emulator!
                  </Text>
                  <Button
                    title="Create First Listing"
                    variant="gradient"
                    onPress={() => router.push('/(tabs)/create')}
                    style={styles.emptyButton}
                    leftIcon={<Ionicons name="add" size={16} color="#ffffff" />}
                  />
                </Card>
              </Animated.View>
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
    (acc: any, listing: any) => {
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
    .map(([label, data]: [string, any]) => ({
      label,
      count: data.count,
      color: getPerformanceColor(data.rank),
    }))
    .sort((a, b) => b.count - a.count)
}

function getPerformanceColor(rank: number): string {
  if (rank >= 5) return '#10b981' // Green for perfect
  if (rank >= 4) return '#3b82f6' // Blue for great
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
    shareButton: {
      padding: 8,
      marginRight: -8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 16,
    },
    scrollView: {
      flex: 1,
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
      alignItems: 'center',
      gap: 16,
    },
    emulatorIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emulatorInfo: {
      alignItems: 'center',
      gap: 12,
    },
    emulatorTitle: {
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
    },
    systemName: {
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    emulatorStats: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 8,
    },
    statItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      minWidth: 80,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '500',
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
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
    tabContent: {
      paddingHorizontal: 20,
      gap: 20,
    },
    infoCard: {
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
      textAlign: 'right',
    },
    performanceCard: {
      gap: 12,
    },
    performanceGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    performanceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      minWidth: 120,
    },
    performanceDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    performanceLabel: {
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },
    performanceCount: {
      fontSize: 14,
      fontWeight: '600',
    },
    actionsCard: {
      gap: 12,
    },
    actionButtons: {
      gap: 12,
    },
    actionButton: {
      width: '100%',
    },
    loadingSection: {
      paddingVertical: 20,
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
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 24,
    },
    emptyButton: {
      width: '100%',
    },
    bottomSpacing: {
      height: 20,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
  })
