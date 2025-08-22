import { CONFIG } from '@/lib/constants/config'
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { Platform } from 'react-native'
import { deserialize, type SuperJSONResult } from 'superjson'

// Response unwrapping utilities

// Global auth token getter
let getAuthToken: (() => Promise<string | null>) | null = null

export const setAuthTokenGetter = (getter: () => Promise<string | null>) => {
  getAuthToken = getter
}

// Response unwrapping utilities
interface UnwrapResult {
  data: unknown
  format: string
}

type UnwrapResultType = UnwrapResult | null

// Type guard to check if data is a SuperJSONResult
const isSuperJSONResult = (data: unknown): data is SuperJSONResult => {
  // Must be a non-null object
  if (typeof data !== 'object' || data === null) return false

  // Must have a 'json' property
  if (!Reflect.has(data, 'json')) return false

  // If it has 'meta', it must be undefined or an object
  if (Reflect.has(data, 'meta')) {
    const metaValue = Reflect.get(data, 'meta')
    if (metaValue !== undefined && (typeof metaValue !== 'object' || metaValue === null)) {
      return false
    }
  }

  return true
}

const deserializeIfNeeded = (data: unknown): unknown => {
  try {
    // Check if the data is in superjson format using proper type guard
    if (isSuperJSONResult(data)) return deserialize(data)

    // Return data as-is if it doesn't need deserialization
    return data
  } catch (error) {
    if (CONFIG.IS_DEV) {
      console.warn('⚠️ Superjson deserialization failed, using raw data:', error)
    }
    return data
  }
}

const unwrapTrpcResponse = (response: AxiosResponse): UnwrapResultType => {
  const { data, config } = response

  // Define unwrapping strategies in order of precedence
  const strategies = [
    {
      name: 'tRPC + json',
      condition: () => data?.result?.data?.json !== undefined,
      extract: () => data.result.data.json,
    },
    {
      name: 'tRPC direct',
      condition: () => data?.result?.data !== undefined,
      extract: () => data.result.data,
    },
    {
      name: 'json wrapped',
      condition: () => data?.json !== undefined,
      extract: () => data.json,
    },
  ]

  // Try each strategy
  for (const strategy of strategies) {
    if (strategy.condition()) {
      const extractedData = strategy.extract()

      if (CONFIG.IS_DEV) {
        console.log(`📥 API Response (${strategy.name}):`, config?.url, `→ Unwrapped`)
      }

      // Apply superjson deserialization for tRPC data handling
      const deserializedData = deserializeIfNeeded(extractedData)

      return { data: deserializedData, format: strategy.name }
    }
  }

  // No unwrapping needed
  if (CONFIG.IS_DEV && config?.url?.includes('/trpc/')) {
    console.log('📥 API Response (no wrapper):', config?.url, '→ Direct')
  }

  return null
}

// Create axios instance with default configuration
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${CONFIG.API_URL}/api`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'EmuReady-Mobile/1.0.0',
      'x-client-type': 'mobile',
      'x-client-platform': Platform.OS,
    },
    withCredentials: true,
  })

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    async (config) => {
      if (getAuthToken) {
        const token = await getAuthToken()
        if (token) config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  // Response interceptor to handle tRPC response format
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const unwrappedData = unwrapTrpcResponse(response)

      return unwrappedData !== null ? { ...response, data: unwrappedData.data } : response
    },
    (error) => {
      // Handle common errors
      if (error.response?.status === 401) {
        // Unauthorized - only log in development to avoid noise
        if (CONFIG.IS_DEV) {
          console.warn('API request requires authentication')
        }
      }

      // Log error details in development
      if (CONFIG.IS_DEV) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        })
      }

      return Promise.reject(error)
    },
  )

  return instance
}

// Create the main axios instance
export const httpClient = createAxiosInstance()

// Utility functions for common HTTP methods with proper typing
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    httpClient.get<T>(url, config).then((response) => response.data),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    httpClient.post<T>(url, data, config).then((response) => response.data),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    httpClient.put<T>(url, data, config).then((response) => response.data),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    httpClient.patch<T>(url, data, config).then((response) => response.data),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    httpClient.delete<T>(url, config).then((response) => response.data),
}
