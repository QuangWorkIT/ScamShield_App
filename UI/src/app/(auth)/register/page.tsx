"use client"

import { useState } from "react"
import { User, Buildings } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { RegisterIndividualForm } from "@/components/features/auth/register-individual-form"
import { RegisterPartnerForm } from "@/components/features/auth/register-partner-form"

type RegisterTab = "individual" | "partner"

export default function AuthRegisterPage() {
  const [activeTab, setActiveTab] = useState<RegisterTab>("individual")

  return (
    <div className="w-full py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tab Switcher Navigation Bar */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center rounded-xl border border-[#D1DEFF] bg-[#EAEDFF] p-1.5 shadow-xs dark:border-border dark:bg-muted/80">
            <button
              type="button"
              onClick={() => setActiveTab("individual")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all",
                activeTab === "individual"
                  ? "bg-[#131A33] text-white shadow-xs dark:bg-primary dark:text-primary-foreground"
                  : "text-[#45464D] hover:text-[#131B2E] dark:text-muted-foreground dark:hover:text-foreground"
              )}
            >
              <User size={16} weight="bold" />
              <span>Cá nhân</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("partner")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all",
                activeTab === "partner"
                  ? "bg-[#131A33] text-white shadow-xs dark:bg-primary dark:text-primary-foreground"
                  : "text-[#45464D] hover:text-[#131B2E] dark:text-muted-foreground dark:hover:text-foreground"
              )}
            >
              <Buildings size={16} weight="bold" />
              <span>Doanh nghiệp (Đối tác)</span>
            </button>
          </div>
        </div>

        {/* Cá nhân tab */}
        {activeTab === "individual" && (
          <div>
            <RegisterIndividualForm />
          </div>
        )}

        {/* Doanh nghiệp đối tác tab */}
        {activeTab === "partner" && (
          <div>
            <RegisterPartnerForm />
          </div>
        )}
      </div>
    </div>
  )
}
