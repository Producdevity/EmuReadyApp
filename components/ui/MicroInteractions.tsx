import * as Haptics from 'expo-haptics'
import React, { useCallback, useEffect } from 'react'
import type { AccessibilityRole } from 'react-native'
import { StyleSheet, View } from 'react-native'
import Animated, {
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

// Enhanced spring configuration for 2025 feel
export const MICRO_SPRING_CONFIG = {
  // Ultra-responsive springs for immediate feedback
  instant: {
    damping: 35,
    stiffness: 450,
    mass: 0.6,
  },
  // Snappy but controlled
  snappy: {
    damping: 30,
    stiffness: 400,
    mass: 0.7,
  },
  // Smooth and elegant
  smooth: {
    damping: 28,
    stiffness: 350,
    mass: 0.8,
  },
  // Bouncy and playful
  bouncy: {
    damping: 22,
    stiffness: 300,
    mass: 0.9,
  },
  // Gentle and fluid
  gentle: {
    damping: 40,
    stiffness: 250,
    mass: 1.0,
  },
}

// Micro-interaction hooks
export const usePressAnimation = (
  config: {
    scale?: number
    haptic?: boolean
    springConfig?: keyof typeof MICRO_SPRING_CONFIG
    onPress?: () => void
    disabled?: boolean
  } = {},
) => {
  const { scale = 0.97, haptic = true, springConfig = 'snappy', onPress, disabled = false } = config

  const scaleValue = useSharedValue(1)
  const opacityValue = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacityValue.value,
  }))

  const handlePressIn = () => {
    'worklet'
    if (disabled) return

    cancelAnimation(scaleValue)
    cancelAnimation(opacityValue)

    scaleValue.value = withSpring(scale, MICRO_SPRING_CONFIG[springConfig])
    opacityValue.value = withTiming(0.9, { duration: 50 })

    if (haptic) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const handlePressOut = () => {
    'worklet'
    if (disabled) return

    scaleValue.value = withSpring(1, MICRO_SPRING_CONFIG[springConfig])
    opacityValue.value = withTiming(1, { duration: 100 })

    if (onPress) {
      runOnJS(onPress)()
    }
  }

  return {
    animatedStyle,
    handlers: {
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
    },
  }
}

export const useHoverAnimation = (
  config: {
    scale?: number
    elevation?: number
    springConfig?: keyof typeof MICRO_SPRING_CONFIG
  } = {},
) => {
  const { scale = 1.02, elevation = 8, springConfig = 'smooth' } = config

  const scaleValue = useSharedValue(1)
  const elevationValue = useSharedValue(2)
  const glowValue = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    shadowOpacity: interpolate(elevationValue.value, [2, elevation], [0.1, 0.25]),
    shadowRadius: interpolate(elevationValue.value, [2, elevation], [4, 16]),
    elevation: elevationValue.value,
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowValue.value,
  }))

  const handleHoverIn = () => {
    'worklet'
    scaleValue.value = withSpring(scale, MICRO_SPRING_CONFIG[springConfig])
    elevationValue.value = withSpring(elevation, MICRO_SPRING_CONFIG[springConfig])
    glowValue.value = withTiming(0.3, { duration: 200 })
  }

  const handleHoverOut = () => {
    'worklet'
    scaleValue.value = withSpring(1, MICRO_SPRING_CONFIG[springConfig])
    elevationValue.value = withSpring(2, MICRO_SPRING_CONFIG[springConfig])
    glowValue.value = withTiming(0, { duration: 300 })
  }

  return {
    animatedStyle,
    glowStyle,
    handlers: {
      onHoverIn: handleHoverIn,
      onHoverOut: handleHoverOut,
    },
  }
}

export const useFloatingAnimation = (
  config: {
    intensity?: number
    duration?: number
    delay?: number
    autoStart?: boolean
  } = {},
) => {
  const { intensity = 3, duration = 3000, delay = 0, autoStart = true } = config
  
  // Reduce intensity to make it less distracting
  const actualIntensity = intensity * 0.3 // Only 30% of original movement

  const translateY = useSharedValue(0)
  const _rotateZ = useSharedValue(0) // Unused but kept for future use

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const startFloating = useCallback(() => {
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(-actualIntensity, { duration: duration / 2 }),
        withTiming(actualIntensity, { duration: duration }),
        withTiming(0, { duration: duration / 2 }),
      ),
    )

    // Rotation disabled - it's too distracting
    // rotateZ.value = withDelay(
    //   delay,
    //   withSequence(
    //     withTiming(1, { duration: duration / 3 }),
    //     withTiming(-1, { duration: duration / 3 }),
    //     withTiming(0, { duration: duration / 3 }),
    //   ),
    // )
  }, [delay, duration, translateY, actualIntensity])

  useEffect(() => {
    if (autoStart) {
      const interval = setInterval(startFloating, duration + delay)
      startFloating()
      return () => clearInterval(interval)
    }
    return undefined
  }, [autoStart, duration, delay, startFloating])

  return {
    animatedStyle,
    startFloating,
  }
}

