import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { customersApi, type GetCustomersParams } from "@/lib/api/customers"
import { toast } from "@/hooks/use-toast"

export function useCustomers(params: GetCustomersParams) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => customersApi.getAll(params),
  })
}

export function useCustomerDetails(customerId: number, enabled = true) {
  return useQuery({
    queryKey: ["customer-detail", customerId],
    queryFn: () => customersApi.getById(customerId),
    enabled: !!customerId && enabled,
  })
}

export function useToggleCustomerBan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: customersApi.toggleBan,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      if (variables?.customerId) {
        queryClient.invalidateQueries({ queryKey: ["customer-detail", variables.customerId] })
      }
      toast({
        title: "Thành công",
        description: variables?.isLocked ? "Đã khóa tài khoản khách hàng" : "Đã mở khóa tài khoản khách hàng",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật trạng thái khách hàng",
        variant: "destructive",
      })
    },
  })
}
