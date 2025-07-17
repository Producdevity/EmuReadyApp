import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useTheme } from '@/contexts/ThemeContext'
import { usePcListings } from '@/lib/api/hooks'
import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function PCListingsScreen() {
  const { theme } = useTheme()
  const [search, setSearch] = useState('')

  const {
    data: pcListingsData,
    isLoading: loadingListings,
    error: listingsError,
  } = usePcListings({
    search: search || undefined,
    page: 1,
    limit: 20,
  })

  const handleCreateListing = () => {
    router.push('/pc/create')
  }

  const handleListingPress = (id: string) => {
    router.push(`/pc/${id}`)
  }

  const renderListingItem = ({ item }: { item: any }) => (
    <Card style={{ marginBottom: 16, marginHorizontal: 16 }}>
      <View className="p-4">
        <Text className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>
          {item.game?.name || 'Unknown Game'}
        </Text>

        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
            CPU: {item.cpu?.name || 'N/A'}
          </Text>
          <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
            GPU: {item.gpu?.name || 'N/A'}
          </Text>
        </View>

        {item.fps && (
          <Text className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
            FPS: {item.fps} @ {item.resolution || 'Unknown'}
          </Text>
        )}

        <View className="flex-row justify-between items-center">
          <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
            Performance: {item.performance?.name || 'Unknown'}
          </Text>
          <Button
            title="View Details"
            onPress={() => handleListingPress(item.id)}
            variant="outline"
            size="sm"
          />
        </View>
      </View>
    </Card>
  )

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="desktop-outline" size={64} color={theme.colors.textSecondary} />
      <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: theme.colors.text }}>
        No PC Listings Found
      </Text>
      <Text className="text-center mb-6" style={{ color: theme.colors.textSecondary }}>
        Be the first to share your PC gaming performance results with the community!
      </Text>
      <Button
        title="Create First PC Listing"
        onPress={handleCreateListing}
        variant="primary"
        leftIcon={<Ionicons name="add" size={20} color="#fff" />}
      />
    </View>
  )

  const renderError = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
      <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: theme.colors.error }}>
        PC Gaming Coming Soon
      </Text>
      <Text className="text-center mb-6" style={{ color: theme.colors.textSecondary }}>
        This feature is currently under development. Check back soon for PC gaming performance
        tracking!
      </Text>
      <Button
        title="Browse Mobile Listings"
        onPress={() => router.push('/browse')}
        variant="primary"
      />
    </View>
  )

  if (listingsError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {renderError()}
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View className="px-4 py-3 border-b" style={{ borderBottomColor: theme.colors.border }}>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            PC Gaming
          </Text>
          <Button
            title="Create"
            onPress={handleCreateListing}
            variant="primary"
            size="sm"
            leftIcon={<Ionicons name="add" size={16} color="#fff" />}
          />
        </View>

        {/* Search Input */}
        <View className="relative">
          <TextInput
            placeholder="Search games, CPUs, GPUs..."
            value={search}
            onChangeText={setSearch}
            className="pl-10 pr-4 py-3 rounded-lg border"
            style={{
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }}
            placeholderTextColor={theme.colors.textSecondary}
          />
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
            style={{ position: 'absolute', left: 12, top: 14 }}
          />
        </View>
      </View>

      {/* Content */}
      {loadingListings ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </View>
      ) : !pcListingsData?.listings?.length ? (
        renderEmptyState()
      ) : (
        <FlashList
          data={pcListingsData.listings}
          renderItem={renderListingItem}
          estimatedItemSize={160}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      )}
    </SafeAreaView>
  )
}
