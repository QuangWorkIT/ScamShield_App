"use client"

import { useState } from "react"
import { Flag, MagnifyingGlass, Users, X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  DEMO_ACCOUNTS,
  formatAccountDate,
} from "@/features/admin/data/demo-accounts"
import { cn } from "@/lib/utils"
import { AccountRoleBadge, AccountStatusBadge } from "./account-badges"
import { AccountDetailDialog } from "./account-detail-dialog"

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
}

export function AdminAccountsDashboard() {
  const [search, setSearch] = useState("")
  const query = normalizeSearch(search)
  const accounts = DEMO_ACCOUNTS.filter((account) =>
    normalizeSearch(`${account.name} ${account.email} ${account.id}`).includes(
      query
    )
  )
  const flaggedCount = DEMO_ACCOUNTS.filter(
    (account) => account.status === "flagged"
  ).length

  return (
    <section
      aria-labelledby="accounts-heading"
      className="mx-auto max-w-screen-2xl"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            id="accounts-heading"
            className="font-heading text-2xl font-bold tracking-tight"
          >
            Quản lý Tài khoản
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-red-800 dark:text-red-300">
            <Flag size={13} weight="fill" aria-hidden="true" />
            {flaggedCount} tài khoản bị gắn cờ báo cáo hàng loạt
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <MagnifyingGlass
            size={16}
            className="pointer-events-none absolute top-3 left-3 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="admin-account-search" className="sr-only">
            Tìm tài khoản theo tên, email hoặc mã
          </label>
          <input
            id="admin-account-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm tên, email..."
            className="h-10 w-full rounded-lg border border-input bg-card pr-10 pl-9 text-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Xóa tìm kiếm"
              onClick={() => setSearch("")}
              className="absolute top-1 right-1"
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div
          role="region"
          aria-label="Danh sách tài khoản, cuộn ngang để xem đầy đủ"
          tabIndex={0}
          className="overflow-x-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <table className="w-full min-w-4xl border-collapse text-left text-xs">
            <caption className="sr-only">
              Danh sách tài khoản quản trị, dữ liệu minh họa. Hai tài khoản được
              gắn cờ do báo cáo hàng loạt.
            </caption>
            <thead className="border-b border-border bg-muted/30 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              <tr>
                {[
                  "ID",
                  "Tên / Email",
                  "Vai trò",
                  "Tham gia",
                  "Báo cáo",
                  "Trạng thái",
                  "Thao tác",
                ].map((title) => (
                  <th key={title} scope="col" className="px-4 py-3 font-medium">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {accounts.map((account) => (
                <tr
                  key={account.id}
                  className={cn(
                    "transition-colors hover:bg-muted/40",
                    account.status === "flagged" &&
                      "bg-orange-50/80 hover:bg-orange-100/60 dark:bg-amber-950/20 dark:hover:bg-amber-950/40"
                  )}
                >
                  <td className="px-4 py-3.5 text-[11px] text-muted-foreground">
                    #{account.id}
                  </td>
                  <th scope="row" className="px-4 py-3.5 font-normal">
                    <span className="block font-semibold">{account.name}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {account.email}
                    </span>
                  </th>
                  <td className="px-4 py-3.5">
                    <AccountRoleBadge role={account.role} />
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground tabular-nums">
                    {formatAccountDate(account.joinedAt)}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3.5 tabular-nums",
                      account.status === "flagged" &&
                        "font-semibold text-red-800 dark:text-red-300"
                    )}
                  >
                    {account.reports.toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3.5">
                    <AccountStatusBadge status={account.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <AccountDetailDialog account={account} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {accounts.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
            <Users
              size={28}
              className="text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="font-heading text-base font-semibold">
              Không tìm thấy tài khoản
            </h2>
            <p className="text-xs text-muted-foreground">
              Thử tên, email hoặc mã tài khoản khác.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setSearch("")}
            >
              Xóa tìm kiếm
            </Button>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-2 text-[11px] text-muted-foreground">
        <p role="status" aria-live="polite">
          Hiển thị {accounts.length} / {DEMO_ACCOUNTS.length} tài khoản
        </p>
        <p>Dữ liệu minh họa</p>
      </div>
    </section>
  )
}
