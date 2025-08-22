import { ANIMATION_CONFIG } from '@/lib/animation/config'
import { DESIGN_CONSTANTS } from '@/constants/design'
import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

// Animation duration constants for reduced motion
const REDUCED_MOTION_DURATIONS = {
  // When reduced motion is enabled, use minimal durations
  reduced: {
    short: ANIMATION_CONFIG.timing.instant * 2, // 100ms
    medium: ANIMATION_CONFIG.timing.fast * 1.5, // 150ms
    long: ANIMATION_CONFIG.timing.normal * 1.33, // ~200ms
    infinite: 0, // Disable infinite animations
  },
  // Normal animation durations
  normal: {
    short: DESIGN_CONSTANTS.ANIMATION.normal, // 300ms
    medium: DESIGN_CONSTANTS.ANIMATION.slow, // 500ms
    long: DESIGN_CONSTANTS.ANIMATION.slower, // 800ms
    infinite: -1, // Enable infinite animations
  },
} as const

// Spring configuration constants
const REDUCED_MOTION_SPRINGS = {
  // Less bouncy animations for reduced motion
  reduced: {
    gentle: {
      damping: 30,
      stiffness: 200,
      mass: 0.8,
    },
    bouncy: {
      damping: 20,
      stiffness: 150,
      mass: 0.5,
    },
    precise: {
      damping: 40,
      stiffness: 300,
      mass: 1,
    },
  },
  // Normal spring animations
  normal: {
    gentle: ANIMATION_CONFIG.spring.gentle,
    bouncy: ANIMATION_CONFIG.spring.bouncy,
    precise: {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    },
  },
} as const

/**
 * Hook to detect if user prefers reduced motion for accessibility
 * Returns true if reduced motion should be used
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const checkReduceMotion = async () => {
      try {
        // Check if reduce motion is enabled on the platform
        const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled()
        setReduceMotion(isReduceMotionEnabled)
      } catch (error) {
        // Default to false if we can't detect the preference
        setReduceMotion(false)
      }
    }

    checkReduceMotion()

    // Listen for changes in accessibility settings
    let subscription: { remove: () => void } | null = null
    try {
      subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    } catch (error) {
      console.warn('Failed to add accessibility event listener:', error)
    }

    return () => {
      subscription?.remove()
    }
  }, [])

  return reduceMotion
}

/**
 * Hook to get animation duration based on reduced motion preference
 * Returns shorter durations if reduced motion is enabled
 */
export function useAnimationDuration() {
  const reduceMotion = useReducedMotion()
  const config = reduceMotion ? REDUCED_MOTION_DURATIONS.reduced : REDUCED_MOTION_DURATIONS.normal

  return config
}

/**
 * Hook to get spring configuration based on reduced motion preference
 * Returns less bouncy animations if reduced motion is enabled
 */
export function useSpringConfig() {
  const reduceMotion = useReducedMotion()
  const config = reduceMotion ? REDUCED_MOTION_SPRINGS.reduced : REDUCED_MOTION_SPRINGS.normal

  return config
}