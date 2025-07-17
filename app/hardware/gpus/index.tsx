import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useTheme } from '@/contexts/ThemeContext'
import { useGpus } from '@/lib/api/hooks'
import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function GPUsScreen() {
  const { theme } = useTheme()
  const [search, setSearch] = useState('')
  const [selectedManufacturer, _setSelectedManufacturer] = useState('')
  const [page, _setPage] = useState(1)

  // Fetch GPUs
  const {
    data: gpusData,
    isLoading,
    error,
  } = useGpus({
    search: search || undefined,
    manufacturer: selectedManufacturer || undefined,
    page,
    limit: 20,
  })

  const handleGpuPress = (id: string) => {
    router.push(`/hardware/gpus/${id}`)
  }

  const renderGpuItem = ({ item }: { item: any }) => (
    <Card style={{ marginBottom: theme.spacing.md, marginHorizontal: theme.spacing.md }}>
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold mb-1" style={{ color: theme.colors.text }}>
              {item.name}
            </Text>
            <Text className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
              {item.manufacturer} • {item.series || 'Unknown Series'}
            </Text>
          </View>
          <Button
            title="Details"
            onPress={() => handleGpuPress(item.id)}
            variant="outline"
            size="sm"
          />
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="hardware-chip" size={16} color={theme.colors.primary} />
            <Text className="text-sm ml-1" style={{ color: theme.colors.textSecondary }}>
              {item.memorySize ? `${item.memorySize} GB` : 'N/A'} VRAM
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="flash" size={16} color={theme.colors.primary} />
            <Text className="text-sm ml-1" style={{ color: theme.colors.textSecondary }}>
              {item.baseFrequency ? `${item.baseFrequency} MHz` : 'N/A'}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="calendar" size={16} color={theme.colors.primary} />
            <Text className="text-sm ml-1" style={{ color: theme.colors.textSecondary }}>
              {item.releaseYear || 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  )

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="desktop-outline" size={64} color={theme.colors.textSecondary} />
      <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: theme.colors.text }}>
        No GPUs Found
      </Text>
      <Text className="text-center mb-6" style={{ color: theme.colors.textSecondary }}>
        Try adjusting your search or filter criteria to find GPUs.
      </Text>
    </View>
  )

  const renderError = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
      <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: theme.colors.error }}>
        Error Loading GPUs
      </Text>
      <Text className="text-center mb-6" style={{ color: theme.colors.textSecondary }}>
        Unable to load GPU information. Please try again.
      </Text>
      <Button title="Retry" onPress={() => window.location.reload()} variant="outline" />
    </View>
  )

  if (error) {
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
            GPUs
          </Text>
        </View>

        {/* Search Input */}
        <View className="relative">
          <TextInput
            placeholder="Search GPUs by name, model, or series..."
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
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="mt-4" style={{ color: theme.colors.textSecondary }}>
            Loading GPUs...
          </Text>
        </View>
      ) : !gpusData?.gpus?.length ? (
        renderEmptyState()
      ) : (
        <FlashList
          data={gpusData.gpus}
          renderItem={renderGpuItem}
          estimatedItemSize={120}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      )}
    </SafeAreaView>
  )
}
