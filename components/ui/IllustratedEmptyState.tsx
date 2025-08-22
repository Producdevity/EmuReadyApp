import { useTheme } from '@/contexts/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React, { memo } from 'react'
import { StyleSheet, Text, View, type ViewStyle } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import Button from './Button'
import { GlassCard } from './GlassMorphism'

interface IllustratedEmptyStateProps {
  type: 'listings' | 'favorites' | 'activity' | 'games' | 'devices' | 'emulators' | 'search'
  title?: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  style?: ViewStyle
}

const IllustratedEmptyState: React.FC<IllustratedEmptyStateProps> = memo(
  function IllustratedEmptyState({ type, title, subtitle, actionLabel, onAction, style }) {
    const { theme } = useTheme()
    const styles = createStyles(theme)

    const getIllustrationConfig = () => {
      switch (type) {
        case 'listings':
          return {
            title: title || 'No Listings Yet',
            subtitle: subtitle || 'Share your emulation experiences with the community',
            icons: ['game-controller', 'star', 'chatbubble'],
            colors: [theme.colors.primary, theme.colors.warning, theme.colors.secondary],
            gradientColors: theme.colors.gradients.primary,
          }
        case 'favorites':
          return {
            title: title || 'No Favorites Yet',
            subtitle: subtitle || 'Favorite listings will appear here for quick access',
            icons: ['heart', 'bookmark', 'star'],
            colors: [theme.colors.error, theme.colors.secondary, theme.colors.warning],
            gradientColors: theme.colors.gradients.secondary,
          }
        case 'activity':
          return {
            title: title || 'No Activity Yet',
            subtitle: subtitle || 'Your interactions and contributions will appear here',
            icons: ['time', 'trending-up', 'analytics'],
            colors: [theme.colors.info, theme.colors.success, theme.colors.primary],
            gradientColors: theme.colors.gradients.primary,
          }
        case 'games':
          return {
            title: title || 'No Games Found',
            subtitle: subtitle || 'Try adjusting your search or browse all games',
            icons: ['game-controller', 'library', 'grid'],
            colors: [theme.colors.primary, theme.colors.secondary, theme.colors.accent],
            gradientColors: theme.colors.gradients.gaming,
          }
        case 'devices':
          return {
            title: title || 'No Devices Found',
            subtitle: subtitle || 'Devices will appear here once available',
            icons: ['phone-portrait', 'tablet-portrait', 'desktop'],
            colors: [theme.colors.primary, theme.colors.secondary, theme.colors.info],
            gradientColors: theme.colors.gradients.hero,
          }
        case 'emulators':
          return {
            title: title || 'No Emulators Found',
            subtitle: subtitle || 'Emulators will be listed here',
            icons: ['apps', 'cube', 'layers'],
            colors: [theme.colors.secondary, theme.colors.primary, theme.colors.accent],
            gradientColors: theme.colors.gradients.primary,
          }
        case 'search':
          return {
            title: title || 'No Results Found',
            subtitle: subtitle || 'Try adjusting your search terms or filters',
            icons: ['search', 'filter', 'options'],
            colors: [theme.colors.textMuted, theme.colors.textSecondary, theme.colors.text],
            gradientColors: [theme.colors.surface, theme.colors.surfaceElevated],
          }
        default:
          return {
            title: title || 'Nothing Here Yet',
            subtitle: subtitle || 'Check back later for new content',
            icons: ['list', 'add-circle', 'refresh'],
            colors: [theme.colors.text, theme.colors.primary, theme.colors.secondary],
            gradientColors: theme.colors.gradients.primary,
          }
      }
    }

    const config = getIllustrationConfig()

    return (
      <GlassCard style={[styles.container, style]} intensity={15} elevation={2} animated={true}>
        {/* Illustration Container */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.illustrationContainer}>
          <View style={styles.illustrationBackground}>
            <LinearGradient
              colors={[config.gradientColors[0], config.gradientColors[1], 'transparent']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>

          {/* Decorative Icons Grid */}
          <View style={styles.iconsGrid}>
            {config.icons.map((icon, index) => (
              <View
                key={icon}
                style={[
                  styles.iconWrapper,
                  {
                    transform: [
                      { translateX: index === 0 ? -30 : index === 2 ? 30 : 0 },
                      { translateY: index === 1 ? -20 : 10 },
                    ],
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: `${config.colors[index]}20`,
                      borderColor: `${config.colors[index]}40`,
                    },
                  ]}
                >
                  <Ionicons
                    name={icon as keyof typeof Ionicons.glyphMap}
                    size={32}
                    color={config.colors[index]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.textContainer}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>
        </Animated.View>

        {/* Action Button */}
        {actionLabel && onAction && (
          <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.actionContainer}>
            <Button
              title={actionLabel}
              onPress={onAction}
              variant="primary"
              leftIcon={
                <Ionicons
                  name={type === 'listings' ? 'add' : 'arrow-forward'}
                  size={16}
                  color={theme.colors.textInverse}
                />
              }
            />
          </Animated.View>
        )}
      </GlassCard>
    )
  },
)

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingVertical: 48,
      minHeight: 300,
    },
    illustrationContainer: {
      width: 200,
      height: 150,
      marginBottom: 32,
      position: 'relative',
    },
    illustrationBackground: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 90,
      top: -15,
      left: 10,
      opacity: 0.1,
    },
    iconsGrid: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconWrapper: {
      position: 'absolute',
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textContainer: {
      alignItems: 'center',
      marginBottom: 24,
      maxWidth: 300,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    actionContainer: {
      width: '100%',
      maxWidth: 220,
    },
  })

export default IllustratedEmptyState