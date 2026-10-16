export type DisputeIndicatorType = "PHONE" | "BANK_ACCOUNT" | "URL" | "BRANDNAME"

export type DisputeLegalRelationship =
  | "OWNER"
  | "LEGAL_REPRESENTATIVE"
  | "AUTHORIZED_REPRESENTATIVE"

export type DisputeStatus =
  | "DRAFT"
  | "PENDING"
  | "IN_REVIEW"
  | "NEEDS_MORE_INFO"
  | "APPROVED"
  | "REJECTED"

export type DisputePriority = "NORMAL" | "HIGH"

export interface DisputeAttachment {
  id: number
  evidenceType: string
  fileName: string | null
  fileUrl: string | null
  fileSize: number | null
  contentType: string | null
  description?: string | null
  verificationStatus: string
  createdAt: string
}

export interface DisputeIndicatorSummary {
  id: number
  type: string
  displayValue: string
  blacklistStatus: string
  retractedAt: string | null
}

export interface DisputeListItem {
  id: number
  disputeCode: string
  status: DisputeStatus
  priority: DisputePriority
  reason: string
  legalRelationship: DisputeLegalRelationship
  declarationAcceptedAt: string | null
  progressMessage: string | null
  estimatedResolutionAt: string | null
  supplementReason: string | null
  supplementDeadline: string | null
  resolutionReason: string | null
  resolutionDocumentUrl: string | null
  createdAt: string
  updatedAt: string | null
  resolvedAt: string | null
  indicator: DisputeIndicatorSummary
  evidenceCount: number
  attachments: DisputeAttachment[]
}

export interface DisputeSummary {
  timezone: string
  generatedAt: string
  totalSubmitted: number
  pending: number
  inReview: number
  needsMoreInfo: number
  approved: number
  rejected: number
  averageResolutionHours: number | null
  restorationRate: number | null
}

export interface DisputeFormResponse {
  id: number
  disputeCode: string
  status: DisputeStatus
  indicatorType: DisputeIndicatorType | null
  indicatorValue: string | null
  legalRelationship: DisputeLegalRelationship | null
  reason: string | null
  declarationAcceptedAt: string | null
  createdAt: string
  updatedAt: string | null
  attachments: DisputeAttachment[]
}

export interface SubmitDisputePayload {
  indicatorType: DisputeIndicatorType
  indicatorValue: string
  legalRelationship: DisputeLegalRelationship
  reason: string
  agreeTerms: boolean
  removedEvidenceIds?: number[]
}

export interface SaveDisputeDraftPayload {
  indicatorType?: DisputeIndicatorType
  indicatorValue?: string
  legalRelationship?: DisputeLegalRelationship
  reason?: string
  removedEvidenceIds?: number[]
}

export interface DisputeListParams {
  status?: DisputeStatus[]
  page?: number
  size?: number
}
