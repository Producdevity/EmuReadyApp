import React, { memo } from 'react'
import {
  Text,
  StyleSheet,
  Pressable,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SlideInDown,
  SlideOutUp,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import useOfflineMode from '@/hooks/useOfflineMode'

interface NetworkStatusIndicatorProps {
  position?: 'top' | 'bottom'
  showWhenOnline?: boolean
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  position = 'bottom',
  showWhenOnline = false,
}) => {
  const { theme } = useTheme()
  const {
    isOnline,
    isConnected,
    connectionType,
    hasOfflineData,
    offlineQueue,
    forceSync,
  } = useOfflineMode()

  const styles = createStyles(theme)
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePress = async () => {
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 100 })
    })

    if (isOnline && hasOfflineData) {
      await forceSync()
    }
  }

  // Don't show anything if online and showWhenOnline is false
  if (isOnline && !showWhenOnline && !hasOfflineData) {
    return null
  }

  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        icon: 'wifi-outline' as const,
        text: 'No Connection',
        color: theme.colors.error,
        backgroundColor: `${theme.colors.error}20`,
      }
    }

    if (!isOnline) {
      return {
        icon: 'cloud-offline-outline' as const,
        text: hasOfflineData 
          ? `Offline Mode (${offlineQueue.length} pending)` 
          : 'Offline Mode',
        color: theme.colors.warning,
        backgroundColor: `${theme.colors.warning}20`,
      }
    }

    if (hasOfflineData) {
      return {
        icon: 'sync-outline' as const,
        text: `Syncing ${offlineQueue.length} items...`,
        color: theme.colors.info,
        backgroundColor: `${theme.colors.info}20`,
      }
    }

    return {
      icon: 'wifi-outline' as const,
      text: `Online (${connectionType})`,
      color: theme.colors.success,
      backgroundColor: `${theme.colors.success}20`,
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Animated.View
      entering={SlideInDown.springify()}
      exiting={SlideOutUp.springify()}
      style={[
        styles.container,
        { backgroundColor: statusInfo.backgroundColor },
        position === 'top' ? styles.positionTop : styles.positionBottom,
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={styles.content}
        disabled={!isOnline || !hasOfflineData}
      >
        <Animated.View style={[styles.indicator, animatedStyle]}>
          <Ionicons
            name={statusInfo.icon}
            size={16}
            color={statusInfo.color}
          />
          <Text style={[styles.text, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
          
          {isOnline && hasOfflineData && (
            <Ionicons
              name="chevron-forward"
              size={14}
              color={statusInfo.color}
              style={styles.actionIcon}
            />
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

const createStyles = (_theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  positionTop: {
    top: 0,
    paddingTop: 50, // Account for status bar
  },
  positionBottom: {
    bottom: 100, // Account for tab bar
  },
  content: {
    borderRadius: 8,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  actionIcon: {
    marginLeft: 4,
  },
})

export default memo(NetworkStatusIndicator)