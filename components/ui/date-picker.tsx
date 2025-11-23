"use client"

import * as React from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, X, CalendarIcon as CalendarIconSolid } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  error?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  minDate,
  maxDate,
  disabled,
  error,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const formatDateRange = () => {
    if (!minDate && !maxDate) return null

    if (minDate && maxDate) {
      return `${format(minDate, "dd/MM/yyyy", { locale: vi })} - ${format(maxDate, "dd/MM/yyyy", { locale: vi })}`
    }
    if (minDate) {
      return `Từ ${format(minDate, "dd/MM/yyyy", { locale: vi })}`
    }
    if (maxDate) {
      return `Đến ${format(maxDate, "dd/MM/yyyy", { locale: vi })}`
    }
    return null
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between text-left font-normal h-10 px-3 transition-colors",
              !value && "text-muted-foreground",
              error && "border-red-500 focus-visible:ring-red-500",
              !error && "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring",
              disabled && "opacity-50 cursor-not-allowed",
              className,
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate">
                {value ? format(value, "dd/MM/yyyy", { locale: vi }) : placeholder}
              </span>
            </div>

            {value && !disabled && (
              <X
                className="h-4 w-4 text-muted-foreground hover:text-foreground flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(undefined)
                }}
              />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          {/* Light header with primary color accent instead of dark gradient */}
          <div className="bg-primary/5 border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <CalendarIconSolid className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">{placeholder}</p>
            </div>

            {formatDateRange() && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">{formatDateRange()}</p>
              </div>
            )}
          </div>

          {/* Clean white background for calendar */}
          <div className="p-3">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(date) => {
                onChange(date)
                setOpen(false)
              }}
              disabled={(date) => {
                if (minDate && date < minDate) return true
                if (maxDate && date > maxDate) return true
                return false
              }}
              initialFocus
            />
          </div>
        </PopoverContent>
      </Popover>

      {error && <p className="text-xs text-red-500 px-1">Vui lòng chọn ngày hợp lệ</p>}
    </div>
  )
}
