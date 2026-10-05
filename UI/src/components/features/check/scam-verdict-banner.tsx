import { ShieldWarning } from "@phosphor-icons/react"
import { Verdict } from "@/features/check/types/check.types"

interface ScamVerdictBannerProps {
  verdict: Verdict
}

export function ScamVerdictBanner({ verdict }: ScamVerdictBannerProps) {
  const isDangerous = verdict.risk_level === "DANGEROUS"

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#FFDAD6] bg-[#FFDAD6]/30 p-6 shadow-xs dark:border-rose-900/40 dark:bg-rose-950/20">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left: Icon & Verdict Details */}
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#BA1A1A] text-white shadow-sm dark:bg-rose-600">
            <ShieldWarning size={32} weight="fill" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#BA1A1A] px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-white" />
              <span>
                {isDangerous
                  ? "Cảnh Báo Lừa Đảo Nguy Cơ Cao (High Risk)"
                  : "Cảnh Báo An Ninh"}
              </span>
            </div>

            <h2 className="font-heading text-lg font-bold text-[#131B2E] dark:text-foreground">
              {verdict.scam_type}
            </h2>

            <p className="max-w-2xl text-xs leading-relaxed text-[#45464D] dark:text-muted-foreground">
              {verdict.summary}
            </p>
          </div>
        </div>

        {/* Right: Score Gauge */}
        <div className="flex shrink-0 flex-col items-start rounded-xl border border-white/60 bg-white/80 p-4 shadow-2xs md:items-end dark:border-border dark:bg-card/80">
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-bold text-[#45464D] uppercase dark:text-muted-foreground">
              Điểm nguy cơ
            </span>
            <span className="font-heading text-3xl font-extrabold text-[#BA1A1A] dark:text-rose-500">
              {verdict.risk_score}
            </span>
            <span className="text-xs font-semibold text-[#45464D] dark:text-muted-foreground">
              / 100
            </span>
          </div>

          {/* Segmented bar */}
          <div className="my-2 flex w-44 gap-1">
            <div className="h-2 flex-1 rounded-xs bg-[#10B981]" />
            <div className="h-2 flex-1 rounded-xs bg-[#84CC16]" />
            <div className="h-2 flex-1 rounded-xs bg-[#F59E0B]" />
            <div className="h-2 flex-1 rounded-xs bg-[#F97316]" />
            <div className="h-2 flex-1 rounded-xs bg-[#BA1A1A] ring-2 ring-[#BA1A1A]/30" />
          </div>

          <span className="text-xs font-bold text-[#BA1A1A] dark:text-rose-500">
            Mức độ: Cực Kỳ Nguy Hiểm
          </span>
        </div>
      </div>
    </div>
  )
}
