import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

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
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)

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

  return {
    short: reduceMotion ? 100 : 300,
    medium: reduceMotion ? 150 : 500,
    long: reduceMotion ? 200 : 800,
    infinite: reduceMotion ? 0 : -1, // Disable infinite animations if reduced motion
  }
}

/**
 * Hook to get spring configuration based on reduced motion preference
 * Returns less bouncy animations if reduced motion is enabled
 */
export function useSpringConfig() {
  const reduceMotion = useReducedMotion()

  return {
    gentle: {
      damping: reduceMotion ? 30 : 15,
      stiffness: reduceMotion ? 200 : 100,
      mass: reduceMotion ? 0.8 : 1,
    },
    bouncy: {
      damping: reduceMotion ? 20 : 8,
      stiffness: reduceMotion ? 150 : 50,
      mass: reduceMotion ? 0.5 : 0.3,
    },
    precise: {
      damping: reduceMotion ? 40 : 20,
      stiffness: reduceMotion ? 300 : 200,
      mass: reduceMotion ? 1 : 0.8,
    },
  }
}