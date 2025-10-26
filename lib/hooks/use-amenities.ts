import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import { amenitiesApi, type GetAmenitiesParams } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function useAmenities(params: Partial<GetAmenitiesParams>) {
  return useInfiniteQuery({
    queryKey: ["amenities", params],
    queryFn: ({ pageParam }) =>
      amenitiesApi.getAll({
        ...params,
        PageIndex: pageParam,
      }),
    getNextPageParam: (lastPage) => {
      console.log("lastPage:", lastPage)
      // Check if there are more pages
      if (lastPage.pageIndex < lastPage.totalPages - 1) {
        return lastPage.pageIndex + 1
      }
      return undefined
    },
    initialPageParam: 0,
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
