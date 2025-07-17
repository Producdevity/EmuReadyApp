import Card from '@/components/ui/Card'
import { useTheme } from '@/contexts/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

interface QuickAccessItem {
  id: string
  title: string
  subtitle: string
  icon: string
  color: string
  route: string
  badge?: string
}

export default function QuickAccessSection() {
  const { theme } = useTheme()

  const quickAccessItems: QuickAccessItem[] = [
    {
      id: 'pc-gaming',
      title: 'PC Gaming',
      subtitle: 'Performance reports',
      icon: 'desktop',
      color: theme.colors.primary,
      route: '/pc',
    },
    {
      id: 'hardware',
      title: 'Hardware',
      subtitle: 'CPUs & GPUs',
      icon: 'hardware-chip',
      color: theme.colors.secondary,
      route: '/hardware',
    },
    {
      id: 'media',
      title: 'Game Media',
      subtitle: 'Images & artwork',
      icon: 'images',
      color: theme.colors.accent,
      route: '/media',
    },
    {
      id: 'reports',
      title: 'Content Safety',
      subtitle: 'Report issues',
      icon: 'shield-checkmark',
      color: theme.colors.warning,
      route: '/reports',
    },
  ]

  const handleItemPress = (route: string) => {
    router.push(route as any)
  }

  return (
    <Card style={{ marginBottom: theme.spacing.md }}>
      <View className="p-4">
        <Text className="text-lg font-semibold mb-3" style={{ color: theme.colors.text }}>
          Quick Access
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {quickAccessItems.map((item, _index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleItemPress(item.route)}
                className="mr-3"
                activeOpacity={0.7}
              >
                <View
                  className="items-center p-4 rounded-lg"
                  style={{
                    backgroundColor: theme.colors.surface,
                    minWidth: 100,
                  }}
                >
                  <View
                    className="w-12 h-12 rounded-full mb-2 items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                  </View>

                  <Text
                    className="font-semibold text-sm text-center"
                    style={{ color: theme.colors.text }}
                  >
                    {item.title}
                  </Text>

                  <Text
                    className="text-xs text-center mt-1"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {item.subtitle}
                  </Text>

                  {item.badge && (
                    <View
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                      style={{ backgroundColor: theme.colors.error }}
                    >
                      <Text className="text-xs font-bold text-white">{item.badge}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Card>
  )
}
