import { useCallback, useEffect, useRef, useState } from 'react'

import { computeDashboardMetrics } from '../analytics/computeMetrics.js'
import { fetchDashboardDataset } from '../../services/dashboardRepo.js'

const CACHE_TTL_MS = 60_000

/** @type {{ data: ReturnType<typeof computeDashboardMetrics> | null, raw: object | null, fetchedAt: number } | null} */
let memoryCache = null

/**
 * @param {{ autoRefresh?: boolean, refreshIntervalMs?: number }} [options]
 */
export function useDashboardData(options = {}) {
  const { autoRefresh = true, refreshIntervalMs = 5 * 60 * 1000 } = options
  const [loading, setLoading] = useState(!memoryCache)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState(memoryCache?.data ?? null)
  const [raw, setRaw] = useState(memoryCache?.raw ?? null)
  const [fetchedAt, setFetchedAt] = useState(memoryCache?.fetchedAt ?? null)
  const mountedRef = useRef(true)

  const load = useCallback(async (isManual = false) => {
    if (
      !isManual &&
      memoryCache &&
      Date.now() - memoryCache.fetchedAt < CACHE_TTL_MS
    ) {
      setMetrics(memoryCache.data)
      setRaw(memoryCache.raw)
      setFetchedAt(memoryCache.fetchedAt)
      setLoading(false)
      return
    }

    if (isManual) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const dataset = await fetchDashboardDataset()
      const computed = computeDashboardMetrics(dataset)
      memoryCache = {
        data: computed,
        raw: dataset,
        fetchedAt: dataset.fetchedAt,
      }
      if (!mountedRef.current) return
      setMetrics(computed)
      setRaw(dataset)
      setFetchedAt(dataset.fetchedAt)
    } catch (err) {
      if (!mountedRef.current) return
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard data.',
      )
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    load()
    return () => {
      mountedRef.current = false
    }
  }, [load])

  useEffect(() => {
    if (!autoRefresh) return undefined
    const id = window.setInterval(() => load(true), refreshIntervalMs)
    return () => window.clearInterval(id)
  }, [autoRefresh, refreshIntervalMs, load])

  return {
    metrics,
    raw,
    loading,
    refreshing,
    error,
    fetchedAt,
    refresh: () => load(true),
  }
}
