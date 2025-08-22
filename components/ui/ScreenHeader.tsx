import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { View, Text, StyleSheet, type ViewStyle } from 'react-native'
import Animated, { SlideInLeft } from 'react-native-reanimated'
import { GradientTitle, TypewriterText } from '@/components/themed/ThemedText'
import { AnimatedPressable } from '@/components/ui/MicroInteractions'
import { useTheme } from '@/contexts/ThemeContext'
import { getBaseDelay } from '@/lib/animation/config'

interface ScreenHeaderProps {
  title: string
  subtitle?: string
  variant?: 'default' | 'gradient' | 'hero'
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap
    onPress: () => void
    label?: string
  }
  badge?: {
    count: number
    color?: string
  }
  style?: ViewStyle
  animated?: boolean
}

export function ScreenHeader({
  title,
  subtitle,
  variant = 'default',
  rightAction,
  badge,
  style,
  animated = true,
}: ScreenHeaderProps) {
  const { theme } = useTheme()

  const renderTitle = () => {
    switch (variant) {
      case 'gradient':
        return (
          <GradientTitle animated={animated} style={styles.title}>
            {title}
          </GradientTitle>
        )
      case 'hero':
        return (
          <View>
            <GradientTitle animated={animated} style={styles.heroTitle}>
              {title}
            </GradientTitle>
            {subtitle && (
              <TypewriterText
                animated={animated}
                delay={300}
                style={[
                  styles.heroSubtitle,
                  {
                    color: theme.isDark
                      ? `${theme.colors.textInverse}CC`
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {subtitle}
              </TypewriterText>
            )}
          </View>
        )
      default:
        return (
          <View>
            <Text
              style={{
                fontSize: theme.typography.fontSize.xxl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
                marginBottom: subtitle ? theme.spacing.sm : 0,
              }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{
                  fontSize: theme.typography.fontSize.md,
                  color: theme.colors.textSecondary,
                  lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
                }}
              >
                {subtitle}
              </Text>
            )}
          </View>
        )
    }
  }

  const content = (
    <View
      style={[
        {
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.lg,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1 }}>
          {renderTitle()}
          {badge && variant === 'default' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.sm,
                marginTop: theme.spacing.sm,
              }}
            >
              <View
                style={{
                  backgroundColor: badge.color || theme.colors.error,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borderRadius.md,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.textInverse,
                  }}
                >
                  {badge.count}
                </Text>
              </View>
            </View>
          )}
        </View>
        {rightAction && (
          <AnimatedPressable onPress={rightAction.onPress}>
            <View
              style={{
                backgroundColor: theme.colors.surface,
                paddingHorizontal: rightAction.label ? theme.spacing.md : theme.spacing.sm,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.borderRadius.md,
                borderWidth: 1,
                borderColor: theme.colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.sm,
              }}
            >
              <Ionicons name={rightAction.icon} size={20} color={theme.colors.primary} />
              {rightAction.label && (
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.primary,
                  }}
                >
                  {rightAction.label}
                </Text>
              )}
            </View>
          </AnimatedPressable>
        )}
      </View>
    </View>
  )

  if (animated) {
    return (
      <Animated.View entering={SlideInLeft.delay(getBaseDelay('instant')).springify().damping(15)}>
        {variant === 'hero' && (
          <LinearGradient
            colors={['transparent', `${theme.colors.primary}10`, 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        {content}
      </Animated.View>
    )
  }

  return content
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
})