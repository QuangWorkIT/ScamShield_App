"use client"

import React, { useState } from "react"
import {
  FileText,
  Warning,
  Globe,
  ShieldCheck,
  SlidersHorizontal,
  Bank,
  ShieldWarning,
  Briefcase,
  DeviceMobile,
  ChartLineUp,
  Target,
  TreeStructure,
  ArrowClockwise,
  WarningCircle,
} from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useScamDashboard } from "@/features/dashboard/hooks/use-scam-dashboard"
import type {
  ScamDashboardFilterParams,
  ScamDashboardFilters,
  ScamDashboardSummary,
} from "@/features/dashboard/types/dashboard.types"

const nf = new Intl.NumberFormat("vi-VN")
const formatNumber = (n: number) => nf.format(n)
const formatPercent = (n: number | null | undefined) =>
  n === null || n === undefined
    ? "—"
    : `${n.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`
const formatChange = (n: number | null | undefined) =>
  n === null || n === undefined
    ? "Mới"
    : `${n > 0 ? "+" : ""}${n.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`

const THREAT_ICONS: Icon[] = [
  Bank,
  ShieldWarning,
  Briefcase,
  DeviceMobile,
  ChartLineUp,
]
const THREAT_STYLES = [
  { label: "CỰC KỲ NGUY HIỂM", color: "bg-red-600 text-white" },
  { label: "NGHIÊM TRỌNG", color: "bg-red-600 text-white" },
  { label: "RẤT PHỔ BIẾN", color: "bg-orange-500 text-white" },
  { label: "CẢNH BÁO CAO", color: "bg-amber-500 text-white" },
  { label: "THEO DÕI", color: "bg-indigo-500 text-white" },
]
const HOTSPOT_COLORS = [
  { dot: "bg-red-500", text: "text-red-600 dark:text-red-400" },
  { dot: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" },
  { dot: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
  { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
]

const CARD =
  "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]"

export default function GuestDashboardPage() {
  const {
    filterOptions,
    params,
    summary,
    loading,
    error,
    updateParams,
    selectPeriod,
    reload,
  } = useScamDashboard()

  return (
    <div className="flex min-h-screen w-full flex-col items-center pb-20">
      <DashboardHeader
        filterOptions={filterOptions}
        params={params}
        onPeriodChange={selectPeriod}
        onFilterChange={updateParams}
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !summary ? (
        <DashboardSkeleton />
      ) : (
        <div
          className={cn(
            "flex w-full flex-col items-center transition-opacity",
            loading && "pointer-events-none opacity-60"
          )}
        >
          <StatsGrid summary={summary} />
          <RegionalAnalysis summary={summary} />
          <TopThreats summary={summary} />
        </div>
      )}
    </div>
  )
}

function DashboardHeader({
  filterOptions,
  params,
  onPeriodChange,
  onFilterChange,
}: {
  filterOptions: ScamDashboardFilters | null
  params: ScamDashboardFilterParams
  onPeriodChange: (period: ScamDashboardFilterParams["period"]) => void
  onFilterChange: (patch: Partial<ScamDashboardFilterParams>) => void
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const periods = filterOptions?.periods.filter((p) => p.value !== "CUSTOM") ?? []
  const selectClass =
    "h-10 flex-1 md:flex-none rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-12 pb-8">
      <div className="mb-8 flex flex-col items-start gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 md:text-[34px] dark:text-slate-200">
          Dashboard tổng hợp lừa đảo trực tuyến Việt Nam
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Dữ liệu tổng hợp công khai theo thời gian thực từ báo cáo cộng đồng.
        </p>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 p-2 shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex w-full flex-wrap items-center gap-1 md:w-auto">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={cn(
                "rounded-xl px-4 py-2.5 text-xs font-bold transition-all",
                params.period === p.value
                  ? "bg-[#0F172A] text-white shadow-md dark:bg-slate-700"
                  : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <select
            aria-label="Tỉnh/Thành phố"
            className={selectClass}
            value={params.regionCode ?? ""}
            onChange={(e) =>
              onFilterChange({ regionCode: e.target.value || undefined })
            }
          >
            <option value="">
              Toàn quốc ({filterOptions?.regions.length ?? 34} Tỉnh/Thành)
            </option>
            {filterOptions?.regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced((v) => !v)}
            className="h-10 flex-1 gap-2 rounded-xl border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 md:flex-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <SlidersHorizontal weight="bold" size={16} /> Bộ lọc mở rộng
          </Button>
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row dark:border-slate-800 dark:bg-slate-900/50">
          <select
            aria-label="Danh mục lừa đảo"
            className={selectClass}
            value={params.categoryCode ?? ""}
            onChange={(e) =>
              onFilterChange({ categoryCode: e.target.value || undefined })
            }
          >
            <option value="">Tất cả danh mục</option>
            {filterOptions?.categories
              .filter((c) => c.active)
              .map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
          </select>
          <select
            aria-label="Loại đối tượng"
            className={selectClass}
            value={params.indicatorType ?? ""}
            onChange={(e) =>
              onFilterChange({ indicatorType: e.target.value || undefined })
            }
          >
            <option value="">Tất cả loại đối tượng</option>
            {filterOptions?.indicatorTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  )
}

function StatsGrid({ summary }: { summary: ScamDashboardSummary }) {
  const { reports, verifiedHighRisk, coverage, scamTypes } = summary
  const topHotspots = coverage.hotspots
    .slice(0, 2)
    .map((h) => h.regionName)
    .join(" & ")
  const categoryNames = scamTypes.categories
    .slice(0, 2)
    .map((c) => c.name)
    .join(", ")
  const changeUp = (reports.changePercent ?? 0) >= 0

  const stats = [
    {
      title: "TỔNG SỐ LƯỢT BÁO CÁO",
      value: formatNumber(reports.total),
      change: formatChange(reports.changePercent),
      changeColor: changeUp
        ? "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
        : "text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
      sub1: summary.filters.periodLabel,
      sub2: reports.anonymized ? "100% Ẩn danh" : "",
      icon: FileText,
      iconColor: "text-indigo-500",
      iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
    },
    {
      title: "ĐÃ XÁC THỰC NGUY CƠ CAO",
      value: formatNumber(verifiedHighRisk.total),
      change: `${formatPercent(verifiedHighRisk.percentOfReports)} tổng số`,
      changeColor:
        "text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
      sub1: "Thêm vào blacklist",
      sub2: `${formatNumber(verifiedHighRisk.blacklistAdditions.total)} STK & URL`,
      sub2Color: "text-red-600 font-semibold",
      icon: Warning,
      iconColor: "text-red-500",
      iconBg: "bg-red-50 dark:bg-red-500/10",
    },
    {
      title: "PHẠM VI PHỦ SÓNG",
      value: `${coverage.reportedProvinces} / ${coverage.totalProvinces}`,
      change: `${formatPercent(coverage.percent)} Tỉnh thành`,
      changeColor:
        "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
      sub1: "Điểm nóng chính",
      sub2: topHotspots
        ? `${topHotspots} (${formatPercent(coverage.hotspotsPercent)})`
        : "Chưa có dữ liệu",
      sub2Color: "font-semibold text-slate-800 dark:text-slate-200",
      icon: Globe,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      title: "SỐ LOẠI LỪA ĐẢO ĐÃ XÁC THỰC",
      value: formatNumber(scamTypes.total),
      change: "Danh mục trọng yếu",
      changeColor:
        "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
      sub1: "Đã xác thực",
      sub2: categoryNames || "Chưa có dữ liệu",
      sub2Color: "text-emerald-600 dark:text-emerald-400 font-semibold",
      icon: ShieldCheck,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
  ]

  return (
    <section className="mx-auto mb-8 w-full max-w-7xl px-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4.5 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={cn(
              CARD,
              "flex flex-col justify-between rounded-lg p-6 transition-shadow hover:shadow-lg md:p-7"
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="max-w-[180px] text-[10px] leading-relaxed font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                {stat.title}
              </span>
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/50",
                  stat.iconBg
                )}
              >
                <stat.icon
                  weight="fill"
                  className={cn("text-xl", stat.iconColor)}
                />
              </div>
            </div>
            <div className="mt-2 mb-8 flex items-baseline gap-3">
              <span className="text-3xl leading-none font-bold tracking-tight text-slate-900 md:text-[34px] dark:text-white">
                {stat.value}
              </span>
              <span
                className={cn(
                  "rounded px-2 text-[11px] font-bold",
                  stat.changeColor
                )}
              >
                {stat.change}
              </span>
            </div>
            <div className="mt-auto flex items-end justify-between border-t border-slate-50 pt-5 dark:border-slate-800/50">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {stat.sub1}
              </div>
              <div
                className={cn(
                  "text-right text-[11px] font-bold",
                  stat.sub2Color || "text-slate-900 dark:text-slate-300"
                )}
              >
                {stat.sub2}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RegionalAnalysis({ summary }: { summary: ScamDashboardSummary }) {
  const { hotspots, unlocatedReports } = summary.coverage
  const top = hotspots[0]

  return (
    <section className="mx-auto mb-8 w-full max-w-7xl px-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div
          className={cn(
            CARD,
            "flex flex-col rounded-[32px] p-8 lg:col-span-5"
          )}
        >
          <div className="mb-8">
            <h2 className="mb-1.5 text-xl font-bold text-slate-900 dark:text-white">
              Phân Bố Mối Đe Dọa
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Điểm nóng theo số báo cáo ghi nhận
            </p>
          </div>

          <div className="mb-10 flex-1 space-y-7">
            {hotspots.length === 0 && (
              <EmptyHint text="Chưa có báo cáo nào trong kỳ đã chọn." />
            )}
            {hotspots.map((h, i) => {
              const color = HOTSPOT_COLORS[i % HOTSPOT_COLORS.length]
              return (
                <div key={h.regionCode}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn("h-2.5 w-2.5 shrink-0 rounded-full", color.dot)}
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {h.regionName}
                      </span>
                    </div>
                    <span className={cn("text-xs font-bold", color.text)}>
                      {formatNumber(h.reports)} reports (
                      {formatPercent(h.percentOfReports)})
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={cn("h-full rounded-full", color.dot)}
                      style={{
                        width: `${Math.min(100, Math.max(0, h.percentOfReports))}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
            {unlocatedReports > 0 && (
              <p className="text-[11px] font-medium text-slate-400">
                {formatNumber(unlocatedReports)} báo cáo chưa xác định địa bàn.
              </p>
            )}
          </div>

          <div className="relative flex h-[200px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-emerald-50/50 dark:border-slate-700/50 dark:bg-slate-800/30">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-blue-100/50 dark:from-emerald-900/20 dark:to-blue-900/20" />
            <div className="absolute top-[20%] left-[30%] h-3 w-3 animate-pulse rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
            <div className="absolute top-[50%] right-[35%] h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
            <div className="absolute bottom-[20%] left-[35%] h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            <div className="absolute right-0 bottom-0 left-0 rounded-b-2xl bg-gradient-to-t from-[#0F172A] to-transparent p-4 pt-10">
              <div className="mb-1 text-[10px] font-bold tracking-widest text-white/70 uppercase">
                TRỌNG ĐIỂM HOẠT ĐỘNG
              </div>
              <div className="flex items-center justify-between text-[15px] font-bold text-white">
                {top ? top.regionName : "Chưa có dữ liệu"}
                <div className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/20 px-2 py-0.5 text-[10px] tracking-widest text-red-400 uppercase">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />{" "}
                  Giám sát 24/7
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={cn(CARD, "rounded-[32px] p-8 lg:col-span-7")}>
          <div className="mb-8">
            <h2 className="mb-1.5 text-xl font-bold text-slate-900 dark:text-white">
              Thống Kê Chi Tiết Theo Địa Bàn
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tỉnh & Thành phố ghi nhận số lượng báo cáo cao nhất
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-4 text-[10px] font-bold tracking-widest whitespace-nowrap text-slate-400 uppercase">
                    TỈNH / THÀNH PHỐ
                  </th>
                  <th className="pb-4 pr-6 text-right text-[10px] font-bold tracking-widest whitespace-nowrap text-slate-400 uppercase">
                    LƯỢT REPORT
                  </th>
                  <th className="pb-4 text-right text-[10px] font-bold tracking-widest whitespace-nowrap text-slate-400 uppercase">
                    TỶ LỆ
                  </th>
                </tr>
              </thead>
              <tbody>
                {hotspots.map((h) => (
                  <tr
                    key={h.regionCode}
                    className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/30"
                  >
                    <td className="flex items-center gap-3 py-4.5">
                      <span className="w-4 font-mono text-[10px] font-bold text-slate-400">
                        {h.regionCode}
                      </span>
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-200">
                        {h.regionName}
                      </span>
                    </td>
                    <td className="py-4.5 pr-6 text-right text-[13px] font-bold text-slate-900 dark:text-slate-200">
                      {formatNumber(h.reports)}
                    </td>
                    <td className="py-4.5 text-right text-xs font-bold whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {formatPercent(h.percentOfReports)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hotspots.length === 0 && (
              <EmptyHint text="Chưa có dữ liệu địa bàn trong kỳ đã chọn." />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function TopThreats({ summary }: { summary: ScamDashboardSummary }) {
  const categories = [...summary.scamTypes.categories]
    .sort((a, b) => b.confirmedIndicators - a.confirmedIndicators)
    .slice(0, 5)
  const totalIndicators = summary.scamTypes.categories.reduce(
    (sum, c) => sum + c.confirmedIndicators,
    0
  )

  return (
    <section className="mx-auto mb-16 w-full max-w-7xl px-4">
      <div className={cn(CARD, "rounded-[32px] p-8 md:p-10")}>
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2.5 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              <TreeStructure weight="bold" /> PHÂN LOẠI KỸ THUẬT SỐ - THREAT
              TAXONOMY
            </div>
            <h2 className="text-2xl font-bold text-slate-900 md:text-[28px] dark:text-white">
              Top 5 Hình Thức Lừa Đảo Trọng Yếu
            </h2>
          </div>
          <p className="max-w-[400px] text-xs leading-relaxed font-medium text-slate-500 md:text-right dark:text-slate-400">
            Xếp hạng theo số đối tượng lừa đảo đã được xác thực và đưa vào
            blacklist trong kỳ đã chọn.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, idx) => {
            const style = THREAT_STYLES[idx] ?? THREAT_STYLES[4]
            const ThreatIcon = THREAT_ICONS[idx] ?? ShieldWarning
            const pct = totalIndicators
              ? (cat.confirmedIndicators / totalIndicators) * 100
              : 0
            return (
              <div
                key={cat.code}
                className="group flex flex-col rounded-[24px] border border-slate-100 bg-slate-50/50 p-7 transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/30"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <ThreatIcon
                      weight="fill"
                      className="text-2xl text-slate-700 dark:text-slate-300"
                    />
                  </div>
                  <span
                    className={cn(
                      "rounded px-2 py-1.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase",
                      style.color
                    )}
                  >
                    {style.label}
                  </span>
                </div>
                <h3 className="mb-2.5 text-[15px] leading-snug font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {cat.name}
                </h3>
                <p className="mb-8 flex-1 text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                  {formatNumber(cat.confirmedIndicators)} đối tượng thuộc nhóm
                  này đã được xác thực và đang nằm trong blacklist.
                </p>
                <div>
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      TỶ LỆ CHIẾM
                    </span>
                    <span className="text-lg leading-none font-bold text-slate-900 dark:text-white">
                      {formatPercent(pct)}
                    </span>
                  </div>
                  <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        style.color.split(" ")[0]
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {formatNumber(cat.confirmedIndicators)} đối tượng xác thực
                  </div>
                </div>
              </div>
            )
          })}

          {categories.length === 0 && (
            <div className="md:col-span-2">
              <EmptyHint text="Chưa có danh mục lừa đảo nào được xác thực trong kỳ." />
            </div>
          )}

          <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] bg-[#0F172A] p-7 text-white shadow-xl">
            <div className="absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="relative z-10 mb-4 flex items-center gap-2 text-[10px] font-bold tracking-widest text-blue-400 uppercase">
              <Target weight="bold" className="text-lg" /> PHÂN TÍCH AI RADAR
            </div>
            <h3 className="relative z-10 mb-3 text-lg font-bold">
              Đặc Điểm Nhận Diện Cốt Lõi
            </h3>
            <p className="relative z-10 mb-6 flex-1 text-xs leading-relaxed font-medium text-slate-300">
              Hầu hết các vụ việc dẫn dụ nạn nhân chuyển khoản qua tài khoản
              ngân hàng trung gian hoặc cài đặt tệp Android .APK ngoài chợ ứng
              dụng Google Play.
            </p>
            <div className="relative z-10 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/80 p-4">
              <div className="w-16 shrink-0 text-[10px] leading-tight font-bold tracking-wider text-slate-400 uppercase">
                Nguyên tắc vàng
              </div>
              <div className="text-xs leading-tight font-bold text-emerald-400">
                Không chuyển tiền khi chưa xác thực nhân thân
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="py-6 text-center text-xs font-medium text-slate-400">
      {text}
    </p>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-20 text-center">
      <WarningCircle weight="fill" className="text-5xl text-red-500" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {message}
      </p>
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <ArrowClockwise weight="bold" /> Thử lại
      </Button>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-4">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-44 rounded-lg bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-96 rounded-[32px] bg-slate-100 lg:col-span-5 dark:bg-slate-800" />
        <div className="h-96 rounded-[32px] bg-slate-100 lg:col-span-7 dark:bg-slate-800" />
      </div>
    </div>
  )
}
