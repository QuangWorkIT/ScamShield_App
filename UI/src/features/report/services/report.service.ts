import { authorizeApi } from "@/lib/api/instance"
import {
  RecentReportItem,
  TrackingReportItem,
  ReportSummaryMetrics,
  CreateReportPayload,
  ReportStatusCounts,
  ScamCategoryItem,
  TrackingReportsFilterParams,
  PaginatedTrackingReports,
} from "../types/report.types"

export const DEFAULT_SUMMARY_METRICS: ReportSummaryMetrics = {
  totalReports: 0,
  recentReports7Days: 0,
  blacklistedCount: 0,
  queriesProtected: 0,
  accuracyRate: 100,
  rankTitle: "Sentinel Tân Thủ",
  reputationPoints: 0,
  currentTierProgress: 0,
  maxTierPoints: 100,
}

export const DEFAULT_STATUS_COUNTS: ReportStatusCounts = {
  all: 0,
  pending: 0,
  approvedBlacklist: 0,
  mergedDuplicate: 0,
  rejected: 0,
}

/**
 * Lấy thống kê tổng quan (4 metric cards) từ GET /api/user/reports/metrics
 */
export async function getReportSummaryMetrics(): Promise<ReportSummaryMetrics> {
  try {
    const res = await authorizeApi.get("/api/user/reports/metrics")
    if (res.data?.success && res.data?.data) {
      const d = res.data.data
      return {
        totalReports: Number(d.totalReports || 0),
        recentReports7Days: Number(d.recentReports7Days || 0),
        blacklistedCount: Number(d.blacklistedCount || 0),
        queriesProtected: Number(d.queriesProtected || 0),
        accuracyRate: Number(d.accuracyRate || 100),
        rankTitle: d.rankTitle || "Sentinel Tân Thủ",
        reputationPoints: Number(d.reputationPoints || 0),
        currentTierProgress: Number(d.currentTierProgress || 0),
        maxTierPoints: Number(d.maxTierPoints || 100),
      }
    }
  } catch (error) {
    console.warn("Không thể tải thống kê metrics, dùng dữ liệu mặc định:", error)
  }
  return DEFAULT_SUMMARY_METRICS
}

/**
 * Lấy số lượng báo cáo theo trạng thái từ GET /api/user/reports/status-counts
 */
export async function getReportStatusCounts(): Promise<ReportStatusCounts> {
  try {
    const res = await authorizeApi.get("/api/user/reports/status-counts")
    if (res.data?.success && res.data?.data) {
      const d = res.data.data
      return {
        all: Number(d.all || 0),
        pending: Number(d.pending || 0),
        approvedBlacklist: Number(d.approvedBlacklist || 0),
        mergedDuplicate: Number(d.mergedDuplicate || 0),
        rejected: Number(d.rejected || 0),
      }
    }
  } catch (error) {
    console.warn("Không thể tải số lượng trạng thái báo cáo:", error)
  }
  return DEFAULT_STATUS_COUNTS
}

/**
 * Lấy danh sách báo cáo tiến trình phân trang từ GET /api/user/reports/tracking
 */
export async function getTrackingReports(
  params?: TrackingReportsFilterParams
): Promise<PaginatedTrackingReports> {
  try {
    const res = await authorizeApi.get("/api/user/reports/tracking", {
      params: {
        search: params?.search || undefined,
        status:
          params?.status && params.status !== "ALL" ? params.status : undefined,
        categoryId: params?.categoryId || undefined,
        days: params?.days || undefined,
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sort: params?.sort || "createdAt,desc",
      },
    })

    if (res.data?.success && res.data?.data) {
      const pageData = res.data.data
      const rawList = Array.isArray(pageData.data) ? pageData.data : []
      const items: TrackingReportItem[] = rawList.map((item: any) => ({
        id: item.id || (item.rawId ? `#RPT-${item.rawId}` : "#RPT-0000"),
        hashId: item.hashId || "---",
        targetType: item.targetType || "PHONE",
        targetValue: item.targetValue || "",
        targetSub: item.targetSub || "",
        category: item.category || "Chưa phân loại",
        submittedDate:
          item.submittedDate ||
          (item.createdAt
            ? new Date(item.createdAt).toLocaleString("vi-VN")
            : "Vừa xong"),
        slaTime: item.slaTime || "Đang xử lý",
        slaStatus: item.slaStatus || "processing",
        evidenceBadge:
          item.evidenceBadge ||
          (item.evidenceCount
            ? `${item.evidenceCount} bằng chứng`
            : "Không có"),
        status: item.status || "PENDING",
      }))

      return {
        items,
        currentPage: pageData.currentPage ?? 0,
        totalItems: pageData.totalItems ?? items.length,
        totalPages: pageData.totalPages ?? 1,
        pageSize: pageData.pageSize ?? 10,
        hasNext: Boolean(pageData.hasNext),
        hasPrevious: Boolean(pageData.hasPrevious),
      }
    }
  } catch (error) {
    console.warn("Không thể tải danh sách theo dõi tiến trình:", error)
  }

  return {
    items: [],
    currentPage: 0,
    totalItems: 0,
    totalPages: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  }
}

