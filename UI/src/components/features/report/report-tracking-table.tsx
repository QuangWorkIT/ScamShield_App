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
} from "@/features/report/types/report.types"
import { cn } from "@/lib/utils"

interface ReportTrackingTableProps {
  items: TrackingReportItem[]
}

export function ReportTrackingTable({ items }: ReportTrackingTableProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | ReportStatus>(
    "ALL"
  )
  const [currentPage, setCurrentPage] = useState(1)

  const filterPills: {
    status: "ALL" | ReportStatus
    label: string
    count: number
    dotColor: string
  }[] = [
    { status: "ALL", label: "Tất cả", count: 18, dotColor: "bg-white" },
    {
      status: "PENDING",
      label: "Đang chờ duyệt",
      count: 3,
      dotColor: "bg-[#F59E0B]",
    },
    {
      status: "APPROVED_BLACKLIST",
      label: "Đã vào Blacklist",
      count: 14,
      dotColor: "bg-[#10B981]",
    },
    {
      status: "MERGED_DUPLICATE",
      label: "Đã gộp trùng lặp",
      count: 1,
      dotColor: "bg-[#64748B]",
    },
    {
      status: "REJECTED",
      label: "Bị từ chối",
      count: 0,
      dotColor: "bg-[#EF4444]",
    },
  ]

  const filteredItems = items.filter((item) => {
    if (selectedStatus !== "ALL" && item.status !== selectedStatus) {
      return false
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchId = item.id.toLowerCase().includes(q)
      const matchTarget = item.targetValue.toLowerCase().includes(q)
      const matchCat = item.category.toLowerCase().includes(q)
      if (!matchId && !matchTarget && !matchCat) return false
    }
    return true
  })

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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã #RPT, Số điện thoại, STK ngân hàng, Tên miền..."
            className="w-full rounded-xl border border-[#C6C6CE]/50 bg-white py-2.5 pr-4 pl-9 text-xs text-[#131B2E] placeholder:text-muted-foreground/70 focus:ring-1 focus:ring-[#008CC7] focus:outline-hidden dark:border-border dark:bg-card dark:text-foreground"
          />
        </div>

        {/* Category select */}
        <div className="lg:col-span-2.5 relative sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#C6C6CE]/50 bg-white py-2.5 pr-8 pl-3.5 text-xs font-semibold text-[#131B2E] focus:ring-1 focus:ring-[#008CC7] focus:outline-hidden dark:border-border dark:bg-card dark:text-foreground"
          >
            <option value="all">Tất cả danh mục thủ đoạn</option>
            <option value="impersonation">Mạo danh cán bộ thuế/A05</option>
            <option value="recruitment">Tuyển CTV lừa nạp tiền</option>
            <option value="phishing">Website Phishing</option>
            <option value="forex">Đầu tư Forex/Crypto</option>
            <option value="malware">Mã độc App VNeID</option>
          </select>
          <CaretDown
            size={13}
            weight="bold"
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#45464D] dark:text-muted-foreground"
          />
        </div>

        {/* Time select */}
        <div className="lg:col-span-2.5 relative sm:col-span-3">
          <div className="flex w-full items-center justify-between rounded-xl border border-[#C6C6CE]/50 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#131B2E] dark:border-border dark:bg-card dark:text-foreground">
            <span>30 ngày qua</span>
            <CalendarBlank
              size={15}
              weight="bold"
              className="text-[#45464D] dark:text-muted-foreground"
            />
          </div>
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
              onClick={() => setSelectedStatus(pill.status)}
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
          <button
            type="button"
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-[#45464D] hover:bg-[#F2F3FF] hover:text-[#131B2E] dark:text-muted-foreground dark:hover:bg-muted"
            aria-label="Làm mới"
          >
            <ArrowsClockwise size={16} weight="bold" />
          </button>
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
              {filteredItems.map((item) => (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#C6C6CE]/30 px-5 py-3 dark:border-border">
          <p className="text-[11px] text-[#45464D] dark:text-muted-foreground">
            Hiển thị 1 - 5 trên tổng số 18 báo cáo
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-[#C6C6CE]/50 bg-white px-2.5 py-1 text-xs font-semibold text-[#45464D] hover:bg-[#FAF8FF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-border dark:bg-card dark:text-muted-foreground"
            >
              Trang trước
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "flex size-7 cursor-pointer items-center justify-center rounded-lg text-xs font-bold shadow-2xs transition-all",
                  currentPage === page
                    ? "bg-[#0B132B] text-white dark:bg-primary dark:text-primary-foreground"
                    : "border border-[#C6C6CE]/50 bg-white text-[#131B2E] hover:bg-[#FAF8FF] dark:border-border dark:bg-card dark:text-foreground"
                )}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              disabled={currentPage === 3}
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
