import { QueryClient } from '@tanstack/react-query'
import { createTRPCReact } from '@trpc/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import { CONFIG } from '@/lib/constants/config'

// Use any for now since we can't import the actual AppRouter from backend in React Native
// The backend's AppRouter will be automatically inferred through the network calls
type BackendRouter = any

// Create tRPC client with any casting to bypass type issues
export const trpc = createTRPCReact() as any

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
        // Limit retries to 3 for server errors
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

// Function to check API availability
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    // Try a simple HEAD request to check if the API is reachable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${CONFIG.API_URL}/api/health`, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('API availability check failed:', error);
    return false;
  }
};

// Create tRPC client configuration
const getTRPCClientConfig = () => ({
  links: [
    httpBatchLink({
      url: `${CONFIG.API_URL}/api/mobile/trpc`,
      async headers() {
        const token = getAuthToken ? await getAuthToken() : null
        return {
          'Content-Type': 'application/json',
          'User-Agent': 'EmuReady-Mobile/1.0.0',
          'x-client-type': 'mobile',
          'x-client-platform': Platform.OS,
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      },
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include', // Important for session cookies
        })
      },
    }),
  ],
})

// Create the standalone tRPC client for direct calls  
export const standaloneClient = createTRPCClient(getTRPCClientConfig()) as any

// Create client factory for React Provider
export const createMobileTRPCClient = () => standaloneClient

// HTTP client for direct API calls (fallback)
export const httpClient = {
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = getAuthToken ? await getAuthToken() : null
    const url = `${CONFIG.API_URL}/api${endpoint}`

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important for NextAuth.js sessions
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EmuReady-Mobile/1.0.0',
        'x-client-type': 'mobile',
        'x-client-platform': Platform.OS,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (response.status === 401) {
      // Handle unauthorized - redirect to login or refresh session
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
