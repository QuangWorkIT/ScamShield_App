"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "react-toastify"
import {
  ModeratorReportItem,
  QueueFilterTab,
  ModerationDecisionPayload,
} from "@/features/moderator/types/moderator.types"
import {
  getModeratorReportQueue,
  submitModerationDecision,
} from "@/features/moderator/services/moderator-report.service"
import { ReportQueueFilters } from "@/components/features/moderator/report-queue-filters"
import { ReportQueueItemCard } from "@/components/features/moderator/report-queue-item-card"
import { ReportQueueDetailView } from "@/components/features/moderator/report-queue-detail-view"

export default function ModeratorReportsPage() {
  const [items, setItems] = useState<ModeratorReportItem[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [currentTab, setCurrentTab] = useState<QueueFilterTab>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadQueue() {
      setIsLoading(true)
      try {
        const data = await getModeratorReportQueue()
        setItems(data)
        if (data.length > 0) {
          setSelectedId(data[0].id)
        }
      } catch (err) {
        toast.error("Không thể tải danh sách hàng đợi báo cáo")
      } finally {
        setIsLoading(false)
      }
    }
    loadQueue()
  }, [])

  // Calculate filter counts
  const counts = useMemo(() => {
    return {
      all: items.length,
      pending: items.filter((i) => i.status === "Pending").length,
      inReview: items.filter((i) => i.status === "In Review").length,
      locked: items.filter((i) => i.isLocked || i.status === "Locked").length,
    }
  }, [items])

  // Filter items based on tab & search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (currentTab === "PENDING" && item.status !== "Pending") return false
      if (currentTab === "IN_REVIEW" && item.status !== "In Review") return false
      if (currentTab === "LOCKED" && !item.isLocked && item.status !== "Locked") return false

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchId = item.id.toLowerCase().includes(query)
        const matchTarget = item.targetIdentifier.toLowerCase().includes(query)
        const matchCategory = item.category.toLowerCase().includes(query)
        const matchReporter = item.reportedBy.toLowerCase().includes(query)
        return matchId || matchTarget || matchCategory || matchReporter
      }

      return true
    })
  }, [items, currentTab, searchQuery])

  // Active selected item
  const selectedItem = useMemo(() => {
    return items.find((i) => i.id === selectedId) || filteredItems[0] || null
  }, [items, selectedId, filteredItems])

  // Handle decision submit
  const handleDecisionSubmitted = async (payload: ModerationDecisionPayload) => {
    try {
      const res = await submitModerationDecision(payload)
      if (res.success) {
        toast.success(res.message)
        // Update local status
        setItems((prev) =>
          prev.map((i) => {
            if (i.id === payload.reportId) {
              return {
                ...i,
                status: payload.decision === "APPROVE" ? "Approved" : "Rejected",
                taxonomies: payload.selectedTaxonomies,
              }
            }
            return i
          })
        )
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi lưu quyết định kiểm duyệt!")
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 lg:flex-row">
      {/* Left Column: Queue List & Filters */}
      <aside className="flex w-full flex-col border-r border-slate-200 bg-white lg:w-96 lg:min-w-[380px] lg:max-w-[420px] dark:border-slate-800 dark:bg-slate-900">
        <ReportQueueFilters
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          counts={counts}
        />

        {/* Scrollable List Container */}
        <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              Không tìm thấy hồ sơ phù hợp
            </div>
          ) : (
            filteredItems.map((item) => (
              <ReportQueueItemCard
                key={item.id}
                item={item}
                isSelected={item.id === selectedItem?.id}
                onSelect={(selected) => setSelectedId(selected.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Right Column: Case Workspace Detail */}
      <section className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <ReportQueueDetailView
          item={selectedItem}
          onDecisionSubmitted={handleDecisionSubmitted}
        />
      </section>
    </div>
  )
}
