import { authorizeApi } from "@/lib/api/instance"
import {
  RecentReportItem,
  TrackingReportItem,
  ReportSummaryMetrics,
  CreateReportPayload,
} from "../types/report.types"

export const MOCK_SUMMARY_METRICS: ReportSummaryMetrics = {
  totalReports: 18,
  recentReports7Days: 4,
  blacklistedCount: 14,
  queriesProtected: 3200,
  accuracyRate: 93.3,
  rankTitle: "A+ Chuyên Gia",
  reputationPoints: 700,
  currentTierProgress: 600,
  maxTierPoints: 700,
}

export const MOCK_TRACKING_REPORTS: TrackingReportItem[] = [
  {
    id: "#RPT-8492",
    hashId: "e9b4...2a1f",
    targetType: "PHONE",
    targetValue: "089.842.xxxx",
    targetSub: "Đầu số MobiFone phát tán",
    category: "Mạo danh cán bộ thuế/A05",
    submittedDate: "14:22, 28/10/2024",
    slaTime: "Xong trong 14 phút",
    slaStatus: "completed",
    evidenceBadge: "3 ảnh • OCR Pass",
    status: "APPROVED_BLACKLIST",
  },
  {
    id: "#RPT-8488",
    hashId: "a102...cd78",
    targetType: "BANK",
    targetValue: "1903.6219.xxxx",
    targetSub: "Techcombank (Đỗ Văn T...)",
    category: "Tuyển CTV lừa nạp tiền",
    submittedDate: "09:15, 29/10/2024",
    slaTime: "Đang xử lý (32 phút)",
    slaStatus: "processing",
    evidenceBadge: "5 ảnh GD • Video",
    status: "PENDING",
  },
  {
    id: "#RPT-8470",
    hashId: "c77e...410b",
    targetType: "WEBSITE",
    targetValue: "tpbank-ebank.xyz[...]",
    targetSub: "Server IP: 104.21.xx.xx (Cloudflare)",
    category: "Website Phishing đánh cắp OTP",
    submittedDate: "18:04, 27/10/2024",
    slaTime: "Xong trong 8 phút",
    slaStatus: "completed",
    evidenceBadge: "2 URL Log • HTML Raw",
    status: "APPROVED_BLACKLIST",
  },
  {
    id: "#RPT-8411",
    hashId: "88aa...190e",
    targetType: "TELEGRAM",
    targetValue: "@invest_vip_vn",
    targetSub: "Nhóm Telegram chứng khoán ảo",
    category: "Lôi kéo đầu tư Forex/Crypto",
    submittedDate: "11:00, 25/10/2024",
    slaTime: "Tự động gộp chéo",
    slaStatus: "merged",
    evidenceBadge: "1 ảnh chụp nhóm",
    status: "MERGED_DUPLICATE",
  },
  {
    id: "#RPT-8390",
    hashId: "512b...f0a4",
    targetType: "APK",
    targetValue: "DichVuCong_Fake.apk",
    targetSub: "Chứa mã độc gián điệp Spyware",
    category: "Giả mạo App VNeID / DVC",
    submittedDate: "20:30, 22/10/2024",
    slaTime: "Xong trong 25 phút",
    slaStatus: "completed",
    evidenceBadge: "Tệp APK • 12MB",
    status: "APPROVED_BLACKLIST",
  },
]

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
