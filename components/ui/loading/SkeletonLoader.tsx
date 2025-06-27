import React, { useEffect, useRef } from 'react'
import {
  Animated,
  StyleSheet,
  View,
  type DimensionValue,
  type ViewStyle,
} from 'react-native'

interface SkeletonLoaderProps {
  width?: DimensionValue
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

export function SkeletonLoader(props: SkeletonLoaderProps) {
  const borderRadius = props.borderRadius ?? 4
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    )

    animation.start()

    return () => animation.stop()
  }, [animatedValue])

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e5e7eb', '#f3f4f6'],
  })

  return (
    <View style={[{ width: props.width ?? '100%' }, props.style]}>
      <Animated.View
        style={[
          styles.skeleton,
          {
            height: props.height ?? 20,
            borderRadius,
            backgroundColor,
          },
        ]}
      />
    </View>
  )
}

// Predefined skeleton components for common use cases
export function SkeletonText(props: { lines?: number; style?: ViewStyle }) {
  const lines = props.lines ?? 1
  return (
    <View style={[styles.textContainer, props.style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          height={16}
          width={index === lines - 1 ? '80%' : '100%'}
          style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
        />
      ))}
    </View>
  )
}

export function SkeletonCard(props: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, props.style]}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width="60%" height={20} />
        <SkeletonLoader width={60} height={24} borderRadius={12} />
      </View>

      <SkeletonText lines={2} style={{ marginBottom: 12 }} />

      <View style={styles.cardFooter}>
        <SkeletonLoader width="40%" height={14} />
        <View style={styles.cardActions}>
          <SkeletonLoader width={40} height={28} borderRadius={14} />
          <SkeletonLoader width={40} height={28} borderRadius={14} />
        </View>
      </View>
    </View>
  )
}

export function SkeletonListingCard(props: { style?: ViewStyle }) {
  return (
    <View style={[styles.listingCard, props.style]}>
      <View style={styles.listingHeader}>
        <View style={styles.listingGameInfo}>
          <SkeletonLoader width="80%" height={18} style={{ marginBottom: 4 }} />
          <SkeletonLoader width="50%" height={14} />
        </View>
        <SkeletonLoader width={80} height={28} borderRadius={14} />
      </View>

      <View style={styles.listingDevice}>
        <SkeletonLoader width="45%" height={14} />
        <SkeletonLoader width="45%" height={14} />
      </View>

      <View style={styles.listingStats}>
        <View style={styles.statItem}>
          <SkeletonLoader width={30} height={16} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={50} height={12} />
        </View>
        <View style={styles.statItem}>
          <SkeletonLoader width={20} height={16} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={40} height={12} />
        </View>
        <View style={styles.statItem}>
          <SkeletonLoader width={15} height={16} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={45} height={12} />
        </View>
      </View>

      <View style={styles.listingFooter}>
        <View>
          <SkeletonLoader width="60%" height={14} style={{ marginBottom: 2 }} />
          <SkeletonLoader width="40%" height={12} />
        </View>
        <View style={styles.voteButtons}>
          <SkeletonLoader width={50} height={32} borderRadius={16} />
          <SkeletonLoader width={50} height={32} borderRadius={16} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e5e7eb',
  },
  textContainer: {
    // No specific styles needed
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  listingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listingGameInfo: {
    flex: 1,
    marginRight: 12,
  },
  listingDevice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteButtons: {
    flexDirection: 'row',
    gap: 8,
  },
})
