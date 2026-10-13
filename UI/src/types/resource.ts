export interface BlackItem {
  id: number
  indicatorId: number
  resourceType: string
  title: string
  severity: string
  severityLabel: string
  description: string
  warningCount: number
  confirmedAt: string
  updatedAt: string
}

export type BlackListItem = BlackItem

export interface BlacklistResourceFilterRequest {
  page?: number
  size?: number
  keyword?: string
  resourceType?: string
}

export interface PaginatedBlacklistResponse {
  data: BlackItem[]
  currentPage: number
  totalItems: number
  totalPages: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}