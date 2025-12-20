import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { bookingsApi, bookingManagementApi } from "@/lib/api/bookings";
import { toast } from "@/hooks/use-toast";
import type {
  BookingManagementFilter,
  UpdateBookingStatusDto,
  CancelBookingDto,
  BookingStatisticsFilter,
} from "@/lib/types/api";

export function useBookings(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: bookingsApi.getAll,
  });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: () => bookingsApi.getById(id),
    enabled: !!id,
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings", "my-bookings"],
    queryFn: bookingsApi.getMyBookings,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Thành công",
        description: "Đã đặt phòng thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đặt phòng",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", data.bookingId] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật đặt phòng",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật đặt phòng",
        variant: "destructive",
      });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Thành công",
        description: "Đã hủy đặt phòng",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể hủy đặt phòng",
        variant: "destructive",
      });
    },
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.confirm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Thành công",
        description: "Đã xác nhận đặt phòng",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xác nhận đặt phòng",
        variant: "destructive",
      });
    },
  });
}

export function useBookingWithKey(id: number, key: string) {
  return useQuery({
    queryKey: ["bookings", id, "verify", key],
    queryFn: () => bookingsApi.getByIdWithKey(id, key),
    enabled: !!id && !!key,
    retry: false,
  });
}

export function useBookingByToken(token: string) {
  return useQuery({
    queryKey: ["bookings", "token", token],
    queryFn: () => bookingsApi.checkBookingByToken(token),
    enabled: !!token,
    retry: false,
  });
}

export function useBookingManagement(filters: BookingManagementFilter) {
  return useInfiniteQuery({
    queryKey: ["booking-management", filters],
    queryFn: ({ pageParam = 1 }) =>
      bookingManagementApi.getBookings({ ...filters, pageNumber: pageParam }),
    getNextPageParam: (lastPage) => lastPage.hasNextPage,
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}

// Hook cho pagination thông thường (không phải infinite scroll)
export function useBookingManagementPaginated(filters: BookingManagementFilter) {
  return useQuery({
    queryKey: ["booking-management-paginated", filters],
    queryFn: () => bookingManagementApi.getBookings(filters),
    refetchOnWindowFocus: false,
  });
}

export function useBookingManagementDetail(id: number) {
  return useQuery({
    queryKey: ["booking-management", id, "detail"],
    queryFn: () => bookingManagementApi.getBookingDetail(id),
    enabled: !!id && id > 0,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBookingStatusDto }) =>
      bookingManagementApi.updateBookingStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-management"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái booking",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái",
        variant: "destructive",
      });
    },
  });
}

export function useCancelBookingManagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancelBookingDto }) =>
      bookingManagementApi.cancelBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-management"] });
      toast({
        title: "Thành công",
        description: "Đã hủy booking",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể hủy booking",
        variant: "destructive",
      });
    },
  });
}

export function useBookingStatistics(filters: BookingStatisticsFilter) {
  return useQuery({
    queryKey: ["booking-statistics", filters],
    queryFn: () => bookingManagementApi.getStatistics(filters),
    enabled: !!filters.fromDate && !!filters.toDate,
  });
}

export function useResendBookingConfirmation() {
  return useMutation({
    mutationFn: (id: number) =>
      bookingManagementApi.resendConfirmationEmail(id),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã gửi lại email xác nhận",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi email",
        variant: "destructive",
      });
    },
  });
}
