import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { offlineBookingsApi } from "@/lib/api/offline-bookings"
import { toast } from "@/hooks/use-toast"
import type {
  CreateOfflineBookingDto,
  UpdateOfflineBookingDto,
  ConfirmDepositDto,
  ConfirmPaymentDto,
  OfflineBookingsFilter,
} from "@/lib/types/api"

export function useSearchCustomer(searchTerm: string) {
  return useQuery({
    queryKey: ["customer-search", searchTerm],
    queryFn: () => offlineBookingsApi.searchCustomer(searchTerm),
    enabled: searchTerm.length >= 3,
  })
}

export function useCheckAvailableRooms() {
  return useMutation({
    mutationFn: offlineBookingsApi.checkAvailableRooms,
  })
}

export function useCreateOfflineBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: offlineBookingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offline-bookings"] })
      toast({
        title: "Thành công",
        description: "Đã tạo booking offline thành công",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo booking",
        variant: "destructive",
      })
    },
  })
}

export function useOfflineBooking(id: number) {
  return useQuery({
    queryKey: ["offline-bookings", id],
    queryFn: () => offlineBookingsApi.getById(id),
    enabled: !!id,
  })
}

export function useOfflineBookings(filters: OfflineBookingsFilter) {
  return useQuery({
    queryKey: ["offline-bookings", filters],
    queryFn: () => offlineBookingsApi.getAll(filters),
  })
}

export function useUpdateOfflineBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOfflineBookingDto }) =>
      offlineBookingsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offline-bookings"] })
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin booking",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật booking",
        variant: "destructive",
      })
    },
  })
}

export function useConfirmDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ConfirmDepositDto }) =>
      offlineBookingsApi.confirmDeposit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offline-bookings"] })
      toast({
        title: "Thành công",
        description: "Đã xác nhận thanh toán đặt cọc",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xác nhận đặt cọc",
        variant: "destructive",
      })
    },
  })
}

export function useConfirmPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ConfirmPaymentDto }) =>
      offlineBookingsApi.confirmPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offline-bookings"] })
      toast({
        title: "Thành công",
        description: "Đã xác nhận thanh toán thành công",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xác nhận thanh toán",
        variant: "destructive",
      })
    },
  })
}

export function useCancelOfflineBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      offlineBookingsApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offline-bookings"] })
      toast({
        title: "Thành công",
        description: "Đã hủy booking",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể hủy booking",
        variant: "destructive",
      })
    },
  })
}

export function useResendEmail() {
  return useMutation({
    mutationFn: offlineBookingsApi.resendEmail,
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã gửi lại email xác nhận",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi email",
        variant: "destructive",
      })
    },
  })
}
