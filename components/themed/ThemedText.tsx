import React, { useEffect } from 'react'
import { StyleSheet, Text, type TextProps, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  interpolate,
  interpolateColor,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'

import { useThemeColor } from '@/hooks/useThemeColor'
import { useTheme } from '@/contexts/ThemeContext'
import { MICRO_SPRING_CONFIG, AnimatedPressable } from '@/components/ui/MicroInteractions'

export type ThemedTextProps = TextProps & {
  lightColor?: string
  darkColor?: string
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'hero' | 'caption' | 'gradient' | 'glow' | 'morphing'
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
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')
  
  // Animation values
  const scale = useSharedValue(1)
  const opacity = useSharedValue(animated ? 0 : 1)
  const translateY = useSharedValue(animated ? 20 : 0)
  const glowOpacity = useSharedValue(0)
  const morphValue = useSharedValue(0)
  const shimmerX = useSharedValue(-100)
  const rotateZ = useSharedValue(0)
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

  const gradientColors = getGradientColors()

  // Initialize animations
  useEffect(() => {
    if (animated) {
      const animationDelay = delay
      
      switch (variant) {
        case 'shimmer':
          opacity.value = withTiming(1, { duration: 300 })
          shimmerX.value = withRepeat(
            withTiming(200, { duration: 2000 }),
            -1,
            false
          )
          break
          
        case 'typewriter':
          opacity.value = 1
          typewriterProgress.value = withTiming(1, { duration: 2000 + animationDelay })
          break
          
        case 'fade':
          opacity.value = withTiming(1, { duration: 800 + animationDelay })
          break
          
        case 'scale':
          scale.value = withSpring(1, { ...MICRO_SPRING_CONFIG.bouncy, duration: 600 + animationDelay })
          opacity.value = withTiming(1, { duration: 400 + animationDelay })
          break
          
        case 'bounce':
          translateY.value = withSpring(0, { ...MICRO_SPRING_CONFIG.bouncy, duration: 800 + animationDelay })
          opacity.value = withTiming(1, { duration: 600 + animationDelay })
          break
          
        default:
          opacity.value = withTiming(1, { duration: 600 + animationDelay })
          translateY.value = withSpring(0, MICRO_SPRING_CONFIG.smooth)
      }
    }
    
    if (glow) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        true
      )
    }
    
    if (morphing) {
      morphValue.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0, { duration: 2000 })
        ),
        -1,
        true
      )
      
      rotateZ.value = withRepeat(
        withSequence(
          withTiming(2, { duration: 4000 }),
          withTiming(-2, { duration: 4000 })
        ),
        -1,
        true
      )
    }
  }, [animated, variant, delay, glow, morphing])

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
        { rotateZ: `${rotateZ.value}deg` }
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
    const textLength = typeof children === 'string' ? children.length : 0
    const visibleLength = Math.floor(typewriterProgress.value * textLength)
    
    return {
      width: `${(typewriterProgress.value * 100)}%`,
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
      type === 'link' ? styles.link : undefined,
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
        withSpring(1, MICRO_SPRING_CONFIG.bouncy)
      )
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
      onPress()
    }
  }

  // Glass effect wrapper
  const renderContent = () => {
    const content = (
      <AnimatedText
        style={[getTextStyle(), animatedStyle, glow && glowStyle]}
        {...rest}
      >
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
          <AnimatedText
            style={[getTextStyle(), animatedStyle]}
            {...rest}
          >
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
            theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
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
    return (
      <AnimatedPressable onPress={handlePress}>
        {renderContent()}
      </AnimatedPressable>
    )
  }

  return renderContent()
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  hero: {
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 48,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
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
  <ThemedText 
    type="hero" 
    gradient 
    animated 
    variant="scale" 
    glow 
    {...props}
  >
    {children}
  </ThemedText>
)

export const GradientTitle = ({ children, ...props }: Omit<ThemedTextProps, 'type' | 'gradient'>) => (
  <ThemedText 
    type="title" 
    gradient 
    animated 
    variant="shimmer" 
    {...props}
  >
    {children}
  </ThemedText>
)

export const TypewriterText = ({ children, ...props }: Omit<ThemedTextProps, 'variant'>) => (
  <ThemedText 
    animated 
    variant="typewriter" 
    {...props}
  >
    {children}
  </ThemedText>
)

export const GlowText = ({ children, ...props }: Omit<ThemedTextProps, 'glow'>) => (
  <ThemedText 
    glow 
    animated 
    variant="fade" 
    {...props}
  >
    {children}
  </ThemedText>
)

export const MorphingText = ({ children, ...props }: Omit<ThemedTextProps, 'morphing'>) => (
  <ThemedText 
    morphing 
    animated 
    gradient 
    {...props}
  >
    {children}
  </ThemedText>
)

export const GlassText = ({ children, ...props }: Omit<ThemedTextProps, 'glassEffect'>) => (
  <ThemedText 
    glassEffect 
    animated 
    variant="bounce" 
    {...props}
  >
    {children}
  </ThemedText>
)

export const InteractiveText = ({ children, onPress, ...props }: Omit<ThemedTextProps, 'pressable'>) => (
  <ThemedText 
    pressable 
    onPress={onPress} 
    animated 
    variant="scale" 
    {...props}
  >
    {children}
  </ThemedText>
)
