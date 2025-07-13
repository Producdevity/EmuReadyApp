import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { useCpus, useGpus } from '@/lib/api/hooks'
import Card from '@/components/ui/Card'
import { router } from 'expo-router'

export default function HardwareScreen() {
  const { theme } = useTheme()

  // Get summary data for CPUs and GPUs
  const { data: cpusData } = useCpus({ limit: 1 })
  const { data: gpusData } = useGpus({ limit: 1 })

  const hardwareCategories = [
    {
      id: 'cpus',
      title: 'CPUs',
      subtitle: 'Central Processing Units',
      description: 'Browse detailed specifications for desktop and mobile processors',
      icon: 'hardware-chip',
      color: theme.colors.primary,
      route: '/hardware/cpus',
      count: cpusData?.pagination?.total || 0,
    },
    {
      id: 'gpus',
      title: 'GPUs',
      subtitle: 'Graphics Processing Units',
      description: 'Explore graphics cards with technical specifications and performance data',
      icon: 'desktop',
      color: theme.colors.secondary,
      route: '/hardware/gpus',
      count: gpusData?.pagination?.total || 0,
    },
  ]

  const handleCategoryPress = (route: string) => {
    router.push(route as any)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4 border-b" style={{ borderBottomColor: theme.colors.border }}>
          <Text className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            Hardware Database
          </Text>
          <Text className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
            Comprehensive specifications and performance data
          </Text>
        </View>

        <View className="p-4">
          {/* Overview Stats */}
          <Card style={{ marginBottom: 24 }}>
            <View className="p-4">
              <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
                Database Overview
              </Text>

              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
                    {(cpusData?.pagination?.total || 0) + (gpusData?.pagination?.total || 0)}
                  </Text>
                  <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Total Components
                  </Text>
                </View>

                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: theme.colors.secondary }}>
                    {cpusData?.pagination?.total || 0}
                  </Text>
                  <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    CPUs
                  </Text>
                </View>

                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: theme.colors.accent }}>
                    {gpusData?.pagination?.total || 0}
                  </Text>
                  <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    GPUs
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Hardware Categories */}
          <View className="space-y-4">
            {hardwareCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category.route)}
                activeOpacity={0.7}
              >
                <Card>
                  <View className="p-4">
                    <View className="flex-row items-start">
                      <View
                        className="w-12 h-12 rounded-full mr-4 items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Ionicons name={category.icon as any} size={24} color={category.color} />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row justify-between items-start mb-2">
                          <Text
                            className="text-xl font-semibold"
                            style={{ color: theme.colors.text }}
                          >
                            {category.title}
                          </Text>
                          <View className="flex-row items-center">
                            <Text
                              className="text-sm font-medium mr-2"
                              style={{ color: theme.colors.textSecondary }}
                            >
                              {category.count.toLocaleString()} items
                            </Text>
                            <Ionicons
                              name="chevron-forward"
                              size={16}
                              color={theme.colors.textMuted}
                            />
                          </View>
                        </View>

                        <Text
                          className="text-sm font-medium mb-2"
                          style={{ color: category.color }}
                        >
                          {category.subtitle}
                        </Text>

                        <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
                          {category.description}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {/* Information Card */}
          <Card style={{ marginTop: 24 }}>
            <View className="p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                <Text className="text-lg font-semibold ml-2" style={{ color: theme.colors.text }}>
                  About Hardware Database
                </Text>
              </View>

              <Text className="mb-3" style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
                Our comprehensive hardware database provides detailed specifications for processors
                and graphics cards to help you make informed decisions about PC gaming performance.
              </Text>

              <View className="space-y-2">
                <View className="flex-row items-start">
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text className="ml-2 flex-1" style={{ color: theme.colors.textSecondary }}>
                    Detailed technical specifications and features
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text className="ml-2 flex-1" style={{ color: theme.colors.textSecondary }}>
                    Performance data from real user reports
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text className="ml-2 flex-1" style={{ color: theme.colors.textSecondary }}>
                    Search and filter capabilities
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text className="ml-2 flex-1" style={{ color: theme.colors.textSecondary }}>
                    Regular updates with latest hardware releases
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
