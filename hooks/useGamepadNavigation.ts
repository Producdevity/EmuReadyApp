import { GamepadEvent, gamepadNavigation, NavigationNode } from '@/lib/utils/gamepadNavigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BackHandler, Platform } from 'react-native'

interface UseGamepadNavigationOptions {
  id: string
  onFocus?: () => void
  onBlur?: () => void
  onSelect?: () => void
  nextFocusUp?: string
  nextFocusDown?: string
  nextFocusLeft?: string
  nextFocusRight?: string
  trapFocus?: boolean
  disabled?: boolean
  autoFocus?: boolean
}

export function useGamepadNavigation(options: UseGamepadNavigationOptions) {
  const ref = useRef(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isLandscape, setIsLandscape] = useState(gamepadNavigation.getIsLandscape())

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    options.onFocus?.()
  }, [options.onFocus])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    options.onBlur?.()
  }, [options.onBlur])

  const handleSelect = useCallback(() => {
    options.onSelect?.()
  }, [options.onSelect])

  useEffect(() => {
    const node: NavigationNode = {
      id: options.id,
      ref: ref.current,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onSelect: handleSelect,
      nextFocusUp: options.nextFocusUp,
      nextFocusDown: options.nextFocusDown,
      nextFocusLeft: options.nextFocusLeft,
      nextFocusRight: options.nextFocusRight,
      trapFocus: options.trapFocus,
      disabled: options.disabled,
    }

    const unregister = gamepadNavigation.registerNode(node)

    // Auto focus if requested and on Android
    if (options.autoFocus && Platform.OS === 'android') {
      setTimeout(() => {
        gamepadNavigation.setFocus(options.id)
      }, 100)
    }

    return unregister
  }, [
    options.id,
    options.nextFocusUp,
    options.nextFocusDown,
    options.nextFocusLeft,
    options.nextFocusRight,
    options.trapFocus,
    options.disabled,
    options.autoFocus,
    handleFocus,
    handleBlur,
    handleSelect,
  ])

  // Update orientation state
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLandscape(gamepadNavigation.getIsLandscape())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    ref,
    isFocused,
    isLandscape,
    setFocus: () => gamepadNavigation.setFocus(options.id),
  }
}

export function useGamepadEventHandler() {
  useEffect(() => {
    if (Platform.OS !== 'android') return

    const handleKeyDown = (event: any) => {
      const handled = gamepadNavigation.handleGamepadEvent(event as GamepadEvent)
      return handled
    }

    // For Android, we need to handle hardware key events
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Let the gamepad navigation handle back button
      return false
    })

    return () => {
      backHandler.remove()
    }
  }, [])
}

export function useOrientationOptimized() {
  const [isLandscape, setIsLandscape] = useState(gamepadNavigation.getIsLandscape())

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLandscape(gamepadNavigation.getIsLandscape())
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return {
    isLandscape,
    getLandscapeStyles: (portraitStyles: any, landscapeStyles: any) => {
      return isLandscape ? { ...portraitStyles, ...landscapeStyles } : portraitStyles
    },
  }
}
