import React from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { useCheckUserHasReports } from '@/lib/api/hooks'
import Card from '@/components/ui/Card'

export default function ReportsScreen() {
  const { theme } = useTheme()
  const { data: reportStatus, isLoading, error } = useCheckUserHasReports()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4 border-b" style={{ borderBottomColor: theme.colors.border }}>
          <Text className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            Content Reports
          </Text>
          <Text className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
            Your reporting activity and status
          </Text>
        </View>

        <View className="p-4">
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-16">
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text className="mt-4" style={{ color: theme.colors.textSecondary }}>
                Loading report status...
              </Text>
            </View>
          ) : error ? (
            <Card>
              <View className="p-4 items-center">
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                <Text
                  className="text-lg font-semibold mt-2 mb-1"
                  style={{ color: theme.colors.error }}
                >
                  Error Loading Reports
                </Text>
                <Text className="text-center" style={{ color: theme.colors.textSecondary }}>
                  Unable to load your report status. Please try again later.
                </Text>
              </View>
            </Card>
          ) : (
            <>
              {/* Report Status Overview */}
              <Card style={{ marginBottom: theme.spacing.md }}>
                <View className="p-4">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
                    <Text
                      className="text-lg font-semibold ml-2"
                      style={{ color: theme.colors.text }}
                    >
                      Report Status
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ color: theme.colors.textSecondary }}>Reports Submitted</Text>
                    <Text className="font-semibold" style={{ color: theme.colors.text }}>
                      {reportStatus?.reportCount || 0}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text style={{ color: theme.colors.textSecondary }}>Account Status</Text>
                    <View className="flex-row items-center">
                      <Ionicons
                        name={reportStatus?.hasReports ? 'checkmark-circle' : 'shield'}
                        size={16}
                        color={
                          reportStatus?.hasReports ? theme.colors.success : theme.colors.primary
                        }
                      />
                      <Text
                        className="font-semibold ml-1"
                        style={{
                          color: reportStatus?.hasReports
                            ? theme.colors.success
                            : theme.colors.primary,
                        }}
                      >
                        {reportStatus?.hasReports ? 'Active Reporter' : 'Good Standing'}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>

              {/* Reporting Guidelines */}
              <Card style={{ marginBottom: theme.spacing.md }}>
                <View className="p-4">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                    <Text
                      className="text-lg font-semibold ml-2"
                      style={{ color: theme.colors.text }}
                    >
                      Reporting Guidelines
                    </Text>
                  </View>

                  <Text
                    className="mb-3"
                    style={{ color: theme.colors.textSecondary, lineHeight: 20 }}
                  >
                    Help us maintain a safe and quality community by reporting content that violates
                    our guidelines:
                  </Text>

                  <View className="space-y-2">
                    <View className="flex-row items-start">
                      <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                      <Text className="ml-2 flex-1" style={{ color: theme.colors.textSecondary }}>
                        Report false or misleading performance information
                      </Text>
                    </View>
                    <View className="flex-row items-start">
                      <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                      <Text className="ml-2 flex-1" style={{ color: theme.colors.textSecondary }}>
                        Flag inappropriate or offensive content
                      </Text>
                    </View>
                    <View className="flex-row items-start">
                      <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                      <Text className="ml-2 flex-1" style={{ color: theme.colors.textSecondary }}>
                        Identify spam or duplicate listings
                      </Text>
                    </View>
                    <View className="flex-row items-start">
                      <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                      <Text className="ml-2 flex-1" style={{ color: theme.colors.textSecondary }}>
                        Report harassment or bullying
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>

              {/* How to Report */}
              <Card>
                <View className="p-4">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="flag" size={20} color={theme.colors.primary} />
                    <Text
                      className="text-lg font-semibold ml-2"
                      style={{ color: theme.colors.text }}
                    >
                      How to Report
                    </Text>
                  </View>

                  <Text
                    className="mb-3"
                    style={{ color: theme.colors.textSecondary, lineHeight: 20 }}
                  >
                    You can report any listing or content by:
                  </Text>

                  <View className="space-y-3">
                    <View className="flex-row items-start">
                      <View
                        className="w-6 h-6 rounded-full mr-3 items-center justify-center"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        <Text className="text-xs font-bold text-white">1</Text>
                      </View>
                      <Text className="flex-1" style={{ color: theme.colors.textSecondary }}>
                        Opening any listing detail page
                      </Text>
                    </View>
                    <View className="flex-row items-start">
                      <View
                        className="w-6 h-6 rounded-full mr-3 items-center justify-center"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        <Text className="text-xs font-bold text-white">2</Text>
                      </View>
                      <Text className="flex-1" style={{ color: theme.colors.textSecondary }}>
                        Tapping the report button (flag icon)
                      </Text>
                    </View>
                    <View className="flex-row items-start">
                      <View
                        className="w-6 h-6 rounded-full mr-3 items-center justify-center"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        <Text className="text-xs font-bold text-white">3</Text>
                      </View>
                      <Text className="flex-1" style={{ color: theme.colors.textSecondary }}>
                        Selecting the appropriate reason and providing details
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
