import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { Home, Search, Plus, Bell, User, FlaskConical, FileText } from 'lucide-react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { useGamepadNavigation, useOrientationOptimized } from '@/hooks/useGamepadNavigation'

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
      // Visual feedback for gamepad focus
      if (Platform.OS === 'android') {
        Haptics.selectionAsync()
      }
    },
    nextFocusLeft: index > 0 ? `tab-${route.name}` : undefined,
    nextFocusRight: index < totalTabs - 1 ? `tab-${route.name}` : undefined,
    autoFocus: index === 0, // Focus first tab by default
  })

  // Animations
  const scale = useSharedValue(1)
  const iconScale = useSharedValue(1)
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(0.6)
  const focusScale = useSharedValue(gamepadNav.isFocused ? 1.1 : 1)

  const getIcon = (routeName: string, focused: boolean, gamepadFocused: boolean) => {
    const color = focused || gamepadFocused ? '#ffffff' : theme.colors.textMuted
    const size = isLandscape ? 20 : 22

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

  // Update animations based on focus states
  useEffect(() => {
    const shouldHighlight = isFocused || gamepadNav.isFocused

    if (shouldHighlight) {
      scale.value = withSpring(isLandscape ? 1.02 : 1.05, {
        damping: 15,
        stiffness: 300,
      })
      iconScale.value = withSpring(isLandscape ? 1.05 : 1.1, {
        damping: 12,
        stiffness: 350,
      })
      translateY.value = withSpring(isLandscape ? -1 : -2, {
        damping: 15,
        stiffness: 300,
      })
      opacity.value = withTiming(1, { duration: 200 })
      focusScale.value = withSpring(gamepadNav.isFocused ? 1.1 : 1, {
        damping: 20,
        stiffness: 400,
      })
    } else {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      })
      iconScale.value = withSpring(1, {
        damping: 12,
        stiffness: 350,
      })
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 300,
      })
      opacity.value = withTiming(0.6, { duration: 200 })
      focusScale.value = withSpring(1, {
        damping: 20,
        stiffness: 400,
      })
    }
  }, [
    isFocused,
    gamepadNav.isFocused,
    isLandscape,
    scale,
    iconScale,
    translateY,
    opacity,
    focusScale,
  ])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }] as any,
  }))

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }))

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scale.value, [1, isLandscape ? 1.02 : 1.05], [0, 1]),
  }))

  const gamepadFocusStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
    borderWidth: gamepadNav.isFocused ? 2 : 0,
    borderColor: theme.colors.primary,
  }))

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const handlePress = () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  const { options } = descriptors[route.key]
  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
        ? options.title
        : route.name

  const styles = createTabButtonStyles(theme, isLandscape)

  return (
    <Pressable
      ref={gamepadNav.ref}
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.tabContainer, animatedStyle, gamepadFocusStyle]}>
        {/* Animated background for focused state */}
        <Animated.View style={[styles.focusBackground, backgroundAnimatedStyle]}>
          <LinearGradient
            colors={
              route.name === 'create'
                ? [theme.colors.accent, `${theme.colors.accent}dd`]
                : [theme.colors.primary, theme.colors.primaryDark]
            }
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Icon with animation */}
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          {getIcon(route.name, isFocused, gamepadNav.isFocused)}
        </Animated.View>

        {/* Label with fade animation - only show in landscape for space efficiency */}
        {!isLandscape && (
          <Animated.View style={labelAnimatedStyle}>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused || gamepadNav.isFocused ? '#ffffff' : theme.colors.textMuted,
                },
              ]}
            >
              {label}
            </Text>
          </Animated.View>
        )}

        {/* Active indicator dot */}
        {(isFocused || gamepadNav.isFocused) && (
          <Animated.View style={[styles.activeIndicator, backgroundAnimatedStyle]}>
            <View style={styles.indicatorDot} />
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  )
}

export default function GamepadTabBar({ state, descriptors, navigation }: GamepadTabBarProps) {
  const { theme } = useTheme()
  const { isLandscape } = useOrientationOptimized()
  const insets = useSafeAreaInsets()

  const styles = createStyles(theme, isLandscape, insets)

  return (
    <View style={styles.container}>
      {/* Blur background */}
      <BlurView
        intensity={80}
        tint={theme.isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={
          theme.isDark
            ? ['rgba(15, 23, 42, 0.97)', 'rgba(30, 41, 59, 0.99)']
            : ['rgba(255, 255, 255, 0.97)', 'rgba(248, 250, 252, 0.99)']
        }
        style={StyleSheet.absoluteFillObject}
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
              navigation.navigate(route.name)
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
              index={index}
              totalTabs={state.routes.length}
            />
          )
        })}
      </View>

      {/* Gamepad navigation hint for landscape */}
      {isLandscape && Platform.OS === 'android' && (
        <View style={styles.gamepadHint}>
          <Text style={styles.gamepadHintText}>Use D-Pad ← → to navigate tabs</Text>
        </View>
      )}
    </View>
  )
}

const createTabButtonStyles = (theme: any, isLandscape: boolean) =>
  StyleSheet.create({
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: isLandscape ? 50 : 60,
      paddingHorizontal: isLandscape ? 8 : 12,
      paddingVertical: isLandscape ? 6 : 8,
    },
    tabContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: isLandscape ? 8 : 12,
      paddingHorizontal: isLandscape ? 8 : 12,
      paddingVertical: isLandscape ? 6 : 8,
      minWidth: isLandscape ? 45 : 50,
      position: 'relative',
    },
    focusBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: isLandscape ? 8 : 12,
      overflow: 'hidden',
    },
    gradientBackground: {
      flex: 1,
      borderRadius: isLandscape ? 8 : 12,
    },
    iconContainer: {
      marginBottom: isLandscape ? 0 : 4,
    },
    tabLabel: {
      fontSize: isLandscape ? 10 : 11,
      fontWeight: '500',
      textAlign: 'center',
      marginTop: 2,
    },
    activeIndicator: {
      position: 'absolute',
      bottom: isLandscape ? -2 : -4,
      alignSelf: 'center',
    },
    indicatorDot: {
      width: isLandscape ? 4 : 6,
      height: isLandscape ? 4 : 6,
      borderRadius: isLandscape ? 2 : 3,
      backgroundColor: '#ffffff',
    },
  })

const createStyles = (theme: any, isLandscape: boolean, insets: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingBottom: Math.max(insets.bottom, isLandscape ? 4 : 8),
      paddingHorizontal: isLandscape ? 8 : 0,
      height: isLandscape ? 60 : 85,
    },
    tabsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: isLandscape ? 16 : 8,
      paddingTop: isLandscape ? 8 : 12,
      flex: 1,
    },
    gamepadHint: {
      position: 'absolute',
      top: 2,
      right: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      backgroundColor: `${theme.colors.primary}20`,
      borderRadius: 8,
    },
    gamepadHintText: {
      fontSize: 9,
      color: theme.colors.primary,
      fontWeight: '500',
    },
  })
