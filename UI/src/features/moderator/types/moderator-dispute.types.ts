export type DisputeStatus = "Đang xét" | "Chấp nhận" | "Từ chối"

export type OriginalDecision = "Approved" | "Rejected"

export interface DisputeEvidence {
  id: string
  name: string
  type: "pdf" | "image"
  url?: string
}

export interface ModeratorDisputeItem {
  id: string
  originalReportId: string
  targetIdentifier: string
  category: string
  disputedBy: string
  disputedAt: string
  status: DisputeStatus
  originalDecision: OriginalDecision
  disputeReason: string
  evidences: DisputeEvidence[]
}

export interface DisputeVerdictPayload {
  disputeId: string
  verdict: "RETRACT" | "UPHOLD"
  reason: string
}
