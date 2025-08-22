import { useTheme } from '@/contexts/ThemeContext'
import { useGamepadNavigation, useOrientationOptimized } from '@/hooks/useGamepadNavigation'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { Bell, FileText, FlaskConical, Home, Plus, Search, User } from 'lucide-react-native'
import React, { useEffect } from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface GamepadTabBarProps {
  state: any
  descriptors: any
  navigation: any
}

interface GamepadTabButtonProps {
  route: any
  isFocused: boolean
  onPress: () => void
  onLongPress: () => void
  descriptors: any
  index: number
  totalTabs: number
}

const GamepadTabButton = ({
  route,
  isFocused,
  onPress,
  onLongPress,
  descriptors,
  index,
  totalTabs,
}: GamepadTabButtonProps) => {
  const { theme } = useTheme()
  const { isLandscape } = useOrientationOptimized()

  // Gamepad navigation setup
  const gamepadNav = useGamepadNavigation({
    id: `tab-${route.name}`,
    onSelect: onPress,
    onFocus: () => {
      if (Platform.OS === 'android') {
        Haptics.selectionAsync()
      }
    },
    nextFocusLeft: index > 0 ? `tab-${route.name}` : undefined,
    nextFocusRight: index < totalTabs - 1 ? `tab-${route.name}` : undefined,
    autoFocus: index === 0,
  })

  // Simple animations
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.6)
  const indicatorOpacity = useSharedValue(0)

  const getIcon = (routeName: string, focused: boolean) => {
    const color = focused ? theme.colors.primary : theme.colors.textMuted
    const size = isLandscape ? 18 : 20

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
    const shouldHighlight = isFocused || gamepadNav.isFocused

    if (shouldHighlight) {
      scale.value = withSpring(1.05)
      opacity.value = withTiming(1, { duration: 200 })
      indicatorOpacity.value = withTiming(1, { duration: 200 })
    } else {
      scale.value = withSpring(1)
      opacity.value = withTiming(0.6, { duration: 200 })
      indicatorOpacity.value = withTiming(0, { duration: 200 })
    }
  }, [isFocused, gamepadNav.isFocused, scale, opacity, indicatorOpacity])

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
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
    <Pressable
      ref={gamepadNav.ref}
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      accessible={true}
      accessibilityRole="tab"
      accessibilityLabel={`${label} tab`}
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View style={[styles.tabContainer, containerStyle]}>
        {/* Clean indicator */}
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        
        {/* Icon */}
        <View style={styles.iconContainer}>
          {getIcon(route.name, isFocused || gamepadNav.isFocused)}
        </View>

        {/* Label */}
        <Animated.Text style={[styles.tabLabel, labelStyle]}>
          {label}
        </Animated.Text>

        {/* Gamepad focus border */}
        {gamepadNav.isFocused && (
          <View style={[styles.gamepadFocusBorder, { borderColor: theme.colors.primary }]} />
        )}
      </Animated.View>
    </Pressable>
  )
}

export default function GamepadTabBar({ state, descriptors, navigation }: GamepadTabBarProps) {
  const { theme } = useTheme()
  const { isLandscape } = useOrientationOptimized()
  const insets = useSafeAreaInsets()
  
  // Define hidden tabs
  const hiddenTabs = ['pc', 'hardware', 'media', 'config']

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          height: isLandscape ? 60 : 70,
        },
      ]}
    >
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

      {/* Tab buttons */}
      <View style={[styles.tabsContainer, isLandscape && styles.tabsContainerLandscape]}>
        {(() => {
          // Filter visible routes first
          const visibleRoutes = state.routes.filter((route: any) => !hiddenTabs.includes(route.name))
          
          return visibleRoutes.map((route: any, visibleIndex: number) => {
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
              <GamepadTabButton
                key={route.key}
                route={route}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                descriptors={descriptors}
                index={visibleIndex}
                totalTabs={visibleRoutes.length}
              />
            )
          })
        })()}
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
  tabsContainerLandscape: {
    paddingHorizontal: 40,
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
  gamepadFocusBorder: {
    position: 'absolute',
    top: -4,
    left: -8,
    right: -8,
    bottom: -4,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: 'transparent',
  },
})