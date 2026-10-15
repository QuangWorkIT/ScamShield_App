"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "react-toastify"
import {
  ModeratorDisputeItem,
  DisputeVerdictPayload,
} from "@/features/moderator/types/moderator-dispute.types"
import {
  getModeratorDisputes,
  submitDisputeVerdict,
} from "@/features/moderator/services/moderator-dispute.service"
import { DisputeQueueItemCard } from "@/components/features/moderator/dispute-queue-item-card"
import { DisputeDetailView } from "@/components/features/moderator/dispute-detail-view"

export default function ModeratorDisputesPage() {
  const [items, setItems] = useState<ModeratorDisputeItem[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadDisputes() {
      setIsLoading(true)
      try {
        const data = await getModeratorDisputes()
        setItems(data)
        if (data.length > 0) {
          setSelectedId(data[0].id)
        }
      } catch (err) {
        toast.error("Không thể tải danh sách hàng chờ khiếu nại")
      } finally {
        setIsLoading(false)
      }
    }
    loadDisputes()
  }, [])

  const pendingCount = useMemo(() => {
    return items.filter((i) => i.status === "Đang xét").length
  }, [items])

  const selectedItem = useMemo(() => {
    return items.find((i) => i.id === selectedId) || items[0] || null
  }, [items, selectedId])

  const handleVerdictSubmitted = async (payload: DisputeVerdictPayload) => {
    try {
      const res = await submitDisputeVerdict(payload)
      if (res.success) {
        toast.success(res.message)
        // Update local item status
        setItems((prev) =>
          prev.map((i) => {
            if (i.id === payload.disputeId) {
              return {
                ...i,
                status: payload.verdict === "RETRACT" ? "Chấp nhận" : "Từ chối",
              }
            }
            return i
          })
        )
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi lưu phán quyết kháng nghị!")
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 lg:flex-row">
      {/* Left Column: Dispute Queue List */}
      <aside className="flex w-full flex-col border-r border-slate-200 bg-white lg:w-96 lg:min-w-[380px] lg:max-w-[420px] dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            DANH SÁCH KHÁNG NGHỊ
          </h2>
          <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            {pendingCount} đang chờ xem xét
          </p>
        </div>

        {/* Scrollable Cards Container */}
        <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              Không có yêu cầu kháng nghị nào trong hàng đợi
            </div>
          ) : (
            items.map((item) => (
              <DisputeQueueItemCard
                key={item.id}
                item={item}
                isSelected={item.id === selectedItem?.id}
                onSelect={(selected) => setSelectedId(selected.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Right Column: Dispute Workspace Detail */}
      <section className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <DisputeDetailView
          item={selectedItem}
          onVerdictSubmitted={handleVerdictSubmitted}
        />
      </section>
    </div>
  )
}
