import { toast } from "@/hooks/use-toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type CalculatePayrollParams, type GetPayrollParams, payrollApi } from "../api/payroll"

export function usePayroll(params: GetPayrollParams) {
  return useQuery({
    queryKey: ["payroll", params],
    queryFn: () => payrollApi.getAll(params),
  })
}

export function usePayrollRecord(id: number) {
  return useQuery({
    queryKey: ["payroll", id],
    queryFn: () => payrollApi.getById(id),
    enabled: !!id,
  })
}

export function useCalculatePayroll(params: CalculatePayrollParams) {
  return useQuery({
    queryKey: ["payroll-calculation", params],
    queryFn: () => payrollApi.calculate(params),
    enabled: !!params.month && !!params.year,
  })
}

export function useCreatePayrollDisbursement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: payrollApi.createDisbursement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] })
      toast({
        title: "Thành công",
        description: "Đã tạo phiếu lương",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo phiếu lương",
        variant: "destructive",
      })
    },
  })
}

export function useApprovePayroll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: payrollApi.approve,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] })
      queryClient.invalidateQueries({ queryKey: ["payroll", data.payrollDisbursementId] })
      toast({
        title: "Thành công",
        description: "Đã duyệt phiếu lương",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể duyệt phiếu lương",
        variant: "destructive",
      })
    },
  })
}

export function useDisbursePayroll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: payrollApi.disburse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] })
      queryClient.invalidateQueries({ queryKey: ["payroll", data.payrollDisbursementId] })
      toast({
        title: "Thành công",
        description: "Đã giải ngân lương",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể giải ngân lương",
        variant: "destructive",
      })
    },
  })
}

export function useDeletePayroll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: payrollApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] })
      toast({
        title: "Thành công",
        description: "Đã xóa phiếu lương",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa phiếu lương",
        variant: "destructive",
      })
    },
  })
}
