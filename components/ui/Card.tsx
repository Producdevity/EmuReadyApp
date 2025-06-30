import React, { type ReactNode } from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  type ViewStyle,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useTheme } from '@/contexts/ThemeContext'

interface CardProps {
  children?: ReactNode
  style?: ViewStyle
  onPress?: () => void
  onLongPress?: () => void
  variant?: 'default' | 'glass' | 'gradient' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  elevation?: number
  borderRadius?: number
  disabled?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityRole?: 'button' | 'none'
}

export default function Card({
  children,
  style,
  onPress,
  onLongPress,
  variant = 'default',
  size = 'md',
  padding = 'md',
  elevation = 2,
  borderRadius,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
}: CardProps) {
  const { theme } = useTheme()
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const handlePressIn = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(0.98, {
        damping: 20,
        stiffness: 300,
      })
      opacity.value = withTiming(0.8, { duration: 150 })
    }
  }

  const handlePressOut = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
      })
      opacity.value = withTiming(1, { duration: 150 })
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { minHeight: 60 }
      case 'lg':
        return { minHeight: 120 }
      default:
        return { minHeight: 80 }
    }
  }

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 }
      case 'sm':
        return { padding: theme.spacing.sm }
      case 'lg':
        return { padding: theme.spacing.lg }
      default:
        return { padding: theme.spacing.md }
    }
  }

  const getVariantStyles = () => {
    const cardBorderRadius = borderRadius || theme.borderRadius.lg
    const baseStyles = {
      borderRadius: cardBorderRadius,
      overflow: 'hidden' as const,
      ...getSizeStyles(),
      ...getPaddingStyles(),
    }

    switch (variant) {
      case 'glass':
        return {
          ...baseStyles,
          backgroundColor: theme.isDark
            ? 'rgba(31, 41, 55, 0.6)'
            : 'rgba(255, 255, 255, 0.6)',
          borderWidth: 1,
          borderColor: theme.isDark
            ? 'rgba(75, 85, 99, 0.3)'
            : 'rgba(209, 213, 219, 0.3)',
        }
      case 'gradient':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
        }
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border,
        }
      default:
        return {
          ...baseStyles,
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
          shadowOffset: {
            width: 0,
            height: elevation,
          },
          shadowOpacity: theme.isDark ? 0.3 : 0.1,
          shadowRadius: elevation * 2,
          elevation: Platform.OS === 'android' ? elevation : 0,
        }
    }
  }

  const renderCardContent = () => (
    <Animated.View style={[getVariantStyles(), style, animatedStyle]}>
      {variant === 'glass' && (
        <BlurView
          intensity={20}
          tint={theme.isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {variant === 'gradient' && (
        <LinearGradient
          colors={
            theme.isDark
              ? ['rgba(55, 65, 81, 0.8)', 'rgba(31, 41, 55, 0.9)']
              : ['rgba(248, 250, 252, 0.8)', 'rgba(241, 245, 249, 0.9)']
          }
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <View style={{ zIndex: 1 }}>{children}</View>
    </Animated.View>
  )

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={disabled}
        style={{ opacity: disabled ? 0.5 : 1 }}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
      >
        {renderCardContent()}
      </TouchableOpacity>
    )
  }

  return renderCardContent()
}
