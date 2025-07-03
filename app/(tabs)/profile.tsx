import React, { useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { Card, Button } from '../../components/ui'
import { ListingCard } from '@/components/cards'
import { useListings, useUnreadNotificationCount } from '@/lib/api/hooks'
import { useTheme } from '@/contexts/ThemeContext'
import type { Listing } from '@/types'

type ProfileTab = 'listings' | 'favorites' | 'activity'

export default function ProfileScreen() {
  const router = useRouter()
  const { isSignedIn, signOut } = useAuth()
  const { theme, themeMode, setThemeMode } = useTheme()
  const [activeTab, setActiveTab] = useState<ProfileTab>('listings')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Create themed styles (needs to be before early returns)
  const styles = createStyles(theme)

  // Only fetch user data and listings when authenticated
  // TODO: Implement current user query with Clerk user data
  const currentUserQuery = {
    data: null,
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
    Alert.alert(
      'Sign In Required',
      'Please sign in to access your profile and create listings.',
      [
        { text: 'Cancel' },
        {
          text: 'Sign In',
          onPress: () => {
            router.push('/(auth)/sign-in')
          },
        },
      ],
    )
  }

  const handleSignUp = () => {
    // Navigate to sign up screen or show sign up modal
    Alert.alert(
      'Create Account',
      'Join EmuReady to share your emulation experiences.',
      [
        { text: 'Cancel' },
        {
          text: 'Sign Up',
          onPress: () => {
            router.push('/(auth)/sign-up')
          },
        },
      ],
    )
  }

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing will be available in a future update.',
      [{ text: 'OK' }],
    )
  }

  const handleListingPress = (listingId: string) => {
    router.push(`/listing/${listingId}` as any)
  }

  const handleSettingsPress = (setting: string) => {
    Alert.alert(setting, 'This setting will be available in a future update.', [
      { text: 'OK' },
    ])
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
              Sign in to access your profile, create listings, and connect with
              the emulation community.
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
                  title={
                    themeMode === 'system'
                      ? 'Auto'
                      : themeMode === 'dark'
                        ? 'Dark'
                        : 'Light'
                  }
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    const nextMode =
                      themeMode === 'light'
                        ? 'dark'
                        : themeMode === 'dark'
                          ? 'system'
                          : 'light'
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
          <Text style={styles.errorDescription}>
            There was an error loading your profile data.
          </Text>
          <Button
            title="Try Again"
            variant="primary"
            onPress={async () => {
              await Promise.all([
                currentUserQuery.refetch(),
                userListingsQuery.refetch(),
              ])
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.profileImageContainer}>
              <Ionicons
                name="person-circle"
                size={80}
                color={theme.colors.textSecondary}
              />
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>
                {currentUserQuery.data.name}
              </Text>
              <Text style={styles.profileEmail}>
                {currentUserQuery.data.email}
              </Text>
              <Text style={styles.profileStats}>
                {userListings.length} listing
                {userListings.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <Button
            title="Edit"
            variant="outline"
            size="sm"
            onPress={handleEditProfile}
            rightIcon={
              <Ionicons name="pencil" size={14} color={theme.colors.text} />
            }
          />
        </View>

        {/* Profile Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            {[
              { key: 'listings', label: 'Listings', icon: 'game-controller' },
              { key: 'favorites', label: 'Favorites', icon: 'heart' },
              { key: 'activity', label: 'Activity', icon: 'time' },
            ].map((tab) => (
              <Card
                key={tab.key}
                style={StyleSheet.flatten([
                  styles.tab,
                  activeTab === tab.key && styles.activeTab,
                ])}
                padding="sm"
                onPress={() => setActiveTab(tab.key as ProfileTab)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={
                    activeTab === tab.key
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                  style={styles.tabIcon}
                />
                <Text
                  style={StyleSheet.flatten([
                    styles.tabText,
                    activeTab === tab.key && styles.activeTabText,
                  ])}
                >
                  {tab.label}
                </Text>
              </Card>
            ))}
          </View>
        </View>

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
                thumbColor={
                  notificationsEnabled
                    ? theme.colors.card
                    : theme.colors.background
                }
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
                title={
                  themeMode === 'system'
                    ? 'Auto'
                    : themeMode === 'dark'
                      ? 'Dark'
                      : 'Light'
                }
                variant="outline"
                size="sm"
                onPress={() => {
                  const nextMode =
                    themeMode === 'light'
                      ? 'dark'
                      : themeMode === 'dark'
                        ? 'system'
                        : 'light'
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
                    <Text style={styles.settingDescription}>
                      {setting.description}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.textMuted}
                />
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 24,
    },
    profileInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    profileImageContainer: {
      marginRight: 16,
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
