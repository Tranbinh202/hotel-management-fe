"use client"

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: boolean
  activeText?: string
  inactiveText?: string
  onClick?: () => void
  className?: string
}

export function StatusBadge({
  status,
  activeText = "Hoạt động",
  inactiveText = "Tạm dừng",
  onClick,
  className,
}: StatusBadgeProps) {
  const Component = onClick ? "button" : "span"

  return (
    <Component
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors",
        status ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-slate-100 text-slate-800 hover:bg-slate-200",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {status ? activeText : inactiveText}
    </Component>
  )
}
