"use client"

import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface HistoryPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function HistoryPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: HistoryPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
      {/* Current Range Label */}
      <p className="text-xs text-[#45464D] dark:text-muted-foreground">
        Hiển thị{" "}
        <span className="font-bold text-[#131B2E] dark:text-foreground">
          1 - 7
        </span>{" "}
        /{" "}
        <span className="font-bold text-[#131B2E] dark:text-foreground">
          {totalItems}
        </span>{" "}
        truy vấn trong Tháng 5/2025
      </p>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-[#C6C6CE]/50 bg-white text-[#45464D] shadow-2xs hover:bg-[#FAF8FF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-border dark:bg-card dark:text-muted-foreground"
          aria-label="Trang trước"
        >
          <CaretLeft size={14} weight="bold" />
        </button>

        {pages.map((p) => {
          const isActive = p === currentPage
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                "flex size-8 cursor-pointer items-center justify-center rounded-lg text-xs font-bold shadow-2xs transition-all",
                isActive
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
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-[#C6C6CE]/50 bg-white text-[#45464D] shadow-2xs hover:bg-[#FAF8FF] disabled:cursor-not-allowed disabled:opacity-40 dark:border-border dark:bg-card dark:text-muted-foreground"
          aria-label="Trang sau"
        >
          <CaretRight size={14} weight="bold" />
        </button>
      </div>
    </div>
  )
}
