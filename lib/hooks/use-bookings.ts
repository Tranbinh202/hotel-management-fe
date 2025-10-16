import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { bookingsApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: bookingsApi.getAll,
  })
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: () => bookingsApi.getById(id),
    enabled: !!id,
  })
}

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings", "my-bookings"],
    queryFn: bookingsApi.getMyBookings,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      toast({
        title: "Thành công",
        description: "Đã đặt phòng thành công",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đặt phòng",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookingsApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      queryClient.invalidateQueries({ queryKey: ["bookings", data.bookingId] })
      toast({
        title: "Thành công",
        description: "Đã cập nhật đặt phòng",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật đặt phòng",
        variant: "destructive",
      })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      toast({
        title: "Thành công",
        description: "Đã hủy đặt phòng",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể hủy đặt phòng",
        variant: "destructive",
      })
    },
  })
}

export function useConfirmBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookingsApi.confirm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      toast({
        title: "Thành công",
        description: "Đã xác nhận đặt phòng",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xác nhận đặt phòng",
        variant: "destructive",
      })
    },
  })
}
