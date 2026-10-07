"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShieldWarning, ArrowLeft, SignOut, House } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth.store"

export function ForbiddenContent() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const clearUser = useAuthStore((state) => state.clearUser)


  const handleLogout = () => {
    clearUser()
    router.push("/login")
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-xl dark:shadow-black/40 sm:p-12">
        <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-red-100 text-[#BA1A1A] dark:bg-red-950/60 dark:text-red-400">
          <ShieldWarning size={48} weight="fill" />
        </div>

        <span className="mt-6 inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#BA1A1A] dark:bg-red-950/40 dark:text-red-400">
          403 • Quyền Truy Cập Bị Từ Chối
        </span>

        <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Không có quyền truy cập
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Trang này bị giới hạn quyền truy cập. Vai trò tài khoản hiện tại của bạn{" "}
          {user?.role ? (
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
              {user.role}
            </span>
          ) : (
            "chưa đăng nhập"
          )}{" "}
          không được phép truy cập vào khu vực này.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {user ? (
            <Button
              onClick={() => router.push(user.role)}
              className="h-11 gap-2 rounded-xl bg-[#0B132B] text-white hover:bg-[#111A36] dark:bg-primary dark:text-primary-foreground"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Về trang của bạn</span>
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/login")}
              className="h-11 gap-2 rounded-xl bg-[#0B132B] text-white hover:bg-[#111A36] dark:bg-primary dark:text-primary-foreground"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Đăng nhập</span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="h-11 gap-2 rounded-xl"
          >
            <House size={16} weight="bold" />
            <span>Trang chủ</span>
          </Button>

          {user && (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="h-11 gap-2 rounded-xl text-destructive hover:bg-destructive/10"
            >
              <SignOut size={16} weight="bold" />
              <span>Đăng xuất</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
