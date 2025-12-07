import { useInfiniteQuery } from "@tanstack/react-query"
import { roomManagementApi, RoomSearchParams } from "../api"

export const useGetRooms = (params: Partial<RoomSearchParams>) => {
    return useInfiniteQuery({
        queryKey: ["rooms"],
        queryFn: ({ pageParam = 1 }) => roomManagementApi.search({ ...params, pageNumber: pageParam }),
        getNextPageParam: (lastPage) => {
            if (lastPage.data.pageNumber < lastPage.data.totalPages) {
                return lastPage.data.pageNumber + 1
            }
            return undefined
        },
        initialPageParam: 1,
    })
}