export const usePulseAnimation = (
  config: {
    scale?: number
    duration?: number
    autoStart?: boolean
    intensity?: number
  } = {},
) => {
  const { scale: _scale = 1.05, duration: _duration = 1500, autoStart: _autoStart = true, intensity: _intensity = 1 } = config

  const _scaleValue = useSharedValue(1)
  const _opacityValue = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 }], // No pulsing
    opacity: 1,
  }))

  const startPulse = useCallback(() => {
    // Pulsing disabled - looks unprofessional
    // scaleValue.value = withSequence(
    //   withTiming(scale * intensity, { duration: duration / 2 }),
    //   withTiming(1, { duration: duration / 2 }),
    // )

    // opacityValue.value = withSequence(
    //   withTiming(0.7, { duration: duration / 2 }),
    //   withTiming(1, { duration: duration / 2 }),
    // )
  }, [])

  useEffect(() => {
    // Disabled pulsing effect
    // if (autoStart) {
    //   const interval = setInterval(startPulse, duration)
    //   startPulse()
    //   return () => clearInterval(interval)
    // }
    return undefined
  }, [_autoStart, _duration, startPulse])

  return {
    animatedStyle,
    startPulse,
  }
}

export const useShakeAnimation = () => {
  const translateX = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const shake = (intensity = 10, duration = 500) => {
    'worklet'
    translateX.value = withSequence(
      withTiming(-intensity, { duration: duration / 8 }),
      withTiming(intensity, { duration: duration / 4 }),
      withTiming(-intensity * 0.8, { duration: duration / 4 }),
      withTiming(intensity * 0.8, { duration: duration / 4 }),
      withTiming(-intensity * 0.4, { duration: duration / 8 }),
      withTiming(0, { duration: duration / 8 }),
    )

    runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Error)
  }

  return {
    animatedStyle,
    shake,
  }
}

export const useRippleAnimation = () => {
  const scale = useSharedValue(0)
  const opacity = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const startRipple = (duration = 600) => {
    'worklet'
    scale.value = 0
    opacity.value = 0.6

    scale.value = withTiming(2, { duration })
    opacity.value = withTiming(0, { duration })
  }

  return {
    animatedStyle,
    startRipple,
  }
}

// Component wrappers for common micro-interactions
interface AnimatedPressableProps {
  children: React.ReactNode
  onPress?: () => void
  style?: any
  scale?: number
  haptic?: boolean
  springConfig?: keyof typeof MICRO_SPRING_CONFIG
  disabled?: boolean
  accessible?: boolean
  accessibilityRole?: AccessibilityRole
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityState?: { selected?: boolean; expanded?: boolean }
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  onPress,
  style,
  scale = 0.97,
  haptic = true,
  springConfig = 'snappy',
  disabled = false,
  accessible,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}) => {
  const { animatedStyle, handlers } = usePressAnimation({
    scale,
    haptic,
    springConfig,
    onPress,
    disabled,
  })

  return (
    <Animated.View
      style={[style, animatedStyle]}
      onTouchStart={handlers.onPressIn}
      onTouchEnd={handlers.onPressOut}
      onTouchCancel={handlers.onPressOut}
      accessible={accessible}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
    >
      {children}
    </Animated.View>
  )
}

interface FloatingElementProps {
  children: React.ReactNode
  intensity?: number
  duration?: number
  delay?: number
  style?: any
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  intensity: _intensity = 3,
  duration: _duration = 3000,
  delay: _delay = 0,
  style,
}) => {
  // Animation completely disabled - no floating or rotation
  // const { animatedStyle } = useFloatingAnimation({
  //   intensity,
  //   duration,
  //   delay,
  // })
  // return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  
  // Just return a plain View with no animations
  return <View style={style}>{children}</View>
}

interface PulsingElementProps {
  children: React.ReactNode
  scale?: number
  duration?: number
  style?: any
  autoStart?: boolean
}

export const PulsingElement: React.FC<PulsingElementProps> = ({
  children,
  scale = 1.05,
  duration = 1500,
  style,
  autoStart = true,
}) => {
  const { animatedStyle } = usePulseAnimation({
    scale,
    duration,
    autoStart,
  })

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
}

interface RippleEffectProps {
  children: React.ReactNode
  rippleColor?: string
  style?: any
  onPress?: () => void
}

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  rippleColor = 'rgba(124, 58, 237, 0.3)',
  style,
  onPress,
}) => {
  const { animatedStyle, startRipple } = useRippleAnimation()

  const handlePress = () => {
    startRipple()
    if (onPress) {
      setTimeout(onPress, 50) // Slight delay for visual feedback
    }
  }

  return (
    <View style={[styles.rippleContainer, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.ripple,
          { backgroundColor: rippleColor },
          animatedStyle,
        ]}
      />
      <AnimatedPressable onPress={handlePress}>{children}</AnimatedPressable>
    </View>
  )
}

const styles = StyleSheet.create({
  rippleContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  ripple: {
    borderRadius: 1000,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -50,
    marginLeft: -50,
    width: 100,
    height: 100,
  },
})
