export interface NavItem {
  title: string
  href: string
  isActive?: boolean
}

export const GUEST_NAV_ITEMS: NavItem[] = [
  {
    title: "Kiểm tra",
    href: "/guest",
    isActive: true,
  },
  {
    title: "Tài nguyên",
    href: "/guest/blacklist",
  },
  {
    title: "Xu hướng lừa đảo",
    href: "/guest/dashboard",
  },
  {
    title: "Cẩm nang an toàn",
    href: "/guest/education",
  },
  {
    title: "Bảng vinh danh",
    href: "/guest/leaderboard",
  },
]
