import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  interpolateColor,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { Home, Search, Plus, Bell, User, FlaskConical, FileText } from 'lucide-react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { AnimatedPressable, FloatingElement , MICRO_SPRING_CONFIG } from './MicroInteractions'

interface TabBarProps {
  state: any
  descriptors: any
  navigation: any
}

interface TabButtonProps {
  route: any
  isFocused: boolean
  onPress: () => void
  onLongPress: () => void
  descriptors: any
}

const TabButton = ({ route, isFocused, onPress, onLongPress, descriptors }: TabButtonProps) => {
  const { theme } = useTheme()
  const scale = useSharedValue(1)
  const iconScale = useSharedValue(1)
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(0.6)
  const morphValue = useSharedValue(0)
  const glowOpacity = useSharedValue(0)
  const rippleScale = useSharedValue(0)
  const indicatorWidth = useSharedValue(0)

  const getIcon = (routeName: string, focused: boolean) => {
    const color = focused ? '#ffffff' : theme.colors.textMuted
    const size = 22

    switch (routeName) {
      case 'index':
        return <Home color={color} size={size} strokeWidth={2.5} />
      case 'browse':
        return <Search color={color} size={size} strokeWidth={2.5} />
      case 'create':
        return <Plus color={color} size={size} strokeWidth={3} />
      case 'notifications':
        return <Bell color={color} size={size} strokeWidth={2.5} />
      case 'profile':
        return <User color={color} size={size} strokeWidth={2.5} />
      case 'test':
        return <FlaskConical color={color} size={size} strokeWidth={2.5} />
      case 'config':
        return <FileText color={color} size={size} strokeWidth={2.5} />
      default:
        return <Home color={color} size={size} strokeWidth={2.5} />
    }
  }

  useEffect(() => {
    if (isFocused) {
      // Enhanced focus animations with morphing
      scale.value = withSpring(1.08, MICRO_SPRING_CONFIG.snappy)
      iconScale.value = withSequence(
        withSpring(1.2, MICRO_SPRING_CONFIG.bouncy),
        withSpring(1.15, MICRO_SPRING_CONFIG.smooth)
      )
      translateY.value = withSpring(-3, MICRO_SPRING_CONFIG.snappy)
      opacity.value = withTiming(1, { duration: 150 })
      morphValue.value = withSpring(1, MICRO_SPRING_CONFIG.smooth)
      glowOpacity.value = withTiming(0.8, { duration: 200 })
      indicatorWidth.value = withSpring(20, MICRO_SPRING_CONFIG.snappy)
      
      // Ripple effect
      rippleScale.value = 0
      rippleScale.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 200 })
      )
    } else {
      scale.value = withSpring(1, MICRO_SPRING_CONFIG.smooth)
      iconScale.value = withSpring(1, MICRO_SPRING_CONFIG.smooth)
      translateY.value = withSpring(0, MICRO_SPRING_CONFIG.smooth)
      opacity.value = withTiming(0.65, { duration: 150 })
      morphValue.value = withSpring(0, MICRO_SPRING_CONFIG.smooth)
      glowOpacity.value = withTiming(0, { duration: 300 })
      indicatorWidth.value = withSpring(0, MICRO_SPRING_CONFIG.smooth)
    }
  }, [isFocused])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }] as any,
  }))

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }))

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      morphValue.value,
      [0, 1],
      ['transparent', route.name === 'create' ? theme.colors.accent : theme.colors.primary]
    )
    
    return {
      opacity: interpolate(scale.value, [1, 1.08], [0, 1], Extrapolation.CLAMP),
      backgroundColor,
      transform: [
        { scale: interpolate(morphValue.value, [0, 1], [0.8, 1], Extrapolation.CLAMP) }
      ],
    }
  })

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [
      { scale: interpolate(glowOpacity.value, [0, 1], [0.5, 1.3], Extrapolation.CLAMP) }
    ],
  }))

  const rippleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rippleScale.value, [0, 0.5, 1], [0, 0.6, 0], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(rippleScale.value, [0, 1], [0, 2], Extrapolation.CLAMP) }
    ],
  }))

  const morphingIndicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    transform: [
      { scaleX: interpolate(morphValue.value, [0, 1], [0, 1], Extrapolation.CLAMP) }
    ],
  }))

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const handlePress = () => {
    // Enhanced haptic feedback pattern
    if (route.name === 'create') {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
    } else {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
    }
    onPress()
  }

  const handleLongPress = () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy)
    onLongPress()
  }

  const { options } = descriptors[route.key]
  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
        ? options.title
        : route.name

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={styles.tabButton}
      scale={0.95}
      haptic={false}
    >
      <FloatingElement intensity={1} duration={4000}>
        <Animated.View style={[styles.tabContainer, animatedStyle as any]}>
          {/* Glow effect */}
          <Animated.View style={[styles.glowEffect, glowAnimatedStyle]}>
            <LinearGradient
              colors={[
                route.name === 'create' ? theme.colors.accent : theme.colors.primary,
                `${route.name === 'create' ? theme.colors.accent : theme.colors.primary}60`,
              ]}
              style={styles.glowGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          {/* Ripple effect */}
          <Animated.View style={[styles.rippleEffect, rippleAnimatedStyle]}>
            <View style={[styles.rippleCircle, {
              backgroundColor: route.name === 'create' ? theme.colors.accent : theme.colors.primary
            }]} />
          </Animated.View>

          {/* Morphing background */}
          <Animated.View style={[styles.focusBackground, backgroundAnimatedStyle]}>
            <LinearGradient
              colors={[
                route.name === 'create' ? theme.colors.accent : theme.colors.primary,
                route.name === 'create' ? `${theme.colors.accent}dd` : theme.colors.primaryDark,
              ]}
              style={styles.gradientBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

        {/* Icon with animation */}
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          {getIcon(route.name, isFocused)}
        </Animated.View>

        {/* Label with fade animation */}
        <Animated.View style={[labelAnimatedStyle]}>
          <Text
            style={[styles.tabLabel, { color: isFocused ? '#ffffff' : theme.colors.textMuted }]}
          >
            {label}
          </Text>
        </Animated.View>

          {/* Morphing indicator */}
          <Animated.View style={[styles.morphingIndicator, morphingIndicatorStyle]}>
            <LinearGradient
              colors={['#ffffff', '#ffffff88']}
              style={styles.indicatorGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>

          {/* Floating particles effect */}
          {isFocused && (
            <View style={styles.particlesContainer}>
              {Array.from({ length: 3 }).map((_, index) => (
                <FloatingElement
                  key={index}
                  intensity={2 + index}
                  duration={2000 + index * 500}
                  delay={index * 200}
                >
                  <View style={[styles.particle, {
                    backgroundColor: route.name === 'create' ? theme.colors.accent : theme.colors.primary,
                    left: 10 + index * 15,
                    top: 5 + index * 3,
                  }]} />
                </FloatingElement>
              ))}
            </View>
          )}
        </Animated.View>
      </FloatingElement>
    </AnimatedPressable>
  )
}

export default function AnimatedTabBar({ state, descriptors, navigation }: TabBarProps) {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* Blur background */}
      <BlurView
        intensity={100}
        tint={theme.isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Enhanced gradient overlay with morphism */}
      <LinearGradient
        colors={
          theme.isDark
            ? ['rgba(10, 10, 10, 0.95)', 'rgba(20, 20, 20, 0.98)', 'rgba(30, 30, 30, 0.99)']
            : ['rgba(255, 255, 255, 0.95)', 'rgba(250, 251, 252, 0.98)', 'rgba(248, 250, 252, 0.99)']
        }
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient glow */}
      <LinearGradient
        colors={[
          'transparent',
          `${theme.colors.primary}08`,
          'transparent'
        ]}
        style={[StyleSheet.absoluteFillObject, { opacity: 0.6 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      {/* Tab buttons container */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params)
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            })
          }

          return (
            <TabButton
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              descriptors={descriptors}
            />
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 85 : 75,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(124, 58, 237, 0.1)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    minHeight: 38,
    position: 'relative',
  },
  focusBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    borderRadius: 16,
  },
  iconContainer: {
    marginBottom: 3,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    zIndex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    top: -1,
    alignSelf: 'center',
  },
  indicatorDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ffffff',
  },
  glowEffect: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 21,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 21,
  },
  rippleEffect: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginTop: -30,
    marginLeft: -30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    opacity: 0.3,
  },
  morphingIndicator: {
    position: 'absolute',
    top: -2,
    alignSelf: 'center',
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: 1.5,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    opacity: 0.6,
  },
})
