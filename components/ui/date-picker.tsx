"use client"

import * as React from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"
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

    const parts = []
    if (minDate) {
      parts.push(`Từ ${format(minDate, "dd/MM/yyyy", { locale: vi })}`)
    }
    if (maxDate) {
      parts.push(`đến ${format(maxDate, "dd/MM/yyyy", { locale: vi })}`)
    }
    return parts.join(" ")
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between text-left font-normal h-12 px-4 border-2 transition-all duration-200",
              !value && "text-muted-foreground",
              error && "border-red-500 focus-visible:ring-red-500",
              "hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20",
              disabled && "opacity-50 cursor-not-allowed",
              className,
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {value ? (
                <span className="font-medium">{format(value, "dd/MM/yyyy", { locale: vi })}</span>
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            {value && !disabled && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(undefined)
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 shadow-xl border-2" align="start">
          <div className="luxury-gradient text-white px-4 py-3 rounded-t-lg">
            <p className="font-serif font-semibold text-sm leading-relaxed">{placeholder}</p>
            {formatDateRange() && <p className="text-xs opacity-90 mt-1 leading-relaxed">{formatDateRange()}</p>}
          </div>
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
              className="rounded-md"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
