import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { useRawgSearchGameImages, useTgdbSearchGameImages } from '@/lib/api/hooks'
import Card from '@/components/ui/Card'
import { router } from 'expo-router'

interface GameMediaSectionProps {
  gameName: string
  gameId?: string
  compact?: boolean
}

export default function GameMediaSection({ 
  gameName, 
  gameId: _gameId, 
  compact = false 
}: GameMediaSectionProps) {
  const { theme } = useTheme()
  const [selectedSource, setSelectedSource] = useState<'rawg' | 'tgdb'>('rawg')

  // Fetch media from both sources
  const { data: rawgData, isLoading: rawgLoading } = useRawgSearchGameImages(
    { query: gameName, pageSize: compact ? 4 : 8 },
    { enabled: !!gameName }
  )

  const { data: tgdbData, isLoading: tgdbLoading } = useTgdbSearchGameImages(
    { name: gameName },
    { enabled: !!gameName }
  )

  const isLoading = selectedSource === 'rawg' ? rawgLoading : tgdbLoading
  const data = selectedSource === 'rawg' ? rawgData : tgdbData

  const handleImagePress = (item: any) => {
    router.push(`/media/${selectedSource}/${item.id}?name=${encodeURIComponent(item.name)}`)
  }

  const handleViewAllPress = () => {
    router.push(`/media?search=${encodeURIComponent(gameName)}&source=${selectedSource}`)
  }

  if (!gameName || (!rawgData?.length && !tgdbData?.length)) {
    return null
  }

  return (
    <Card style={{ marginBottom: compact ? theme.spacing.md : theme.spacing.lg }}>
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold" style={{ color: theme.colors.text }}>
            Game Media
          </Text>
          
          {!compact && (
            <TouchableOpacity onPress={handleViewAllPress}>
              <Text className="text-sm font-medium" style={{ color: theme.colors.primary }}>
                View All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Source Selector */}
        {!compact && (
          <View className="flex-row bg-gray-100 rounded-lg p-1 mb-3" style={{ backgroundColor: theme.colors.surface }}>
            <TouchableOpacity
              onPress={() => setSelectedSource('rawg')}
              className={`flex-1 py-1 px-2 rounded-md ${selectedSource === 'rawg' ? 'shadow-sm' : ''}`}
              style={{ 
                backgroundColor: selectedSource === 'rawg' ? theme.colors.primary : 'transparent' 
              }}
            >
              <Text 
                className="text-center text-sm font-medium"
                style={{ 
                  color: selectedSource === 'rawg' ? '#fff' : theme.colors.text 
                }}
              >
                RAWG
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setSelectedSource('tgdb')}
              className={`flex-1 py-1 px-2 rounded-md ${selectedSource === 'tgdb' ? 'shadow-sm' : ''}`}
              style={{ 
                backgroundColor: selectedSource === 'tgdb' ? theme.colors.primary : 'transparent' 
              }}
            >
              <Text 
                className="text-center text-sm font-medium"
                style={{ 
                  color: selectedSource === 'tgdb' ? '#fff' : theme.colors.text 
                }}
              >
                TGDB
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Media Grid */}
        {isLoading ? (
          <View className="flex-row justify-center py-8">
            <Text style={{ color: theme.colors.textSecondary }}>
              Loading media...
            </Text>
          </View>
        ) : data && data.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {data.slice(0, compact ? 3 : 6).map((item: any, index: number) => {
                const imageUrl = selectedSource === 'rawg' 
                  ? item.background_image || item.short_screenshots?.[0]?.image
                  : item.thumb || item.images?.[0]?.thumb

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleImagePress(item)}
                    className="mr-3"
                    activeOpacity={0.8}
                  >
                    <View 
                      className="rounded-lg overflow-hidden"
                      style={{ 
                        width: compact ? 100 : 120, 
                        height: compact ? 60 : 80 
                      }}
                    >
                      {imageUrl ? (
                        <Image
                          source={{ uri: imageUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View 
                          className="w-full h-full items-center justify-center"
                          style={{ backgroundColor: theme.colors.surface }}
                        >
                          <Ionicons name="image-outline" size={24} color={theme.colors.textMuted} />
                        </View>
                      )}
                    </View>
                    
                    {!compact && (
                      <Text 
                        className="text-xs mt-1"
                        style={{ 
                          color: theme.colors.textSecondary,
                          width: 120
                        }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    )}
                  </TouchableOpacity>
                )
              })}

              {/* View More Button */}
              {data.length > (compact ? 3 : 6) && (
                <TouchableOpacity
                  onPress={handleViewAllPress}
                  className="items-center justify-center"
                  style={{ 
                    width: compact ? 100 : 120, 
                    height: compact ? 60 : 80 
                  }}
                >
                  <View 
                    className="w-full h-full rounded-lg items-center justify-center border-2 border-dashed"
                    style={{ borderColor: theme.colors.border }}
                  >
                    <Ionicons name="add" size={24} color={theme.colors.primary} />
                    <Text 
                      className="text-xs mt-1"
                      style={{ color: theme.colors.primary }}
                    >
                      View More
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        ) : (
          <View className="items-center py-6">
            <Ionicons name="images-outline" size={32} color={theme.colors.textMuted} />
            <Text className="text-sm mt-2" style={{ color: theme.colors.textSecondary }}>
              No media found
            </Text>
          </View>
        )}

        {/* Media Stats */}
        {data && data.length > 0 && !compact && (
          <View className="flex-row justify-between mt-3 pt-3 border-t" style={{ borderTopColor: theme.colors.borderLight }}>
            <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>
              {data.length} images available
            </Text>
            <Text className="text-xs" style={{ color: theme.colors.textSecondary }}>
              Source: {selectedSource.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    </Card>
  )
}