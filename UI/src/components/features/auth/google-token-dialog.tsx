"use client"

import { useState } from "react"
import { WarningCircle, Key, X, ArrowRight } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

interface GoogleTokenDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (idToken: string) => void
  title?: string
  description?: string
  isLoading?: boolean
}

export function GoogleTokenDialog({
  isOpen,
  onClose,
  onSubmit,
  title = "Xác thực Google ID Token",
  description = "Chưa phát hiện biến môi trường NEXT_PUBLIC_GOOGLE_CLIENT_ID. Bạn có thể nhập Google ID Token (JWT) để kiểm thử API trực tiếp.",
  isLoading = false,
}: GoogleTokenDialogProps) {
  const [tokenInput, setTokenInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = tokenInput.trim()
    if (!trimmed) {
      setError("Vui lòng dán Google ID Token.")
      return
    }
    setError(null)
    onSubmit(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 pb-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Key size={20} weight="fill" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground">
              Chế độ kiểm thử tích hợp Google OAuth
            </p>
          </div>
        </div>

        <p className="py-2 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>

        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Google ID Token (JWT)
            </label>
            <textarea
              rows={4}
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value)
                if (error) setError(null)
              }}
              placeholder="eyJhbGciOiJSUzI1NiIsImtpZCI6..."
              className="w-full rounded-xl border border-input bg-muted/40 p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <WarningCircle size={14} weight="fill" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !tokenInput.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <ArrowRight size={16} weight="bold" />
              )}
              <span>Xác nhận & Gửi API</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
