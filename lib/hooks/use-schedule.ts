import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { scheduleApi } from "@/lib/api/schedule"
import { toast } from "@/hooks/use-toast"
import type {
  ScheduleSearchParams,
  CreateScheduleDto,
  UpdateScheduleDto,
  AvailableEmployeesRequest,
} from "@/lib/types/api"

// Get weekly schedule (NEW API)
export function useWeeklySchedule(startDate: string, endDate: string, employeeTypeId?: number) {
  return useQuery({
    queryKey: ["weekly-schedule", startDate, endDate, employeeTypeId],
    queryFn: () => scheduleApi.getWeeklySchedule(startDate, endDate, employeeTypeId),
    enabled: !!startDate && !!endDate,
  })
}

// Get available employees for a shift (NEW API)
export function useAvailableEmployees(params: AvailableEmployeesRequest) {
  return useQuery({
    queryKey: ["available-employees", params],
    queryFn: () => scheduleApi.getAvailableEmployees(params),
    enabled: !!params.shiftDate && !!params.startTime && !!params.endTime,
  })
}

// Get schedules with filters (legacy)
export function useSchedules(params: ScheduleSearchParams = {}) {
  return useQuery({
    queryKey: ["schedules", params],
    queryFn: () => scheduleApi.getSchedules(params),
  })
}

// Get schedule by ID
export function useSchedule(id: number) {
  return useQuery({
    queryKey: ["schedule", id],
    queryFn: () => scheduleApi.getById(id),
    enabled: !!id,
  })
}

// Get all active employees
export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => scheduleApi.getEmployees(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create schedule
export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateScheduleDto) => scheduleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
      queryClient.invalidateQueries({ queryKey: ["weekly-schedule"] })
      toast({
        title: "Thành công",
        description: "Đã thêm lịch làm việc",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm lịch làm việc",
        variant: "destructive",
      })
    },
  })
}

// Create multiple schedules
export function useCreateBulkSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (schedules: CreateScheduleDto[]) => scheduleApi.createBulk(schedules),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
      queryClient.invalidateQueries({ queryKey: ["weekly-schedule"] })
      toast({
        title: "Thành công",
        description: `Đã thêm ${data.length} lịch làm việc`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm lịch làm việc",
        variant: "destructive",
      })
    },
  })
}

// Update schedule
export function useUpdateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateScheduleDto) => scheduleApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
      queryClient.invalidateQueries({ queryKey: ["weekly-schedule"] })
      toast({
        title: "Thành công",
        description: "Đã cập nhật lịch làm việc",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật lịch làm việc",
        variant: "destructive",
      })
    },
  })
}

// Delete schedule
export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => scheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
      queryClient.invalidateQueries({ queryKey: ["weekly-schedule"] })
      toast({
        title: "Thành công",
        description: "Đã xóa lịch làm việc",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa lịch làm việc",
        variant: "destructive",
      })
    },
  })
}

