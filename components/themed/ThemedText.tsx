import MaskedView from '@react-native-masked-view/masked-view'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect } from 'react'
import { StyleSheet, Text, type TextProps, View } from 'react-native'
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
import { DESIGN_CONSTANTS } from '@/constants/design'
import { useTheme } from '@/contexts/ThemeContext'
import { useReducedMotion, useAnimationDuration } from '@/hooks/useReducedMotion'
import { useThemeColor } from '@/hooks/useThemeColor'

export type ThemedTextProps = TextProps & {
  lightColor?: string
  darkColor?: string
  type?:
    | 'default'
    | 'title'
    | 'defaultSemiBold'
    | 'subtitle'
    | 'link'
    | 'hero'
    | 'caption'
    | 'gradient'
    | 'glow'
    | 'morphing'
  animated?: boolean
  gradient?: boolean
  morphing?: boolean
  glow?: boolean
  glassEffect?: boolean
  pressable?: boolean
  onPress?: () => void
  variant?: 'normal' | 'shimmer' | 'typewriter' | 'fade' | 'scale' | 'bounce'
  delay?: number
  customColors?: string[]
  intensity?: number
}

const AnimatedText = Animated.createAnimatedComponent(Text)
const AnimatedMaskedView = Animated.createAnimatedComponent(MaskedView)

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  animated = false,
  gradient = false,
  morphing = false,
  glow = false,
  glassEffect = false,
  pressable = false,
  onPress,
  variant = 'normal',
  delay = 0,
  customColors,
  intensity = 1,
  children,
  ...rest
}: ThemedTextProps) {
  const { theme } = useTheme()
  const reduceMotion = useReducedMotion()
  const durations = useAnimationDuration()
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')

  // Animation values - respect reduced motion
  const scale = useSharedValue(1)
  const opacity = useSharedValue(animated && !reduceMotion ? 0 : 1)
  const translateY = useSharedValue(animated && !reduceMotion ? 20 : 0)
  const glowOpacity = useSharedValue(0)
  const morphValue = useSharedValue(0)
  const shimmerX = useSharedValue(-100)
  const typewriterProgress = useSharedValue(0)

  // Get gradient colors based on type or custom
  const getGradientColors = () => {
    if (customColors) return customColors

    switch (type) {
      case 'hero':
        return theme.colors.gradients.primary
      case 'title':
        return theme.colors.gradients.secondary
      case 'gradient':
        return theme.colors.gradients.gaming
      case 'glow':
        return [theme.colors.primary, theme.colors.primaryLight, theme.colors.accent]
      default:
        return [color, theme.colors.primary, color]
    }
  }

  const gradientColors = getGradientColors() as readonly [string, string, ...string[]]

  // Initialize animations - respect reduced motion
  useEffect(() => {
    if (animated && !reduceMotion) {
      const animationDelay = delay

      switch (variant) {
        case 'shimmer':
          opacity.value = withTiming(1, { duration: durations.short })
          shimmerX.value = withRepeat(withTiming(200, { duration: durations.long * 2 }), durations.infinite, false)
          break

        case 'typewriter':
          opacity.value = 1
          typewriterProgress.value = withTiming(1, { duration: durations.long + animationDelay })
          break

        case 'fade':
          opacity.value = withTiming(1, { duration: durations.medium + animationDelay })
          break

        case 'scale':
          scale.value = withDelay(animationDelay, withSpring(1, MICRO_SPRING_CONFIG.bouncy))
          opacity.value = withDelay(animationDelay, withTiming(1, { duration: durations.short }))
          break

        case 'bounce':
          translateY.value = withDelay(animationDelay, withSpring(0, MICRO_SPRING_CONFIG.bouncy))
          opacity.value = withDelay(animationDelay, withTiming(1, { duration: durations.medium }))
          break

        default:
          opacity.value = withTiming(1, { duration: durations.medium + animationDelay })
          translateY.value = withSpring(0, MICRO_SPRING_CONFIG.smooth)
      }
    }

    if (glow && !reduceMotion) {
      glowOpacity.value = withRepeat(
        withSequence(withTiming(0.8, { duration: durations.medium }), withTiming(0.3, { duration: durations.medium })),
        durations.infinite,
        true,
      )
    }

    if (morphing && !reduceMotion) {
      morphValue.value = withRepeat(
        withSequence(withTiming(1, { duration: durations.long }), withTiming(0, { duration: durations.long })),
        durations.infinite,
        true,
      )

      // Rotation disabled - looks unprofessional
      // rotateZ.value = withRepeat(
      //   withSequence(withTiming(2, { duration: 4000 }), withTiming(-2, { duration: 4000 })),
      //   -1,
      //   true,
      // )
    }
  }, [
    animated,
    delay,
    durations.infinite,
    durations.medium,
    durations.short,
    durations.long,
    glow,
    glowOpacity,
    morphValue,
    morphing,
    opacity,
    reduceMotion,
    scale,
    shimmerX,
    translateY,
    typewriterProgress,
    variant,
  ])

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    const scaleValue = morphing
      ? interpolate(morphValue.value, [0, 1], [1, 1.02 * intensity], Extrapolation.CLAMP)
      : scale.value

    return {
      opacity: opacity.value,
      transform: [
        { scale: scaleValue },
        { translateY: translateY.value },
      ],
    }
  })

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowOpacity: interpolate(glowOpacity.value, [0, 1], [0, 0.6], Extrapolation.CLAMP),
    shadowRadius: interpolate(glowOpacity.value, [0, 1], [0, 20], Extrapolation.CLAMP),
  }))

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }))

  const typewriterStyle = useAnimatedStyle(() => {
    return {
      width: `${typewriterProgress.value * 100}%`,
    }
  })

  // Get base text style
  const getTextStyle = () => {
    const baseStyles = [
      { color: gradient ? 'transparent' : color },
      type === 'default' ? styles.default : undefined,
      type === 'title' ? styles.title : undefined,
      type === 'hero' ? styles.hero : undefined,
      type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
      type === 'subtitle' ? styles.subtitle : undefined,
      type === 'caption' ? styles.caption : undefined,
      type === 'link' ? { ...styles.link, color: theme.colors.info } : undefined,
      style,
    ]

    if (glow) {
      baseStyles.push({
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        elevation: 10,
      })
    }

    return baseStyles
  }

  const handlePress = () => {
    if (pressable && onPress) {
      scale.value = withSequence(
        withSpring(0.95, MICRO_SPRING_CONFIG.instant),
        withSpring(1, MICRO_SPRING_CONFIG.bouncy),
      )
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
      onPress()
    }
  }

  // Glass effect wrapper
  const renderContent = () => {
    const content = (
      <AnimatedText style={[getTextStyle(), animatedStyle, glow && glowStyle]} {...rest}>
        {children}
      </AnimatedText>
    )

    if (gradient) {
      return (
        <AnimatedMaskedView
          style={animatedStyle}
          maskElement={
            <Text style={getTextStyle()} {...rest}>
              {children}
            </Text>
          }
        >
          <LinearGradient
            colors={gradientColors}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Shimmer overlay for gradient text */}
          {variant === 'shimmer' && (
            <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.6)', 'transparent']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          )}
        </AnimatedMaskedView>
      )
    }

    if (variant === 'typewriter') {
      return (
        <View style={styles.typewriterContainer}>
          <AnimatedText style={[getTextStyle(), animatedStyle]} {...rest}>
            {children}
          </AnimatedText>
          <Animated.View style={[styles.typewriterMask, typewriterStyle]} />
        </View>
      )
    }

    return content
  }

  // Glass effect container
  if (glassEffect) {
    return (
      <View style={styles.glassContainer}>
        <BlurView
          intensity={10}
          tint={theme.isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={[
            theme.isDark ? `${theme.colors.glass}1A` : `${theme.colors.overlay}0D`,
            theme.isDark ? `${theme.colors.glass}0D` : `${theme.colors.overlay}05`,
          ]}
          style={StyleSheet.absoluteFillObject}
        />
        {pressable ? (
          <AnimatedPressable onPress={handlePress} style={styles.pressableContainer}>
            {renderContent()}
          </AnimatedPressable>
        ) : (
          renderContent()
        )}
      </View>
    )
  }

  if (pressable) {
    return <AnimatedPressable onPress={handlePress}>{renderContent()}</AnimatedPressable>
  }

  return renderContent()
}

