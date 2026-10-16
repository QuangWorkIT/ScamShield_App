import type { AdminAccount } from "@/features/admin/data/demo-accounts"
import { cn } from "@/lib/utils"

const roleStyles = {
  partner: {
    label: "Đối tác doanh nghiệp",
    color: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  user: {
    label: "Người dùng",
    color:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  },
  moderator: {
    label: "Kiểm duyệt viên",
    color: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  },
  admin: {
    label: "Quản trị viên",
    color:
      "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  },
}

export function AccountRoleBadge({ role }: { role: AdminAccount["role"] }) {
  const { label, color } = roleStyles[role]
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap",
        color
      )}
    >
      {label}
    </span>
  )
}

export function AccountStatusBadge({
  status,
}: {
  status: AdminAccount["status"]
}) {
  if (status === "flagged") {
    return (
      <div className="flex flex-wrap gap-1">
        <span className="rounded-md bg-red-100 px-2 py-1 text-[11px] font-medium text-red-900 dark:bg-red-950 dark:text-red-200">
          ● Có cờ
        </span>
        <span className="rounded-md bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Báo hàng loạt
        </span>
      </div>
    )
  }
  return (
    <span className="inline-flex rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
      Bình thường
    </span>
  )
}
