import React from 'react'
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { usePcListingById, useDeletePcListing } from '@/lib/api/hooks'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@clerk/clerk-expo'
import ReportButton from '@/components/ui/ReportButton'

export default function PCListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { theme } = useTheme()
  const { userId } = useAuth()

  const { data: listing, isLoading, error } = usePcListingById({ id: id! })
  const deleteMutation = useDeletePcListing({
    onSuccess: () => {
      Alert.alert('Success', 'PC listing deleted successfully')
      router.back()
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to delete listing')
    },
  })

  const handleEdit = () => {
    router.push(`/pc/${id}/edit`)
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete PC Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate({ id: id! }),
        },
      ]
    )
  }

  if (isLoading) {
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

  if (error || !listing) {
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

  const isOwner = userId === listing.userId

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4 border-b" style={{ borderBottomColor: theme.colors.border }}>
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-2xl font-bold mb-1" style={{ color: theme.colors.text }}>
                {listing.game?.name || 'Unknown Game'}
              </Text>
              <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
                PC Gaming Performance Report
              </Text>
            </View>
            <View className="flex-row ml-4">
              {isOwner ? (
                <>
                  <Button
                    title="Edit"
                    onPress={handleEdit}
                    variant="outline"
                    size="sm"
                    leftIcon={<Ionicons name="pencil" size={16} color={theme.colors.primary} />}
                    style={{ marginRight: 8 }}
                  />
                  <Button
                    title="Delete"
                    onPress={handleDelete}
                    variant="outline"
                    size="sm"
                    leftIcon={<Ionicons name="trash" size={16} color={theme.colors.error} />}
                    disabled={deleteMutation.isPending}
                  />
                </>
              ) : (
                <ReportButton
                  listingId={listing.id}
                  listingTitle={listing.game?.name}
                  variant="button"
                  size="sm"
                />
              )}
            </View>
          </View>
        </View>

        <View className="p-4 space-y-4">
          {/* Performance Overview */}
          <Card>
            <View className="p-4">
              <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                Performance Overview
              </Text>
              
              <View className="flex-row justify-between items-center mb-2">
                <Text style={{ color: theme.colors.textSecondary }}>Performance Rating</Text>
                <Text className="font-semibold" style={{ color: theme.colors.text }}>
                  {listing.performance?.name || 'Unknown'}
                </Text>
              </View>

              {listing.fps && (
                <View className="flex-row justify-between items-center mb-2">
                  <Text style={{ color: theme.colors.textSecondary }}>Frame Rate</Text>
                  <Text className="font-semibold" style={{ color: theme.colors.text }}>
                    {listing.fps} FPS
                  </Text>
                </View>
              )}

              {listing.resolution && (
                <View className="flex-row justify-between items-center">
                  <Text style={{ color: theme.colors.textSecondary }}>Resolution</Text>
                  <Text className="font-semibold" style={{ color: theme.colors.text }}>
                    {listing.resolution}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Hardware Specifications */}
          <Card>
            <View className="p-4">
              <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                Hardware Specifications
              </Text>
              
              <View className="flex-row items-center mb-3">
                <Ionicons name="hardware-chip" size={20} color={theme.colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="font-medium" style={{ color: theme.colors.text }}>
                    {listing.cpu?.name || 'Unknown CPU'}
                  </Text>
                  <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Processor
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="desktop" size={20} color={theme.colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="font-medium" style={{ color: theme.colors.text }}>
                    {listing.gpu?.name || 'Unknown GPU'}
                  </Text>
                  <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Graphics Card
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Game Settings */}
          {listing.settings && (
            <Card>
              <View className="p-4">
                <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                  Game Settings
                </Text>
                <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
                  {listing.settings}
                </Text>
              </View>
            </Card>
          )}

          {/* Additional Notes */}
          {listing.notes && (
            <Card>
              <View className="p-4">
                <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                  Additional Notes
                </Text>
                <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
                  {listing.notes}
                </Text>
              </View>
            </Card>
          )}

          {/* Listing Info */}
          <Card>
            <View className="p-4">
              <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                Listing Information
              </Text>
              
              <View className="flex-row justify-between items-center mb-2">
                <Text style={{ color: theme.colors.textSecondary }}>Created by</Text>
                <Text className="font-medium" style={{ color: theme.colors.text }}>
                  {listing.user?.name || 'Unknown User'}
                </Text>
              </View>

              {listing.createdAt && (
                <View className="flex-row justify-between items-center">
                  <Text style={{ color: theme.colors.textSecondary }}>Created</Text>
                  <Text className="font-medium" style={{ color: theme.colors.text }}>
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}