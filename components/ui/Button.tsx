import { useTheme } from '@/contexts/ThemeContext'
import { ANIMATION_CONFIG } from '@/lib/animation/config'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import React, { type ReactNode } from 'react'
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  type TextStyle,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

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
      scale.value = withSpring(0.97, {
        damping: 30,
        stiffness: 400,
        mass: 0.8,
      })
      backgroundOpacity.value = withTiming(0.9, {
        duration: 100,
        easing: ANIMATION_CONFIG.easing.out,
      })
    }
  }

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, {
        damping: 25,
        stiffness: 350,
        mass: 0.7,
      })
      backgroundOpacity.value = withTiming(1, {
        duration: 150,
        easing: ANIMATION_CONFIG.easing.out,
      })
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
          backgroundColor: theme.colors.surfaceElevated,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: theme.isDark ? 0.2 : 0.05,
          shadowRadius: 3,
          elevation: Platform.OS === 'android' ? 2 : 0,
        }
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 2,
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
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: Platform.OS === 'android' ? 4 : 0,
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
        return theme.colors.textInverse
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
            colors={theme.colors.gradients.primary as [string, string, ...string[]]}
            style={[StyleSheet.absoluteFillObject, { borderRadius: buttonStyles.borderRadius }]}
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
