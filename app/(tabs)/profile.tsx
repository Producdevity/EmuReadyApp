import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
  Switch,
  Dimensions,
  StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import Animated, {
  FadeInUp,
  SlideInLeft,
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  interpolate,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Card, Button } from '../../components/ui'
import { ListingCard } from '@/components/cards'
import { GlassView, HolographicView, MagneticView } from '@/components/themed/ThemedView'
import { GradientTitle, TypewriterText, GlowText } from '@/components/themed/ThemedText'
import { useListings, useUnreadNotificationCount } from '@/lib/api/hooks'
import { useTheme } from '@/contexts/ThemeContext'
import { AnimatedPressable, FloatingElement, MICRO_SPRING_CONFIG } from '@/components/ui/MicroInteractions'
import { FluidGradient } from '@/components/ui/FluidGradient'
import type { Listing } from '@/types'

type ProfileTab = 'listings' | 'favorites' | 'activity'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25

export default function ProfileScreen() {
  const router = useRouter()
  const { isSignedIn, signOut } = useAuth()
  const { theme, themeMode, setThemeMode } = useTheme()
  const [activeTab, setActiveTab] = useState<ProfileTab>('listings')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  
  // Enhanced 2025 animation values
  const heroGlow = useSharedValue(0)
  const profileFloat = useSharedValue(0)
  const backgroundShift = useSharedValue(0)
  const tabScale = useSharedValue(1)
  const statsFloat = useSharedValue(0)
  const particleFlow = useSharedValue(0)
  
  useEffect(() => {
    // Initialize cosmic background animation
    backgroundShift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 15000 }),
        withTiming(0, { duration: 15000 })
      ),
      -1,
      true
    )
    
    // Hero glow animation
    heroGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000 }),
        withTiming(0.3, { duration: 3000 })
      ),
      -1,
      true
    )
    
    // Profile floating animation
    profileFloat.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 5000 }),
        withTiming(-10, { duration: 5000 })
      ),
      -1,
      true
    )
    
    // Stats floating animation
    statsFloat.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 4000 }),
        withTiming(-5, { duration: 4000 })
      ),
      -1,
      true
    )
    
    // Particle flow animation
    particleFlow.value = withRepeat(
      withTiming(1, { duration: 10000 }),
      -1,
      false
    )
  }, [])

  // Create themed styles (needs to be before early returns)
  const styles = createStyles(theme)

  // Only fetch user data and listings when authenticated
  // TODO: Implement current user query with Clerk user data
  const currentUserQuery = {
    data: null as { name: string; email: string } | null,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve({ data: null }),
  }
  const _unreadCountQuery = useUnreadNotificationCount()
  const userListingsQuery = useListings({
    page: 1,
    limit: 50,
  })

  // Filter listings to show only user's listings when authenticated
  const userListings: Listing[] = []

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setIsSigningOut(true)
          try {
            await signOut()
          } catch (error) {
            console.error('Sign out error:', error)
            Alert.alert('Error', 'Failed to sign out. Please try again.')
          } finally {
            setIsSigningOut(false)
          }
        },
      },
    ])
  }

  const handleSignIn = () => {
    // Navigate to sign in screen or show sign in modal
    Alert.alert('Sign In Required', 'Please sign in to access your profile and create listings.', [
      { text: 'Cancel' },
      {
        text: 'Sign In',
        onPress: () => {
          router.push('/(auth)/sign-in')
        },
      },
    ])
  }

  const handleSignUp = () => {
    // Navigate to sign up screen or show sign up modal
    Alert.alert('Create Account', 'Join EmuReady to share your emulation experiences.', [
      { text: 'Cancel' },
      {
        text: 'Sign Up',
        onPress: () => {
          router.push('/(auth)/sign-up')
        },
      },
    ])
  }

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing will be available in a future update.', [
      { text: 'OK' },
    ])
  }

  const handleListingPress = (listingId: string) => {
    router.push(`/listing/${listingId}` as any)
  }

  const handleSettingsPress = (setting: string) => {
    Alert.alert(setting, 'This setting will be available in a future update.', [{ text: 'OK' }])
  }

  // Show sign in/up screen when not authenticated
  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <View style={styles.authContent}>
            <Ionicons
              name="person-circle"
              size={100}
              color={theme.colors.textSecondary}
              style={styles.authIcon}
            />
            <Text style={styles.authTitle}>Welcome to EmuReady</Text>
            <Text style={styles.authDescription}>
              Sign in to access your profile, create listings, and connect with the emulation
              community.
            </Text>

            <View style={styles.authButtons}>
              <Button
                title="Sign In"
                variant="primary"
                onPress={handleSignIn}
                style={styles.authButton}
              />
              <Button
                title="Create Account"
                variant="outline"
                onPress={handleSignUp}
                style={styles.authButton}
              />
            </View>
          </View>

          {/* Theme setting for unauthenticated users */}
          <View style={styles.guestSettings}>
            <Card style={styles.settingCard} padding="md">
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons
                    name={theme.isDark ? 'moon' : 'sunny'}
                    size={20}
                    color={theme.colors.text}
                    style={styles.settingIcon}
                  />
                  <View>
                    <Text style={styles.settingTitle}>Theme</Text>
                    <Text style={styles.settingDescription}>
                      {themeMode === 'system'
                        ? 'Follow system'
                        : themeMode === 'dark'
                          ? 'Dark mode'
                          : 'Light mode'}
                    </Text>
                  </View>
                </View>
                <Button
                  title={themeMode === 'system' ? 'Auto' : themeMode === 'dark' ? 'Dark' : 'Light'}
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    const nextMode =
                      themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light'
                    setThemeMode(nextMode)
                  }}
                />
              </View>
            </Card>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  // Show loading state while fetching user data
  if (currentUserQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Show error state if user data failed to load
  if (currentUserQuery.error || !currentUserQuery.data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Failed to Load Profile</Text>
          <Text style={styles.errorDescription}>There was an error loading your profile data.</Text>
          <Button
            title="Try Again"
            variant="primary"
            onPress={async () => {
              await Promise.all([currentUserQuery.refetch(), userListingsQuery.refetch()])
            }}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'listings':
        return (
          <View style={styles.tabContent}>
            {userListingsQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading your listings...</Text>
              </View>
            ) : userListings.length > 0 ? (
              <View style={styles.listingsContainer}>
                {userListings.map((listing: Listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onPress={() => handleListingPress(listing.id)}
                    style={styles.listingCard}
                  />
                ))}
                <Button
                  title="View All Listings"
                  variant="outline"
                  onPress={() => router.push('/(tabs)/browse')}
                  style={styles.viewAllButton}
                />
              </View>
            ) : (
              <Card style={styles.emptyCard} padding="lg">
                <Ionicons
                  name="game-controller"
                  size={48}
                  color={theme.colors.textMuted}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No Listings Yet</Text>
                <Text style={styles.emptyText}>
                  Share your emulation experiences with the community
                </Text>
                <Button
                  title="Create Your First Listing"
                  variant="primary"
                  onPress={() => router.push('/(tabs)/create')}
                  style={styles.emptyButton}
                />
              </Card>
            )}
          </View>
        )

      case 'favorites':
        return (
          <View style={styles.tabContent}>
            <Card style={styles.emptyCard} padding="lg">
              <Ionicons
                name="heart"
                size={48}
                color={theme.colors.textMuted}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No Favorites Yet</Text>
              <Text style={styles.emptyText}>
                Favorite listings will appear here for quick access
              </Text>
              <Button
                title="Browse Listings"
                variant="outline"
                onPress={() => router.push('/(tabs)/browse')}
                style={styles.emptyButton}
              />
            </Card>
          </View>
        )

      case 'activity':
        return (
          <View style={styles.tabContent}>
            <Card style={styles.emptyCard} padding="lg">
              <Ionicons
                name="time"
                size={48}
                color={theme.colors.textMuted}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No Recent Activity</Text>
              <Text style={styles.emptyText}>
                Your votes, comments, and interactions will appear here
              </Text>
              <Button
                title="Explore Community"
                variant="outline"
                onPress={() => router.push('/(tabs)/browse')}
                style={styles.emptyButton}
              />
            </Card>
          </View>
        )

      default:
        return null
    }
  }

  // Animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          backgroundShift.value,
          [0, 1],
          [-50, 50],
          Extrapolation.CLAMP
        ),
      },
    ],
  }))
  
  const heroGlowStyle = useAnimatedStyle(() => ({
    opacity: heroGlow.value,
  }))
  
  const profileFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: profileFloat.value }],
  }))
  
  const tabScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tabScale.value }],
  }))
  
  const statsFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: statsFloat.value }],
  }))
  
  const particleFlowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          particleFlow.value,
          [0, 1],
          [-200, 500],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      particleFlow.value,
      [0, 0.2, 0.8, 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP
    ),
  }))

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Revolutionary Aurora Background - optimized for landscape */}
      <Animated.View style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}>
        <FluidGradient
          variant="cosmic"
          animated
          speed="slow"
          style={StyleSheet.absoluteFillObject}
          opacity={0.2}
        />
      </Animated.View>
      
      {/* Enhanced Gradient Overlay */}
      <LinearGradient
        colors={theme.colors.gradients.hero as [string, string, ...string[]]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          opacity: 0.6,
        }}
      />
      
      {/* Floating Particles - positioned for landscape */}
      <Animated.View style={[styles.particle, { top: '10%', left: '10%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: `${theme.colors.primary}40` }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: '30%', left: '20%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: `${theme.colors.secondary}40` }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: '50%', left: '15%' }, particleFlowStyle]}>
        <View style={[styles.particleDot, { backgroundColor: `${theme.colors.accent}40` }]} />
      </Animated.View>
      
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          horizontal={false}
          contentContainerStyle={styles.scrollContent}
        >
        {/* Revolutionary Profile Header - optimized for landscape/gamepad */}
        <FloatingElement intensity={3} duration={5000}>
          <Animated.View entering={SlideInLeft.delay(200).springify().damping(15)}>
            <HolographicView 
              morphing 
              borderRadius={24}
              style={[styles.profileHeader, profileFloatStyle]}
            >
              <FluidGradient
                variant="gaming"
                borderRadius={24}
                animated
                speed="normal"
                style={StyleSheet.absoluteFillObject}
                opacity={0.1}
              />
              
              <View style={styles.profileContent}>
                <View style={styles.profileInfo}>
                  {/* Animated Profile Avatar */}
                  <MagneticView 
                    borderRadius={48}
                    style={styles.profileImageContainer}
                  >
                    <LinearGradient
                      colors={theme.colors.gradients.primary}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <FloatingElement intensity={2} duration={3000}>
                      <Ionicons name="person" size={48} color="#ffffff" />
                    </FloatingElement>
                  </MagneticView>
                  
                  <View style={styles.profileDetails}>
                    <GradientTitle 
                      gradient 
                      animated 
                      variant="scale"
                      style={styles.profileName}
                    >
                      {currentUserQuery.data?.name || 'Guest Player'}
                    </GradientTitle>
                    
                    <TypewriterText 
                      animated 
                      delay={300}
                      style={styles.profileEmail}
                    >
                      {currentUserQuery.data?.email || 'guest@emuready.com'}
                    </TypewriterText>
                    
                    <Animated.View style={statsFloatStyle}>
                      <GlowText 
                        glow 
                        style={styles.profileStats}
                      >
                        {userListings.length} listing{userListings.length !== 1 ? 's' : ''} shared
                      </GlowText>
                    </Animated.View>
                  </View>
                </View>
                
                {/* Gamepad-friendly Edit Button */}
                <AnimatedPressable 
                  onPress={() => {
                    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
                    handleEditProfile()
                  }}
                >
                  <MagneticView 
                    borderRadius={16}
                    style={styles.editButton}
                  >
                    <BlurView
                      intensity={80}
                      tint={theme.isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.editButtonContent}>
                      <Ionicons name="pencil" size={16} color={theme.colors.primary} />
                      <GlowText style={styles.editButtonText}>Edit</GlowText>
                    </View>
                  </MagneticView>
                </AnimatedPressable>
              </View>
            </HolographicView>
          </Animated.View>
        </FloatingElement>

        {/* Enhanced Profile Tabs - Gamepad Optimized */}
        <Animated.View 
          entering={BounceIn.delay(400).springify().damping(12)}
          style={styles.tabsContainer}
        >
          <GlassView 
            borderRadius={20} 
            blurIntensity={25}
            style={styles.tabsCard}
          >
            <View style={styles.tabs}>
              {[
                { key: 'listings', label: 'Listings', icon: 'game-controller' },
                { key: 'favorites', label: 'Favorites', icon: 'heart' },
                { key: 'activity', label: 'Activity', icon: 'time' },
              ].map((tab, index) => (
                <AnimatedPressable
                  key={tab.key}
                  onPress={() => {
                    runOnJS(Haptics.selectionAsync)()
                    tabScale.value = withSequence(
                      withSpring(0.95, MICRO_SPRING_CONFIG.instant),
                      withSpring(1, MICRO_SPRING_CONFIG.bouncy)
                    )
                    setActiveTab(tab.key as ProfileTab)
                  }}
                >
                  <Animated.View
                    entering={SlideInLeft.delay(500 + index * 100).springify().damping(15)}
                    style={tabScaleStyle}
                  >
                    <MagneticView
                      borderRadius={16}
                      style={[
                        styles.tab,
                        activeTab === tab.key && styles.activeTab
                      ]}
                    >
                      {activeTab === tab.key && (
                        <LinearGradient
                          colors={theme.colors.gradients.primary}
                          style={StyleSheet.absoluteFillObject}
                          opacity={0.9}
                        />
                      )}
                      <FloatingElement intensity={1} duration={2000}>
                        <Ionicons
                          name={tab.icon as any}
                          size={20}
                          color={activeTab === tab.key ? '#ffffff' : theme.colors.textSecondary}
                          style={styles.tabIcon}
                        />
                      </FloatingElement>
                      <GlowText
                        glow={activeTab === tab.key}
                        style={[
                          styles.tabText,
                          activeTab === tab.key && styles.activeTabText
                        ]}
                      >
                        {tab.label}
                      </GlowText>
                    </MagneticView>
                  </Animated.View>
                </AnimatedPressable>
              ))}
            </View>
          </GlassView>
        </Animated.View>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>

          {/* Notifications */}
          <Card style={styles.settingCard} padding="md">
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name="notifications"
                  size={20}
                  color={theme.colors.text}
                  style={styles.settingIcon}
                />
                <View>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Get notified about votes and comments
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={notificationsEnabled ? theme.colors.card : theme.colors.background}
              />
            </View>
          </Card>

          {/* Theme */}
          <Card style={styles.settingCard} padding="md">
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name={theme.isDark ? 'moon' : 'sunny'}
                  size={20}
                  color={theme.colors.text}
                  style={styles.settingIcon}
                />
                <View>
                  <Text style={styles.settingTitle}>Theme</Text>
                  <Text style={styles.settingDescription}>
                    {themeMode === 'system'
                      ? 'Follow system'
                      : themeMode === 'dark'
                        ? 'Dark mode'
                        : 'Light mode'}
                  </Text>
                </View>
              </View>
              <Button
                title={themeMode === 'system' ? 'Auto' : themeMode === 'dark' ? 'Dark' : 'Light'}
                variant="outline"
                size="sm"
                onPress={() => {
                  const nextMode =
                    themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light'
                  setThemeMode(nextMode)
                }}
              />
            </View>
          </Card>

          {/* Other Settings */}
          {[
            {
              icon: 'shield-checkmark',
              title: 'Privacy & Security',
              description: 'Manage your privacy settings',
            },
            {
              icon: 'help-circle',
              title: 'Help & Support',
              description: 'Get help and contact support',
            },
            {
              icon: 'information-circle',
              title: 'About EmuReady',
              description: 'App version and information',
            },
          ].map((setting) => (
            <Card
              key={setting.title}
              style={styles.settingCard}
              padding="md"
              onPress={() => handleSettingsPress(setting.title)}
            >
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons
                    name={setting.icon as any}
                    size={20}
                    color={theme.colors.text}
                    style={styles.settingIcon}
                  />
                  <View>
                    <Text style={styles.settingTitle}>{setting.title}</Text>
                    <Text style={styles.settingDescription}>{setting.description}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
              </View>
            </Card>
          ))}
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <Button
            title={isSigningOut ? 'Signing Out...' : 'Sign Out'}
            variant="outline"
            onPress={handleSignOut}
            disabled={isSigningOut}
            style={styles.signOutButton}
            leftIcon={
              isSigningOut ? (
                <ActivityIndicator size="small" color={theme.colors.error} />
              ) : (
                <Ionicons name="log-out" size={16} color={theme.colors.error} />
              )
            }
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      </SafeAreaView>
    </View>
  )
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    particle: {
      position: 'absolute',
    },
    particleDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    scrollContent: {
      flexGrow: 1,
    },
    scrollView: {
      flex: 1,
    },

    // Auth screen styles
    authContainer: {
      flex: 1,
      justifyContent: 'space-between',
      padding: 20,
    },
    authContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    authIcon: {
      marginBottom: 24,
    },
    authTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    authDescription: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    authButtons: {
      width: '100%',
      gap: 12,
    },
    authButton: {
      width: '100%',
    },
    guestSettings: {
      paddingBottom: 20,
    },

    // Loading and error states
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    errorDescription: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    retryButton: {
      minWidth: 120,
    },

    // Profile styles
    profileHeader: {
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 16,
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    },
    profileContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
      zIndex: 1,
    },
    profileInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    profileImageContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      marginRight: 20,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    editButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: theme.colors.glass,
    },
    editButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      position: 'relative',
      zIndex: 1,
    },
    editButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    profileDetails: {
      flex: 1,
    },
    profileName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 14,
      color: theme.colors.textMuted,
      marginBottom: 4,
    },
    profileStats: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },

    // Tabs
    tabsContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    tabsCard: {
      padding: 8,
      backgroundColor: theme.colors.glass,
    },
    tabs: {
      flexDirection: 'row',
      gap: 8,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: `${theme.colors.primary}15`,
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
    tabIcon: {
      marginRight: 6,
    },
    tabText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    activeTabText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // Tab content
    tabContent: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    listingsContainer: {
      gap: 12,
    },
    listingCard: {
      marginBottom: 8,
    },
    viewAllButton: {
      marginTop: 8,
    },
    emptyCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
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
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    emptyButton: {
      minWidth: 180,
    },

    // Settings
    settingsSection: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    settingCard: {
      backgroundColor: theme.colors.surface,
      marginBottom: 8,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      marginRight: 12,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },

    // Sign out
    signOutSection: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    signOutButton: {
      borderColor: theme.colors.error,
    },
    bottomSpacing: {
      height: 20,
    },
  })
}
