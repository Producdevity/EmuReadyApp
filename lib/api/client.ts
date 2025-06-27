import { QueryClient } from '@tanstack/react-query'
import { createTRPCReact } from '@trpc/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import 'react-native-url-polyfill/auto'
import { CONFIG } from '@/lib/constants/config'

// Create the tRPC React client for hooks
export const trpc = createTRPCReact<any>()

// Create React Query client with mobile-optimized settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CONFIG.CACHE_TTL, // 5 minutes
      gcTime: CONFIG.CACHE_TTL * 6, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
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

// Function to get auth token from Clerk
let getAuthToken: (() => Promise<string | null>) | null = null

export const setAuthTokenGetter = (getter: () => Promise<string | null>) => {
  getAuthToken = getter
}

// Create tRPC client configuration
const getTRPCClientConfig = () => ({
  links: [
    httpBatchLink({
      url: `${CONFIG.API_URL}/api/mobile/trpc`,
      async headers() {
        const token = getAuthToken ? await getAuthToken() : null
        return {
          'Content-Type': 'application/json',
          'x-client-type': 'mobile',
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      },
    }),
  ],
})

// Create the standalone tRPC client for direct calls
export const standaloneClient = createTRPCClient<any>(getTRPCClientConfig())

// Create client factory for React Provider
export const createMobileTRPCClient = () => standaloneClient

// HTTP client for direct API calls (fallback)
export const httpClient = {
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = getAuthToken ? await getAuthToken() : null
    const url = `${CONFIG.API_URL}/api/mobile${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-client-type': 'mobile',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (response.status === 401) {
      // Handle unauthorized - Clerk will handle token refresh
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`,
      )
    }

    return response.json()
  },

  get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' })
  },

  post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' })
  },
}

// Error handling utility
export const handleApiError = (error: any) => {
  console.error('API Error:', error)

  // Log additional context for debugging
  if (CONFIG.IS_DEV) {
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      data: error?.data,
      stack: error?.stack,
    })
  }

  return {
    message: error?.message || 'An unexpected error occurred',
    code: error?.data?.code || 'UNKNOWN_ERROR',
    status: error?.status,
  }
}

// Network status utilities for mobile
export const networkUtils = {
  isOnline: () => {
    // TODO: replace with actual network detection later
    return true
  },

  retryWithBackoff: async (fn: () => Promise<any>, maxRetries = 3) => {
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
  },
}
