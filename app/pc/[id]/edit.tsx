import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  usePcListingById,
  useGames, 
  useCpusForMobile, 
  useGpusForMobile, 
  usePerformanceScales, 
  useUpdatePcListing 
} from '@/lib/api/hooks'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Picker } from '@react-native-picker/picker'

export default function EditPCListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { theme } = useTheme()
  
  // Form state
  const [selectedGame, setSelectedGame] = useState('')
  const [selectedCpu, setSelectedCpu] = useState('')
  const [selectedGpu, setSelectedGpu] = useState('')
  const [selectedPerformance, setSelectedPerformance] = useState('')
  const [fps, setFps] = useState('')
  const [resolution, setResolution] = useState('')
  const [settings, setSettings] = useState('')
  const [notes, setNotes] = useState('')

  // Fetch current listing
  const { data: listing, isLoading: loadingListing } = usePcListingById({ id: id! })
  
  // Fetch data for form options
  const { data: games, isLoading: loadingGames } = useGames({ limit: 1000 })
  const { data: cpus, isLoading: loadingCpus } = useCpusForMobile()
  const { data: gpus, isLoading: loadingGpus } = useGpusForMobile()
  const { data: performanceScales, isLoading: loadingPerformance } = usePerformanceScales()

  const updateMutation = useUpdatePcListing({
    onSuccess: () => {
      Alert.alert('Success', 'PC listing updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ])
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to update PC listing')
    },
  })

  // Populate form when listing data loads
  useEffect(() => {
    if (listing) {
      setSelectedGame(listing.gameId || '')
      setSelectedCpu(listing.cpuId || '')
      setSelectedGpu(listing.gpuId || '')
      setSelectedPerformance(listing.performanceId || '')
      setFps(listing.fps ? listing.fps.toString() : '')
      setResolution(listing.resolution || '')
      setSettings(listing.settings || '')
      setNotes(listing.notes || '')
    }
  }, [listing])

  const handleSubmit = () => {
    if (!selectedGame || !selectedCpu || !selectedGpu || !selectedPerformance) {
      Alert.alert('Error', 'Please fill in all required fields (Game, CPU, GPU, Performance)')
      return
    }

    const fpsNumber = fps ? parseInt(fps, 10) : undefined
    if (fps && (isNaN(fpsNumber!) || fpsNumber! <= 0)) {
      Alert.alert('Error', 'Please enter a valid FPS value')
      return
    }

    updateMutation.mutate({
      id: id!,
      gameId: selectedGame,
      cpuId: selectedCpu,
      gpuId: selectedGpu,
      performanceId: selectedPerformance,
      fps: fpsNumber,
      resolution: resolution || undefined,
      settings: settings || undefined,
      notes: notes || undefined,
    })
  }

  const isLoading = loadingListing || loadingGames || loadingCpus || loadingGpus || loadingPerformance

  if (loadingListing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="mt-4" style={{ color: theme.colors.textSecondary }}>
            Loading PC listing...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!listing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: theme.colors.error }}>
            PC Listing Not Found
          </Text>
          <Text className="text-center mb-6" style={{ color: theme.colors.textSecondary }}>
            This listing may have been removed or is no longer available.
          </Text>
          <Button
            title="Back to PC Listings"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4 border-b" style={{ borderBottomColor: theme.colors.border }}>
          <Text className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            Edit PC Listing
          </Text>
          <Text className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
            Update your PC gaming performance results
          </Text>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center py-16">
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text className="mt-4" style={{ color: theme.colors.textSecondary }}>
              Loading form data...
            </Text>
          </View>
        ) : (
          <View className="p-4 space-y-4">
            {/* Game Selection */}
            <Card>
              <View className="p-4">
                <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                  Game *
                </Text>
                <View className="border rounded-lg" style={{ borderColor: theme.colors.border }}>
                  <Picker
                    selectedValue={selectedGame}
                    onValueChange={setSelectedGame}
                    style={{ color: theme.colors.text }}
                  >
                    <Picker.Item label="Select a game..." value="" />
                    {games?.map((game) => (
                      <Picker.Item key={game.id} label={game.title} value={game.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            </Card>

            {/* Hardware Selection */}
            <Card>
              <View className="p-4">
                <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                  Hardware Configuration *
                </Text>
                
                {/* CPU */}
                <Text className="font-medium mb-2" style={{ color: theme.colors.text }}>
                  CPU *
                </Text>
                <View className="border rounded-lg mb-4" style={{ borderColor: theme.colors.border }}>
                  <Picker
                    selectedValue={selectedCpu}
                    onValueChange={setSelectedCpu}
                    style={{ color: theme.colors.text }}
                  >
                    <Picker.Item label="Select CPU..." value="" />
                    {cpus?.map((cpu) => (
                      <Picker.Item key={cpu.id} label={cpu.name} value={cpu.id} />
                    ))}
                  </Picker>
                </View>

                {/* GPU */}
                <Text className="font-medium mb-2" style={{ color: theme.colors.text }}>
                  GPU *
                </Text>
                <View className="border rounded-lg" style={{ borderColor: theme.colors.border }}>
                  <Picker
                    selectedValue={selectedGpu}
                    onValueChange={setSelectedGpu}
                    style={{ color: theme.colors.text }}
                  >
                    <Picker.Item label="Select GPU..." value="" />
                    {gpus?.map((gpu) => (
                      <Picker.Item key={gpu.id} label={gpu.name} value={gpu.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            </Card>

            {/* Performance */}
            <Card>
              <View className="p-4">
                <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                  Performance *
                </Text>
                <View className="border rounded-lg" style={{ borderColor: theme.colors.border }}>
                  <Picker
                    selectedValue={selectedPerformance}
                    onValueChange={setSelectedPerformance}
                    style={{ color: theme.colors.text }}
                  >
                    <Picker.Item label="Select performance level..." value="" />
                    {performanceScales?.map((scale) => (
                      <Picker.Item key={scale.id} label={scale.label} value={scale.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            </Card>

            {/* Performance Details */}
            <Card>
              <View className="p-4">
                <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                  Performance Details
                </Text>
                
                {/* FPS */}
                <Text className="font-medium mb-2" style={{ color: theme.colors.text }}>
                  Average FPS
                </Text>
                <TextInput
                  value={fps}
                  onChangeText={setFps}
                  placeholder="e.g., 60"
                  keyboardType="numeric"
                  className="border rounded-lg px-3 py-3 mb-4"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                  }}
                  placeholderTextColor={theme.colors.textSecondary}
                />

                {/* Resolution */}
                <Text className="font-medium mb-2" style={{ color: theme.colors.text }}>
                  Resolution
                </Text>
                <TextInput
                  value={resolution}
                  onChangeText={setResolution}
                  placeholder="e.g., 1920x1080, 2560x1440"
                  className="border rounded-lg px-3 py-3"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                  }}
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </Card>

            {/* Game Settings */}
            <Card>
              <View className="p-4">
                <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                  Game Settings
                </Text>
                <TextInput
                  value={settings}
                  onChangeText={setSettings}
                  placeholder="Describe graphics settings used (e.g., High, Ultra, Custom settings...)"
                  multiline
                  numberOfLines={4}
                  className="border rounded-lg px-3 py-3"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    textAlignVertical: 'top',
                  }}
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </Card>

            {/* Additional Notes */}
            <Card>
              <View className="p-4">
                <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                  Additional Notes
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any additional information, tips, or observations..."
                  multiline
                  numberOfLines={4}
                  className="border rounded-lg px-3 py-3"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    textAlignVertical: 'top',
                  }}
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </Card>

            {/* Submit Buttons */}
            <View className="pt-4 pb-8">
              <Button
                title="Update PC Listing"
                onPress={handleSubmit}
                variant="primary"
                disabled={updateMutation.isPending}
                leftIcon={
                  updateMutation.isPending ? (
                    <ActivityIndicator size={16} color="#fff" />
                  ) : (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )
                }
              />
              
              <Button
                title="Cancel"
                onPress={() => router.back()}
                variant="outline"
                style={{ marginTop: 12 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}