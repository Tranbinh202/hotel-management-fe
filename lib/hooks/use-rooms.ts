import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { GetAllRoomsParams, GetRoomParams, roomsApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useRooms(params: Partial<GetAllRoomsParams>) {
  return useInfiniteQuery({
    queryKey: ["rooms"],
    queryFn: () => roomsApi.getAll(params),
    getNextPageParam: (lastPage) => {
      if (lastPage.pageIndex * lastPage.pageSize < lastPage.totalCount) {
        return lastPage.pageIndex + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
  });
}

export function useRoom(params: GetRoomParams) {
  return useQuery({
    queryKey: ["rooms", params],
    queryFn: () => roomsApi.getById(params),
    enabled: !!params.id,
  });
}

export function useAvailableRooms(checkIn: string, checkOut: string) {
  return useQuery({
    queryKey: ["rooms", "available", checkIn, checkOut],
    queryFn: () => roomsApi.getAvailable(checkIn, checkOut),
    enabled: !!checkIn && !!checkOut,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast({
        title: "Thành công",
        description: "Đã thêm phòng mới",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm phòng",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomsApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["rooms", data.roomTypeId] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật phòng",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật phòng",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast({
        title: "Thành công",
        description: "Đã xóa phòng",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa phòng",
        variant: "destructive",
      });
    },
  });
}
