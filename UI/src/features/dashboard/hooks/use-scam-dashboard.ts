"use client"

import { useCallback, useEffect, useState } from "react"
import { dashboardService } from "../services/dashboard.service"
import type {
  ScamDashboardFilterParams,
  ScamDashboardFilters,
  ScamDashboardSummary,
} from "../types/dashboard.types"

const ERROR_MESSAGE = "Không thể tải dữ liệu dashboard. Vui lòng thử lại."

export function useScamDashboard() {
  const [filterOptions, setFilterOptions] =
    useState<ScamDashboardFilters | null>(null)
  const [params, setParams] = useState<ScamDashboardFilterParams>({})
  const [summary, setSummary] = useState<ScamDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    dashboardService
      .getFilters()
      .then((data) => {
        if (cancelled) return
        setFilterOptions(data)
        setParams((prev) => ({ period: data.defaultPeriod, ...prev }))
      })
      .catch(() => {
        if (cancelled) return
        // Filters are optional for rendering; summary falls back to defaults.
        setParams((prev) => ({ period: "LAST_30_DAYS", ...prev }))
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!params.period) return
    let cancelled = false
    setLoading(true)
    setError(null)
    dashboardService
      .getSummary(params)
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch(() => {
        if (!cancelled) setError(ERROR_MESSAGE)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [params, reloadKey])

  const updateParams = useCallback(
    (patch: Partial<ScamDashboardFilterParams>) =>
      setParams((prev) => ({ ...prev, ...patch })),
    []
  )

  const selectPeriod = useCallback(
    (period: ScamDashboardFilterParams["period"]) => {
      setParams((prev) => ({
        ...prev,
        period,
        year:
          period === "QUARTER" || period === "YEAR"
            ? filterOptions?.currentYear
            : undefined,
        quarter: period === "QUARTER" ? filterOptions?.currentQuarter : undefined,
      }))
    },
    [filterOptions]
  )

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return {
    filterOptions,
    params,
    summary,
    loading,
    error,
    updateParams,
    selectPeriod,
    reload,
  }
}
