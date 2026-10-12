import { RoleGuard } from "@/components/shared/role-guard"

export default function ModeratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RoleGuard allowedRoles={["MODERATOR"]}>
      <div>
        <p>This is moderator layout</p>
        {children}
      </div>
    </RoleGuard>
  )
}
