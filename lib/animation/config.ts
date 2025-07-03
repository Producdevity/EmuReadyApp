import { withSpring, withTiming, Easing } from 'react-native-reanimated';

// Central animation configuration for consistent, snappy animations
export const ANIMATION_CONFIG = {
  // Timing presets - all fast and snappy
  timing: {
    instant: 100,
    fast: 150,
    normal: 200,
    slow: 300,
  },
  
  // Spring presets - optimized for snappy feel
  spring: {
    snappy: { damping: 25, stiffness: 400, mass: 0.8 },
    smooth: { damping: 30, stiffness: 350, mass: 0.9 },
    bouncy: { damping: 20, stiffness: 300, mass: 1.0 },
  },
  
  // Stagger delays - much faster than before
  stagger: {
    fast: 15,
    normal: 25,
    slow: 35,
  },
  
  // Base delays - significantly reduced
  baseDelay: {
    instant: 0,
    fast: 50,
    normal: 100,
    slow: 150,
  },
  
  // Scale presets for interactions
  scale: {
    press: 0.97,
    hover: 1.02,
    active: 1.05,
  },
  
  // Easing curves
  easing: {
    out: Easing.out(Easing.cubic),
    inOut: Easing.inOut(Easing.cubic),
    elastic: Easing.elastic(1.2),
  },
};

// Animation factory functions
export const createSpringAnimation = (value: number, preset: keyof typeof ANIMATION_CONFIG.spring = 'snappy') => {
  return withSpring(value, ANIMATION_CONFIG.spring[preset]);
};

export const createTimingAnimation = (
  value: number, 
  preset: keyof typeof ANIMATION_CONFIG.timing = 'fast',
  easing: keyof typeof ANIMATION_CONFIG.easing = 'out'
) => {
  return withTiming(value, {
    duration: ANIMATION_CONFIG.timing[preset],
    easing: ANIMATION_CONFIG.easing[easing],
  });
};

// Common animation presets
export const PRESS_SPRING = () => createSpringAnimation(ANIMATION_CONFIG.scale.press);
export const RELEASE_SPRING = () => createSpringAnimation(1);
export const HOVER_SPRING = () => createSpringAnimation(ANIMATION_CONFIG.scale.hover);
export const ACTIVE_SPRING = () => createSpringAnimation(ANIMATION_CONFIG.scale.active);

// Reanimated entrance animation presets
export const ENTRANCE_ANIMATIONS = {
  fadeUp: (delay: number = 0) => `FadeInUp.delay(${delay}).duration(${ANIMATION_CONFIG.timing.fast})`,
  fadeDown: (delay: number = 0) => `FadeInDown.delay(${delay}).duration(${ANIMATION_CONFIG.timing.fast})`,
  fadeLeft: (delay: number = 0) => `FadeInLeft.delay(${delay}).duration(${ANIMATION_CONFIG.timing.fast})`,
  fadeRight: (delay: number = 0) => `FadeInRight.delay(${delay}).duration(${ANIMATION_CONFIG.timing.fast})`,
  zoom: (delay: number = 0) => `ZoomIn.delay(${delay}).duration(${ANIMATION_CONFIG.timing.fast})`,
  slide: (delay: number = 0) => `SlideInUp.delay(${delay}).duration(${ANIMATION_CONFIG.timing.fast})`,
};

// Utility functions for consistent animation delays
export const getStaggerDelay = (
  index: number,
  baseDelay: keyof typeof ANIMATION_CONFIG.baseDelay = 'fast',
  stagger: keyof typeof ANIMATION_CONFIG.stagger = 'normal'
) => {
  return ANIMATION_CONFIG.baseDelay[baseDelay] + (index * ANIMATION_CONFIG.stagger[stagger]);
};

export const getBaseDelay = (preset: keyof typeof ANIMATION_CONFIG.baseDelay = 'fast') => {
  return ANIMATION_CONFIG.baseDelay[preset];
};