export type ScamCheckInputType = "MESSAGE" | "URL" | "PHONE" | "BANK_ACCOUNT"

export interface ScamCheckRequest {
  inputType: ScamCheckInputType
  content: string
}

export interface ScamCheckResult {
  checkId: number
  verdictId: number
  inputType: string
  status: string
  verdict: string
  decidedByStage: string
  categoryCode: string | null
  confidence: number | null
  explanation: string | null
  safetyGuidance: string | null
  unknownReason: string | null
  matchedIndicator: { id: number; type: string; value: string } | null
  reasons: { code: string; sourceStage: string; detail: string | null }[]
  createdAt: string
  completedAt: string | null
  retentionExpiresAt: string
}