const styles = StyleSheet.create({
  default: {
    fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.base,
    lineHeight: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.base * DESIGN_CONSTANTS.TYPOGRAPHY.lineHeights.normal,
    fontWeight: '400',
  },
  defaultSemiBold: {
    fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.base,
    lineHeight: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.base * DESIGN_CONSTANTS.TYPOGRAPHY.lineHeights.normal,
    fontWeight: '600',
  },
  title: {
    fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes['3xl'],
    fontWeight: '700',
    lineHeight: DESIGN_CONSTANTS.TYPOGRAPHY.sizes['3xl'] * DESIGN_CONSTANTS.TYPOGRAPHY.lineHeights.tight,
    letterSpacing: -0.5,
  },
  hero: {
    fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes['4xl'],
    fontWeight: '800',
    lineHeight: DESIGN_CONSTANTS.TYPOGRAPHY.sizes['4xl'] * DESIGN_CONSTANTS.TYPOGRAPHY.lineHeights.tight,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.xl,
    fontWeight: '600',
    lineHeight: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.xl * DESIGN_CONSTANTS.TYPOGRAPHY.lineHeights.tight,
    letterSpacing: -0.2,
  },
  caption: {
    fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    lineHeight: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.xs * DESIGN_CONSTANTS.TYPOGRAPHY.lineHeights.tight,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontWeight: '500',
  },
  glassContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pressableContainer: {
    position: 'relative',
    zIndex: 1,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    left: 0,
  },
  typewriterContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  typewriterMask: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderRightWidth: 2,
    borderRightColor: 'rgba(124, 58, 237, 0.8)',
  },
})

