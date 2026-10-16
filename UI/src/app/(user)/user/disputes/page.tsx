"use client"

import React, { useState } from "react"
import {
  ShieldCheck,
  FilePlus,
  ListBullets,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { DisputeTrackingView } from "@/components/features/dispute/dispute-tracking-view"
import { DisputeSubmissionForm } from "@/components/features/dispute/dispute-submission-form"

export default function UserDisputesPage() {
  const [activeAction, setActiveAction] = useState<"progress" | "submit">("progress")

  return (
    <div className="w-full max-w-5xl">
      {/* Title Section */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md text-[11px] font-bold">
            <ShieldCheck weight="fill" /> Xác minh chính chủ
          </div>
          <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">
            • Thẩm định độc lập A05/NCSC
          </span>
        </div>
        <h1 className="text-[28px] md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
          Khiếu Nại & Gỡ Nhãn Sai
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-4xl leading-relaxed">
          Hỗ trợ xác minh chính chủ và giải tỏa các số điện thoại, tên miền hoặc số tài khoản bị gán nhãn nhầm vào Blacklist.
        </p>
      </div>

      {/* Action Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => setActiveAction("progress")}
          className={cn(
            "w-full sm:w-auto flex items-center justify-center gap-2 font-bold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-xs",
            activeAction === "progress"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
          )}
        >
          <ListBullets
            weight="bold"
            className={activeAction === "progress" ? "" : "text-slate-500"}
          />
          Tiến Trình Xử Lý Đơn Của Tôi
        </button>

        <button
          type="button"
          onClick={() => setActiveAction("submit")}
          className={cn(
            "w-full sm:w-auto flex items-center justify-center gap-2 font-bold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-xs",
            activeAction === "submit"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
          )}
        >
          <FilePlus
            weight="bold"
            className={activeAction === "submit" ? "" : "text-slate-500"}
          />
          Nộp Đơn Khiếu Nại & Phản Chứng
        </button>
      </div>

      {/* View Content */}
      {activeAction === "progress" ? (
        <DisputeTrackingView onNavigateToSubmit={() => setActiveAction("submit")} />
      ) : (
        <DisputeSubmissionForm onSuccess={() => setActiveAction("progress")} />
      )}
    </div>
  )
}
