import React, { useEffect } from 'react'
import { Link, Stack, useRouter } from 'expo-router'
import { StyleSheet, View, Dimensions, StatusBar } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import Animated, {
  FadeInDown,
  SlideInUp,
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

import { ThemedText, ThemedView } from '@/components/themed'
import { GlassView, HolographicView, MagneticView } from '@/components/themed/ThemedView'
import { GradientTitle, TypewriterText, GlowText } from '@/components/themed/ThemedText'
import { AnimatedPressable, FloatingElement, MICRO_SPRING_CONFIG } from '@/components/ui/MicroInteractions'
import { FluidGradient } from '@/components/ui/FluidGradient'
import { useTheme } from '@/contexts/ThemeContext'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT

export default function NotFoundScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  
  // Enhanced 2025 animation values
  const glitchOffset = useSharedValue(0)
  const buttonPulse = useSharedValue(1)
  const backgroundShift = useSharedValue(0)
  const errorFloat = useSharedValue(0)
  const particleFlow = useSharedValue(0)
  const iconRotate = useSharedValue(0)
  
  useEffect(() => {
    // Initialize glitch effect
    glitchOffset.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(0, { duration: 100 }),
        withTiming(3, { duration: 100 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      false
    )
    
    // Background shift animation
    backgroundShift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 15000 }),
        withTiming(0, { duration: 15000 })
      ),
      -1,
      true
    )
    
    // Error floating animation
    errorFloat.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 6000 }),
        withTiming(-15, { duration: 6000 })
      ),
      -1,
      true
    )
    
    // Button pulse animation
    buttonPulse.value = withRepeat(
      withSequence(
        withSpring(1.05, MICRO_SPRING_CONFIG.bouncy),
        withSpring(1, MICRO_SPRING_CONFIG.smooth)
      ),
      -1,
      true
    )
    
    // Particle flow animation
    particleFlow.value = withRepeat(
      withTiming(1, { duration: 10000 }),
      -1,
      false
    )
    
    // Icon rotation animation
    iconRotate.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1,
      false
    )
    
    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  }, [])
  
  // Animated styles
  const glitchStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: glitchOffset.value,
      },
    ],
  }))
  
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          backgroundShift.value,
          [0, 1],
          [-100, 100],
          Extrapolation.CLAMP
        ),
      },
    ],
  }))
  
  const errorFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: errorFloat.value }],
  }))
  
  const buttonPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonPulse.value }],
  }))
  
  const iconRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotate.value}deg` }],
  }))
  
  const particleFlowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          particleFlow.value,
          [0, 1],
          [-200, SCREEN_WIDTH + 200],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      particleFlow.value,
      [0, 0.2, 0.8, 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP
    ),
  }))
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        
        {/* Revolutionary Cosmic Background */}
        <Animated.View style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}>
          <FluidGradient
            variant="aurora"
            animated
            speed="slow"
            style={StyleSheet.absoluteFillObject}
            opacity={0.5}
          />
        </Animated.View>
        
        {/* Enhanced Gradient Overlay */}
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.8)', 'rgba(17, 24, 39, 0.95)']}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Floating Particles */}
        <Animated.View style={[styles.particle, { top: '20%', left: '10%' }, particleFlowStyle]}>
          <View style={[styles.particleDot, { backgroundColor: '#ef4444' }]} />
        </Animated.View>
        <Animated.View style={[styles.particle, { top: '50%', left: '20%' }, particleFlowStyle]}>
          <View style={[styles.particleDot, { backgroundColor: '#f87171' }]} />
        </Animated.View>
        <Animated.View style={[styles.particle, { top: '80%', left: '15%' }, particleFlowStyle]}>
          <View style={[styles.particleDot, { backgroundColor: '#fca5a5' }]} />
        </Animated.View>
        
        {/* 404 Content */}
        <ThemedView style={styles.content}>
          <Animated.View 
            entering={SlideInUp.delay(200).springify().damping(15)}
            style={errorFloatStyle}
          >
            <FloatingElement intensity={4} duration={3000}>
              <MagneticView 
                borderRadius={80}
                style={styles.iconContainer}
              >
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.1)']}
                  style={StyleSheet.absoluteFillObject}
                />
                <BlurView
                  intensity={40}
                  tint="dark"
                  style={StyleSheet.absoluteFillObject}
                />
                <Animated.View style={iconRotateStyle}>
                  <Ionicons name="game-controller-outline" size={80} color="#ef4444" />
                </Animated.View>
              </MagneticView>
            </FloatingElement>
          </Animated.View>
          
          <Animated.View 
            entering={FadeInDown.delay(400).springify()}
            style={[styles.textContainer, glitchStyle]}
          >
            <GradientTitle 
              gradient 
              animated 
              variant="bounce"
              style={styles.errorCode}
            >
              404
            </GradientTitle>
            
            <TypewriterText 
              animated 
              delay={600}
              style={styles.errorTitle}
            >
              Level Not Found
            </TypewriterText>
            
            <GlowText 
              glow 
              style={styles.errorMessage}
            >
              Looks like this screen got lost in the digital void
            </GlowText>
          </Animated.View>
          
          <Animated.View 
            entering={BounceIn.delay(800).springify().damping(12)}
            style={[styles.buttonContainer, buttonPulseStyle]}
          >
            <AnimatedPressable 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                router.replace('/')
              }}
              style={styles.homeButtonWrapper}
            >
              <HolographicView 
                morphing 
                borderRadius={24}
                style={styles.homeButton}
              >
                <LinearGradient
                  colors={theme.colors.gradients.primary}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.buttonContent}>
                  <Ionicons name="home" size={24} color="#ffffff" />
                  <GlowText style={styles.buttonText}>Return to Home</GlowText>
                </View>
              </HolographicView>
            </AnimatedPressable>
            
            <AnimatedPressable 
              onPress={() => {
                Haptics.selectionAsync()
                router.back()
              }}
              style={styles.backLinkContainer}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
              <GlowText style={styles.backLink}>Go Back</GlowText>
            </AnimatedPressable>
          </Animated.View>
        </ThemedView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  particle: {
    position: 'absolute',
  },
  particleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 40,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  errorCode: {
    fontSize: 96,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -4,
  },
  errorTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fca5a5',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 18,
    color: '#fef2f2',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 20,
  },
  homeButtonWrapper: {
    width: '100%',
    maxWidth: 300,
  },
  homeButton: {
    height: 60,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
    position: 'relative',
    zIndex: 1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  backLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a78bfa',
  },
})
