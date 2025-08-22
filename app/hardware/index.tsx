import { GlowText, GradientTitle, TypewriterText } from '@/components/themed/ThemedText'
import { GlassView } from '@/components/themed/ThemedView'
import { ScreenLayout, ScreenHeader } from '@/components/ui'
import {
  AnimatedPressable,
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
import { Dimensions, StyleSheet, View } from 'react-native'
import Animated, {
  Extrapolation,
  FadeInUp,
  SlideInRight,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function HardwareScreen() {
  const { theme } = useTheme()

  // Animation values
  const heroGlow = useSharedValue(0)
  const backgroundShift = useSharedValue(0)
  const particleFlow = useSharedValue(0)
  const categoryScale = useSharedValue(1)

  // Get summary data for CPUs and GPUs
  const { data: cpusData } = useCpus({ limit: 1 })
  const { data: gpusData } = useGpus({ limit: 1 })

  useEffect(() => {
    // Initialize background animation
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

    // Particle flow animation
    particleFlow.value = withRepeat(withTiming(1, { duration: 15000 }), -1, false)
  }, [backgroundShift, heroGlow, particleFlow])

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
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

  const _heroGlowStyle = useAnimatedStyle(() => ({
    opacity: heroGlow.value,
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
    <ScreenLayout>
      {/* Background */}
      <Animated.View style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}>
        <LinearGradient
          colors={theme.colors.gradients.primary}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.3 }]}
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

      <ScreenHeader
        title="Hardware Database"
        subtitle="Comprehensive specifications and performance data"
        variant="hero"
        animated
      />

          <View style={{ padding: theme.spacing.lg }}>
            {/* Overview Stats */}
            <Animated.View
              entering={FadeInUp.delay(400).springify()}
              style={{ marginBottom: theme.spacing.xl }}
            >
              <GlassView
                borderRadius={theme.borderRadius.xl}
                blurIntensity={20}
                style={{ padding: theme.spacing.lg }}
              >
                <GradientTitle 
                  animated 
                  style={{ 
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.semibold,
                    marginBottom: theme.spacing.md,
                    textAlign: 'center'
                  }}
                >
                  Database Overview
                </GradientTitle>

                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <View style={{ alignItems: 'center', padding: theme.spacing.md }}>
                    <GlowText
                      style={{ 
                        fontSize: theme.typography.fontSize.xxl,
                        fontWeight: theme.typography.fontWeight.bold,
                        color: theme.colors.primary
                      }}
                    >
                      {(cpusData?.pagination?.total || 0) + (gpusData?.pagination?.total || 0)}
                    </GlowText>
                    <TypewriterText
                      animated
                      delay={600}
                      style={{ 
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.textSecondary
                      }}
                    >
                      Total Components
                    </TypewriterText>
                  </View>

                  <View style={{ alignItems: 'center', padding: theme.spacing.md }}>
                    <GlowText
                      style={{ 
                        fontSize: theme.typography.fontSize.xxl,
                        fontWeight: theme.typography.fontWeight.bold,
                        color: theme.colors.secondary
                      }}
                    >
                      {cpusData?.pagination?.total || 0}
                    </GlowText>
                    <TypewriterText
                      animated
                      delay={700}
                      style={{ 
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.textSecondary
                      }}
                    >
                      CPUs
                    </TypewriterText>
                  </View>

                  <View style={{ alignItems: 'center', padding: theme.spacing.md }}>
                    <GlowText
                      style={{ 
                        fontSize: theme.typography.fontSize.xxl,
                        fontWeight: theme.typography.fontWeight.bold,
                        color: theme.colors.accent
                      }}
                    >
                      {gpusData?.pagination?.total || 0}
                    </GlowText>
                    <TypewriterText
                      animated
                      delay={800}
                      style={{ 
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.textSecondary
                      }}
                    >
                      GPUs
                    </TypewriterText>
                  </View>
                </View>
              </GlassView>
            </Animated.View>

            {/* Hardware Categories */}
            <View style={{ gap: theme.spacing.lg }}>
              {hardwareCategories.map((category, index) => (
                <Animated.View
                  key={category.id}
                  entering={SlideInRight.delay(
                    getStaggerDelay(index, 'normal', 'fast'),
                  ).springify()}
                  style={{ marginBottom: theme.spacing.lg }}
                >
                  <AnimatedPressable onPress={() => handleCategoryPress(category.route)}>
                    <Animated.View style={categoryScaleStyle}>
                      <GlassView
                        borderRadius={theme.borderRadius.xl}
                        blurIntensity={20}
                        style={{ padding: theme.spacing.lg }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                          <View
                            style={{ 
                              width: 48,
                              height: 48,
                              marginRight: theme.spacing.lg,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: `${category.color}20`, 
                              borderRadius: 24 
                            }}
                          >
                            <Ionicons
                              name={category.icon as any}
                              size={24}
                              color={category.color}
                            />
                          </View>

                          <View style={{ flex: 1 }}>
                            <View style={{ 
                              flexDirection: 'row', 
                              justifyContent: 'space-between', 
                              alignItems: 'flex-start', 
                              marginBottom: theme.spacing.sm 
                            }}>
                              <GradientTitle 
                                animated 
                                style={{ 
                                  fontSize: theme.typography.fontSize.xl,
                                  fontWeight: theme.typography.fontWeight.semibold
                                }}
                              >
                                {category.title}
                              </GradientTitle>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <GlowText
                                  style={{ 
                                    fontSize: theme.typography.fontSize.sm,
                                    fontWeight: theme.typography.fontWeight.medium,
                                    marginRight: theme.spacing.sm,
                                    color: theme.colors.textSecondary
                                  }}
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
                              style={{ 
                                fontSize: theme.typography.fontSize.sm,
                                fontWeight: theme.typography.fontWeight.medium,
                                marginBottom: theme.spacing.sm,
                                color: category.color
                              }}
                            >
                              {category.subtitle}
                            </GlowText>

                            <TypewriterText
                              animated
                              delay={800 + index * 100}
                              style={{ 
                                fontSize: theme.typography.fontSize.sm,
                                color: theme.colors.textSecondary
                              }}
                            >
                              {category.description}
                            </TypewriterText>
                          </View>
                        </View>
                      </GlassView>
                    </Animated.View>
                  </AnimatedPressable>
                </Animated.View>
              ))}
            </View>

            {/* Information Card */}
            <Animated.View 
              entering={FadeInUp.delay(800).springify()} 
              style={{ marginTop: theme.spacing.xl }}
            >
              <GlassView
                borderRadius={theme.borderRadius.xl}
                blurIntensity={20}
                style={{ padding: theme.spacing.lg }}
              >
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginBottom: theme.spacing.md 
                }}>
                  <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                  <GradientTitle 
                    animated 
                    style={{ 
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      marginLeft: theme.spacing.sm
                    }}
                  >
                    About Hardware Database
                  </GradientTitle>
                </View>

                <TypewriterText
                  animated
                  delay={900}
                  style={{ 
                    color: theme.colors.textSecondary, 
                    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
                    marginBottom: theme.spacing.md
                  }}
                >
                  Our comprehensive hardware database provides detailed specifications for
                  processors and graphics cards to help you make informed decisions about PC
                  gaming performance.
                </TypewriterText>

                <View style={{ gap: theme.spacing.sm }}>
                  <Animated.View
                    entering={FadeInUp.delay(1000).springify()}
                    style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                    <TypewriterText
                      animated
                      delay={1000}
                      style={{ 
                        marginLeft: theme.spacing.sm,
                        flex: 1,
                        color: theme.colors.textSecondary
                      }}
                    >
                      Detailed technical specifications and features
                    </TypewriterText>
                  </Animated.View>
                  <Animated.View
                    entering={FadeInUp.delay(1100).springify()}
                    style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                    <TypewriterText
                      animated
                      delay={1100}
                      style={{ 
                        marginLeft: theme.spacing.sm,
                        flex: 1,
                        color: theme.colors.textSecondary
                      }}
                    >
                      Performance data from real user reports
                    </TypewriterText>
                  </Animated.View>
                  <Animated.View
                    entering={FadeInUp.delay(1200).springify()}
                    style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                    <TypewriterText
                      animated
                      delay={1200}
                      style={{ 
                        marginLeft: theme.spacing.sm,
                        flex: 1,
                        color: theme.colors.textSecondary
                      }}
                    >
                      Search and filter capabilities
                    </TypewriterText>
                  </Animated.View>
                  <Animated.View
                    entering={FadeInUp.delay(1300).springify()}
                    style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                    <TypewriterText
                      animated
                      delay={1300}
                      style={{ 
                        marginLeft: theme.spacing.sm,
                        flex: 1,
                        color: theme.colors.textSecondary
                      }}
                    >
                      Regular updates with latest hardware releases
                    </TypewriterText>
                  </Animated.View>
                </View>
              </GlassView>
            </Animated.View>
          </View>
    </ScreenLayout>
  )
}