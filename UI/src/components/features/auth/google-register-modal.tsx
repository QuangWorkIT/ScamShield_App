"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import {
  X,
  Phone,
  ShieldCheck,
  WarningCircle,
  ArrowRight,
  CheckCircle,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { authServices } from "@/features/auth/services/auth-services"
import { decodeGoogleIdToken } from "@/lib/google/google-auth"
import { getRecaptchaToken } from "@/lib/firebase/recaptcha"
import { cn } from "@/lib/utils"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.171 8.368h-.67V8.333H10v3.334h4.709A5.002 5.002 0 0 1 5 10a5 5 0 0 1 5-5c1.275 0 2.434.48 3.317 1.266l2.357-2.357A8.295 8.295 0 0 0 10 1.667a8.333 8.333 0 1 0 8.171 6.7Z"
        fill="#FFC107"
      />
      <path
        d="M2.628 6.121 5.366 8.13A5.002 5.002 0 0 1 10 5c1.275 0 2.434.48 3.317 1.266l2.357-2.357A8.295 8.295 0 0 0 10 1.667a8.329 8.329 0 0 0-7.372 4.454Z"
        fill="#FF3D00"
      />
      <path
        d="M10 18.333a8.294 8.294 0 0 0 5.587-2.163l-2.579-2.183A4.963 4.963 0 0 1 10 15a5.001 5.001 0 0 1-4.701-3.306l-2.72 2.095A8.327 8.327 0 0 0 10 18.333Z"
        fill="#4CAF50"
      />
      <path
        d="M18.171 8.368H17.5V8.333H10v3.334h4.71a5.018 5.018 0 0 1-1.703 2.32l.001-.001 2.58 2.183C15.404 16.336 18.333 14.167 18.333 10c0-.567-.056-1.12-.162-1.632Z"
        fill="#1976D2"
      />
    </svg>
  )
}

const RECAPTCHA_CONTAINER_ID = "google-register-recaptcha"
const OTP_RESEND_SECONDS = 60

interface GoogleRegisterModalProps {
  isOpen: boolean
  onClose: () => void
  idToken: string
  initialPhone?: string
}

export function GoogleRegisterModal({
  isOpen,
  onClose,
  idToken,
  initialPhone = "",
}: GoogleRegisterModalProps) {
  const router = useRouter()
  const payload = decodeGoogleIdToken(idToken)

  const [phone, setPhone] = useState(initialPhone)
  const [otp, setOtp] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [receiveAlerts, setReceiveAlerts] = useState(true)

  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  useEffect(() => {
    if (initialPhone) setPhone(initialPhone)
  }, [initialPhone])

  if (!isOpen) return null

  const googleEmail = payload?.email || "Chưa xác định"
  const googleName = payload?.name || "Người dùng Google"

  async function handleSendOtp() {
    const trimmedPhone = phone.trim()
    if (!/^0\d{9}$/.test(trimmedPhone)) {
      setError("Số điện thoại phải bắt đầu bằng số 0 và gồm đúng 10 chữ số.")
      return
    }

    if (isSendingOtp || cooldown > 0) return

    setIsSendingOtp(true)
    setError(null)

    try {
      let recaptchaToken = "dummy_token"
      try {
        recaptchaToken = await getRecaptchaToken(RECAPTCHA_CONTAINER_ID)
      } catch (e) {
        console.warn("Firebase reCAPTCHA not available or bypassed:", e)
      }
      await authServices.sendPhoneOtp(trimmedPhone, recaptchaToken)
      setOtpSentTo(trimmedPhone)
      setCooldown(OTP_RESEND_SECONDS)
      toast.success("Đã gửi mã OTP đến " + trimmedPhone)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi mã OTP.")
    } finally {
      setIsSendingOtp(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedPhone = phone.trim()
    const trimmedOtp = otp.trim()

    if (!/^0\d{9}$/.test(trimmedPhone)) {
      setError("Số điện thoại phải bắt đầu bằng số 0 và gồm đúng 10 chữ số.")
      return
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError("Mã OTP SMS phải gồm đúng 6 chữ số.")
      return
    }

    if (!agreeTerms) {
      setError("Bạn phải đồng ý với Điều khoản dịch vụ để tiếp tục.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let verificationToken: string | undefined
      try {
        const verifyRes = await authServices.verifyContacts(
          trimmedPhone,
          trimmedOtp
        )
        verificationToken = verifyRes.verificationToken
      } catch {
        // If verifyContacts fails, fallback to direct phoneOtp supported by backend
      }

      await authServices.registerGoogle({
        idToken,
        phoneNumber: trimmedPhone,
        verificationToken,
        phoneOtp: trimmedOtp,
        agreeTerms,
        receiveAlerts,
      })

      toast.success("Đăng ký tài khoản Google thành công!")
      onClose()
      router.push("/user")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
            <GoogleIcon className="size-6" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Hoàn Tất Đăng Ký Với Google
            </h3>
            <p className="text-xs text-muted-foreground">
              Xác thực số điện thoại định danh theo Nghị định 13/2023/NĐ-CP
            </p>
          </div>
        </div>

        {/* Google Account Summary Card */}
        <div className="my-3 flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle size={20} weight="fill" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground">
              {googleName}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {googleEmail}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            Đã xác thực Google
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="my-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-[#BA1A1A] dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
          >
            <WarningCircle size={16} weight="fill" className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {/* Phone Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Số điện thoại chính chủ <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground">
                <Phone size={16} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="0912345678"
                maxLength={10}
                className="h-11 w-full rounded-xl border border-input bg-muted/30 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* OTP Input with Send Button */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Mã xác thực OTP SMS <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground">
                  <ShieldCheck size={16} />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Nhập mã 6 chữ số"
                  maxLength={6}
                  className="h-11 w-full rounded-xl border border-input bg-muted/30 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendOtp}
                disabled={isSendingOtp || cooldown > 0}
                className="h-11 shrink-0 px-4 text-xs font-semibold"
              >
                {isSendingOtp
                  ? "Đang gửi..."
                  : cooldown > 0
                    ? `Gửi lại sau ${cooldown}s`
                    : otpSentTo
                      ? "Gửi lại mã"
                      : "Gửi mã OTP"}
              </Button>
            </div>
            <div id={RECAPTCHA_CONTAINER_ID} />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-2 pt-1 text-xs">
            <label className="flex cursor-pointer items-start gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 size-4 rounded accent-primary"
              />
              <span>
                Tôi đồng ý với{" "}
                <span className="font-semibold text-foreground">
                  Điều khoản sử dụng
                </span>{" "}
                và bảo vệ dữ liệu cá nhân.
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={receiveAlerts}
                onChange={(e) => setReceiveAlerts(e.target.checked)}
                className="mt-0.5 size-4 rounded accent-primary"
              />
              <span>Nhận thông báo và cảnh báo an ninh mạng tức thời.</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                isSubmitting ||
                !phone.trim() ||
                otp.trim().length !== 6 ||
                !agreeTerms
              }
              className="gap-2 font-semibold"
            >
              {isSubmitting ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <ArrowRight size={16} weight="bold" />
              )}
              <span>Hoàn tất đăng ký</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
