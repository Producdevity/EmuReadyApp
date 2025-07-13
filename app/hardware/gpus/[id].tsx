import React from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { useGpuById } from '@/lib/api/hooks'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function GPUDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { theme } = useTheme()

  const gpuQueryResult = useGpuById({ id: id! })

  if (gpuQueryResult.isPending) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="mt-4" style={{ color: theme.colors.textSecondary }}>
            Loading GPU details...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (gpuQueryResult.error || !gpuQueryResult.data) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={theme.colors.error}
          />
          <Text
            className="text-xl font-semibold mt-4 mb-2"
            style={{ color: theme.colors.error }}
          >
            GPU Not Found
          </Text>
          <Text
            className="text-center mb-6"
            style={{ color: theme.colors.textSecondary }}
          >
            This GPU information is not available or may have been removed.
          </Text>
          <Button
            title="Back to GPUs"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    )
  }

  const renderSpecItem = (
    label: string,
    value: string | number | null | undefined,
    icon: string,
  ) => (
    <View
      className="flex-row items-center py-3 border-b"
      style={{ borderBottomColor: theme.colors.borderLight }}
    >
      <View
        className="w-8 h-8 rounded-full mr-3 items-center justify-center"
        style={{ backgroundColor: `${theme.colors.primary}20` }}
      >
        <Ionicons name={icon as any} size={16} color={theme.colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="font-medium" style={{ color: theme.colors.text }}>
          {label}
        </Text>
      </View>
      <Text
        className="font-semibold"
        style={{ color: theme.colors.textSecondary }}
      >
        {value || 'N/A'}
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          className="px-4 py-4 border-b"
          style={{ borderBottomColor: theme.colors.border }}
        >
          <Text
            className="text-2xl font-bold mb-1"
            style={{ color: theme.colors.text }}
          >
            {gpuQueryResult.data.name}
          </Text>
          <View className="flex-row items-center">
            <Text
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              {gpuQueryResult.data.manufacturer}
            </Text>
            {gpuQueryResult.data.series && (
              <>
                <Text
                  className="text-sm mx-2"
                  style={{ color: theme.colors.textMuted }}
                >
                  •
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {gpuQueryResult.data.series} Series
                </Text>
              </>
            )}
          </View>
        </View>

        <View className="p-4 space-y-4">
          {/* Overview Card */}
          <Card>
            <View className="p-4">
              <Text
                className="text-lg font-semibold mb-3"
                style={{ color: theme.colors.text }}
              >
                Overview
              </Text>

              <View className="flex-row flex-wrap justify-between">
                <View
                  className="bg-gradient-to-r p-3 rounded-lg"
                  style={{ backgroundColor: theme.colors.surface }}
                >
                  <View className="flex-row items-center mb-1">
                    <Ionicons
                      name="hardware-chip"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text
                      className="text-sm ml-1 font-medium"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      VRAM
                    </Text>
                  </View>
                  <Text
                    className="text-xl font-bold"
                    style={{ color: theme.colors.text }}
                  >
                    {gpuQueryResult.data.memorySize
                      ? `${gpuQueryResult.data.memorySize} GB`
                      : 'N/A'}
                  </Text>
                </View>

                <View
                  className="bg-gradient-to-r p-3 rounded-lg"
                  style={{ backgroundColor: theme.colors.surface }}
                >
                  <View className="flex-row items-center mb-1">
                    <Ionicons
                      name="flash"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text
                      className="text-sm ml-1 font-medium"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Base Clock
                    </Text>
                  </View>
                  <Text
                    className="text-xl font-bold"
                    style={{ color: theme.colors.text }}
                  >
                    {gpuQueryResult.data.baseFrequency
                      ? `${gpuQueryResult.data.baseFrequency} MHz`
                      : 'N/A'}
                  </Text>
                </View>

                <View
                  className="bg-gradient-to-r p-3 rounded-lg"
                  style={{ backgroundColor: theme.colors.surface }}
                >
                  <View className="flex-row items-center mb-1">
                    <Ionicons
                      name="flame"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text
                      className="text-sm ml-1 font-medium"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Boost Clock
                    </Text>
                  </View>
                  <Text
                    className="text-xl font-bold"
                    style={{ color: theme.colors.text }}
                  >
                    {gpuQueryResult.data.boostFrequency
                      ? `${gpuQueryResult.data.boostFrequency} MHz`
                      : 'N/A'}
                  </Text>
                </View>

                <View
                  className="bg-gradient-to-r p-3 rounded-lg"
                  style={{ backgroundColor: theme.colors.surface }}
                >
                  <View className="flex-row items-center mb-1">
                    <Ionicons
                      name="speedometer"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text
                      className="text-sm ml-1 font-medium"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Memory Speed
                    </Text>
                  </View>
                  <Text
                    className="text-xl font-bold"
                    style={{ color: theme.colors.text }}
                  >
                    {gpuQueryResult.data.memorySpeed
                      ? `${gpuQueryResult.data.memorySpeed} MHz`
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <View className="p-4">
              <Text
                className="text-lg font-semibold mb-3"
                style={{ color: theme.colors.text }}
              >
                Technical Specifications
              </Text>

              {renderSpecItem(
                'Architecture',
                gpuQueryResult.data.architecture,
                'construct',
              )}
              {renderSpecItem(
                'Process Node',
                gpuQueryResult.data.processNode
                  ? `${gpuQueryResult.data.processNode} nm`
                  : null,
                'resize',
              )}
              {renderSpecItem(
                'Stream Processors',
                gpuQueryResult.data.streamProcessors,
                'grid',
              )}
              {renderSpecItem('RT Cores', gpuQueryResult.data.rtCores, 'cube')}
              {renderSpecItem(
                'Tensor Cores',
                gpuQueryResult.data.tensorCores,
                'cube',
              )}
              {renderSpecItem(
                'Memory Type',
                gpuQueryResult.data.memoryType,
                'hardware-chip',
              )}
              {renderSpecItem(
                'Memory Bus',
                gpuQueryResult.data.memoryBus
                  ? `${gpuQueryResult.data.memoryBus}-bit`
                  : null,
                'swap-horizontal',
              )}
              {renderSpecItem(
                'Memory Bandwidth',
                gpuQueryResult.data.memoryBandwidth
                  ? `${gpuQueryResult.data.memoryBandwidth} GB/s`
                  : null,
                'flash',
              )}
              {renderSpecItem(
                'TGP',
                gpuQueryResult.data.tgp ? `${gpuQueryResult.data.tgp} W` : null,
                'battery-charging',
              )}
              {renderSpecItem(
                'PCIe Interface',
                gpuQueryResult.data.pcieInterface,
                'git-network',
              )}
            </View>
          </Card>

          {/* Display & Connectivity */}
          <Card>
            <View className="p-4">
              <Text
                className="text-lg font-semibold mb-3"
                style={{ color: theme.colors.text }}
              >
                Display & Connectivity
              </Text>

              {renderSpecItem(
                'Max Resolution',
                gpuQueryResult.data.maxResolution,
                'desktop',
              )}
              {renderSpecItem(
                'Max Displays',
                gpuQueryResult.data.maxDisplays,
                'tv',
              )}
              {renderSpecItem(
                'DisplayPort',
                gpuQueryResult.data.displayPorts,
                'tv',
              )}
              {renderSpecItem(
                'HDMI Ports',
                gpuQueryResult.data.hdmiPorts,
                'tv',
              )}
              {renderSpecItem(
                'USB-C Ports',
                gpuQueryResult.data.usbcPorts,
                'cable',
              )}
            </View>
          </Card>

          {/* Additional Information */}
          {(gpuQueryResult.data.releaseDate ||
            gpuQueryResult.data.releaseYear ||
            gpuQueryResult.data.msrp) && (
            <Card>
              <View className="p-4">
                <Text
                  className="text-lg font-semibold mb-3"
                  style={{ color: theme.colors.text }}
                >
                  Additional Information
                </Text>

                {gpuQueryResult.data.releaseDate &&
                  renderSpecItem(
                    'Release Date',
                    new Date(
                      gpuQueryResult.data.releaseDate,
                    ).toLocaleDateString(),
                    'calendar',
                  )}
                {gpuQueryResult.data.releaseYear &&
                  renderSpecItem(
                    'Release Year',
                    gpuQueryResult.data.releaseYear,
                    'calendar',
                  )}
                {gpuQueryResult.data.msrp &&
                  renderSpecItem(
                    'MSRP',
                    `$${gpuQueryResult.data.msrp}`,
                    'pricetag',
                  )}
                {gpuQueryResult.data.codename &&
                  renderSpecItem(
                    'Codename',
                    gpuQueryResult.data.codename,
                    'code',
                  )}
                {gpuQueryResult.data.foundryName &&
                  renderSpecItem(
                    'Foundry',
                    gpuQueryResult.data.foundryName,
                    'business',
                  )}
              </View>
            </Card>
          )}

          {/* Features */}
          {gpuQueryResult.data.features &&
            gpuQueryResult.data.features.length > 0 && (
              <Card>
                <View className="p-4">
                  <Text
                    className="text-lg font-semibold mb-3"
                    style={{ color: theme.colors.text }}
                  >
                    Features
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    {gpuQueryResult.data.features.map(
                      (feature: string, index: number) => (
                        <View
                          key={index}
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: theme.colors.surface }}
                        >
                          <Text
                            className="text-sm"
                            style={{ color: theme.colors.text }}
                          >
                            {feature}
                          </Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              </Card>
            )}

          {/* Performance Listings */}
          <Card>
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: theme.colors.text }}
                >
                  Performance Reports
                </Text>
                <Button
                  title="View All"
                  onPress={() =>
                    router.push(`/pc?gpuId=${gpuQueryResult.data.id}`)
                  }
                  variant="outline"
                  size="sm"
                />
              </View>

              <Text style={{ color: theme.colors.textSecondary }}>
                See how this GPU performs in PC gaming across different games
                and configurations.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
