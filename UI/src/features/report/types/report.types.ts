export type ReportThreatType = "PHONE" | "WEBSITE" | "BANK_ACCOUNT"

export type ReportStatus =
  "APPROVED_BLACKLIST" | "PENDING" | "MERGED_DUPLICATE" | "REJECTED"

export interface RecentReportItem {
  id: string
  targetValue: string
  targetType: ReportThreatType
  targetBank?: string
  category: string
  submittedDate: string
  evidenceCount: number
  status: ReportStatus
  rewardPoints: number
  rejectionReason?: string
  duplicateRef?: string
}

export interface TrackingReportItem {
  id: string
  hashId: string
  targetType: "PHONE" | "BANK" | "WEBSITE" | "TELEGRAM" | "APK"
  targetValue: string
  targetSub: string
  category: string
  submittedDate: string
  slaTime: string
  slaStatus: "completed" | "processing" | "merged"
  evidenceBadge: string
  status: ReportStatus
}

export interface ReportSummaryMetrics {
  totalReports: number
  recentReports7Days: number
  blacklistedCount: number
  queriesProtected: number
  accuracyRate: number
  rankTitle: string
  reputationPoints: number
  currentTierProgress: number
  maxTierPoints: number
}

export interface CreateReportPayload {
  threatType: ReportThreatType
  targetIdentifier: string
  category: string
  description: string
  attachments: string[]
  isConfirmed: boolean
}
