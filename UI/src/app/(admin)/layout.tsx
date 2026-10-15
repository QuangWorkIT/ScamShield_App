import { RoleGuard } from "@/components/shared/role-guard"
import { AdminDashboardShell } from "@/components/layout/admin/admin-dashboard-shell"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RoleGuard allowedRoles={["ADMINISTRATOR"]}>
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </RoleGuard>
  )
}
