"use client"

import { useCallback, useEffect, useState } from "react"
import { educationService } from "../services/education.service"
import type { EducationHub } from "../types/education.types"

export function useEducationHub() {
  const [categoryCode, setCategoryCode] = useState<string | undefined>()
  const [hub, setHub] = useState<EducationHub | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    educationService
      .getHub(categoryCode)
      .then((data) => {
        if (!cancelled) setHub(data)
      })
      .catch(() => {
        if (!cancelled)
          setError("Không thể tải nội dung giáo dục. Vui lòng thử lại.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [categoryCode, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { hub, loading, error, categoryCode, setCategoryCode, reload }
}
