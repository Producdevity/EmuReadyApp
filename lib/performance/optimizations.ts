import { InteractionManager, Platform } from 'react-native'

/**
 * Delays execution until after interactions are complete
 * Useful for expensive operations that shouldn't block UI interactions
 */
export function runAfterInteractions<T>(callback: () => T): Promise<T> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      resolve(callback())
    })
  })
}

/**
 * Simple debounce function for search inputs and other frequent operations
 * @param func - The function to debounce
 * @param wait - The time in milliseconds to wait before executing the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit how often a function can be called
 * @param func - The function to throttle
 * @param limit - The time in milliseconds to wait before allowing the function to be called again
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let lastFunc: ReturnType<typeof setTimeout>
  let lastRan: number

  return function (...args: Parameters<T>) {
    if (!lastRan) {
      func(...args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func(...args)
            lastRan = Date.now()
          }
        },
        limit - (Date.now() - lastRan),
      )
    }
  }
}

/**
 * Memory-conscious image optimization settings
 */
export const IMAGE_OPTIMIZATION = {
  // Resize images based on screen density
  getOptimalImageSize: (originalWidth: number, originalHeight: number) => {
    const screenScale = Platform.select({
      ios: 2, // Retina
      android: 2, // HDPI+
      default: 1,
    })

    const maxWidth = 400 * screenScale
    const maxHeight = 300 * screenScale

    const aspectRatio = originalWidth / originalHeight

    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight }
    }

    if (aspectRatio > 1) {
      // Landscape
      return {
        width: maxWidth,
        height: maxWidth / aspectRatio,
      }
    } else {
      // Portrait or square
      return {
        width: maxHeight * aspectRatio,
        height: maxHeight,
      }
    }
  },
} as const

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitor = {
  startTiming: (label: string) => {
    if (__DEV__) {
      console.time(label)
    }
  },

  endTiming: (label: string) => {
    if (__DEV__) {
      console.timeEnd(label)
    }
  },

  logMemoryUsage: () => {
    if (__DEV__) {
      // Memory usage monitoring is not available in React Native
      // This would need a native module or platform-specific implementation
      console.log('Memory monitoring not available in React Native environment')
    }
  },
} as const

/**
 * Batch updates to reduce re-renders
 */
export function batchUpdates<T>(
  updates: Array<() => void>,
  callback?: (results: T[]) => void,
): void {
  const results: T[] = []

  // Execute all updates in next tick to batch them
  Promise.resolve().then(() => {
    updates.forEach((update, index) => {
      try {
        const result = update() as T
        results[index] = result
      } catch (error) {
        console.error(`Batch update ${index} failed:`, error)
      }
    })

    if (callback) {
      callback(results)
    }
  })
}

export default {
  runAfterInteractions,
  debounce,
  throttle,
  IMAGE_OPTIMIZATION,
  PerformanceMonitor,
  batchUpdates,
}