/**
 * Lấy danh mục thủ đoạn lừa đảo từ GET /api/user/reports/categories
 */
export async function getReportCategories(): Promise<ScamCategoryItem[]> {
  try {
    const res = await authorizeApi.get("/api/user/reports/categories")
    if (res.data?.success && Array.isArray(res.data?.data)) {
      return res.data.data
    }
  } catch (error) {
    console.warn("Không thể tải danh mục thủ đoạn:", error)
  }
  return []
}

/**
 * Xuất file CSV đối soát từ GET /api/user/reports/export-csv
 */
export async function exportTrackingReportsCsv(
  params?: TrackingReportsFilterParams
): Promise<Blob> {
  const res = await authorizeApi.get("/api/user/reports/export-csv", {
    params: {
      search: params?.search || undefined,
      status:
        params?.status && params.status !== "ALL" ? params.status : undefined,
      categoryId: params?.categoryId || undefined,
      days: params?.days || undefined,
    },
    responseType: "blob",
  })
  return res.data
}

export interface SubmitReportResponse {
  success: boolean
  reportId: string
  message: string
}

/**
 * Nộp báo cáo đối tượng lừa đảo qua API backend /api/reports/json
 * Sử dụng authorizeApi từ hệ thống (kèm Bearer token)
 */
export async function submitScamReport(
  payload: CreateReportPayload
): Promise<SubmitReportResponse> {
  const res = await authorizeApi.post("/api/reports/json", {
    threatType: payload.threatType,
    targetIdentifier: payload.targetIdentifier,
    category: payload.category,
    description: payload.description,
    isConfirmed: payload.isConfirmed,
    attachmentUrls: payload.attachments,
  })

  const data = res.data?.data
  const reportId =
    data?.reportCode ||
    (data?.id ? `#RPT-${data.id}` : `#RPT-${Date.now().toString().slice(-4)}`)

  return {
    success: true,
    reportId,
    message: res.data?.message || "Gửi báo cáo lừa đảo thành công! (+50 điểm uy tín)",
  }
}

/**
 * Lấy danh sách báo cáo cá nhân từ API backend /api/reports/my-reports
 */
export async function getMyReports(): Promise<RecentReportItem[]> {
  try {
    const res = await authorizeApi.get("/api/reports/my-reports")
    if (res.data?.success && Array.isArray(res.data?.data)) {
      return res.data.data.map((item: any) => ({
        id: item.reportCode || (item.id ? `#RPT-${item.id}` : "#RPT-0000"),
        targetValue: item.targetIdentifier || "",
        targetType: (item.threatType as any) || "PHONE",
        category: item.categoryName || item.category || "Chưa phân loại",
        submittedDate: item.createdAt
          ? new Date(item.createdAt).toLocaleString("vi-VN")
          : "Vừa xong",
        evidenceCount: item.evidenceCount || (item.evidences?.length ?? 0),
        status: (item.status as any) || "PENDING",
        rewardPoints: item.rewardPoints || 0,
      }))
    }
  } catch (error: unknown) {
    console.error("Lỗi khi tải danh sách báo cáo cá nhân:", error)
    throw error
  }

  return []
}
