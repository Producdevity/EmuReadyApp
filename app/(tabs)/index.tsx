import React, { useState, useMemo } from 'react'
import {
  ScrollView,
  View,
  Text,
  TextInput,
  RefreshControl,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  FadeInUp,
  FadeInDown,
  SlideInRight,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

import { useTheme } from '@/contexts/ThemeContext'
import { useAppStats, useFeaturedListings, usePopularGames } from '@/lib/api/hooks'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ListingCard } from '@/components/cards'
import { SkeletonLoader, SkeletonListingCard } from '@/components/ui'
import type { Listing, Game } from '@/types'

const HEADER_HEIGHT = 280

export default function HomeScreen() {
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const scrollY = useSharedValue(0)
  
  const statsQuery = useAppStats()
  const featuredListingsQuery = useFeaturedListings()
  const popularGamesQuery = usePopularGames()

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
      Extrapolation.CLAMP
    )
    
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT / 2],
      Extrapolation.CLAMP
    )

    return {
      opacity,
      transform: [{ translateY }],
    }
  })

  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -10],
      Extrapolation.CLAMP
    )

    const scale = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.95],
      Extrapolation.CLAMP
    )

    return {
      transform: [{ translateY }, { scale }],
    }
  })


  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}`)
  }

  const handleListingPress = (listingId: string) => {
    router.push(`/listing/${listingId}`)
  }

  const renderStatsCard = (stat: { label: string; value: string; color: string; icon: string }, index: number) => (
    <Animated.View
      key={stat.label}
      entering={FadeInUp.delay(index * 100).springify()}
      style={{ flex: 1, marginHorizontal: 4 }}
    >
      <Card variant="glass" padding="md" style={{ alignItems: 'center' }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: `${stat.color}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}>
          <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
        </View>
        <Text style={{
          fontSize: 20,
          fontWeight: '700',
          color: theme.colors.text,
          marginBottom: 2,
        }}>
          {stat.value}
        </Text>
        <Text style={{
          fontSize: 12,
          color: theme.colors.textMuted,
          textAlign: 'center',
        }}>
          {stat.label}
        </Text>
      </Card>
    </Animated.View>
  )

  const renderGameCard = (game: Game, index: number) => (
    <Animated.View
      key={game.id}
      entering={SlideInRight.delay(index * 50).springify()}
      style={{ marginRight: 16, width: 140 }}
    >
      <Card 
        variant="glass" 
        padding="sm" 
        onPress={() => handleGamePress(game.id)}
        style={{ height: 180 }}
      >
        <View style={{
          width: '100%',
          height: 100,
          borderRadius: 8,
          backgroundColor: theme.colors.surface,
          marginBottom: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {game.coverImageUrl || game.boxArtUrl ? (
            <Animated.Image
              source={{ uri: game.coverImageUrl || game.boxArtUrl || undefined }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="game-controller"
              size={32}
              color={theme.colors.textMuted}
            />
          )}
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
          }}
          numberOfLines={2}
        >
          {game.title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.textMuted,
          }}
          numberOfLines={1}
        >
          {game.system?.name}
        </Text>
      </Card>
    </Animated.View>
  )

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        statsQuery.refetch(),
        featuredListingsQuery.refetch(),
        popularGamesQuery.refetch(),
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const statsData = useMemo(() => [
    {
      label: 'Listings',
      value: statsQuery.data?.totalListings?.toLocaleString() || '0',
      color: theme.colors.primary,
      icon: '📱',
    },
    {
      label: 'Games',
      value: statsQuery.data?.totalGames?.toLocaleString() || '0',
      color: theme.colors.secondary,
      icon: '🎮',
    },
    {
      label: 'Users',
      value: statsQuery.data?.totalUsers?.toLocaleString() || '0',
      color: theme.colors.accent,
      icon: '👥',
    },
  ], [statsQuery.data, theme])

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={
          theme.isDark
            ? ['#1e293b', '#0f172a', '#0f172a']
            : ['#f8fafc', '#ffffff', '#ffffff']
        }
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT + 100,
        }}
      />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Section */}
        <Animated.View style={[{ height: HEADER_HEIGHT }, headerAnimatedStyle]}>
          <SafeAreaView style={{ flex: 1, paddingHorizontal: 20 }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Animated.View entering={FadeInDown.delay(200).springify()}>
                <Text style={{
                  fontSize: 32,
                  fontWeight: '800',
                  color: theme.colors.text,
                  marginBottom: 8,
                  textAlign: 'center',
                }}>
                  Welcome to EmuReady
                </Text>
                <Text style={{
                  fontSize: 16,
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                  lineHeight: 24,
                  marginBottom: 32,
                }}>
                  Discover the best emulation performance for your favorite games
                </Text>
              </Animated.View>

              {/* Search Bar */}
              <Animated.View
                style={[searchBarAnimatedStyle]}
                entering={FadeInUp.delay(400).springify()}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.surface,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 24,
                  shadowColor: theme.colors.shadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 8,
                }}>
                  <Ionicons
                    name="search"
                    size={20}
                    color={theme.colors.textMuted}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: theme.colors.text,
                      fontWeight: '500',
                    }}
                    placeholder="Search games, devices, emulators..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                  />
                  {searchQuery.length > 0 && (
                    <Button
                      title="Search"
                      variant="ghost"
                      size="sm"
                      onPress={handleSearch}
                    />
                  )}
                </View>
              </Animated.View>
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* Stats Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Animated.View
            entering={FadeInUp.delay(600).springify()}
            style={{
              flexDirection: 'row',
              marginBottom: 16,
            }}
          >
            {statsQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.delay(600 + index * 100).springify()}
                  style={{ flex: 1, marginHorizontal: 4 }}
                >
                  <Card variant="glass" padding="md" style={{ alignItems: 'center' }}>
                    <SkeletonLoader width={48} height={48} borderRadius={24} style={{ marginBottom: 8 }} />
                    <SkeletonLoader width="60%" height={20} style={{ marginBottom: 2 }} />
                    <SkeletonLoader width="80%" height={12} />
                  </Card>
                </Animated.View>
              ))
            ) : (
              statsData.map(renderStatsCard)
            )}
          </Animated.View>
        </View>

        {/* Popular Games Section */}
        <View style={{ marginBottom: 32 }}>
          <Animated.View
            entering={FadeInUp.delay(800).springify()}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              marginBottom: 16,
            }}
          >
            <Text style={{
              fontSize: 22,
              fontWeight: '700',
              color: theme.colors.text,
            }}>
              Popular Games
            </Text>
            <Button
              title="See All"
              variant="ghost"
              size="sm"
              onPress={() => router.push('/browse')}
              rightIcon={
                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
              }
            />
          </Animated.View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {popularGamesQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Animated.View
                  key={index}
                  entering={SlideInRight.delay(800 + index * 50).springify()}
                  style={{ marginRight: 16, width: 140 }}
                >
                  <Card variant="glass" padding="sm" style={{ height: 180 }}>
                    <SkeletonLoader width="100%" height={100} borderRadius={8} style={{ marginBottom: 8 }} />
                    <SkeletonLoader width="90%" height={14} style={{ marginBottom: 4 }} />
                    <SkeletonLoader width="70%" height={12} />
                  </Card>
                </Animated.View>
              ))
            ) : (
              Array.isArray(popularGamesQuery.data) ? popularGamesQuery.data.slice(0, 10).map(renderGameCard) : []
            )}
          </ScrollView>
        </View>

        {/* Featured Listings Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Animated.View
            entering={FadeInUp.delay(1000).springify()}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{
              fontSize: 22,
              fontWeight: '700',
              color: theme.colors.text,
            }}>
              Featured Performance
            </Text>
            <Button
              title="See All"
              variant="ghost"
              size="sm"
              onPress={() => router.push('/browse')}
              rightIcon={
                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
              }
            />
          </Animated.View>

          <View style={{ gap: 12 }}>
            {featuredListingsQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.delay(1200 + index * 100).springify()}
                >
                  <SkeletonListingCard
                    style={{
                      shadowColor: theme.colors.shadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  />
                </Animated.View>
              ))
            ) : (
              Array.isArray(featuredListingsQuery.data) ? featuredListingsQuery.data.slice(0, 5).map((listing: Listing, index: number) => (
                <Animated.View
                  key={listing.id}
                  entering={FadeInUp.delay(1200 + index * 100).springify()}
                >
                  <ListingCard
                    listing={listing}
                    onPress={() => handleListingPress(listing.id)}
                    style={{
                      shadowColor: theme.colors.shadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  />
                </Animated.View>
              )) : []
            )}
          </View>

          {(!Array.isArray(featuredListingsQuery.data) || featuredListingsQuery.data.length === 0) && !featuredListingsQuery.isLoading && (
            <Animated.View entering={FadeInUp.delay(1200).springify()}>
              <Card variant="glass" padding="lg" style={{ alignItems: 'center' }}>
                <Ionicons
                  name="star-outline"
                  size={48}
                  color={theme.colors.textMuted}
                  style={{ marginBottom: 16 }}
                />
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: 8,
                  textAlign: 'center',
                }}>
                  No Featured Content Yet
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: theme.colors.textMuted,
                  textAlign: 'center',
                  marginBottom: 20,
                  lineHeight: 20,
                }}>
                  Be among the first to share your emulation experiences and get featured!
                </Text>
                <Button
                  title="Create Listing"
                  variant="gradient"
                  onPress={() => router.push('/(tabs)/create')}
                  leftIcon={<Ionicons name="add" size={16} color="#ffffff" />}
                />
              </Card>
            </Animated.View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Animated.View
            entering={FadeInUp.delay(1400).springify()}
            style={{
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Button
                title="Browse All"
                variant="outline"
                fullWidth
                onPress={() => router.push('/browse')}
                leftIcon={<Ionicons name="grid" size={16} color={theme.colors.primary} />}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Create Listing"
                variant="primary"
                fullWidth
                onPress={() => router.push('/(tabs)/create')}
                leftIcon={<Ionicons name="add" size={16} color="#ffffff" />}
              />
            </View>
          </Animated.View>
        </View>
      </Animated.ScrollView>
    </View>
  )
}