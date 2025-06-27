import React, { useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { Card, Button } from '../../components/ui'
import { ListingCard } from '@/components/cards'
import { useListings } from '@/lib/api/hooks'
import { useTheme } from '@/contexts/ThemeContext'

type ProfileTab = 'listings' | 'favorites' | 'activity'

export default function ProfileScreen() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { user } = useUser()
  const { theme, themeMode, setThemeMode } = useTheme()
  const [activeTab, setActiveTab] = useState<ProfileTab>('listings')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Get listings - we get all listings and filter client-side since the backend
  // doesn't currently expose a userId filter on the listings endpoint
  const { data: userListingsData, isLoading: listingsLoading } = useListings({
    page: 1,
    limit: 50, // Get more to have better chance of finding user's listings
  })

  // Filter listings to show only user's listings (when userId is available in API)
  const userListings =
    userListingsData?.listings?.filter(
      (listing) => listing.author?.id === user?.id,
    ) || []

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

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing will be available in a future update.',
      [{ text: 'OK' }],
    )
  }

  const handleListingPress = (listingId: string) => {
    ;(router.push as any)(`/listing/${listingId}`)
  }

  const handleSettingsPress = (setting: string) => {
    Alert.alert(setting, 'This setting will be available in a future update.', [
      { text: 'OK' },
    ])
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'listings':
        return (
          <View style={styles.tabContent}>
            {listingsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading your listings...</Text>
              </View>
            ) : userListings.length > 0 ? (
              <View style={styles.listingsContainer}>
                {userListings.map((listing) => (
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
                color="#9ca3af"
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
                color="#9ca3af"
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

  // Create themed styles
  const styles = createStyles(theme)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Image
              source={{
                uri:
                  user?.imageUrl ||
                  'https://via.placeholder.com/80x80?text=User',
              }}
              style={styles.profileImage}
            />
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>
                {user?.fullName || user?.firstName || 'User'}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.primaryEmailAddress?.emailAddress || 'No email'}
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
            rightIcon={<Ionicons name="pencil" size={14} color="#374151" />}
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
                  color={activeTab === tab.key ? '#3b82f6' : '#6b7280'}
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
                  color="#374151"
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
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#f3f4f6'}
              />
            </View>
          </Card>

          {/* Theme */}
          <Card style={styles.settingCard} padding="md">
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name={theme.isDark ? "moon" : "sunny"}
                  size={20}
                  color="#374151"
                  style={styles.settingIcon}
                />
                <View>
                  <Text style={styles.settingTitle}>Theme</Text>
                  <Text style={styles.settingDescription}>
                    {themeMode === 'system' ? 'Follow system' : themeMode === 'dark' ? 'Dark mode' : 'Light mode'}
                  </Text>
                </View>
              </View>
              <Button
                title={themeMode === 'system' ? 'Auto' : themeMode === 'dark' ? 'Dark' : 'Light'}
                variant="outline"
                size="sm"
                onPress={() => {
                  const nextMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light'
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
                    color="#374151"
                    style={styles.settingIcon}
                  />
                  <View>
                    <Text style={styles.settingTitle}>{setting.title}</Text>
                    <Text style={styles.settingDescription}>
                      {setting.description}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
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
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Ionicons name="log-out" size={16} color="#ef4444" />
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
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileDetails: {
    flex: 1,
  },
    profileName: {
      fontSize: theme.typography.fontSize.xl + 4,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      marginBottom: 4,
    },
  profileStats: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeTab: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  tabContent: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  listingsContainer: {
    gap: 16,
  },
  listingCard: {
    marginBottom: 0,
  },
  viewAllButton: {
    marginTop: 8,
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
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  settingCard: {
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
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  signOutSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  signOutButton: {
    borderColor: '#ef4444',
  },
    bottomSpacing: {
      height: 100,
    },
  })
}
