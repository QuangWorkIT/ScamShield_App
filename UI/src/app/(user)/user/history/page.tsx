"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "react-toastify"
import { HistoryFilterBar } from "@/components/features/history/history-filter-bar"
import { HistoryRiskPills } from "@/components/features/history/history-risk-pills"
import { HistoryDataTable } from "@/components/features/history/history-data-table"
import { HistoryPagination } from "@/components/features/history/history-pagination"
import {
  getScamCheckHistory,
  deleteHistoryItems,
} from "@/features/history/services/history.service"
import {
  HistoryItem,
  HistoryRiskStatus,
  ScamCheckRiskCounts,
} from "@/features/history/types/history.types"

export default function UserHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [riskCounts, setRiskCounts] = useState<ScamCheckRiskCounts | null>(null)
  const [periodLabel, setPeriodLabel] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [timeRange, setTimeRange] = useState("30_days")
  const [scamType, setScamType] = useState("all")
  const [riskStatus, setRiskStatus] = useState<"ALL" | HistoryRiskStatus>("ALL")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Track initial load to prevent empty flicker
  const hasLoadedRef = useRef(false)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch history data from backend API
  const fetchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getScamCheckHistory({
        search: debouncedSearch,
        timeRange,
        scamType,
        riskStatus,
        page: currentPage - 1,
        size: 10,
      })

      const paginatedItems = response.items?.data || []
      setItems(paginatedItems)
      setTotalPages(response.items?.totalPages || 1)
      setTotalItems(response.items?.totalItems || 0)
      setRiskCounts(response.riskCounts)
      if (response.periodLabel) {
        setPeriodLabel(response.periodLabel)
      }
      hasLoadedRef.current = true
    } catch (error) {
      console.error("Error fetching check history:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải lịch sử kiểm tra"
      )
      if (!hasLoadedRef.current) {
        setItems([])
        setTotalPages(1)
        setTotalItems(0)
        setRiskCounts(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, timeRange, scamType, riskStatus, currentPage])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Reset to page 1 on filter changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    setCurrentPage(1)
  }

  const handleScamTypeChange = (value: string) => {
    setScamType(value)
    setCurrentPage(1)
  }

  const handleRiskStatusChange = (status: "ALL" | HistoryRiskStatus) => {
    setRiskStatus(status)
    setCurrentPage(1)
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map((item) => item.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa ${selectedIds.length} bản ghi lịch sử kiểm tra đã chọn?`
    )
    if (!confirmDelete) return

    setIsDeleting(true)
    try {
      await deleteHistoryItems(selectedIds)
      toast.success(`Đã xóa ${selectedIds.length} mục lịch sử thành công`)
      setSelectedIds([])
      // Refetch page
      await fetchHistory()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Xóa lịch sử thất bại"
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Top Action Filters */}
      <HistoryFilterBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        scamType={scamType}
        onScamTypeChange={handleScamTypeChange}
        selectedCount={selectedIds.length}
        onDeleteSelected={handleDeleteSelected}
        isDeleting={isDeleting}
      />

      {/* Risk Filter Pills */}
      <HistoryRiskPills
        currentStatus={riskStatus}
        onSelectStatus={handleRiskStatusChange}
        counts={riskCounts}
      />

      {/* Data Table */}
      <HistoryDataTable
        items={items}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        isLoading={isLoading}
      />

      {/* Pagination Controls */}
      <HistoryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={10}
        periodLabel={periodLabel}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
