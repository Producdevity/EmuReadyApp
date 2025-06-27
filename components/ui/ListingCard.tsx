import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Heart, MessageCircle, TrendingUp, Star } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'

const { width: screenWidth } = Dimensions.get('window')
const cardWidth = (screenWidth - 48) / 2 // 2 columns with 16px padding each side + 16px gap

interface ListingCardProps {
  listing: {
    id: string
    game?: {
      title: string
      imageUrl?: string
    }
    device?: {
      modelName: string
    }
    emulator?: {
      name: string
    }
    performance?: {
      rank: number
    }
    upvotes?: number
    _count?: {
      comments: number
    }
    createdAt: string
    author?: {
      name?: string
      imageUrl?: string
    }
  }
  onPress: (id: string) => void
  variant?: 'default' | 'featured' | 'compact'
}

export default function ListingCard({
  listing,
  onPress,
  variant = 'default',
}: ListingCardProps) {
  const scale = useSharedValue(1)
  const translateY = useSharedValue(0)
  const heartScale = useSharedValue(1)
  const liked = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ] as any,
  }))

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }))

  const likedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(liked.value, [0, 1], [0.6, 1]),
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 20,
      stiffness: 300,
    })
    translateY.value = withSpring(2, {
      damping: 20,
      stiffness: 300,
    })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 20,
      stiffness: 300,
    })
    translateY.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    })
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress(listing.id)
  }

  const handleLikePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    heartScale.value = withSpring(1.2, { damping: 12, stiffness: 400 }, () => {
      heartScale.value = withSpring(1, { damping: 12, stiffness: 400 })
    })
    liked.value = withTiming(liked.value === 0 ? 1 : 0, { duration: 200 })
  }

  const getPerformanceColor = (rank?: number) => {
    switch (rank) {
      case 5:
        return '#10b981' // Perfect - Green
      case 4:
        return '#3b82f6' // Great - Blue
      case 3:
        return '#f59e0b' // Good - Yellow
      case 2:
        return '#ef4444' // Poor - Red
      case 1:
        return '#6b7280' // Unplayable - Gray
      default:
        return '#9ca3af'
    }
  }

  const getPerformanceLabel = (rank?: number) => {
    switch (rank) {
      case 5:
        return 'Perfect'
      case 4:
        return 'Great'
      case 3:
        return 'Good'
      case 2:
        return 'Poor'
      case 1:
        return 'Unplayable'
      default:
        return 'Unknown'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.featuredContainer}
      >
        <Animated.View style={[styles.featuredCard, animatedStyle as any]}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.1)', 'rgba(16, 185, 129, 0.1)']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Game Image */}
          <View style={styles.featuredImageContainer}>
            {listing.game?.imageUrl ? (
              <Image
                source={{ uri: listing.game.imageUrl }}
                style={styles.featuredImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.featuredImagePlaceholder}>
                <Text style={styles.featuredImagePlaceholderText}>
                  {listing.game?.title?.charAt(0) || '?'}
                </Text>
              </View>
            )}

            {/* Performance Badge */}
            <View
              style={[
                styles.performanceBadge,
                {
                  backgroundColor: getPerformanceColor(
                    listing.performance?.rank,
                  ),
                },
              ]}
            >
              <Star size={12} color="white" fill="white" />
              <Text style={styles.performanceBadgeText}>
                {getPerformanceLabel(listing.performance?.rank)}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle} numberOfLines={1}>
              {listing.game?.title || 'Unknown Game'}
            </Text>
            <Text style={styles.featuredSubtitle} numberOfLines={1}>
              {listing.device?.modelName} • {listing.emulator?.name}
            </Text>

            {/* Stats */}
            <View style={styles.featuredStats}>
              <TouchableOpacity
                onPress={handleLikePress}
                style={styles.statButton}
              >
                <Animated.View style={[heartAnimatedStyle, likedStyle]}>
                  <Heart
                    size={16}
                    color="#ef4444"
                    fill={liked.value === 1 ? '#ef4444' : 'transparent'}
                  />
                </Animated.View>
                <Text style={styles.statText}>{listing.upvotes || 0}</Text>
              </TouchableOpacity>

              <View style={styles.statButton}>
                <MessageCircle size={16} color="#6b7280" />
                <Text style={styles.statText}>
                  {listing._count?.comments || 0}
                </Text>
              </View>

              <View style={styles.statButton}>
                <TrendingUp size={16} color="#10b981" />
                <Text style={styles.statText}>
                  {formatTimeAgo(listing.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    )
  }

  // Default/Compact variant
  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[
        styles.container,
        variant === 'compact' && styles.compactContainer,
      ]}
    >
      <Animated.View
        style={[
          styles.card,
          animatedStyle as any,
          variant === 'compact' && styles.compactCard,
        ]}
      >
        {/* Background Gradient */}
        <LinearGradient
          colors={['rgba(31, 41, 55, 0.95)', 'rgba(17, 24, 39, 0.98)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Game Image */}
        <View style={styles.imageContainer}>
          {listing.game?.imageUrl ? (
            <Image
              source={{ uri: listing.game.imageUrl }}
              style={styles.gameImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>
                {listing.game?.title?.charAt(0) || '?'}
              </Text>
            </View>
          )}

          {/* Performance Indicator */}
          <View
            style={[
              styles.performanceIndicator,
              {
                backgroundColor: getPerformanceColor(listing.performance?.rank),
              },
            ]}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.gameTitle} numberOfLines={1}>
            {listing.game?.title || 'Unknown Game'}
          </Text>
          <Text style={styles.deviceName} numberOfLines={1}>
            {listing.device?.modelName}
          </Text>
          <Text style={styles.emulatorName} numberOfLines={1}>
            {listing.emulator?.name}
          </Text>

          {/* Bottom Stats */}
          <View style={styles.stats}>
            <TouchableOpacity
              onPress={handleLikePress}
              style={styles.likeButton}
            >
              <Animated.View style={[heartAnimatedStyle, likedStyle]}>
                <Heart
                  size={14}
                  color="#ef4444"
                  fill={liked.value === 1 ? '#ef4444' : 'transparent'}
                />
              </Animated.View>
              <Text style={styles.likeCount}>{listing.upvotes || 0}</Text>
            </TouchableOpacity>

            <View style={styles.commentCount}>
              <MessageCircle size={12} color="#6b7280" />
              <Text style={styles.commentText}>
                {listing._count?.comments || 0}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  // Default Card Styles
  container: {
    width: cardWidth,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  gameImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  performanceIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    padding: 12,
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 12,
    color: '#d1d5db',
    marginBottom: 2,
  },
  emulatorName: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 12,
    color: '#d1d5db',
    marginLeft: 4,
  },
  commentCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },

  // Featured Card Styles
  featuredContainer: {
    width: screenWidth - 32,
    marginBottom: 20,
  },
  featuredCard: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    minHeight: 100,
  },
  featuredImageContainer: {
    width: 100,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredImagePlaceholder: {
    flex: 1,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImagePlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  performanceBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  performanceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    marginLeft: 2,
  },
  featuredContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 13,
    color: '#d1d5db',
    marginBottom: 12,
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },

  // Compact Card Styles
  compactContainer: {
    width: '100%',
  },
  compactCard: {
    flexDirection: 'row',
    height: 80,
  },
})
