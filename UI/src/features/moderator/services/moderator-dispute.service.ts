import {
  ModeratorDisputeItem,
  DisputeVerdictPayload,
} from "../types/moderator-dispute.types"

export const MOCK_MODERATOR_DISPUTES: ModeratorDisputeItem[] = [
  {
    id: "AP-2024-0041",
    originalReportId: "CS-2024-1820",
    targetIdentifier: "0383 456 789",
    category: "Lừa đảo việc làm lương cao",
    disputedBy: "lehoangtung_biz",
    disputedAt: "14/01 16:45",
    status: "Đang xét",
    originalDecision: "Approved",
    disputeReason:
      "Đây là số điện thoại của công ty tuyển dụng hợp pháp tại Hà Nội. Tôi có đầy đủ giấy phép kinh doanh và chứng từ thuế. Yêu cầu thu hồi chỉ số và xóa khỏi blacklist.",
    evidences: [
      { id: "disp-ev-1", name: "business_registration.pdf", type: "pdf" },
      { id: "disp-ev-2", name: "tax_cert.pdf", type: "pdf" },
      { id: "disp-ev-3", name: "contract_sample.jpg", type: "image" },
    ],
  },
  {
    id: "AP-2024-0038",
    originalReportId: "CS-2024-1790",
    targetIdentifier: "thanhcong-invest.vn",
    category: "Lừa đảo đầu tư / tài chính",
    disputedBy: "thanhcong_fin_jsc",
    disputedAt: "12/01 09:20",
    status: "Đang xét",
    originalDecision: "Approved",
    disputeReason:
      "Tên miền đã được cấp phép hoạt động theo quy định của Ủy ban Chứng khoán Nhà nước. Đây là sự cố nhầm lẫn do đối thủ cạnh tranh spam báo cáo.",
    evidences: [
      { id: "disp-ev-4", name: "ssc_license_cert.pdf", type: "pdf" },
      { id: "disp-ev-5", name: "domain_registration.pdf", type: "pdf" },
    ],
  },
  {
    id: "AP-2024-0035",
    originalReportId: "CS-2024-1650",
    targetIdentifier: "1900 636 563",
    category: "Mạo danh công an / cơ quan nhà nước",
    disputedBy: "telecom_partner_vn",
    disputedAt: "10/01 14:00",
    status: "Chấp nhận",
    originalDecision: "Rejected",
    disputeReason:
      "Đầu số tổng đài CSKH hợp pháp của đơn vị cung ứng dịch vụ viễn thông, không thuộc quản lý của tổ chức lừa đảo.",
    evidences: [
      { id: "disp-ev-6", name: "mic_telecom_license.pdf", type: "pdf" },
    ],
  },
]

export async function getModeratorDisputes(): Promise<ModeratorDisputeItem[]> {
  // Pure mock service per reviewer conventions
  await new Promise((resolve) => setTimeout(resolve, 80))
  return [...MOCK_MODERATOR_DISPUTES]
}

export async function submitDisputeVerdict(
  payload: DisputeVerdictPayload
): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const verdictText =
    payload.verdict === "RETRACT"
      ? "Thu hồi chỉ số lừa đảo thành công"
      : "Duy trì quyết định gốc, từ chối kháng nghị"
  return {
    success: true,
    message: `Đã xử lý kháng nghị ${payload.disputeId}: ${verdictText}!`,
  }
}
