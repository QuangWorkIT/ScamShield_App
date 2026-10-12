"use client"

import { useState } from "react"
import { ScamCheckInput } from "@/components/features/check/scam-check-input"
import { ScamVerdictBanner } from "@/components/features/check/scam-verdict-banner"
import { ScamEvidenceCard } from "@/components/features/check/scam-evidence-card"
import { ScamActionBar } from "@/components/features/check/scam-action-bar"
import {
  MOCK_HIGH_RISK_RESULT,
  checkScamContent,
} from "@/features/check/services/check.service"
import {
  CheckScanResponse,
  CheckType,
} from "@/features/check/types/check.types"

export default function UserCheckPage() {
  const [result, setResult] = useState<CheckScanResponse | null>(
    MOCK_HIGH_RISK_RESULT
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async (content: string, type: CheckType) => {
    setIsLoading(true)
    try {
      const data = await checkScamContent({
        content,
        check_type: type,
      })
      setResult(data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#131B2E] dark:text-foreground">
          Kiểm Tra Lừa Đảo Chuyên Sâu
        </h1>
      </div>

      {/* Input Section */}
      <ScamCheckInput onAnalyze={handleAnalyze} isLoading={isLoading} />

      {/* Result Section (Shown when analysis exists) */}
      {result && (
        <div className="animate-in space-y-6 pt-2 duration-300 fade-in-50">
          {/* High-Risk Verdict Banner */}
          <ScamVerdictBanner verdict={result.verdict} />

          {/* Legal Evidence & AI Opinion & Action Recommendations */}
          <ScamEvidenceCard data={result} />

          {/* Bottom Action Buttons */}
          <ScamActionBar scanId={result.scan_id} />
        </div>
      )}
    </div>
  )
}
