import {
  ArrowRight,
  CheckCircle,
  Info,
  ShieldCheck,
  ShieldWarning,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import type { ScamCheckResult } from "@/features/check/types/scam-check.types"
import { cn } from "@/lib/utils"

const appearances = {
  LOW_RISK: {
    title: "Mức độ rủi ro thấp",
    badge: "Ít dấu hiệu rủi ro",
    Icon: ShieldCheck,
    color: "text-emerald-700 dark:text-emerald-400",
    iconSurface: "border-emerald-600/20 bg-emerald-500/10",
    accent: "from-emerald-600 to-emerald-600/40",
    meter: "bg-emerald-600 dark:bg-emerald-400",
    note: "Rủi ro thấp không bảo đảm an toàn tuyệt đối. Luôn xác minh danh tính và yêu cầu giao dịch qua kênh chính thức.",
  },
  SCAM_RISK: {
    title: "Mức độ rủi ro cao",
    badge: "Nguy hiểm — dừng lại",
    Icon: ShieldWarning,
    color: "text-destructive",
    iconSurface: "border-destructive/20 bg-destructive/10",
    accent: "from-destructive to-destructive/40",
    meter: "bg-destructive",
    note: "Rủi ro cao là dấu hiệu cảnh báo. Kết quả phân tích vẫn có thể sai lệch; hãy đối chiếu với nguồn chính thống.",
  },
  UNKNOWN: {
    title: "Chưa đủ cơ sở kết luận",
    badge: "Cần xác minh thêm",
    Icon: WarningCircle,
    color: "text-amber-700 dark:text-amber-400",
    iconSurface: "border-amber-600/20 bg-amber-500/10",
    accent: "from-amber-600 to-amber-600/40",
    meter: "bg-amber-600 dark:bg-amber-400",
    note: "Chưa xác định không có nghĩa là an toàn. Hãy xác minh qua kênh chính thức trước khi chuyển tiền hoặc chia sẻ thông tin.",
  },
}

export function ScamCheckVerdict({ result }: { result: ScamCheckResult }) {
  const appearance =
    result.verdict === "LOW_RISK"
      ? appearances.LOW_RISK
      : result.verdict === "SCAM_RISK"
        ? appearances.SCAM_RISK
        : appearances.UNKNOWN
  const { Icon } = appearance
  const isVisoBert = result.decidedByStage === "VISOBERT"
  const isAi = isVisoBert || result.decidedByStage === "LLM"
  const confidence =
    result.confidence != null &&
    Number.isFinite(result.confidence) &&
    result.confidence >= 0 &&
    result.confidence <= 1
      ? result.confidence
      : null
  const stage =
    {
      BLACKLIST: "Danh sách cảnh báo đã xác minh",
      WHITELIST: "Thông tin đối tác đã xác minh",
      VISOBERT: "Phân tích AI",
      LLM: "Phân tích AI chuyên sâu",
      NONE: "Chưa hoàn tất phân tích",
    }[result.decidedByStage] || "Phân tích nội dung"
  const reasons = isVisoBert
    ? []
    : result.reasons.filter(
        (reason) => reason.detail && reason.code !== "AI_SCAN_ID"
      )
  const guidance =
    result.safetyGuidance
      ?.split(/\r?\n/)
      .map((line) => line.trim().replace(/^(?:[-*•]\s+|\d+[.)]\s+)/, ""))
      .filter(Boolean) || []

  return (
    <section
      aria-labelledby="guest-verdict-title"
      className="relative w-full overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-lg shadow-foreground/5"
    >
      <div
        aria-hidden="true"
        className={cn("h-2 bg-linear-to-r", appearance.accent)}
      />
      <div className="space-y-7 p-5 sm:space-y-8 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase sm:text-sm">
            Kết quả kiểm tra #{result.checkId}
          </p>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground sm:text-sm">
            {isAi ? (
              <Sparkle aria-hidden="true" className="size-4 shrink-0" />
            ) : (
              <ShieldCheck aria-hidden="true" className="size-4 shrink-0" />
            )}
            {stage}
          </span>
        </div>

        <div className="flex items-start gap-4 sm:gap-5">
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-2xl border sm:size-18 sm:rounded-3xl",
              appearance.iconSurface,
              appearance.color
            )}
          >
            <Icon
              aria-hidden="true"
              weight="bold"
              className="size-7 sm:size-9"
            />
          </div>
          <div className="min-w-0 space-y-3 pt-1">
            <h2
              id="guest-verdict-title"
              className="font-heading text-2xl leading-tight font-bold tracking-tight sm:text-4xl"
            >
              {appearance.title}
            </h2>
            <span
              className={cn(
                "inline-flex rounded-full border px-3 py-1 text-xs font-medium sm:text-sm",
                appearance.iconSurface,
                appearance.color
              )}
            >
              {appearance.badge}
            </span>
          </div>
        </div>

        {(confidence != null || isVisoBert) && (
          <div className="space-y-4 rounded-3xl border border-border bg-muted/60 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p
                id="guest-confidence-label"
                className="text-sm font-medium text-muted-foreground sm:text-base"
              >
                Độ tin cậy của kết quả
              </p>
              <p
                className={cn(
                  "font-heading font-bold tabular-nums",
                  confidence != null
                    ? "text-3xl sm:text-4xl"
                    : "text-sm text-muted-foreground"
                )}
              >
                {confidence != null
                  ? confidence.toLocaleString("vi-VN", {
                      style: "percent",
                      maximumFractionDigits: 1,
                    })
                  : "Chưa có thông tin"}
              </p>
            </div>
            {confidence != null && (
              <div
                role="meter"
                aria-labelledby="guest-confidence-label"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Number((confidence * 100).toFixed(1))}
                className="h-2.5 overflow-hidden rounded-full bg-border"
              >
                <div
                  className={cn("h-full rounded-full", appearance.meter)}
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
            )}
          </div>
        )}

        {!isVisoBert && result.explanation && (
          <p className="text-sm leading-relaxed break-words whitespace-pre-line sm:text-base">
            {result.explanation}
          </p>
        )}

        <div className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <Info aria-hidden="true" className="mt-1 size-5 shrink-0" />
          <p>{appearance.note}</p>
        </div>

        {result.matchedIndicator && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/50 p-5 text-sm">
            <div className="min-w-0">
              <span className="font-semibold">Thông tin đối chiếu: </span>
              <span className="font-mono break-all">
                {result.matchedIndicator.value}
              </span>
            </div>
            {(result.decidedByStage === "BLACKLIST" ||
              result.decidedByStage === "WHITELIST") && (
              <Link
                href={{
                  pathname: "/guest/blacklist",
                  query: {
                    search: result.matchedIndicator.value,
                    tab:
                      result.decidedByStage === "WHITELIST"
                        ? "whitelist"
                        : "blacklist",
                  },
                }}
                className={buttonVariants({ variant: "outline" })}
              >
                Xem trong Tài nguyên{" "}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            )}
          </div>
        )}

        {reasons.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold sm:text-base">
              Cơ sở đánh giá
            </h3>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {reasons.map((reason, index) => (
                <li key={`${reason.code}-${index}`} className="break-words">
                  {reason.detail}
                </li>
              ))}
            </ul>
          </div>
        )}

        {guidance.length > 0 && (
          <div className="rounded-3xl border border-border bg-muted/40 p-5 sm:p-6">
            <h3 className="mb-4 text-sm font-semibold sm:text-base">
              Khuyến cáo an toàn
            </h3>
            <ul className="space-y-4">
              {guidance.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm leading-relaxed sm:text-base"
                >
                  <CheckCircle
                    aria-hidden="true"
                    className={cn("mt-1 size-5 shrink-0", appearance.color)}
                  />
                  <span className="min-w-0 break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
