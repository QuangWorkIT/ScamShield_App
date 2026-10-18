export type QueueItemPriority = "URGENT" | "HIGH" | "NORMAL"

export type QueueItemStatus = "Pending" | "In Review" | "Locked" | "Approved" | "Rejected"

export type QueueFilterTab = "ALL" | "PENDING" | "IN_REVIEW" | "LOCKED"

export interface QueueEvidence {
  id: string
  name: string
  type: "image" | "video" | "pdf"
  url?: string
}

export interface ModeratorReportItem {
  id: string
  targetIdentifier: string
  category: string
  reportCount: number
  reportedBy: string
  reportedAt: string
  priority: QueueItemPriority
  status: QueueItemStatus
  aiScore: number
  aiRiskLevel: "SCAM-RISK" | "SUSPICIOUS" | "SAFE"
  aiConfidence: string
  evidenceCompleteness: number
  reporterProposal?: string | null
  evidences: QueueEvidence[]
  taxonomies: string[]
  isLocked?: boolean
}

export interface ModerationDecisionPayload {
  reportId: string
  decision: "APPROVE" | "REJECT" | "MERGE"
  reason: string
  selectedTaxonomies: string[]
}

export const MODERATOR_TAXONOMY_TAGS = [
  "Lừa đảo ngân hàng / OTP Phishing",
  "Mạo danh công an / cơ quan nhà nước",
  "Lừa đảo việc làm lương cao",
  "Lừa đảo đầu tư / tài chính",
  "Giả mạo website ngân hàng",
  "Lừa đảo thương mại điện tử",
  "Mạo danh người thân / họ hàng",
  "Lottery / Trúng thưởng giả",
  "SIM Swap / Chiếm đoạt tài khoản",
  "Vishing / Cuộc gọi lừa đảo",
  "Smishing / SMS lừa đảo",
  "Deepfake / Lừa đảo giả mạo AI",
  "Khác",
] as const
