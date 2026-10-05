"use client"

import { useState } from "react"
import { ShieldPlus } from "@phosphor-icons/react"
import { ReportForm } from "@/components/features/report/report-form"
import { RecentReportsTable } from "@/components/features/report/recent-reports-table"
import {
  MOCK_RECENT_REPORTS,
  submitScamReport,
} from "@/features/report/services/report.service"
import {
  CreateReportPayload,
  RecentReportItem,
} from "@/features/report/types/report.types"

export default function UserReportsNewPage() {
  const [reports, setReports] =
    useState<RecentReportItem[]>(MOCK_RECENT_REPORTS)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (payload: CreateReportPayload) => {
    setIsSubmitting(true)
    try {
      const res = await submitScamReport(payload)
      const newReport: RecentReportItem = {
        id: res.reportId,
        targetValue: payload.targetIdentifier,
        targetType: payload.threatType,
        category: payload.category,
        submittedDate: "Vừa xong",
        evidenceCount: payload.attachments.length,
        status: "PENDING",
        rewardPoints: 0,
      }
      setReports((prev) => [newReport, ...prev])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Right Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#131B2E] dark:text-foreground">
            Báo Cáo Đối Tượng Lừa Đảo
          </h1>
          <p className="pt-1 text-xs text-[#45464D] dark:text-muted-foreground">
            Chung tay làm sạch không gian mạng. Mọi thông tin đều được bảo vệ
            theo chuẩn Zero-PII.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0B132B] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#131B2E] active:scale-95 dark:bg-primary dark:text-primary-foreground"
        >
          <ShieldPlus size={16} weight="fill" />
          <span>Tạo báo cáo mới ngay</span>
        </button>
      </div>

      {/* 3-Step Report Submission Form */}
      <ReportForm onSubmit={handleSubmit} isLoading={isSubmitting} />

      {/* Recent User Reports Table */}
      <RecentReportsTable items={reports} />
    </div>
  )
}
