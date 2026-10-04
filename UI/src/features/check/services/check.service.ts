import { CheckScanRequest, CheckScanResponse } from "../types/check.types"

export const MOCK_HIGH_RISK_RESULT: CheckScanResponse = {
  status: "success",
  scan_id: "SCAN-20261004-9812",
  created_at: new Date().toISOString(),
  tier_executed: 2,
  verdict: {
    risk_level: "DANGEROUS",
    risk_score: 98,
    scam_type:
      "Mạo danh Cơ quan Cảnh sát điều tra & Phishing Cổng Dịch vụ công",
    confidence: 0.99,
    summary:
      "Nội dung chứa cấu trúc đe dọa án phạt hình sự nhằm ép buộc nạn nhân chuyển tài sản và cài mã độc gián điệp vào điện thoại.",
  },
  legal_basis: {
    case_code: "VN-A05-THREAT-IMP-GOV-092",
    title: "Khớp 100% với hồ sơ cảnh báo liên ngành",
    description:
      "Khớp 100% với phương thức thủ đoạn được Cục An ninh mạng & Phòng chống tội phạm công nghệ cao (A05) và Cổng NCSC phát lệnh cảnh báo khẩn cấp số 24/TB-A05 ngày 14/05/2025.",
    press_release_link: "https://bocongan.gov.vn",
    ai_opinion:
      "Cơ quan điều tra tuyệt đối KHÔNG bao giờ làm việc qua Zalo/điện thoại, KHÔNG yêu cầu công dân chuyển tiền đến 'tài khoản an toàn' hoặc tải ứng dụng thông qua đường dẫn file lạ bên ngoài Google Play và App Store.",
  },
  radar_metrics: {
    urgency: 95,
    authority_impersonation: 98,
    financial_lure: 92,
    suspicious_channel: 96,
    data_harvesting: 90,
  },
  council_audit: {
    consensus_ratio: "5/5",
    lead_evaluator: "DeepSeek-V3 & Claude 3.5 Sonnet",
    defense_notes:
      "Phát hiện tên miền lừa đảo giả mạo cổng dịch vụ công (.cc), số điện thoại cá nhân mạo danh điều tra viên.",
  },
  recommendations: [
    "Tuyệt đối KHÔNG bấm vào liên kết và KHÔNG cài đặt bất kỳ tệp tin APK/IPA nào được gửi kèm.",
    "Chặn ngay số điện thoại liên hệ, ngắt kết nối cuộc gọi và tuyệt đối không phản hồi tin nhắn yêu cầu.",
    "Chia sẻ thẻ cảnh báo này cho người thân và bạn bè để phòng tránh lây lan chuỗi lừa đảo mạo danh.",
  ],
}

export async function checkScamContent(
  payload: CheckScanRequest
): Promise<CheckScanResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/api/v1/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        return (await res.json()) as CheckScanResponse
      }
    } catch {
      // Fallback to mock on error
    }
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600))
  return MOCK_HIGH_RISK_RESULT
}
