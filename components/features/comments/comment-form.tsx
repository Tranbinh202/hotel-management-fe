"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface CommentFormProps {
  onSubmit: (content: string, rating?: number) => void
  isLoading?: boolean
  showRating?: boolean
  placeholder?: string
  submitLabel?: string
}

export function CommentForm({
  onSubmit,
  isLoading = false,
  showRating = true,
  placeholder = "Chia sẻ trải nghiệm của bạn...",
  submitLabel = "Gửi bình luận",
}: CommentFormProps) {
  const [content, setContent] = useState("")
  const [rating, setRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  const handleSubmit = () => {
    if (!content.trim()) return

    onSubmit(content.trim(), showRating && rating ? rating : undefined)
    setContent("")
    setRating(null)
  }

  return (
    <div className="space-y-4">
      {showRating && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Đánh giá của bạn</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(null)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    (hoveredRating !== null ? star <= hoveredRating : star <= (rating || 0))
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="resize-none"
      />

      <Button onClick={handleSubmit} disabled={!content.trim() || isLoading} className="w-full">
        {isLoading ? "Đang gửi..." : submitLabel}
      </Button>
    </div>
  )
}
