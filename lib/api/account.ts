import { Account, ApiResponse, User } from "../types/api"
import { apiClient } from "./client"

export interface AccountResponse {
    account: Account
    customer: User
}

export interface UpdateProfileBody {
    accountId: number,
    email?: string,
    phone?: string,
    fullName?: string,
    phoneNumber?: string,
    identityCard?: string,
    address?: string,
    avatarUrl?: string
}

export const accountApi = {
    getProfile: async (): Promise<ApiResponse<AccountResponse>> => {
        return await apiClient.get<ApiResponse<AccountResponse>>("/account/customer-profile")
    },
    updateProfile: async (data: UpdateProfileBody): Promise<AccountResponse> => {
        return await apiClient.put<AccountResponse>("/account/customer-profile", data)
    },
    getSummary: async (id: number): Promise<any> => {
        return await apiClient.get<any>("/account/summary", {
            params: { id }
        })
    },
    adminGetSummary: async (id: number): Promise<any> => {
        return await apiClient.get<any>("/account/summary/" + id)
    }
}

