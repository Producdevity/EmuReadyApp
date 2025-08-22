import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect } from 'react'
import { Platform, StyleSheet, View, type ViewProps } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { AnimatedPressable, MICRO_SPRING_CONFIG } from '@/components/ui/MicroInteractions'
import { useTheme } from '@/contexts/ThemeContext'
import { useThemeColor } from '@/hooks/useThemeColor'

export type ThemedViewProps = ViewProps & {
  lightColor?: string
  darkColor?: string
  variant?: 'default' | 'glass' | 'gradient' | 'floating' | 'magnetic' | 'holographic' | 'neon'
  animated?: boolean
  interactive?: boolean
  onPress?: () => void
  intensity?: number
  blurIntensity?: number
  glowColor?: string
  borderRadius?: number
  elevation?: number
  morphing?: boolean
  pulsing?: boolean
  hoverable?: boolean
  customGradient?: string[]
  borderGlow?: boolean
  particleEffect?: boolean
  delay?: number
}

const AnimatedView = Animated.createAnimatedComponent(View)
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  animated = false,
  interactive = false,
  onPress,
  intensity = 1,
  blurIntensity = 20,
  glowColor,
  borderRadius = 0,
  elevation = 0,
  morphing = false,
  pulsing = false,
  hoverable = false,
  customGradient,
  borderGlow = false,
  particleEffect: _particleEffect = false,
  delay = 0,
  children,
  ...otherProps
}: ThemedViewProps) {
  const { theme } = useTheme()
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background')

  // Animation values
  const scale = useSharedValue(1)
  const opacity = useSharedValue(animated ? 0 : 1)
  const translateY = useSharedValue(animated ? 20 : 0)
  const glowOpacity = useSharedValue(0)
  const morphValue = useSharedValue(0)
  const pulseScale = useSharedValue(1)
  const borderGlowOpacity = useSharedValue(0)
  const hoverScale = useSharedValue(1)
  const elevationValue = useSharedValue(elevation)

  // Get gradient colors based on variant
  const getGradientColors = () => {
    if (customGradient) return customGradient

    switch (variant) {
      case 'glass':
        return theme.isDark
          ? [theme.colors.glass, `${theme.colors.glass}CC`, `${theme.colors.glass}33`]
          : [`${theme.colors.overlay}0D`, `${theme.colors.overlay}05`, `${theme.colors.overlay}03`]
      case 'gradient':
        return theme.colors.gradients.primary
      case 'holographic':
        return [theme.colors.primary, theme.colors.primaryLight, theme.colors.accent, theme.colors.error]
      case 'neon':
        return theme.isDark
          ? [theme.colors.primary, theme.colors.accent, theme.colors.primaryLight]
          : [theme.colors.primaryLight, theme.colors.primary, theme.colors.accent]
      default:
        return [backgroundColor, backgroundColor]
    }
  }

  const gradientColors = getGradientColors() as readonly [string, string, ...string[]]

  // Initialize animations
  useEffect(() => {
    if (animated) {
      opacity.value = withTiming(1, { duration: 600 + delay })
      translateY.value = withDelay(delay, withSpring(0, MICRO_SPRING_CONFIG.smooth))

      if (variant === 'floating') {
        translateY.value = withRepeat(
          withSequence(withTiming(-5, { duration: 2000 }), withTiming(5, { duration: 2000 })),
          -1,
          true,
        )
      }
    }

    if (morphing) {
      morphValue.value = withRepeat(
        withSequence(withTiming(1, { duration: 3000 }), withTiming(0, { duration: 3000 })),
        -1,
        true,
      )

      // Rotation disabled - looks unprofessional
      // rotateZ.value = withRepeat(
      //   withSequence(withTiming(2, { duration: 6000 }), withTiming(-2, { duration: 6000 })),
      //   -1,
      //   true,
      // )
    }

    // Pulsing disabled - looks unprofessional
    // if (pulsing) {
    //   pulseScale.value = withRepeat(
    //     withSequence(
    //       withTiming(1.02 * intensity, { duration: 1500 }),
    //       withTiming(1, { duration: 1500 }),
    //     ),
    //     -1,
    //     true,
    //   )

    //   glowOpacity.value = withRepeat(
    //     withSequence(withTiming(0.8, { duration: 1500 }), withTiming(0.3, { duration: 1500 })),
    //     -1,
    //     true,
    //   )
    // }

    if (borderGlow) {
      borderGlowOpacity.value = withRepeat(
        withSequence(withTiming(1, { duration: 2000 }), withTiming(0.4, { duration: 2000 })),
        -1,
        true,
      )
    }
  }, [animated, borderGlow, borderGlowOpacity, delay, glowOpacity, intensity, morphValue, morphing, opacity, pulseScale, pulsing, translateY, variant])

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    const scaleValue = morphing
      ? interpolate(morphValue.value, [0, 1], [1, 1.01 * intensity], Extrapolation.CLAMP)
      : scale.value * pulseScale.value * hoverScale.value

    return {
      opacity: opacity.value,
      transform: [
        { scale: scaleValue },
        { translateY: translateY.value },
      ],
      shadowOpacity: pulsing
        ? interpolate(glowOpacity.value, [0, 1], [0.1, 0.4], Extrapolation.CLAMP)
        : 0.1,
      shadowRadius: pulsing
        ? interpolate(glowOpacity.value, [0, 1], [4, 20], Extrapolation.CLAMP)
        : 8,
      elevation: elevationValue.value,
    }
  })

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  const borderGlowStyle = useAnimatedStyle(() => ({
    opacity: borderGlowOpacity.value,
  }))

  const handlePress = () => {
    if (interactive && onPress) {
      scale.value = withSequence(
        withSpring(0.98, MICRO_SPRING_CONFIG.instant),
        withSpring(1, MICRO_SPRING_CONFIG.bouncy),
      )
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
      onPress()
    }
  }

  const handleHoverIn = () => {
    'worklet'
    if (hoverable) {
      hoverScale.value = withSpring(1.02, MICRO_SPRING_CONFIG.smooth)
      elevationValue.value = withSpring(elevation + 4, MICRO_SPRING_CONFIG.smooth)
    }
  }

  const handleHoverOut = () => {
    'worklet'
    if (hoverable) {
      hoverScale.value = withSpring(1, MICRO_SPRING_CONFIG.smooth)
      elevationValue.value = withSpring(elevation, MICRO_SPRING_CONFIG.smooth)
    }
  }

  // Get container style based on variant
  const getContainerStyle = () => {
    const baseStyle = {
      borderRadius,
      overflow: 'hidden' as const,
    }

    switch (variant) {
      case 'glass':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        }
      case 'neon':
        return {
          ...baseStyle,
          borderWidth: 2,
          borderColor: glowColor || theme.colors.primary,
          shadowColor: glowColor || theme.colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 15,
        }
      case 'holographic':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: `${theme.colors.borderLight}33`, // 20% opacity
        }
      default:
        return {
          ...baseStyle,
          backgroundColor,
        }
    }
  }

  const containerStyle = getContainerStyle()

  // Render content based on variant
  const renderContent = () => {
    const content = (
      <AnimatedView
        style={[
          containerStyle,
          style,
          animatedStyle,
          Platform.OS === 'ios' && pulsing && glowStyle,
        ]}
        {...otherProps}
      >
        {children}
      </AnimatedView>
    )

    if (variant === 'glass') {
      return (
        <AnimatedView style={[containerStyle, style, animatedStyle]}>
          <AnimatedBlurView
            intensity={blurIntensity}
            tint={theme.isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFillObject}
          />

          <LinearGradient
            colors={gradientColors}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {borderGlow && (
            <Animated.View style={[styles.borderGlow, borderGlowStyle]}>
              <LinearGradient
                colors={['transparent', glowColor || theme.colors.primary, 'transparent']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          )}

          <View style={styles.contentContainer}>{children}</View>
        </AnimatedView>
      )
    }

    if (variant === 'gradient' || variant === 'holographic') {
      return (
        <AnimatedView style={[containerStyle, style, animatedStyle]}>
          <LinearGradient
            colors={gradientColors}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {variant === 'holographic' && (
            <LinearGradient
              colors={[`${theme.colors.glass}1A`, 'transparent', `${theme.colors.glass}1A`]}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          )}

          <View style={styles.contentContainer}>{children}</View>
        </AnimatedView>
      )
    }

    if (variant === 'magnetic') {
      return (
        <AnimatedView
          style={[containerStyle, style, animatedStyle]}
          onTouchStart={handleHoverIn}
          onTouchEnd={handleHoverOut}
          onTouchCancel={handleHoverOut}
        >
          {children}
        </AnimatedView>
      )
    }

    return content
  }

  if (interactive) {
    return <AnimatedPressable onPress={handlePress}>{renderContent()}</AnimatedPressable>
  }

  if (hoverable) {
    return (
      <AnimatedView
        onTouchStart={handleHoverIn}
        onTouchEnd={handleHoverOut}
        onTouchCancel={handleHoverOut}
      >
        {renderContent()}
      </AnimatedView>
    )
  }

  return renderContent()
}

