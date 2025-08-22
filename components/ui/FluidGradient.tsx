import { useTheme } from '@/contexts/ThemeContext'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

interface FluidGradientProps {
  children?: React.ReactNode
  variant?: 'aurora' | 'ocean' | 'sunset' | 'cosmic' | 'gaming' | 'brand' | 'dynamic'
  style?: any
  borderRadius?: number
  animated?: boolean
  speed?: 'slow' | 'normal' | 'fast'
  direction?: 'horizontal' | 'vertical' | 'diagonal' | 'radial'
  opacity?: number
  blendMode?: 'normal' | 'multiply' | 'overlay' | 'soft-light'
  customColors?: string[]
  onColorChange?: (colors: string[]) => void
}

export default function FluidGradient({
  children,
  variant = 'brand',
  style,
  borderRadius = 0,
  animated = true,
  speed = 'normal',
  direction = 'diagonal',
  opacity = 1,
  blendMode = 'normal',
  customColors,
  onColorChange,
}: FluidGradientProps) {
  const { theme } = useTheme()
  const animationValue = useSharedValue(0)
  const colorIndex = useSharedValue(0)
  const gradientRef = useRef<any>(null)

  // Gradient variants with multiple color sets for animation
  const getGradientVariants = () => {
    if (customColors) return { custom: [customColors] }

    return {
      aurora: [
        [theme.colors.info, theme.colors.primary, theme.colors.primaryLight],
        [theme.colors.primaryLight, theme.colors.accent, theme.colors.warning],
        [theme.colors.success, theme.colors.info, theme.colors.primaryLight],
        [theme.colors.warning, theme.colors.error, theme.colors.accent],
      ],
      ocean: [
        [theme.colors.info, theme.colors.secondary, theme.colors.primaryDark],
        [theme.colors.secondary, theme.colors.primaryDark, theme.colors.primary],
        [theme.colors.primaryDark, theme.colors.primary, theme.colors.primaryLight],
        [theme.colors.primary, theme.colors.primaryLight, theme.colors.info],
      ],
      sunset: [
        [theme.colors.warning, theme.colors.error, theme.colors.accent],
        [theme.colors.error, theme.colors.accent, theme.colors.primaryLight],
        [theme.colors.accent, theme.colors.primaryLight, theme.colors.primary],
        [theme.colors.primaryLight, theme.colors.primary, theme.colors.warning],
      ],
      cosmic: [
        [theme.colors.primaryDark, theme.colors.primary, theme.colors.primaryLight],
        [theme.colors.primary, theme.colors.primaryLight, theme.colors.accent],
        [theme.colors.primaryDark, theme.colors.primaryLight, theme.colors.accent],
        [theme.colors.primary, theme.colors.accent, theme.colors.secondary],
      ],
      gaming: [
        [theme.colors.success, theme.colors.info, theme.colors.accent],
        [theme.colors.accent, theme.colors.warning, theme.colors.primary],
        [theme.colors.primary, theme.colors.secondary, theme.colors.info],
        [theme.colors.info, theme.colors.secondary, theme.colors.success],
      ],
      brand: [
        theme.colors.gradients.primary,
        theme.colors.gradients.secondary,
        [...theme.colors.gradients.primary].reverse(),
        theme.colors.gradients.gaming,
      ],
      dynamic: [
        [theme.colors.primary, theme.colors.primaryLight, theme.colors.accent],
        [theme.colors.accent, theme.colors.error, theme.colors.info],
        [theme.colors.info, theme.colors.secondary, theme.colors.success],
        [theme.colors.success, theme.colors.secondary, theme.colors.primary],
      ],
    }
  }

  const gradientSets = getGradientVariants()
  const currentVariant = customColors ? 'custom' : variant
  const colorSets = gradientSets[currentVariant as keyof typeof gradientSets] || gradientSets.brand || [[theme.colors.primaryLight, theme.colors.primary, theme.colors.primaryDark]]

  useEffect(() => {
    if (animated && colorSets.length > 0) {
      // Speed configuration
      const speedConfig = {
        slow: 8000,
        normal: 5000,
        fast: 3000,
      }
      
      // Animate through different color sets
      animationValue.value = withRepeat(withTiming(1, { duration: speedConfig[speed] }), -1, false)

      // Change color sets periodically
      const colorAnimation = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(colorSets.length - 1, { duration: speedConfig[speed] * colorSets.length }),
        ),
        -1,
        false,
      )
      colorIndex.value = colorAnimation
    }
  }, [animated, speed, colorSets.length, animationValue, colorIndex])

  // Get start and end points based on direction
  const getGradientPoints = () => {
    switch (direction) {
      case 'horizontal':
        return { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } }
      case 'vertical':
        return { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } }
      case 'diagonal':
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }
      case 'radial':
        return { start: { x: 0.5, y: 0.5 }, end: { x: 1, y: 1 } }
      default:
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }
    }
  }

  const gradientPoints = getGradientPoints()

  // Animated colors
  const _animatedColors = useDerivedValue(() => {
    if (colorSets.length === 0) {
      return [theme.colors.primaryLight, theme.colors.primary, theme.colors.primaryDark]
    }
    
    const currentIndex = Math.floor(colorIndex.value)
    const nextIndex = (currentIndex + 1) % colorSets.length
    const progress = colorIndex.value - currentIndex

    const currentColors = colorSets[currentIndex] || colorSets[0]
    const nextColors = colorSets[nextIndex] || colorSets[0]

    if (!currentColors || !Array.isArray(currentColors)) {
      return [theme.colors.primaryLight, theme.colors.primary, theme.colors.primaryDark]
    }

    // Interpolate between color sets
    return currentColors.map((color, index) => {
      const nextColor = nextColors[index] || nextColors[0]
      // For now, return current color (proper color interpolation would need a color library)
      return progress > 0.5 ? nextColor : color
    })
  })

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) return { opacity }

    const scale = interpolate(animationValue.value, [0, 0.5, 1], [1, 1.02, 1], Extrapolation.CLAMP)

    const rotation = interpolate(animationValue.value, [0, 1], [0, 5], Extrapolation.CLAMP)

    return {
      transform: [{ scale }, { rotate: `${rotation}deg` }],
      opacity,
    }
  })

  // Get current colors (fallback for non-animated state)
  const getCurrentColors = () => {
    if (colorSets.length === 0) {
      return [theme.colors.primaryLight, theme.colors.primary, theme.colors.primaryDark]
    }
    if (!animated) {
      return colorSets[0] || ['#7c3aed', '#5b21b6', '#8b5cf6']
    }
    return colorSets[0] || ['#7c3aed', '#5b21b6', '#8b5cf6']
  }

  const currentColors = getCurrentColors()

  // Notify parent of color changes
  useEffect(() => {
    if (onColorChange && Array.isArray(currentColors)) {
      onColorChange([...currentColors])
    }
  }, [currentColors, onColorChange])

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      <LinearGradient
        ref={gradientRef}
        colors={currentColors as [string, string, ...string[]]}
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
        start={gradientPoints.start}
        end={gradientPoints.end}
        locations={direction === 'radial' ? [0, 0.6, 1] : undefined}
      />

      {/* Blend mode overlay for special effects */}
      {blendMode !== 'normal' && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: theme.isDark ? theme.colors.overlay : theme.colors.glass,
              borderRadius,
            },
          ]}
        />
      )}

      {/* Content container */}
      {children && <Animated.View style={styles.content}>{children}</Animated.View>}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
})

