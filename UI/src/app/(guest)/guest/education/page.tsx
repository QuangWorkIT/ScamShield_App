"use client"

import React from "react"
import {
  SquaresFour,
  Tag,
  Warning,
  VideoCamera,
  ChatCircleText,
  PhoneCall,
  Eye,
  Target,
  ShieldCheck,
  ArrowClockwise,
  WarningCircle,
} from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEducationHub } from "@/features/education/hooks/use-education-hub"
import type {
  EducationCategory,
  EducationChannelType,
  EducationContent,
} from "@/features/education/types/education.types"

const THEMES = [
  { text: "text-red-500", bg: "bg-red-50" },
  { text: "text-indigo-500", bg: "bg-indigo-50" },
  { text: "text-blue-500", bg: "bg-blue-50" },
  { text: "text-amber-600", bg: "bg-amber-50" },
]

const CHANNEL_ICONS: Record<EducationChannelType, Icon> = {
  SMS: ChatCircleText,
  VIDEO: VideoCamera,
  CHAT: ChatCircleText,
  CALL: PhoneCall,
}

export default function GuestEducationHubPage() {
  const { hub, loading, error, categoryCode, setCategoryCode, reload } =
    useEducationHub()

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-slate-50/50 pb-20 dark:bg-transparent">
      <HeroSection
        categories={hub?.filters.categories ?? []}
        activeCode={categoryCode}
        onSelect={setCategoryCode}
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !hub ? (
        <LibrarySkeleton />
      ) : (
        <LibrarySection
          scenarios={hub.scenarios}
          total={hub.totalScenarios}
          loading={loading}
        />
      )}
    </div>
  )
}

