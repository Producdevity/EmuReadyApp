import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { Platform } from 'react-native'
import { CONFIG } from '@/lib/constants/config'

// Types for API response wrapper
interface ApiResponse<T = unknown> {
  json: T
}

// Global auth token getter
let getAuthToken: (() => Promise<string | null>) | null = null

export const setAuthTokenGetter = (getter: () => Promise<string | null>) => {
  getAuthToken = getter
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
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor to handle tRPC response format
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // tRPC returns data in result.data.json format
      if (response.data?.result?.data?.json !== undefined) {
        return {
          ...response,
          data: response.data.result.data.json,
        }
      }
      return response
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
    }
  )

  return instance
}

// Create the main axios instance
export const httpClient = createAxiosInstance()

// Utility functions for common HTTP methods with proper typing
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    httpClient.get<T>(url, config).then(response => response.data),
    
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => 
    httpClient.post<T>(url, data, config).then(response => response.data),
    
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => 
    httpClient.put<T>(url, data, config).then(response => response.data),
    
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => 
    httpClient.patch<T>(url, data, config).then(response => response.data),
    
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    httpClient.delete<T>(url, config).then(response => response.data),
}

// Network utilities
export const networkUtils = {
  isOnline: async (): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${CONFIG.API_URL}/api/health`, {
        method: 'HEAD',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch {
      return false
    }
  },

  retryWithBackoff: async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxRetries - 1) throw error

        const delay = Math.pow(2, i) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
    throw new Error('Retry function failed to return')
  },
}

// Error handling utility
export const handleApiError = (error: unknown) => {
  console.error('API Error:', error)

  const axiosError = error as { response?: { data?: { message?: string; code?: string }; status?: number }; message?: string }

  return {
    message: axiosError?.response?.data?.message || axiosError?.message || 'An unexpected error occurred',
    code: axiosError?.response?.data?.code || 'UNKNOWN_ERROR',
    status: axiosError?.response?.status,
  }
}