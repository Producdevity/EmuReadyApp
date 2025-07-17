import { GlowText, GradientTitle, TypewriterText } from '@/components/themed/ThemedText'
import { GlassView, HolographicView, MagneticView } from '@/components/themed/ThemedView'
import FluidGradient from '@/components/ui/FluidGradient'
import {
  AnimatedPressable,
  FloatingElement,
  MICRO_SPRING_CONFIG,
} from '@/components/ui/MicroInteractions'
import { useTheme } from '@/contexts/ThemeContext'
import { getStaggerDelay } from '@/lib/animation/config'
import { useCpus, useGpus } from '@/lib/api/hooks'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { Dimensions, ScrollView, StatusBar, StyleSheet, View } from 'react-native'
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT

export default function HardwareScreen() {
  const { theme } = useTheme()

  // Enhanced 2025 animation values
  const heroGlow = useSharedValue(0)
  const hardwareFloat = useSharedValue(0)
  const backgroundShift = useSharedValue(0)
  const statsFloat = useSharedValue(0)
  const particleFlow = useSharedValue(0)
  const categoryScale = useSharedValue(1)

  // Get summary data for CPUs and GPUs
  const { data: cpusData } = useCpus({ limit: 1 })
  const { data: gpusData } = useGpus({ limit: 1 })

  useEffect(() => {
    // Initialize cosmic background animation
    backgroundShift.value = withRepeat(
      withSequence(withTiming(1, { duration: 25000 }), withTiming(0, { duration: 25000 })),
      -1,
      true,
    )

    // Hero glow animation
    heroGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 3000 }), withTiming(0.3, { duration: 3000 })),
      -1,
      true,
    )

    // Hardware floating animation
    hardwareFloat.value = withRepeat(
      withSequence(withTiming(12, { duration: 5000 }), withTiming(-12, { duration: 5000 })),
      -1,
      true,
    )

    // Stats floating animation
    statsFloat.value = withRepeat(
      withSequence(withTiming(8, { duration: 4000 }), withTiming(-8, { duration: 4000 })),
      -1,
      true,
    )

    // Particle flow animation
    particleFlow.value = withRepeat(withTiming(1, { duration: 15000 }), -1, false)
  }, [])

  const hardwareCategories = [
    {
      id: 'cpus',
      title: 'CPUs',
      subtitle: 'Central Processing Units',
      description: 'Browse detailed specifications for desktop and mobile processors',
      icon: 'hardware-chip',
      color: theme.colors.primary,
      route: '/hardware/cpus',
      count: cpusData?.pagination?.total || 0,
    },
    {
      id: 'gpus',
      title: 'GPUs',
      subtitle: 'Graphics Processing Units',
      description: 'Explore graphics cards with technical specifications and performance data',
      icon: 'desktop',
      color: theme.colors.secondary,
      route: '/hardware/gpus',
      count: gpusData?.pagination?.total || 0,
    },
  ]

  const handleCategoryPress = (route: string) => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
    categoryScale.value = withSequence(
      withSpring(0.95, MICRO_SPRING_CONFIG.instant),
      withSpring(1, MICRO_SPRING_CONFIG.bouncy),
    )
    router.push(route as any)
  }

  // Animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(backgroundShift.value, [0, 1], [-100, 100], Extrapolation.CLAMP),
      },
    ],
  }))

  const heroGlowStyle = useAnimatedStyle(() => ({
    opacity: heroGlow.value,
  }))

  const hardwareFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hardwareFloat.value }],
  }))

  const statsFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: statsFloat.value }],
  }))

  const categoryScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: categoryScale.value }],
  }))

  const particleFlowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          particleFlow.value,
          [0, 1],
          [-200, SCREEN_WIDTH + 200],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(particleFlow.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
  }))

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Revolutionary Cosmic Background */}
      <Animated.View style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}>
        <FluidGradient
          variant="cosmic"
          animated
          speed="slow"
          style={StyleSheet.absoluteFillObject}
          opacity={0.3}
        />
      </Animated.View>

      {/* Floating Particles */}
      <Animated.View style={[{ position: 'absolute', top: '15%' }, particleFlowStyle]}>
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: `${theme.colors.primary}30`,
          }}
        />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', top: '45%' }, particleFlowStyle]}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: `${theme.colors.secondary}30`,
          }}
        />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', top: '75%' }, particleFlowStyle]}>
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: `${theme.colors.accent}30`,
          }}
        />
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Enhanced Header */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={[heroGlowStyle]}
            className="px-4 py-4 border-b"
          >
            <HolographicView morphing borderRadius={20} style={{ padding: 20 }}>
              <LinearGradient
                colors={theme.colors.gradients.primary}
                style={[StyleSheet.absoluteFillObject, { opacity: 0.1 }]}
              />
              <FloatingElement intensity={2} duration={3000}>
                <View style={{ alignItems: 'center' }}>
                  <MagneticView borderRadius={30} style={{ marginBottom: 12 }}>
                    <LinearGradient
                      colors={theme.colors.gradients.secondary}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="hardware-chip" size={32} color="#ffffff" />
                    </LinearGradient>
                  </MagneticView>
                  <GradientTitle animated className="text-2xl font-bold text-center">
                    Hardware Database
                  </GradientTitle>
                  <TypewriterText
                    animated
                    delay={400}
                    className="text-sm mt-1 text-center"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Comprehensive specifications and performance data
                  </TypewriterText>
                </View>
              </FloatingElement>
            </HolographicView>
          </Animated.View>

          <View className="p-4">
            {/* Enhanced Overview Stats */}
            <Animated.View
              entering={FadeInUp.delay(400).springify()}
              style={[statsFloatStyle, { marginBottom: 24 }]}
            >
              <HolographicView morphing borderRadius={theme.borderRadius.xl}>
                <GlassView
                  borderRadius={theme.borderRadius.xl}
                  blurIntensity={20}
                  style={{ padding: 16 }}
                >
                  <GradientTitle animated className="text-lg font-semibold mb-3 text-center">
                    Database Overview
                  </GradientTitle>

                  <View className="flex-row justify-around">
                    <FloatingElement intensity={1} duration={3000}>
                      <MagneticView borderRadius={12} style={{ alignItems: 'center', padding: 12 }}>
                        <GlowText
                          className="text-2xl font-bold"
                          style={{ color: theme.colors.primary }}
                        >
                          {(cpusData?.pagination?.total || 0) + (gpusData?.pagination?.total || 0)}
                        </GlowText>
                        <TypewriterText
                          animated
                          delay={600}
                          className="text-sm"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          Total Components
                        </TypewriterText>
                      </MagneticView>
                    </FloatingElement>

                    <FloatingElement intensity={1} duration={3500}>
                      <MagneticView borderRadius={12} style={{ alignItems: 'center', padding: 12 }}>
                        <GlowText
                          className="text-2xl font-bold"
                          style={{ color: theme.colors.secondary }}
                        >
                          {cpusData?.pagination?.total || 0}
                        </GlowText>
                        <TypewriterText
                          animated
                          delay={700}
                          className="text-sm"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          CPUs
                        </TypewriterText>
                      </MagneticView>
                    </FloatingElement>

                    <FloatingElement intensity={1} duration={4000}>
                      <MagneticView borderRadius={12} style={{ alignItems: 'center', padding: 12 }}>
                        <GlowText
                          className="text-2xl font-bold"
                          style={{ color: theme.colors.accent }}
                        >
                          {gpusData?.pagination?.total || 0}
                        </GlowText>
                        <TypewriterText
                          animated
                          delay={800}
                          className="text-sm"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          GPUs
                        </TypewriterText>
                      </MagneticView>
                    </FloatingElement>
                  </View>
                </GlassView>
              </HolographicView>
            </Animated.View>

            {/* Hardware Categories */}
            <View className="space-y-4">
              {hardwareCategories.map((category, index) => (
                <Animated.View
                  key={category.id}
                  entering={SlideInRight.delay(
                    getStaggerDelay(index, 'normal', 'fast'),
                  ).springify()}
                  style={[hardwareFloatStyle, { marginBottom: 16 }]}
                >
                  <AnimatedPressable onPress={() => handleCategoryPress(category.route)}>
                    <Animated.View style={categoryScaleStyle}>
                      <HolographicView morphing borderRadius={theme.borderRadius.xl}>
                        <GlassView
                          borderRadius={theme.borderRadius.xl}
                          blurIntensity={20}
                          style={{ padding: 16 }}
                        >
                          <FluidGradient
                            variant="gaming"
                            animated
                            speed="slow"
                            style={StyleSheet.absoluteFillObject}
                            opacity={0.05}
                          />
                          <View className="flex-row items-start">
                            <FloatingElement intensity={1} duration={3000 + index * 500}>
                              <MagneticView
                                borderRadius={24}
                                className="w-12 h-12 mr-4 items-center justify-center"
                                style={{ backgroundColor: `${category.color}20` }}
                              >
                                <Ionicons
                                  name={category.icon as any}
                                  size={24}
                                  color={category.color}
                                />
                              </MagneticView>
                            </FloatingElement>

                            <View className="flex-1">
                              <View className="flex-row justify-between items-start mb-2">
                                <GradientTitle animated className="text-xl font-semibold">
                                  {category.title}
                                </GradientTitle>
                                <View className="flex-row items-center">
                                  <GlowText
                                    className="text-sm font-medium mr-2"
                                    style={{ color: theme.colors.textSecondary }}
                                  >
                                    {category.count.toLocaleString()} items
                                  </GlowText>
                                  <Ionicons
                                    name="chevron-forward"
                                    size={16}
                                    color={theme.colors.textMuted}
                                  />
                                </View>
                              </View>

                              <GlowText
                                className="text-sm font-medium mb-2"
                                style={{ color: category.color }}
                              >
                                {category.subtitle}
                              </GlowText>

                              <TypewriterText
                                animated
                                delay={800 + index * 100}
                                className="text-sm"
                                style={{ color: theme.colors.textSecondary }}
                              >
                                {category.description}
                              </TypewriterText>
                            </View>
                          </View>
                        </GlassView>
                      </HolographicView>
                    </Animated.View>
                  </AnimatedPressable>
                </Animated.View>
              ))}
            </View>

            {/* Enhanced Information Card */}
            <Animated.View entering={FadeInUp.delay(800).springify()} style={{ marginTop: 24 }}>
              <HolographicView morphing borderRadius={theme.borderRadius.xl}>
                <GlassView
                  borderRadius={theme.borderRadius.xl}
                  blurIntensity={20}
                  style={{ padding: 16 }}
                >
                  <View className="flex-row items-center mb-3">
                    <FloatingElement intensity={1} duration={2500}>
                      <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                    </FloatingElement>
                    <GradientTitle animated className="text-lg font-semibold ml-2">
                      About Hardware Database
                    </GradientTitle>
                  </View>

                  <TypewriterText
                    animated
                    delay={900}
                    className="mb-3"
                    style={{ color: theme.colors.textSecondary, lineHeight: 20 }}
                  >
                    Our comprehensive hardware database provides detailed specifications for
                    processors and graphics cards to help you make informed decisions about PC
                    gaming performance.
                  </TypewriterText>

                  <View className="space-y-2">
                    <Animated.View
                      entering={FadeInUp.delay(1000).springify()}
                      className="flex-row items-start"
                    >
                      <FloatingElement intensity={0.5} duration={2000}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                      </FloatingElement>
                      <TypewriterText
                        animated
                        delay={1000}
                        className="ml-2 flex-1"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        Detailed technical specifications and features
                      </TypewriterText>
                    </Animated.View>
                    <Animated.View
                      entering={FadeInUp.delay(1100).springify()}
                      className="flex-row items-start"
                    >
                      <FloatingElement intensity={0.5} duration={2200}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                      </FloatingElement>
                      <TypewriterText
                        animated
                        delay={1100}
                        className="ml-2 flex-1"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        Performance data from real user reports
                      </TypewriterText>
                    </Animated.View>
                    <Animated.View
                      entering={FadeInUp.delay(1200).springify()}
                      className="flex-row items-start"
                    >
                      <FloatingElement intensity={0.5} duration={2400}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                      </FloatingElement>
                      <TypewriterText
                        animated
                        delay={1200}
                        className="ml-2 flex-1"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        Search and filter capabilities
                      </TypewriterText>
                    </Animated.View>
                    <Animated.View
                      entering={FadeInUp.delay(1300).springify()}
                      className="flex-row items-start"
                    >
                      <FloatingElement intensity={0.5} duration={2600}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                      </FloatingElement>
                      <TypewriterText
                        animated
                        delay={1300}
                        className="ml-2 flex-1"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        Regular updates with latest hardware releases
                      </TypewriterText>
                    </Animated.View>
                  </View>
                </GlassView>
              </HolographicView>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
