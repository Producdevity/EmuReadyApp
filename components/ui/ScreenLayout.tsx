import React from 'react'
import { View, StatusBar, ScrollView, RefreshControl, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/contexts/ThemeContext'

interface ScreenLayoutProps {
  children: React.ReactNode
  scrollable?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  contentContainerStyle?: ViewStyle
  style?: ViewStyle
  safeAreaStyle?: ViewStyle
  showsVerticalScrollIndicator?: boolean
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled'
}

export function ScreenLayout({
  children,
  scrollable = true,
  refreshing = false,
  onRefresh,
  contentContainerStyle,
  style,
  safeAreaStyle,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = 'handled',
}: ScreenLayoutProps) {
  const { theme } = useTheme()

  const content = scrollable ? (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      contentContainerStyle={[
        { paddingBottom: theme.spacing.xxxl },
        contentContainerStyle,
      ]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1 }}>{children}</View>
  )

  return (
    <View style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={[{ flex: 1 }, safeAreaStyle]}>
        {content}
      </SafeAreaView>
    </View>
  )
}