const styles = StyleSheet.create({
  contentContainer: {
    position: 'relative',
    zIndex: 1,
  },
  borderGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 'inherit',
  },
})

// Enhanced view components with 2025 design patterns
export const GlassView = ({ children, ...props }: Omit<ThemedViewProps, 'variant'>) => (
  <ThemedView variant="glass" animated borderRadius={16} blurIntensity={25} {...props}>
    {children}
  </ThemedView>
)

export const FloatingView = ({ children, ...props }: Omit<ThemedViewProps, 'variant'>) => (
  <ThemedView variant="floating" animated elevation={8} borderRadius={12} {...props}>
    {children}
  </ThemedView>
)

export const HolographicView = ({ children, ...props }: Omit<ThemedViewProps, 'variant'>) => (
  <ThemedView variant="holographic" animated morphing borderRadius={20} {...props}>
    {children}
  </ThemedView>
)

export const NeonView = ({ children, ...props }: Omit<ThemedViewProps, 'variant'>) => (
  <ThemedView variant="neon" pulsing borderGlow borderRadius={12} {...props}>
    {children}
  </ThemedView>
)

export const MagneticView = ({ children, ...props }: Omit<ThemedViewProps, 'variant'>) => (
  <ThemedView variant="magnetic" hoverable animated borderRadius={16} elevation={4} {...props}>
    {children}
  </ThemedView>
)

export const InteractiveView = ({
  children,
  onPress,
  ...props
}: Omit<ThemedViewProps, 'interactive'>) => (
  <ThemedView interactive onPress={onPress} animated elevation={2} borderRadius={12} {...props}>
    {children}
  </ThemedView>
)

export const PulsingView = ({ children, ...props }: Omit<ThemedViewProps, 'pulsing'>) => (
  <ThemedView pulsing animated borderRadius={16} {...props}>
    {children}
  </ThemedView>
)
