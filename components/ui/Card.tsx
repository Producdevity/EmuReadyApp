import { useTheme } from '@/contexts/ThemeContext'
import { ANIMATION_CONFIG } from '@/lib/animation/config'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import React, { type ReactNode } from 'react'
import { Platform, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

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
  disableAnimations?: boolean
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
  disableAnimations = false,
}: CardProps) {
  const { theme } = useTheme()
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => {
    if (disableAnimations) {
      return {}
    }
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }
  })

  const handlePressIn = () => {
    if (onPress && !disabled && !disableAnimations) {
      scale.value = withSpring(0.98, {
        damping: 30,
        stiffness: 400,
        mass: 0.8,
      })
      opacity.value = withTiming(0.95, {
        duration: 100,
        easing: ANIMATION_CONFIG.easing.out,
      })
    }
  }

  const handlePressOut = () => {
    if (onPress && !disabled && !disableAnimations) {
      scale.value = withSpring(1, {
        damping: 25,
        stiffness: 350,
        mass: 0.7,
      })
      opacity.value = withTiming(1, {
        duration: 150,
        easing: ANIMATION_CONFIG.easing.out,
      })
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
          backgroundColor: theme.colors.glass,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
          backdropFilter: 'blur(12px)',
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
          borderWidth: theme.isDark ? 1 : 0,
          borderColor: theme.isDark ? theme.colors.border : 'transparent',
          shadowColor: theme.colors.shadow,
          shadowOffset: {
            width: 0,
            height: elevation * 0.5,
          },
          shadowOpacity: theme.isDark ? 0.4 : 0.08,
          shadowRadius: elevation * 3,
          elevation: Platform.OS === 'android' ? elevation * 1.5 : 0,
        }
    }
  }

  const renderCardContent = () => (
    <Animated.View style={[getVariantStyles(), style, animatedStyle]}>
      {variant === 'glass' && (
        <BlurView
          intensity={theme.isDark ? 30 : 25}
          tint={theme.isDark ? 'dark' : 'light'}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: borderRadius || theme.borderRadius.lg },
          ]}
        />
      )}
      {variant === 'gradient' && (
        <LinearGradient
          colors={theme.colors.gradients.card as [string, string, ...string[]]}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: borderRadius || theme.borderRadius.lg },
          ]}
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
