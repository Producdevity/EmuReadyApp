import React, { useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '@/contexts/ThemeContext'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface MorphingSkeletonProps {
  width?: number | string
  height?: number | string
  borderRadius?: number
  style?: any
  variant?: 'default' | 'wave' | 'pulse' | 'shimmer' | 'breathe' | 'morph'
  speed?: 'slow' | 'normal' | 'fast'
  direction?: 'horizontal' | 'vertical' | 'diagonal'
  intensity?: number
  colors?: string[]
  morphShapes?: ('rectangle' | 'circle' | 'rounded')[]
  animated?: boolean
}

export default function MorphingSkeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  variant = 'shimmer',
  speed = 'normal',
  direction = 'horizontal',
  intensity = 1,
  colors,
  morphShapes = ['rectangle', 'rounded'],
  animated = true,
}: MorphingSkeletonProps) {
  const { theme } = useTheme()

  // Animation values
  const animationValue = useSharedValue(0)
  const morphValue = useSharedValue(0)
  const scaleValue = useSharedValue(1)
  const opacityValue = useSharedValue(0.7)

  // Speed configuration
  const speedConfig = {
    slow: 2000,
    normal: 1200,
    fast: 800,
  }

  // Default colors based on theme
  const defaultColors = colors || [
    theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(91, 33, 182, 0.05)',
    theme.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(91, 33, 182, 0.12)',
    theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(91, 33, 182, 0.08)',
  ]

  // Enhanced shimmer colors with more stops
  const shimmerColors = [
    defaultColors[0],
    defaultColors[1],
    defaultColors[2],
    defaultColors[1],
    defaultColors[0],
  ]

  useEffect(() => {
    if (!animated) return

    const duration = speedConfig[speed]

    // Main animation loop
    animationValue.value = withRepeat(
      withTiming(1, { duration }),
      -1,
      false
    )

    // Morphing animation (for shape changes)
    if (variant === 'morph' && morphShapes.length > 1) {
      morphValue.value = withRepeat(
        withSequence(
          withTiming(1, { duration: duration * 2 }),
          withTiming(0, { duration: duration * 2 })
        ),
        -1,
        false
      )
    }

    // Breathing effect
    if (variant === 'breathe') {
      scaleValue.value = withRepeat(
        withSequence(
          withTiming(1.02 * intensity, { duration: duration / 2 }),
          withTiming(1, { duration: duration / 2 })
        ),
        -1,
        false
      )
    }

    // Pulse effect
    if (variant === 'pulse') {
      opacityValue.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: duration / 2 }),
          withTiming(0.8, { duration: duration / 2 })
        ),
        -1,
        false
      )
    }
  }, [animated, speed, variant, intensity, morphShapes.length])

  // Shimmer animation style
  const shimmerStyle = useAnimatedStyle(() => {
    if (variant !== 'shimmer' && variant !== 'wave') return {}

    let translateX = 0
    let translateY = 0

    switch (direction) {
      case 'horizontal':
        translateX = interpolate(
          animationValue.value,
          [0, 1],
          [-SCREEN_WIDTH, SCREEN_WIDTH],
          Extrapolation.CLAMP
        )
        break
      case 'vertical':
        translateY = interpolate(
          animationValue.value,
          [0, 1],
          [-200, 200],
          Extrapolation.CLAMP
        )
        break
      case 'diagonal':
        translateX = interpolate(
          animationValue.value,
          [0, 1],
          [-SCREEN_WIDTH * 0.7, SCREEN_WIDTH * 0.7],
          Extrapolation.CLAMP
        )
        translateY = interpolate(
          animationValue.value,
          [0, 1],
          [-100, 100],
          Extrapolation.CLAMP
        )
        break
    }

    return {
      transform: [{ translateX }, { translateY }],
    }
  })

  // Wave animation style
  const waveStyle = useAnimatedStyle(() => {
    if (variant !== 'wave') return {}

    const waveOffset = interpolate(
      animationValue.value,
      [0, 1],
      [0, Math.PI * 2],
      Extrapolation.CLAMP
    )

    const scale = 1 + Math.sin(waveOffset) * 0.1 * intensity

    return {
      transform: [{ scaleY: scale }],
    }
  })

  // Morphing style
  const morphStyle = useAnimatedStyle(() => {
    if (variant !== 'morph' || morphShapes.length <= 1) return {}

    const currentRadius = interpolate(
      morphValue.value,
      [0, 1],
      [borderRadius, typeof height === 'number' ? height / 2 : 20],
      Extrapolation.CLAMP
    )

    return {
      borderRadius: currentRadius,
    }
  })

  // Breathing style
  const breatheStyle = useAnimatedStyle(() => {
    if (variant !== 'breathe') return {}

    return {
      transform: [{ scale: scaleValue.value }],
    }
  })

  // Pulse style
  const pulseStyle = useAnimatedStyle(() => {
    if (variant !== 'pulse') return {}

    return {
      opacity: opacityValue.value,
    }
  })

  // Combined container style
  const containerStyle = useAnimatedStyle(() => ({
    opacity: variant === 'pulse' ? opacityValue.value : 0.7,
  }))

  // Get gradient configuration based on variant
  const getGradientConfig = () => {
    switch (variant) {
      case 'wave':
        return {
          colors: shimmerColors,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.3, 0.5, 0.7, 1],
        }
      case 'shimmer':
        return {
          colors: shimmerColors,
          start: direction === 'vertical' ? { x: 0, y: 0 } : { x: 0, y: 0 },
          end: direction === 'vertical' ? { x: 0, y: 1 } : { x: 1, y: 0 },
          locations: [0, 0.25, 0.5, 0.75, 1],
        }
      default:
        return {
          colors: defaultColors,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        }
    }
  }

  const gradientConfig = getGradientConfig()

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
        },
        style,
        containerStyle,
        morphStyle,
        breatheStyle,
        pulseStyle,
      ]}
    >
      {/* Base gradient */}
      <LinearGradient
        colors={gradientConfig.colors}
        style={StyleSheet.absoluteFillObject}
        start={gradientConfig.start}
        end={gradientConfig.end}
        locations={gradientConfig.locations}
      />

      {/* Animated shimmer overlay */}
      {(variant === 'shimmer' || variant === 'wave') && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              width: variant === 'shimmer' ? SCREEN_WIDTH * 2 : '100%',
              height: variant === 'wave' ? '200%' : '100%',
            },
            shimmerStyle,
            waveStyle,
          ]}
        >
          <LinearGradient
            colors={
              variant === 'wave'
                ? ['transparent', 'rgba(255,255,255,0.4)', 'transparent']
                : ['transparent', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)', 'transparent']
            }
            style={StyleSheet.absoluteFillObject}
            start={gradientConfig.start}
            end={gradientConfig.end}
            locations={variant === 'wave' ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1]}
          />
        </Animated.View>
      )}
    </Animated.View>
  )
}