function HeroSection({
  categories,
  activeCode,
  onSelect,
}: {
  categories: EducationCategory[]
  activeCode: string | undefined
  onSelect: (code: string | undefined) => void
}) {
  const filters: { code: string | undefined; label: string; icon: Icon }[] = [
    { code: undefined, label: "Tất cả", icon: SquaresFour },
    ...categories.map((c) => ({ code: c.code, label: c.name, icon: Tag })),
  ]

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-12 pb-8">
      <div className="relative w-full overflow-hidden rounded-lg bg-[#0F172A] p-8 shadow-2xl md:p-12">
        <div className="pointer-events-none absolute top-0 right-0 h-[600px] w-[600px] -translate-y-1/3 translate-x-1/4 rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/4 -translate-x-1/4 rounded-full bg-indigo-500/20 blur-[80px]" />

        <div className="relative z-10 max-w-3xl">
          <h1 className="mb-4 text-3xl leading-tight font-bold tracking-tight text-white md:text-5xl">
            Học Viện Phòng Chống
            <br />
            Lừa Đảo
          </h1>
          <p className="mb-10 max-w-lg text-sm leading-relaxed font-medium text-slate-300 md:text-base">
            Nhận diện thủ đoạn công nghệ cao và bảo vệ gia đình trên không gian
            mạng.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => {
              const active = activeCode === filter.code
              return (
                <button
                  key={filter.code ?? "all"}
                  onClick={() => onSelect(filter.code)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-2.5 py-2.5 text-xs font-bold transition-all duration-200",
                    active
                      ? "border-white bg-white text-slate-900 shadow-md"
                      : "border-slate-700 bg-slate-800/50 text-slate-300 backdrop-blur-sm hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <filter.icon weight={active ? "fill" : "bold"} size={16} />
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function LibrarySection({
  scenarios,
  total,
  loading,
}: {
  scenarios: EducationContent[]
  total: number
  loading: boolean
}) {
  return (
    <section className="mx-auto mb-16 w-full max-w-7xl px-4">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Thư viện giải phẫu thủ đoạn
          </h2>
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Hiển thị {scenarios.length} ca thực địa mới nhất
          {total > scenarios.length ? ` (trên tổng ${total} ca)` : ""}
        </p>
      </div>

      {scenarios.length === 0 ? (
        <p className="py-16 text-center text-sm font-medium text-slate-400">
          Chưa có ca giải phẫu nào trong danh mục này.
        </p>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 gap-6 transition-opacity lg:grid-cols-2",
            loading && "pointer-events-none opacity-60"
          )}
        >
          {scenarios.map((scenario, index) => (
            <ScenarioCard key={scenario.id} scenario={scenario} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}

function HighlightedMessage({
  message,
  highlight,
}: {
  message: string
  highlight?: string
}) {
  if (!highlight || !message.includes(highlight)) return <>{message}</>
  const [before, ...rest] = message.split(highlight)
  return (
    <>
      {before}
      <span className="text-red-500 underline decoration-red-300 underline-offset-2">
        {highlight}
      </span>
      {rest.join(highlight)}
    </>
  )
}

function ScenarioCard({
  scenario,
  index,
}: {
  scenario: EducationContent
  index: number
}) {
  const theme = THEMES[index % THEMES.length]
  const content = scenario.structuredContent
  const example = content?.example
  const ChannelIcon = example?.channelType
    ? CHANNEL_ICONS[example.channelType]
    : ChatCircleText

  const insights = [
    {
      label: "NHẬN DIỆN",
      text: content?.recognitionSigns?.[0],
      icon: Eye,
      color: theme.text,
    },
    {
      label: "MỤC TIÊU",
      text: content?.scammerGoal,
      icon: Target,
      color: "text-orange-500",
    },
    {
      label: "HÀNH ĐỘNG",
      text: content?.recommendedActions?.[0],
      icon: ShieldCheck,
      color: "text-blue-500",
    },
  ].filter((i) => i.text)

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-100 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div
        className={cn(
          "flex items-center justify-between border-b border-black/5 px-7 py-5 md:px-8 dark:border-white/5",
          theme.bg
        )}
      >
        <div className="flex items-center gap-2">
          <Warning weight="fill" className={cn("text-lg", theme.text)} />
          <span
            className={cn(
              "text-[10px] font-bold tracking-widest uppercase",
              theme.text
            )}
          >
            {scenario.tag ?? scenario.category?.name ?? "THỦ ĐOẠN"}
          </span>
        </div>
        {scenario.badgeLabel && (
          <span
            className={cn(
              "rounded-full bg-white px-3 py-1 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase shadow-sm dark:bg-slate-900",
              theme.text
            )}
          >
            {scenario.badgeLabel}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-7 pt-6 md:p-8">
        <h3 className="mb-2 text-[19px] leading-snug font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {scenario.title}
        </h3>
        {scenario.summary && (
          <p className="mb-6 text-[13px] leading-relaxed font-medium text-slate-500 dark:text-slate-400">
            {scenario.summary}
          </p>
        )}

        {example?.message && (
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 dark:border-indigo-700/50 dark:bg-indigo-800/50">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <ChannelIcon weight="fill" className="text-slate-400" />
                {example.senderName}
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {example.displayTime}
              </span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 text-[13px] leading-relaxed font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <HighlightedMessage
                message={example.message}
                highlight={example.highlightedText}
              />
            </div>
          </div>
        )}

        {insights.length > 0 && (
          <div className="mt-auto grid grid-cols-1 gap-3 md:grid-cols-3">
            {insights.map((insight) => (
              <div
                key={insight.label}
                className="flex flex-col rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-700/50 dark:bg-indigo-800/30"
              >
                <div
                  className={cn(
                    "mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase",
                    insight.color
                  )}
                >
                  <insight.icon weight="bold" className="text-sm" />
                  {insight.label}
                </div>
                <p className="text-xs leading-relaxed font-medium text-slate-600 dark:text-slate-400">
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-20 text-center">
      <WarningCircle weight="fill" className="text-5xl text-red-500" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {message}
      </p>
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <ArrowClockwise weight="bold" /> Thử lại
      </Button>
    </div>
  )
}

function LibrarySkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-7xl animate-pulse grid-cols-1 gap-6 px-4 lg:grid-cols-2">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-96 rounded-lg bg-slate-100 dark:bg-slate-800"
        />
      ))}
    </div>
  )
}
