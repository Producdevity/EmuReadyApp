import { useState, useEffect } from 'react'
import { networkUtils } from '@/lib/api/client'
import { queryClient } from '@/lib/api/client'

// Simple storage interface for offline functionality
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // In production, you would use AsyncStorage or MMKV
      return null
    } catch {
      return null
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      // In production, you would use AsyncStorage or MMKV
    } catch {
      // Handle error
    }
  },
}

interface OfflineState {
  isOnline: boolean
  isConnected: boolean
  connectionType: string | null
  hasOfflineData: boolean
  lastSyncTime: Date | null
}

interface OfflineQueue {
  id: string
  type: 'mutation'
  endpoint: string
  data: any
  timestamp: Date
  retryCount: number
}

const OFFLINE_QUEUE_KEY = 'offline_queue'
const LAST_SYNC_KEY = 'last_sync_time'
const MAX_RETRY_COUNT = 3

const useOfflineMode = () => {
  const [state, setState] = useState<OfflineState>({
    isOnline: true,
    isConnected: true,
    connectionType: null,
    hasOfflineData: false,
    lastSyncTime: null,
  })

  const [offlineQueue, setOfflineQueue] = useState<OfflineQueue[]>([])

  const processOfflineQueue = async () => {
    if (offlineQueue.length === 0) {
      return
    }

    console.log(`Processing ${offlineQueue.length} offline items...`)

    const processedItems: string[] = []
    const failedItems: OfflineQueue[] = []

    for (const item of offlineQueue) {
      try {
        // Here you would call your actual API endpoints
        // For now, we'll simulate processing
        console.log(`Processing offline item: ${item.endpoint}`)

        // Simulate API call success/failure
        const success = Math.random() > 0.1 // 90% success rate

        if (success) {
          processedItems.push(item.id)

          // Invalidate related queries to refetch fresh data
          await queryClient.invalidateQueries()
        } else {
          throw new Error('Simulated API failure')
        }
      } catch (error) {
        console.error(`Failed to process offline item ${item.id}:`, error)

        // Retry logic
        if (item.retryCount < MAX_RETRY_COUNT) {
          failedItems.push({
            ...item,
            retryCount: item.retryCount + 1,
          })
        } else {
          console.warn(`Max retries reached for item ${item.id}, discarding`)
        }
      }
    }

    // Update queue by removing processed items and updating failed items
    const newQueue = offlineQueue
      .filter((item) => !processedItems.includes(item.id))
      .map((item) => {
        const failedItem = failedItems.find((failed) => failed.id === item.id)
        return failedItem || item
      })

    setOfflineQueue(newQueue)
    await saveOfflineQueue(newQueue)

    // Update last sync time
    const now = new Date()
    await storage.setItem(LAST_SYNC_KEY, now.toISOString())
    setState((prev) => ({
      ...prev,
      lastSyncTime: now,
    }))

    console.log(
      `Offline queue processed: ${processedItems.length} successful, ${failedItems.length} failed`,
    )
  }

  useEffect(() => {
    // Check network status periodically
    const checkNetworkStatus = async () => {
      const isOnline = await networkUtils.isOnline()

      setState((prev) => ({
        ...prev,
        isOnline,
        isConnected: isOnline,
        connectionType: isOnline ? 'wifi' : 'none',
      }))

      // If we just came back online, process the offline queue
      if (isOnline && !state.isOnline) {
        setTimeout(() => processOfflineQueue(), 1000)
      }
    }

    // Check immediately
    checkNetworkStatus()

    // Check every 30 seconds
    const interval = setInterval(checkNetworkStatus, 30000)

    // Load offline queue and last sync time on mount
    loadOfflineData()

    return () => {
      clearInterval(interval)
    }
  }, [])

  const loadOfflineData = async () => {
    try {
      const queueData = await storage.getItem(OFFLINE_QUEUE_KEY)
      const lastSync = await storage.getItem(LAST_SYNC_KEY)

      const queue: OfflineQueue[] = queueData ? JSON.parse(queueData) : []
      const syncTime = lastSync ? new Date(lastSync) : null

      setOfflineQueue(queue)
      setState((prev) => ({
        ...prev,
        hasOfflineData: queue.length > 0,
        lastSyncTime: syncTime,
      }))
    } catch (error) {
      console.error('Failed to load offline data:', error)
    }
  }

  const saveOfflineQueue = async (queue: OfflineQueue[]) => {
    try {
      await storage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
      setState((prev) => ({
        ...prev,
        hasOfflineData: queue.length > 0,
      }))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }

  const addToOfflineQueue = async (endpoint: string, data: any, type: 'mutation' = 'mutation') => {
    const queueItem: OfflineQueue = {
      id: `${Date.now()}_${Math.random()}`,
      type,
      endpoint,
      data,
      timestamp: new Date(),
      retryCount: 0,
    }

    const newQueue = [...offlineQueue, queueItem]
    setOfflineQueue(newQueue)
    await saveOfflineQueue(newQueue)
  }

  const clearOfflineQueue = async () => {
    setOfflineQueue([])
    await saveOfflineQueue([])
  }

  const getOfflineCapabilities = () => {
    return {
      canRead: true, // Cached data is always available
      canWrite: !state.isOnline, // Queue writes when offline
      canSync: state.isOnline, // Only sync when online
      queueLength: offlineQueue.length,
    }
  }

  const forceSync = async () => {
    if (state.isOnline) {
      await processOfflineQueue()
      await queryClient.invalidateQueries()
    }
  }

  return {
    ...state,
    offlineQueue,
    addToOfflineQueue,
    processOfflineQueue,
    clearOfflineQueue,
    forceSync,
    getOfflineCapabilities,
  }
}

export default useOfflineMode
