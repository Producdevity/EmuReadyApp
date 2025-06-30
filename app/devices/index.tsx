import React, { useState } from 'react'
import {
  ScrollView,
  View,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { useTheme } from '@/contexts/ThemeContext'
import { useDevices, useDeviceBrands } from '@/lib/api/hooks'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import Card from '@/components/ui/Card'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { router } from 'expo-router'
import Animated, { FadeInUp } from 'react-native-reanimated'
import type { Device, DeviceBrand } from '@/types'

export default function DevicesScreen() {
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>()
  const [refreshing, setRefreshing] = useState(false)

  const devicesQuery = useDevices({
    search: searchQuery,
    brandId: selectedBrand,
    limit: 50,
  })
  const brandsQuery = useDeviceBrands()

  const onRefresh = async () => {
    setRefreshing(true)
    await devicesQuery.refetch()
    setRefreshing(false)
  }

  const handleDevicePress = (deviceId: string) => {
    // Navigate to device detail page
    router.push(`/device/${deviceId}`)
  }

  const filteredDevices = devicesQuery.data || []
  const deviceBrands = brandsQuery.data || []

  if (devicesQuery.isLoading || brandsQuery.isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </ThemedView>
    )
  }

  if (devicesQuery.error) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <IconSymbol name="exclamationmark.triangle" size={48} color={theme.colors.error} />
        <ThemedText style={{ textAlign: 'center', marginTop: 16, fontSize: 16 }}>
          Failed to load devices
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ThemedView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border
        }}>
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
            Devices
          </ThemedText>

          {/* Search Bar */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}>
            <IconSymbol name="magnifyingglass" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: theme.colors.text,
              }}
              placeholder="Search devices..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Brand Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 8 }}
          >
            <TouchableOpacity
              onPress={() => setSelectedBrand(undefined)}
              style={{
                backgroundColor: !selectedBrand ? theme.colors.primary : theme.colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                borderWidth: 1,
                borderColor: !selectedBrand ? theme.colors.primary : theme.colors.border,
              }}
            >
              <ThemedText style={{
                color: !selectedBrand ? theme.colors.card : theme.colors.text,
                fontWeight: '500',
              }}>
                All Brands
              </ThemedText>
            </TouchableOpacity>

            {deviceBrands.map((brand: DeviceBrand) => (
              <TouchableOpacity
                key={brand.id}
                onPress={() => setSelectedBrand(brand.id)}
                style={{
                  backgroundColor: selectedBrand === brand.id ? theme.colors.primary : theme.colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: selectedBrand === brand.id ? theme.colors.primary : theme.colors.border,
                }}
              >
                <ThemedText style={{
                  color: selectedBrand === brand.id ? theme.colors.card : theme.colors.text,
                  fontWeight: '500',
                }}>
                  {brand.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Devices List */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredDevices.length === 0 ? (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 40
            }}>
              <IconSymbol name="iphone" size={64} color={theme.colors.textSecondary} />
              <ThemedText style={{
                textAlign: 'center',
                marginTop: 16,
                fontSize: 16,
                color: theme.colors.textSecondary
              }}>
                No devices found
              </ThemedText>
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              {filteredDevices.map((device: Device, index: number) => (
                <Animated.View
                  key={device.id}
                  entering={FadeInUp.delay(index * 50)}
                >
                  <TouchableOpacity
                    onPress={() => handleDevicePress(device.id)}
                    style={{ marginBottom: 12 }}
                  >
                    <Card style={{ padding: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Device Icon */}
                        <View style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: theme.colors.surface,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 16,
                        }}>
                          <IconSymbol
                            name="iphone"
                            size={24}
                            color={theme.colors.primary}
                          />
                        </View>

                        {/* Device Info */}
                        <View style={{ flex: 1 }}>
                          <ThemedText style={{
                            fontSize: 16,
                            fontWeight: '600',
                            marginBottom: 4,
                          }}>
                            {device.modelName}
                          </ThemedText>

                          <ThemedText style={{
                            fontSize: 14,
                            color: theme.colors.textSecondary,
                            marginBottom: 2,
                          }}>
                            {device.brand?.name}
                          </ThemedText>

                          {device.soc && (
                            <ThemedText style={{
                              fontSize: 12,
                              color: theme.colors.textMuted
                            }}>
                              {device.soc.manufacturer} {device.soc.name}
                            </ThemedText>
                          )}
                        </View>

                        {/* Listing Count */}
                        <View style={{ alignItems: 'center' }}>
                          <ThemedText style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: theme.colors.primary,
                          }}>
                            {device._count?.listings}
                          </ThemedText>
                          <ThemedText style={{
                            fontSize: 12,
                            color: theme.colors.textSecondary,
                          }}>
                            listings
                          </ThemedText>
                        </View>

                        {/* Arrow */}
                        <IconSymbol
                          name="chevron.right"
                          size={16}
                          color={theme.colors.textMuted}
                          style={{ marginLeft: 12 }}
                        />
                      </View>
                    </Card>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}
