import { publicApi } from "@/lib/api/instance"
import {
  BlacklistResourceFilterRequest,
  PaginatedBlacklistResponse,
} from "@/types/resource"

export const resourceService = {
  getBlackList: async (
    params?: BlacklistResourceFilterRequest,
    signal?: AbortSignal
  ): Promise<PaginatedBlacklistResponse> => {
    const response = await publicApi.get<PaginatedBlacklistResponse>(
      "/resources/blacklist",
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 5,
          keyword: params?.keyword?.trim() ? params.keyword.trim() : undefined,
          resourceType: params?.resourceType?.trim()
            ? params.resourceType.trim()
            : undefined,
        },
        signal,
      }
    )
    return response.data
  },
}
