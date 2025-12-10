"use client"

import { useState } from "react"
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useComments } from "@/lib/hooks/use-comments"
import { useAuth } from "@/contexts/auth-context"
import { CommentForm } from "./comment-form"
import { CommentItem } from "./comment-item"

interface CommentListProps {
  roomTypeId: number
}

export function CommentList({ roomTypeId }: CommentListProps) {
  const { user } = useAuth()
  const [showCommentForm, setShowCommentForm] = useState(false)

  const {
    comments,
    totalCount,
    pageIndex,
    totalPages,
    isLoading,
    setPageIndex,
    addComment,
    addReply,
    updateComment,
    hideComment,
    isAddingComment,
  } = useComments(roomTypeId)

  const isStaff = user?.roles?.some((role) => ["Receptionist", "Manager", "Admin"].includes(role))

  const handleAddComment = (content: string, rating?: number) => {
    addComment({ content, rating })
    setShowCommentForm(false)
  }

  const handleAddReply = (parentCommentId: number, content: string) => {
    addReply({ parentCommentId, content })
  }

  const handleUpdateComment = (commentId: number, content: string, rating?: number) => {
    updateComment({ commentId, content, rating })
  }

  const handleHideComment = (commentId: number) => {
    if (confirm("Bạn có chắc chắn muốn ẩn bình luận này?")) {
      hideComment(commentId)
    }
  }

  if (isLoading && comments.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            Đánh giá ({totalCount})
          </h3>
        </div>

        {user && (
          <Button onClick={() => setShowCommentForm(!showCommentForm)} variant="outline" size="sm">
            {showCommentForm ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
            {showCommentForm ? "Ẩn form" : "Viết đánh giá"}
          </Button>
        )}
      </div>

      {/* Comment Form */}
      {showCommentForm && user && (
        <Card className="p-4">
          <CommentForm onSubmit={handleAddComment} isLoading={isAddingComment} showRating={true} />
        </Card>
      )}

      {!user && (
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Vui lòng{" "}
            <a href="/login" className="text-primary hover:underline">
              đăng nhập
            </a>{" "}
            để viết đánh giá
          </p>
        </Card>
      )}

      <Separator />

      {/* Comments List with Scroll */}
      <div className="max-h-[600px] overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {comments.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Chưa có đánh giá nào</p>
            <p className="text-sm text-muted-foreground mt-1">Hãy là người đầu tiên đánh giá phòng này!</p>
          </Card>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.commentId}
                comment={comment}
                onReply={handleAddReply}
                onUpdate={handleUpdateComment}
                onHide={handleHideComment}
                isStaff={isStaff}
              />
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(pageIndex - 1)}
            disabled={pageIndex === 1 || isLoading}
          >
            Trang trước
          </Button>
          <div className="flex items-center px-4">
            <span className="text-sm">
              Trang {pageIndex} / {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(pageIndex + 1)}
            disabled={pageIndex === totalPages || isLoading}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  )
}
