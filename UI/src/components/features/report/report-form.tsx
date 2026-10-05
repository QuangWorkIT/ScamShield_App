"use client"

import { useState } from "react"
import {
  Phone,
  Globe,
  Bank,
  ShieldCheck,
  PaperPlaneTilt,
  CloudArrowUp,
  X,
  Plus,
  Shield,
  CircleNotch,
  CheckCircle,
} from "@phosphor-icons/react"
import { ReportThreatTypeSelector } from "./report-threat-type-selector"
import {
  ReportThreatType,
  CreateReportPayload,
} from "@/features/report/types/report.types"

interface ReportFormProps {
  onSubmit: (payload: CreateReportPayload) => Promise<void>
  isLoading?: boolean
}

export function ReportForm({ onSubmit, isLoading }: ReportFormProps) {
  const [threatType, setThreatType] = useState<ReportThreatType>("PHONE")
  const [targetIdentifier, setTargetIdentifier] = useState("028.7109.8821")
  const [category, setCategory] = useState(
    "Mạo danh Cơ quan Nhà nước / Công an / VKSND"
  )
  const [description, setDescription] = useState(
    "Đối tượng mạo danh cán bộ Phòng PC02 đe dọa liên quan vụ án rửa tiền, yêu cầu chuyển 50 triệu sang VietinBank để giám định."
  )
  const [attachments, setAttachments] = useState<string[]>([
    "chung_cu_zalo.jpg",
    "bien_lai_50tr.png",
  ])
  const [isConfirmed, setIsConfirmed] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleRemoveAttachment = (name: string) => {
    setAttachments((prev) => prev.filter((item) => item !== name))
  }

  const handleAddAttachment = () => {
    const newName = `tai_lieu_${attachments.length + 1}.png`
    setAttachments((prev) => [...prev, newName])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConfirmed) return

    await onSubmit({
      threatType,
      targetIdentifier,
      category,
      description,
      attachments,
      isConfirmed,
    })

    setIsSuccess(true)
    setTimeout(() => setIsSuccess(false), 3000)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-[#C6C6CE]/40 bg-white p-6 shadow-xs dark:border-border dark:bg-card"
    >
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-[#C6C6CE]/30 pb-4 dark:border-border">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#0B132B] text-white dark:bg-primary dark:text-primary-foreground">
            <Shield size={20} weight="fill" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-bold text-[#131B2E] dark:text-foreground">
              Biểu Mẫu Tiếp Nhận Báo Cáo
            </h2>
            <p className="text-[11px] text-[#45464D] dark:text-muted-foreground">
              Quy trình 3 bước tinh gọn, bảo mật danh tính người gửi
            </p>
          </div>
        </div>
        <div className="size-2 animate-pulse rounded-full bg-[#10B981]" />
      </div>

      {/* STEP 1: Loại đe dọa */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-[#0B132B] font-heading text-[11px] font-bold text-white dark:bg-primary dark:text-primary-foreground">
            1
          </span>
          <h3 className="text-xs font-bold text-[#131B2E] dark:text-foreground">
            Loại đe dọa
          </h3>
        </div>

        <ReportThreatTypeSelector
          selectedType={threatType}
          onSelect={setThreatType}
        />
      </div>

      {/* STEP 2: Thông tin & Bằng chứng */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-[#0B132B] font-heading text-[11px] font-bold text-white dark:bg-primary dark:text-primary-foreground">
            2
          </span>
          <h3 className="text-xs font-bold text-[#131B2E] dark:text-foreground">
            Thông tin & Bằng chứng
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Target Identifier Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#131B2E] dark:text-foreground">
                Chỉ số mục tiêu <span className="text-[#BA1A1A]">*</span>
              </label>
              <span className="text-[10px] font-semibold text-[#008CC7] dark:text-primary">
                Tự động nhận diện
              </span>
            </div>
            <div className="relative">
              <div className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#45464D] dark:text-muted-foreground">
                {threatType === "PHONE" && <Phone size={16} weight="bold" />}
                {threatType === "WEBSITE" && <Globe size={16} weight="bold" />}
                {threatType === "BANK_ACCOUNT" && (
                  <Bank size={16} weight="bold" />
                )}
              </div>
              <input
                type="text"
                required
                value={targetIdentifier}
                onChange={(e) => setTargetIdentifier(e.target.value)}
                placeholder="Nhập số điện thoại, URL hoặc STK..."
                className="w-full rounded-xl border border-[#C6C6CE]/50 bg-[#FAF8FF] py-2.5 pr-3 pl-10 text-xs font-semibold text-[#131B2E] focus:ring-1 focus:ring-[#008CC7] focus:outline-hidden dark:border-border dark:bg-muted/30 dark:text-foreground"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#131B2E] dark:text-foreground">
              Danh mục thủ đoạn <span className="text-[#BA1A1A]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-[#C6C6CE]/50 bg-[#FAF8FF] px-3 py-2.5 text-xs font-semibold text-[#131B2E] focus:ring-1 focus:ring-[#008CC7] focus:outline-hidden dark:border-border dark:bg-muted/30 dark:text-foreground"
            >
              <option value="Mạo danh Cơ quan Nhà nước / Công an / VKSND">
                Mạo danh Cơ quan Nhà nước / Công an / VKSND
              </option>
              <option value="Website Phishing đánh cắp tài khoản ngân hàng">
                Website Phishing đánh cắp tài khoản ngân hàng
              </option>
              <option value="Tuyển dụng việc nhẹ lương cao / CTV TikTok, Shopee">
                Tuyển dụng việc nhẹ lương cao / CTV TikTok, Shopee
              </option>
              <option value="Lừa đảo đầu tư sàn Forex / Tiền ảo đa cấp">
                Lừa đảo đầu tư sàn Forex / Tiền ảo đa cấp
              </option>
              <option value="Mã độc giả mạo cổng dịch vụ công VNeID">
                Mã độc giả mạo cổng dịch vụ công VNeID
              </option>
            </select>
          </div>
        </div>

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#131B2E] dark:text-foreground">
            Mô tả ngắn gọn hành vi <span className="text-[#BA1A1A]">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết kịch bản, lời nói hoặc bằng chứng lừa đảo..."
            className="w-full resize-none rounded-xl border border-[#C6C6CE]/50 bg-[#FAF8FF] p-3 text-xs leading-relaxed text-[#131B2E] focus:ring-1 focus:ring-[#008CC7] focus:outline-hidden dark:border-border dark:bg-muted/30 dark:text-foreground"
          />
        </div>

        {/* Evidence Attachments Upload Zone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#131B2E] dark:text-foreground">
            Ảnh chụp chứng cứ (Ảnh chat, biên lai, tin nhắn)
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[#C6C6CE] bg-[#FAF8FF]/60 p-3.5 dark:border-border dark:bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#E2E7FF] text-[#008CC7] dark:bg-primary/20 dark:text-primary">
                <CloudArrowUp size={20} weight="fill" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#131B2E] dark:text-foreground">
                  Chọn hoặc kéo thả ảnh chứng cứ
                </p>
                <p className="text-[11px] text-[#45464D] dark:text-muted-foreground">
                  PNG, JPG hoặc PDF (tối đa 10MB)
                </p>
              </div>
            </div>

            {/* Attached Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {attachments.map((file) => (
                <span
                  key={file}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#C6C6CE]/60 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#131B2E] shadow-2xs dark:border-border dark:bg-card dark:text-foreground"
                >
                  <span>{file}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(file)}
                    className="text-[#45464D] hover:text-[#BA1A1A] dark:text-muted-foreground"
                  >
                    <X size={12} weight="bold" />
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={handleAddAttachment}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-[#008CC7] bg-white px-2.5 py-1 text-[11px] font-bold text-[#008CC7] hover:bg-sky-50 dark:border-primary dark:bg-card dark:text-primary dark:hover:bg-primary/10"
              >
                <Plus size={12} weight="bold" />
                <span>Thêm tệp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 3: Xác nhận & Gửi */}
      <div className="space-y-4 border-t border-[#C6C6CE]/30 pt-4 dark:border-border">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-[#0B132B] font-heading text-[11px] font-bold text-white dark:bg-primary dark:text-primary-foreground">
            3
          </span>
          <h3 className="text-xs font-bold text-[#131B2E] dark:text-foreground">
            Xác nhận & Gửi
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-[#00875A] dark:text-emerald-400">
          <ShieldCheck size={16} weight="fill" />
          <span>
            Báo cáo sẽ được kiểm duyệt độc lập trước khi cảnh báo cộng đồng.
          </span>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-[#131B2E] dark:text-foreground">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="size-4 rounded-md border-[#C6C6CE] text-[#0B132B] focus:ring-0 dark:border-border"
          />
          <span>Tôi xác nhận thông tin cung cấp là trung thực.</span>
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!isConfirmed || isLoading}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0B132B] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#131B2E] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <CircleNotch size={16} className="animate-spin" />
                <span>Đang gửi báo cáo...</span>
              </>
            ) : (
              <>
                <PaperPlaneTilt size={16} weight="fill" />
                <span>Gửi Báo Cáo (+50 Điểm)</span>
              </>
            )}
          </button>

          {isSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00875A] dark:text-emerald-400">
              <CheckCircle size={16} weight="fill" />
              <span>Gửi báo cáo thành công! +50 điểm uy tín</span>
            </span>
          )}
        </div>
      </div>
    </form>
  )
}