// Enhanced text components with 2025 design patterns
export const HeroText = ({ children, ...props }: Omit<ThemedTextProps, 'type'>) => (
  <ThemedText type="hero" gradient animated variant="scale" glow {...props}>
    {children}
  </ThemedText>
)

export const GradientTitle = ({
  children,
  ...props
}: Omit<ThemedTextProps, 'type' | 'gradient'>) => (
  <ThemedText type="title" gradient animated variant="shimmer" {...props}>
    {children}
  </ThemedText>
)

export const TypewriterText = ({ children, ...props }: Omit<ThemedTextProps, 'variant'>) => (
  <ThemedText animated variant="typewriter" {...props}>
    {children}
  </ThemedText>
)

export const GlowText = ({ children, ...props }: Omit<ThemedTextProps, 'glow'>) => (
  <ThemedText glow animated variant="fade" {...props}>
    {children}
  </ThemedText>
)

export const MorphingText = ({ children, ...props }: Omit<ThemedTextProps, 'morphing'>) => (
  <ThemedText morphing animated gradient {...props}>
    {children}
  </ThemedText>
)

export const GlassText = ({ children, ...props }: Omit<ThemedTextProps, 'glassEffect'>) => (
  <ThemedText glassEffect animated variant="bounce" {...props}>
    {children}
  </ThemedText>
)

export const InteractiveText = ({
  children,
  onPress,
  ...props
}: Omit<ThemedTextProps, 'pressable'>) => (
  <ThemedText pressable onPress={onPress} animated variant="scale" {...props}>
    {children}
  </ThemedText>
)
