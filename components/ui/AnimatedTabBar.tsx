import React, { useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'
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
import { Home, Search, Plus, Bell, User } from 'lucide-react-native'
import { useTheme } from '@/contexts/ThemeContext'

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
      default:
        return <Home color={color} size={size} strokeWidth={2.5} />
    }
  }

  useEffect(() => {
    if (isFocused) {
      scale.value = withSpring(1.05, {
        damping: 15,
        stiffness: 300,
      })
      iconScale.value = withSpring(1.1, {
        damping: 12,
        stiffness: 350,
      })
      translateY.value = withSpring(-2, {
        damping: 15,
        stiffness: 300,
      })
      opacity.value = withTiming(1, { duration: 200 })
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
    }
  }, [isFocused, scale, iconScale, translateY, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ] as any,
  }))

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }))

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scale.value,
      [1, 1.05],
      [0, 1]
    ),
  }))

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const handlePress = () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  const { options } = descriptors[route.key]
  const label = options.tabBarLabel !== undefined
    ? options.tabBarLabel
    : options.title !== undefined
    ? options.title
    : route.name

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.tabContainer, animatedStyle as any]}>
        {/* Animated background for focused state */}
        <Animated.View style={[styles.focusBackground, backgroundAnimatedStyle]}>
          <LinearGradient
            colors={route.name === 'create' 
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
          {getIcon(route.name, isFocused)}
        </Animated.View>

        {/* Label with fade animation */}
        <Animated.View style={[labelAnimatedStyle]}>
          <Text style={[
            styles.tabLabel,
            { color: isFocused ? '#ffffff' : theme.colors.textMuted }
          ]}>
            {label}
          </Text>
        </Animated.View>

        {/* Active indicator dot */}
        {isFocused && (
          <Animated.View style={[styles.activeIndicator, backgroundAnimatedStyle]}>
            <View style={styles.indicatorDot} />
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
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
      
      {/* Gradient overlay */}
      <LinearGradient
        colors={theme.isDark 
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
    height: Platform.OS === 'ios' ? 82 : 72,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
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
    minHeight: 44,
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
}) 