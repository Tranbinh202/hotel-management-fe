import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { roomTypesApi, type GetAllRoomTypesParams } from "@/lib/api/room-type";
import { toast } from "@/hooks/use-toast";
import type { CreateRoomTypeDto, UpdateRoomTypeDto } from "@/lib/types/api";

export function useRoomTypes(
  params: Omit<GetAllRoomTypesParams, "PageIndex"> = {}
) {
  return useInfiniteQuery({
    queryKey: ["roomTypes", params],
    queryFn: ({ pageParam }) =>
      roomTypesApi.getAll({
        ...params,
        PageIndex: pageParam,
        PageSize: params.PageSize || 10,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.pageIndex < lastPage.totalPages - 1) {
        return lastPage.pageIndex + 1;
      }
      return undefined;
    },
  });
}

export function useRoomType(id: number) {
  return useInfiniteQuery({
    queryKey: ["roomTypes", id],
    queryFn: () => roomTypesApi.getById(id),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.pageIndex < lastPage.totalPages - 1) {
        return lastPage.pageIndex + 1;
      }
      return undefined;
    },
    enabled: !!id,
  });
}

export function useCreateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoomTypeDto) => roomTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
      toast({
        title: "Thành công",
        description: "Đã thêm loại phòng mới",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm loại phòng",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRoomTypeDto) => roomTypesApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật loại phòng",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật loại phòng",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roomTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
      toast({
        title: "Thành công",
        description: "Đã xóa loại phòng",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa loại phòng",
        variant: "destructive",
      });
    },
  });
}
