import React, { type ReactNode } from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  View,
} from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useTheme } from '@/contexts/ThemeContext'
import {
  createSpringAnimation,
  createTimingAnimation,
  ANIMATION_CONFIG,
} from '@/lib/animation/config'

interface ButtonProps {
  title: string
  subtitle?: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  icon?: string
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
  hapticFeedback?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

export default function Button({
  title,
  subtitle,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  icon,
  style,
  textStyle,
  fullWidth = false,
  hapticFeedback = true,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { theme } = useTheme()
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)
  const backgroundOpacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }))

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = createSpringAnimation(ANIMATION_CONFIG.scale.press)
      backgroundOpacity.value = createTimingAnimation(0.85, 'fast')
    }
  }

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = createSpringAnimation(1)
      backgroundOpacity.value = createTimingAnimation(1, 'fast')
    }
  }

  const handlePress = () => {
    if (!disabled && !loading) {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
      onPress()
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: 12,
          paddingVertical: 8,
          minHeight: 36,
          borderRadius: theme.borderRadius.sm,
        }
      case 'lg':
        return {
          paddingHorizontal: 24,
          paddingVertical: 16,
          minHeight: 56,
          borderRadius: theme.borderRadius.lg,
        }
      default:
        return {
          paddingHorizontal: 20,
          paddingVertical: 12,
          minHeight: 48,
          borderRadius: theme.borderRadius.md,
        }
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return {
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
        }
      case 'lg':
        return {
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.bold,
        }
      default:
        return {
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.semibold,
        }
    }
  }

  const getVariantStyles = () => {
    const baseStyles = {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
      ...getSizeStyles(),
      ...(fullWidth && { width: '100%' as '100%' }),
    }

    switch (variant) {
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
        }
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
        }
      case 'gradient':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
        }
      default:
        return {
          ...baseStyles,
          backgroundColor: theme.colors.primary,
        }
    }
  }

  const getTextColor = () => {
    if (disabled) return theme.colors.textMuted

    switch (variant) {
      case 'secondary':
        return theme.colors.text
      case 'outline':
        return theme.colors.primary
      case 'ghost':
        return theme.colors.primary
      default:
        return '#ffffff'
    }
  }

  const buttonStyles = getVariantStyles()
  const textStyles = {
    ...getTextSize(),
    color: getTextColor(),
    ...textStyle,
  }

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading && (
        <ActivityIndicator size="small" color={getTextColor()} style={styles.loadingIcon} />
      )}
      {leftIcon && !loading && <View style={styles.leftIcon}>{leftIcon}</View>}
      {icon && !loading && (
        <View style={styles.leftIcon}>
          <Text style={{ color: getTextColor(), fontSize: 16 }}>{icon}</Text>
        </View>
      )}
      <View style={subtitle ? styles.textContainer : undefined}>
        <Text style={textStyles}>{title}</Text>
        {subtitle && (
          <Text style={[textStyles, { fontSize: textStyles.fontSize * 0.8, opacity: 0.8 }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  )

  if (variant === 'gradient') {
    return (
      <AnimatedTouchableOpacity
        style={[buttonStyles, style, animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading }}
      >
        <Animated.View style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        {renderContent()}
      </AnimatedTouchableOpacity>
    )
  }

  return (
    <AnimatedTouchableOpacity
      style={[buttonStyles, style, animatedStyle, disabled && styles.disabled]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {renderContent()}
    </AnimatedTouchableOpacity>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  loadingIcon: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 4,
  },
  rightIcon: {
    marginLeft: 4,
  },
  disabled: {
    opacity: 0.6,
  },
})
