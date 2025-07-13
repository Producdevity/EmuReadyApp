import React, { useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Image, TouchableOpacity, Modal, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { useRawgGameImages, useTgdbGameImages, useTgdbGameImageUrls } from '@/lib/api/hooks'
import Card from '@/components/ui/Card'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function GameMediaDetailScreen() {
  const { source, id, name } = useLocalSearchParams<{ 
    source: 'rawg' | 'tgdb'; 
    id: string; 
    name?: string;
  }>()
  const { theme } = useTheme()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageModalVisible, setImageModalVisible] = useState(false)

  // Fetch images based on source
  const { data: rawgImages, isLoading: rawgLoading } = useRawgGameImages(
    { gameId: id! },
    { enabled: source === 'rawg' }
  )

  const { data: tgdbImages, isLoading: tgdbLoading } = useTgdbGameImages(
    { gameId: id! },
    { enabled: source === 'tgdb' }
  )

  const { data: tgdbImageUrls } = useTgdbGameImageUrls(
    { gameId: id! },
    { enabled: source === 'tgdb' }
  )

  const isLoading = source === 'rawg' ? rawgLoading : tgdbLoading
  const images = source === 'rawg' ? rawgImages : tgdbImages

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setImageModalVisible(true)
  }

  const closeImageModal = () => {
    setImageModalVisible(false)
    setSelectedImage(null)
  }

  const renderImageGrid = (imageList: any[], title: string) => {
    if (!imageList || imageList.length === 0) return null

    return (
      <Card style={{ marginBottom: 16 }}>
        <View className="p-4">
          <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
            {title}
          </Text>
          
          <View className="flex-row flex-wrap -mx-1">
            {imageList.map((image: any, index: number) => {
              const imageUrl = source === 'rawg' 
                ? image.image || image 
                : image.original || image.large || image.medium || image.small

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => openImageModal(imageUrl)}
                  className="w-1/3 p-1"
                  activeOpacity={0.8}
                >
                  <View className="aspect-video overflow-hidden rounded-lg">
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="mt-4" style={{ color: theme.colors.textSecondary }}>
            Loading media from {source?.toUpperCase()}...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4 border-b" style={{ borderBottomColor: theme.colors.border }}>
          <View className="flex-row items-center mb-2">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold" style={{ color: theme.colors.text }}>
                {decodeURIComponent(name || 'Game Media')}
              </Text>
              <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
                Source: {source?.toUpperCase()} Database
              </Text>
            </View>
          </View>
        </View>

        <View className="p-4">
          {/* RAWG Images */}
          {source === 'rawg' && images && (
            <>
              {renderImageGrid(images.screenshots || [], 'Screenshots')}
              {renderImageGrid(images.movies || [], 'Videos')}
              {renderImageGrid(images.parent_achievements || [], 'Achievements')}
            </>
          )}

          {/* TGDB Images */}
          {source === 'tgdb' && (
            <>
              {images?.boxart && renderImageGrid(images.boxart, 'Box Art')}
              {images?.screenshots && renderImageGrid(images.screenshots, 'Screenshots')}
              {images?.logos && renderImageGrid(images.logos, 'Logos')}
              {images?.clearlogos && renderImageGrid(images.clearlogos, 'Clear Logos')}
              {images?.banners && renderImageGrid(images.banners, 'Banners')}
              {images?.fanart && renderImageGrid(images.fanart, 'Fan Art')}
            </>
          )}

          {/* No Images Found */}
          {(!images || Object.keys(images).length === 0) && (
            <Card>
              <View className="p-8 items-center">
                <Ionicons name="images-outline" size={64} color={theme.colors.textSecondary} />
                <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: theme.colors.text }}>
                  No Media Found
                </Text>
                <Text className="text-center" style={{ color: theme.colors.textSecondary }}>
                  No images were found for this game in the {source?.toUpperCase()} database.
                </Text>
              </View>
            </Card>
          )}

          {/* Additional URLs for TGDB */}
          {source === 'tgdb' && tgdbImageUrls && Object.keys(tgdbImageUrls).length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <View className="p-4">
                <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                  Available Image Types
                </Text>
                
                {Object.entries(tgdbImageUrls).map(([type, urls]: [string, any]) => (
                  <View key={type} className="mb-2">
                    <Text className="font-medium capitalize" style={{ color: theme.colors.textSecondary }}>
                      {type.replace(/([A-Z])/g, ' $1').trim()}: {Array.isArray(urls) ? urls.length : Object.keys(urls).length} images
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View 
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
        >
          <TouchableOpacity
            onPress={closeImageModal}
            className="absolute top-12 right-4 z-10"
            style={{ paddingTop: 20 }}
          >
            <View 
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: screenWidth * 0.9,
                height: screenHeight * 0.8,
              }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  )
}