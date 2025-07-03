import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Pressable,
  Dimensions,
  Share,
  Platform,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/contexts/ThemeContext'
import { useGameById, useListingsByGame } from '@/lib/api/hooks'
import {
  CachedImage,
  Button,
  Card,
  EmptyState,
  SkeletonLoader,
} from '@/components/ui'
import { ListingCard } from '@/components/cards'
import { EmulatorService, EMULATOR_PRESETS } from '@/lib/services/emulator'
import {
  getStaggerDelay,
  getBaseDelay,
  ANIMATION_CONFIG,
} from '@/lib/animation/config'
import type { Listing } from '@/types'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.5
const PARALLAX_HEIGHT = HEADER_HEIGHT * 1.2

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { theme } = useTheme()
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'listings' | 'stats'
  >('overview')
  const [refreshing, setRefreshing] = useState(false)

  const scrollY = useSharedValue(0)
  const headerOpacity = useSharedValue(1)

  // API hooks
  const gameQuery = useGameById({ id: id! }, { enabled: !!id })
  const listingsQuery = useListingsByGame({ gameId: id! }, { enabled: !!id })

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y

      // Update header opacity
      const opacity = interpolate(
        scrollY.value,
        [0, HEADER_HEIGHT * 0.3, HEADER_HEIGHT * 0.7],
        [1, 0.8, 0],
        Extrapolation.CLAMP,
      )
      headerOpacity.value = withSpring(opacity)
    },
  })

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT * 0.3],
      Extrapolation.CLAMP,
    )

    const scale = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [1, 1.2],
      Extrapolation.CLAMP,
    )

    return {
      transform: [{ translateY }, { scale }],
      opacity: headerOpacity.value,
    }
  })

  const headerOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT * 0.4, HEADER_HEIGHT * 0.8],
      [0, 0.5, 0.9],
      Extrapolation.CLAMP,
    )

    return {
      opacity,
    }
  })

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([gameQuery.refetch(), listingsQuery.refetch()])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleShare = async () => {
    if (!gameQuery.data) return

    try {
      await Share.share({
        message: `Check out ${gameQuery.data.title} on EmuReady!`,
        url: `https://emuready.com/game/${id}`,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleLaunchEmulator = async (presetName: string) => {
    if (!gameQuery.data) return

    try {
      // For now, using a hardcoded title ID - in the future this would come from game data
      const titleId = '0100000000010000'

      await EmulatorService.launchGameWithPreset(titleId, presetName)
    } catch (error) {
      console.error('Error launching emulator:', error)

      if (error instanceof Error) {
        if (
          error.message.includes('not installed') ||
          error.message.includes('Failed to launch')
        ) {
          Alert.alert(
            'Eden Emulator Required',
            'The Eden emulator app was not found on your device. Eden emulator is a custom application that needs to be installed separately.\n\nPlease ensure you have the Eden emulator APK installed on your device.',
            [
              {
                text: 'OK',
                style: 'default',
              },
            ],
          )
        } else {
          Alert.alert('Launch Error', error.message)
        }
      }
    }
  }

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverviewTab()
      case 'listings':
        return renderListingsTab()
      case 'stats':
        return renderStatsTab()
      default:
        return renderOverviewTab()
    }
  }

  const renderOverviewTab = () => (
    <View style={{ padding: theme.spacing.lg }}>
      {/* Game Info Card */}
      <Animated.View
        entering={FadeInUp.delay(getBaseDelay('fast')).duration(
          ANIMATION_CONFIG.timing.fast,
        )}
      >
        <Card
          style={{
            marginBottom: theme.spacing.lg,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={
              theme.colors.gradients.card as [string, string, ...string[]]
            }
            style={{
              padding: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.fontSize.xxl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
              }}
            >
              Game Information
            </Text>

            <View
              style={{ flexDirection: 'row', marginBottom: theme.spacing.md }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.textMuted,
                  width: 80,
                }}
              >
                System:
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.md,
                  color: theme.colors.text,
                  flex: 1,
                }}
              >
                {gameQuery.data?.system?.name || 'Unknown'}
              </Text>
            </View>

            <View
              style={{ flexDirection: 'row', marginBottom: theme.spacing.md }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.textMuted,
                  width: 80,
                }}
              >
                Status:
              </Text>
              <View
                style={{
                  backgroundColor: theme.colors.successLight,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borderRadius.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.success,
                  }}
                >
                  Approved
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Card>
      </Animated.View>

      {/* Performance Stats */}
      <Animated.View
        entering={FadeInUp.delay(getBaseDelay('normal')).duration(
          ANIMATION_CONFIG.timing.fast,
        )}
      >
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <LinearGradient
            colors={
              theme.colors.gradients.primary as [string, string, ...string[]]
            }
            style={{
              padding: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.textInverse,
                marginBottom: theme.spacing.md,
              }}
            >
              Performance Overview
            </Text>

            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.textInverse,
                  textAlign: 'center',
                }}
              >
                {listingsQuery.data?.length || 0} Performance Reports
              </Text>
            </View>
          </LinearGradient>
        </Card>
      </Animated.View>

      {/* Emulator Launch Options */}
      {Platform.OS === 'android' && (
        <Animated.View
          entering={FadeInUp.delay(getBaseDelay('normal')).duration(
            ANIMATION_CONFIG.timing.fast,
          )}
        >
          <Card style={{ marginBottom: theme.spacing.lg }}>
            <View style={{ padding: theme.spacing.lg }}>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Launch with Eden Emulator
              </Text>

              <Text
                style={{
                  fontSize: theme.typography.fontSize.md,
                  color: theme.colors.textMuted,
                  marginBottom: theme.spacing.md,
                }}
              >
                Launch this game directly with optimized settings using the Eden
                Nintendo Switch emulator (requires Eden emulator APK to be
                installed)
              </Text>

              {EMULATOR_PRESETS.map((preset, index) => (
                <Animated.View
                  key={preset.name}
                  entering={FadeInUp.delay(
                    getStaggerDelay(index, 'normal', 'fast'),
                  ).duration(ANIMATION_CONFIG.timing.fast)}
                  style={{ marginBottom: theme.spacing.sm }}
                >
                  <Button
                    title={preset.name}
                    subtitle={preset.description}
                    onPress={() => handleLaunchEmulator(preset.name)}
                    variant="secondary"
                    icon="play"
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    }}
                  />
                </Animated.View>
              ))}
            </View>
          </Card>
        </Animated.View>
      )}
    </View>
  )

  const renderListingsTab = () => (
    <View style={{ padding: theme.spacing.lg }}>
      {listingsQuery.isLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp.delay(index * 100).springify()}
            style={{ marginBottom: theme.spacing.md }}
          >
            <SkeletonLoader
              width="100%"
              height={120}
              borderRadius={theme.borderRadius.lg}
            />
          </Animated.View>
        ))
      ) : listingsQuery.data && listingsQuery.data.length > 0 ? (
        listingsQuery.data.map((listing: Listing, index: number) => (
          <Animated.View
            key={listing.id}
            entering={FadeInUp.delay(
              getStaggerDelay(index, 'fast', 'fast'),
            ).duration(ANIMATION_CONFIG.timing.fast)}
            style={{ marginBottom: theme.spacing.md }}
          >
            <ListingCard
              listing={listing}
              onPress={() => router.push(`/listing/${listing.id}`)}
            />
          </Animated.View>
        ))
      ) : (
        <EmptyState
          icon="game-controller"
          title="No Performance Reports"
          subtitle="Be the first to share how this game runs on your device!"
          actionLabel="Create Report"
          onAction={() => router.push('/(tabs)/create')}
        />
      )}
    </View>
  )

  const renderStatsTab = () => (
    <View style={{ padding: theme.spacing.lg }}>
      <Animated.View
        entering={FadeInUp.delay(getBaseDelay('fast')).duration(
          ANIMATION_CONFIG.timing.fast,
        )}
      >
        <Card>
          <View style={{ padding: theme.spacing.lg }}>
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                textAlign: 'center',
              }}
            >
              Game Statistics
            </Text>
            <Text
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.textMuted,
                textAlign: 'center',
                marginTop: theme.spacing.sm,
              }}
            >
              Coming soon...
            </Text>
          </View>
        </Card>
      </Animated.View>
    </View>
  )

  // Guard against missing id
  if (!id) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <EmptyState
          icon="alert-circle"
          title="Invalid Game"
          subtitle="The game you're looking for could not be found."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    )
  }

  // Loading state
  if (gameQuery.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

        {/* Header Skeleton */}
        <View style={{ height: HEADER_HEIGHT }}>
          <SkeletonLoader width="100%" height={HEADER_HEIGHT} />
          <View
            style={{
              position: 'absolute',
              bottom: theme.spacing.xl,
              left: theme.spacing.lg,
              right: theme.spacing.lg,
            }}
          >
            <SkeletonLoader
              width="80%"
              height={32}
              borderRadius={theme.borderRadius.sm}
              style={{ marginBottom: theme.spacing.sm }}
            />
            <SkeletonLoader
              width="60%"
              height={20}
              borderRadius={theme.borderRadius.sm}
            />
          </View>
        </View>

        {/* Tab Skeleton */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            backgroundColor: theme.colors.surface,
          }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonLoader
              key={index}
              width={80}
              height={32}
              borderRadius={theme.borderRadius.lg}
              style={{ marginRight: theme.spacing.sm }}
            />
          ))}
        </View>

        {/* Content Skeleton */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: theme.spacing.lg }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonLoader
              key={index}
              width="100%"
              height={120}
              borderRadius={theme.borderRadius.lg}
              style={{ marginBottom: theme.spacing.md }}
            />
          ))}
        </ScrollView>
      </View>
    )
  }

  // Error state
  if (gameQuery.error) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <EmptyState
          icon="alert-circle"
          title="Error Loading Game"
          subtitle="We couldn't load this game. Please try again."
          actionLabel="Retry"
          onAction={() => gameQuery.refetch()}
        />
      </SafeAreaView>
    )
  }

  const game = gameQuery.data

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      {/* Parallax Header */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: PARALLAX_HEIGHT,
            zIndex: 1,
          },
          headerAnimatedStyle,
        ]}
      >
        <CachedImage
          source={{
            uri:
              game?.coverImageUrl ||
              game?.boxArtUrl ||
              'https://via.placeholder.com/400x600',
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
        />

        {/* Gradient Overlay */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            },
            headerOverlayStyle,
          ]}
        >
          <LinearGradient
            colors={[
              'transparent',
              'rgba(0, 0, 0, 0.3)',
              'rgba(0, 0, 0, 0.7)',
              theme.colors.background,
            ]}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </Animated.View>

      {/* Navigation Header */}
      <SafeAreaView
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
      >
        <BlurView
          intensity={80}
          tint={theme.isDark ? 'dark' : 'light'}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.colors.glass,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>

          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Pressable
              onPress={handleShare}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.colors.glass,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="share" size={20} color={theme.colors.text} />
            </Pressable>
          </View>
        </BlurView>
      </SafeAreaView>

      {/* Scrollable Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            progressViewOffset={HEADER_HEIGHT * 0.8}
          />
        }
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT - theme.spacing.xxl,
        }}
      >
        {/* Game Title Section */}
        <Animated.View
          entering={FadeInDown.delay(getBaseDelay('instant')).duration(
            ANIMATION_CONFIG.timing.fast,
          )}
          style={{
            padding: theme.spacing.lg,
            paddingBottom: 0,
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.fontSize.xxxl,
              fontWeight: theme.typography.fontWeight.extrabold,
              color: theme.colors.text,
              marginBottom: theme.spacing.sm,
              lineHeight:
                theme.typography.lineHeight.tight *
                theme.typography.fontSize.xxxl,
            }}
          >
            {game?.title}
          </Text>

          {game?.system && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: theme.spacing.lg,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borderRadius.lg,
                  marginRight: theme.spacing.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.textInverse,
                  }}
                >
                  {game.system.name}
                </Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Tab Navigation */}
        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          style={{
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.xl,
              padding: theme.spacing.xs,
            }}
          >
            {[
              {
                key: 'overview',
                label: 'Overview',
                icon: 'information-circle',
              },
              { key: 'listings', label: 'Reports', icon: 'list' },
              { key: 'stats', label: 'Stats', icon: 'stats-chart' },
            ].map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => setSelectedTab(tab.key as any)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: theme.spacing.md,
                  paddingHorizontal: theme.spacing.sm,
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor:
                    selectedTab === tab.key
                      ? theme.colors.primary
                      : 'transparent',
                }}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={
                    selectedTab === tab.key
                      ? theme.colors.textInverse
                      : theme.colors.textMuted
                  }
                  style={{ marginRight: theme.spacing.xs }}
                />
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color:
                      selectedTab === tab.key
                        ? theme.colors.textInverse
                        : theme.colors.textMuted,
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Tab Content */}
        {renderTabContent()}
      </Animated.ScrollView>
    </View>
  )
}
