import { useCallback, useState } from 'react'

type RefetchFunction = () => Promise<unknown> | void

interface UseRefreshableQueryProps {
  queries: RefetchFunction[]
  onRefresh?: () => void | Promise<void>
}

interface UseRefreshableQueryReturn {
  refreshing: boolean
  onRefresh: () => Promise<void>
}

export const useRefreshableQuery = ({
  queries,
  onRefresh: customOnRefresh,
}: UseRefreshableQueryProps): UseRefreshableQueryReturn => {
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)

    try {
      await Promise.all([...queries.map((query) => query()), customOnRefresh?.()].filter(Boolean))
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setRefreshing(false)
    }
  }, [queries, customOnRefresh])

  return {
    refreshing,
    onRefresh,
  }
}

// Simplified version for single query
export const useRefreshableState = (refetchFn: RefetchFunction) => {
  return useRefreshableQuery({ queries: [refetchFn] })
}

export default useRefreshableQuery
