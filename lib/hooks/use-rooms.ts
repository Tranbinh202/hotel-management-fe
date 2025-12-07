import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import { type GetAllRoomsParams, type GetRoomParams, roomsApi } from "@/lib/api/rooms"
import { toast } from "@/hooks/use-toast"

export function useRooms(params: Partial<GetAllRoomsParams> = {}) {
  return useInfiniteQuery({
    queryKey: ["rooms", params],
    queryFn: ({ pageParam }) => roomsApi.getAll({ ...params, PageIndex: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pageIndex < lastPage.totalPages - 1) {
        return lastPage.pageIndex + 1
      }
      return undefined
    },
    initialPageParam: 1,
  })
}

export function useRoom(params: GetRoomParams) {
  return useQuery({
    queryKey: ["rooms", params],
    queryFn: () => roomsApi.getById(params),
    enabled: !!params.id,
  })
}

export function useAvailableRooms(checkIn: string, checkOut: string) {
  return useQuery({
    queryKey: ["rooms", "available", checkIn, checkOut],
    queryFn: () => roomsApi.getAvailable(checkIn, checkOut),
    enabled: !!checkIn && !!checkOut,
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: roomsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      toast({
        title: "Thành công",
        description: "Đã thêm phòng mới",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm phòng",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: roomsApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      queryClient.invalidateQueries({ queryKey: ["rooms", data.roomId] })
      toast({
        title: "Thành công",
        description: "Đã cập nhật phòng",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật phòng",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: roomsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      toast({
        title: "Thành công",
        description: "Đã xóa phòng",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa phòng",
        variant: "destructive",
      })
    },
  })
}
