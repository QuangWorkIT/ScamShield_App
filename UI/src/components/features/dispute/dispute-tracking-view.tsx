"use client"

import React, { useState, useEffect } from "react"
import {
  FileText,
  Clock,
  SealCheck,
  Phone,
  Bank,
  Globe,
  Tag,
  Info,
  CheckCircle,
  WarningCircle,
  XCircle,
  DownloadSimple,
  ArrowClockwise,
  Plus,
  FilePdf,
  FileImage,
  Calendar,
  LockKey,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import {
  DisputeListItem,
  DisputeSummary,
  DisputeStatus,
} from "@/features/dispute/types/dispute.types"
import {
  getMyDisputes,
  getMyDisputeSummary,
} from "@/features/dispute/services/dispute.service"
import { toast } from "react-toastify"

interface DisputeTrackingViewProps {
  onNavigateToSubmit?: () => void
}

type FilterOption = "ALL" | "IN_PROGRESS" | "APPROVED" | "NEEDS_INFO" | "REJECTED"

export function DisputeTrackingView({ onNavigateToSubmit }: DisputeTrackingViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("ALL")
  const [summary, setSummary] = useState<DisputeSummary | null>(null)
  const [disputes, setDisputes] = useState<DisputeListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    let isCancelled = false

    async function loadData() {
      try {
        let statusParams: DisputeStatus[] | undefined = undefined
        if (activeFilter === "IN_PROGRESS") {
          statusParams = ["PENDING", "IN_REVIEW", "NEEDS_MORE_INFO"]
        } else if (activeFilter === "APPROVED") {
          statusParams = ["APPROVED"]
        } else if (activeFilter === "NEEDS_INFO") {
          statusParams = ["NEEDS_MORE_INFO"]
        } else if (activeFilter === "REJECTED") {
          statusParams = ["REJECTED"]
        }

        const [summaryData, listData] = await Promise.all([
          getMyDisputeSummary(),
          getMyDisputes({ status: statusParams, page: 0, size: 50 }),
        ])

        if (!isCancelled) {
          setSummary(summaryData)
          setDisputes(listData.data || listData.content || [])
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error("Lỗi khi tải dữ liệu khiếu nại:", err)
          const message =
            err instanceof Error ? err.message : "Không thể tải dữ liệu khiếu nại."
          toast.error(message)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    void loadData()

    return () => {
      isCancelled = true
    }
  }, [activeFilter, reloadTrigger])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setReloadTrigger((prev) => prev + 1)
  }

  // Format date helper
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return ""
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  // Render icon based on indicator type
  const renderIndicatorIcon = (type?: string) => {
    switch (type) {
      case "PHONE":
        return <Phone weight="fill" />
      case "BANK_ACCOUNT":
        return <Bank weight="fill" />
      case "BRANDNAME":
        return <Tag weight="fill" />
      case "URL":
      case "WEBSITE":
      default:
        return <Globe weight="fill" />
    }
  }

  // Render status badge
  const renderStatusBadge = (status: DisputeStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            ĐÃ TIẾP NHẬN - CHỜ PHÂN CÔNG
          </div>
        )
      case "IN_REVIEW":
        return (
          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            ĐANG THỤ LÝ ĐỐI SOÁT
          </div>
        )
      case "NEEDS_MORE_INFO":
        return (
          <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
            <WarningCircle weight="bold" className="text-sm" />
            CẦN BỔ SUNG MINH CHỨNG
          </div>
        )
      case "APPROVED":
        return (
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle weight="fill" className="text-sm" />
            ĐÃ GỠ BLACKLIST
          </div>
        )
      case "REJECTED":
        return (
          <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-800">
            <XCircle weight="fill" className="text-sm" />
            TỪ CHỐI GIẢI TỎA
          </div>
        )
      case "DRAFT":
      default:
        return (
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-full">
            BẢN NHÁP
          </div>
        )
    }
  }

  // Legal relationship text
  const getLegalRelText = (rel?: string) => {
    switch (rel) {
      case "OWNER":
        return "Chủ sở hữu hợp pháp"
      case "LEGAL_REPRESENTATIVE":
        return "Đại diện theo pháp luật"
      case "AUTHORIZED_REPRESENTATIVE":
        return "Đại diện theo ủy quyền"
      default:
        return rel || "Chưa xác định"
    }
  }

  const totalCount = summary?.totalSubmitted ?? 0
  const inProgressCount =
    (summary?.pending ?? 0) + (summary?.inReview ?? 0) + (summary?.needsMoreInfo ?? 0)
  const approvedCount = summary?.approved ?? 0
  const rejectedCount = summary?.rejected ?? 0

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Submitted */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              HỒ SƠ ĐÃ NỘP
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <FileText weight="fill" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">
              {String(totalCount).padStart(2, "0")}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              đơn
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-2">
            {approvedCount} đã gỡ <span className="text-slate-300 dark:text-slate-600 mx-1">•</span>{" "}
            {inProgressCount} đang xử lý
          </p>
        </div>

        {/* Card 2: Average Resolution Time */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              THỜI GIAN TRUNG BÌNH
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Clock weight="fill" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">
              {summary?.averageResolutionHours != null
                ? summary.averageResolutionHours
                : "--"}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              giờ
            </span>
          </div>
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
            <Info weight="fill" /> Cam kết giải quyết ≤ 48 giờ
          </p>
        </div>

        {/* Card 3: Restoration Rate */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              TỶ LỆ KHÔI PHỤC
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <SealCheck weight="fill" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">
              {summary?.restorationRate != null ? `${summary.restorationRate}%` : "100%"}
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
              TRUSTSEAL
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2">
            Gỡ hoàn toàn khỏi Blacklist
          </p>
        </div>
      </div>

      {/* Filter Bar & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Nhật Ký & Tiến Trình Thẩm Định Hồ Sơ
          </h2>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {disputes.length} Hồ sơ
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            title="Làm mới dữ liệu"
          >
            <ArrowClockwise
              weight="bold"
              className={cn("text-sm", isRefreshing && "animate-spin")}
            />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-md text-[11px] font-bold transition-all",
              activeFilter === "ALL"
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Tất cả ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("IN_PROGRESS")}
            className={cn(
              "px-3 py-1.5 rounded-md text-[11px] font-bold transition-all",
              activeFilter === "IN_PROGRESS"
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Đang thụ lý ({inProgressCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("APPROVED")}
            className={cn(
              "px-3 py-1.5 rounded-md text-[11px] font-bold transition-all",
              activeFilter === "APPROVED"
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Đã gỡ ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("REJECTED")}
            className={cn(
              "px-3 py-1.5 rounded-md text-[11px] font-bold transition-all",
              activeFilter === "REJECTED"
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Từ chối ({rejectedCount})
          </button>
        </div>
      </div>

      {/* List Items */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <ArrowClockwise className="animate-spin text-3xl text-blue-500" />
          <p className="text-xs font-medium">Đang tải danh sách khiếu nại...</p>
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
            <FileText weight="duotone" className="text-3xl" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
            Chưa có hồ sơ khiếu nại nào
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
            Nếu số điện thoại, tài khoản hoặc website chính chủ của bạn bị gắn nhãn nhầm vào Blacklist, hãy gửi hồ sơ để được thẩm định giải tỏa.
          </p>
          {onNavigateToSubmit && (
            <button
              type="button"
              onClick={onNavigateToSubmit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              <Plus weight="bold" />
              <span>Nộp Đơn Khiếu Nại Ngay</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((item) => {
            const hasAttachments = item.attachments && item.attachments.length > 0
            const isApproved = item.status === "APPROVED"
            const isNeedsMoreInfo = item.status === "NEEDS_MORE_INFO"

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
              >
                <div className="p-5 md:p-6 pb-0">
                  {/* Top Bar: Code, Date, Priority, Badge */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        #{item.disputeCode || `DSP-${item.id}`}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mx-1 flex items-center gap-1">
                        • Nộp lúc {formatDate(item.createdAt)}
                      </span>
                      {item.priority === "HIGH" && (
                        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Độ ưu tiên cao (Doanh nghiệp)
                        </span>
                      )}
                    </div>
                    {renderStatusBadge(item.status)}
                  </div>

                  {/* Indicators Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    {/* Indicator Value */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                        {renderIndicatorIcon(item.indicator?.type)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                          CHỈ SỐ PHÚC KHẢO
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.indicator?.displayValue || "Chưa rõ"}
                        </div>
                      </div>
                    </div>

                    {/* Legal Relationship */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                        <LockKey weight="fill" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                          TƯ CÁCH KHAI BÁO
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {getLegalRelText(item.legalRelationship)}
                        </div>
                      </div>
                    </div>

                    {/* Attachments Summary */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                        <FileText weight="fill" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                          TÀI LIỆU ĐÍNH KÈM
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.evidenceCount || (item.attachments?.length ?? 0)} tệp minh chứng
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reason Quote */}
                  {item.reason && (
                    <div className="mb-4 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      <strong className="text-slate-700 dark:text-slate-300">Lý do khiếu nại: </strong>
                      {item.reason}
                    </div>
                  )}

                  {/* In-Review or General Progress Message */}
                  {item.progressMessage && (
                    <div className="bg-orange-50/60 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-lg p-4 flex gap-3 mb-5">
                      <Info weight="fill" className="text-orange-500 shrink-0 text-lg mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                          Tiến trình thẩm định của Hội đồng:
                        </h4>
                        <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                          {item.progressMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Needs More Info Box */}
                  {isNeedsMoreInfo && item.supplementReason && (
                    <div className="bg-purple-50/60 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-lg p-4 flex gap-3 mb-5">
                      <WarningCircle weight="fill" className="text-purple-600 shrink-0 text-lg mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                          Yêu cầu bổ sung tài liệu từ Kiểm duyệt viên:
                        </h4>
                        <p className="text-[13px] text-purple-800 dark:text-purple-300 font-medium leading-relaxed">
                          {item.supplementReason}
                        </p>
                        {item.supplementDeadline && (
                          <div className="text-xs font-bold text-red-600 dark:text-red-400 pt-1">
                            Hạn chót bổ sung: {formatDate(item.supplementDeadline)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Approved Resolution Box */}
                  {isApproved && (
                    <div className="bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-lg p-4 flex gap-3 mb-5">
                      <CheckCircle weight="fill" className="text-emerald-500 shrink-0 text-lg mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                          Kết luận thẩm định:
                        </h4>
                        <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                          {item.resolutionReason ||
                            "Hồ sơ khiếu nại đã được chấp thuận. Xác thực Blacklist trong hệ thống đã được thu hồi và khôi phục nhãn an toàn."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Attachments List */}
                  {hasAttachments && (
                    <div className="pb-4">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Tệp chứng cứ đính kèm ({item.attachments.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.attachments.map((att) => {
                          const isPdf = att.contentType === "application/pdf"
                          return (
                            <a
                              key={att.id}
                              href={att.fileUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              {isPdf ? (
                                <FilePdf weight="fill" className="text-red-500 text-base" />
                              ) : (
                                <FileImage weight="fill" className="text-blue-500 text-base" />
                              )}
                              <span className="max-w-[200px] truncate">
                                {att.fileName || `Tài liệu #${att.id}`}
                              </span>
                              <DownloadSimple weight="bold" className="text-slate-400 text-xs" />
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Footer Actions */}
                <div className="bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {item.estimatedResolutionAt ? (
                      <>
                        <Clock weight="bold" />
                        <span>Ước tính có kết quả trước: {formatDate(item.estimatedResolutionAt)}</span>
                      </>
                    ) : item.resolvedAt ? (
                      <>
                        <Calendar weight="bold" />
                        <span>Đã hoàn tất ngày: {formatDate(item.resolvedAt)}</span>
                      </>
                    ) : (
                      <>
                        <Clock weight="bold" />
                        <span>Cam kết thẩm định trong 48 giờ làm việc</span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {item.resolutionDocumentUrl && (
                      <a
                        href={item.resolutionDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                      >
                        <DownloadSimple weight="bold" /> Tải biên bản giải tỏa (.PDF)
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
