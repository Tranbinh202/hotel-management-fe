import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { commentApi } from "../api/comment"
import type { CommentDTO, GetCommentRequest } from "../types/comment"
import { toast } from "@/hooks/use-toast"

export function useComments(roomTypeId: number, pageSize: number = 10) {
  const queryClient = useQueryClient()
  const [pageIndex, setPageIndex] = useState(1)

  // Helper function to transform API response
  const transformComment = (comment: CommentDTO): CommentDTO => {
    // API có thể trả về "replies" hoặc "inverseReply"
    const nestedReplies = comment.replies || comment.inverseReply || []
    return {
      ...comment,
      replies: nestedReplies.map(transformComment),
    }
  }

  // Fetch comments for a room type
  const {
    data: commentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["comments", roomTypeId, pageIndex, pageSize],
    queryFn: async () => {
      const params: GetCommentRequest = {
        roomTypeId,
        includeReplies: true,
        maxReplyDepth: 3,
        pageIndex,
        pageSize,
        isNewest: true,
      }
      const response = await commentApi.getComments(params)
      if (!response.isSuccess) {
        throw new Error(response.message || "Không thể tải bình luận")
      }
      
      // Transform comments to ensure replies field exists
      const transformedData = {
        ...response.data,
        comments: response.data.comments.map(transformComment),
      }
      
      console.log("[Comments] Transformed data:", transformedData)
      
      return transformedData
    },
    enabled: !!roomTypeId,
  })

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, rating }: { content: string; rating?: number }) => {
      const response = await commentApi.addComment({
        roomTypeId,
        content,
        rating,
      })
      if (!response.isSuccess) {
        throw new Error(response.message || "Không thể thêm bình luận")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", roomTypeId] })
      toast({
        title: "Thành công",
        description: "Bình luận đã được thêm",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Add reply mutation
  const addReplyMutation = useMutation({
    mutationFn: async ({ parentCommentId, content }: { parentCommentId: number; content: string }) => {
      const response = await commentApi.addComment({
        roomTypeId,
        replyId: parentCommentId,
        content,
      })
      if (!response.isSuccess) {
        throw new Error(response.message || "Không thể thêm phản hồi")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", roomTypeId] })
      toast({
        title: "Thành công",
        description: "Phản hồi đã được thêm",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({
      commentId,
      content,
      rating,
    }: {
      commentId: number
      content: string
      rating?: number
    }) => {
      const response = await commentApi.updateComment({
        commentId,
        content,
        rating,
      })
      if (!response.isSuccess) {
        throw new Error(response.message || "Không thể cập nhật bình luận")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", roomTypeId] })
      toast({
        title: "Thành công",
        description: "Bình luận đã được cập nhật",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Hide comment mutation (staff only)
  const hideCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await commentApi.hideComment(commentId)
      if (!response.isSuccess) {
        throw new Error(response.message || "Không thể ẩn bình luận")
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", roomTypeId] })
      toast({
        title: "Thành công",
        description: "Bình luận đã được ẩn",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return {
    comments: commentsData?.comments || [],
    totalCount: commentsData?.totalCount || 0,
    pageIndex: commentsData?.pageIndex || 1,
    pageSize: commentsData?.pageSize || pageSize,
    totalPages: commentsData?.totalPages || 0,
    isLoading,
    error,
    refetch,
    setPageIndex,
    addComment: addCommentMutation.mutate,
    addReply: addReplyMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    hideComment: hideCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending,
    isAddingReply: addReplyMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    isHidingComment: hideCommentMutation.isPending,
  }
}
