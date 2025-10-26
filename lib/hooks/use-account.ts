import { useMutation, useQuery } from "@tanstack/react-query"
import { accountApi } from "../api/account"
import { queryClient } from "../api"

export const useAccountProfile = () => {
  return useQuery({
    queryKey: ["get-account-profile"],
    queryFn: async () => {
      const res = await accountApi.getProfile()
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useMyAccountSummary = () => {
  return useQuery({
    queryKey: ["my-account-summary"],
    queryFn: async () => {
      const res = await accountApi.getSummary(0) // 0 or no ID means current user
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useUpdateAcountProfile = () => {
  return useMutation({
    mutationKey: ["update-account-profile"],
    mutationFn: accountApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-account-profile"],
      })
      queryClient.invalidateQueries({
        queryKey: ["my-account-summary"],
      })
    },
  })
}

export const useAccountSummary = (id: number) => {
  return useQuery({
    queryKey: ["get-account-summary", id],
    queryFn: async () => {
      const res = await accountApi.getSummary(id)
      return res.data
    },
  })
}

export const useAccountSummaryAdmin = (id: number) => {
  return useQuery({
    queryKey: ["get-account-summary-admin", id],
    queryFn: async () => {
      const res = await accountApi.adminGetSummary(id)
      return res.data
    },
  })
}
