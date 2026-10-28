import type { WhitelistStatus } from "@/features/admin/data/demo-whitelist"
import { cn } from "@/lib/utils"

const statusStyles: Record<
  WhitelistStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className:
      "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  },
  pending: {
    label: "Pending",
    className:
      "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  },
  suspended: {
    label: "Suspended",
    className:
      "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0] dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  },
}

export function WhitelistStatusBadge({
  status,
  className,
}: {
  status: WhitelistStatus
  className?: string
}) {
  const config = statusStyles[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
