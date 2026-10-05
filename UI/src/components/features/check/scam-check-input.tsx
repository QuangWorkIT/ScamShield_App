"use client"

import { useState } from "react"
import {
  ChatText,
  Link as LinkIcon,
  Phone,
  Scan,
  ImageSquare,
  UploadSimple,
  ClipboardText,
  Trash,
  Notebook,
  Lightning,
  CircleNotch,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { CheckType } from "@/features/check/types/check.types"

interface ScamCheckInputProps {
  onAnalyze: (content: string, type: CheckType) => void
  isLoading?: boolean
}

const SAMPLE_TEXT =
  "Bo Cong An thong bao: So CCCD 00129xxxxxxx cua ong/ba lien quan den du an rua tien xuyen quoc gia chuyen an 892/HS-DT. Yeu cau truy cap https://congan-dichvucong-vneid.cc/xacminh hoac lien he ngay can bo dieu tra qua Zalo 082.491.xxxx de hoan tat thu tuc tam giu tai san."

export function ScamCheckInput({ onAnalyze, isLoading }: ScamCheckInputProps) {
  const [activeTab, setActiveTab] = useState<CheckType>("TEXT")
  const [content, setContent] = useState(SAMPLE_TEXT)

  const tabs: { type: CheckType; label: string; icon: typeof ChatText }[] = [
    {
      type: "TEXT",
      label: "Tin nhắn / Nội dung văn bản (SMS, Zalo, Telegram)",
      icon: ChatText,
    },
    {
      type: "URL",
      label: "Đường dẫn (URL / Domain)",
      icon: LinkIcon,
    },
    {
      type: "PHONE",
      label: "Số điện thoại / Đầu số tổng đài",
      icon: Phone,
    },
    {
      type: "OCR",
      label: "Tải ảnh chụp màn hình (OCR tự động)",
      icon: Scan,
    },
  ]

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setContent(text)
    } catch {
      // Ignore clipboard read error
    }
  }

  const handleClear = () => {
    setContent("")
  }

  const handleLoadSample = () => {
    setContent(SAMPLE_TEXT)
  }

  // Count chars and detect links / phone numbers in text
  const charCount = content.length
  const linksCount = (content.match(/https?:\/\/[^\s]+/g) || []).length
  const phoneCount = (content.match(/(0\d{9,10}|\+84\d{9,10})/g) || []).length

  return (
    <div className="space-y-4">
      {/* 4 Type Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#C6C6CE]/30 pb-3 dark:border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.type
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => setActiveTab(tab.type)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
                isActive
                  ? "border border-[#C6C6CE]/50 bg-white text-[#131B2E] shadow-xs dark:border-border dark:bg-card dark:text-foreground"
                  : "text-[#45464D] hover:bg-[#F2F3FF] hover:text-[#131B2E] dark:text-muted-foreground dark:hover:bg-muted"
              )}
            >
              <Icon
                size={16}
                weight={isActive ? "fill" : "regular"}
                className={isActive ? "text-[#008CC7] dark:text-primary" : ""}
              />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Main Input Box */}
      <div className="rounded-2xl border border-[#C6C6CE]/40 bg-white p-5 shadow-xs dark:border-border dark:bg-card">
        {/* Header / Stats */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
          <div className="flex items-center gap-2">
            <ChatText
              size={16}
              weight="bold"
              className="text-[#131B2E] dark:text-foreground"
            />
            <span className="text-xs font-bold text-[#131B2E] dark:text-foreground">
              Nội dung khả nghi cần phân tích
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#45464D] dark:text-muted-foreground">
            {charCount} ký tự • Đã phát hiện {linksCount} liên kết, {phoneCount}{" "}
            số điện thoại
          </span>
        </div>

        {/* Textarea */}
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nhập hoặc dán nội dung tin nhắn, đường link hoặc số điện thoại đáng ngờ..."
          className="w-full resize-none rounded-xl bg-[#FAF8FF] p-4 text-xs leading-relaxed text-[#131B2E] placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-[#008CC7] focus:outline-hidden dark:bg-muted/40 dark:text-foreground"
        />

        {/* OCR Dropzone */}
        <div className="mt-4 flex flex-col items-center justify-between gap-4 rounded-xl border border-dashed border-[#C6C6CE] bg-[#FAF8FF]/60 p-4 transition-colors hover:border-[#008CC7]/50 sm:flex-row dark:border-border dark:bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E2E7FF] text-[#008CC7] dark:bg-primary/20 dark:text-primary">
              <ImageSquare size={22} weight="fill" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#131B2E] dark:text-foreground">
                Kéo thả ảnh chụp màn hình tin nhắn hoặc biên lai chuyển khoản
              </p>
              <p className="text-[11px] text-[#45464D] dark:text-muted-foreground">
                Hệ thống tự động bóc tách chữ qua OCR quang học (PNG, JPG, HEIC
                tối đa 15MB)
              </p>
            </div>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#C6C6CE]/70 bg-white px-3.5 py-2 text-xs font-bold text-[#131B2E] shadow-2xs hover:bg-[#F2F3FF] dark:border-border dark:bg-muted dark:text-foreground dark:hover:bg-muted/80">
            <UploadSimple size={15} weight="bold" />
            <span>Chọn tệp tin</span>
            <input type="file" accept="image/*" className="hidden" />
          </label>
        </div>

        {/* Action Toolbar & CTA */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#C6C6CE]/30 pt-4 dark:border-border">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#C6C6CE]/60 bg-white px-3 py-1.5 text-xs font-semibold text-[#45464D] hover:bg-[#F2F3FF] hover:text-[#131B2E] dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-muted"
            >
              <ClipboardText size={15} weight="bold" />
              <span>Dán nhanh từ Clipboard</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#C6C6CE]/60 bg-white px-3 py-1.5 text-xs font-semibold text-[#45464D] hover:bg-rose-50 hover:text-rose-600 dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-rose-950/20"
            >
              <Trash size={15} weight="bold" />
              <span>Xóa nội dung</span>
            </button>
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#C6C6CE]/60 bg-white px-3 py-1.5 text-xs font-semibold text-[#45464D] hover:bg-[#F2F3FF] hover:text-[#131B2E] dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-muted"
            >
              <Notebook size={15} weight="bold" />
              <span>Xem các mẫu kịch bản lừa đảo mới nhất</span>
            </button>
          </div>

          <button
            type="button"
            disabled={!content.trim() || isLoading}
            onClick={() => onAnalyze(content, activeTab)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0B132B] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#131B2E] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <CircleNotch size={16} className="animate-spin" />
                <span>Đang giám định...</span>
              </>
            ) : (
              <>
                <Lightning size={16} weight="fill" />
                <span>Phân tích</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
