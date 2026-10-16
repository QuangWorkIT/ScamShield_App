import { ModeratorReportItem, ModerationDecisionPayload } from "../types/moderator.types"

export const MOCK_MODERATOR_QUEUE: ModeratorReportItem[] = [
  {
    id: "CS-2024-1891",
    targetIdentifier: "0909 123 456",
    category: "Lừa đảo ngân hàng / OTP Phishing",
    reportCount: 47,
    reportedBy: "nguyenthanh_vn",
    reportedAt: "15/01 14:32",
    priority: "URGENT",
    status: "Pending",
    aiScore: 94,
    aiRiskLevel: "SCAM-RISK",
    aiConfidence: "Rất cao (97%)",
    evidenceCompleteness: 85,
    reporterProposal: null,
    evidences: [
      { id: "ev-1", name: "screenshot_1.jpg", type: "image" },
      { id: "ev-2", name: "screenshot_2.jpg", type: "image" },
      { id: "ev-3", name: "recording.mp4", type: "video" },
    ],
    taxonomies: ["Lừa đảo ngân hàng / OTP Phishing"],
    isLocked: false,
  },
  {
    id: "CS-2024-1887",
    targetIdentifier: "vcb-secure-login.net",
    category: "Giả mạo website ngân hàng",
    reportCount: 128,
    reportedBy: "tran_minh_tech",
    reportedAt: "14/01 09:15",
    priority: "URGENT",
    status: "In Review",
    aiScore: 99,
    aiRiskLevel: "SCAM-RISK",
    aiConfidence: "Gần như tuyệt đối (99%)",
    evidenceCompleteness: 95,
    reporterProposal: "Đề xuất chặn DNS và gắn cờ khẩn cấp trên hệ thống ngân hàng liên minh",
    evidences: [
      { id: "ev-4", name: "phishing_form.png", type: "image" },
      { id: "ev-5", name: "ssl_spoof_detail.pdf", type: "pdf" },
    ],
    taxonomies: ["Giả mạo website ngân hàng", "Lừa đảo ngân hàng / OTP Phishing"],
    isLocked: false,
  },
  {
    id: "CS-2024-1880",
    targetIdentifier: "0356 789 012",
    category: "Lừa đảo việc làm lương cao",
    reportCount: 12,
    reportedBy: "hoangha_danang",
    reportedAt: "13/01 17:44",
    priority: "HIGH",
    status: "Pending",
    aiScore: 31,
    aiRiskLevel: "SUSPICIOUS",
    aiConfidence: "Trung bình (65%)",
    evidenceCompleteness: 30,
    reporterProposal: null,
    evidences: [
      { id: "ev-6", name: "telegram_chat.png", type: "image" },
    ],
    taxonomies: ["Lừa đảo việc làm lương cao"],
    isLocked: false,
  },
  {
    id: "CS-2024-1879",
    targetIdentifier: "1800 545 413",
    category: "Lừa đảo ngân hàng / OTP Phishing",
    reportCount: 89,
    reportedBy: "le_thi_mai",
    reportedAt: "13/01 08:30",
    priority: "URGENT",
    status: "Locked",
    aiScore: 78,
    aiRiskLevel: "SCAM-RISK",
    aiConfidence: "Cao (88%)",
    evidenceCompleteness: 60,
    reporterProposal: null,
    evidences: [
      { id: "ev-7", name: "sms_brandname_spoofed.png", type: "image" },
    ],
    taxonomies: ["Lừa đảo ngân hàng / OTP Phishing", "Smishing / SMS lừa đảo"],
    isLocked: true,
  },
  {
    id: "CS-2024-1872",
    targetIdentifier: "Tuyển dụng gấp 500k/ngày tại nhà",
    category: "Lừa đảo việc làm lương cao",
    reportCount: 34,
    reportedBy: "phamduc_hcm",
    reportedAt: "12/01 11:20",
    priority: "HIGH",
    status: "Pending",
    aiScore: 88,
    aiRiskLevel: "SCAM-RISK",
    aiConfidence: "Cao (91%)",
    evidenceCompleteness: 70,
    reporterProposal: null,
    evidences: [
      { id: "ev-8", name: "facebook_ad_proof.jpg", type: "image" },
      { id: "ev-9", name: "app_task_instructions.pdf", type: "pdf" },
    ],
    taxonomies: ["Lừa đảo việc làm lương cao", "Lừa đảo đầu tư / tài chính"],
    isLocked: false,
  },
  {
    id: "CS-2024-1865",
    targetIdentifier: "bidv.com.vn/dang-nhap",
    category: "Giả mạo website ngân hàng",
    reportCount: 142,
    reportedBy: "vcb_security_bot",
    reportedAt: "11/01 22:10",
    priority: "URGENT",
    status: "Locked",
    aiScore: 91,
    aiRiskLevel: "SCAM-RISK",
    aiConfidence: "Rất cao (95%)",
    evidenceCompleteness: 42,
    reporterProposal: "Khóa khẩn cấp và cảnh báo toàn mạng lưới liên ngân hàng",
    evidences: [
      { id: "ev-10", name: "domain_whois.txt", type: "pdf" },
    ],
    taxonomies: ["Giả mạo website ngân hàng"],
    isLocked: true,
  },
  {
    id: "CS-2024-1860",
    targetIdentifier: "1900 123 456",
    category: "Mạo danh công an / cơ quan nhà nước",
    reportCount: 89,
    reportedBy: "an_ninh_mang_hn",
    reportedAt: "11/01 08:05",
    priority: "NORMAL",
    status: "Approved",
    aiScore: 97,
    aiRiskLevel: "SCAM-RISK",
    aiConfidence: "Tuyệt đối (98%)",
    evidenceCompleteness: 80,
    reporterProposal: "Đã xác minh lệnh bắt giả mạo",
    evidences: [
      { id: "ev-11", name: "fake_warrant_letter.jpg", type: "image" },
    ],
    taxonomies: ["Mạo danh công an / cơ quan nhà nước", "Vishing / Cuộc gọi lừa đảo"],
    isLocked: false,
  },
]

export async function getModeratorReportQueue(): Promise<ModeratorReportItem[]> {
  // Pure mock service with slight simulation delay
  await new Promise((resolve) => setTimeout(resolve, 80))
  return [...MOCK_MODERATOR_QUEUE]
}

export async function submitModerationDecision(
  payload: ModerationDecisionPayload
): Promise<{ success: boolean; message: string }> {
  // Pure mock service per reviewer guidelines
  await new Promise((resolve) => setTimeout(resolve, 150))
  return {
    success: true,
    message: `Đã xử lý quyết định "${payload.decision}" cho hồ sơ ${payload.reportId} thành công!`,
  }
}
