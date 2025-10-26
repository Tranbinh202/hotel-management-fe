export const getDaysBetween = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate
  const end = typeof endDate === "string" ? new Date(endDate) : endDate
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const addDays = (date: string | Date, days: number): Date => {
  const result = typeof date === "string" ? new Date(date) : new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const isDateInRange = (date: string | Date, startDate: string | Date, endDate: string | Date): boolean => {
  const checkDate = typeof date === "string" ? new Date(date) : date
  const start = typeof startDate === "string" ? new Date(startDate) : startDate
  const end = typeof endDate === "string" ? new Date(endDate) : endDate
  return checkDate >= start && checkDate <= end
}

export const formatDateForInput = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toISOString().split("T")[0]
}

export const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0]
}
