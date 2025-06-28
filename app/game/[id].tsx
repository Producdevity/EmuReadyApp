import React, { useEffect, useState, useMemo } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  Pressable,
  Image,
  Animated,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Sharing from 'expo-sharing'
import { useGame, useListings } from '@/lib/api/hooks'
import { Button, Card } from '@/components/ui'
import { ListingCard } from '@/components/cards'
import type { Listing } from '@/types'

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<'overview' | 'listings'>(
    'overview',
  )
  const fadeAnim = useMemo(() => new Animated.Value(0), [])
  const slideAnim = useMemo(() => new Animated.Value(50), [])

  const { data: game, isLoading, error } = useGame({ gameId: id || '' })
  const { data: listingsData, isLoading: listingsLoading } = useListings({
    gameId: id || '',
  })

  useEffect(() => {
    if (!id) return  // Guard against missing id in effect
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, slideAnim, id])

  // Guard against missing id parameter
  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Invalid game ID</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    )
  }

  const handleShare = async () => {
    try {
      const shareContent = `Check out ${game?.title} on EmuReady!\n\n` +
        `System: ${game?.system?.name}\n` +
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading game details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Game Not Found</Text>
          <Text style={styles.errorText}>
            This game may have been removed or you may not have permission to
            view it.
          </Text>
          <Button
            title="Go Back"
            variant="primary"
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    )
  }

  const listings = listingsData?.listings || []

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {game.title}
        </Text>
        <Pressable onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#111827" />
        </Pressable>
      </View>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {(game.coverImageUrl || game.boxArtUrl) ? (
            <Image
              source={{ uri: game.coverImageUrl || game.boxArtUrl || undefined }}
              style={styles.gameImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="game-controller" size={48} color="#9ca3af" />
            </View>
          )}

          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.systemName}>{game.system?.name}</Text>

            <View style={styles.gameStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{listings.length}</Text>
                <Text style={styles.statLabel}>Listings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {listings.reduce(
                    (sum: number, listing: Listing) => sum + (listing.upVotes || 0),
                    0,
                  )}
                </Text>
                <Text style={styles.statLabel}>Upvotes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {listings.reduce(
                    (sum: number, listing: Listing) => sum + (listing._count?.comments || 0),
                    0,
                  )}
                </Text>
                <Text style={styles.statLabel}>Comments</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'overview' && styles.activeTabText,
              ]}
            >
              Overview
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, selectedTab === 'listings' && styles.activeTab]}
            onPress={() => setSelectedTab('listings')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'listings' && styles.activeTabText,
              ]}
            >
              Listings ({listings.length})
            </Text>
          </Pressable>
        </View>

        {/* Tab Content */}
        {selectedTab === 'overview' ? (
          <View style={styles.tabContent}>
            {/* System Information */}
            <Card style={styles.infoCard} padding="md">
              <Text style={styles.sectionTitle}>System Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Platform:</Text>
                <Text style={styles.infoValue}>{game.system?.name}</Text>
              </View>
              {game.system?.key && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>System Key:</Text>
                  <Text style={styles.infoValue}>{game.system.key}</Text>
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
            {listingsLoading ? (
              <View style={styles.loadingSection}>
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading listings...</Text>
              </View>
            ) : listings.length > 0 ? (
              <View style={styles.listingsContainer}>
                {listings.map((listing: Listing) => (
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
                  name="list-outline"
                  size={48}
                  color="#9ca3af"
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No Listings Yet</Text>
                <Text style={styles.emptyText}>
                  Be the first to share your experience with this game!
                </Text>
                <Button
                  title="Create First Listing"
                  variant="primary"
                  onPress={() => router.push('/(tabs)/create')}
                  style={styles.emptyButton}
                />
              </Card>
            )}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </SafeAreaView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  gameImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
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
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
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
