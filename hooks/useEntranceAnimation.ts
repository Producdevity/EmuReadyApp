import { 
  FadeInUp, 
  FadeInDown, 
  SlideInRight, 
  SlideInLeft,
} from 'react-native-reanimated'

type AnimationType = 'fadeUp' | 'fadeDown' | 'slideRight' | 'slideLeft'

interface EntranceAnimationConfig {
  type?: AnimationType
  baseDelay?: number
  stagger?: number
  springConfig?: {
    damping?: number
    stiffness?: number
  }
}

interface UseEntranceAnimationReturn {
  getItemAnimation: (index: number) => any
  getContainerAnimation: () => any
  getHeaderAnimation: () => any
}

export const useEntranceAnimation = (
  config: EntranceAnimationConfig = {}
): UseEntranceAnimationReturn => {
  const {
    type = 'fadeUp',
    baseDelay = 200,
    stagger = 50,
    springConfig = { damping: 15, stiffness: 150 }
  } = config

  const getAnimationBuilder = (animationType: AnimationType) => {
    switch (animationType) {
      case 'fadeDown':
        return FadeInDown
      case 'slideRight':
        return SlideInRight
      case 'slideLeft':
        return SlideInLeft
      case 'fadeUp':
      default:
        return FadeInUp
    }
  }

  const getItemAnimation = (index: number) => {
    const delay = baseDelay + (index * stagger)
    return getAnimationBuilder(type)
      .delay(delay)
      .springify()
  }

  const getContainerAnimation = () => {
    return getAnimationBuilder(type)
      .delay(baseDelay - 100)
      .springify()
  }

  const getHeaderAnimation = () => {
    return FadeInDown
      .delay(100)
      .springify()
  }

  return {
    getItemAnimation,
    getContainerAnimation,
    getHeaderAnimation,
  }
}

// Pre-configured animation sets for common scenarios
export const useListAnimation = () => {
  return useEntranceAnimation({
    type: 'fadeUp',
    baseDelay: 300,
    stagger: 50,
  })
}

export const useCardGridAnimation = () => {
  return useEntranceAnimation({
    type: 'fadeUp',
    baseDelay: 200,
    stagger: 75,
  })
}

export const useSlideInAnimation = () => {
  return useEntranceAnimation({
    type: 'slideRight',
    baseDelay: 250,
    stagger: 100,
  })
}

export const useQuickAnimation = () => {
  return useEntranceAnimation({
    type: 'fadeUp',
    baseDelay: 100,
    stagger: 25,
    springConfig: { damping: 20, stiffness: 200 }
  })
}

// Utility function for creating staggered animations
export const createStaggeredAnimation = (
  count: number,
  animationType: AnimationType = 'fadeUp',
  stagger: number = 50,
  baseDelay: number = 200
) => {
  const getBuilder = (type: AnimationType) => {
    switch (type) {
      case 'fadeDown': return FadeInDown
      case 'slideRight': return SlideInRight
      case 'slideLeft': return SlideInLeft
      default: return FadeInUp
    }
  }

  const animations = []
  for (let i = 0; i < count; i++) {
    const delay = baseDelay + (i * stagger)
    animations.push(
      getBuilder(animationType)
        .delay(delay)
        .springify()
    )
  }
  return animations
}

export default useEntranceAnimation