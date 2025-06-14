import { MMKV } from 'react-native-mmkv';
import { STORAGE_KEYS } from '../constants';

// Create storage instances
const storage = new MMKV({
  id: 'emuready-storage',
  encryptionKey: 'emuready-encryption-key', // In production, use a proper key
});

const secureStorage = new MMKV({
  id: 'emuready-secure-storage',
  encryptionKey: 'emuready-secure-encryption-key', // In production, use a proper key
});

// Storage interface
export interface Storage {
  set: (key: string, value: any) => void;
  get: <T = any>(key: string) => T | undefined;
  delete: (key: string) => void;
  clear: () => void;
  getAllKeys: () => string[];
}

// Create storage wrapper
const createStorageWrapper = (mmkvInstance: MMKV): Storage => ({
  set: (key: string, value: any) => {
    if (value === undefined) {
      mmkvInstance.delete(key);
      return;
    }
    
    if (typeof value === 'string') {
      mmkvInstance.set(key, value);
    } else if (typeof value === 'number') {
      mmkvInstance.set(key, value);
    } else if (typeof value === 'boolean') {
      mmkvInstance.set(key, value);
    } else {
      mmkvInstance.set(key, JSON.stringify(value));
    }
  },
  
  get: <T = any>(key: string): T | undefined => {
    try {
      const value = mmkvInstance.getString(key);
      if (value === undefined) return undefined;
      
      // Try to parse as JSON first
      try {
        return JSON.parse(value) as T;
      } catch {
        // If parsing fails, return as string
        return value as T;
      }
    } catch {
      // Fallback to other types
      const numberValue = mmkvInstance.getNumber(key);
      if (numberValue !== undefined) return numberValue as T;
      
      const booleanValue = mmkvInstance.getBoolean(key);
      if (booleanValue !== undefined) return booleanValue as T;
      
      return undefined;
    }
  },
  
  delete: (key: string) => {
    mmkvInstance.delete(key);
  },
  
  clear: () => {
    mmkvInstance.clearAll();
  },
  
  getAllKeys: () => {
    return mmkvInstance.getAllKeys();
  },
});

// Export storage instances
export const appStorage = createStorageWrapper(storage);
export const secureAppStorage = createStorageWrapper(secureStorage);

// Convenience functions for common operations
export const authStorage = {
  setToken: (token: string) => secureAppStorage.set(STORAGE_KEYS.AUTH_TOKEN, token),
  getToken: () => secureAppStorage.get<string>(STORAGE_KEYS.AUTH_TOKEN),
  removeToken: () => secureAppStorage.delete(STORAGE_KEYS.AUTH_TOKEN),
};

export const preferencesStorage = {
  setPreferences: (preferences: any) => appStorage.set(STORAGE_KEYS.USER_PREFERENCES, preferences),
  getPreferences: () => appStorage.get(STORAGE_KEYS.USER_PREFERENCES),
  removePreferences: () => appStorage.delete(STORAGE_KEYS.USER_PREFERENCES),
};

export const cacheStorage = {
  setCache: (key: string, data: any, ttl?: number) => {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 1000 * 60 * 60, // Default 1 hour
    };
    appStorage.set(`${STORAGE_KEYS.CACHED_DATA}_${key}`, cacheData);
  },
  
  getCache: <T = any>(key: string): T | null => {
    const cacheData = appStorage.get(`${STORAGE_KEYS.CACHED_DATA}_${key}`);
    if (!cacheData) return null;
    
    const { data, timestamp, ttl } = cacheData;
    const now = Date.now();
    
    if (now - timestamp > ttl) {
      appStorage.delete(`${STORAGE_KEYS.CACHED_DATA}_${key}`);
      return null;
    }
    
    return data;
  },
  
  removeCache: (key: string) => appStorage.delete(`${STORAGE_KEYS.CACHED_DATA}_${key}`),
  
  clearExpiredCache: () => {
    const keys = appStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CACHED_DATA));
    
    cacheKeys.forEach(key => {
      const cacheData = appStorage.get(key);
      if (cacheData) {
        const { timestamp, ttl } = cacheData;
        const now = Date.now();
        
        if (now - timestamp > ttl) {
          appStorage.delete(key);
        }
      }
    });
  },
}; 