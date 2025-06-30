import React, { memo } from 'react'
import {
  Text,
  StyleSheet,
  type ViewStyle,
} from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  variant?: 'default' | 'search' | 'error' | 'offline'
  style?: ViewStyle
}

const EmptyState: React.FC<EmptyStateProps> = memo(function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  variant = 'default',
  style,
}) {
  const { theme } = useTheme()
  const styles = createStyles(theme)

  const getVariantConfig = () => {
    switch (variant) {
      case 'search':
        return {
          icon: icon || 'search-outline',
          iconColor: theme.colors.textMuted,
          iconSize: 64,
        }
      case 'error':
        return {
          icon: icon || 'alert-circle-outline',
          iconColor: theme.colors.error,
          iconSize: 64,
        }
      case 'offline':
        return {
          icon: icon || 'cloud-offline-outline',
          iconColor: theme.colors.warning,
          iconSize: 64,
        }
      default:
        return {
          icon: icon || 'list-outline',
          iconColor: theme.colors.textMuted,
          iconSize: 64,
        }
    }
  }

  const config = getVariantConfig()

  return (
    <Animated.View 
      entering={FadeInUp.delay(200).springify()}
      style={[styles.container, style]}
    >
      <Animated.View 
        entering={FadeInUp.delay(300).springify()}
        style={styles.iconContainer}
      >
        <Ionicons
          name={config.icon}
          size={config.iconSize}
          color={config.iconColor}
        />
      </Animated.View>

      <Animated.View 
        entering={FadeInUp.delay(400).springify()}
        style={styles.textContainer}
      >
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </Animated.View>

      {actionLabel && onAction && (
        <Animated.View 
          entering={FadeInUp.delay(500).springify()}
          style={styles.actionContainer}
        >
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="outline"
            leftIcon={<Ionicons name="add" size={16} color={theme.colors.primary} />}
          />
        </Animated.View>
      )}
    </Animated.View>
  )
})

interface EmptyStateTemplatesProps {
  onAction?: () => void
}

// Pre-configured templates for common scenarios
export const EmptySearchResults: React.FC<EmptyStateTemplatesProps> = ({ onAction }) => (
  <EmptyState
    variant="search"
    title="No Results Found"
    subtitle="Try adjusting your search terms or filters to find what you're looking for."
    actionLabel={onAction ? "Clear Filters" : undefined}
    onAction={onAction}
  />
)

export const EmptyListings: React.FC<EmptyStateTemplatesProps> = ({ onAction }) => (
  <EmptyState
    icon="game-controller-outline"
    title="No Listings Yet"
    subtitle="Be the first to share your gaming experience!"
    actionLabel="Create Listing"
    onAction={onAction}
  />
)

export const EmptyGames: React.FC<EmptyStateTemplatesProps> = ({ onAction }) => (
  <EmptyState
    icon="library-outline"
    title="No Games Found"
    subtitle="We couldn't find any games matching your criteria."
    actionLabel={onAction ? "Browse All Games" : undefined}
    onAction={onAction}
  />
)

export const EmptyDevices: React.FC<EmptyStateTemplatesProps> = ({ onAction }) => (
  <EmptyState
    icon="phone-portrait-outline"
    title="No Devices Found"
    subtitle="No devices match your current search or filter criteria."
    actionLabel={onAction ? "Clear Filters" : undefined}
    onAction={onAction}
  />
)

export const NetworkError: React.FC<EmptyStateTemplatesProps> = ({ onAction }) => (
  <EmptyState
    variant="error"
    title="Connection Error"
    subtitle="Please check your internet connection and try again."
    actionLabel="Retry"
    onAction={onAction}
  />
)

export const OfflineState: React.FC<EmptyStateTemplatesProps> = ({ onAction }) => (
  <EmptyState
    variant="offline"
    title="You're Offline"
    subtitle="Some features may be limited while offline. Check your connection to access the full app."
    actionLabel={onAction ? "Retry Connection" : undefined}
    onAction={onAction}
  />
)

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconContainer: {
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 200,
  },
})

export default EmptyState