import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { memo, useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import {
  MICRO_SPRING_CONFIG,
} from '@/components/ui/MicroInteractions'
import MorphingSkeleton from '@/components/ui/MorphingSkeleton'
import { useTheme } from '@/contexts/ThemeContext'
import { useRawgSearchGameImages, useTgdbSearchGameImages } from '@/lib/api/hooks'

interface GameMediaSectionProps {
  gameName: string
  gameId?: string
  compact?: boolean
}

const AnimatedImage = Animated.createAnimatedComponent(Image)

export default function GameMediaSection({
  gameName,
  gameId: _gameId,
  compact = false,
}: GameMediaSectionProps) {
  const { theme } = useTheme()
  const [selectedSource, setSelectedSource] = useState<'rawg' | 'tgdb'>('rawg')

  // Animation values
  const headerGlow = useSharedValue(0)
  const selectorScale = useSharedValue(1)
  const mediaScale = useSharedValue(0.95)
  const mediaOpacity = useSharedValue(0)
  const shimmerX = useSharedValue(-200)

  // Fetch media from both sources - MUST be called before any conditional returns
  const { data: rawgData, isLoading: rawgLoading } = useRawgSearchGameImages(
    { query: gameName, pageSize: compact ? 4 : 8 },
    { enabled: !!gameName },
  )

  const { data: tgdbData, isLoading: tgdbLoading } = useTgdbSearchGameImages(
    { name: gameName },
    { enabled: !!gameName },
  )

  // Animated styles - MUST be defined before any conditional returns
  const headerGlowStyle = useAnimatedStyle(() => ({
    opacity: headerGlow.value,
  }))

  const selectorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: selectorScale.value }],
  }))

  const mediaContainerStyle = useAnimatedStyle(() => ({
    opacity: mediaOpacity.value,
    transform: [{ scale: mediaScale.value }],
  }))

  const _shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }))

  useEffect(() => {
    // Initialize entrance animations
    headerGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 2000 }), withTiming(0.3, { duration: 2000 })),
      -1,
      true,
    )

    mediaScale.value = withSpring(1, MICRO_SPRING_CONFIG.bouncy)
    mediaOpacity.value = withTiming(1, { duration: 600 })

    shimmerX.value = withRepeat(withTiming(400, { duration: 3000 }), -1, false)
  }, [headerGlow, mediaOpacity, mediaScale, shimmerX])

  const isLoading = selectedSource === 'rawg' ? rawgLoading : tgdbLoading
  const data = selectedSource === 'rawg' ? rawgData : tgdbData

  const handleImagePress = (item: any) => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
    router.push(`/media/${selectedSource}/${item.id}?name=${encodeURIComponent(item.name)}`)
  }

  const handleViewAllPress = () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
    router.push(`/media?search=${encodeURIComponent(gameName)}&source=${selectedSource}`)
  }

  const handleSourceChange = (source: 'rawg' | 'tgdb') => {
    Haptics.selectionAsync()
    selectorScale.value = withSequence(
      withSpring(0.95, MICRO_SPRING_CONFIG.instant),
      withSpring(1, MICRO_SPRING_CONFIG.bouncy),
    )
    setSelectedSource(source)
  }

  if (!gameName || (!rawgData?.length && !tgdbData?.length)) {
    return null
  }

  return (
    <View
      style={[{
        marginBottom: compact ? theme.spacing.md : theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        overflow: 'hidden'
      }]}
    >
      <View style={styles.content}>
          <View style={styles.header}>
            {/* Header glow effect */}
            <Animated.View style={[styles.headerGlow, headerGlowStyle]}>
              <LinearGradient
                colors={['transparent', `${theme.colors.primary}20`, 'transparent']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>

            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Game Media
            </Text>

            {!compact && (
              <TouchableOpacity onPress={handleViewAllPress}>
                <View style={[styles.viewAllButton, { backgroundColor: `${theme.colors.primary}20` }]}>
                  <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>View All</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Enhanced Source Selector */}
          {!compact && (
            <Animated.View style={selectorAnimatedStyle}>
              <View style={[styles.sourceSelector, { backgroundColor: theme.colors.surface }]}>
                <TouchableOpacity onPress={() => handleSourceChange('rawg')}>
                  <View
                    style={[
                      styles.sourceButton,
                      selectedSource === 'rawg' && styles.sourceButtonActive,
                    ]}
                  >
                    {selectedSource === 'rawg' && (
                      <LinearGradient
                        colors={theme.colors.gradients.primary}
                        style={StyleSheet.absoluteFillObject}
                      />
                    )}
                    <Text
                      style={[
                        styles.sourceButtonText,
                        { color: selectedSource === 'rawg' ? theme.colors.textInverse : theme.colors.text },
                        selectedSource === 'rawg' && styles.sourceButtonTextActive,
                      ]}
                    >
                      RAWG
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleSourceChange('tgdb')}>
                  <View
                    style={[
                      styles.sourceButton,
                      selectedSource === 'tgdb' && styles.sourceButtonActive,
                    ]}
                  >
                    {selectedSource === 'tgdb' && (
                      <LinearGradient
                        colors={theme.colors.gradients.secondary}
                        style={StyleSheet.absoluteFillObject}
                      />
                    )}
                    <Text
                      style={[
                        styles.sourceButtonText,
                        { color: selectedSource === 'tgdb' ? theme.colors.textInverse : theme.colors.text },
                        selectedSource === 'tgdb' && styles.sourceButtonTextActive,
                      ]}
                    >
                      TGDB
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Enhanced Media Grid */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <MorphingSkeleton
                variant="pulse"
                speed="fast"
                width={80}
                height={16}
                borderRadius={8}
              />
            </View>
          ) : data && data.length > 0 ? (
            <Animated.View style={mediaContainerStyle}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.mediaRow}>
                  {data.slice(0, compact ? 3 : 6).map((item: any, index: number) => {
                    const imageUrl =
                      selectedSource === 'rawg'
                        ? item.background_image || item.short_screenshots?.[0]?.image
                        : item.thumb || item.images?.[0]?.thumb

                    return (
                      <MediaImageCard
                        key={index}
                        item={item}
                        imageUrl={imageUrl}
                        index={index}
                        compact={compact}
                        onPress={() => handleImagePress(item)}
                        theme={theme}
                      />
                    )
                  })}

                  {/* Enhanced View More Button */}
                  {data.length > (compact ? 3 : 6) && (
                    <TouchableOpacity onPress={handleViewAllPress}>
                      <View
                        style={[
                          styles.viewMoreButton,
                          {
                            width: compact ? 100 : 120,
                            height: compact ? 60 : 80,
                            backgroundColor: theme.colors.surface,
                          },
                        ]}
                      >
                        <Ionicons name="add" size={24} color={theme.colors.primary} />
                        <Text
                          style={[styles.viewMoreText, { color: theme.colors.text }]}
                        >
                          View More
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </Animated.View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.emptyIconContainer}>
                <LinearGradient
                  colors={[theme.colors.textMuted, `${theme.colors.textMuted}80`]}
                  style={styles.emptyIconGradient}
                >
                  <Ionicons name="images-outline" size={32} color={theme.colors.textInverse} />
                </LinearGradient>
              </View>
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                No media found
              </Text>
            </View>
          )}

          {/* Enhanced Media Stats */}
          {data && data.length > 0 && !compact && (
            <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.statsText, { color: theme.colors.textMuted }]}>
                {data.length} images available
              </Text>
              <Text style={[styles.statsText, { color: theme.colors.textMuted }]}>
                Source: {selectedSource.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
  )
}

// Media Image Card Component with 2025 design
const MediaImageCard = memo(function MediaImageCard({
  item,
  imageUrl,
  index,
  compact,
  onPress,
  theme,
}: {
  item: any
  imageUrl: string
  index: number
  compact: boolean
  onPress: () => void
  theme: any
}) {
  const scale = useSharedValue(0.9)
  const opacity = useSharedValue(0)

  useEffect(() => {
    const delay = index * 100

    setTimeout(() => {
      scale.value = withSpring(1, MICRO_SPRING_CONFIG.bouncy)
      opacity.value = withTiming(1, { duration: 400 })
    }, delay)
  }, [index, opacity, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  return (
    <TouchableOpacity onPress={onPress} style={styles.mediaCard}>
      <Animated.View style={animatedStyle}>
        <View
          style={[
            styles.mediaImageContainer,
            {
              width: compact ? 100 : 120,
              height: compact ? 60 : 80,
            },
          ]}
        >
          {imageUrl ? (
            <>
              <AnimatedImage
                source={{ uri: imageUrl }}
                style={styles.mediaImage}
                resizeMode="cover"
              />

              {/* Image overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={StyleSheet.absoluteFillObject}
              />
            </>
          ) : (
            <View style={[styles.placeholderContainer, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="image-outline" size={24} color={theme.colors.textMuted} />
            </View>
          )}
        </View>

        {!compact && (
          <Text
            style={[styles.mediaTitle, { width: 120, color: theme.colors.textMuted }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  content: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  headerGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 16,
  },
  headerTitle: {
    position: 'relative',
    zIndex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sourceSelector: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sourceButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  sourceButtonActive: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sourceButtonText: {
    fontSize: 12,
    fontWeight: '600',
    position: 'relative',
    zIndex: 1,
  },
  sourceButtonTextActive: {
    color: '#ffffff',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  mediaRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  mediaCard: {
    marginRight: 12,
  },
  mediaImageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaTitle: {
    marginTop: 6,
    fontSize: 10,
    textAlign: 'center',
  },
  viewMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    borderStyle: 'dashed',
    position: 'relative',
    overflow: 'hidden',
  },
  viewMoreText: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 12,
  },
  emptyIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statsText: {
    fontSize: 10,
  },
})
