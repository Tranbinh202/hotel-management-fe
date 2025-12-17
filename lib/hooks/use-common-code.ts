import { useQuery } from "@tanstack/react-query"
import { commonCodeApi, type GetCommonCodesParams } from "@/lib/api/common-code"
import type { CommonCode } from "@/lib/types/api"

export function useCommonCodes(params: GetCommonCodesParams = {}) {
  return useQuery<CommonCode[]>({
    queryKey: ["commonCodes", params],
    queryFn: () => commonCodeApi.getAll(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRoomStatuses(isActive = true) {
  return useQuery<CommonCode[]>({
    queryKey: ["commonCodes", "RoomStatus", isActive],
    queryFn: () => commonCodeApi.getByType("RoomStatus", isActive),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePaymentMethods(isActive = true) {
  return useQuery<CommonCode[]>({
    queryKey: ["commonCodes", "PaymentMethod", isActive],
    queryFn: () => commonCodeApi.getByType("PaymentMethod", isActive),
    staleTime: 5 * 60 * 1000,
  })
}
