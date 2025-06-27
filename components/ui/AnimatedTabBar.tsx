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
import { Home, Search, Plus, User } from 'lucide-react-native'

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
  const scale = useSharedValue(1)
  const iconScale = useSharedValue(1)
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(0.6)

  const getIcon = (routeName: string, focused: boolean) => {
    const color = focused ? '#ffffff' : '#9ca3af'
    const size = 24

    switch (routeName) {
      case 'index':
        return <Home color={color} size={size} strokeWidth={2.5} />
      case 'browse':
        return <Search color={color} size={size} strokeWidth={2.5} />
      case 'create':
        return <Plus color={color} size={size} strokeWidth={3} />
      case 'profile':
        return <User color={color} size={size} strokeWidth={2.5} />
      default:
        return <Home color={color} size={size} strokeWidth={2.5} />
    }
  }

  useEffect(() => {
    if (isFocused) {
      scale.value = withSpring(1.1, {
        damping: 15,
        stiffness: 300,
      })
      iconScale.value = withSpring(1.2, {
        damping: 12,
        stiffness: 350,
      })
      translateY.value = withSpring(-4, {
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
      [1, 1.1],
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
              ? ['#10b981', '#059669'] 
              : ['#3b82f6', '#2563eb']
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
            { color: isFocused ? '#ffffff' : '#9ca3af' }
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
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Blur background */}
      <BlurView
        intensity={80}
        tint="dark"
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(17, 24, 39, 0.95)', 'rgba(31, 41, 55, 0.98)']}
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
    height: Platform.OS === 'ios' ? 90 : 70,
    overflow: 'hidden',
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minHeight: 50,
    position: 'relative',
  },
  focusBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    borderRadius: 20,
  },
  iconContainer: {
    marginBottom: 4,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    zIndex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    alignSelf: 'center',
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
}) 