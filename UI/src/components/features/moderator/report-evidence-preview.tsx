"use client"

import { useState } from "react"
import { Image, VideoCamera, FileText, ArrowsOut } from "@phosphor-icons/react"
import { QueueEvidence } from "@/features/moderator/types/moderator.types"

interface ReportEvidencePreviewProps {
  evidences: QueueEvidence[]
  completeness: number
}

export function ReportEvidencePreview({
  evidences,
  completeness,
}: ReportEvidencePreviewProps) {
  const [activeId, setActiveId] = useState<string>(evidences[0]?.id || "")

  const activeEvidence = evidences.find((e) => e.id === activeId) || evidences[0]

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image size={15} weight="bold" className="text-emerald-500" />
      case "video":
        return <VideoCamera size={15} weight="bold" className="text-indigo-500" />
      default:
        return <FileText size={15} weight="bold" className="text-slate-500" />
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <span>BẰNG CHỨNG ĐÍNH KÈM ({evidences.length})</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400">
            ĐIỂM ĐẦY ĐỦ: {completeness}%
          </span>
        </div>
      </div>

      {/* File selector chips */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {evidences.map((ev) => {
          const isActive = ev.id === (activeEvidence?.id || "")
          return (
            <button
              key={ev.id}
              type="button"
              onClick={() => setActiveId(ev.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "border-slate-900 bg-slate-100 text-slate-950 shadow-xs dark:border-white dark:bg-slate-800 dark:text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-slate-700"
              }`}
            >
              {getFileIcon(ev.type)}
              <span>{ev.name}</span>
            </button>
          )
        })}
      </div>

      {/* Dotted Preview Area */}
      <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-10 text-center transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-xs dark:bg-slate-800">
          {activeEvidence?.type === "video" ? (
            <VideoCamera size={32} weight="duotone" className="text-indigo-500" />
          ) : activeEvidence?.type === "pdf" ? (
            <FileText size={32} weight="duotone" className="text-rose-500" />
          ) : (
            <Image size={32} weight="duotone" className="text-emerald-500" />
          )}
        </div>

        <div className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
          {activeEvidence?.name || "Chưa có file đính kèm"}
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <ArrowsOut size={13} />
          <span>Nhấn để xem toàn màn hình</span>
        </p>
      </div>
    </div>
  )
}
