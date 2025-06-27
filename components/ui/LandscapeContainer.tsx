import React from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  ViewStyle,
  SafeAreaView,
  Dimensions,
} from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { useOrientationOptimized } from '@/hooks/useGamepadNavigation'

interface LandscapeContainerProps {
  children: React.ReactNode
  style?: ViewStyle
  scrollable?: boolean
  enableGamepadHints?: boolean
  paddingHorizontal?: number
  paddingVertical?: number
  useSafeArea?: boolean
}

export default function LandscapeContainer({
  children,
  style,
  scrollable = true,
  enableGamepadHints = true,
  paddingHorizontal,
  paddingVertical,
  useSafeArea = true,
}: LandscapeContainerProps) {
  const { theme } = useTheme()
  const { isLandscape } = useOrientationOptimized()

  // Adjust padding based on orientation and device type
  const getOptimizedPadding = () => {
    const { width } = Dimensions.get('window')
    
    // Gaming handheld optimization
    if (Platform.OS === 'android' && isLandscape) {
      // Retroid Pocket 2: 854x480 resolution
      // AYN Odin 2: 1920x1080 resolution
      const isHighResolution = width >= 1900 // AYN Odin 2
      const isMediumResolution = width >= 800 && width < 1900 // Retroid Pocket 2
      
      if (isHighResolution) {
        return {
          horizontal: paddingHorizontal ?? 32,
          vertical: paddingVertical ?? 16,
        }
      } else if (isMediumResolution) {
        return {
          horizontal: paddingHorizontal ?? 24,
          vertical: paddingVertical ?? 12,
        }
      }
    }

    // Default padding for portrait or non-gaming devices
    return {
      horizontal: paddingHorizontal ?? (isLandscape ? 24 : 16),
      vertical: paddingVertical ?? (isLandscape ? 12 : 16),
    }
  }

  const padding = getOptimizedPadding()
  const styles = createStyles(theme, isLandscape, padding)

  const ContentWrapper = scrollable ? ScrollView : View
  const ContainerWrapper = useSafeArea ? SafeAreaView : View

  const contentProps = scrollable
    ? {
        showsVerticalScrollIndicator: false,
        showsHorizontalScrollIndicator: false,
        contentContainerStyle: styles.scrollContent,
        // Optimize scroll behavior for gaming handhelds
        decelerationRate: Platform.OS === 'android' && isLandscape ? 'fast' : 'normal',
        scrollEventThrottle: 16,
      }
    : {}

  return (
    <ContainerWrapper style={[styles.container, style]}>
      <ContentWrapper {...contentProps} style={scrollable ? undefined : styles.content}>
        {children}
      </ContentWrapper>

      {/* Gaming handheld specific optimizations */}
      {Platform.OS === 'android' && isLandscape && enableGamepadHints && (
        <View style={styles.gamepadHints}>
          {/* Add gamepad navigation hints here if needed */}
        </View>
      )}
    </ContainerWrapper>
  )
}

const createStyles = (theme: any, isLandscape: boolean, padding: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: padding.horizontal,
      paddingVertical: padding.vertical,
    },
    scrollContent: {
      paddingHorizontal: padding.horizontal,
      paddingVertical: padding.vertical,
      // Add extra bottom padding for gamepad navigation
      paddingBottom: Platform.OS === 'android' && isLandscape ? padding.vertical + 20 : padding.vertical,
    },
    gamepadHints: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      // Reserved space for gamepad hints
    },
  }) 