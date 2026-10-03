"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { ShieldCheck, Moon, Sun, ArrowUpRight } from "@phosphor-icons/react"
import { GUEST_NAV_ITEMS } from "@/config/navigation/guest-nav"
import { cn } from "@/lib/utils"

export function GuestHeader() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#C6C6CE]/30 bg-white/90 backdrop-blur-md dark:border-border dark:bg-background/90">
      <div className="max-w-8xl mx-auto flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Main Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/guest" className="group flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#0B132B] text-[#89CEFF] shadow-sm transition-transform group-hover:scale-105 dark:bg-card dark:text-primary">
              <ShieldCheck size={22} weight="fill" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-[#131B2E] dark:text-foreground">
              ScamShield VN
            </span>
          </Link>

          <div className="hidden h-6 w-px bg-[#C6C6CE]/60 md:block dark:bg-border" />

          {/* Navigation Links */}
          <nav className="hidden items-center gap-1.5 md:flex">
            {GUEST_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/guest"
                  ? pathname === "/" ||
                    pathname === "/guest" ||
                    pathname.startsWith("/guest/check")
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                    isActive
                      ? "bg-[#0B132B] text-white shadow-sm dark:bg-primary dark:text-primary-foreground"
                      : "text-[#45464D] hover:bg-[#F2F3FF] hover:text-[#131B2E] dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground"
                  )}
                >
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: User Actions & Theme Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-[#45464D] transition-colors hover:text-[#131B2E] dark:text-muted-foreground dark:hover:text-foreground"
          >
            Đăng nhập
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0B132B] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#111A36] active:scale-95 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          >
            <span>Tạo tài khoản miễn phí</span>
            <ArrowUpRight size={14} weight="bold" />
          </Link>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex size-9 items-center justify-center rounded-full border border-[#C6C6CE]/60 bg-[#E2E7FF]/50 text-[#131B2E] transition-colors hover:bg-[#E2E7FF] dark:border-border dark:bg-muted dark:text-foreground"
            aria-label="Chuyển chế độ sáng/tối"
          >
            <Sun size={17} weight="bold" className="hidden dark:block" />
            <Moon size={17} weight="bold" className="block dark:hidden" />
          </button>
        </div>
      </div>
    </header>
  )
}
