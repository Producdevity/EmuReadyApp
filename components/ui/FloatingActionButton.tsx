import { useTheme } from '@/contexts/ThemeContext'
import { DESIGN_CONSTANTS } from '@/constants/design'
import { useReducedMotion, useSpringConfig } from '@/hooks/useReducedMotion'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

interface FloatingAction {
  id: string
  icon: keyof typeof Ionicons.glyphMap
  label: string
  color?: string
  onPress: () => void
}

interface FloatingActionButtonProps {
  actions?: FloatingAction[]
  mainIcon?: keyof typeof Ionicons.glyphMap
  mainLabel?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'glass' | 'gradient' | 'neon' | 'minimal'
  expandDirection?: 'up' | 'down' | 'left' | 'right' | 'radial'
  autoHide?: boolean
  dragEnabled?: boolean
  magneticEffect?: boolean
  onMainPress?: () => void
  style?: any
  hapticFeedback?: boolean
  glowEffect?: boolean
  shadowIntensity?: number
}

export default function FloatingActionButton({
  actions = [],
  mainIcon = 'add',
  mainLabel: _mainLabel = 'Add',
  position = 'bottom-right',
  size = 'medium',
  variant = 'gradient',
  expandDirection = 'up',
  autoHide = false,
  dragEnabled = true,
  magneticEffect = true,
  onMainPress,
  style,
  hapticFeedback = true,
  glowEffect = true,
  shadowIntensity = 1,
}: FloatingActionButtonProps) {
  const { theme } = useTheme()
  const reduceMotion = useReducedMotion()
  const springConfig = useSpringConfig()
  const [isExpanded, setIsExpanded] = useState(false)
  const [_isDragging, setIsDragging] = useState(false)

  // Animation values
  const scale = useSharedValue(1)
  const rotation = useSharedValue(0)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(1)
  const glowOpacity = useSharedValue(0)
  const expandValue = useSharedValue(0)

  // Use design constants for size configuration
  const config = DESIGN_CONSTANTS.FAB.sizes[size]

  // Position styles
  const getPositionStyle = () => {
    const offset = 20
    switch (position) {
      case 'bottom-right':
        return { bottom: offset, right: offset }
      case 'bottom-left':
        return { bottom: offset, left: offset }
      case 'top-right':
        return { top: offset + 50, right: offset }
      case 'top-left':
        return { top: offset + 50, left: offset }
      case 'center':
        return {
          top: '50%',
          left: '50%',
          marginTop: -config.size / 2,
          marginLeft: -config.size / 2,
        }
      default:
        return { bottom: offset, right: offset }
    }
  }

  // Drag gesture
  const dragGesture = Gesture.Pan()
    .enabled(dragEnabled)
    .onStart(() => {
      'worklet'
      // Use runOnJS to update state from worklet
      runOnJS(setIsDragging)(true)
      scale.value = withSpring(1.1, springConfig.precise)

      if (hapticFeedback) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
      }
    })
    .onUpdate((event) => {
      'worklet'
      translateX.value = event.translationX
      translateY.value = event.translationY

      // Magnetic effect near edges
      if (magneticEffect) {
        const magnetStrength = DESIGN_CONSTANTS.FAB.animation.magneticThreshold

        if (Math.abs(event.absoluteX) < magnetStrength) {
          translateX.value = -event.absoluteX + magnetStrength
        } else if (Math.abs(event.absoluteX - DESIGN_CONSTANTS.SCREEN_WIDTH) < magnetStrength) {
          translateX.value = DESIGN_CONSTANTS.SCREEN_WIDTH - event.absoluteX - magnetStrength
        }
      }
    })
    .onEnd((event) => {
      'worklet'
      // Use runOnJS to update state from worklet
      runOnJS(setIsDragging)(false)

      // Snap to nearest edge or return to original position
      const threshold = 100
      if (Math.abs(event.translationX) > threshold || Math.abs(event.translationY) > threshold) {
        // Snap to edge logic could be implemented here
        translateX.value = withSpring(0, springConfig.gentle)
        translateY.value = withSpring(0, springConfig.gentle)
      } else {
        translateX.value = withSpring(0, springConfig.gentle)
        translateY.value = withSpring(0, springConfig.gentle)
      }

      scale.value = withSpring(1, springConfig.precise)
    })

  // Tap gesture
  const tapGesture = Gesture.Tap()
    .onStart(() => {
      'worklet'
      scale.value = withSpring(0.9, { damping: 15, stiffness: 400 })

      if (hapticFeedback) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
      }
    })
    .onEnd(() => {
      'worklet'
      scale.value = withSpring(1, { damping: 15, stiffness: 300 })

      if (actions.length > 0) {
        runOnJS(toggleExpansion)()
      } else if (onMainPress) {
        runOnJS(onMainPress)()
      }
    })

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(tapGesture, dragGesture)

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const closeExpansion = () => {
    setIsExpanded(false)
  }

  // Expansion animation
  useEffect(() => {
    expandValue.value = withSpring(isExpanded ? 1 : 0, {
      damping: 20,
      stiffness: 300,
    })

    rotation.value = withSpring(isExpanded ? 45 : 0, {
      damping: 20,
      stiffness: 300,
    })

    if (glowEffect) {
      glowOpacity.value = withTiming(isExpanded ? 0.6 : 0, { duration: 300 })
    }
  }, [expandValue, glowEffect, glowOpacity, isExpanded, rotation])

  // Auto-hide on scroll (simplified)
  useEffect(() => {
    if (autoHide) {
      // This would typically listen to scroll events
      // For now, we'll just implement basic show/hide
    }
  }, [autoHide])

  // Main button animation
  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
    shadowOpacity: interpolate(
      scale.value,
      [1, 1.1],
      [0.2 * shadowIntensity, 0.4 * shadowIntensity],
      Extrapolation.CLAMP,
    ),
    shadowRadius: interpolate(scale.value, [1, 1.1], [8, 16], Extrapolation.CLAMP),
  }))

  // Glow effect style
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(glowOpacity.value, [0, 1], [0.8, 1.3]) }],
  }))

  // Action items animation - Create individual animated styles for supported number of actions
  const actionItem0Style = useAnimatedStyle(() => {
    if (actions.length < 1) return {}
    const distance = DESIGN_CONSTANTS.FAB.animation.distance * 1
    let translateXOffset = 0
    let translateYOffset = 0

    switch (expandDirection) {
      case 'up': translateYOffset = -distance; break
      case 'down': translateYOffset = distance; break
      case 'left': translateXOffset = -distance; break
      case 'right': translateXOffset = distance; break
      case 'radial':
        const angle = (0 * (Math.PI * 2)) / actions.length
        translateXOffset = Math.cos(angle) * distance
        translateYOffset = Math.sin(angle) * distance
        break
    }

    const animatedScale = reduceMotion ? 1 : interpolate(expandValue.value, [0, 1], [0, 1], Extrapolation.CLAMP)
    const animatedOpacity = interpolate(expandValue.value, [0, 0.5, 1], [0, 0.5, 1], Extrapolation.CLAMP)

    return {
      transform: [
        { translateX: translateXOffset * expandValue.value },
        { translateY: translateYOffset * expandValue.value },
        { scale: animatedScale },
      ],
      opacity: animatedOpacity,
    }
  })

  const actionItem1Style = useAnimatedStyle(() => {
    if (actions.length < 2) return {}
    const distance = DESIGN_CONSTANTS.FAB.animation.distance * 2
    let translateXOffset = 0
    let translateYOffset = 0

    switch (expandDirection) {
      case 'up': translateYOffset = -distance; break
      case 'down': translateYOffset = distance; break
      case 'left': translateXOffset = -distance; break
      case 'right': translateXOffset = distance; break
      case 'radial':
        const angle = (1 * (Math.PI * 2)) / actions.length
        translateXOffset = Math.cos(angle) * distance
        translateYOffset = Math.sin(angle) * distance
        break
    }

    const animatedScale = reduceMotion ? 1 : interpolate(expandValue.value, [0, 1], [0, 1], Extrapolation.CLAMP)
    const animatedOpacity = interpolate(expandValue.value, [0, 0.5, 1], [0, 0.5, 1], Extrapolation.CLAMP)

    return {
      transform: [
        { translateX: translateXOffset * expandValue.value },
        { translateY: translateYOffset * expandValue.value },
        { scale: animatedScale },
      ],
      opacity: animatedOpacity,
    }
  })

  const actionItem2Style = useAnimatedStyle(() => {
    if (actions.length < 3) return {}
    const distance = DESIGN_CONSTANTS.FAB.animation.distance * 3
    let translateXOffset = 0
    let translateYOffset = 0

    switch (expandDirection) {
      case 'up': translateYOffset = -distance; break
      case 'down': translateYOffset = distance; break
      case 'left': translateXOffset = -distance; break
      case 'right': translateXOffset = distance; break
      case 'radial':
        const angle = (2 * (Math.PI * 2)) / actions.length
        translateXOffset = Math.cos(angle) * distance
        translateYOffset = Math.sin(angle) * distance
        break
    }

    const animatedScale = reduceMotion ? 1 : interpolate(expandValue.value, [0, 1], [0, 1], Extrapolation.CLAMP)
    const animatedOpacity = interpolate(expandValue.value, [0, 0.5, 1], [0, 0.5, 1], Extrapolation.CLAMP)

    return {
      transform: [
        { translateX: translateXOffset * expandValue.value },
        { translateY: translateYOffset * expandValue.value },
        { scale: animatedScale },
      ],
      opacity: animatedOpacity,
    }
  })

  // Array of action item styles (limit to 3 actions for now to avoid hooks violation)
  const actionItemStyles = [actionItem0Style, actionItem1Style, actionItem2Style]

  // Get variant styles
  const getVariantStyle = () => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: theme.colors.glass,
          borderWidth: 1,
          borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }
      case 'neon':
        return {
          backgroundColor: theme.isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
          borderWidth: 2,
          borderColor: theme.colors.primary,
        }
      case 'minimal':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }
      default:
        return {
          backgroundColor: 'transparent',
        }
    }
  }

  const variantStyle = getVariantStyle()

  return (
    <View style={[styles.container, getPositionStyle(), style]}>
      {/* Action Items */}
      {actions.map((action, index) => (
        <Animated.View
          key={action.id}
          style={[
            styles.actionItem,
            {
              width: config.size * 0.8,
              height: config.size * 0.8,
              borderRadius: config.size * 0.4,
            },
            actionItemStyles[index],
          ]}
        >
          <GestureDetector
            gesture={Gesture.Tap().onEnd(() => {
              'worklet'
              runOnJS(action.onPress)()
              runOnJS(closeExpansion)()
            })}
          >
            <Animated.View
              style={[
                styles.actionButton,
                {
                  backgroundColor: action.color || theme.colors.secondary,
                  width: config.size * 0.8,
                  height: config.size * 0.8,
                  borderRadius: config.size * 0.4,
                },
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityHint={`Activate ${action.label} action`}
            >
              <Ionicons name={action.icon} size={config.iconSize * 0.8} color="#ffffff" />
            </Animated.View>
          </GestureDetector>

          {/* Action Label */}
          <View style={styles.actionLabel}>
            <Text style={[styles.actionLabelText, { color: theme.colors.text }]}>
              {action.label}
            </Text>
          </View>
        </Animated.View>
      ))}

      {/* Main Button */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View>
          <Animated.View
            style={[
                styles.mainButton,
                {
                  width: config.size,
                  height: config.size,
                  borderRadius: config.size / 2,
                  ...variantStyle,
                  shadowColor: theme.colors.primary,
                },
                mainButtonStyle,
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isExpanded ? "Collapse actions menu" : "Open actions menu"}
              accessibilityHint="Double tap to toggle action items"
              accessibilityState={{ expanded: isExpanded }}
            >
              {/* Glow Effect */}
              {glowEffect && (
                <Animated.View
                  style={[
                    StyleSheet.absoluteFillObject,
                    {
                      borderRadius: config.size / 2,
                      backgroundColor: theme.colors.primary,
                      opacity: 0.3,
                    },
                    glowStyle,
                  ]}
                />
              )}

              {/* Glass Background */}
              {variant === 'glass' && (
                <BlurView
                  intensity={20}
                  tint={theme.isDark ? 'dark' : 'light'}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: config.size / 2 }]}
                />
              )}

              {/* Gradient Background */}
              {variant === 'gradient' && (
                <LinearGradient
                  colors={theme.colors.gradients.primary as [string, string, ...string[]]}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: config.size / 2 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              )}

              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name={mainIcon}
                  size={config.iconSize}
                  color={variant === 'minimal' ? theme.colors.primary : '#ffffff'}
                />
              </View>

              {/* Neon Effect */}
              {variant === 'neon' && (
                <Animated.View
                  style={[
                    StyleSheet.absoluteFillObject,
                    {
                      borderRadius: config.size / 2,
                      borderWidth: 2,
                      borderColor: theme.colors.primary,
                      shadowColor: theme.colors.primary,
                      shadowRadius: 10,
                      shadowOpacity: 0.5,
                    },
                    glowStyle,
                  ]}
                />
              )}
            </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  mainButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    position: 'relative',
    zIndex: 1,
  },
  actionItem: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 999,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionLabel: {
    position: 'absolute',
    top: '50%',
    right: '100%',
    marginTop: -10,
    marginRight: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionLabelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
})

// Predefined floating action button variants
export const GlassFloatingActionButton = ({
  ...props
}: Omit<FloatingActionButtonProps, 'variant'>) => (
  <FloatingActionButton variant="glass" glowEffect={true} {...props} />
)

export const NeonFloatingActionButton = ({
  ...props
}: Omit<FloatingActionButtonProps, 'variant'>) => (
  <FloatingActionButton variant="neon" glowEffect={true} shadowIntensity={2} {...props} />
)

export const MinimalFloatingActionButton = ({
  ...props
}: Omit<FloatingActionButtonProps, 'variant'>) => (
  <FloatingActionButton variant="minimal" glowEffect={false} {...props} />
)
