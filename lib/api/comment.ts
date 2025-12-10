import { apiClient } from "./client"
import type { ApiResponse } from "../types/api"
import type {
  CommentDTO,
  CommentResponse,
  AddCommentRequest,
  UpdateCommentRequest,
  GetCommentRequest,
} from "../types/comment"

export const commentApi = {
  /**
   * Get comments by room type ID or parent comment ID
   */
  getComments: async (params: GetCommentRequest): Promise<ApiResponse<CommentResponse>> => {
    const queryParams = new URLSearchParams()

    if (params.roomTypeId) queryParams.append("RoomTypeId", params.roomTypeId.toString())
    if (params.parentCommentId) queryParams.append("ParentCommentId", params.parentCommentId.toString())
    if (params.includeReplies !== undefined) queryParams.append("IncludeReplies", params.includeReplies.toString())
    if (params.maxReplyDepth) queryParams.append("MaxReplyDepth", params.maxReplyDepth.toString())
    if (params.pageIndex) queryParams.append("PageIndex", params.pageIndex.toString())
    if (params.pageSize) queryParams.append("PageSize", params.pageSize.toString())
    if (params.isNewest !== undefined) queryParams.append("IsNewest", params.isNewest.toString())

    return apiClient.get<ApiResponse<CommentResponse>>(`/Comment?${queryParams.toString()}`)
  },

  /**
   * Add a new comment or reply (requires authentication)
   */
  addComment: async (data: AddCommentRequest): Promise<ApiResponse<number>> => {
    return apiClient.post<ApiResponse<number>>("/Comment", data)
  },

  /**
   * Update an existing comment (requires authentication & ownership)
   */
  updateComment: async (data: UpdateCommentRequest): Promise<ApiResponse<null>> => {
    return apiClient.put<ApiResponse<null>>("/Comment", data)
  },

  /**
   * Hide a comment (requires staff role: Receptionist, Manager, or Admin)
   */
  hideComment: async (commentId: number): Promise<ApiResponse<null>> => {
    return apiClient.patch<ApiResponse<null>>(`/Comment/${commentId}/hide`)
  },
}
