import React, { useEffect, useState, useMemo } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  Pressable,
  Image,
  Animated,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@clerk/clerk-expo'
import * as Sharing from 'expo-sharing'
import { useTheme } from '@/contexts/ThemeContext'
import { Button, Card } from '@/components/ui'
import { ListingCard } from '@/components/cards'
import { useUserProfile, useUserListings } from '@/lib/api/hooks'

interface TabData {
  key: 'listings' | 'activity' | 'stats'
  title: string
  count?: number
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { userId: currentUserId } = useAuth()
  const { theme } = useTheme()
  const [selectedTab, setSelectedTab] = useState<'listings' | 'activity' | 'stats'>('listings')
  const fadeAnim = useMemo(() => new Animated.Value(0), [])
  const slideAnim = useMemo(() => new Animated.Value(50), [])

  // Fetch user profile data
  const {
    data: userProfile,
  } = useUserProfile(id)

  // Fetch user listings
  const {
    data: userListings,
  } = useUserListings(id!)

  const isOwnProfile = currentUserId === id

  useEffect(() => {
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
  }, [fadeAnim, slideAnim])

  const handleShare = async () => {
    try {
      const shareContent = `Check out ${userProfile?.firstName} ${userProfile?.lastName}'s profile on EmuReady!\n\n` +
        `${userProfile?.stats?.totalListings} performance listings\n` +
        `${userProfile?.stats?.totalUpvotes} upvotes received\n` +
        `Member since ${userProfile?.stats?.joinedDate}\n\n` +
        `Discover amazing emulation performance insights!`

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareContent, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Profile',
        })
      } else {
        Alert.alert('Share Profile', shareContent)
      }
    } catch (error) {
      console.error('Share error:', error)
      Alert.alert('Error', 'Failed to share profile. Please try again.')
    }
  }

  const handleListingPress = (listingId: string) => {
    ;(router.push as any)(`/listing/${listingId}`)
  }

  const tabs: TabData[] = [
    { key: 'listings', title: 'Listings', count: userProfile?.stats?.totalListings },
    { key: 'activity', title: 'Activity', count: userProfile?.stats?.totalComments },
    { key: 'stats', title: 'Stats' },
  ]

  const styles = createStyles(theme)

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'listings':
        return (
          <View style={styles.tabContent}>
            {userListings?.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                style={styles.listingCard}
                onPress={() => handleListingPress(listing.id)}
              />
            ))}
            {userListings?.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="list-outline" size={48} color={theme.colors.textMuted} />
                <Text style={styles.emptyStateTitle}>No Listings Yet</Text>
                <Text style={styles.emptyStateText}>
                  {isOwnProfile
                    ? "Start creating performance listings to share your emulation experiences!"
                    : "This user hasn't created any listings yet."}
                </Text>
                {isOwnProfile && (
                  <Button
                    title="Create Your First Listing"
                    variant="primary"
                    onPress={() => router.push('/(tabs)/create')}
                    style={styles.emptyStateButton}
                  />
                )}
              </View>
            )}
          </View>
        )

      case 'activity':
        return (
          <View style={styles.tabContent}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="thumbs-up" size={16} color={theme.colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Upvoted &quot;Super Mario World on Steam Deck&quot;</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="chatbubble" size={16} color={theme.colors.secondary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Commented on &quot;Zelda: Breath of the Wild performance&quot;</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="add-circle" size={16} color={theme.colors.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Created listing for &quot;Mario Kart 8 Deluxe&quot;</Text>
                <Text style={styles.activityTime}>3 days ago</Text>
              </View>
            </View>
          </View>
        )

      case 'stats':
        return (
          <View style={styles.tabContent}>
            <View style={styles.statsGrid}>
              <Card style={styles.statCard} padding="md">
                <Text style={styles.statValue}>{userProfile?.stats?.totalListings}</Text>
                <Text style={styles.statLabel}>Total Listings</Text>
              </Card>
              <Card style={styles.statCard} padding="md">
                <Text style={styles.statValue}>{userProfile?.stats?.totalUpvotes}</Text>
                <Text style={styles.statLabel}>Upvotes Received</Text>
              </Card>
              <Card style={styles.statCard} padding="md">
                <Text style={styles.statValue}>{userProfile?.stats?.totalComments}</Text>
                <Text style={styles.statLabel}>Comments Made</Text>
              </Card>
              <Card style={styles.statCard} padding="md">
                <Text style={styles.statValue}>4.8</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </Card>
            </View>

            <Card style={styles.achievementCard} padding="lg">
              <Text style={styles.achievementTitle}>Achievements</Text>
              <View style={styles.achievement}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
                <View style={styles.achievementText}>
                  <Text style={styles.achievementName}>Performance Expert</Text>
                  <Text style={styles.achievementDesc}>Created 10+ detailed listings</Text>
                </View>
              </View>
              <View style={styles.achievement}>
                <Ionicons name="star" size={24} color="#FF6B6B" />
                <View style={styles.achievementText}>
                  <Text style={styles.achievementName}>Community Helper</Text>
                  <Text style={styles.achievementDesc}>Received 100+ upvotes</Text>
                </View>
              </View>
            </Card>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {userProfile?.firstName} {userProfile?.lastName}
        </Text>
        <Pressable onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={theme.colors.text} />
        </Pressable>
      </View>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <Animated.View
          style={[
            styles.profileSection,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.avatarContainer}>
            {userProfile?.imageUrl ? (
              <Image
                source={{ uri: userProfile.imageUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>
              {userProfile?.firstName} {userProfile?.lastName}
            </Text>
            <Text style={styles.username}>@{userProfile?.username}</Text>
            {userProfile?.bio && (
              <Text style={styles.bio}>{userProfile.bio}</Text>
            )}

            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{userProfile?.stats?.totalListings}</Text>
                <Text style={styles.quickStatLabel}>Listings</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{userProfile?.stats?.totalUpvotes}</Text>
                <Text style={styles.quickStatLabel}>Upvotes</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{userProfile?.stats?.totalComments}</Text>
                <Text style={styles.quickStatLabel}>Comments</Text>
              </View>
            </View>

            <Text style={styles.joinDate}>
              Joined {userProfile?.stats?.joinedDate}
            </Text>
          </View>

          {isOwnProfile && (
            <Button
              title="Edit Profile"
              variant="outline"
              onPress={() => {
                Alert.alert(
                  'Edit Profile',
                  'Choose what you would like to edit:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Profile Photo',
                      onPress: () => Alert.alert('Photo Update', 'Profile photo editing will be available soon.')
                    },
                    {
                      text: 'Bio & Info',
                      onPress: () => Alert.alert('Profile Info', 'Profile information editing will be available soon.')
                    },
                  ]
                )
              }}
              style={styles.editButton}
            />
          )}
        </Animated.View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.title}
                {tab.count !== undefined && ` (${tab.count})`}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginHorizontal: 16,
    },
    shareButton: {
      padding: 8,
    },
    scrollView: {
      flex: 1,
    },
    profileSection: {
      padding: 20,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    avatarContainer: {
      marginBottom: 16,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    profileInfo: {
      alignItems: 'center',
      marginBottom: 20,
    },
    displayName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    username: {
      fontSize: 16,
      color: theme.colors.textMuted,
      marginBottom: 12,
    },
    bio: {
      fontSize: 14,
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    quickStats: {
      flexDirection: 'row',
      gap: 32,
      marginBottom: 16,
    },
    quickStat: {
      alignItems: 'center',
    },
    quickStatValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    quickStatLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    joinDate: {
      fontSize: 14,
      color: theme.colors.textMuted,
    },
    editButton: {
      marginTop: 16,
      minWidth: 120,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textMuted,
    },
    activeTabText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    tabContent: {
      padding: 16,
    },
    listingCard: {
      marginBottom: 12,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 32,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    emptyStateButton: {
      marginTop: 8,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    activityIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 18,
    },
    activityTime: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 4,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    achievementCard: {
      marginTop: 8,
    },
    achievementTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    achievement: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    achievementText: {
      marginLeft: 12,
      flex: 1,
    },
    achievementName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    achievementDesc: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
  })
}
