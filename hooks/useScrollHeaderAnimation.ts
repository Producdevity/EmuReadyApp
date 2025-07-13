import {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'

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
    const opacity = interpolate(
      scrollY.value,
      [headerHeight - 100, headerHeight],
      [0, 1],
      Extrapolation.CLAMP,
    )

    const translateY = interpolate(
      scrollY.value,
      [headerHeight - 100, headerHeight],
      [20, 0],
      Extrapolation.CLAMP,
    )

    return {
      opacity,
      transform: [{ translateY }],
    }
  })

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [0, headerHeight], [1, 1.2], Extrapolation.CLAMP)

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
