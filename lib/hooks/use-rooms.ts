import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type RoomSearchParams,
  roomsApi,
  roomManagementApi,
} from "@/lib/api/rooms";
import { toast } from "@/hooks/use-toast";

export function useRooms(
  params: Partial<RoomSearchParams> = {},
  isPublic = true
) {
  return useQuery({
    queryKey: ["rooms", params, isPublic],
    queryFn: () => roomsApi.search(params, isPublic),
  });
}

export function useRoom(
  id: number,
  checkInDate?: string,
  checkOutDate?: string
) {
  return useQuery({
    queryKey: ["room", id, checkInDate, checkOutDate],
    queryFn: () => roomsApi.getById(id, checkInDate, checkOutDate),
    enabled: !!id,
  });
}

export function useRoomManagement(params: RoomSearchParams = {}) {
  return useQuery({
    queryKey: ["room-management", params],
    queryFn: () => roomManagementApi.search(params),
  });
}

export function useRoomStats() {
  return useQuery({
    queryKey: ["room-stats"],
    queryFn: () => roomManagementApi.getStats(),
  });
}

export function useRoomDetails(roomId: number) {
  return useQuery({
    queryKey: ["room-details", roomId],
    queryFn: () => roomManagementApi.getDetails(roomId),
    enabled: !!roomId,
  });
}

export function useAvailableStatus(roomId: number) {
  return useQuery({
    queryKey: ["room-available-status", roomId],
    queryFn: () => roomManagementApi.getAvailableStatus(roomId),
    enabled: !!roomId,
  });
}

export function useChangeRoomStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomManagementApi.changeStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-management"] });
      queryClient.invalidateQueries({ queryKey: ["room-stats"] });
      queryClient.invalidateQueries({ queryKey: ["room-details"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái phòng",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái phòng",
        variant: "destructive",
      });
    },
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
      queryClient.invalidateQueries({ queryKey: ["rooms", data.roomId] });
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
