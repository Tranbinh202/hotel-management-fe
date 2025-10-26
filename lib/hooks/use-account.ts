import { useMutation, useQuery } from "@tanstack/react-query";
import { accountApi } from "../api/account";
import { queryClient } from "../api";

export const useAccountProfile = () => {
    return useQuery({
        queryKey: ['get-account-profile'],
        queryFn: async () => {
            const res = await accountApi.getProfile();
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export const useUpdateAcountProfile = () => {
    return useMutation({
        mutationKey: ["update-account-profile"],
        mutationFn: accountApi.updateProfile,
        onSuccess: () => {
            // Invalidate the profile query to refetch updated data
            queryClient.invalidateQueries({
                queryKey: ['get-account-profile']
            });
        }
    })
}

export const useAccountSummary = (id: number) => {
    return useQuery({
        queryKey: ['get-account-summary'],
        queryFn: async () => {
            const res = await accountApi.getSummary(id);
            return res.data;
        }
    });
}

export const useAccountSummaryAdmin = (id: number) => {
    return useQuery({
        queryKey: ['get-account-summary-admin'],
        queryFn: async () => {
            const res = await accountApi.adminGetSummary(id);
            return res.data;
        }
    });
}