"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Star, MessageCircle, MoreVertical, Edit, Trash, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CommentDTO } from "@/lib/types/comment"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

interface CommentItemProps {
  comment: CommentDTO
  onReply: (parentCommentId: number, content: string) => void
  onUpdate: (commentId: number, content: string, rating?: number) => void
  onHide: (commentId: number) => void
  isStaff?: boolean
  depth?: number
}

export function CommentItem({ comment, onReply, onUpdate, onHide, isStaff = false, depth = 0 }: CommentItemProps) {
  const { user } = useAuth()
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [editContent, setEditContent] = useState(comment.content || "")
  const [editRating, setEditRating] = useState(comment.rating || null)

  const isOwner = user?.accountId === comment.accountId
  const canEdit = isOwner
  const canHide = isStaff
  const maxDepth = 3

  // Debug log
  console.log("[CommentItem] Rendering:", {
    commentId: comment.commentId,
    userFullName: comment.userFullName,
    accountId: comment.accountId,
    hasReplies: !!comment.replies,
    repliesCount: comment.replies?.length || 0,
  })

  const handleReply = () => {
    if (!replyContent.trim()) return
    onReply(comment.commentId, replyContent.trim())
    setReplyContent("")
    setIsReplying(false)
  }

  const handleUpdate = () => {
    if (!editContent.trim()) return
    onUpdate(comment.commentId, editContent.trim(), editRating || undefined)
    setIsEditing(false)
  }

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-8 md:ml-12")}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={comment.account?.avatar || undefined} />
          <AvatarFallback>
            {(comment.userFullName || comment.account?.fullName || `User${comment.accountId}`)?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {comment.userFullName || comment.account?.fullName || `User #${comment.accountId}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(comment.createdTime), "dd MMM yyyy, HH:mm", { locale: vi })}
                </p>
              </div>

              {(canEdit || canHide) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && (
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                    )}
                    {canHide && (
                      <DropdownMenuItem onClick={() => onHide(comment.commentId)} className="text-destructive">
                        <EyeOff className="h-4 w-4 mr-2" />
                        Ẩn bình luận
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {comment.rating && (
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= comment.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                    )}
                  />
                ))}
              </div>
            )}

            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleUpdate}>
                    Lưu
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
            )}
          </div>

          {!isEditing && (
            <div className="flex gap-4 mt-2">
              {depth < maxDepth && (
                <Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)} className="h-8 px-2">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Phản hồi
                </Button>
              )}
            </div>
          )}

          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viết phản hồi..."
                rows={3}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply}>
                  Gửi
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsReplying(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.commentId}
                  comment={reply}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  onHide={onHide}
                  isStaff={isStaff}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
