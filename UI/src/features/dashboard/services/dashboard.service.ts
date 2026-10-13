import { publicApi } from "@/lib/api/instance"
import type {
  BaseResponse,
  ScamDashboardFilterParams,
  ScamDashboardFilters,
  ScamDashboardSummary,
} from "../types/dashboard.types"

function cleanParams(params: ScamDashboardFilterParams) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  )
}

export const dashboardService = {
  getSummary: async function (
    params: ScamDashboardFilterParams = {}
  ): Promise<ScamDashboardSummary> {
    const response = await publicApi.get<BaseResponse<ScamDashboardSummary>>(
      "/dashboard/summary",
      { params: cleanParams(params) }
    )
    return response.data.data
  },

  getFilters: async function (): Promise<ScamDashboardFilters> {
    const response =
      await publicApi.get<BaseResponse<ScamDashboardFilters>>(
        "/dashboard/filters"
      )
    return response.data.data
  },
}
