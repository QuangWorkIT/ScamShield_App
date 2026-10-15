"use client"

import { useState } from "react"
import { ArrowUUpLeft, ShieldCheck, Info } from "@phosphor-icons/react"
import { DisputeVerdictPayload } from "@/features/moderator/types/moderator-dispute.types"

interface DisputeVerdictFormProps {
  disputeId: string
  onSubmit: (payload: DisputeVerdictPayload) => Promise<void>
  isSubmitting?: boolean
}

type VerdictType = "RETRACT" | "UPHOLD"

export function DisputeVerdictForm({
  disputeId,
  onSubmit,
  isSubmitting = false,
}: DisputeVerdictFormProps) {
  const [verdict, setVerdict] = useState<VerdictType | null>(null)
  const [reason, setReason] = useState<string>("")

  const minLength = 20
  const isReasonValid = reason.trim().length >= minLength
  const canSubmit = verdict !== null && isReasonValid && !isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !verdict) return

    await onSubmit({
      disputeId,
      verdict,
      reason: reason.trim(),
    })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        PHÁN QUYẾT KHÁNG NGHỊ
      </div>

      {/* Info Callout Banner */}
      <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs leading-relaxed text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
        <Info size={17} weight="bold" className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div>
          <p>
            <strong>Thu hồi (Retract):</strong> Xóa chỉ số lừa đảo khỏi blacklist nếu bằng chứng phản bác đủ thuyết phục.
          </p>
          <p className="mt-0.5">
            <strong>Duy trì (Uphold):</strong> Giữ nguyên quyết định gốc, từ chối kháng nghị.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* 2 Verdict Buttons */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setVerdict("RETRACT")}
            className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition-all ${
              verdict === "RETRACT"
                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-2xs ring-2 ring-blue-500/20 dark:border-blue-600 dark:bg-blue-950/60 dark:text-blue-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <ArrowUUpLeft size={16} weight="bold" />
            <span>Thu hồi chỉ số</span>
          </button>

          <button
            type="button"
            onClick={() => setVerdict("UPHOLD")}
            className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition-all ${
              verdict === "UPHOLD"
                ? "border-rose-500 bg-rose-50 text-rose-700 shadow-2xs ring-2 ring-rose-500/20 dark:border-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldCheck size={16} weight="bold" />
            <span>Duy trì quyết định</span>
          </button>
        </div>

        {/* Reason Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="dispute-verdict-reason"
              className="font-bold text-slate-700 dark:text-slate-300"
            >
              LÝ DO BẮT BUỘC *
            </label>
            <span
              className={`font-semibold ${
                isReasonValid ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
              }`}
            >
              {reason.trim().length}/{minLength} ký tự
            </span>
          </div>

          <textarea
            id="dispute-verdict-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Giải thích đánh giá bằng chứng phản bác và lý do duy trì hoặc thu hồi quyết định..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-400 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/40 dark:text-white dark:placeholder-slate-500 dark:focus:border-slate-700 dark:focus:bg-slate-800"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full rounded-xl py-3 text-xs font-bold transition-all shadow-xs ${
            canSubmit
              ? "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 cursor-pointer"
              : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Đang xử lý phán quyết..." : "Xác nhận phán quyết kháng nghị"}
        </button>
      </form>
    </div>
  )
}
