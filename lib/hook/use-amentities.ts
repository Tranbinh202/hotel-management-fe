import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { amenitiesApi } from "@/lib/api/amenities"
import { toast } from "sonner"

// Query keys
export const amenitiesKeys = {
  all: ["amenities"] as const,
  detail: (id: number) => ["amenities", id] as const,
}

// Hook để lấy danh sách tất cả tiện nghi
export function useAmenities() {
  return useQuery({
    queryKey: amenitiesKeys.all,
    queryFn: amenitiesApi.getAll,
  })
}

// Hook để lấy chi tiết một tiện nghi
export function useAmenity(id: number) {
  return useQuery({
    queryKey: amenitiesKeys.detail(id),
    queryFn: () => amenitiesApi.getById(id),
    enabled: !!id, // Chỉ fetch khi có id
  })
}

// Hook để tạo tiện nghi mới
export function useCreateAmenity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: amenitiesApi.create,
    onSuccess: () => {
      // Invalidate và refetch danh sách tiện nghi
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.all })
      toast.success("Tạo tiện nghi thành công!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo tiện nghi")
    },
  })
}

// Hook để cập nhật tiện nghi
export function useUpdateAmenity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: amenitiesApi.update,
    onSuccess: (data) => {
      // Invalidate cả danh sách và chi tiết
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.all })
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.detail(data.amenityId) })
      toast.success("Cập nhật tiện nghi thành công!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật tiện nghi")
    },
  })
}

// Hook để xóa tiện nghi
export function useDeleteAmenity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: amenitiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.all })
      toast.success("Xóa tiện nghi thành công!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa tiện nghi")
    },
  })
}

// Hook để toggle trạng thái active
export function useToggleAmenityActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: amenitiesApi.toggleActive,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.all })
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.detail(data.amenityId) })
      toast.success("Cập nhật trạng thái thành công!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra")
    },
  })
}
