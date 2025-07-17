import { useTheme } from '@/contexts/ThemeContext'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback } from 'react'
import { Platform, StyleSheet } from 'react-native'
import { PanGestureHandler, TapGestureHandler } from 'react-native-gesture-handler'
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

interface MagneticCardProps {
  children: React.ReactNode
  onPress?: () => void
  onLongPress?: () => void
  style?: any
  magneticStrength?: number
  hoverElevation?: number
  borderRadius?: number
  variant?: 'default' | 'glass' | 'gradient' | 'neon' | 'holographic'
  shadowColor?: string
  shadowIntensity?: number
  hapticFeedback?: boolean
  disabled?: boolean
  pressScale?: number
  rotationEnabled?: boolean
  glowEffect?: boolean
  parallaxChildren?: boolean
}

export default function MagneticCard({
  children,
  onPress,
  onLongPress,
  style,
  magneticStrength = 0.3,
  hoverElevation = 8,
  borderRadius = 16,
  variant = 'default',
  shadowColor,
  shadowIntensity = 1,
  hapticFeedback = true,
  disabled = false,
  pressScale = 0.98,
  rotationEnabled = true,
  glowEffect = false,
  parallaxChildren = false,
}: MagneticCardProps) {
  const { theme } = useTheme()

  // Animation values
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const scale = useSharedValue(1)
  const elevation = useSharedValue(2)
  const rotateX = useSharedValue(0)
  const rotateY = useSharedValue(0)
  const glowOpacity = useSharedValue(0)
  const childrenParallax = useSharedValue(0)

  // Magnetic hover effect
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      if (disabled) return

      elevation.value = withSpring(hoverElevation, {
        damping: 20,
        stiffness: 300,
      })

      if (glowEffect) {
        glowOpacity.value = withTiming(0.6, { duration: 200 })
      }

      if (hapticFeedback) {
        runOnJS(Haptics.selectionAsync)()
      }
    },
    onActive: (event) => {
      if (disabled) return

      const { absoluteX, absoluteY } = event
      const cardCenterX = absoluteX
      const cardCenterY = absoluteY

      // Magnetic attraction effect
      translateX.value = withSpring((cardCenterX - 100) * magneticStrength * 0.1, {
        damping: 15,
        stiffness: 200,
      })
      translateY.value = withSpring((cardCenterY - 100) * magneticStrength * 0.1, {
        damping: 15,
        stiffness: 200,
      })

      // 3D rotation based on position
      if (rotationEnabled) {
        rotateX.value = withSpring((cardCenterY - 100) * magneticStrength * 0.05, {
          damping: 15,
          stiffness: 200,
        })
        rotateY.value = withSpring((cardCenterX - 100) * magneticStrength * 0.05, {
          damping: 15,
          stiffness: 200,
        })
      }

      // Parallax effect for children
      if (parallaxChildren) {
        childrenParallax.value = withSpring((cardCenterX - 100) * 0.02, {
          damping: 15,
          stiffness: 200,
        })
      }
    },
    onEnd: () => {
      if (disabled) return

      // Return to original position
      translateX.value = withSpring(0, { damping: 20, stiffness: 300 })
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 })
      elevation.value = withSpring(2, { damping: 20, stiffness: 300 })

      if (rotationEnabled) {
        rotateX.value = withSpring(0, { damping: 20, stiffness: 300 })
        rotateY.value = withSpring(0, { damping: 20, stiffness: 300 })
      }

      if (glowEffect) {
        glowOpacity.value = withTiming(0, { duration: 300 })
      }

      if (parallaxChildren) {
        childrenParallax.value = withSpring(0, { damping: 20, stiffness: 300 })
      }
    },
  })

  // Tap gesture for press effects
  const tapGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      if (disabled) return

      scale.value = withSpring(pressScale, {
        damping: 30,
        stiffness: 400,
      })

      if (hapticFeedback) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
      }
    },
    onEnd: () => {
      if (disabled) return

      scale.value = withSpring(1, {
        damping: 25,
        stiffness: 350,
      })

      if (onPress) {
        runOnJS(onPress)()
      }
    },
  })

  // Long press handler
  const handleLongPress = useCallback(() => {
    if (disabled || !onLongPress) return

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }

    onLongPress()
  }, [disabled, onLongPress, hapticFeedback])

  // Get variant-specific styling
  const getVariantStyle = () => {
    const baseStyle = {
      backgroundColor: theme.colors.card,
      shadowColor: shadowColor || theme.colors.shadow,
    }

    switch (variant) {
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.glass,
          borderWidth: 1,
          borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }
      case 'gradient':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        }
      case 'neon':
        return {
          ...baseStyle,
          backgroundColor: theme.isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        }
      case 'holographic':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: 'rgba(124, 58, 237, 0.3)',
        }
      default:
        return baseStyle
    }
  }

  const variantStyle = getVariantStyle()

  // Main container animation
  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      elevation.value,
      [2, hoverElevation],
      [0.1 * shadowIntensity, 0.25 * shadowIntensity],
      Extrapolation.CLAMP,
    )

    const shadowRadius = interpolate(
      elevation.value,
      [2, hoverElevation],
      [4, 20],
      Extrapolation.CLAMP,
    )

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { perspective: 1000 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
      ],
      shadowOpacity,
      shadowRadius,
      shadowOffset: {
        width: 0,
        height: elevation.value,
      },
      elevation: Platform.OS === 'android' ? elevation.value : 0,
    }
  })

  // Glow effect animation
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(glowOpacity.value, [0, 1], [0.8, 1.2]) }],
  }))

  // Children parallax animation
  const childrenStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: childrenParallax.value }],
  }))

  return (
    <TapGestureHandler onGestureEvent={tapGestureHandler} onActivated={handleLongPress}>
      <Animated.View>
        <PanGestureHandler onGestureEvent={panGestureHandler}>
          <Animated.View
            style={[
              styles.container,
              {
                borderRadius,
                ...variantStyle,
              },
              style,
              animatedStyle,
            ]}
          >
            {/* Glow effect */}
            {glowEffect && (
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    borderRadius,
                    backgroundColor: theme.colors.primary,
                    opacity: 0.3,
                  },
                  glowStyle,
                ]}
                pointerEvents="none"
              />
            )}

            {/* Glass morphism background */}
            {variant === 'glass' && (
              <BlurView
                intensity={20}
                tint={theme.isDark ? 'dark' : 'light'}
                style={[StyleSheet.absoluteFillObject, { borderRadius }]}
              />
            )}

            {/* Gradient background */}
            {variant === 'gradient' && (
              <LinearGradient
                colors={theme.colors.gradients.primary as [string, string, ...string[]]}
                style={[StyleSheet.absoluteFillObject, { borderRadius }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}

            {/* Holographic effect */}
            {variant === 'holographic' && (
              <LinearGradient
                colors={[
                  'rgba(124, 58, 237, 0.1)',
                  'rgba(168, 85, 247, 0.15)',
                  'rgba(79, 70, 229, 0.1)',
                ]}
                style={[StyleSheet.absoluteFillObject, { borderRadius }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}

            {/* Content */}
            <Animated.View style={[styles.content, parallaxChildren && childrenStyle]}>
              {children}
            </Animated.View>

            {/* Neon glow border */}
            {variant === 'neon' && (
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    borderRadius,
                    borderWidth: 2,
                    borderColor: theme.colors.primary,
                    shadowColor: theme.colors.primary,
                    shadowRadius: 10,
                    shadowOpacity: 0.5,
                  },
                  glowStyle,
                ]}
                pointerEvents="none"
              />
            )}
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </TapGestureHandler>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
})

// Predefined magnetic card variants
export const MagneticGlassCard = ({ children, ...props }: Omit<MagneticCardProps, 'variant'>) => (
  <MagneticCard variant="glass" glowEffect={true} {...props}>
    {children}
  </MagneticCard>
)

export const MagneticGradientCard = ({
  children,
  ...props
}: Omit<MagneticCardProps, 'variant'>) => (
  <MagneticCard variant="gradient" hoverElevation={12} {...props}>
    {children}
  </MagneticCard>
)

export const MagneticNeonCard = ({ children, ...props }: Omit<MagneticCardProps, 'variant'>) => (
  <MagneticCard variant="neon" glowEffect={true} shadowIntensity={2} {...props}>
    {children}
  </MagneticCard>
)

export const MagneticHolographicCard = ({
  children,
  ...props
}: Omit<MagneticCardProps, 'variant'>) => (
  <MagneticCard variant="holographic" rotationEnabled={true} parallaxChildren={true} {...props}>
    {children}
  </MagneticCard>
)
