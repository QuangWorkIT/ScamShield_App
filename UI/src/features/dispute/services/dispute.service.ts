import { authorizeApi } from "@/lib/api/instance"
import {
  DisputeListItem,
  DisputeSummary,
  DisputeFormResponse,
  SubmitDisputePayload,
  SaveDisputeDraftPayload,
  DisputeListParams,
} from "../types/dispute.types"
import axios from "axios"

export interface PaginatedResult<T> {
  data?: T[]
  content?: T[]
  currentPage?: number
  pageNumber?: number
  pageSize: number
  totalItems?: number
  totalElements?: number
  totalPages: number
  hasNext?: boolean
  hasPrevious?: boolean
  last?: boolean
}

export interface DisputeApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    return data?.message || data?.error || fallback
  }
  return error instanceof Error ? error.message : fallback
}

/**
 * Lấy danh sách hồ sơ khiếu nại của người dùng hiện tại
 */
export async function getMyDisputes(
  params?: DisputeListParams
): Promise<PaginatedResult<DisputeListItem>> {
  try {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    }

    if (params?.status && params.status.length > 0) {
      queryParams.status = params.status.join(",")
    }

    const res = await authorizeApi.get<DisputeApiResponse<PaginatedResult<DisputeListItem>>>(
      "/disputes/me",
      { params: queryParams }
    )

    if (res.data?.success && res.data?.data) {
      return res.data.data
    }

    return {
      data: [],
      content: [],
      currentPage: 0,
      pageNumber: 0,
      pageSize: 10,
      totalItems: 0,
      totalElements: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
      last: true,
    }
  } catch (error) {
    console.error("Lỗi khi tải danh sách khiếu nại:", error)
    throw new Error(extractErrorMessage(error, "Không thể tải danh sách khiếu nại"))
  }
}

/**
 * Lấy thống kê tổng quan các hồ sơ khiếu nại của người dùng hiện tại
 */
export async function getMyDisputeSummary(): Promise<DisputeSummary> {
  try {
    const res = await authorizeApi.get<DisputeApiResponse<DisputeSummary>>(
      "/disputes/me/summary"
    )

    if (res.data?.success && res.data?.data) {
      return res.data.data
    }

    return {
      timezone: "Asia/Ho_Chi_Minh",
      generatedAt: new Date().toISOString(),
      totalSubmitted: 0,
      pending: 0,
      inReview: 0,
      needsMoreInfo: 0,
      approved: 0,
      rejected: 0,
      averageResolutionHours: null,
      restorationRate: null,
    }
  } catch (error) {
    console.error("Lỗi khi tải thống kê khiếu nại:", error)
    throw new Error(extractErrorMessage(error, "Không thể tải thống kê khiếu nại"))
  }
}

/**
 * Gửi hồ sơ khiếu nại trực tiếp (multipart/form-data)
 */
export async function submitDispute(
  payload: SubmitDisputePayload,
  files: File[]
): Promise<DisputeFormResponse> {
  try {
    const formData = new FormData()
    formData.append(
      "request",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    )

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file)
      })
    }

    const res = await authorizeApi.post<DisputeApiResponse<DisputeFormResponse>>(
      "/disputes",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    return res.data.data
  } catch (error) {
    console.error("Lỗi khi gửi hồ sơ khiếu nại:", error)
    throw new Error(extractErrorMessage(error, "Gửi hồ sơ khiếu nại thất bại"))
  }
}

/**
 * Tạo bản nháp khiếu nại mới
 */
export async function createDisputeDraft(
  payload: SaveDisputeDraftPayload,
  files?: File[]
): Promise<DisputeFormResponse> {
  try {
    const formData = new FormData()
    formData.append(
      "request",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    )

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file)
      })
    }

    const res = await authorizeApi.post<DisputeApiResponse<DisputeFormResponse>>(
      "/disputes/drafts",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    return res.data.data
  } catch (error) {
    console.error("Lỗi khi lưu bản nháp:", error)
    throw new Error(extractErrorMessage(error, "Lưu bản nháp thất bại"))
  }
}

/**
 * Cập nhật bản nháp khiếu nại
 */
export async function updateDisputeDraft(
  draftId: number,
  payload: SaveDisputeDraftPayload,
  files?: File[]
): Promise<DisputeFormResponse> {
  try {
    const formData = new FormData()
    formData.append(
      "request",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    )

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file)
      })
    }

    const res = await authorizeApi.put<DisputeApiResponse<DisputeFormResponse>>(
      `/disputes/drafts/${draftId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    return res.data.data
  } catch (error) {
    console.error("Lỗi khi cập nhật bản nháp:", error)
    throw new Error(extractErrorMessage(error, "Cập nhật bản nháp thất bại"))
  }
}

/**
 * Lấy danh sách các bản nháp của người dùng
 */
export async function getMyDrafts(
  page: number = 0,
  size: number = 10
): Promise<PaginatedResult<DisputeFormResponse>> {
  try {
    const res = await authorizeApi.get<DisputeApiResponse<PaginatedResult<DisputeFormResponse>>>(
      "/disputes/drafts",
      { params: { page, size } }
    )

    if (res.data?.success && res.data?.data) {
      return res.data.data
    }

    return {
      content: [],
      pageNumber: 0,
      pageSize: size,
      totalElements: 0,
      totalPages: 0,
      last: true,
    }
  } catch (error) {
    console.error("Lỗi khi tải danh sách bản nháp:", error)
    throw new Error(extractErrorMessage(error, "Không thể tải danh sách bản nháp"))
  }
}

/**
 * Lấy nội dung chi tiết một bản nháp
 */
export async function getDraftDetail(draftId: number): Promise<DisputeFormResponse> {
  try {
    const res = await authorizeApi.get<DisputeApiResponse<DisputeFormResponse>>(
      `/disputes/drafts/${draftId}`
    )
    return res.data.data
  } catch (error) {
    console.error("Lỗi khi tải bản nháp:", error)
    throw new Error(extractErrorMessage(error, "Không thể tải bản nháp"))
  }
}

/**
 * Nộp chính thức từ bản nháp
 */
export async function submitDisputeFromDraft(
  draftId: number,
  payload: SubmitDisputePayload,
  files?: File[]
): Promise<DisputeFormResponse> {
  try {
    const formData = new FormData()
    formData.append(
      "request",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    )

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file)
      })
    }

    const res = await authorizeApi.post<DisputeApiResponse<DisputeFormResponse>>(
      `/disputes/drafts/${draftId}/submit`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    return res.data.data
  } catch (error) {
    console.error("Lỗi khi nộp hồ sơ từ bản nháp:", error)
    throw new Error(extractErrorMessage(error, "Nộp hồ sơ khiếu nại thất bại"))
  }
}
