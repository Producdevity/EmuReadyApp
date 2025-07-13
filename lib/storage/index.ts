import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { STORAGE_KEYS } from '@/lib/constants'
import { isJsonPrimitive } from '@/lib/utils/isJsonPrimitive'

// AsyncStorage wrapper for non-sensitive data
class AsyncStorageWrapper {
  private prefix: string

  constructor(id: string) {
    this.prefix = `${id}_`
  }

  async set(key: string, value: any): Promise<void> {
    const prefixedKey = `${this.prefix}${key}`
    if (value === undefined) {
      return this.delete(key)
    }

    const stringValue = isJsonPrimitive(value) ? String(value) : JSON.stringify(value)
    await AsyncStorage.setItem(prefixedKey, stringValue)
  }

  async getString(key: string): Promise<string | undefined> {
    const prefixedKey = `${this.prefix}${key}`
    const value = await AsyncStorage.getItem(prefixedKey)
    return value ?? undefined
  }

  async getNumber(key: string): Promise<number | undefined> {
    const value = await this.getString(key)
    if (value === undefined) return undefined
    const num = Number(value)
    return isNaN(num) ? undefined : num
  }

  async getBoolean(key: string): Promise<boolean | undefined> {
    const value = await this.getString(key)
    if (value === undefined) return undefined
    return value === 'true'
  }

  async delete(key: string): Promise<void> {
    const prefixedKey = `${this.prefix}${key}`
    await AsyncStorage.removeItem(prefixedKey)
  }

  async clearAll(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys()
    const prefixedKeys = keys.filter((key) => key.startsWith(this.prefix))
    await AsyncStorage.multiRemove(prefixedKeys)
  }

  async getAllKeys(): Promise<string[]> {
    const keys = await AsyncStorage.getAllKeys()
    return keys
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.substring(this.prefix.length))
  }
}

// SecureStore wrapper for sensitive data (auth tokens, etc.)
class SecureStorageWrapper {
  private prefix: string

  constructor(id: string) {
    this.prefix = `${id}_`
  }

  async set(key: string, value: any): Promise<void> {
    const prefixedKey = `${this.prefix}${key}`
    if (value === undefined) {
      return this.delete(key)
    }

    const stringValue = isJsonPrimitive(value) ? String(value) : JSON.stringify(value)
    await SecureStore.setItemAsync(prefixedKey, stringValue)
  }

  async getString(key: string): Promise<string | undefined> {
    const prefixedKey = `${this.prefix}${key}`
    const value = await SecureStore.getItemAsync(prefixedKey)
    return value ?? undefined
  }

  async getNumber(key: string): Promise<number | undefined> {
    const value = await this.getString(key)
    if (value === undefined) return undefined
    const num = Number(value)
    return isNaN(num) ? undefined : num
  }

  async getBoolean(key: string): Promise<boolean | undefined> {
    const value = await this.getString(key)
    if (value === undefined) return undefined
    return value === 'true'
  }

  async delete(key: string): Promise<void> {
    const prefixedKey = `${this.prefix}${key}`
    await SecureStore.deleteItemAsync(prefixedKey)
  }

  async clearAll(): Promise<void> {
    // SecureStore doesn't have a way to get all keys, so we'll track known keys
    const knownKeys = [STORAGE_KEYS.AUTH_TOKEN]
    for (const key of knownKeys) {
      try {
        await this.delete(key)
      } catch (error) {
        // Key might not exist, ignore
        console.error(error)
      }
    }
  }

  async getAllKeys(): Promise<string[]> {
    // SecureStore doesn't support getAllKeys, return empty array
    return []
  }
}

// Create storage instances
const storage = new AsyncStorageWrapper('emuready-storage')
const secureStorage = new SecureStorageWrapper('emuready-secure-storage')

// Storage interface
export interface Storage {
  set: (key: string, value: any) => Promise<void>
  get: <T = any>(key: string) => Promise<T | undefined>
  delete: (key: string) => Promise<void>
  clear: () => Promise<void>
  getAllKeys: () => Promise<string[]>
}

const createStorageWrapper = (
  storageInstance: AsyncStorageWrapper | SecureStorageWrapper,
): Storage => ({
  set: async (key: string, value: any) => {
    await storageInstance.set(key, value)
  },

  get: async <T = any>(key: string): Promise<T | undefined> => {
    try {
      const value = await storageInstance.getString(key)
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
      const numberValue = await storageInstance.getNumber(key)
      if (numberValue !== undefined) return numberValue as T

      const booleanValue = await storageInstance.getBoolean(key)
      if (booleanValue !== undefined) return booleanValue as T

      return undefined
    }
  },

  delete: async (key: string) => {
    await storageInstance.delete(key)
  },

  clear: async () => {
    await storageInstance.clearAll()
  },

  getAllKeys: async () => {
    return await storageInstance.getAllKeys()
  },
})

export const appStorage = createStorageWrapper(storage)
export const secureAppStorage = createStorageWrapper(secureStorage)

export const authStorage = {
  setToken: async (token: string) => await secureAppStorage.set(STORAGE_KEYS.AUTH_TOKEN, token),
  getToken: async () => await secureAppStorage.get<string>(STORAGE_KEYS.AUTH_TOKEN),
  removeToken: async () => await secureAppStorage.delete(STORAGE_KEYS.AUTH_TOKEN),
}

export const preferencesStorage = {
  setPreferences: async (preferences: any) =>
    await appStorage.set(STORAGE_KEYS.USER_PREFERENCES, preferences),
  getPreferences: async () => await appStorage.get(STORAGE_KEYS.USER_PREFERENCES),
  removePreferences: async () => await appStorage.delete(STORAGE_KEYS.USER_PREFERENCES),
}

export const cacheStorage = {
  setCache: async (key: string, data: any, ttl?: number) => {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 1000 * 60 * 60, // Default 1 hour
    }
    await appStorage.set(`${STORAGE_KEYS.CACHED_DATA}_${key}`, cacheData)
  },

  getCache: async <T = any>(key: string): Promise<T | null> => {
    const cacheData = await appStorage.get(`${STORAGE_KEYS.CACHED_DATA}_${key}`)
    if (!cacheData) return null

    if (Date.now() - cacheData.timestamp > cacheData.ttl) {
      await appStorage.delete(`${STORAGE_KEYS.CACHED_DATA}_${key}`)
      return null
    }

    return cacheData.data
  },

  removeCache: async (key: string) => await appStorage.delete(`${STORAGE_KEYS.CACHED_DATA}_${key}`),

  clearExpiredCache: async () => {
    const keys = await appStorage.getAllKeys()
    const cacheKeys = keys.filter((key) => key.startsWith(STORAGE_KEYS.CACHED_DATA))

    for (const key of cacheKeys) {
      const cacheData = await appStorage.get(key)
      if (!cacheData) continue

      if (Date.now() - cacheData.timestamp <= cacheData.ttl) continue

      await appStorage.delete(key)
    }
  },
}
