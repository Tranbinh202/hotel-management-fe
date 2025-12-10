export interface AccountDTO {
  accountId: number
  fullName: string | null
  email: string | null
  avatar: string | null
}

export interface CommentDTO {
  commentId: number
  roomTypeId: number | null
  replyId: number | null
  accountId: number | null
  content: string | null
  rating: number | null // 1-5 stars
  createdDate: string // ISO 8601 date
  createdTime: string // ISO 8601 datetime
  updatedAt: string // ISO 8601 datetime
  status: "Approved" | "Pending" | "Rejected" | "Hidden" | number // API returns number
  
  // User info from API
  userFullName?: string | null // From Customer or Employee
  userEmail?: string | null // From Account
  userType?: string | null // "Customer" or "Employee"
  
  // Deprecated - kept for backwards compatibility
  account?: AccountDTO | null
  
  replies?: CommentDTO[] // Nested replies (for frontend use)
  inverseReply?: CommentDTO[] // API returns this
  reply?: any
}

export interface AddCommentRequest {
  roomTypeId: number
  replyId?: number | null
  content: string
  rating?: number | null // 1-5
}

export interface UpdateCommentRequest {
  commentId: number
  content: string
  rating?: number | null // 1-5
}

export interface GetCommentRequest {
  roomTypeId?: number | null
  parentCommentId?: number | null
  includeReplies?: boolean // default: true
  maxReplyDepth?: number // default: 3
  pageIndex?: number // default: 1
  pageSize?: number // default: 10
  isNewest?: boolean // default: true
}

export interface CommentResponse {
  comments: CommentDTO[]
  totalCount: number
  pageIndex: number
  pageSize: number
  totalPages: number
}
