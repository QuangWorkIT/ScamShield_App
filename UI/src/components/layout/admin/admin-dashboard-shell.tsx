"use client"

import { useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { List, X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { AdminSidebar } from "./admin-sidebar"

export function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#admin-content"
        className="sr-only z-50 rounded-md bg-card p-3 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Đến nội dung chính
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-border md:block">
        <AdminSidebar />
      </aside>
      <div className="border-b border-border bg-card px-4 py-3 md:hidden">
        <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Dialog.Trigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Mở điều hướng quản trị"
              />
            }
          >
            <List size={22} />
          </Dialog.Trigger>
          <span className="ml-3 font-heading text-sm font-bold">
            ScamShield · Quản trị
          </span>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40" />
            <Dialog.Popup className="fixed inset-y-0 left-0 z-50 w-64 bg-card outline-none">
              <Dialog.Title className="sr-only">
                Điều hướng quản trị
              </Dialog.Title>
              <Dialog.Close
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    aria-label="Đóng điều hướng"
                  />
                }
              >
                <X size={18} />
              </Dialog.Close>
              <AdminSidebar onNavigate={() => setMenuOpen(false)} />
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <main
        id="admin-content"
        tabIndex={-1}
        className="min-w-0 px-4 py-6 outline-none sm:px-6 md:ml-56 md:px-8 md:py-10 lg:px-10"
      >
        {children}
      </main>
    </div>
  )
}
