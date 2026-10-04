export type CheckType = "TEXT" | "URL" | "PHONE" | "OCR"

export type RiskLevel = "SAFE" | "SUSPICIOUS" | "DANGEROUS" | "UNKNOWN"

export interface CheckScanRequest {
  content: string
  sender?: string
  check_type: CheckType
  target_bank?: string | null
  target_account_number?: string | null
}

export interface Verdict {
  risk_level: RiskLevel
  risk_score: number // 0 - 100
  scam_type: string
  confidence: number
  summary: string
}

export interface RadarMetrics {
  urgency: number
  authority_impersonation: number
  financial_lure: number
  suspicious_channel: number
  data_harvesting: number
}

export interface CouncilAudit {
  consensus_ratio: string
  lead_evaluator: string
  defense_notes: string
}

export interface CheckScanResponse {
  status: "success" | "error"
  scan_id: string
  created_at: string
  tier_executed: 1 | 2
  verdict: Verdict
  legal_basis?: {
    case_code: string
    title: string
    description: string
    press_release_link?: string
    ai_opinion: string
  }
  radar_metrics?: RadarMetrics
  council_audit?: CouncilAudit
  recommendations: string[]
}
