import { QueryClient } from '@tanstack/react-query'
import { CONFIG } from '@/lib/constants/config'

// Create React Query client with mobile-optimized settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CONFIG.CACHE_TTL, // 5 minutes
      gcTime: CONFIG.CACHE_TTL * 6, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        const statusError = error as { status?: number }
        return statusError?.status && statusError.status >= 400 && statusError.status < 500
          ? false
          : failureCount < 3 // Limit retries to 3 for server errors
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      retry: false,
      networkMode: 'online',
    },
  },
})

// Function to check API availability
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    // Try a simple HEAD request to check if the API is reachable
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`${CONFIG.API_URL}/api/health`, {
      method: 'HEAD',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.warn('API availability check failed:', error)
    return false
  }
}

// Error handling utility
export const handleApiError = (error: unknown) => {
  console.error('API Error:', error)

  const typedError = error as { 
    message?: string; 
    status?: number; 
    data?: { code?: string }; 
    stack?: string 
  }

  // Log additional context for debugging
  if (CONFIG.IS_DEV) {
    console.error('Error details:', {
      message: typedError?.message,
      status: typedError?.status,
      data: typedError?.data,
      stack: typedError?.stack,
    })
  }

  return {
    message: typedError?.message || 'An unexpected error occurred',
    code: typedError?.data?.code || 'UNKNOWN_ERROR',
    status: typedError?.status,
  }
}

// Network status utilities for mobile
export const networkUtils = {
  isOnline: async (): Promise<boolean> => {
    try {
      // Test connectivity with a simple HEAD request to the API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${CONFIG.API_URL}/api/health`, {
        method: 'HEAD',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch {
      // If health endpoint fails, try a basic connectivity test
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const response = await fetch(`${CONFIG.API_URL}`, {
          method: 'HEAD',
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        return response.status < 500 // Accept any response that's not a server error
      } catch {
        return false
      }
    }
  },

  retryWithBackoff: async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxRetries - 1) throw error

        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, i) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
    throw new Error('Retry function failed to return')
  },
}