"use client"

import Link from "next/link"
import { DownloadSimple, Plus } from "@phosphor-icons/react"
import { ReportMetricsCards } from "@/components/features/report/report-metrics-cards"
import { ReportTrackingTable } from "@/components/features/report/report-tracking-table"
import {
  MOCK_SUMMARY_METRICS,
  MOCK_TRACKING_REPORTS,
} from "@/features/report/services/report.service"

export default function UserReportsPage() {
  const handleExportCsv = () => {
    // Generate dummy CSV export
    const headers = "ID,Hash,Target,Category,Date,SLA,Evidence\n"
    const rows = MOCK_TRACKING_REPORTS.map(
      (r) =>
        `"${r.id}","${r.hashId}","${r.targetValue}","${r.category}","${r.submittedDate}","${r.slaTime}","${r.evidenceBadge}"`
    ).join("\n")
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "scamshield_report_tracking.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center rounded-full bg-[#E2E7FF]/70 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#008CC7] uppercase dark:bg-primary/20 dark:text-primary">
            Minh Bạch Dữ Liệu
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#131B2E] dark:text-foreground">
            Báo Cáo & Theo Dõi Tiến Trình
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#C6C6CE]/60 bg-white px-3.5 py-2 text-xs font-semibold text-[#131B2E] shadow-2xs hover:bg-[#FAF8FF] dark:border-border dark:bg-card dark:text-foreground"
          >
            <DownloadSimple size={15} weight="bold" />
            <span>Xuất đối soát (CSV)</span>
          </button>

          <Link
            href="/user/reports/new"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0B132B] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#131B2E] active:scale-95 dark:bg-primary dark:text-primary-foreground"
          >
            <Plus size={15} weight="bold" />
            <span>Gửi Báo Cáo Mới</span>
          </Link>
        </div>
      </div>

      {/* 4 Overview Metric Cards */}
      <ReportMetricsCards metrics={MOCK_SUMMARY_METRICS} />

      {/* Report Tracking Filter & Table */}
      <ReportTrackingTable items={MOCK_TRACKING_REPORTS} />
    </div>
  )
}
