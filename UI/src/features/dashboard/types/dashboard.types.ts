export interface BaseResponse<T> {
  isSuccess: boolean
  message: string
  data: T
}

export type ScamDashboardPeriod =
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "QUARTER"
  | "YEAR"
  | "CUSTOM"

export interface ScamDashboardFilterParams {
  period?: ScamDashboardPeriod
  year?: number
  quarter?: number
  fromDate?: string
  toDate?: string
  regionCode?: string
  categoryCode?: string
  indicatorType?: string
}

export interface DashboardPeriodOption {
  value: ScamDashboardPeriod
  label: string
}

export interface DashboardRegionOption {
  code: string
  name: string
}

export interface DashboardCategoryOption {
  code: string
  name: string
  active: boolean
}

export interface ScamDashboardFilters {
  timezone: string
  defaultPeriod: ScamDashboardPeriod
  currentYear: number
  currentQuarter: number
  periods: DashboardPeriodOption[]
  regions: DashboardRegionOption[]
  categories: DashboardCategoryOption[]
  indicatorTypes: string[]
}

export interface DashboardDateRange {
  fromDate: string
  toDate: string
}

export interface DashboardHotspot {
  regionCode: string
  regionName: string
  reports: number
  percentOfReports: number
}

export interface DashboardConfirmedCategory {
  code: string
  name: string
  confirmedIndicators: number
}

export interface ScamDashboardSummary {
  timezone: string
  generatedAt: string
  filters: {
    period: ScamDashboardPeriod
    periodLabel: string
    regionCode: string | null
    categoryCode: string | null
    indicatorType: string | null
  }
  dateRange: DashboardDateRange
  previousDateRange: DashboardDateRange
  reports: {
    total: number
    previousTotal: number
    changePercent: number | null
    anonymized: boolean
  }
  verifiedHighRisk: {
    total: number
    percentOfReports: number
    blacklistAdditions: { total: number; bankAccounts: number; urls: number }
  }
  coverage: {
    reportedProvinces: number
    totalProvinces: number
    percent: number
    unlocatedReports: number
    hotspots: DashboardHotspot[]
    hotspotsPercent: number
  }
  scamTypes: {
    total: number
    categories: DashboardConfirmedCategory[]
  }
}
