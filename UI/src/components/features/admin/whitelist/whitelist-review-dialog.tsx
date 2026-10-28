"use client"

import { useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import {
  ArrowRight,
  CheckCircle,
  FilePdf,
  Globe,
  Phone,
  X,
  XCircle,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import type { WhitelistItem } from "@/features/admin/data/demo-whitelist"
import { WhitelistStatusBadge } from "./whitelist-status-badge"

interface WhitelistReviewDialogProps {
  item: WhitelistItem
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

export function WhitelistReviewDialog({
  item,
  onApprove,
  onReject,
}: WhitelistReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [actionDone, setActionDone] = useState<"approved" | "rejected" | null>(
    null
  )

  const handleApprove = () => {
    onApprove?.(item.id)
    setActionDone("approved")
    setTimeout(() => {
      setOpen(false)
      setActionDone(null)
    }, 1200)
  }

  const handleReject = () => {
    onReject?.(item.id)
    setActionDone("rejected")
    setTimeout(() => {
      setOpen(false)
      setActionDone(null)
    }, 1200)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 border-blue-200 bg-[#EFF6FF] px-2.5 text-xs font-semibold text-[#1D4ED8] hover:bg-blue-100 hover:text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
            aria-label={`Xem xét yêu cầu cho ${item.value}`}
          />
        }
      >
        <span>Xem xét</span>
        <ArrowRight size={12} weight="bold" aria-hidden="true" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[92dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card p-6 text-card-foreground shadow-2xl outline-none">
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Dialog.Title className="font-heading text-lg font-bold">
                  Xem xét yêu cầu Whitelist
                </Dialog.Title>
                <WhitelistStatusBadge status={item.status} />
              </div>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                Mã yêu cầu: {item.id} · Gửi ngày {item.addedAt}
              </Dialog.Description>
            </div>
            <Dialog.Close
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="Đóng hộp thoại"
                />
              }
            >
              <X size={16} />
            </Dialog.Close>
          </div>

          {actionDone ? (
            <div className="my-10 flex flex-col items-center justify-center text-center">
              {actionDone === "approved" ? (
                <>
                  <CheckCircle
                    size={48}
                    weight="fill"
                    className="text-emerald-500"
                  />
                  <p className="mt-3 font-heading text-base font-bold text-emerald-600 dark:text-emerald-400">
                    Đã phê duyệt whitelist thành công!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Thực thể {item.value} đã chuyển sang trạng thái Active.
                  </p>
                </>
              ) : (
                <>
                  <XCircle size={48} weight="fill" className="text-red-500" />
                  <p className="mt-3 font-heading text-base font-bold text-red-600 dark:text-red-400">
                    Đã từ chối yêu cầu whitelist!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Thông báo từ chối đã được ghi nhận.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="mt-5 space-y-5 text-xs">
              {/* Entity info card */}
              <div className="flex items-center gap-3.5 rounded-lg border border-border bg-muted/30 p-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                  {item.type === "hotline" ? (
                    <Phone size={20} weight="duotone" />
                  ) : (
                    <Globe size={20} weight="duotone" />
                  )}
                </div>
                <div>
                  <div className="font-mono text-base font-bold text-foreground">
                    {item.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.type === "hotline" ? "Hotline" : "Domain"} · Tổ chức:{" "}
                    <span className="font-medium text-foreground">
                      {item.organization}
                    </span>
                  </div>
                </div>
              </div>

              {/* Requester Details */}
              {item.requestedBy && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-heading text-xs font-bold tracking-wide text-foreground uppercase">
                    Thông tin đơn vị yêu cầu
                  </h4>
                  <dl className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Người đại diện:</dt>
                      <dd className="font-semibold text-foreground">
                        {item.requestedBy.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        Đơn vị / Ngân hàng:
                      </dt>
                      <dd className="font-semibold text-foreground">
                        {item.requestedBy.organization}
                      </dd>
                    </div>
                    {item.requestedBy.email && (
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">
                          Email công tác:
                        </dt>
                        <dd className="font-mono text-foreground">
                          {item.requestedBy.email}
                        </dd>
                      </div>
                    )}
                    {item.requestedBy.notes && (
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">
                          Ghi chú mục đích:
                        </dt>
                        <dd className="mt-0.5 leading-relaxed text-foreground">
                          {item.requestedBy.notes}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Evidences */}
              {item.evidences && item.evidences.length > 0 && (
                <div>
                  <h4 className="font-heading text-xs font-bold tracking-wide text-foreground uppercase">
                    Hồ sơ bằng chứng đính kèm ({item.evidences.length})
                  </h4>
                  <ul className="mt-2.5 space-y-2">
                    {item.evidences.map((evidence, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FilePdf
                            size={18}
                            weight="fill"
                            className="text-red-500"
                          />
                          <span className="font-medium text-foreground">
                            {evidence.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          Hợp lệ (PDF)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <Dialog.Close
                  render={
                    <Button variant="outline" size="sm" className="text-xs">
                      Đóng
                    </Button>
                  }
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReject}
                  className="text-xs"
                >
                  Từ chối yêu cầu
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleApprove}
                  className="bg-emerald-600 text-xs text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  <CheckCircle size={15} weight="bold" className="mr-1" />
                  Phê duyệt Whitelist
                </Button>
              </div>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
