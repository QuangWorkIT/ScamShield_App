"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { loadGoogleIdentityScript, getGoogleClientId } from "@/lib/google/google-auth"
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

interface GoogleAuthButtonProps {
  onSuccess: (credential: string) => void
  onError?: (error?: string) => void
  text?: "signin_with" | "signup_with" | "continue_with" | "signin"
  label?: string
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

export function GoogleAuthButton({
  onSuccess,
  onError,
  text = "signin_with",
  label,
  isLoading = false,
  disabled = false,
  className,
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isGisReady, setIsGisReady] = useState(false)
  const clientId = getGoogleClientId()

  useEffect(() => {
    let mounted = true

    async function initGis() {
      if (!clientId) {
        return
      }

      try {
        await loadGoogleIdentityScript()
        if (!mounted || !window.google?.accounts?.id || !containerRef.current) return

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential: string }) => {
            if (response.credential) {
              onSuccess(response.credential)
            } else {
              onError?.("Không nhận được chứng thực từ Google OAuth 2.0")
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        // Clear container before rendering
        if (containerRef.current) {
          containerRef.current.innerHTML = ""
          window.google.accounts.id.renderButton(containerRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text,
            shape: "rectangular",
            logo_alignment: "left",
            width: 380,
            locale: "vi",
          })
          setIsGisReady(true)
        }
      } catch (err) {
        console.error("Lỗi khởi tạo Google OAuth 2.0 GIS:", err)
        onError?.(err instanceof Error ? err.message : "Khởi tạo Google OAuth 2.0 thất bại")
      }
    }

    initGis()

    return () => {
      mounted = false
    }
  }, [clientId, text, onSuccess, onError])

  function handleFallbackClick() {
    if (!clientId) {
      toast.error(
        "Chưa cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID trong biến môi trường. Vui lòng cấu hình Google OAuth 2.0 Client ID để sử dụng."
      )
      return
    }

    // If GIS button is mounted, try finding its internal iframe/button or prompt One Tap
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: unknown) => {
          const n = notification as { isNotDisplayed?: () => boolean; isSkippedMoment?: () => boolean }
          if (n?.isNotDisplayed?.() || n?.isSkippedMoment?.()) {
            toast.info("Vui lòng nhấp trực tiếp vào nút Đăng nhập Google để mở cửa sổ OAuth 2.0.")
          }
        })
      } catch {
        toast.info("Đang kết nối Google OAuth 2.0...")
      }
    }
  }

  const defaultLabel = text === "signup_with" ? "Đăng ký bằng Google" : "Đăng nhập với Google"

  return (
    <div className={cn("relative flex w-full justify-center min-h-[48px]", className)}>
      {/* Container where Google GIS renders its official OAuth 2.0 button */}
      <div
        ref={containerRef}
        className={cn(
          "w-full flex justify-center [&>div]:w-full [&>div>iframe]:!w-full [&>div]:!max-w-none",
          !isGisReady && "hidden"
        )}
      />

      {/* Fallback Custom UI if GIS button is not ready or not yet configured */}
      {!isGisReady && (
        <button
          type="button"
          onClick={handleFallbackClick}
          disabled={disabled || isLoading}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-3 rounded-xl",
            "border border-[#C6C6CE] bg-white text-sm font-bold text-[#131B2E] shadow-sm",
            "transition-all duration-200 hover:bg-[#F2F3FF] active:scale-[0.99]",
            "disabled:opacity-70 disabled:pointer-events-none",
            "dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted"
          )}
        >
          {isLoading ? (
            <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-white" />
          ) : (
            <GoogleIcon className="size-5 shrink-0" />
          )}
          <span>{isLoading ? "Đang kết nối..." : (label || defaultLabel)}</span>
        </button>
      )}
    </div>
  )
}
