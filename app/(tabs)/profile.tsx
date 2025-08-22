import { ListingCard } from '@/components/cards'
import { ThemedText } from '@/components/themed'
import { GlassView } from '@/components/themed/ThemedView'
import {
  AnimatedPressable,
  MICRO_SPRING_CONFIG,
} from '@/components/ui/MicroInteractions'
import { useTheme } from '@/contexts/ThemeContext'
import { useUnreadNotificationCount, useUserListings, useUserProfile } from '@/lib/api/hooks'
import { useAuthHelpers, transformClerkUser } from '@/lib/auth/clerk'
import type { Listing } from '@/types'
import { useAuth } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  View,
} from 'react-native'
import Animated, {
  BounceIn,
  runOnJS,
  SlideInLeft,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated'
import EditProfileModal from '@/components/modals/EditProfileModal'
import { Button, Card, ScreenLayout } from '../../components/ui'
import IllustratedEmptyState from '@/components/ui/IllustratedEmptyState'

type ProfileTab = 'listings' | 'favorites' | 'activity'

// const { height: SCREEN_HEIGHT } = Dimensions.get('window')
// const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25

export default function ProfileScreen() {
  const router = useRouter()
  const { isSignedIn, signOut } = useAuth()
  const { user: clerkUser } = useAuthHelpers()
  const { theme, themeMode, setThemeMode } = useTheme()
  const [activeTab, setActiveTab] = useState<ProfileTab>('listings')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)

  // Simplified animation values
  const tabScale = useSharedValue(1)

  // Create themed styles (needs to be before early returns)
  const styles = createStyles(theme)

  // Fetch user profile data
  const userProfileQuery = useUserProfile(undefined, {
    enabled: isSignedIn,
  })

  // Transform Clerk user data if profile query fails
  const userData = userProfileQuery.data || (clerkUser ? transformClerkUser(clerkUser) : null)

  const _unreadCountQuery = useUnreadNotificationCount()
  
  // Use the proper hook for user listings
  const userListingsQuery = useUserListings(
    { userId: userData?.id || '' },
    { enabled: !!userData?.id }
  )

  // Get user's listings
  const userListings: Listing[] = userListingsQuery.data || []

  const tabScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tabScale.value }],
  }))

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
          } catch {
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
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
    setShowEditProfile(true)
  }

  const handleEditProfileSuccess = () => {
    // Refetch user data after successful edit
    userProfileQuery.refetch()
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
      <ScreenLayout scrollable={false}>
        <View style={styles.authContainer}>
          <View style={styles.authContent}>
            <Ionicons
              name="person-circle"
              size={100}
              color={theme.colors.textSecondary}
              style={styles.authIcon}
            />
            <ThemedText type="title" style={styles.authTitle}>Welcome to EmuReady</ThemedText>
            <ThemedText type="subtitle" style={styles.authDescription}>
              Sign in to access your profile, create listings, and connect with the emulation
              community.
            </ThemedText>

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
                    <ThemedText style={styles.settingTitle}>Theme</ThemedText>
                    <ThemedText type="caption" style={styles.settingDescription}>
                      {themeMode === 'system'
                        ? 'Follow system'
                        : themeMode === 'dark'
                          ? 'Dark mode'
                          : 'Light mode'}
                    </ThemedText>
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
      </ScreenLayout>
    )
  }

  // Show loading state while fetching user data
  if (userProfileQuery.isLoading && !userData) {
    return (
      <ScreenLayout scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
        </View>
      </ScreenLayout>
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
                <ThemedText style={styles.loadingText}>Loading your listings...</ThemedText>
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
              <IllustratedEmptyState
                type="listings"
                actionLabel="Create Your First Listing"
                onAction={() => router.push('/(tabs)/create')}
                style={styles.emptyCard}
              />
            )}
          </View>
        )

      case 'favorites':
        return (
          <View style={styles.tabContent}>
            <IllustratedEmptyState
              type="favorites"
              actionLabel="Browse Listings"
              onAction={() => router.push('/(tabs)/browse')}
              style={styles.emptyCard}
            />
          </View>
        )

      case 'activity':
        return (
          <View style={styles.tabContent}>
            <IllustratedEmptyState
              type="activity"
              subtitle="Your votes, comments, and interactions will appear here"
              actionLabel="Explore Community"
              onAction={() => router.push('/(tabs)/browse')}
              style={styles.emptyCard}
            />
          </View>
        )

      default:
        return null
    }
  }

  return (
    <ScreenLayout>
          {/* Profile Header */}
          <Animated.View entering={SlideInLeft.delay(200).springify().damping(15)}>
            <GlassView style={{
              marginHorizontal: theme.spacing.lg,
              marginTop: theme.spacing.md,
              marginBottom: theme.spacing.md,
              padding: theme.spacing.lg,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                }}>
                  {/* Profile Avatar */}
                  <View style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    marginRight: theme.spacing.lg,
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.primary,
                  }}>
                    <Ionicons name="person" size={48} color={theme.colors.textInverse} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <ThemedText
                      type="title"
                      style={{
                        fontSize: theme.typography.fontSize.xl,
                        marginBottom: theme.spacing.xs,
                      }}>
                      {userData?.name || clerkUser?.firstName || 'EmuReady User'}
                    </ThemedText>

                    <ThemedText
                      type="caption"
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.textMuted,
                        marginBottom: theme.spacing.xs,
                      }}>
                      {userData?.email || clerkUser?.primaryEmailAddress?.emailAddress || ''}
                    </ThemedText>

                    <ThemedText
                      type="caption"
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.textSecondary,
                      }}>
                      {userListings.length} listing{userListings.length !== 1 ? 's' : ''} shared
                    </ThemedText>
                  </View>
                </View>

                {/* Edit Button */}
                <AnimatedPressable
                  onPress={() => {
                    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
                    handleEditProfile()
                  }}
                >
                  <View style={{
                    backgroundColor: theme.colors.surface,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                  }}>
                    <Ionicons name="pencil" size={16} color={theme.colors.primary} />
                    <ThemedText style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.primary,
                    }}>
                      Edit
                    </ThemedText>
                  </View>
                </AnimatedPressable>
              </View>
            </GlassView>
          </Animated.View>

          {/* Profile Tabs */}
          <Animated.View
            entering={BounceIn.delay(400).springify().damping(12)}
            style={{
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <GlassView style={{
              padding: theme.spacing.sm,
            }}>
              <View style={{
                flexDirection: 'row',
                gap: theme.spacing.sm,
              }}>
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
                        withSpring(1, MICRO_SPRING_CONFIG.bouncy),
                      )
                      setActiveTab(tab.key as ProfileTab)
                    }}
                  >
                    <Animated.View
                      entering={SlideInLeft.delay(500 + index * 100)
                        .springify()
                        .damping(15)}
                      style={tabScaleStyle}
                    >
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: activeTab === tab.key ? theme.colors.primary : theme.colors.surface,
                          borderRadius: theme.borderRadius.md,
                          paddingVertical: theme.spacing.md,
                          paddingHorizontal: theme.spacing.md,
                        }}
                      >
                        <Ionicons
                          name={tab.icon as any}
                          size={20}
                          color={activeTab === tab.key ? theme.colors.textInverse : theme.colors.textSecondary}
                          style={{ marginRight: theme.spacing.xs }}
                        />
                        <ThemedText
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            fontWeight: theme.typography.fontWeight.medium,
                            color: activeTab === tab.key ? theme.colors.textInverse : theme.colors.textSecondary,
                          }}
                        >
                          {tab.label}
                        </ThemedText>
                      </View>
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
            <ThemedText style={styles.sectionTitle}>Settings</ThemedText>

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
                    <ThemedText style={styles.settingTitle}>Push Notifications</ThemedText>
                    <ThemedText style={styles.settingDescription}>
                      Get notified about votes and comments
                    </ThemedText>
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
                    <ThemedText style={styles.settingTitle}>Theme</ThemedText>
                    <ThemedText type="caption" style={styles.settingDescription}>
                      {themeMode === 'system'
                        ? 'Follow system'
                        : themeMode === 'dark'
                          ? 'Dark mode'
                          : 'Light mode'}
                    </ThemedText>
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
                      <ThemedText style={styles.settingTitle}>{setting.title}</ThemedText>
                      <ThemedText style={styles.settingDescription}>{setting.description}</ThemedText>
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSuccess={handleEditProfileSuccess}
      />
    </ScreenLayout>
  )
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
