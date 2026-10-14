import { RoleGuard } from "@/components/shared/role-guard"
import { ModeratorHeader } from "@/components/layout/moderator/moderator-header"

export default function ModeratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RoleGuard allowedRoles={["MODERATOR"]}>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col dark:bg-slate-950 dark:text-slate-100 antialiased">
        <ModeratorHeader />
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </RoleGuard>
  )
}
