import React, { useEffect, useState, useMemo } from 'react'
import { StatusBar, StyleSheet, Text, View, Alert, Pressable, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@clerk/clerk-expo'
import * as Sharing from 'expo-sharing'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import RNAnimated, {
  FadeInUp,
  FadeInDown,
  SlideInRight,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useTheme } from '@/contexts/ThemeContext'
import { Button, Card } from '@/components/ui'
import { ListingCard } from '@/components/cards'
import { useUserProfile, useUserListings } from '@/lib/api/hooks'
import type { Listing } from '@/types'

interface TabData {
  key: 'listings' | 'activity' | 'stats'
  title: string
  count?: number
  icon: string
}

const HEADER_HEIGHT = 120
const PROFILE_HEIGHT = 200

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { userId: currentUserId } = useAuth()
  const { theme } = useTheme()
  const [selectedTab, setSelectedTab] = useState<'listings' | 'activity' | 'stats'>('listings')
  const scrollY = useSharedValue(0)
  const fadeAnim = useMemo(() => new Animated.Value(0), [])
  const slideAnim = useMemo(() => new Animated.Value(50), [])

  // Fetch user profile data (always call hooks before conditionals)
  const userProfileQuery = useUserProfile({ userId: id || '' }, { enabled: !!id })

  // Fetch user listings
  const userListingsQuery = useUserListings({ userId: id || '' })

  const isOwnProfile = currentUserId === id

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, PROFILE_HEIGHT / 2, PROFILE_HEIGHT],
      [0, 0.5, 1],
      Extrapolation.CLAMP,
    )

    return {
      opacity,
    }
  })

  const profileAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, PROFILE_HEIGHT],
      [0, -PROFILE_HEIGHT / 3],
      Extrapolation.CLAMP,
    )

    const scale = interpolate(scrollY.value, [0, PROFILE_HEIGHT], [1, 0.8], Extrapolation.CLAMP)

    return {
      transform: [{ translateY }, { scale }],
    }
  })

  useEffect(() => {
    if (!id) return

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, slideAnim, id])

  // Guard against missing id parameter
  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Invalid user ID</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    )
  }

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      const shareContent =
        `Check out ${userProfileQuery.data?.name}'s profile on EmuReady!\n\n` +
        `${userProfileQuery.data?._count?.listings || 0} performance listings\n` +
        `${userProfileQuery.data?._count?.votes || 0} votes cast\n` +
        `Member since ${userProfileQuery.data?.createdAt ? new Date(userProfileQuery.data.createdAt).toLocaleDateString() : 'Unknown'}\n\n` +
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
    {
      key: 'listings',
      title: 'Listings',
      count: userProfileQuery.data?._count?.listings,
      icon: 'list',
    },
    {
      key: 'activity',
      title: 'Activity',
      count: userProfileQuery.data?._count?.comments,
      icon: 'pulse',
    },
    { key: 'stats', title: 'Stats', icon: 'analytics' },
  ]

  const styles = createStyles(theme)

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'listings':
        return (
          <View style={styles.tabContentContainer}>
            {userListingsQuery.data?.map((listing: Listing, index: number) => (
              <RNAnimated.View key={listing.id} entering={FadeInUp.delay(index * 100).springify()}>
                <ListingCard
                  listing={listing}
                  style={{
                    ...styles.listingCard,
                    shadowColor: theme.colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  onPress={() => handleListingPress(listing.id)}
                />
              </RNAnimated.View>
            ))}
            {userListingsQuery.data?.length === 0 && (
              <RNAnimated.View entering={FadeInUp.delay(200).springify()}>
                <Card variant="glass" padding="lg" style={styles.emptyState}>
                  <RNAnimated.View entering={FadeInDown.delay(400)}>
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: `${theme.colors.primary}20`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                      }}
                    >
                      <Ionicons name="list-outline" size={36} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.emptyStateTitle}>No Listings Yet</Text>
                    <Text style={styles.emptyStateText}>
                      {isOwnProfile
                        ? 'Start creating performance listings to share your emulation experiences!'
                        : "This user hasn't created any listings yet."}
                    </Text>
                    {isOwnProfile && (
                      <Button
                        title="Create Your First Listing"
                        variant="gradient"
                        onPress={() => router.push('/(tabs)/create')}
                        style={styles.emptyStateButton}
                        leftIcon={<Ionicons name="add" size={16} color="#ffffff" />}
                      />
                    )}
                  </RNAnimated.View>
                </Card>
              </RNAnimated.View>
            )}
          </View>
        )

      case 'activity':
        const activities = [
          {
            icon: 'thumbs-up',
            color: theme.colors.primary,
            text: 'Upvoted "Super Mario World on Steam Deck"',
            time: '2 hours ago',
          },
          {
            icon: 'chatbubble',
            color: theme.colors.secondary,
            text: 'Commented on "Zelda: Breath of the Wild performance"',
            time: '1 day ago',
          },
          {
            icon: 'add-circle',
            color: theme.colors.success,
            text: 'Created listing for "Mario Kart 8 Deluxe"',
            time: '3 days ago',
          },
        ]

        return (
          <View style={styles.tabContentContainer}>
            {activities.map((activity, index) => (
              <RNAnimated.View key={index} entering={SlideInRight.delay(index * 100).springify()}>
                <Card variant="glass" padding="md" style={styles.activityCard}>
                  <View style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}>
                      <Ionicons name={activity.icon as any} size={18} color={activity.color} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>{activity.text}</Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                  </View>
                </Card>
              </RNAnimated.View>
            ))}
          </View>
        )

      case 'stats':
        const statItems = [
          {
            value: userProfileQuery.data?._count?.listings || 0,
            label: 'Total Listings',
            icon: 'list',
            color: theme.colors.primary,
          },
          {
            value: userProfileQuery.data?._count?.votes || 0,
            label: 'Total Votes',
            icon: 'thumbs-up',
            color: theme.colors.secondary,
          },
          {
            value: userProfileQuery.data?._count?.comments || 0,
            label: 'Comments Made',
            icon: 'chatbubble',
            color: theme.colors.accent,
          },
          { value: '4.8', label: 'Avg Rating', icon: 'star', color: theme.colors.success },
        ]

        const achievements = [
          {
            name: 'Performance Expert',
            desc: 'Created 10+ detailed listings',
            icon: 'trophy',
            color: '#FFD700',
          },
          {
            name: 'Community Helper',
            desc: 'Received 100+ upvotes',
            icon: 'star',
            color: '#FF6B6B',
          },
          {
            name: 'Early Adopter',
            desc: 'Joined in the first month',
            icon: 'rocket',
            color: '#8B5CF6',
          },
        ]

        return (
          <View style={styles.tabContentContainer}>
            <View style={styles.statsGrid}>
              {statItems.map((stat, index) => (
                <RNAnimated.View
                  key={stat.label}
                  entering={FadeInUp.delay(index * 100).springify()}
                  style={{ flex: 1, minWidth: '45%', marginBottom: 12 }}
                >
                  <Card variant="glass" padding="md" style={styles.statCard}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: `${stat.color}20`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                    </View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </Card>
                </RNAnimated.View>
              ))}
            </View>

            <RNAnimated.View entering={FadeInUp.delay(400).springify()}>
              <Card variant="glass" padding="lg" style={styles.achievementCard}>
                <Text style={styles.achievementTitle}>🏆 Achievements</Text>
                {achievements.map((achievement, index) => (
                  <RNAnimated.View
                    key={achievement.name}
                    entering={SlideInRight.delay(600 + index * 100).springify()}
                    style={styles.achievement}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: `${achievement.color}20`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Ionicons
                        name={achievement.icon as any}
                        size={20}
                        color={achievement.color}
                      />
                    </View>
                    <View style={styles.achievementText}>
                      <Text style={styles.achievementName}>{achievement.name}</Text>
                      <Text style={styles.achievementDesc}>{achievement.desc}</Text>
                    </View>
                  </RNAnimated.View>
                ))}
              </Card>
            </RNAnimated.View>
          </View>
        )

      default:
        return null
    }
  }

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
          theme.isDark ? ['#1e293b', '#0f172a', '#0f172a'] : ['#f8fafc', '#ffffff', '#ffffff']
        }
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: PROFILE_HEIGHT + 200,
        }}
      />

      {/* Animated Header */}
      <RNAnimated.View style={[styles.fixedHeader, headerAnimatedStyle]}>
        <BlurView
          intensity={80}
          tint={theme.isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={styles.headerContent}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.back()
            }}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {userProfileQuery.data?.name || 'User Profile'}
          </Text>
          <Pressable onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
          </Pressable>
        </SafeAreaView>
      </RNAnimated.View>

      <RNAnimated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Section */}
        <RNAnimated.View
          style={[
            styles.profileSection,
            profileAnimatedStyle,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <SafeAreaView style={{ paddingTop: HEADER_HEIGHT }}>
            <RNAnimated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.avatarContainer}
            >
              <View style={styles.avatarWrapper}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarText}>
                    {userProfileQuery.data?.name?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </LinearGradient>
                <View style={styles.avatarBorder} />
              </View>
            </RNAnimated.View>

            <RNAnimated.View entering={FadeInUp.delay(400).springify()} style={styles.profileInfo}>
              <Text style={styles.displayName}>
                {userProfileQuery.data?.name || 'Unknown User'}
              </Text>
              <Text style={styles.username}>
                @{userProfileQuery.data?.email?.split('@')[0] || 'username'}
              </Text>
              {userProfileQuery.data?.bio && (
                <Text style={styles.bio}>{userProfileQuery.data.bio}</Text>
              )}

              <Card variant="glass" padding="md" style={styles.quickStatsCard}>
                <View style={styles.quickStats}>
                  <View style={styles.quickStat}>
                    <Text style={styles.quickStatValue}>
                      {userProfileQuery.data?._count?.listings || 0}
                    </Text>
                    <Text style={styles.quickStatLabel}>Listings</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.quickStat}>
                    <Text style={styles.quickStatValue}>
                      {userProfileQuery.data?._count?.votes || 0}
                    </Text>
                    <Text style={styles.quickStatLabel}>Votes</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.quickStat}>
                    <Text style={styles.quickStatValue}>
                      {userProfileQuery.data?._count?.comments || 0}
                    </Text>
                    <Text style={styles.quickStatLabel}>Comments</Text>
                  </View>
                </View>
              </Card>

              <Text style={styles.joinDate}>
                🗓️ Joined{' '}
                {userProfileQuery.data?.createdAt
                  ? new Date(userProfileQuery.data.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown'}
              </Text>
            </RNAnimated.View>

            {isOwnProfile && (
              <RNAnimated.View entering={FadeInUp.delay(600).springify()}>
                <Button
                  title="Edit Profile"
                  variant="outline"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    Alert.alert('Edit Profile', 'Choose what you would like to edit:', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Profile Photo',
                        onPress: () =>
                          Alert.alert(
                            'Photo Update',
                            'Profile photo editing will be available soon.',
                          ),
                      },
                      {
                        text: 'Bio & Info',
                        onPress: () =>
                          Alert.alert(
                            'Profile Info',
                            'Profile information editing will be available soon.',
                          ),
                      },
                    ])
                  }}
                  style={styles.editButton}
                  leftIcon={
                    <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                  }
                />
              </RNAnimated.View>
            )}
          </SafeAreaView>
        </RNAnimated.View>

        {/* Tab Navigation */}
        <RNAnimated.View entering={FadeInUp.delay(800).springify()}>
          <Card variant="glass" style={styles.tabContainer}>
            <View style={styles.tabWrapper}>
              {tabs.map((tab) => (
                <Pressable
                  key={tab.key}
                  style={styles.tab}
                  onPress={() => {
                    Haptics.selectionAsync()
                    setSelectedTab(tab.key)
                  }}
                >
                  <View style={styles.tabContentContainer}>
                    <Ionicons
                      name={tab.icon as any}
                      size={18}
                      color={
                        selectedTab === tab.key ? theme.colors.primary : theme.colors.textMuted
                      }
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
                      {tab.title}
                    </Text>
                    {tab.count !== undefined && (
                      <View
                        style={[
                          styles.tabBadge,
                          {
                            backgroundColor:
                              selectedTab === tab.key
                                ? theme.colors.primary
                                : theme.colors.textMuted,
                          },
                        ]}
                      >
                        <Text style={styles.tabBadgeText}>{tab.count}</Text>
                      </View>
                    )}
                  </View>
                  {selectedTab === tab.key && (
                    <RNAnimated.View
                      entering={FadeInUp.duration(200)}
                      style={[styles.tabIndicator, { backgroundColor: theme.colors.primary }]}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          </Card>
        </RNAnimated.View>

        {/* Tab Content */}
        <RNAnimated.View entering={FadeInUp.delay(1000).springify()}>
          {renderTabContent()}
        </RNAnimated.View>
      </RNAnimated.ScrollView>
    </View>
  )
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    fixedHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height: HEADER_HEIGHT,
      overflow: 'hidden',
    },
    headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.surface}80`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginHorizontal: 16,
    },
    scrollView: {
      flex: 1,
    },
    profileSection: {
      alignItems: 'center',
      minHeight: PROFILE_HEIGHT + 200,
    },
    avatarContainer: {
      marginBottom: 24,
      alignItems: 'center',
    },
    avatarWrapper: {
      position: 'relative',
    },
    avatarGradient: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    avatarBorder: {
      position: 'absolute',
      top: -4,
      left: -4,
      width: 128,
      height: 128,
      borderRadius: 64,
      borderWidth: 3,
      borderColor: theme.colors.surface,
    },
    avatarText: {
      fontSize: 42,
      fontWeight: '800',
      color: '#ffffff',
    },
    profileInfo: {
      alignItems: 'center',
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    displayName: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    username: {
      fontSize: 16,
      color: theme.colors.textMuted,
      marginBottom: 16,
      fontWeight: '500',
    },
    bio: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    quickStatsCard: {
      marginBottom: 20,
      alignSelf: 'stretch',
      marginHorizontal: 20,
    },
    quickStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    quickStat: {
      alignItems: 'center',
      flex: 1,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: theme.colors.border,
    },
    quickStatValue: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 4,
    },
    quickStatLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    joinDate: {
      fontSize: 15,
      color: theme.colors.textMuted,
      fontWeight: '500',
    },
    editButton: {
      marginTop: 20,
      marginHorizontal: 40,
      alignSelf: 'stretch',
    },
    tabContainer: {
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      overflow: 'hidden',
    },
    tabWrapper: {
      flexDirection: 'row',
    },
    tab: {
      flex: 1,
      position: 'relative',
    },
    tabContent: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: 'center',
      minHeight: 70,
      justifyContent: 'center',
    },
    tabText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textMuted,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    activeTabText: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    tabBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    tabBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#ffffff',
    },
    tabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 12,
      right: 12,
      height: 3,
      borderRadius: 2,
    },
    tabContentContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    listingCard: {
      marginBottom: 16,
      borderRadius: 16,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 32,
      borderRadius: 20,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyStateText: {
      fontSize: 15,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 28,
    },
    emptyStateButton: {
      minWidth: 200,
    },
    activityCard: {
      marginBottom: 12,
      borderRadius: 16,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    activityIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    activityContent: {
      flex: 1,
    },
    activityText: {
      fontSize: 15,
      color: theme.colors.text,
      lineHeight: 20,
      fontWeight: '500',
      marginBottom: 4,
    },
    activityTime: {
      fontSize: 13,
      color: theme.colors.textMuted,
      fontWeight: '500',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      alignItems: 'center',
      borderRadius: 16,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 6,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      textAlign: 'center',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    achievementCard: {
      borderRadius: 20,
    },
    achievementTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    achievement: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 8,
    },
    achievementText: {
      flex: 1,
    },
    achievementName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    achievementDesc: {
      fontSize: 14,
      color: theme.colors.textMuted,
      lineHeight: 18,
    },
  })
}
