import React, { memo, useCallback } from 'react'
import { FlatList, View, Text, type ListRenderItem, StyleSheet, RefreshControl } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { ListingCard } from '@/components/cards'
import { Card, Button, SkeletonListingCard } from '@/components/ui'
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

const AnimatedListingCard = memo(function AnimatedListingCard({
  listing,
  onPress,
  index,
}: {
  listing: Listing
  onPress: () => void
  index: number
}) {
  return (
    <Animated.View entering={FadeInUp.delay(index * 50).springify()} style={styles.listingWrapper}>
      <ListingCard listing={listing} onPress={onPress} style={styles.listingCard} />
    </Animated.View>
  )
})

const LoadingItem = memo(function LoadingItem({ index }: { index: number }) {
  return (
    <Animated.View entering={FadeInUp.delay(index * 100).springify()} style={styles.listingWrapper}>
      <SkeletonListingCard />
    </Animated.View>
  )
})

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

  const renderItem: ListRenderItem<Listing> = useCallback(
    ({ item, index }) => (
      <AnimatedListingCard listing={item} onPress={() => onListingPress(item.id)} index={index} />
    ),
    [onListingPress],
  )

  const renderLoadingItem: ListRenderItem<number> = useCallback(
    ({ index }) => <LoadingItem index={index} />,
    [],
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

  // Error state
  if (error && listings.length === 0) {
    return (
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          <Animated.View entering={FadeInUp.delay(300).springify()}>
            <Card variant="glass" style={styles.errorCard} padding="lg">
              <Ionicons
                name="cloud-offline"
                size={48}
                color={theme.colors.textMuted}
                style={styles.errorIcon}
              />
              <Text style={styles.errorTitle}>Unable to Load Listings</Text>
              <Text style={styles.errorText}>Please check your connection and try again.</Text>
              {onRetry && (
                <Button
                  title="Retry"
                  variant="gradient"
                  onPress={onRetry}
                  style={styles.retryButton}
                  leftIcon={<Ionicons name="refresh" size={16} color="#ffffff" />}
                />
              )}
            </Card>
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
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <Card variant="glass" style={styles.emptyCard} padding="lg">
            <Ionicons
              name="search"
              size={48}
              color={theme.colors.textMuted}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyText}>{emptySubtitle}</Text>
          </Card>
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
      paddingBottom: 100,
    },
    emptyContainer: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    listingWrapper: {
      paddingHorizontal: 20,
    },
    listingCard: {
      marginBottom: 0,
    },
    separator: {
      height: 16,
    },
    errorCard: {
      alignItems: 'center',
      marginHorizontal: 20,
    },
    errorIcon: {
      marginBottom: 16,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 14,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    retryButton: {
      width: '100%',
    },
    emptyCard: {
      alignItems: 'center',
      marginHorizontal: 20,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
  })

export default memo(VirtualizedListingsList)

const styles = StyleSheet.create({
  listingWrapper: {
    paddingHorizontal: 20,
  },
  listingCard: {
    marginBottom: 0,
  },
  separator: {
    height: 16,
  },
})
