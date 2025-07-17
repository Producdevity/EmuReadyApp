import { ThemedText, ThemedView } from '@/components/themed'
import Card from '@/components/ui/Card'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useTheme } from '@/contexts/ThemeContext'
import { useEmulators, useSystems } from '@/lib/api/hooks'
import type { Emulator, System } from '@/types'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function EmulatorsScreen() {
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSystem, setSelectedSystem] = useState<string | undefined>()
  const [refreshing, setRefreshing] = useState(false)

  const emulatorsQuery = useEmulators({
    systemId: selectedSystem,
    search: searchQuery,
    limit: 50,
  })
  const systemsQuery = useSystems()

  const onRefresh = async () => {
    setRefreshing(true)
    await emulatorsQuery.refetch()
    setRefreshing(false)
  }

  const handleEmulatorPress = (emulatorId: string) => {
    // Navigate to emulator detail page
    router.push(`/emulator/${emulatorId}`)
  }

  const filteredEmulators = emulatorsQuery.data || []
  const availableSystems = systemsQuery.data || []

  if (emulatorsQuery.isLoading || systemsQuery.isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" />
      </ThemedView>
    )
  }

  if (emulatorsQuery.error) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <IconSymbol name="exclamationmark.triangle" size={48} color={theme.colors.error} />
        <ThemedText style={{ textAlign: 'center', marginTop: 16, fontSize: 16 }}>
          Failed to load emulators
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ThemedView style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
            Emulators
          </ThemedText>

          {/* Search Bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <IconSymbol name="magnifyingglass" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: theme.colors.text,
              }}
              placeholder="Search emulators..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* System Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => setSelectedSystem(undefined)}
              style={{
                backgroundColor: !selectedSystem ? theme.colors.primary : theme.colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                borderWidth: 1,
                borderColor: !selectedSystem ? theme.colors.primary : theme.colors.border,
              }}
            >
              <ThemedText
                style={{
                  color: !selectedSystem ? theme.colors.card : theme.colors.text,
                  fontWeight: '500',
                }}
              >
                All Systems
              </ThemedText>
            </TouchableOpacity>

            {availableSystems.map((system: System) => (
              <TouchableOpacity
                key={system.id}
                onPress={() => setSelectedSystem(system.id)}
                style={{
                  backgroundColor:
                    selectedSystem === system.id ? theme.colors.primary : theme.colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor:
                    selectedSystem === system.id ? theme.colors.primary : theme.colors.border,
                }}
              >
                <ThemedText
                  style={{
                    color: selectedSystem === system.id ? theme.colors.card : theme.colors.text,
                    fontWeight: '500',
                  }}
                >
                  {system.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Emulators List */}
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {filteredEmulators.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 40,
              }}
            >
              <IconSymbol name="tv" size={64} color={theme.colors.textSecondary} />
              <ThemedText
                style={{
                  textAlign: 'center',
                  marginTop: 16,
                  fontSize: 16,
                  color: theme.colors.textSecondary,
                }}
              >
                No emulators found
              </ThemedText>
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              {filteredEmulators.map((emulator: Emulator, index: number) => (
                <Animated.View key={emulator.id} entering={FadeInUp.delay(index * 50)}>
                  <TouchableOpacity
                    onPress={() => handleEmulatorPress(emulator.id)}
                    style={{ marginBottom: 12 }}
                  >
                    <Card style={{ padding: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Emulator Icon */}
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: theme.colors.surface,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 16,
                          }}
                        >
                          <IconSymbol name="tv" size={24} color={theme.colors.primary} />
                        </View>

                        {/* Emulator Info */}
                        <View style={{ flex: 1 }}>
                          <ThemedText
                            style={{
                              fontSize: 16,
                              fontWeight: '600',
                              marginBottom: 4,
                            }}
                          >
                            {emulator.name}
                          </ThemedText>

                          {emulator.systems && emulator.systems.length > 0 && (
                            <ThemedText
                              style={{
                                fontSize: 14,
                                color: theme.colors.textSecondary,
                                marginBottom: 2,
                              }}
                            >
                              {emulator.systems?.map((s: System) => s.name).join(', ')}
                            </ThemedText>
                          )}

                          <ThemedText
                            style={{
                              fontSize: 12,
                              color: theme.colors.textMuted,
                            }}
                          >
                            {emulator._count?.listings} compatible listings
                          </ThemedText>
                        </View>

                        {/* Listing Count */}
                        <View style={{ alignItems: 'center' }}>
                          <ThemedText
                            style={{
                              fontSize: 18,
                              fontWeight: 'bold',
                              color: theme.colors.primary,
                            }}
                          >
                            {emulator._count?.listings}
                          </ThemedText>
                          <ThemedText
                            style={{
                              fontSize: 12,
                              color: theme.colors.textSecondary,
                            }}
                          >
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
