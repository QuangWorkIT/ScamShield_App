"use client"

import { MagnifyingGlass, Clock, Paperclip, Lock } from "@phosphor-icons/react"
import { QueueFilterTab } from "@/features/moderator/types/moderator.types"

interface ReportQueueFiltersProps {
  currentTab: QueueFilterTab
  onTabChange: (tab: QueueFilterTab) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  counts: {
    all: number
    pending: number
    inReview: number
    locked: number
  }
}

export function ReportQueueFilters({
  currentTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  counts,
}: ReportQueueFiltersProps) {
  return (
    <div className="space-y-3.5 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {/* Title & Live indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Hàng đợi xét duyệt
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {counts.pending} vụ đang chờ • {counts.locked} đã khóa
      </p>

      {/* Filter Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Clock size={14} className="text-rose-500" />
          <span>Thời gian</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Paperclip size={14} className="text-slate-400" />
          <span>Bằng chứng</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlass
          size={15}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo ID, đối tượng..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pr-3 pl-8 text-xs font-medium text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-400 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-slate-700 dark:focus:bg-slate-800"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 pb-1 text-xs font-medium no-scrollbar">
        <button
          type="button"
          onClick={() => onTabChange("ALL")}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
            currentTab === "ALL"
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          }`}
        >
          <span>Tất cả</span>
          <span className="rounded-full px-1 text-[11px] opacity-80">{counts.all}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("PENDING")}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
            currentTab === "PENDING"
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          }`}
        >
          <span>Pending</span>
          <span className="rounded-full px-1 text-[11px] opacity-80">{counts.pending}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("IN_REVIEW")}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
            currentTab === "IN_REVIEW"
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          }`}
        >
          <span>In Review</span>
          <span className="rounded-full px-1 text-[11px] opacity-80">{counts.inReview}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("LOCKED")}
          className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
            currentTab === "LOCKED"
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          }`}
        >
          <Lock size={12} weight="bold" />
          <span>Đã khóa</span>
          <span className="rounded-full px-1 text-[11px] opacity-80">{counts.locked}</span>
        </button>
      </div>
    </div>
  )
}
