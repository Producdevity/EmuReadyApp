import { Tabs } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'

import { HapticTab } from '@/components/HapticTab'
import { IconSymbol } from '@/components/ui/IconSymbol'
import TabBarBackground from '@/components/ui/TabBarBackground'
import AnimatedTabBar from '@/components/ui/AnimatedTabBar'
import GamepadTabBar from '@/components/ui/GamepadTabBar'
import { useGamepadEventHandler, useOrientationOptimized } from '@/hooks/useGamepadNavigation'
import { useTheme } from '@/contexts/ThemeContext'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function TabLayout() {
  const { theme } = useTheme()
  const { isLandscape } = useOrientationOptimized()
  
  // Initialize gamepad event handling
  useGamepadEventHandler()

  // Use gamepad-optimized tab bar on Android for gaming handhelds
  const TabBarComponent = Platform.OS === 'android' ? GamepadTabBar : AnimatedTabBar

  return (
    <ErrorBoundary>
      <Tabs
        tabBar={(props) => <TabBarComponent {...props} />}
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
              backgroundColor: 'transparent',
            },
            android: {
              // Optimize for landscape gaming handhelds
              height: isLandscape ? 60 : 85,
              paddingHorizontal: isLandscape ? 8 : 0,
              backgroundColor: 'transparent',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="browse"
          options={{
            title: 'Browse',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Add',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
      </Tabs>
    </ErrorBoundary>
  )
}