// Predefined skeleton components with enhanced animations
export const ShimmerSkeleton = ({ children, ...props }: Omit<MorphingSkeletonProps, 'variant'> & { children?: React.ReactNode }) => (
  <MorphingSkeleton variant="shimmer" speed="normal" direction="horizontal" {...props} />
)

export const WaveSkeleton = ({ children, ...props }: Omit<MorphingSkeletonProps, 'variant'> & { children?: React.ReactNode }) => (
  <MorphingSkeleton variant="wave" speed="fast" intensity={1.5} {...props} />
)

export const PulseSkeleton = ({ children, ...props }: Omit<MorphingSkeletonProps, 'variant'> & { children?: React.ReactNode }) => (
  <MorphingSkeleton variant="pulse" speed="slow" {...props} />
)

export const BreatheSkeleton = ({ children, ...props }: Omit<MorphingSkeletonProps, 'variant'> & { children?: React.ReactNode }) => (
  <MorphingSkeleton variant="breathe" speed="slow" intensity={1.2} {...props} />
)

export const MorphSkeleton = ({ children, ...props }: Omit<MorphingSkeletonProps, 'variant'> & { children?: React.ReactNode }) => (
  <MorphingSkeleton 
    variant="morph" 
    speed="normal" 
    morphShapes={['rectangle', 'rounded', 'circle']} 
    {...props} 
  />
)

