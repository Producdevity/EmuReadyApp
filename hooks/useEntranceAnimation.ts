import { ANIMATION_CONFIG, getBaseDelay, getStaggerDelay } from '@/lib/animation/config'
import {
  BaseAnimationBuilder,
  EntryAnimationsValues,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated'

type AnimationType = 'fadeUp' | 'fadeDown' | 'slideRight' | 'slideLeft'

interface EntranceAnimationConfig {
  type?: AnimationType
  baseDelay?: keyof typeof ANIMATION_CONFIG.baseDelay
  stagger?: keyof typeof ANIMATION_CONFIG.stagger
}

interface UseEntranceAnimationReturn {
  getItemAnimation: (index: number) => BaseAnimationBuilder
  getContainerAnimation: () => BaseAnimationBuilder
  getHeaderAnimation: () => BaseAnimationBuilder
}

export const useEntranceAnimation = (
  config: EntranceAnimationConfig = {},
): UseEntranceAnimationReturn => {
  const { type = 'fadeUp', baseDelay = 'fast', stagger = 'normal' } = config

  const getAnimationBuilder = (animationType: AnimationType): typeof FadeInUp => {
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
    const delay = getStaggerDelay(index, baseDelay, stagger)
    return getAnimationBuilder(type).delay(delay).duration(ANIMATION_CONFIG.timing.fast)
  }

  const getContainerAnimation = () => {
    return getAnimationBuilder(type)
      .delay(getBaseDelay('instant'))
      .duration(ANIMATION_CONFIG.timing.fast)
  }

  const getHeaderAnimation = () => {
    return FadeInDown.delay(getBaseDelay('instant')).duration(ANIMATION_CONFIG.timing.fast)
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
    baseDelay: 'fast',
    stagger: 'normal',
  })
}

export const useCardGridAnimation = () => {
  return useEntranceAnimation({
    type: 'fadeUp',
    baseDelay: 'fast',
    stagger: 'slow',
  })
}

export const useSlideInAnimation = () => {
  return useEntranceAnimation({
    type: 'slideRight',
    baseDelay: 'normal',
    stagger: 'normal',
  })
}

export const useQuickAnimation = () => {
  return useEntranceAnimation({
    type: 'fadeUp',
    baseDelay: 'instant',
    stagger: 'fast',
  })
}

// Utility function for creating staggered animations
export const createStaggeredAnimation = (
  count: number,
  animationType: AnimationType = 'fadeUp',
  stagger: keyof typeof ANIMATION_CONFIG.stagger = 'normal',
  baseDelay: keyof typeof ANIMATION_CONFIG.baseDelay = 'fast',
) => {
  const getBuilder = (type: AnimationType): typeof FadeInUp => {
    switch (type) {
      case 'fadeDown':
        return FadeInDown
      case 'slideRight':
        return SlideInRight
      case 'slideLeft':
        return SlideInLeft
      default:
        return FadeInUp
    }
  }

  const animations = []
  for (let i = 0; i < count; i++) {
    const delay = getStaggerDelay(i, baseDelay, stagger)
    animations.push(getBuilder(animationType).delay(delay).duration(ANIMATION_CONFIG.timing.fast))
  }
  return animations
}

export default useEntranceAnimation
