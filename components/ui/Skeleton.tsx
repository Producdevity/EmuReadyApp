import React from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '@/contexts/ThemeContext'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  borderRadius?: number
  style?: any
  children?: React.ReactNode
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  children,
}: SkeletonProps) {
  const { theme } = useTheme()
  const shimmerValue = useSharedValue(0)

  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }), 
        withTiming(0, { duration: 1000 })
      ),
      -1,
      false,
    )
  }, [shimmerValue])

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerValue.value, [0, 1], [-300, 300])
    const opacity = interpolate(shimmerValue.value, [0, 0.5, 1], [0.3, 0.8, 0.3])

    return {
      transform: [{ translateX }],
      opacity,
    }
  })

  const baseColor = theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(91, 33, 182, 0.06)'
  const highlightColor = theme.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(91, 33, 182, 0.12)'

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', highlightColor, highlightColor, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          locations={[0, 0.4, 0.6, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
      {children}
    </View>
  )
}

// Predefined skeleton components for common use cases
export function SkeletonText({ lines = 1, style }: { lines?: number; style?: any }) {
  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={16}
          width={index === lines - 1 ? '75%' : '100%'}
          style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
        />
      ))}
    </View>
  )
}

export function SkeletonCard({ style }: { style?: any }) {
  const { theme } = useTheme()

  return (
    <View style={[styles.cardContainer, { backgroundColor: theme.colors.card }, style]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Skeleton height={18} width="80%" style={{ marginBottom: 8 }} />
          <Skeleton height={14} width="60%" />
        </View>
        <Skeleton height={32} width={80} borderRadius={16} />
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Skeleton height={14} width="70%" style={{ marginBottom: 6 }} />
        <Skeleton height={14} width="85%" />
      </View>

      {/* Stats */}
      <View style={styles.cardStats}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.statItem}>
            <Skeleton height={20} width={40} style={{ marginBottom: 4 }} />
            <Skeleton height={12} width={50} />
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={{ flex: 1 }}>
          <Skeleton height={12} width="50%" style={{ marginBottom: 4 }} />
          <Skeleton height={12} width="40%" />
        </View>
        <View style={styles.voteButtons}>
          <Skeleton height={32} width={60} borderRadius={8} style={{ marginRight: 8 }} />
          <Skeleton height={32} width={60} borderRadius={8} />
        </View>
      </View>
    </View>
  )
}

export function SkeletonGameCard({ style }: { style?: any }) {
  const { theme } = useTheme()

  return (
    <View style={[styles.gameCardContainer, { backgroundColor: theme.colors.card }, style]}>
      {/* Game Image */}
      <Skeleton height={100} borderRadius={8} style={{ marginBottom: 8 }} />

      {/* Game Title */}
      <Skeleton height={16} width="90%" style={{ marginBottom: 4 }} />

      {/* System Name */}
      <Skeleton height={12} width="70%" />
    </View>
  )
}

export function SkeletonProfile({ style }: { style?: any }) {
  const { theme } = useTheme()

  return (
    <View style={[styles.profileContainer, { backgroundColor: theme.colors.surface }, style]}>
      {/* Avatar */}
      <Skeleton
        height={100}
        width={100}
        borderRadius={50}
        style={{ marginBottom: 16, alignSelf: 'center' }}
      />

      {/* Name */}
      <Skeleton height={24} width="60%" style={{ marginBottom: 8, alignSelf: 'center' }} />

      {/* Username */}
      <Skeleton height={16} width="40%" style={{ marginBottom: 16, alignSelf: 'center' }} />

      {/* Stats */}
      <View style={styles.profileStats}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.profileStat}>
            <Skeleton height={20} width={30} style={{ marginBottom: 4 }} />
            <Skeleton height={12} width={50} />
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  cardContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardContent: {
    marginBottom: 12,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteButtons: {
    flexDirection: 'row',
  },
  gameCardContainer: {
    padding: 12,
    borderRadius: 12,
    width: 140,
    marginRight: 16,
  },
  profileContainer: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 12,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 32,
  },
  profileStat: {
    alignItems: 'center',
  },
})
