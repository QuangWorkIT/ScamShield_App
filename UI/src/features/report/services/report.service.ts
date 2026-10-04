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

export const MOCK_RECENT_REPORTS: RecentReportItem[] = [
  {
    id: "#RPT-8492",
    targetValue: "089.842.xxxx",
    targetType: "PHONE",
    category: "Giả mạo Công an",
    submittedDate: "18/10/2024 14:22",
    evidenceCount: 3,
    status: "APPROVED_BLACKLIST",
    rewardPoints: 50,
  },
  {
    id: "#RPT-8511",
    targetValue: "tpbank-ebank.xyz[...]",
    targetType: "WEBSITE",
    category: "Website Phishing",
    submittedDate: "Hôm nay 09:15",
    evidenceCount: 2,
    status: "PENDING",
    rewardPoints: 0,
  },
  {
    id: "#RPT-8304",
    targetValue: "1903.6219.xxxx (TCB)",
    targetType: "BANK_ACCOUNT",
    category: "Tuyển CTV TikTok",
    submittedDate: "12/10/2024 18:40",
    evidenceCount: 4,
    status: "MERGED_DUPLICATE",
    duplicateRef: "#BLK-412",
    rewardPoints: 25,
  },
  {
    id: "#RPT-8190",
    targetValue: "090.312.xxxx",
    targetType: "PHONE",
    category: "Cuộc gọi làm phiền",
    submittedDate: "05/10/2024 10:02",
    evidenceCount: 1,
    status: "REJECTED",
    rejectionReason: "Không đủ chứng cứ chứng minh ý đồ lừa đảo.",
    rewardPoints: 0,
  },
]

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

export async function submitScamReport(
  payload: CreateReportPayload
): Promise<{ success: boolean; reportId: string }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/api/v1/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        return (await res.json()) as { success: boolean; reportId: string }
      }
    } catch {
      // Fallback
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 600))
  return {
    success: true,
    reportId: `#RPT-${Math.floor(1000 + Math.random() * 9000)}`,
  }
}
