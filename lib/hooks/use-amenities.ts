import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { amenitiesApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function useAmenities() {
  return useQuery({
    queryKey: ["amenities"],
    queryFn: amenitiesApi.getAll,
  })
}

export function useAmenity(id: number) {
  return useQuery({
    queryKey: ["amenities", id],
    queryFn: () => amenitiesApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateAmenity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: amenitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] })
      toast({
        title: "Thành công",
        description: "Đã thêm tiện nghi mới",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm tiện nghi",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateAmenity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: amenitiesApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] })
      queryClient.invalidateQueries({ queryKey: ["amenities", data.amenityId] })
      toast({
        title: "Thành công",
        description: "Đã cập nhật tiện nghi",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật tiện nghi",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteAmenity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: amenitiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] })
      toast({
        title: "Thành công",
        description: "Đã xóa tiện nghi",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa tiện nghi",
        variant: "destructive",
      })
    },
  })
}

export function useToggleAmenityActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: amenitiesApi.toggleActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] })
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái",
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
