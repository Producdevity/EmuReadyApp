import { DESIGN_CONSTANTS } from '@/constants/design'
import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

// Constants for scroll header animations
const SCROLL_HEADER_CONSTANTS = {
  titleFadeOffset: 100, // Pixels before header height for title to start fading in
  titleTranslateOffset: 20, // Initial Y translation for title
  backgroundScaleMax: 1.2, // Maximum scale for background on scroll
} as const

interface ScrollHeaderAnimationConfig {
  headerHeight: number
  startOpacity?: number
  midOpacity?: number
  endOpacity?: number
  parallaxFactor?: number
}

export const useScrollHeaderAnimation = (config: ScrollHeaderAnimationConfig) => {
  const {
    headerHeight,
    startOpacity = 1,
    midOpacity = 0.8,
    endOpacity = 0,
    parallaxFactor = 0.5,
  } = config

  const scrollY = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, headerHeight / 2, headerHeight],
      [startOpacity, midOpacity, endOpacity],
      Extrapolation.CLAMP,
    )

    const translateY = interpolate(
      scrollY.value,
      [0, headerHeight],
      [0, -headerHeight * parallaxFactor],
      Extrapolation.CLAMP,
    )

    return {
      opacity,
      transform: [{ translateY }],
    }
  })

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const fadeStart = headerHeight - SCROLL_HEADER_CONSTANTS.titleFadeOffset
    const opacity = interpolate(
      scrollY.value,
      [fadeStart, headerHeight],
      [0, 1],
      Extrapolation.CLAMP,
    )

    const translateY = interpolate(
      scrollY.value,
      [fadeStart, headerHeight],
      [SCROLL_HEADER_CONSTANTS.titleTranslateOffset, 0],
      Extrapolation.CLAMP,
    )

    return {
      opacity,
      transform: [{ translateY }],
    }
  })

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, headerHeight],
      [1, SCROLL_HEADER_CONSTANTS.backgroundScaleMax],
      Extrapolation.CLAMP,
    )

    return {
      transform: [{ scale }],
    }
  })

  return {
    scrollY,
    scrollHandler,
    headerAnimatedStyle,
    titleAnimatedStyle,
    backgroundAnimatedStyle,
  }
}

export default useScrollHeaderAnimation
