export type TargetType =
  | "PHONE"
  | "URL"
  | "SMS_BANK"
  | "TELEGRAM"
  | "BANK_ACCOUNT"
  | "TRAFFIC_FINE"
  | "CRYPTO"

export type HistoryRiskStatus = "DANGEROUS" | "SUSPICIOUS" | "SAFE" | "UNKNOWN"

export interface HistoryItem {
  id: string
  timestamp: string
  ip: string
  isRetroactive?: boolean
  targetType: TargetType
  targetValue: string
  targetDetail?: string
  snippet: string
  category: string
  verdictLabel: string
  verdictStatus: HistoryRiskStatus
  riskScore: number
}

export interface HistoryFilterState {
  searchQuery: string
  timeRange: string
  scamType: string
  riskStatus: "ALL" | HistoryRiskStatus
}
