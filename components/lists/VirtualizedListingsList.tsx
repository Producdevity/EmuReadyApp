import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import React, { memo, useCallback, useEffect } from 'react'
import { FlatList, RefreshControl, StyleSheet, View, type ListRenderItem } from 'react-native'
import Animated, {
  BounceIn,
  runOnJS,
  SlideInLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { ListingCard } from '@/components/cards'
import { GlowText, GradientTitle, TypewriterText } from '@/components/themed/ThemedText'
import { GlassView, HolographicView } from '@/components/themed/ThemedView'
import { Button } from '@/components/ui'
import FluidGradient from '@/components/ui/FluidGradient'
import { FloatingElement, MICRO_SPRING_CONFIG } from '@/components/ui/MicroInteractions'
import { EnhancedSkeletonCard } from '@/components/ui/MorphingSkeleton'
import { useTheme } from '@/contexts/ThemeContext'
import type { Listing } from '@/types'

interface VirtualizedListingsListProps {
  listings: Listing[]
  isLoading: boolean
  error?: any
  onListingPress: (listingId: string) => void
  onRefresh?: () => void
  refreshing?: boolean
  onRetry?: () => void
  ListHeaderComponent?: React.ComponentType | React.ReactElement
  ListFooterComponent?: React.ComponentType | React.ReactElement
  emptyTitle?: string
  emptySubtitle?: string
}

const VirtualizedListingsList: React.FC<VirtualizedListingsListProps> = ({
  listings,
  isLoading,
  error,
  onListingPress,
  onRefresh,
  refreshing = false,
  onRetry,
  ListHeaderComponent,
  ListFooterComponent,
  emptyTitle = 'No Results Found',
  emptySubtitle = "Try adjusting your search terms or filters to find what you're looking for.",
}) => {
  const { theme } = useTheme()
  const styles = createStyles(theme)

  const AnimatedListingCard = memo(function AnimatedListingCard({
    listing,
    onPress,
    index,
  }: {
    listing: Listing
    onPress: () => void
    index: number
  }) {
    const scale = useSharedValue(0.95)
    const opacity = useSharedValue(0)
    const translateX = useSharedValue(-50)

    useEffect(() => {
      const delay = index * 100

      setTimeout(() => {
        scale.value = withSpring(1, MICRO_SPRING_CONFIG.bouncy)
        opacity.value = withTiming(1, { duration: 400 })
        translateX.value = withSpring(0, MICRO_SPRING_CONFIG.smooth)
      }, delay)
    }, [index, opacity, scale, translateX])

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
      ],
    }))

    const handlePress = () => {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
      onPress()
    }

    return (
      <FloatingElement intensity={2} duration={3000 + index * 200}>
        <Animated.View style={[styles.listingWrapper, animatedStyle]}>
          <ListingCard listing={listing} onPress={handlePress} style={styles.listingCard} />
        </Animated.View>
      </FloatingElement>
    )
  })

  const LoadingItem = memo(function LoadingItem({ index }: { index: number }) {
    return (
      <Animated.View
        entering={SlideInLeft.delay(index * 150)
          .springify()
          .damping(15)}
        style={styles.listingWrapper}
      >
        <EnhancedSkeletonCard variant="listing" animated style={styles.skeletonCard} />
      </Animated.View>
    )
  })

  const renderItem: ListRenderItem<Listing> = useCallback(
    ({ item, index }) => (
      <AnimatedListingCard listing={item} onPress={() => onListingPress(item.id)} index={index} />
    ),
    [onListingPress, AnimatedListingCard],
  )

  const renderLoadingItem: ListRenderItem<number> = useCallback(
    ({ index }) => <LoadingItem index={index} />,
    [LoadingItem],
  )

  const keyExtractor = useCallback((item: Listing) => item.id, [])

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: 180, // Approximate height of ListingCard
      offset: 180 * index,
      index,
    }),
    [],
  )

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, [styles.separator])

  // Loading state
  if (isLoading) {
    return (
      <FlatList
        data={Array.from({ length: 5 }, (_, i) => i)}
        renderItem={renderLoadingItem}
        keyExtractor={(item) => `loading-${item}`}
        ItemSeparatorComponent={ItemSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
      />
    )
  }

  // Enhanced Error state with 2025 design
  if (error && listings.length === 0) {
    return (
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          <Animated.View entering={BounceIn.delay(300).springify()}>
            <HolographicView morphing borderRadius={24} style={styles.errorCard}>
              <FluidGradient
                variant="cosmic"
                borderRadius={24}
                animated
                speed="slow"
                style={StyleSheet.absoluteFillObject}
                opacity={0.1}
              />

              <View style={styles.errorContent}>
                <FloatingElement intensity={5} duration={2000}>
                  <View style={styles.errorIconContainer}>
                    <LinearGradient
                      colors={[theme.colors.error, `${theme.colors.error}80`]}
                      style={styles.errorIconGradient}
                    >
                      <Ionicons name="cloud-offline" size={48} color="#ffffff" />
                    </LinearGradient>
                  </View>
                </FloatingElement>

                <GradientTitle animated variant="scale" style={styles.errorTitle}>
                  Unable to Load Listings
                </GradientTitle>

                <TypewriterText animated delay={500} style={styles.errorText}>
                  Please check your connection and try again.
                </TypewriterText>

                {onRetry && (
                  <FloatingElement intensity={3} duration={2500}>
                    <Button
                      title="Retry"
                      variant="gradient"
                      onPress={onRetry}
                      style={styles.retryButton}
                      leftIcon={<Ionicons name="refresh" size={16} color="#ffffff" />}
                    />
                  </FloatingElement>
                )}
              </View>
            </HolographicView>
          </Animated.View>
        }
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={styles.contentContainer}
      />
    )
  }

  return (
    <FlatList
      data={listings}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ItemSeparatorComponent={ItemSeparator}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={10}
      initialNumToRender={8}
      contentContainerStyle={
        listings.length === 0 ? styles.emptyContainer : styles.contentContainer
      }
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={
        <Animated.View entering={BounceIn.delay(300).springify()}>
          <GlassView borderRadius={24} blurIntensity={30} style={styles.emptyCard}>
            <FluidGradient
              variant="aurora"
              borderRadius={24}
              animated
              speed="normal"
              style={StyleSheet.absoluteFillObject}
              opacity={0.08}
            />

            <View style={styles.emptyContent}>
              <FloatingElement intensity={4} duration={3000}>
                <View style={styles.emptyIconContainer}>
                  <LinearGradient
                    colors={theme.colors.gradients.primary}
                    style={styles.emptyIconGradient}
                  >
                    <Ionicons name="search" size={48} color="#ffffff" />
                  </LinearGradient>
                </View>
              </FloatingElement>

              <GlowText style={styles.emptyTitle}>
                {emptyTitle}
              </GlowText>

              <TypewriterText animated delay={400} style={styles.emptyText}>
                {emptySubtitle}
              </TypewriterText>
            </View>
          </GlassView>
        </Animated.View>
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        ) : undefined
      }
    />
  )
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    contentContainer: {
      paddingBottom: 120,
      paddingTop: 8,
    },
    emptyContainer: {
      flexGrow: 1,
      paddingBottom: 120,
      justifyContent: 'center',
    },
    listingWrapper: {
      paddingHorizontal: 20,
      marginBottom: 8,
    },
    listingCard: {
      marginBottom: 0,
    },
    skeletonCard: {
      borderRadius: 20,
    },
    separator: {
      height: 20,
    },
    errorCard: {
      marginHorizontal: 20,
      padding: 32,
      position: 'relative',
      overflow: 'hidden',
    },
    errorContent: {
      alignItems: 'center',
      position: 'relative',
      zIndex: 1,
    },
    errorIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      overflow: 'hidden',
      marginBottom: 24,
      shadowColor: theme.colors.error,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    errorIconGradient: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
    },
    retryButton: {
      width: '100%',
      borderRadius: 16,
    },
    emptyCard: {
      marginHorizontal: 20,
      padding: 32,
      position: 'relative',
      overflow: 'hidden',
    },
    emptyContent: {
      alignItems: 'center',
      position: 'relative',
      zIndex: 1,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      overflow: 'hidden',
      marginBottom: 24,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    emptyIconGradient: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 24,
    },
  })

export default memo(VirtualizedListingsList)
