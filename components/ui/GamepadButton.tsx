import React from 'react'
import {
  Pressable,
  Text,
  StyleSheet,
  Platform,
  type ViewStyle,
  type TextStyle,
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
import * as Haptics from 'expo-haptics'
import { useTheme } from '@/contexts/ThemeContext'
import { useGamepadNavigation, useOrientationOptimized } from '@/hooks/useGamepadNavigation'

interface GamepadButtonProps {
  id: string
  title: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  onPress?: () => void
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  nextFocusUp?: string
  nextFocusDown?: string
  nextFocusLeft?: string
  nextFocusRight?: string
  trapFocus?: boolean
  autoFocus?: boolean
  icon?: React.ReactNode
}

export default function GamepadButton({
  id,
  title,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  style,
  textStyle,
  nextFocusUp,
  nextFocusDown,
  nextFocusLeft,
  nextFocusRight,
  trapFocus,
  autoFocus,
  icon,
}: GamepadButtonProps) {
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
  const focusScale = useSharedValue(1)
  const focusBorder = useSharedValue(0)

  React.useEffect(() => {
    if (gamepadNav.isFocused && !disabled) {
      scale.value = withSpring(isLandscape ? 1.02 : 1.05, {
        damping: 15,
        stiffness: 300,
      })
      focusScale.value = withSpring(1.02, {
        damping: 20,
        stiffness: 400,
      })
      focusBorder.value = withTiming(2, { duration: 200 })
    } else {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      })
      focusScale.value = withSpring(1, {
        damping: 20,
        stiffness: 400,
      })
      focusBorder.value = withTiming(0, { duration: 200 })
    }
  }, [gamepadNav.isFocused, disabled, isLandscape, scale, focusScale, focusBorder])

  React.useEffect(() => {
    opacity.value = withTiming(disabled ? 0.5 : 1, { duration: 200 })
  }, [disabled, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const focusStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
    borderWidth: focusBorder.value,
    borderColor: theme.colors.primary,
  }))

  const handlePress = () => {
    if (!disabled && onPress) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
      onPress()
    }
  }

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(isLandscape ? 0.98 : 0.95, {
        damping: 20,
        stiffness: 400,
      })
    }
  }

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(gamepadNav.isFocused ? (isLandscape ? 1.02 : 1.05) : 1, {
        damping: 15,
        stiffness: 300,
      })
    }
  }

  const getButtonColors = (): [string, string] => {
    switch (variant) {
      case 'primary':
        return [theme.colors.primary, theme.colors.primaryDark]
      case 'secondary':
        return [theme.colors.secondary, theme.colors.primary]
      case 'danger':
        return [theme.colors.error, theme.colors.error]
      case 'ghost':
        return ['transparent', 'transparent']
      default:
        return [theme.colors.primary, theme.colors.primaryDark]
    }
  }

  const getTextColor = () => {
    switch (variant) {
      case 'ghost':
        return theme.colors.text
      default:
        return '#ffffff'
    }
  }

  const buttonColors = getButtonColors()
  const textColor = getTextColor()
  const styles = createStyles(theme, variant, size, isLandscape)

  return (
    <Pressable
      ref={gamepadNav.ref}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.container, style]}
    >
      <Animated.View style={[animatedStyle, focusStyle]}>
        <LinearGradient
          colors={buttonColors}
          style={[styles.button]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.text, { color: textColor }, textStyle]}>
            {title}
          </Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  )
}

const createStyles = (theme: any, variant: string, size: string, isLandscape: boolean) => {
  const sizeConfig = {
    sm: {
      paddingVertical: isLandscape ? 8 : 10,
      paddingHorizontal: isLandscape ? 12 : 16,
      fontSize: isLandscape ? 12 : 14,
      minHeight: isLandscape ? 32 : 36,
    },
    md: {
      paddingVertical: isLandscape ? 10 : 12,
      paddingHorizontal: isLandscape ? 16 : 20,
      fontSize: isLandscape ? 14 : 16,
      minHeight: isLandscape ? 40 : 44,
    },
    lg: {
      paddingVertical: isLandscape ? 12 : 16,
      paddingHorizontal: isLandscape ? 20 : 24,
      fontSize: isLandscape ? 16 : 18,
      minHeight: isLandscape ? 48 : 52,
    },
  }

  const config = sizeConfig[size as keyof typeof sizeConfig]

  return StyleSheet.create({
    container: {
      borderRadius: isLandscape ? 8 : 12,
      overflow: 'hidden',
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: config.paddingVertical,
      paddingHorizontal: config.paddingHorizontal,
      minHeight: config.minHeight,
      borderRadius: isLandscape ? 8 : 12,
      borderWidth: variant === 'ghost' ? 1 : 0,
      borderColor: variant === 'ghost' ? theme.colors.border : 'transparent',
    },
    text: {
      fontSize: config.fontSize,
      fontWeight: '600',
      textAlign: 'center',
    },
    icon: {
      marginRight: 8,
      fontSize: config.fontSize,
    },
  })
}
