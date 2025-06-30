import React, { useState, memo } from 'react'
import {
  View,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type ImageStyle,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated'
import { Image, type ImageContentFit } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'

interface CachedImageProps {
  source: { uri: string } | string | number
  style?: ImageStyle
  containerStyle?: ViewStyle
  placeholder?: React.ReactNode
  errorPlaceholder?: React.ReactNode
  resizeMode?: ImageContentFit
  onLoad?: () => void
  onError?: () => void
  blurhash?: string
  priority?: 'low' | 'normal' | 'high'
  cachePolicy?: 'memory' | 'disk' | 'memory-disk'
}

const CachedImageComponent: React.FC<CachedImageProps> = ({
  source,
  style,
  containerStyle,
  placeholder,
  errorPlaceholder,
  resizeMode = 'cover',
  onLoad,
  onError,
  blurhash,
  priority = 'normal',
  cachePolicy = 'memory-disk',
}) => {
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.8)

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  const handleLoadStart = () => {
    setIsLoading(true)
    setHasError(false)
  }

  const handleLoadEnd = () => {
    setIsLoading(false)
    opacity.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 300 })
    )
    scale.value = withTiming(1, { duration: 300 })
    
    if (onLoad) {
      runOnJS(onLoad)()
    }
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    
    if (onError) {
      runOnJS(onError)()
    }
  }

  const styles = createStyles(theme)

  const DefaultPlaceholder = () => (
    <View style={[styles.placeholder, style]}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
    </View>
  )

  const DefaultErrorPlaceholder = () => (
    <View style={[styles.errorPlaceholder, style]}>
      <Ionicons 
        name="image-outline" 
        size={24} 
        color={theme.colors.textMuted} 
      />
    </View>
  )

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Loading placeholder */}
      {isLoading && (
        <View style={styles.overlayPlaceholder}>
          {placeholder || <DefaultPlaceholder />}
        </View>
      )}

      {/* Error placeholder */}
      {hasError && (
        <View style={styles.overlayPlaceholder}>
          {errorPlaceholder || <DefaultErrorPlaceholder />}
        </View>
      )}

      {/* Actual image */}
      {!hasError && (
        <Animated.View style={[animatedStyle, styles.imageContainer]}>
          <Image
            source={source}
            style={[styles.image, style]}
            contentFit={resizeMode}
            onLoadStart={handleLoadStart}
            onLoad={handleLoadEnd}
            onError={handleError}
            placeholder={blurhash}
            priority={priority}
            cachePolicy={cachePolicy}
            transition={300}
          />
        </Animated.View>
      )}
    </View>
  )
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    zIndex: 1,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  errorPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
})

export default memo(CachedImageComponent)