"use client"

import { useState, useMemo } from "react"
import { HistoryFilterBar } from "@/components/features/history/history-filter-bar"
import { HistoryRiskPills } from "@/components/features/history/history-risk-pills"
import { HistoryDataTable } from "@/components/features/history/history-data-table"
import { HistoryPagination } from "@/components/features/history/history-pagination"
import { MOCK_HISTORY_ITEMS } from "@/features/history/services/history.service"
import { HistoryRiskStatus } from "@/features/history/types/history.types"

export default function UserHistoryPage() {
  const [items, setItems] = useState(MOCK_HISTORY_ITEMS)
  const [searchQuery, setSearchQuery] = useState("")
  const [timeRange, setTimeRange] = useState("30_days")
  const [scamType, setScamType] = useState("all")
  const [riskStatus, setRiskStatus] = useState<"ALL" | HistoryRiskStatus>("ALL")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  // Filter items based on user criteria
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Risk status filter
      if (riskStatus !== "ALL" && item.verdictStatus !== riskStatus) {
        return false
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTarget = item.targetValue.toLowerCase().includes(query)
        const matchSnippet = item.snippet.toLowerCase().includes(query)
        const matchCategory = item.category.toLowerCase().includes(query)
        if (!matchTarget && !matchSnippet && !matchCategory) {
          return false
        }
      }

      return true
    })
  }, [items, riskStatus, searchQuery])

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredItems.map((item) => item.id))
    }
  }

  const handleDeleteSelected = () => {
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
    setSelectedIds([])
  }

  return (
    <div className="space-y-6">
      {/* Search & Top Action Filters */}
      <HistoryFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        scamType={scamType}
        onScamTypeChange={setScamType}
        selectedCount={selectedIds.length}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* Risk Filter Pills */}
      <HistoryRiskPills
        currentStatus={riskStatus}
        onSelectStatus={setRiskStatus}
      />

      {/* Data Table */}
      <HistoryDataTable
        items={filteredItems}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
      />

      {/* Pagination Controls */}
      <HistoryPagination
        currentPage={currentPage}
        totalPages={4}
        totalItems={38}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
