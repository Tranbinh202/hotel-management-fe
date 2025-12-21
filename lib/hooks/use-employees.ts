import { toast } from "@/hooks/use-toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { employeesApi, GetEmployeesParams } from "../api/employees"
import type { EmployeeSearchRequest } from "../types/api"


export function useEmployees(params: GetEmployeesParams) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => employeesApi.getAll(params),
  })
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: () => employeesApi.getById(id),
    enabled: !!id,
  })
}

// Search employees with filters
export function useEmployeeSearch(params: EmployeeSearchRequest) {
  return useQuery({
    queryKey: ["employees", "search", params],
    queryFn: () => employeesApi.search(params),
    // Enable when we have filters set (active status, locked status always passed)
    enabled: true,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: employeesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      toast({
        title: "Thành công",
        description: "Đã thêm nhân viên mới",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm nhân viên",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: employeesApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      queryClient.invalidateQueries({ queryKey: ["employees", data.employeeId] })
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin nhân viên",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật nhân viên",
        variant: "destructive",
      })
    },
  })
}

export function useToggleEmployeeBan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: employeesApi.toggleBan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái nhân viên",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái",
        variant: "destructive",
      })
    },
  })
}

