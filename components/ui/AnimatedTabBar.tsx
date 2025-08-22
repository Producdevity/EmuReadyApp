import { useTheme } from '@/contexts/ThemeContext'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { Bell, FileText, FlaskConical, Home, Plus, Search, User } from 'lucide-react-native'
import React, { useEffect } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AnimatedPressable, MICRO_SPRING_CONFIG } from './MicroInteractions'

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

const TabButton = ({ route, isFocused, onPress, onLongPress: _onLongPress, descriptors }: TabButtonProps) => {
  const { theme } = useTheme()
  const scale = useSharedValue(1)
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(0.6)
  const indicatorOpacity = useSharedValue(0)

  const getIcon = (routeName: string, focused: boolean) => {
    const color = focused ? theme.colors.primary : theme.colors.textMuted
    const size = 20

    switch (routeName) {
      case 'index':
        return <Home color={color} size={size} strokeWidth={2} />
      case 'browse':
        return <Search color={color} size={size} strokeWidth={2} />
      case 'create':
        return <Plus color={color} size={size} strokeWidth={2.5} />
      case 'notifications':
        return <Bell color={color} size={size} strokeWidth={2} />
      case 'profile':
        return <User color={color} size={size} strokeWidth={2} />
      case 'test':
        return <FlaskConical color={color} size={size} strokeWidth={2} />
      case 'config':
        return <FileText color={color} size={size} strokeWidth={2} />
      default:
        return <Home color={color} size={size} strokeWidth={2} />
    }
  }

  useEffect(() => {
    if (isFocused) {
      // Simple, clean focus animations
      scale.value = withSpring(1.05, MICRO_SPRING_CONFIG.smooth)
      translateY.value = withSpring(-2, MICRO_SPRING_CONFIG.smooth)
      opacity.value = withTiming(1, { duration: 200 })
      indicatorOpacity.value = withTiming(1, { duration: 200 })
    } else {
      scale.value = withSpring(1, MICRO_SPRING_CONFIG.smooth)
      translateY.value = withSpring(0, MICRO_SPRING_CONFIG.smooth)
      opacity.value = withTiming(0.6, { duration: 200 })
      indicatorOpacity.value = withTiming(0, { duration: 200 })
    }
  }, [isFocused, indicatorOpacity, opacity, scale, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }))

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ scale: interpolate(indicatorOpacity.value, [0, 1], [0.8, 1]) }],
  }))

  const labelStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      opacity.value,
      [0.6, 1],
      [theme.colors.textMuted, theme.colors.primary],
    )
    return { color }
  })

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
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
      scale={0.98}
      haptic={false}
      accessible={true}
      accessibilityRole="tab"
      accessibilityLabel={`${label} tab`}
      accessibilityHint={`Navigate to ${label} screen`}
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View style={[styles.tabContainer, animatedStyle]}>
        {/* Clean indicator dot */}
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        
        {/* Icon */}
        <View style={styles.iconContainer}>
          {getIcon(route.name, isFocused)}
        </View>

        {/* Label */}
        <Animated.Text style={[styles.tabLabel, labelStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </AnimatedPressable>
  )
}

export default function AnimatedTabBar({ state, descriptors, navigation }: TabBarProps) {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  
  // Define hidden tabs
  const hiddenTabs = ['pc', 'hardware', 'media', 'config']

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {/* Clean blur background */}
      <BlurView
        intensity={90}
        tint={theme.isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Subtle gradient overlay */}
      <LinearGradient
        colors={
          theme.isDark
            ? ['rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.7)']
            : ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.9)']
        }
        style={StyleSheet.absoluteFillObject}
      />

      {/* Tab buttons container */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route: any) => {
          // Skip hidden tabs
          if (hiddenTabs.includes(route.name)) {
            return null
          }
          
          // Check if this route is focused by comparing the route name
          const isFocused = state.routes[state.index]?.name === route.name

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
    height: Platform.OS === 'ios' ? 80 : 70,
    backgroundColor: 'transparent',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#7c3aed',
  },
  iconContainer: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
})