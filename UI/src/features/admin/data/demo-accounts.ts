export type AdminAccount = {
  id: string
  name: string
  email: string
  role: "partner" | "user" | "moderator" | "admin"
  joinedAt: string
  reports: number
  status: "active" | "flagged"
}

// Local design fixtures. No account data is fetched or mutated.
export const DEMO_ACCOUNTS: AdminAccount[] = [
  {
    id: "USR001",
    name: "Nguyễn Thanh Hải",
    email: "hai.nguyen@example.com",
    role: "partner",
    joinedAt: "2025-10-01",
    reports: 12,
    status: "active",
  },
  {
    id: "USR002",
    name: "Trần Minh Thu",
    email: "thu.tran@example.com",
    role: "user",
    joinedAt: "2025-10-02",
    reports: 47,
    status: "active",
  },
  {
    id: "USR003",
    name: "mass_reporter_03",
    email: "mass.reporter03@example.com",
    role: "user",
    joinedAt: "2025-10-03",
    reports: 992,
    status: "flagged",
  },
  {
    id: "USR004",
    name: "Lê Văn Cường",
    email: "cuong.le@example.com",
    role: "user",
    joinedAt: "2025-10-04",
    reports: 8,
    status: "active",
  },
  {
    id: "USR005",
    name: "Phạm Thanh Vân",
    email: "van.pham@example.com",
    role: "moderator",
    joinedAt: "2025-10-05",
    reports: 23,
    status: "active",
  },
  {
    id: "USR006",
    name: "auto_reporter_x",
    email: "auto.reporter@example.com",
    role: "user",
    joinedAt: "2025-10-06",
    reports: 2541,
    status: "flagged",
  },
  {
    id: "USR007",
    name: "Hoàng Văn An",
    email: "an.hoang@example.com",
    role: "admin",
    joinedAt: "2025-10-07",
    reports: 0,
    status: "active",
  },
]

export function formatAccountDate(value: string) {
  const [year, month, day] = value.split("-")
  return `${day}/${month}/${year}`
}
