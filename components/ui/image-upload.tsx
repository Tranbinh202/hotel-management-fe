"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useUploadImage } from "@/lib/hooks/use-cloudinary"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value?: string[]
    onChange: (urls: string[]) => void
    maxImages?: number
    folder?: string
    className?: string
    disabled?: boolean
}

export function ImageUpload({
    value = [],
    onChange,
    maxImages = 5,
    folder = "amenities",
    className,
    disabled = false,
}: ImageUploadProps) {
    const [previews, setPreviews] = useState<string[]>(value)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const uploadMutation = useUploadImage()

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        // Check if adding these files would exceed maxImages
        if (previews.length + files.length > maxImages) {
            alert(`Bạn chỉ có thể tải lên tối đa ${maxImages} ảnh`)
            return
        }

        // Upload each file
        for (const file of files) {
            try {
                const result = await uploadMutation.mutateAsync({ file, folder })
                const newPreviews = [...previews, result.url]
                setPreviews(newPreviews)
                onChange(newPreviews)
            } catch (error) {
                console.error("Upload failed:", error)
            }
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleRemove = (index: number) => {
        const newPreviews = previews.filter((_, i) => i !== index)
        setPreviews(newPreviews)
        onChange(newPreviews)
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previews.map((url, index) => (
                    <div
                        key={index}
                        className="relative aspect-square rounded-lg border border-border overflow-hidden group"
                    >
                        <Image
                            src={url}
                            alt={`Upload ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            disabled={disabled}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {previews.length < maxImages && (
                    <button
                        type="button"
                        onClick={handleClick}
                        disabled={disabled || uploadMutation.isPending}
                        className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploadMutation.isPending ? (
                            <>
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="text-sm">Đang tải...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-8 h-8" />
                                <span className="text-sm">Tải ảnh lên</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
            />

            <p className="text-sm text-muted-foreground">
                {previews.length}/{maxImages} ảnh • Hỗ trợ: JPG, PNG, GIF (tối đa 10MB)
            </p>
        </div>
    )
}
