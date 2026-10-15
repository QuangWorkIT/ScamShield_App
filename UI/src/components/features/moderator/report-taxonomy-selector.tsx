"use client"

import { Tag } from "@phosphor-icons/react"
import { MODERATOR_TAXONOMY_TAGS } from "@/features/moderator/types/moderator.types"

interface ReportTaxonomySelectorProps {
  selectedTags: string[]
  onToggleTag: (tag: string) => void
}

export function ReportTaxonomySelector({
  selectedTags,
  onToggleTag,
}: ReportTaxonomySelectorProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        <Tag size={15} weight="bold" className="text-slate-400" />
        <span>GẮN NHÃN PHÂN LOẠI LỪA ĐẢO (TAXONOMY)</span>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {MODERATOR_TAXONOMY_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-2xs dark:border-blue-600 dark:bg-blue-950/60 dark:text-blue-300 ring-1 ring-blue-500/20"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}