// Predefined fluid gradient variants
export const AuroraGradient = ({ children, ...props }: Omit<FluidGradientProps, 'variant'>) => (
  <FluidGradient variant="aurora" animated={true} speed="slow" {...props}>
    {children}
  </FluidGradient>
)

export const OceanGradient = ({ children, ...props }: Omit<FluidGradientProps, 'variant'>) => (
  <FluidGradient variant="ocean" animated={true} speed="normal" direction="horizontal" {...props}>
    {children}
  </FluidGradient>
)

export const SunsetGradient = ({ children, ...props }: Omit<FluidGradientProps, 'variant'>) => (
  <FluidGradient variant="sunset" animated={true} speed="fast" direction="vertical" {...props}>
    {children}
  </FluidGradient>
)

export const CosmicGradient = ({ children, ...props }: Omit<FluidGradientProps, 'variant'>) => (
  <FluidGradient variant="cosmic" animated={true} speed="slow" direction="radial" {...props}>
    {children}
  </FluidGradient>
)

export const GamingGradient = ({ children, ...props }: Omit<FluidGradientProps, 'variant'>) => (
  <FluidGradient variant="gaming" animated={true} speed="fast" {...props}>
    {children}
  </FluidGradient>
)

export const DynamicGradient = ({ children, ...props }: Omit<FluidGradientProps, 'variant'>) => (
  <FluidGradient variant="dynamic" animated={true} speed="normal" {...props}>
    {children}
  </FluidGradient>
)
