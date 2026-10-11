"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import {
  Buildings,
  IdentificationCard,
  EnvelopeSimple,
  User,
  Phone,
  Globe,
  Headset,
  ChatCircleText,
  FileArrowUp,
  ShieldCheck,
  ShieldWarning,
  ChartLineUp,
  Scales,
  ClockCountdown,
  Info,
  PaperPlaneTilt,
  CheckCircle,
  FileText,
  Trash,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import {
  AuthInput,
  AuthCheckbox,
  PrivilegePill,
  SocialProofBanner,
} from "@/components/features/auth/auth-shared-components"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_ONLY_DIGITS = /^\d+$/
const PUBLIC_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
]

interface PartnerFormState {
  companyName: string
  taxCode: string
  businessEmail: string
  representativeName: string
  contactPhone: string
  officialDomains: string
  officialHotline: string
  smsBrandname: string
  agreeCommitment: boolean
}

interface PartnerFormErrors {
  companyName?: string
  taxCode?: string
  businessEmail?: string
  representativeName?: string
  contactPhone?: string
  officialDomains?: string
  officialHotline?: string
  smsBrandname?: string
  files?: string
  agreeCommitment?: string
}

export function RegisterPartnerForm() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false)

  const [form, setForm] = useState<PartnerFormState>({
    companyName: "",
    taxCode: "",
    businessEmail: "",
    representativeName: "",
    contactPhone: "",
    officialDomains: "",
    officialHotline: "",
    smsBrandname: "",
    agreeCommitment: false,
  })

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<PartnerFormErrors>({})

  function validateField(
    name: keyof PartnerFormState,
    value: unknown
  ): string | undefined {
    switch (name) {
      case "companyName": {
        const val = String(value).trim()
        if (!val) return "Vui lòng nhập tên doanh nghiệp hoặc ngân hàng."
        if (val.length < 3) return "Tên doanh nghiệp phải có ít nhất 3 ký tự."
        return undefined
      }
      case "taxCode": {
        const val = String(value).trim()
        if (!val) return "Vui lòng nhập mã số thuế / mã số doanh nghiệp."
        if (val.length < 9)
          return "Mã số thuế không hợp lệ (thường từ 10 - 13 số)."
        return undefined
      }
      case "businessEmail": {
        const val = String(value).trim()
        if (!val) return "Vui lòng nhập email công vụ của tổ chức."
        if (!EMAIL_REGEX.test(val)) return "Địa chỉ email không đúng định dạng."
        const domain = val.split("@")[1]?.toLowerCase()
        if (domain && PUBLIC_EMAIL_DOMAINS.includes(domain)) {
          return "Hệ thống chỉ chấp nhận email doanh nghiệp (không dùng @gmail, @yahoo,...)."
        }
        return undefined
      }
      case "representativeName": {
        const val = String(value).trim()
        if (!val) return "Vui lòng nhập họ tên & chức vụ người đại diện."
        return undefined
      }
      case "contactPhone": {
        const val = String(value).trim()
        if (!val) return "Vui lòng nhập số điện thoại liên hệ."
        if (!PHONE_ONLY_DIGITS.test(val))
          return "Số điện thoại chỉ bao gồm chữ số."
        if (val.length !== 10) return "Số điện thoại phải gồm đúng 10 số."
        return undefined
      }
      case "officialDomains": {
        const val = String(value).trim()
        if (!val) return "Vui lòng nhập danh sách tên miền chính thống."
        return undefined
      }
      case "officialHotline": {
        const val = String(value).trim()
        if (!val) return "Vui lòng nhập hotline hoặc đầu số tổng đài."
        return undefined
      }
      case "smsBrandname": {
        const val = String(value).trim()
        if (!val) return "Vui lòng nhập tên định danh SMS Brandname."
        return undefined
      }
      case "agreeCommitment": {
        if (!value)
          return "Vui lòng xác nhận cam kết tính chính xác của thông tin."
        return undefined
      }
      default:
        return undefined
    }
  }

  function handleBlur(field: keyof PartnerFormState) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, form[field]),
    }))
  }

  function handleChange<K extends keyof PartnerFormState>(
    field: K,
    value: PartnerFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value),
      }))
    }
  }

  function handleFilesSelect(selected: FileList | null) {
    if (!selected || selected.length === 0) return
    const newFiles = Array.from(selected)
    setFiles((prev) => [...prev, ...newFiles])
    if (errors.files) {
      setErrors((prev) => ({ ...prev, files: undefined }))
    }
  }

  function handleRemoveFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newErrors: PartnerFormErrors = {
      companyName: validateField("companyName", form.companyName),
      taxCode: validateField("taxCode", form.taxCode),
      businessEmail: validateField("businessEmail", form.businessEmail),
      representativeName: validateField(
        "representativeName",
        form.representativeName
      ),
      contactPhone: validateField("contactPhone", form.contactPhone),
      officialDomains: validateField("officialDomains", form.officialDomains),
      officialHotline: validateField("officialHotline", form.officialHotline),
      smsBrandname: validateField("smsBrandname", form.smsBrandname),
      agreeCommitment: validateField("agreeCommitment", form.agreeCommitment),
      files:
        files.length === 0
          ? "Vui lòng tải lên ít nhất 1 tài liệu xác thực pháp lý."
          : undefined,
    }

    setTouched({
      companyName: true,
      taxCode: true,
      businessEmail: true,
      representativeName: true,
      contactPhone: true,
      officialDomains: true,
      officialHotline: true,
      smsBrandname: true,
      agreeCommitment: true,
    })

    setErrors(newErrors)
    const hasError = Object.values(newErrors).some(Boolean)
    if (hasError) return

    // UI-only confirmation as instructed (no API connection)
    setIsSubmittedSuccess(true)
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
      {/* ─── Left Column: Enterprise Partner Privileges Card ─── */}
      <div
        className={cn(
          "relative flex flex-col justify-between overflow-hidden rounded-2xl p-8 sm:p-10 lg:col-span-5",
          "shadow-xl"
        )}
        style={{
          background:
            "linear-gradient(96deg, #131A33 0%, #283044 50%, #000000 100%)",
        }}
      >
        {/* Ambient Glow Orbs */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full opacity-60"
          style={{
            background: "rgba(208, 217, 253, 0.12)",
            filter: "blur(32px)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 size-56 rounded-full opacity-50"
          style={{
            background: "rgba(201, 230, 255, 0.1)",
            filter: "blur(24px)",
          }}
        />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Sentinel Enterprise Rank Badge */}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wider text-[#DBE1FF] uppercase backdrop-blur-md">
              <ShieldCheck size={15} weight="fill" className="text-[#DBE1FF]" />
              <span>ĐỐI TÁC AN NINH SỐ: SENTINEL ENTERPRISE</span>
            </div>
          </div>

          {/* Hero Title & Subtitle */}
          <div className="space-y-2">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-white lg:text-[34px]">
              Bảo vệ thương hiệu & danh tiếng số
            </h2>
            <p className="text-sm leading-relaxed text-[#DAE2FD]/80">
              Đồng hành cùng ScamShield, Trung tâm NCSC & Cục An ninh mạng A05
              bảo vệ khách hàng khỏi nạn lừa đảo giả mạo.
            </p>
          </div>

          {/* Key Privileges Checklist (Enterprise) */}
          <div className="mt-2 flex flex-col gap-3">
            <PrivilegePill
              icon={<ShieldWarning size={20} weight="fill" />}
              title="Bảo vệ thương hiệu trước vấn nạn giả mạo"
              description="Ngăn chặn kịp thời các chiến dịch phishing, SMS Brandname lậu và website lừa đảo mạo danh."
            />
            <PrivilegePill
              icon={<Globe size={20} weight="fill" />}
              title="Cập nhật Whitelist hệ thống toàn quốc"
              description="Đồng bộ hotline, domain và brandname chính chủ tới người dân, nhà mạng và các tổ chức tín dụng."
            />
            <PrivilegePill
              icon={<ChartLineUp size={20} weight="fill" />}
              title="Dashboard giám sát mạo danh Real-time"
              description="Truy cập bảng điều khiển cảnh báo sớm các vector tấn công giả mạo tổ chức theo thời gian thực."
            />
            <PrivilegePill
              icon={<Scales size={20} weight="fill" />}
              title="Hỗ trợ can thiệp pháp lý ưu tiên"
              description="Cơ chế phối hợp xử lý và triệt phá nhanh từ các cơ quan điều tra chuyên trách."
            />
          </div>
        </div>

        {/* Social Proof Footer Banner */}
        <SocialProofBanner
          avatars={[
            { text: "VCB", bg: "#EAEDFF", color: "#131B2E" },
            { text: "BIDV", bg: "#D0D9FD", color: "#555E7D" },
            { text: "TCB", bg: "#C9E6FF", color: "#001E2F" },
          ]}
          badgeText="+520"
          title="520+ Ngân hàng & Tổ chức đã tham gia"
          subtitle="Hệ thống phòng vệ số liên kết chính thức"
        />
      </div>

      {/* ─── Right Column: Enterprise Partner KYB & Whitelist Form ─── */}
      <div className="flex flex-col rounded-2xl border border-[#E2E7FF] bg-white p-6 shadow-sm sm:p-10 lg:col-span-7 dark:border-border dark:bg-card">
        <div className="mx-auto w-full">
          {/* Form Header */}
          <div className="mb-6">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-[#131B2E] dark:text-foreground">
              Đăng Ký Đối Tác Doanh Nghiệp
            </h1>
            <p className="mt-1 text-sm text-[#45464D] dark:text-muted-foreground">
              Bảo vệ thương hiệu, số tổng đài và tên miền chính thống.
            </p>
          </div>

          {/* Success Banner (Mock UI) */}
          {isSubmittedSuccess && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <CheckCircle
                size={24}
                weight="fill"
                className="shrink-0 text-emerald-600 dark:text-emerald-400"
              />
              <div className="text-sm">
                <p className="font-semibold">
                  Đã gửi hồ sơ đối tác thành công (Mô phỏng UI)!
                </p>
                <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                  Hồ sơ và thông tin Whitelist của doanh nghiệp đã được tiếp
                  nhận. Đội ngũ đối soát sẽ phản hồi trong 24 - 48h làm việc.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* ── SECTION 1: Legal Enterprise Info (KYB) ── */}
            <div className="rounded-xl border border-[#EAEDFF] bg-[#F2F3FF]/70 p-4 sm:p-5 dark:border-border dark:bg-muted/40">
              <div className="mb-4 flex items-center gap-2 border-b border-[#EAEDFF] pb-3 dark:border-border">
                <Buildings
                  size={18}
                  weight="bold"
                  className="text-[#131A33] dark:text-foreground"
                />
                <h3 className="text-sm font-bold text-[#131B2E] dark:text-foreground">
                  1. Thông tin pháp lý Doanh nghiệp (KYB)
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                {/* Tên doanh nghiệp */}
                <AuthInput
                  label="Tên doanh nghiệp / Ngân hàng"
                  required
                  icon={<Buildings size={18} weight="regular" />}
                  placeholder="Ví dụ: Ngân hàng TMCP Ngoại thương Việt Nam"
                  value={form.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  onBlur={() => handleBlur("companyName")}
                  error={errors.companyName}
                />

                {/* Mã số thuế & Email doanh nghiệp */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AuthInput
                    label="Mã số thuế / Mã số DN"
                    required
                    icon={<IdentificationCard size={18} weight="regular" />}
                    placeholder="Ví dụ: 0100112437"
                    value={form.taxCode}
                    onChange={(e) => handleChange("taxCode", e.target.value)}
                    onBlur={() => handleBlur("taxCode")}
                    error={errors.taxCode}
                  />

                  <AuthInput
                    label="Email công vụ / doanh nghiệp"
                    required
                    type="email"
                    icon={<EnvelopeSimple size={18} weight="regular" />}
                    placeholder="contact@vietcombank.com.vn"
                    value={form.businessEmail}
                    onChange={(e) =>
                      handleChange("businessEmail", e.target.value)
                    }
                    onBlur={() => handleBlur("businessEmail")}
                    error={errors.businessEmail}
                  />
                </div>

                {/* Chú thích email */}
                <div className="flex items-center gap-2 rounded-lg bg-[#D0D9FD]/30 px-3 py-2 text-xs text-[#545D7C] dark:bg-muted/60 dark:text-muted-foreground">
                  <Info size={15} weight="bold" className="shrink-0" />
                  <span>
                    Lưu ý: Hệ thống chỉ chấp nhận email theo tên miền tổ chức
                    (@domain.com/.vn), không hỗ trợ @gmail.com, @yahoo.com
                  </span>
                </div>

                {/* Người đại diện & SĐT */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AuthInput
                    label="Họ tên & Chức vụ người đại diện"
                    required
                    icon={<User size={18} weight="regular" />}
                    placeholder="Trần Quốc Huy - Trưởng phòng ATTT"
                    value={form.representativeName}
                    onChange={(e) =>
                      handleChange("representativeName", e.target.value)
                    }
                    onBlur={() => handleBlur("representativeName")}
                    error={errors.representativeName}
                  />

                  <AuthInput
                    label="Số điện thoại liên hệ công tác"
                    required
                    type="tel"
                    icon={<Phone size={18} weight="regular" />}
                    placeholder="0912 345 678"
                    value={form.contactPhone}
                    onChange={(e) =>
                      handleChange("contactPhone", e.target.value)
                    }
                    onBlur={() => handleBlur("contactPhone")}
                    error={errors.contactPhone}
                  />
                </div>
              </div>
            </div>

            {/* ── SECTION 2: Whitelist Registration Info ── */}
            <div className="rounded-xl border border-[#EAEDFF] bg-[#F2F3FF]/70 p-4 sm:p-5 dark:border-border dark:bg-muted/40">
              <div className="mb-4 flex items-center gap-2 border-b border-[#EAEDFF] pb-3 dark:border-border">
                <Globe
                  size={18}
                  weight="bold"
                  className="text-[#131A33] dark:text-foreground"
                />
                <h3 className="text-sm font-bold text-[#131B2E] dark:text-foreground">
                  2. Thông tin đăng ký Whitelist (Cần bảo vệ)
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                {/* Domains */}
                <AuthInput
                  label="Danh sách Tên miền chính thống (Official Domains)"
                  required
                  icon={<Globe size={18} weight="regular" />}
                  placeholder="vietcombank.com.vn, vcbdigibank.vietcombank.com.vn"
                  actionLabel="+ Thêm domain"
                  onActionClick={() => {
                    if (
                      form.officialDomains &&
                      !form.officialDomains.endsWith(", ")
                    ) {
                      handleChange(
                        "officialDomains",
                        `${form.officialDomains}, `
                      )
                    }
                  }}
                  value={form.officialDomains}
                  onChange={(e) =>
                    handleChange("officialDomains", e.target.value)
                  }
                  onBlur={() => handleBlur("officialDomains")}
                  error={errors.officialDomains}
                />

                {/* Hotline & SMS Brandname */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AuthInput
                    label="Hotline / Đầu số tổng đài chính thống"
                    required
                    icon={<Headset size={18} weight="regular" />}
                    placeholder="Ví dụ: 1900 545413, 1800 xxxx"
                    value={form.officialHotline}
                    onChange={(e) =>
                      handleChange("officialHotline", e.target.value)
                    }
                    onBlur={() => handleBlur("officialHotline")}
                    error={errors.officialHotline}
                  />

                  <AuthInput
                    label="Tên định danh (SMS Brandname)"
                    required
                    icon={<ChatCircleText size={18} weight="regular" />}
                    placeholder="Ví dụ: VIETCOMBANK, VCB_DIGI"
                    value={form.smsBrandname}
                    onChange={(e) =>
                      handleChange("smsBrandname", e.target.value)
                    }
                    onBlur={() => handleBlur("smsBrandname")}
                    error={errors.smsBrandname}
                  />
                </div>
              </div>
            </div>

            {/* ── SECTION 3: Upload Proof Documents ── */}
            <div className="rounded-xl border border-[#EAEDFF] bg-[#F2F3FF]/70 p-4 sm:p-5 dark:border-border dark:bg-muted/40">
              <div className="mb-4 flex items-center gap-2 border-b border-[#EAEDFF] pb-3 dark:border-border">
                <FileArrowUp
                  size={18}
                  weight="bold"
                  className="text-[#131A33] dark:text-foreground"
                />
                <h3 className="text-sm font-bold text-[#131B2E] dark:text-foreground">
                  3. Tài liệu xác thực pháp lý & chủ quyền (Upload Proof)
                </h3>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragOver(false)
                  handleFilesSelect(e.dataTransfer.files)
                }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "cursor-pointer rounded-xl border-2 border-dashed bg-white p-6 text-center transition-all dark:bg-card",
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-[#C6C6CE] hover:border-[#131A33] dark:border-border dark:hover:border-primary",
                  errors.files && "border-[#BA1A1A]"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFilesSelect(e.target.files)}
                  className="hidden"
                />
                <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-[#EAEDFF] text-[#131A33] dark:bg-muted dark:text-foreground">
                  <FileArrowUp size={24} weight="regular" />
                </div>
                <p className="text-sm font-semibold text-[#131B2E] dark:text-foreground">
                  Kéo thả hồ sơ vào đây hoặc{" "}
                  <span className="text-[#545D7C] underline underline-offset-2 dark:text-primary">
                    Chọn tệp từ thiết bị
                  </span>
                </p>
                <p className="mt-1 text-xs text-[#936ABB] dark:text-muted-foreground">
                  Định dạng hỗ trợ: PDF, JPG, PNG (Dung lượng tối đa: 25MB/tệp)
                </p>
              </div>

              {/* Uploaded File List */}
              {files.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-[#D1DEFF] bg-white px-3 py-2 text-xs dark:border-border dark:bg-card"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={16} className="shrink-0 text-primary" />
                        <span className="truncate font-medium text-[#131B2E] dark:text-foreground">
                          {file.name}
                        </span>
                        <span className="shrink-0 text-[#76767E]">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFile(idx)
                        }}
                        className="text-[#BA1A1A] hover:opacity-80"
                        aria-label="Xóa tệp"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.files && (
                <p className="mt-1.5 text-xs text-[#BA1A1A] dark:text-red-400">
                  {errors.files}
                </p>
              )}

              {/* Checklist Box */}
              <div className="mt-3 rounded-lg bg-[#EAEDFF]/60 p-3 text-xs dark:bg-muted/60">
                <p className="font-semibold text-[#131B2E] dark:text-foreground">
                  YÊU CẦU CUNG CẤP ĐỦ 3 LOẠI TÀI LIỆU:
                </p>
                <ul className="mt-1.5 flex flex-col gap-1 text-[#45464D] dark:text-muted-foreground">
                  <li>1. Giấy phép ĐKKD / Giấy phép hoạt động ngân hàng.</li>
                  <li>
                    2. Hợp đồng thuê đầu số viễn thông / Giấy chứng nhận sở hữu
                    domain / Giấy cấp SMS Brandname.
                  </li>
                  <li>
                    3. Giấy ủy quyền của tổ chức (nếu người đăng ký không phải
                    đại diện pháp luật).
                  </li>
                </ul>
              </div>
            </div>

            {/* ── SECTION 4: Terms, CTA Button & Status Notice ── */}
            <div className="flex flex-col gap-3">
              <AuthCheckbox
                checked={form.agreeCommitment}
                onChange={(val) => handleChange("agreeCommitment", val)}
                error={errors.agreeCommitment}
              >
                Cam kết toàn bộ thông tin kê khai là chính xác và thuộc quyền sở
                hữu hợp pháp của đơn vị.
              </AuthCheckbox>

              {/* Submit CTA */}
              <button
                type="submit"
                className={cn(
                  "flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#131A33] px-6 text-sm font-bold text-white shadow-md transition-all",
                  "hover:bg-[#131A33]/90 active:scale-[0.99] dark:bg-primary dark:hover:bg-primary/90"
                )}
              >
                <PaperPlaneTilt size={18} weight="fill" />
                <span>Gửi Hồ Sơ Đăng Ký Đối Tác</span>
              </button>

              {/* Notice Banner */}
              <div className="flex items-start gap-2.5 rounded-lg bg-[#EAEDFF] p-3 text-xs leading-relaxed text-[#45464D] dark:bg-muted/70 dark:text-muted-foreground">
                <ClockCountdown
                  size={18}
                  weight="bold"
                  className="shrink-0 text-[#131A33] dark:text-foreground"
                />
                <span>
                  Hồ sơ và thông tin Whitelist của Quý đối tác sẽ được Quản trị
                  viên xét duyệt và đối soát trong vòng 24 - 48h làm việc trước
                  khi tài khoản được kích hoạt.
                </span>
              </div>
            </div>

            {/* Form Footer */}
            <div className="border-t border-[#EAEDFF] pt-4 text-center sm:text-left dark:border-border">
              <p className="text-sm text-[#45464D] dark:text-muted-foreground">
                Đã có tài khoản doanh nghiệp?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#131B2E] underline underline-offset-2 hover:opacity-80 dark:text-foreground"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
