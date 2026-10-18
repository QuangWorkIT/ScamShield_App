import { publicApi } from "@/lib/api/instance"
import type { BaseResponse } from "@/features/dashboard/types/dashboard.types"
import type {
  EducationContent,
  EducationFilters,
  EducationHub,
} from "../types/education.types"

export const educationService = {
  getHub: async function (categoryCode?: string): Promise<EducationHub> {
    const response = await publicApi.get<BaseResponse<EducationHub>>(
      "/education-hub",
      { params: categoryCode ? { categoryCode } : undefined }
    )
    return response.data.data
  },

  getFilters: async function (): Promise<EducationFilters> {
    const response =
      await publicApi.get<BaseResponse<EducationFilters>>(
        "/education-hub/filters"
      )
    return response.data.data
  },

  getContentBySlug: async function (slug: string): Promise<EducationContent> {
    const response = await publicApi.get<BaseResponse<EducationContent>>(
      `/education-hub/contents/${slug}`
    )
    return response.data.data
  },
}
