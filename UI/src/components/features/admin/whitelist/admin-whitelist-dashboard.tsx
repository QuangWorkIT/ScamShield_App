"use client"

import { useMemo, useState } from "react"
import {
  FileText,
  Globe,
  HourglassMedium,
  MagnifyingGlass,
  Phone,
  X,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  DEMO_WHITELIST,
  type WhitelistItem,
  type WhitelistStatus,
} from "@/features/admin/data/demo-whitelist"
import { cn } from "@/lib/utils"
import { WhitelistReviewDialog } from "./whitelist-review-dialog"
import { WhitelistStatusBadge } from "./whitelist-status-badge"

type FilterOption = "all" | WhitelistStatus

const FILTER_TABS: { key: FilterOption; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "suspended", label: "Suspended" },
]

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
}

export function AdminWhitelistDashboard() {
  const [items, setItems] = useState<WhitelistItem[]>(DEMO_WHITELIST)
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all")
  const [search, setSearch] = useState("")

  const pendingCount = useMemo(
    () => items.filter((item) => item.status === "pending").length,
    [items]
  )

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "active" as const } : item
      )
    )
  }

  const handleReject = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "suspended" as const } : item
      )
    )
  }

  const filteredItems = useMemo(() => {
    const query = normalizeSearch(search)

    return items.filter((item) => {
      const matchesFilter =
        activeFilter === "all" ? true : item.status === activeFilter

      if (!matchesFilter) return false

      if (!query) return true

      const searchTarget = normalizeSearch(
        `${item.value} ${item.organization} ${item.type} ${item.requestedBy?.name ?? ""} ${item.requestedBy?.organization ?? ""}`
      )
      return searchTarget.includes(query)
    })
  }, [items, activeFilter, search])

  return (
    <section
      aria-labelledby="whitelist-heading"
      className="mx-auto max-w-screen-2xl space-y-6"
    >
      {/* Top Header & Search / Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1
            id="whitelist-heading"
            className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            Whitelist Chính thức
          </h1>
          {pendingCount > 0 && (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#D97706] dark:text-amber-400">
              <HourglassMedium size={14} weight="fill" aria-hidden="true" />
              {pendingCount} yêu cầu đang chờ phê duyệt
            </p>
          )}
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative w-full sm:w-56">
            <MagnifyingGlass
              size={15}
              className="pointer-events-none absolute top-3 left-3 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="admin-whitelist-search" className="sr-only">
              Tìm domain, hotline
            </label>
            <input
              id="admin-whitelist-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm domain, hotline..."
              className="h-9 w-full rounded-lg border border-input bg-card pr-8 pl-9 text-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Xóa tìm kiếm"
                onClick={() => setSearch("")}
                className="absolute top-1 right-1 size-7"
              >
                <X size={12} />
              </Button>
            )}
          </div>

          {/* Filter Pills */}
          <div
            role="tablist"
            aria-label="Lọc theo trạng thái whitelist"
            className="flex flex-wrap items-center gap-1.5"
          >
            {FILTER_TABS.map((tab) => {
              const isSelected = activeFilter === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveFilter(tab.key)}
                  className={cn(
                    "rounded-full px-3.5 py-1 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    isSelected
                      ? "bg-[#0B132B] text-white shadow-xs dark:bg-primary dark:text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {tab.label}
                  {tab.key === "pending" && pendingCount > 0 && (
                    <span className="ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Whitelist Cards List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-14 text-center">
            <Globe size={40} className="text-muted-foreground/50" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Không tìm thấy mục whitelist nào
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Thử thay đổi từ khóa tìm kiếm hoặc chuyển sang bộ lọc khác.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isPending = item.status === "pending"

            return (
              <article
                key={item.id}
                className={cn(
                  "relative rounded-xl bg-card p-4 transition-shadow hover:shadow-xs",
                  isPending
                    ? "border border-[#FDE68A] shadow-xs dark:border-amber-700/60"
                    : "border border-border"
                )}
              >
                {/* Main Row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Icon & Identifier info */}
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground",
                        item.type === "hotline"
                          ? "bg-[#EEF2FF] text-[#0F172A] dark:bg-blue-950/50 dark:text-blue-300"
                          : "bg-[#EFF6FF] text-[#0F172A] dark:bg-sky-950/50 dark:text-sky-300"
                      )}
                    >
                      {item.type === "hotline" ? (
                        <Phone size={18} weight="duotone" />
                      ) : (
                        <Globe size={18} weight="duotone" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-mono text-sm font-bold tracking-tight text-foreground sm:text-base">
                        {item.value}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <span>
                          {item.type === "hotline" ? "Hotline" : "Domain"}
                        </span>
                        <span>·</span>
                        <span className="font-medium text-foreground/90">
                          {item.organization}
                        </span>
                        <span>·</span>
                        <span>Thêm {item.addedAt}</span>
                      </div>
                      {item.requestedBy && (
                        <div className="mt-0.5 text-xs font-semibold text-[#D97706] dark:text-amber-400">
                          Yêu cầu: {item.requestedBy.organization} (
                          {item.requestedBy.name})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status badge & Review action */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <WhitelistStatusBadge status={item.status} />

                    {isPending && (
                      <WhitelistReviewDialog
                        item={item}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    )}
                  </div>
                </div>

                {/* Evidence Section for Pending Items */}
                {isPending && item.evidences && item.evidences.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-[#FEF3C7] pt-3 text-xs dark:border-amber-950/60">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Bằng chứng:
                    </span>
                    {item.evidences.map((evidence, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded border border-border bg-[#F8FAFC] px-2 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <FileText
                          size={13}
                          className="text-muted-foreground"
                          aria-hidden="true"
                        />
                        {evidence.name}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
