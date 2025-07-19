import { ListingCard } from '@/components/cards'
import { GlowText, GradientTitle, TypewriterText } from '@/components/themed/ThemedText'
import { GlassView, HolographicView, MagneticView } from '@/components/themed/ThemedView'
import { Button, Card } from '@/components/ui'
import FluidGradient from '@/components/ui/FluidGradient'
import {
  AnimatedPressable,
  FloatingElement,
  MICRO_SPRING_CONFIG,
} from '@/components/ui/MicroInteractions'
import { useTheme } from '@/contexts/ThemeContext'
import { useUserListings, useUserProfile } from '@/lib/api/hooks'
import type { Listing } from '@/types'
import { useAuth } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Sharing from 'expo-sharing'
import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Animated, Dimensions, StatusBar, StyleSheet, Text, View } from 'react-native'
import RNAnimated, {
  Extrapolation,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

interface TabData {
  key: 'listings' | 'activity' | 'stats'
  title: string
  count?: number
  icon: string
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const HEADER_HEIGHT = 120
const PROFILE_HEIGHT = 200
const _isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { userId: currentUserId } = useAuth()
  const { theme } = useTheme()
  const [selectedTab, setSelectedTab] = useState<'listings' | 'activity' | 'stats'>('listings')
  const scrollY = useSharedValue(0)
  const fadeAnim = useMemo(() => new Animated.Value(0), [])
  const slideAnim = useMemo(() => new Animated.Value(50), [])

  // Enhanced 2025 animation values
  const heroGlow = useSharedValue(0)
  const profileFloat = useSharedValue(0)
  const backgroundShift = useSharedValue(0)
  const tabScale = useSharedValue(1)
  const statsFloat = useSharedValue(0)
  const particleFlow = useSharedValue(0)
  const avatarScale = useSharedValue(0.9)

  // Fetch user profile data - MUST be called before any conditional returns
  const userProfileQuery = useUserProfile({ userId: id || '' }, { enabled: !!id })

  // Fetch user listings - MUST be called before any conditional returns
  const userListingsQuery = useUserListings({ userId: id || '' })

  // Animated styles - MUST be defined before any conditional returns
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

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(backgroundShift.value, [0, 1], [-100, 100], Extrapolation.CLAMP),
      },
    ],
  }))

  const _heroGlowStyle = useAnimatedStyle(() => ({
    opacity: heroGlow.value,
  }))

  const profileFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: 0 }],
  }))

  const tabScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tabScale.value }],
  }))

  const statsFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: 0 }],
  }))

  const avatarScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }))

  const particleFlowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          particleFlow.value,
          [0, 1],
          [-200, SCREEN_WIDTH + 200],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(particleFlow.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
  }))

  const isOwnProfile = currentUserId === id

  useEffect(() => {
    // Initialize cosmic background animation
    backgroundShift.value = withRepeat(
      withSequence(withTiming(1, { duration: 20000 }), withTiming(0, { duration: 20000 })),
      -1,
      true,
    )

    // Hero glow animation
    heroGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 4000 }), withTiming(0.3, { duration: 4000 })),
      -1,
      true,
    )

    // Profile floating animation
    // profileFloat.value = withRepeat(
    //   withSequence(withTiming(10, { duration: 6000 }), withTiming(-10, { duration: 6000 })),
    //   -1,
    //   true,
    // )

    // Stats floating animation
    // statsFloat.value = withRepeat(
    //   withSequence(withTiming(5, { duration: 5000 }), withTiming(-5, { duration: 5000 })),
    //   -1,
    //   true,
    // )

    // Particle flow animation
    particleFlow.value = withRepeat(withTiming(1, { duration: 12000 }), -1, false)

    // Avatar scale entrance
    avatarScale.value = withSpring(1, MICRO_SPRING_CONFIG.bouncy)
  }, [avatarScale, backgroundShift, heroGlow, particleFlow, profileFloat, statsFloat])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
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
                <HolographicView morphing borderRadius={20} style={styles.emptyState}>
                  <GlassView
                    borderRadius={20}
                    blurIntensity={20}
                    style={{ padding: theme.spacing.lg }}
                  >
                    <RNAnimated.View entering={FadeInDown.delay(400)}>
                      <FloatingElement intensity={2} duration={3000}>
                        <MagneticView
                          borderRadius={40}
                          style={{
                            width: 80,
                            height: 80,
                            backgroundColor: `${theme.colors.primary}20`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 20,
                          }}
                        >
                          <Ionicons name="list-outline" size={36} color={theme.colors.primary} />
                        </MagneticView>
                      </FloatingElement>
                      <GradientTitle animated style={styles.emptyStateTitle}>
                        No Listings Yet
                      </GradientTitle>
                      <TypewriterText animated delay={600} style={styles.emptyStateText}>
                        {isOwnProfile
                          ? 'Start creating performance listings to share your emulation experiences!'
                          : "This user hasn't created any listings yet."}
                      </TypewriterText>
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
                  </GlassView>
                </HolographicView>
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
                <HolographicView morphing borderRadius={16} style={styles.activityCard}>
                  <GlassView
                    borderRadius={16}
                    blurIntensity={20}
                    style={{ padding: theme.spacing.md }}
                  >
                    <View style={styles.activityItem}>
                      <FloatingElement intensity={1} duration={2000 + index * 200}>
                        <MagneticView
                          borderRadius={22}
                          style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}
                        >
                          <Ionicons name={activity.icon as any} size={18} color={activity.color} />
                        </MagneticView>
                      </FloatingElement>
                      <View style={styles.activityContent}>
                        <GlowText style={styles.activityText}>{activity.text}</GlowText>
                        <TypewriterText
                          animated
                          delay={600 + index * 100}
                          style={styles.activityTime}
                        >
                          {activity.time}
                        </TypewriterText>
                      </View>
                    </View>
                  </GlassView>
                </HolographicView>
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
      <StatusBar translucent />

      {/* Revolutionary Cosmic Background */}
      <RNAnimated.View style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}>
        <FluidGradient
          variant="cosmic"
          animated
          speed="slow"
          style={StyleSheet.absoluteFillObject}
          opacity={0.3}
        />
      </RNAnimated.View>

      {/* Enhanced Gradient Overlay */}
      <LinearGradient
        colors={[
          'transparent',
          `${theme.colors.background}40`,
          `${theme.colors.background}80`,
          theme.colors.background,
        ]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: PROFILE_HEIGHT + 200,
        }}
      />

      {/* Floating Particles */}
      <RNAnimated.View style={[{ position: 'absolute', top: '20%' }, particleFlowStyle]}>
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: `${theme.colors.primary}40`,
          }}
        />
      </RNAnimated.View>
      <RNAnimated.View style={[{ position: 'absolute', top: '40%' }, particleFlowStyle]}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: `${theme.colors.secondary}40`,
          }}
        />
      </RNAnimated.View>
      <RNAnimated.View style={[{ position: 'absolute', top: '60%' }, particleFlowStyle]}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: `${theme.colors.accent}40`,
          }}
        />
      </RNAnimated.View>

      {/* Animated Header */}
      <RNAnimated.View style={[styles.fixedHeader, headerAnimatedStyle]}>
        <BlurView
          intensity={80}
          tint={theme.isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={styles.headerContent}>
          <AnimatedPressable
            onPress={() => {
              runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
              router.back()
            }}
          >
            <MagneticView borderRadius={20} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </MagneticView>
          </AnimatedPressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {userProfileQuery.data?.name || 'User Profile'}
          </Text>
          <AnimatedPressable
            onPress={() => {
              runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
              handleShare()
            }}
          >
            <MagneticView borderRadius={20} style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color={theme.colors.text} />
            </MagneticView>
          </AnimatedPressable>
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
              style={[styles.avatarContainer, avatarScaleStyle]}
            >
              <FloatingElement intensity={3} duration={4000}>
                <MagneticView borderRadius={60} style={styles.avatarWrapper}>
                  <HolographicView morphing borderRadius={60} style={styles.avatarGradient}>
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.primaryDark]}
                      style={StyleSheet.absoluteFillObject}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <GlowText style={styles.avatarText}>
                      {userProfileQuery.data?.name?.[0]?.toUpperCase() || 'U'}
                    </GlowText>
                  </HolographicView>
                  <View style={styles.avatarBorder} />
                </MagneticView>
              </FloatingElement>
            </RNAnimated.View>

            <RNAnimated.View
              entering={FadeInUp.delay(400).springify()}
              style={[styles.profileInfo, profileFloatStyle]}
            >
              <GradientTitle animated style={styles.displayName}>
                {userProfileQuery.data?.name || 'Unknown User'}
              </GradientTitle>
              <TypewriterText animated delay={600} style={styles.username}>
                @{userProfileQuery.data?.email?.split('@')[0] || 'username'}
              </TypewriterText>
              {userProfileQuery.data?.bio && (
                <TypewriterText animated delay={700} style={styles.bio}>
                  {userProfileQuery.data.bio}
                </TypewriterText>
              )}

              <RNAnimated.View style={statsFloatStyle}>
                <HolographicView
                  morphing
                  borderRadius={theme.borderRadius.xl}
                  style={styles.quickStatsCard}
                >
                  <GlassView
                    borderRadius={theme.borderRadius.xl}
                    blurIntensity={20}
                    style={{ padding: theme.spacing.md }}
                  >
                    <View style={styles.quickStats}>
                      <FloatingElement intensity={1} duration={3000}>
                        <View style={styles.quickStat}>
                          <GlowText style={styles.quickStatValue}>
                            {userProfileQuery.data?._count?.listings || 0}
                          </GlowText>
                          <GlowText style={styles.quickStatLabel}>Listings</GlowText>
                        </View>
                      </FloatingElement>
                      <View style={styles.statDivider} />
                      <FloatingElement intensity={1} duration={3500}>
                        <View style={styles.quickStat}>
                          <GlowText style={styles.quickStatValue}>
                            {userProfileQuery.data?._count?.votes || 0}
                          </GlowText>
                          <GlowText style={styles.quickStatLabel}>Votes</GlowText>
                        </View>
                      </FloatingElement>
                      <View style={styles.statDivider} />
                      <FloatingElement intensity={1} duration={4000}>
                        <View style={styles.quickStat}>
                          <GlowText style={styles.quickStatValue}>
                            {userProfileQuery.data?._count?.comments || 0}
                          </GlowText>
                          <GlowText style={styles.quickStatLabel}>Comments</GlowText>
                        </View>
                      </FloatingElement>
                    </View>
                  </GlassView>
                </HolographicView>
              </RNAnimated.View>

              <TypewriterText animated delay={800} style={styles.joinDate}>
                🗓️ Joined{' '}
                {userProfileQuery.data?.createdAt
                  ? new Date(userProfileQuery.data.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown'}
              </TypewriterText>
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

        {/* Enhanced Tab Navigation - Gamepad Optimized */}
        <RNAnimated.View entering={FadeInUp.delay(800).springify()}>
          <HolographicView morphing borderRadius={16} style={styles.tabContainer}>
            <GlassView borderRadius={16} blurIntensity={20} style={styles.tabWrapper}>
              {tabs.map((tab, index) => (
                <AnimatedPressable
                  key={tab.key}
                  onPress={() => {
                    runOnJS(Haptics.selectionAsync)()
                    tabScale.value = withSequence(
                      withSpring(0.95, MICRO_SPRING_CONFIG.instant),
                      withSpring(1, MICRO_SPRING_CONFIG.bouncy),
                    )
                    setSelectedTab(tab.key)
                  }}
                >
                  <RNAnimated.View
                    entering={SlideInRight.delay(800 + index * 100).springify()}
                    style={[styles.tab, tabScaleStyle]}
                  >
                    <MagneticView borderRadius={12} style={styles.tabContent}>
                      {selectedTab === tab.key && (
                        <LinearGradient
                          colors={theme.colors.gradients.primary}
                          style={[StyleSheet.absoluteFillObject, { opacity: 0.1 }]}
                        />
                      )}
                      <FloatingElement intensity={0.5} duration={2000}>
                        <Ionicons
                          name={tab.icon as any}
                          size={18}
                          color={
                            selectedTab === tab.key ? theme.colors.primary : theme.colors.textMuted
                          }
                          style={{ marginBottom: 4 }}
                        />
                      </FloatingElement>
                      <GlowText
                        style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}
                      >
                        {tab.title}
                      </GlowText>
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
                          <GlowText style={styles.tabBadgeText}>{tab.count}</GlowText>
                        </View>
                      )}
                    </MagneticView>
                    {selectedTab === tab.key && (
                      <RNAnimated.View
                        entering={FadeInUp.duration(200)}
                        style={[styles.tabIndicator, { backgroundColor: theme.colors.primary }]}
                      />
                    )}
                  </RNAnimated.View>
                </AnimatedPressable>
              ))}
            </GlassView>
          </HolographicView>
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
      position: 'relative',
      overflow: 'hidden',
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
