import { UserDashboardShell } from "@/components/layout/user/user-dashboard-shell"

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <UserDashboardShell>{children}</UserDashboardShell>
}
