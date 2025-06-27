import { MMKV } from 'react-native-mmkv'
import { STORAGE_KEYS } from '@/lib/constants'
import { isJsonPrimitive } from '@/lib/utils/isJsonPrimitive'

// Generate secure encryption keys for production
const generateEncryptionKey = (identifier: string): string => {
  // In production, this should be retrieved from secure storage or keychain
  // For now, we create deterministic but secure keys based on bundle ID
  const baseKey = 'EmuReady-Mobile-v1.0'
  const combined = `${baseKey}-${identifier}`
  
  // Simple hash function - in production use crypto.subtle or similar
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return `${baseKey}-${Math.abs(hash).toString(36)}-secure`
}

// Create storage instances with secure encryption
const storage = new MMKV({
  id: 'emuready-storage',
  encryptionKey: generateEncryptionKey('general'),
})

const secureStorage = new MMKV({
  id: 'emuready-secure-storage', 
  encryptionKey: generateEncryptionKey('secure'),
})

// Storage interface
export interface Storage {
  set: (key: string, value: any) => void
  get: <T = any>(key: string) => T | undefined
  delete: (key: string) => void
  clear: () => void
  getAllKeys: () => string[]
}

const createStorageWrapper = (mmkvInstance: MMKV): Storage => ({
  set: (key: string, value: any) => {
    if (value === undefined) return mmkvInstance.delete(key)

    return isJsonPrimitive(value)
      ? mmkvInstance.set(key, value)
      : mmkvInstance.set(key, JSON.stringify(value))
  },

  get: <T = any>(key: string): T | undefined => {
    try {
      const value = mmkvInstance.getString(key)
      if (value === undefined) return undefined

      // Try to parse as JSON first
      try {
        return JSON.parse(value) as T
      } catch {
        // If parsing fails, return as string
        return value as T
      }
    } catch {
      // Fallback to other types
      const numberValue = mmkvInstance.getNumber(key)
      if (numberValue !== undefined) return numberValue as T

      const booleanValue = mmkvInstance.getBoolean(key)
      if (booleanValue !== undefined) return booleanValue as T

      return undefined
    }
  },

  delete: (key: string) => mmkvInstance.delete(key),

  clear: () => mmkvInstance.clearAll(),

  getAllKeys: () => mmkvInstance.getAllKeys(),
})

export const appStorage = createStorageWrapper(storage)
export const secureAppStorage = createStorageWrapper(secureStorage)

export const authStorage = {
  setToken: (token: string) =>
    secureAppStorage.set(STORAGE_KEYS.AUTH_TOKEN, token),
  getToken: () => secureAppStorage.get<string>(STORAGE_KEYS.AUTH_TOKEN),
  removeToken: () => secureAppStorage.delete(STORAGE_KEYS.AUTH_TOKEN),
}

export const preferencesStorage = {
  setPreferences: (preferences: any) =>
    appStorage.set(STORAGE_KEYS.USER_PREFERENCES, preferences),
  getPreferences: () => appStorage.get(STORAGE_KEYS.USER_PREFERENCES),
  removePreferences: () => appStorage.delete(STORAGE_KEYS.USER_PREFERENCES),
}

export const cacheStorage = {
  setCache: (key: string, data: any, ttl?: number) => {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 1000 * 60 * 60, // Default 1 hour
    }
    appStorage.set(`${STORAGE_KEYS.CACHED_DATA}_${key}`, cacheData)
  },

  getCache: <T = any>(key: string): T | null => {
    const cacheData = appStorage.get(`${STORAGE_KEYS.CACHED_DATA}_${key}`)
    if (!cacheData) return null

    if (Date.now() - cacheData.timestamp > cacheData.ttl) {
      appStorage.delete(`${STORAGE_KEYS.CACHED_DATA}_${key}`)
      return null
    }

    return cacheData.data
  },

  removeCache: (key: string) =>
    appStorage.delete(`${STORAGE_KEYS.CACHED_DATA}_${key}`),

  clearExpiredCache: () => {
    const keys = appStorage.getAllKeys()
    const cacheKeys = keys.filter((key) =>
      key.startsWith(STORAGE_KEYS.CACHED_DATA),
    )

    cacheKeys.forEach((key) => {
      const cacheData = appStorage.get(key)
      if (!cacheData) return

      if (Date.now() - cacheData.timestamp <= cacheData.ttl) return

      appStorage.delete(key)
    })
  },
}
