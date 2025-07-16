import React, { useEffect } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useTheme } from '@/contexts/ThemeContext'

interface GlassMorphismProps {
  children: React.ReactNode
  intensity?: number
  style?: any
  variant?: 'default' | 'frosted' | 'crystal' | 'ambient' | 'dynamic'
  borderRadius?: number
  animated?: boolean
  pressable?: boolean
  onPress?: () => void
  elevation?: number
  tintColor?: string
  gradientOpacity?: number
  borderWidth?: number
  borderColor?: string
}

export default function GlassMorphism({
  children,
  intensity = 20,
  style,
  variant = 'default',
  borderRadius = 16,
  animated = true,
  pressable = false,
  onPress,
  elevation = 0,
  tintColor,
  gradientOpacity = 0.1,
  borderWidth = 1,
  borderColor,
}: GlassMorphismProps) {
  const { theme } = useTheme()
  const animatedValue = useSharedValue(0)
  const scaleValue = useSharedValue(1)
  const opacityValue = useSharedValue(1)

  useEffect(() => {
    if (animated) {
      animatedValue.value = withSpring(1, {
        damping: 25,
        stiffness: 300,
        mass: 0.8,
      })
    } else {
      animatedValue.value = 1
    }
  }, [animated, animatedValue])

  const getVariantConfig = () => {
    switch (variant) {
      case 'frosted':
        return {
          blurIntensity: intensity + 10,
          backgroundColor: theme.isDark 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(255, 255, 255, 0.25)',
          borderColor: theme.isDark 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(255, 255, 255, 0.3)',
          shadowColor: theme.colors.shadow,
          shadowOpacity: 0.15,
        }
      case 'crystal':
        return {
          blurIntensity: intensity + 5,
          backgroundColor: theme.isDark 
            ? 'rgba(124, 58, 237, 0.08)' 
            : 'rgba(124, 58, 237, 0.12)',
          borderColor: theme.isDark 
            ? 'rgba(124, 58, 237, 0.2)' 
            : 'rgba(124, 58, 237, 0.3)',
          shadowColor: theme.colors.primary,
          shadowOpacity: 0.2,
        }
      case 'ambient':
        return {
          blurIntensity: intensity - 5,
          backgroundColor: theme.isDark 
            ? 'rgba(0, 0, 0, 0.3)' 
            : 'rgba(255, 255, 255, 0.4)',
          borderColor: theme.isDark 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.08)',
          shadowColor: theme.colors.shadow,
          shadowOpacity: 0.1,
        }
      case 'dynamic':
        return {
          blurIntensity: intensity + 15,
          backgroundColor: theme.isDark 
            ? 'rgba(30, 30, 30, 0.6)' 
            : 'rgba(250, 250, 250, 0.6)',
          borderColor: theme.isDark 
            ? 'rgba(124, 58, 237, 0.3)' 
            : 'rgba(124, 58, 237, 0.4)',
          shadowColor: theme.colors.primary,
          shadowOpacity: 0.25,
        }
      default:
        return {
          blurIntensity: intensity,
          backgroundColor: theme.colors.glass,
          borderColor: borderColor || theme.colors.borderLight,
          shadowColor: theme.colors.shadow,
          shadowOpacity: theme.isDark ? 0.3 : 0.1,
        }
    }
  }

  const config = getVariantConfig()

  const handlePressIn = () => {
    if (pressable) {
      scaleValue.value = withSpring(0.98, {
        damping: 30,
        stiffness: 400,
      })
      opacityValue.value = withTiming(0.9, { duration: 100 })
    }
  }

  const handlePressOut = () => {
    if (pressable) {
      scaleValue.value = withSpring(1, {
        damping: 25,
        stiffness: 350,
      })
      opacityValue.value = withTiming(1, { duration: 150 })
    }
  }

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      animatedValue.value,
      [0, 1],
      [20, 0],
      Extrapolation.CLAMP
    )
    
    const opacity = interpolate(
      animatedValue.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    )

    return {
      transform: [
        { translateY },
        { scale: scaleValue.value }
      ],
      opacity: opacity * opacityValue.value,
    }
  })

  const containerStyle = [
    styles.container,
    {
      borderRadius,
      borderWidth,
      borderColor: config.borderColor,
      backgroundColor: config.backgroundColor,
      shadowColor: config.shadowColor,
      shadowOffset: {
        width: 0,
        height: elevation * 2,
      },
      shadowOpacity: config.shadowOpacity,
      shadowRadius: elevation * 4,
      elevation: Platform.OS === 'android' ? elevation : 0,
    },
    style,
  ]

  const Component = pressable ? Animated.createAnimatedComponent(View) : Animated.View

  return (
    <Component
      style={[containerStyle, animatedStyle]}
      onTouchStart={pressable ? handlePressIn : undefined}
      onTouchEnd={pressable ? handlePressOut : undefined}
      onPress={pressable ? onPress : undefined}
    >
      {/* Blur Background */}
      <BlurView
        intensity={config.blurIntensity}
        tint={tintColor || (theme.isDark ? 'dark' : 'light')}
        style={[
          StyleSheet.absoluteFillObject,
          { borderRadius: borderRadius - borderWidth }
        ]}
      />

      {/* Gradient Overlay */}
      {variant === 'crystal' && (
        <LinearGradient
          colors={[
            `rgba(124, 58, 237, ${gradientOpacity})`,
            `rgba(91, 33, 182, ${gradientOpacity * 0.8})`,
            `rgba(124, 58, 237, ${gradientOpacity * 0.6})`,
          ]}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: borderRadius - borderWidth }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* Dynamic Gradient for 'dynamic' variant */}
      {variant === 'dynamic' && (
        <LinearGradient
          colors={theme.colors.gradients.primary as [string, string, ...string[]]}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: borderRadius - borderWidth, opacity: 0.1 }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Highlight Border Effect */}
      {variant === 'crystal' && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: borderRadius - borderWidth,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.2)',
            }
          ]}
        />
      )}
    </Component>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
})

// Predefined glass morphism variants for common use cases
export const GlassCard = ({ children, ...props }: Omit<GlassMorphismProps, 'variant'>) => (
  <GlassMorphism variant="frosted" elevation={3} {...props}>
    {children}
  </GlassMorphism>
)

export const CrystalCard = ({ children, ...props }: Omit<GlassMorphismProps, 'variant'>) => (
  <GlassMorphism variant="crystal" elevation={4} {...props}>
    {children}
  </GlassMorphism>
)

export const AmbientCard = ({ children, ...props }: Omit<GlassMorphismProps, 'variant'>) => (
  <GlassMorphism variant="ambient" elevation={1} {...props}>
    {children}
  </GlassMorphism>
)

export const DynamicCard = ({ children, ...props }: Omit<GlassMorphismProps, 'variant'>) => (
  <GlassMorphism variant="dynamic" elevation={5} animated={true} {...props}>
    {children}
  </GlassMorphism>
)