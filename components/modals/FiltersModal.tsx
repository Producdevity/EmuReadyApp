import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import React, { useEffect, useState } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button, LoadingSpinner } from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import { useDevices, useEmulators, useSystems } from '@/lib/api/hooks'
import type { Device, Emulator, System } from '@/types'

interface FilterState {
  systemIds: string[]
  deviceIds: string[]
  emulatorIds: string[]
  performanceRanks: number[]
}

interface FiltersModalProps {
  visible: boolean
  onClose: () => void
  onApply: (filters: FilterState) => void
  currentFilters: FilterState
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function FiltersModal({
  visible,
  onClose,
  onApply,
  currentFilters,
}: FiltersModalProps) {
  const { theme } = useTheme()
  const [filters, setFilters] = useState<FilterState>(currentFilters)
  const contentScale = useSharedValue(0.9)


  // API calls
  const systemsQuery = useSystems()
  const devicesQuery = useDevices()
  const emulatorsQuery = useEmulators()

  useEffect(() => {
    if (visible) {
      contentScale.value = withSpring(1)
    } else {
      contentScale.value = withSpring(0.9)
    }
  }, [visible, contentScale])

  useEffect(() => {
    setFilters(currentFilters)
  }, [currentFilters])

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
  }))

  const toggleArrayFilter = (
    filterKey: keyof FilterState,
    value: string | number,
  ) => {
    setFilters((prev) => {
      const currentValues = prev[filterKey] as any[]
      const isSelected = currentValues.includes(value)
      
      return {
        ...prev,
        [filterKey]: isSelected
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      }
    })
    Haptics.selectionAsync()
  }

  const clearAll = () => {
    setFilters({
      systemIds: [],
      deviceIds: [],
      emulatorIds: [],
      performanceRanks: [],
    })
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  const handleApply = () => {
    onApply(filters)
    onClose()
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  const performanceOptions = [
    { rank: 5, label: 'Perfect', color: theme.colors.performance.perfect },
    { rank: 4, label: 'Great', color: theme.colors.performance.great },
    { rank: 3, label: 'Good', color: theme.colors.performance.good },
    { rank: 2, label: 'Poor', color: theme.colors.performance.poor },
    { rank: 1, label: 'Unplayable', color: theme.colors.performance.unplayable },
  ]

  const hasActiveFilters = 
    filters.systemIds.length > 0 ||
    filters.deviceIds.length > 0 ||
    filters.emulatorIds.length > 0 ||
    filters.performanceRanks.length > 0

  const styles = createStyles(theme)

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <SafeAreaView style={styles.container} pointerEvents="box-none">
        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.springify().damping(20)}
          style={[styles.content, animatedContentStyle]}
        >
          <BlurView
            intensity={100}
            tint={theme.isDark ? 'dark' : 'light'}
            style={styles.blurContainer}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>Filters</Text>
                {hasActiveFilters && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>
                      {filters.systemIds.length +
                        filters.deviceIds.length +
                        filters.emulatorIds.length +
                        filters.performanceRanks.length}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.headerRight}>
                {hasActiveFilters && (
                  <Pressable onPress={clearAll} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear All</Text>
                  </Pressable>
                )}
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </Pressable>
              </View>
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Performance Filter */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance</Text>
                <View style={styles.filterGrid}>
                  {performanceOptions.map((option) => {
                    const isSelected = filters.performanceRanks.includes(option.rank)
                    return (
                      <AnimatedPressable
                        key={option.rank}
                        onPress={() => toggleArrayFilter('performanceRanks', option.rank)}
                        style={[
                          styles.filterChip,
                          isSelected && {
                            backgroundColor: option.color,
                            borderColor: option.color,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.performanceDot,
                            {
                              backgroundColor: isSelected
                                ? theme.colors.textInverse
                                : option.color,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.filterChipText,
                            isSelected && styles.filterChipTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </AnimatedPressable>
                    )
                  })}
                </View>
              </View>

              {/* Systems Filter */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Systems</Text>
                {systemsQuery.isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <View style={styles.filterGrid}>
                    {systemsQuery.data?.map((system: System) => {
                      const isSelected = filters.systemIds.includes(system.id)
                      return (
                        <AnimatedPressable
                          key={system.id}
                          onPress={() => toggleArrayFilter('systemIds', system.id)}
                          style={[
                            styles.filterChip,
                            isSelected && styles.filterChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              isSelected && styles.filterChipTextSelected,
                            ]}
                          >
                            {system.name}
                          </Text>
                          {isSelected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color={theme.colors.textInverse}
                              style={styles.checkIcon}
                            />
                          )}
                        </AnimatedPressable>
                      )
                    })}
                  </View>
                )}
              </View>

              {/* Devices Filter */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Devices</Text>
                {devicesQuery.isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <View style={styles.filterGrid}>
                    {devicesQuery.data?.slice(0, 20).map((device: Device) => {
                      const isSelected = filters.deviceIds.includes(device.id)
                      return (
                        <AnimatedPressable
                          key={device.id}
                          onPress={() => toggleArrayFilter('deviceIds', device.id)}
                          style={[
                            styles.filterChip,
                            isSelected && styles.filterChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              isSelected && styles.filterChipTextSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {device.brand?.name} {device.modelName}
                          </Text>
                          {isSelected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color={theme.colors.textInverse}
                              style={styles.checkIcon}
                            />
                          )}
                        </AnimatedPressable>
                      )
                    })}
                  </View>
                )}
              </View>

              {/* Emulators Filter */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emulators</Text>
                {emulatorsQuery.isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <View style={styles.filterGrid}>
                    {emulatorsQuery.data?.map((emulator: Emulator) => {
                      const isSelected = filters.emulatorIds.includes(emulator.id)
                      return (
                        <AnimatedPressable
                          key={emulator.id}
                          onPress={() => toggleArrayFilter('emulatorIds', emulator.id)}
                          style={[
                            styles.filterChip,
                            isSelected && styles.filterChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              isSelected && styles.filterChipTextSelected,
                            ]}
                          >
                            {emulator.name}
                          </Text>
                          {isSelected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color={theme.colors.textInverse}
                              style={styles.checkIcon}
                            />
                          )}
                        </AnimatedPressable>
                      )
                    })}
                  </View>
                )}
              </View>

              <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={onClose}
                style={styles.footerButton}
              />
              <Button
                title="Apply Filters"
                variant="primary"
                onPress={handleApply}
                style={styles.footerButton}
              />
            </View>
          </BlurView>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  )
}

function createStyles(theme: any) {
  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    content: {
      maxHeight: '85%',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
    },
    blurContainer: {
      flex: 1,
      backgroundColor: theme.colors.glass,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    activeBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    activeBadgeText: {
      color: theme.colors.textInverse,
      fontSize: 12,
      fontWeight: '600',
    },
    clearButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    clearButtonText: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: '500',
    },
    closeButton: {
      padding: 4,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    filterGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    filterChipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterChipText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    filterChipTextSelected: {
      color: theme.colors.textInverse,
    },
    performanceDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    checkIcon: {
      marginLeft: 4,
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    footerButton: {
      flex: 1,
    },
    bottomSpacing: {
      height: 20,
    },
  })
}