"use client"

import { useState } from "react"
import Link from "next/link"
import {
  MagnifyingGlass,
  Funnel,
  Paperclip,
  CheckCircle,
  ArrowsClockwise,
  GitMerge,
  XCircle,
  Eye,
  Phone,
  Globe,
  Bank,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react"
import { RecentReportItem } from "@/features/report/types/report.types"

interface RecentReportsTableProps {
  items: RecentReportItem[]
}

export function RecentReportsTable({ items }: RecentReportsTableProps) {
  const [search, setSearch] = useState("")

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      item.id.toLowerCase().includes(q) ||
      item.targetValue.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    )
  })

  const renderStatus = (item: RecentReportItem) => {
    switch (item.status) {
      case "APPROVED_BLACKLIST":
        return (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#00875A] dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle size={14} weight="fill" />
            <span>Đã phê duyệt & Đưa vào Blacklist</span>
          </div>
        )
      case "PENDING":
        return (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-[#B45309] dark:bg-amber-950/40 dark:text-amber-300">
            <ArrowsClockwise size={14} weight="bold" className="animate-spin" />
            <span>Đang chờ duyệt (Ứng viên)</span>
          </div>
        )
      case "MERGED_DUPLICATE":
        return (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            <GitMerge size={14} weight="bold" />
            <span>Đã gộp trùng lặp ({item.duplicateRef})</span>
          </div>
        )
      case "REJECTED":
        return (
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#BA1A1A] dark:text-rose-400">
              <XCircle size={14} weight="fill" />
              <span>Từ chối duyệt</span>
            </div>
            {item.rejectionReason && (
              <p className="text-[10px] text-[#45464D] dark:text-muted-foreground">
                Lý do: {item.rejectionReason}
              </p>
            )}
          </div>
        )
    }
  }

  const renderTargetIcon = (type: RecentReportItem["targetType"]) => {
    switch (type) {
      case "PHONE":
        return (
          <Phone
            size={14}
            weight="bold"
            className="text-[#45464D] dark:text-muted-foreground"
          />
        )
      case "WEBSITE":
        return (
          <Globe
            size={14}
            weight="bold"
            className="text-[#45464D] dark:text-muted-foreground"
          />
        )
      case "BANK_ACCOUNT":
        return (
          <Bank
            size={14}
            weight="bold"
            className="text-[#45464D] dark:text-muted-foreground"
          />
        )
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#C6C6CE]/40 bg-white p-6 shadow-xs dark:border-border dark:bg-card">
      {/* Top Header & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-sm font-bold text-[#131B2E] dark:text-foreground">
            Các báo cáo gần đây của bạn
          </h2>
          <p className="text-[11px] text-[#45464D] dark:text-muted-foreground">
            Theo dõi tiến trình thẩm định từ Trung tâm Giám sát Không gian mạng
            Quốc gia
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <MagnifyingGlass
              size={15}
              weight="bold"
              className="absolute top-1/2 left-3 -translate-y-1/2 text-[#45464D] dark:text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã hoặc số..."
              className="w-48 rounded-xl border border-[#C6C6CE]/50 bg-[#FAF8FF] py-1.5 pr-3 pl-8 text-xs text-[#131B2E] focus:ring-1 focus:ring-[#008CC7] focus:outline-hidden sm:w-56 dark:border-border dark:bg-muted/30 dark:text-foreground"
            />
          </div>

          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#C6C6CE]/60 bg-white px-3 py-1.5 text-xs font-semibold text-[#131B2E] shadow-2xs hover:bg-[#FAF8FF] dark:border-border dark:bg-card dark:text-foreground"
          >
            <Funnel size={14} weight="bold" />
            <span>Bộ lọc</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#C6C6CE]/30 text-[11px] font-bold tracking-wider text-[#45464D] uppercase dark:border-border dark:text-muted-foreground">
              <th className="py-3 pr-3">Mã báo cáo</th>
              <th className="px-3 py-3">Chỉ số mục tiêu</th>
              <th className="px-3 py-3">Danh mục</th>
              <th className="px-3 py-3">Ngày gửi</th>
              <th className="px-3 py-3">Bằng chứng</th>
              <th className="px-3 py-3">Trạng thái kiểm duyệt</th>
              <th className="px-3 py-3">Điểm thưởng</th>
              <th className="py-3 pl-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C6C6CE]/30 dark:divide-border">
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-[#FAF8FF]/70 dark:hover:bg-muted/20"
              >
                {/* ID */}
                <td className="py-3.5 pr-3 font-mono font-bold text-[#131B2E] dark:text-foreground">
                  {item.id}
                </td>

                {/* Target */}
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    {renderTargetIcon(item.targetType)}
                    <span className="font-mono font-semibold text-[#131B2E] dark:text-foreground">
                      {item.targetValue}
                    </span>
                  </div>
                </td>

                {/* Category */}
                <td className="px-3 py-3.5">
                  <span className="inline-block rounded-md bg-[#FAF8FF] px-2 py-0.5 text-[11px] font-semibold text-[#131B2E] dark:bg-muted dark:text-foreground">
                    {item.category}
                  </span>
                </td>

                {/* Date */}
                <td className="px-3 py-3.5 text-[#45464D] dark:text-muted-foreground">
                  {item.submittedDate}
                </td>

                {/* Evidence */}
                <td className="px-3 py-3.5">
                  <div className="inline-flex items-center gap-1 rounded-full bg-[#E2E7FF]/60 px-2 py-0.5 text-[11px] font-semibold text-[#131B2E] dark:bg-muted dark:text-foreground">
                    <Paperclip size={12} weight="bold" />
                    <span>{item.evidenceCount} tệp</span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-3 py-3.5">{renderStatus(item)}</td>

                {/* Reward Points */}
                <td className="px-3 py-3.5">
                  {item.rewardPoints > 0 ? (
                    <span className="font-bold text-[#00875A] dark:text-emerald-400">
                      +{item.rewardPoints} điểm
                    </span>
                  ) : item.status === "PENDING" ? (
                    <span className="text-[11px] font-medium text-[#45464D] dark:text-muted-foreground">
                      Đang giữ
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-[#45464D] dark:text-muted-foreground">
                      0 điểm
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 pl-3 text-center">
                  <Link
                    href={`/user/reports/${item.id.replace("#", "")}`}
                    className="inline-flex size-7 items-center justify-center rounded-lg text-[#45464D] hover:bg-[#F2F3FF] hover:text-[#131B2E] dark:text-muted-foreground dark:hover:bg-muted"
                  >
                    <Eye size={16} weight="bold" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#C6C6CE]/30 pt-3 dark:border-border">
        <p className="text-[11px] text-[#45464D] dark:text-muted-foreground">
          Hiển thị 4 trong tổng số 12 báo cáo đã gửi
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-[#C6C6CE]/50 bg-white text-[#45464D] shadow-2xs hover:bg-[#FAF8FF] dark:border-border dark:bg-card dark:text-muted-foreground"
          >
            <CaretLeft size={12} weight="bold" />
          </button>
          <button
            type="button"
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg bg-[#0B132B] text-xs font-bold text-white dark:bg-primary dark:text-primary-foreground"
          >
            1
          </button>
          <button
            type="button"
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-[#C6C6CE]/50 bg-white text-xs font-semibold text-[#131B2E] hover:bg-[#FAF8FF] dark:border-border dark:bg-card dark:text-foreground"
          >
            2
          </button>
          <button
            type="button"
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-[#C6C6CE]/50 bg-white text-xs font-semibold text-[#131B2E] hover:bg-[#FAF8FF] dark:border-border dark:bg-card dark:text-foreground"
          >
            3
          </button>
          <button
            type="button"
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-[#C6C6CE]/50 bg-white text-[#45464D] shadow-2xs hover:bg-[#FAF8FF] dark:border-border dark:bg-card dark:text-muted-foreground"
          >
            <CaretRight size={12} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}
