export const ADMIN_NAV_ITEMS = [
  { title: "Tài khoản", href: "/admin", iconName: "Users" },
  { title: "Phân loại", href: "/admin/taxonomy", iconName: "Tag" },
  { title: "Whitelist", href: "/admin/whitelist", iconName: "SealCheck" },
  { title: "Phối hợp", href: "/admin/escalations", iconName: "Handshake" },
  { title: "Nội dung", href: "/admin/content/warnings", iconName: "Article" },
  { title: "Rate Limit", href: "/admin/rate-limits", iconName: "Gauge" },
  {
    title: "Nhật ký",
    href: "/admin/audit-logs",
    iconName: "ClockCounterClockwise",
  },
] as const

export function getActiveAdminNavItem(pathname: string) {
  if (pathname === "/admin" || pathname.startsWith("/admin/users")) {
    return ADMIN_NAV_ITEMS[0]
  }
  return [...ADMIN_NAV_ITEMS]
    .filter(
      (item) =>
        item.href !== "/admin" &&
        (pathname === item.href || pathname.startsWith(`${item.href}/`))
    )
    .sort((a, b) => b.href.length - a.href.length)[0]
}
