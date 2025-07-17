import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useTheme } from '@/contexts/ThemeContext'
import { useCpuById } from '@/lib/api/hooks'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import React from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function CPUDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { theme } = useTheme()

  const cpuQueryResult = useCpuById({ id: id! })

  if (cpuQueryResult.isPending) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="mt-4" style={{ color: theme.colors.textSecondary }}>
            Loading CPU details...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (cpuQueryResult.error || !cpuQueryResult.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text className="text-xl font-semibold mt-4 mb-2" style={{ color: theme.colors.error }}>
            CPU Not Found
          </Text>
          <Text className="text-center mb-6" style={{ color: theme.colors.textSecondary }}>
            This CPU information is not available or may have been removed.
          </Text>
          <Button title="Back to CPUs" onPress={() => router.back()} variant="outline" />
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
      <Text className="font-semibold" style={{ color: theme.colors.textSecondary }}>
        {value || 'N/A'}
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4 border-b" style={{ borderBottomColor: theme.colors.border }}>
          <Text className="text-2xl font-bold mb-1" style={{ color: theme.colors.text }}>
            {cpuQueryResult.data.name}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
              {cpuQueryResult.data.manufacturer}
            </Text>
            {cpuQueryResult.data.series && (
              <>
                <Text className="text-sm mx-2" style={{ color: theme.colors.textMuted }}>
                  •
                </Text>
                <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  {cpuQueryResult.data.series} Series
                </Text>
              </>
            )}
          </View>
        </View>

        <View className="p-4 space-y-4">
          {/* Overview Card */}
          <Card>
            <View className="p-4">
              <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                Overview
              </Text>

              <View className="flex-row flex-wrap justify-between">
                <View
                  className="bg-gradient-to-r p-3 rounded-lg"
                  style={{ backgroundColor: theme.colors.surface }}
                >
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="speedometer" size={16} color={theme.colors.primary} />
                    <Text
                      className="text-sm ml-1 font-medium"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Cores
                    </Text>
                  </View>
                  <Text className="text-xl font-bold" style={{ color: theme.colors.text }}>
                    {cpuQueryResult.data.cores || 'N/A'}
                  </Text>
                </View>

                <View
                  className="bg-gradient-to-r p-3 rounded-lg"
                  style={{ backgroundColor: theme.colors.surface }}
                >
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="layers" size={16} color={theme.colors.primary} />
                    <Text
                      className="text-sm ml-1 font-medium"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Threads
                    </Text>
                  </View>
                  <Text className="text-xl font-bold" style={{ color: theme.colors.text }}>
                    {cpuQueryResult.data.threads || 'N/A'}
                  </Text>
                </View>

                <View
                  className="bg-gradient-to-r p-3 rounded-lg"
                  style={{ backgroundColor: theme.colors.surface }}
                >
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="flash" size={16} color={theme.colors.primary} />
                    <Text
                      className="text-sm ml-1 font-medium"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Base Clock
                    </Text>
                  </View>
                  <Text className="text-xl font-bold" style={{ color: theme.colors.text }}>
                    {cpuQueryResult.data.baseFrequency
                      ? `${cpuQueryResult.data.baseFrequency} GHz`
                      : 'N/A'}
                  </Text>
                </View>

                <View
                  className="bg-gradient-to-r p-3 rounded-lg"
                  style={{ backgroundColor: theme.colors.surface }}
                >
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="flame" size={16} color={theme.colors.primary} />
                    <Text
                      className="text-sm ml-1 font-medium"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Max Clock
                    </Text>
                  </View>
                  <Text className="text-xl font-bold" style={{ color: theme.colors.text }}>
                    {cpuQueryResult.data.maxFrequency
                      ? `${cpuQueryResult.data.maxFrequency} GHz`
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <View className="p-4">
              <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                Technical Specifications
              </Text>

              {renderSpecItem('Architecture', cpuQueryResult.data.architecture, 'construct')}
              {renderSpecItem(
                'Process Node',
                cpuQueryResult.data.processNode ? `${cpuQueryResult.data.processNode} nm` : null,
                'resize',
              )}
              {renderSpecItem('Socket', cpuQueryResult.data.socket, 'hardware-chip')}
              {renderSpecItem(
                'Cache L1',
                cpuQueryResult.data.cacheL1 ? `${cpuQueryResult.data.cacheL1} KB` : null,
                'layers',
              )}
              {renderSpecItem(
                'Cache L2',
                cpuQueryResult.data.cacheL2 ? `${cpuQueryResult.data.cacheL2} KB` : null,
                'layers',
              )}
              {renderSpecItem(
                'Cache L3',
                cpuQueryResult.data.cacheL3 ? `${cpuQueryResult.data.cacheL3} MB` : null,
                'layers',
              )}
              {renderSpecItem(
                'TDP',
                cpuQueryResult.data.tdp ? `${cpuQueryResult.data.tdp} W` : null,
                'battery-charging',
              )}
              {renderSpecItem('Memory Support', cpuQueryResult.data.memorySupport, 'hardware-chip')}
              {renderSpecItem('PCIe Lanes', cpuQueryResult.data.pcieLanes, 'git-network')}
            </View>
          </Card>

          {/* Additional Information */}
          {(cpuQueryResult.data.releaseDate ||
            cpuQueryResult.data.releaseYear ||
            cpuQueryResult.data.msrp) && (
            <Card>
              <View className="p-4">
                <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                  Additional Information
                </Text>

                {cpuQueryResult.data.releaseDate &&
                  renderSpecItem(
                    'Release Date',
                    new Date(cpuQueryResult.data.releaseDate).toLocaleDateString(),
                    'calendar',
                  )}
                {cpuQueryResult.data.releaseYear &&
                  renderSpecItem('Release Year', cpuQueryResult.data.releaseYear, 'calendar')}
                {cpuQueryResult.data.msrp &&
                  renderSpecItem('MSRP', `$${cpuQueryResult.data.msrp}`, 'pricetag')}
                {cpuQueryResult.data.codename &&
                  renderSpecItem('Codename', cpuQueryResult.data.codename, 'code')}
              </View>
            </Card>
          )}

          {/* Features */}
          {cpuQueryResult.data.features && cpuQueryResult.data.features.length > 0 && (
            <Card>
              <View className="p-4">
                <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                  Features
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  {cpuQueryResult.data.features.map((feature: string, index: number) => (
                    <View
                      key={index}
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: theme.colors.surface }}
                    >
                      <Text className="text-sm" style={{ color: theme.colors.text }}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          )}

          {/* Performance Listings */}
          <Card>
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold" style={{ color: theme.colors.text }}>
                  Performance Reports
                </Text>
                <Button
                  title="View All"
                  onPress={() => router.push(`/pc?cpuId=${cpuQueryResult.data.id}`)}
                  variant="outline"
                  size="sm"
                />
              </View>

              <Text style={{ color: theme.colors.textSecondary }}>
                See how this CPU performs in PC gaming across different games and configurations.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
