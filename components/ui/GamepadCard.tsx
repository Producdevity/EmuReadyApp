import React from 'react'
import {
  Pressable,
  View,
  StyleSheet,
  Platform,
  type ViewStyle,
} from 'react-native'
import Animated,
{
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { useTheme } from '@/contexts/ThemeContext'
import { useGamepadNavigation, useOrientationOptimized } from '@/hooks/useGamepadNavigation'

interface GamepadCardProps {
  id: string
  children: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  style?: ViewStyle
  padding?: 'none' | 'sm' | 'md' | 'lg'
  nextFocusUp?: string
  nextFocusDown?: string
  nextFocusLeft?: string
  nextFocusRight?: string
  trapFocus?: boolean
  autoFocus?: boolean
  variant?: 'default' | 'elevated' | 'outline'
}

export default function GamepadCard({
  id,
  children,
  onPress,
  disabled = false,
  style,
  padding = 'md',
  nextFocusUp,
  nextFocusDown,
  nextFocusLeft,
  nextFocusRight,
  trapFocus,
  autoFocus,
  variant = 'default',
}: GamepadCardProps) {
  const { theme } = useTheme()
  const { isLandscape } = useOrientationOptimized()

  // Gamepad navigation
  const gamepadNav = useGamepadNavigation({
    id,
    onSelect: onPress,
    onFocus: () => {
      if (Platform.OS === 'android' && !disabled) {
        Haptics.selectionAsync()
      }
    },
    nextFocusUp,
    nextFocusDown,
    nextFocusLeft,
    nextFocusRight,
    trapFocus,
    disabled,
    autoFocus,
  })

  // Animations
  const scale = useSharedValue(1)
  const opacity = useSharedValue(disabled ? 0.5 : 1)
  const elevation = useSharedValue(variant === 'elevated' ? 4 : 2)
  const focusBorder = useSharedValue(0)
  const focusGlow = useSharedValue(0)

  React.useEffect(() => {
    if (gamepadNav.isFocused && !disabled) {
      scale.value = withSpring(isLandscape ? 1.02 : 1.03, {
        damping: 15,
        stiffness: 300,
      })
      elevation.value = withSpring(variant === 'elevated' ? 8 : 6, {
        damping: 20,
        stiffness: 400,
      })
      focusBorder.value = withTiming(2, { duration: 200 })
      focusGlow.value = withTiming(1, { duration: 300 })
    } else {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      })
      elevation.value = withSpring(variant === 'elevated' ? 4 : 2, {
        damping: 20,
        stiffness: 400,
      })
      focusBorder.value = withTiming(0, { duration: 200 })
      focusGlow.value = withTiming(0, { duration: 300 })
    }
  }, [gamepadNav.isFocused, disabled, isLandscape, variant, scale, elevation, focusBorder, focusGlow])

  React.useEffect(() => {
    opacity.value = withTiming(disabled ? 0.5 : 1, { duration: 200 })
  }, [disabled, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const focusStyle = useAnimatedStyle(() => ({
    borderWidth: focusBorder.value,
    borderColor: theme.colors.primary,
    shadowOpacity: Platform.OS === 'ios' ? elevation.value / 10 : 0,
    shadowRadius: Platform.OS === 'ios' ? elevation.value : 0,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: elevation.value / 2 } : { width: 0, height: 0 },
    elevation: Platform.OS === 'android' ? elevation.value : 0,
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: focusGlow.value * 0.3,
  }))

  const handlePress = () => {
    if (!disabled && onPress) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
      onPress()
    }
  }

  const handlePressIn = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(isLandscape ? 0.99 : 0.98, {
        damping: 20,
        stiffness: 400,
      })
    }
  }

  const handlePressOut = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(gamepadNav.isFocused ? (isLandscape ? 1.02 : 1.03) : 1, {
        damping: 15,
        stiffness: 300,
      })
    }
  }

  const getCardBackground = () => {
    switch (variant) {
      case 'elevated':
        return theme.colors.card
      case 'outline':
        return 'transparent'
      default:
        return theme.colors.surface
    }
  }

  const styles = createStyles(theme, padding, isLandscape, variant)

  const CardWrapper = onPress ? Pressable : View

  return (
    <CardWrapper
      ref={gamepadNav.ref}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.container, style]}
    >
      <Animated.View style={[animatedStyle, focusStyle]}>
        {/* Focus glow effect */}
        {gamepadNav.isFocused && (
          <Animated.View style={[styles.glowContainer, glowStyle]}>
            <LinearGradient
              colors={[`${theme.colors.primary}40`, `${theme.colors.primary}20`, 'transparent']}
              style={styles.glow}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          </Animated.View>
        )}

        {/* Card background */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: getCardBackground(),
              borderWidth: variant === 'outline' ? 1 : 0,
              borderColor: variant === 'outline' ? theme.colors.border : 'transparent',
            },
          ]}
        >
          {variant === 'elevated' && Platform.OS === 'ios' && (
            <BlurView
              intensity={20}
              tint={theme.isDark ? 'dark' : 'light'}
              style={[StyleSheet.absoluteFillObject, { borderRadius: isLandscape ? 8 : 12 }]}
            />
          )}

          <View style={styles.content}>
            {children}
          </View>
        </View>
      </Animated.View>
    </CardWrapper>
  )
}

const createStyles = (theme: any, padding: string, isLandscape: boolean, _variant: string) => {
  const paddingConfig = {
    none: 0,
    sm: isLandscape ? 8 : 12,
    md: isLandscape ? 12 : 16,
    lg: isLandscape ? 16 : 20,
  }

  const paddingValue = paddingConfig[padding as keyof typeof paddingConfig]

  return StyleSheet.create({
    container: {
      borderRadius: isLandscape ? 8 : 12,
    },
    card: {
      borderRadius: isLandscape ? 8 : 12,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
    },
    content: {
      padding: paddingValue,
    },
    glowContainer: {
      position: 'absolute',
      top: -4,
      left: -4,
      right: -4,
      bottom: -4,
      borderRadius: isLandscape ? 12 : 16,
      zIndex: -1,
    },
    glow: {
      flex: 1,
      borderRadius: isLandscape ? 12 : 16,
    },
  })
}
