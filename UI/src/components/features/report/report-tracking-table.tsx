"use client"

import { useState } from "react"
import {
  MagnifyingGlass,
  CaretDown,
  CalendarBlank,
  ArrowsClockwise,
  Phone,
  Bank,
  Globe,
  ChatCircle,
  FileCode,
  Paperclip,
} from "@phosphor-icons/react"
import {
  TrackingReportItem,
  ReportStatus,
  ReportStatusCounts,
  ScamCategoryItem,
} from "@/features/report/types/report.types"
import { cn } from "@/lib/utils"

interface ReportTrackingTableProps {
  items: TrackingReportItem[]
  statusCounts?: ReportStatusCounts
  categories?: ScamCategoryItem[]
  isLoading?: boolean
  search?: string
  onSearchChange?: (val: string) => void
  selectedStatus?: "ALL" | ReportStatus
  onStatusChange?: (status: "ALL" | ReportStatus) => void
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
  selectedDays?: string
  onDaysChange?: (days: string) => void
  currentPage?: number
  totalPages?: number
  totalItems?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onRefresh?: () => void
}

export function ReportTrackingTable({
  items,
  statusCounts,
  categories = [],
  isLoading = false,
  search: controlledSearch,
  onSearchChange,
  selectedStatus: controlledStatus,
  onStatusChange,
  selectedCategory: controlledCategory,
  onCategoryChange,
  selectedDays: controlledDays,
  onDaysChange,
  currentPage: controlledCurrentPage,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onRefresh,
}: ReportTrackingTableProps) {
  const [internalSearch, setInternalSearch] = useState("")
  const [internalStatus, setInternalStatus] = useState<"ALL" | ReportStatus>("ALL")
  const [internalCategory, setInternalCategory] = useState("all")
  const [internalDays, setInternalDays] = useState("30")
  const [internalPage, setInternalPage] = useState(1)

  const search = controlledSearch !== undefined ? controlledSearch : internalSearch
  const selectedStatus = controlledStatus !== undefined ? controlledStatus : internalStatus
  const selectedCategory = controlledCategory !== undefined ? controlledCategory : internalCategory
  const selectedDays = controlledDays !== undefined ? controlledDays : internalDays
  const currentPage = controlledCurrentPage !== undefined ? controlledCurrentPage : internalPage

  const handleSearchChange = (val: string) => {
    if (onSearchChange) onSearchChange(val)
    else setInternalSearch(val)
  }

  const handleStatusChange = (val: "ALL" | ReportStatus) => {
    if (onStatusChange) onStatusChange(val)
    else setInternalStatus(val)
  }

  const handleCategoryChange = (val: string) => {
    if (onCategoryChange) onCategoryChange(val)
    else setInternalCategory(val)
  }

  const handleDaysChange = (val: string) => {
    if (onDaysChange) onDaysChange(val)
    else setInternalDays(val)
  }

  const handlePageChange = (val: number) => {
    if (onPageChange) onPageChange(val)
    else setInternalPage(val)
  }

  const filterPills: {
    status: "ALL" | ReportStatus
    label: string
    count: number
    dotColor: string
  }[] = [
    {
      status: "ALL",
      label: "Tất cả",
      count: statusCounts?.all ?? totalItems ?? items.length,
      dotColor: "bg-white",
    },
    {
      status: "PENDING",
      label: "Đang chờ duyệt",
      count: statusCounts?.pending ?? 0,
      dotColor: "bg-[#F59E0B]",
    },
    {
      status: "APPROVED_BLACKLIST",
      label: "Đã vào Blacklist",
      count: statusCounts?.approvedBlacklist ?? 0,
      dotColor: "bg-[#10B981]",
    },
    {
      status: "MERGED_DUPLICATE",
      label: "Đã gộp trùng lặp",
      count: statusCounts?.mergedDuplicate ?? 0,
      dotColor: "bg-[#64748B]",
    },
    {
      status: "REJECTED",
      label: "Bị từ chối",
      count: statusCounts?.rejected ?? 0,
      dotColor: "bg-[#EF4444]",
    },
  ]

  const renderTargetIcon = (type: TrackingReportItem["targetType"]) => {
    const props = { size: 18, weight: "fill" as const }
    switch (type) {
      case "PHONE":
        return (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#E2E7FF] text-[#008CC7] dark:bg-muted dark:text-primary">
            <Phone {...props} />
          </div>
        )
      case "BANK":
        return (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#334155] dark:bg-slate-800 dark:text-slate-300">
            <Bank {...props} />
          </div>
        )
      case "WEBSITE":
        return (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
            <Globe {...props} />
          </div>
        )
      case "TELEGRAM":
        return (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            <ChatCircle {...props} />
          </div>
        )
      case "APK":
        return (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-[#BA1A1A] dark:bg-rose-950/60 dark:text-rose-300">
            <FileCode {...props} />
          </div>
        )
    }
  }

  const renderSlaBadge = (item: TrackingReportItem) => {
    switch (item.slaStatus) {
      case "completed":
        return (
          <span className="text-[11px] font-semibold text-[#00875A] dark:text-emerald-400">
            {item.slaTime}
          </span>
        )
      case "processing":
        return (
          <span className="text-[11px] font-semibold text-[#B45309] dark:text-amber-400">
            {item.slaTime}
          </span>
        )
      case "merged":
        return (
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            {item.slaTime}
          </span>
        )
      default:
        return (
          <span className="text-[11px] font-semibold text-[#45464D] dark:text-muted-foreground">
            {item.slaTime}
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar & Dropdown Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        {/* Search */}
        <div className="relative sm:col-span-6 lg:col-span-7">
          <MagnifyingGlass
            size={16}
            weight="bold"
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#45464D] dark:text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm theo mã #RPT, Số điện thoại, STK ngân hàng, Tên miền..."
            className="w-full rounded-xl border border-[#C6C6CE]/50 bg-white py-2.5 pr-4 pl-9 text-xs text-[#131B2E] placeholder:text-muted-foreground/70 focus:ring-1 focus:ring-[#008CC7] focus:outline-hidden dark:border-border dark:bg-card dark:text-foreground"
          />
        </div>

        {/* Category select */}
        <div className="lg:col-span-2.5 relative sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#C6C6CE]/50 bg-white py-2.5 pr-8 pl-3.5 text-xs font-semibold text-[#131B2E] focus:ring-1 focus:ring-[#008CC7] focus:outline-hidden dark:border-border dark:bg-card dark:text-foreground"
          >
            <option value="all">Tất cả danh mục thủ đoạn</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
          <CaretDown
            size={13}
            weight="bold"
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#45464D] dark:text-muted-foreground"
          />
        </div>

        {/* Time select */}
        <div className="lg:col-span-2.5 relative sm:col-span-3">
          <select
            value={selectedDays}
            onChange={(e) => handleDaysChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#C6C6CE]/50 bg-white py-2.5 pr-8 pl-3.5 text-xs font-semibold text-[#131B2E] focus:ring-1 focus:ring-[#008CC7] focus:outline-hidden dark:border-border dark:bg-card dark:text-foreground"
          >
            <option value="30">30 ngày qua</option>
            <option value="7">7 ngày qua</option>
            <option value="90">90 ngày qua</option>
            <option value="all">Toàn bộ thời gian</option>
          </select>
          <CalendarBlank
            size={15}
            weight="bold"
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#45464D] dark:text-muted-foreground"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {filterPills.map((pill) => {
          const isActive = selectedStatus === pill.status
          return (
            <button
              key={pill.status}
              type="button"
              onClick={() => handleStatusChange(pill.status)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-all",
                isActive
                  ? "border-[#0B132B] bg-[#0B132B] text-white dark:bg-primary dark:text-primary-foreground"
                  : "border-[#C6C6CE]/50 bg-white text-[#131B2E] hover:bg-[#FAF8FF] dark:border-border dark:bg-card dark:text-foreground"
              )}
            >
              <span className={cn("size-2 rounded-full", pill.dotColor)} />
              <span>{pill.label}</span>
              <span
                className={cn(
                  "py-0.2 rounded-full px-1.5 text-[10px] font-bold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#F2F3FF] text-[#45464D] dark:bg-muted dark:text-muted-foreground"
                )}
              >
                {pill.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-[#C6C6CE]/40 bg-white shadow-xs dark:border-border dark:bg-card">
        {/* Table Title Bar */}
        <div className="flex items-center justify-between border-b border-[#C6C6CE]/30 px-5 py-3.5 dark:border-border">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-sm font-bold text-[#131B2E] dark:text-foreground">
              Bảng Quản Lý Tiến Trình Phê Duyệt
            </h3>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-[#45464D] hover:bg-[#F2F3FF] hover:text-[#131B2E] dark:text-muted-foreground dark:hover:bg-muted"
              aria-label="Làm mới"
            >
              <ArrowsClockwise
                size={16}
                weight="bold"
                className={cn(isLoading && "animate-spin")}
              />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#C6C6CE]/30 bg-[#FAF8FF] text-[11px] font-bold tracking-wider text-[#45464D] uppercase dark:border-border dark:bg-muted/30 dark:text-muted-foreground">
                <th className="px-5 py-3">Mã báo cáo</th>
                <th className="px-4 py-3">Mục tiêu nghi vấn</th>
                <th className="px-4 py-3">Thủ đoạn</th>
                <th className="px-4 py-3">Ngày gửi & Đối soát</th>
                <th className="px-5 py-3">Bằng chứng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C6C6CE]/30 dark:divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="size-6 animate-spin rounded-full border-2 border-[#008CC7] border-t-transparent dark:border-primary dark:border-t-transparent" />
                      <p className="text-xs font-medium text-[#45464D] dark:text-muted-foreground">
                        Đang tải dữ liệu tiến trình báo cáo...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-1.5 text-[#45464D] dark:text-muted-foreground">
                      <p className="text-xs font-semibold text-[#131B2E] dark:text-foreground">
                        Chưa có báo cáo nào phù hợp
                      </p>
                      <p className="text-[11px]">
                        Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để xem kết quả.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[#FAF8FF]/70 dark:hover:bg-muted/20"
                  >
                    {/* Mã báo cáo */}
                    <td className="px-5 py-4 align-top">
                      <p className="font-mono text-xs font-bold text-[#131B2E] dark:text-foreground">
                        {item.id}
                      </p>
                      <p className="font-mono text-[10px] text-[#45464D] dark:text-muted-foreground">
                        Hash: {item.hashId}
                      </p>
                    </td>

                    {/* Mục tiêu */}
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start gap-3">
                        {renderTargetIcon(item.targetType)}
                        <div className="space-y-0.5">
                          <p className="font-mono text-xs font-bold text-[#131B2E] dark:text-foreground">
                            {item.targetValue}
                          </p>
                          <p className="text-[11px] text-[#45464D] dark:text-muted-foreground">
                            {item.targetSub}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Thủ đoạn */}
                    <td className="px-4 py-4 align-top">
                      <span className="inline-block rounded-md bg-[#E2E7FF]/60 px-2.5 py-1 text-[11px] font-semibold text-[#131B2E] dark:bg-muted dark:text-foreground">
                        {item.category}
                      </span>
                    </td>

                    {/* Ngày gửi & Đối soát */}
                    <td className="px-4 py-4 align-top">
                      <p className="text-xs font-medium text-[#131B2E] dark:text-foreground">
                        {item.submittedDate}
                      </p>
                      {renderSlaBadge(item)}
                    </td>

                    {/* Bằng chứng */}
                    <td className="px-5 py-4 align-top">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C6C6CE]/50 bg-[#FAF8FF] px-2.5 py-1 text-[11px] font-semibold text-[#131B2E] dark:border-border dark:bg-muted dark:text-foreground">
                        <Paperclip size={12} weight="bold" />
                        <span>{item.evidenceBadge}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#C6C6CE]/30 px-5 py-3 dark:border-border">
          <p className="text-[11px] text-[#45464D] dark:text-muted-foreground">
            {totalItems > 0
              ? `Hiển thị ${(currentPage - 1) * pageSize + 1} - ${Math.min(
                  currentPage * pageSize,
                  totalItems
                )} trên tổng số ${totalItems} báo cáo`
              : "Hiển thị 0 báo cáo"}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="rounded-lg border border-[#C6C6CE]/50 bg-white px-2.5 py-1 text-xs font-semibold text-[#45464D] hover:bg-[#FAF8FF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-border dark:bg-card dark:text-muted-foreground"
            >
              Trang trước
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
              const p = idx + 1
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  disabled={isLoading}
                  className={cn(
                    "flex size-7 cursor-pointer items-center justify-center rounded-lg text-xs font-bold shadow-2xs transition-all",
                    currentPage === p
                      ? "bg-[#0B132B] text-white dark:bg-primary dark:text-primary-foreground"
                      : "border border-[#C6C6CE]/50 bg-white text-[#131B2E] hover:bg-[#FAF8FF] dark:border-border dark:bg-card dark:text-foreground"
                  )}
                >
                  {p}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="rounded-lg border border-[#C6C6CE]/50 bg-white px-2.5 py-1 text-xs font-semibold text-[#45464D] hover:bg-[#FAF8FF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-border dark:bg-card dark:text-muted-foreground"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