// Enhanced loading card components
interface SkeletonCardProps {
  variant?: 'listing' | 'game' | 'profile' | 'stats'
  animated?: boolean
  style?: any
}

export const EnhancedSkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'listing',
  animated = true,
  style,
}) => {
  const { theme } = useTheme()

  const cardVariants = {
    listing: (
      <View style={[styles.listingCard, { backgroundColor: theme.colors.card }, style]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <ShimmerSkeleton height={18} width="80%" style={{ marginBottom: 8 }} animated={animated} />
            <ShimmerSkeleton height={14} width="60%" animated={animated} />
          </View>
          <WaveSkeleton height={32} width={80} borderRadius={16} animated={animated} />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <PulseSkeleton height={14} width="70%" style={{ marginBottom: 6 }} animated={animated} />
          <PulseSkeleton height={14} width="85%" animated={animated} />
        </View>

        {/* Stats */}
        <View style={styles.cardStats}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.statItem}>
              <BreatheSkeleton height={20} width={40} style={{ marginBottom: 4 }} animated={animated} />
              <ShimmerSkeleton height={12} width={50} animated={animated} />
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={{ flex: 1 }}>
            <ShimmerSkeleton height={12} width="50%" style={{ marginBottom: 4 }} animated={animated} />
            <ShimmerSkeleton height={12} width="40%" animated={animated} />
          </View>
          <View style={styles.voteButtons}>
            <MorphSkeleton height={32} width={60} borderRadius={8} style={{ marginRight: 8 }} animated={animated} />
            <MorphSkeleton height={32} width={60} borderRadius={8} animated={animated} />
          </View>
        </View>
      </View>
    ),
    game: (
      <View style={[styles.gameCard, { backgroundColor: theme.colors.card }, style]}>
        <WaveSkeleton height={120} borderRadius={8} style={{ marginBottom: 8 }} animated={animated} />
        <ShimmerSkeleton height={16} width="90%" style={{ marginBottom: 4 }} animated={animated} />
        <PulseSkeleton height={12} width="70%" animated={animated} />
      </View>
    ),
    profile: (
      <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }, style]}>
        <BreatheSkeleton 
          height={100} 
          width={100} 
          borderRadius={50} 
          style={{ marginBottom: 16, alignSelf: 'center' }} 
          animated={animated} 
        />
        <ShimmerSkeleton height={24} width="60%" style={{ marginBottom: 8, alignSelf: 'center' }} animated={animated} />
        <PulseSkeleton height={16} width="40%" style={{ marginBottom: 16, alignSelf: 'center' }} animated={animated} />
        
        <View style={styles.profileStats}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.profileStat}>
              <WaveSkeleton height={20} width={30} style={{ marginBottom: 4 }} animated={animated} />
              <ShimmerSkeleton height={12} width={50} animated={animated} />
            </View>
          ))}
        </View>
      </View>
    ),
    stats: (
      <View style={[styles.statsCard, { backgroundColor: theme.colors.card }, style]}>
        <View style={styles.statsHeader}>
          <ShimmerSkeleton height={20} width="40%" animated={animated} />
        </View>
        <View style={styles.statsGrid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.statBox}>
              <BreatheSkeleton 
                height={40} 
                width={40} 
                borderRadius={20} 
                style={{ marginBottom: 8, alignSelf: 'center' }} 
                animated={animated} 
              />
              <WaveSkeleton height={16} width="80%" style={{ marginBottom: 4, alignSelf: 'center' }} animated={animated} />
              <PulseSkeleton height={12} width="60%" style={{ alignSelf: 'center' }} animated={animated} />
            </View>
          ))}
        </View>
      </View>
    ),
  }

  return cardVariants[variant]
}

const styles = StyleSheet.create({
  listingCard: {
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
  gameCard: {
    padding: 12,
    borderRadius: 12,
    width: 140,
    marginRight: 16,
  },
  profileCard: {
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
  statsCard: {
    padding: 16,
    borderRadius: 12,
  },
  statsHeader: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: 100,
    padding: 12,
    alignItems: 'center',
  },
})