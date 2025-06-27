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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
  hapticFeedback?: boolean
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity)

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
  hapticFeedback = true,
}: ButtonProps) {
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
      scale.value = withSpring(0.96, {
        damping: 20,
        stiffness: 400,
      })
      backgroundOpacity.value = withTiming(0.8, { duration: 100 })
    }
  }

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 400,
      })
      backgroundOpacity.value = withTiming(1, { duration: 100 })
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
          borderRadius: 8,
        }
      case 'lg':
        return {
          paddingHorizontal: 24,
          paddingVertical: 16,
          minHeight: 56,
          borderRadius: 16,
        }
      default:
        return {
          paddingHorizontal: 20,
          paddingVertical: 12,
          minHeight: 48,
          borderRadius: 12,
        }
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return { fontSize: 14, fontWeight: '600' as const }
      case 'lg':
        return { fontSize: 16, fontWeight: '700' as const }
      default:
        return { fontSize: 15, fontWeight: '600' as const }
    }
  }

  const getVariantStyles = () => {
    const baseStyles = {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
      ...getSizeStyles(),
      ...(fullWidth && { width: '100%' as any }),
    }

    switch (variant) {
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: '#374151',
          borderWidth: 1,
          borderColor: '#4b5563',
        }
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: '#3b82f6',
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
          backgroundColor: '#3b82f6',
        }
    }
  }

  const getTextColor = () => {
    if (disabled) return '#6b7280'

    switch (variant) {
      case 'secondary':
        return '#e5e7eb'
      case 'outline':
        return '#3b82f6'
      case 'ghost':
        return '#3b82f6'
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
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.loadingIndicator}
        />
      )}
      {!loading && leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <Text style={textStyles}>{title}</Text>
      {!loading && rightIcon && (
        <View style={styles.rightIcon}>{rightIcon}</View>
      )}
    </View>
  )

  if (variant === 'gradient') {
    return (
      <AnimatedTouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          buttonStyles as any,
          { opacity: disabled ? 0.5 : 1 },
          style,
          animatedStyle,
        ]}
        activeOpacity={1}
      >
        <Animated.View
          style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}
        >
          <LinearGradient
            colors={disabled ? ['#6b7280', '#4b5563'] : ['#3b82f6', '#1d4ed8']}
            style={[
              StyleSheet.absoluteFillObject,
              { borderRadius: buttonStyles.borderRadius },
            ]}
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
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        buttonStyles as any,
        { opacity: disabled ? 0.5 : 1 },
        style,
        animatedStyle,
      ]}
      activeOpacity={1}
    >
      <Animated.View
        style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}
      />
      {renderContent()}
    </AnimatedTouchableOpacity>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
})
