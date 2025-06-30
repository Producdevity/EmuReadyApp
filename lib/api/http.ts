import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { Platform } from 'react-native'
import { CONFIG } from '@/lib/constants/config'

// Types for API response wrapper
interface ApiResponse<T = any> {
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

  // Response interceptor to handle .json wrapper and errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Check if response has .json wrapper and unwrap it
      if (response.data && typeof response.data === 'object' && 'json' in response.data) {
        return {
          ...response,
          data: response.data.json,
        }
      }
      return response
    },
    (error) => {
      // Handle common errors
      if (error.response?.status === 401) {
        // Unauthorized - could trigger logout or token refresh
        console.warn('Unauthorized request - token may be expired')
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
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    httpClient.get<T>(url, config).then(response => response.data),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    httpClient.post<T>(url, data, config).then(response => response.data),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    httpClient.put<T>(url, data, config).then(response => response.data),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    httpClient.patch<T>(url, data, config).then(response => response.data),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => 
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

  retryWithBackoff: async (fn: () => Promise<any>, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxRetries - 1) throw error

        const delay = Math.pow(2, i) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  },
}

// Error handling utility
export const handleApiError = (error: any) => {
  console.error('API Error:', error)

  return {
    message: error?.response?.data?.message || error?.message || 'An unexpected error occurred',
    code: error?.response?.data?.code || 'UNKNOWN_ERROR',
    status: error?.response?.status,
  }
}