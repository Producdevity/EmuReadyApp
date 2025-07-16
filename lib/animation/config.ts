import { withSpring, withTiming, Easing } from 'react-native-reanimated'

// Ultra-smooth animation configuration for 120Hz displays
export const ANIMATION_CONFIG = {
  // Timing presets - optimized for modern high-refresh displays
  timing: {
    instant: 50,    // Ultra-fast for immediate feedback
    fast: 100,      // Quick transitions
    normal: 150,    // Standard transitions
    slow: 200,      // Deliberate animations
  },

  // Spring presets - physics-based for natural feel
  spring: {
    snappy: { damping: 30, stiffness: 400, mass: 0.8 },   // iOS-like snappy
    smooth: { damping: 35, stiffness: 350, mass: 0.9 },   // Smooth and controlled
    bouncy: { damping: 25, stiffness: 300, mass: 1.0 },   // Playful with energy
    gentle: { damping: 40, stiffness: 250, mass: 1.1 },   // Gentle and fluid
  },

  // Stagger delays - optimized for fluid sequences
  stagger: {
    fast: 8,        // Rapid-fire
    normal: 12,     // Smooth cascade
    slow: 16,       // Deliberate sequence
  },

  // Base delays - optimized for responsiveness
  baseDelay: {
    instant: 0,     // No delay
    fast: 25,       // Minimal delay
    normal: 50,     // Brief pause
    slow: 80,       // Noticeable but not slow
  },

  // Scale presets for interactions
  scale: {
    press: 0.98,
    hover: 1.03,
    active: 1.06,
    subtle: 0.995,
  },

  // Easing curves - optimized for modern UI feel
  easing: {
    out: Easing.out(Easing.cubic),       // Smooth deceleration
    inOut: Easing.inOut(Easing.cubic),   // Smooth bidirectional
    elastic: Easing.elastic(1.2),        // Subtle bounce
    linear: Easing.linear,               // Constant speed
    back: Easing.back(1.7),             // Overshoot effect
  },
}

// Enhanced animation factory functions
export const createSpringAnimation = (
  value: number,
  preset: keyof typeof ANIMATION_CONFIG.spring = 'snappy',
) => {
  return withSpring(value, ANIMATION_CONFIG.spring[preset])
}

export const createTimingAnimation = (
  value: number,
  preset: keyof typeof ANIMATION_CONFIG.timing = 'fast',
  easing: keyof typeof ANIMATION_CONFIG.easing = 'out',
) => {
  return withTiming(value, {
    duration: ANIMATION_CONFIG.timing[preset],
    easing: ANIMATION_CONFIG.easing[easing],
  })
}

// Utility for creating smooth press animations
export const createPressAnimation = (pressed: boolean) => {
  return withSpring(pressed ? ANIMATION_CONFIG.scale.press : 1, ANIMATION_CONFIG.spring.snappy)
}

// Utility for creating smooth hover animations
export const createHoverAnimation = (hovered: boolean) => {
  return withSpring(hovered ? ANIMATION_CONFIG.scale.hover : 1, ANIMATION_CONFIG.spring.smooth)
}

// Common animation presets
export const PRESS_SPRING = () => createSpringAnimation(ANIMATION_CONFIG.scale.press)
export const RELEASE_SPRING = () => createSpringAnimation(1)
export const HOVER_SPRING = () => createSpringAnimation(ANIMATION_CONFIG.scale.hover)
export const ACTIVE_SPRING = () => createSpringAnimation(ANIMATION_CONFIG.scale.active)

// Reanimated entrance animation presets
export const ENTRANCE_ANIMATIONS = {
  fadeUp: (delay: number = 0) =>
    `FadeInUp.delay(${delay}).duration(${ANIMATION_CONFIG.timing.fast})`,
  fadeDown: (delay: number = 0) =>
    `FadeInDown.delay(${delay}).duration(${ANIMATION_CONFIG.timing.fast})`,
  fadeLeft: (delay: number = 0) =>
    `FadeInLeft.delay(${delay}).duration(${ANIMATION_CONFIG.timing.fast})`,
  fadeRight: (delay: number = 0) =>
    `FadeInRight.delay(${delay}).duration(${ANIMATION_CONFIG.timing.fast})`,
  zoom: (delay: number = 0) => `ZoomIn.delay(${delay}).duration(${ANIMATION_CONFIG.timing.fast})`,
  slide: (delay: number = 0) =>
    `SlideInUp.delay(${delay}).duration(${ANIMATION_CONFIG.timing.fast})`,
}

// Utility functions for consistent animation delays
export const getStaggerDelay = (
  index: number,
  baseDelay: keyof typeof ANIMATION_CONFIG.baseDelay = 'fast',
  stagger: keyof typeof ANIMATION_CONFIG.stagger = 'normal',
) => {
  return ANIMATION_CONFIG.baseDelay[baseDelay] + index * ANIMATION_CONFIG.stagger[stagger]
}

export const getBaseDelay = (preset: keyof typeof ANIMATION_CONFIG.baseDelay = 'fast') => {
  return ANIMATION_CONFIG.baseDelay[preset]
}
