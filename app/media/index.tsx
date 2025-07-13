import React, { useState } from 'react'
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { useTheme } from '@/contexts/ThemeContext'
import { useRawgSearchGameImages, useTgdbSearchGameImages } from '@/lib/api/hooks'
import Card from '@/components/ui/Card'
import { router } from 'expo-router'

type MediaSource = 'rawg' | 'tgdb'

export default function GameMediaScreen() {
  const { theme } = useTheme()
  const [search, setSearch] = useState('')
  const [selectedSource, setSelectedSource] = useState<MediaSource>('rawg')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch from selected source
  const { data: rawgData, isLoading: rawgLoading } = useRawgSearchGameImages(
    { query: debouncedSearch, pageSize: 20 },
    { enabled: selectedSource === 'rawg' && !!debouncedSearch }
  )

  const { data: tgdbData, isLoading: tgdbLoading } = useTgdbSearchGameImages(
    { name: debouncedSearch },
    { enabled: selectedSource === 'tgdb' && !!debouncedSearch }
  )

  const isLoading = selectedSource === 'rawg' ? rawgLoading : tgdbLoading
  const data = selectedSource === 'rawg' ? rawgData : tgdbData

  const handleImagePress = (gameId: string, gameName: string) => {
    router.push(`/media/${selectedSource}/${gameId}?name=${encodeURIComponent(gameName)}`)
  }

  const renderMediaItem = ({ item }: { item: any }) => {
    const imageUrl = selectedSource === 'rawg' 
      ? item.background_image || item.short_screenshots?.[0]?.image
      : item.thumb || item.images?.[0]?.thumb

    return (
      <TouchableOpacity
        onPress={() => handleImagePress(item.id, item.name)}
        activeOpacity={0.8}
        className="w-1/2 p-2"
      >
        <Card>
          <View className="aspect-video overflow-hidden rounded-lg">
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
                <Ionicons name="image-outline" size={32} color={theme.colors.textMuted} />
              </View>
            )}
          </View>
          
          <View className="p-3">
            <Text 
              className="font-semibold text-sm"
              style={{ color: theme.colors.text }}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            
            <View className="flex-row items-center mt-1">
              <Ionicons 
                name={selectedSource === 'rawg' ? 'star' : 'game-controller'} 
                size={12} 
                color={theme.colors.primary} 
              />
              <Text 
                className="text-xs ml-1"
                style={{ color: theme.colors.textSecondary }}
              >
                {selectedSource === 'rawg' 
                  ? `${item.rating || 0}/5`
                  : `${item.platform || 'Multiple'}`
                }
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    )
  }

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="images-outline" size={64} color={theme.colors.textSecondary} />
      <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: theme.colors.text }}>
        {debouncedSearch ? 'No Media Found' : 'Search Game Media'}
      </Text>
      <Text className="text-center mb-6" style={{ color: theme.colors.textSecondary }}>
        {debouncedSearch 
          ? `No results found for "${debouncedSearch}" in ${selectedSource.toUpperCase()}`
          : 'Enter a game name to search for images and media'
        }
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View className="px-4 py-3 border-b" style={{ borderBottomColor: theme.colors.border }}>
        <Text className="text-2xl font-bold mb-3" style={{ color: theme.colors.text }}>
          Game Media
        </Text>

        {/* Search Input */}
        <View className="relative mb-3">
          <TextInput
            placeholder="Search for game images and media..."
            value={search}
            onChangeText={setSearch}
            className="pl-10 pr-4 py-3 rounded-lg border"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }}
            placeholderTextColor={theme.colors.textMuted}
          />
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textMuted}
            style={{ position: 'absolute', left: 12, top: 14 }}
          />
        </View>

        {/* Source Selection */}
        <View className="flex-row bg-gray-100 rounded-lg p-1" style={{ backgroundColor: theme.colors.surface }}>
          <TouchableOpacity
            onPress={() => setSelectedSource('rawg')}
            className={`flex-1 py-2 px-3 rounded-md ${selectedSource === 'rawg' ? 'shadow-sm' : ''}`}
            style={{ 
              backgroundColor: selectedSource === 'rawg' ? theme.colors.primary : 'transparent' 
            }}
          >
            <Text 
              className="text-center font-medium"
              style={{ 
                color: selectedSource === 'rawg' ? '#fff' : theme.colors.text 
              }}
            >
              RAWG
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setSelectedSource('tgdb')}
            className={`flex-1 py-2 px-3 rounded-md ${selectedSource === 'tgdb' ? 'shadow-sm' : ''}`}
            style={{ 
              backgroundColor: selectedSource === 'tgdb' ? theme.colors.primary : 'transparent' 
            }}
          >
            <Text 
              className="text-center font-medium"
              style={{ 
                color: selectedSource === 'tgdb' ? '#fff' : theme.colors.text 
              }}
            >
              TGDB
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {!debouncedSearch || !data?.length ? (
        renderEmptyState()
      ) : isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="mt-4" style={{ color: theme.colors.textSecondary }}>
            Searching {selectedSource.toUpperCase()}...
          </Text>
        </View>
      ) : (
        <FlashList
          data={data}
          renderItem={renderMediaItem}
          estimatedItemSize={200}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      )}
    </SafeAreaView>
  )
}