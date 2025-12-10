import type {
  Account,
  ApiResponse,
  User,
  AccountSummary,
  UpdateAccountProfileDto,
} from "../types/api";
import { apiClient } from "./client";

export interface AccountResponse {
  account: Account;
  customer: User;
}

export interface UpdateProfileBody {
  accountId: number;
  email?: string;
  phone?: string;
  fullName?: string;
  phoneNumber?: string;
  identityCard?: string;
  address?: string;
  avatarUrl?: string;
}

export const accountApi = {
  getProfile: async (): Promise<ApiResponse<AccountResponse>> => {
    return await apiClient.get<ApiResponse<AccountResponse>>(
      "/account/customer-profile"
    );
  },
  updateProfile: async (
    data: UpdateAccountProfileDto
  ): Promise<ApiResponse<AccountSummary>> => {
    return await apiClient.put<ApiResponse<AccountSummary>>(
      "/Account/customer-profile",
      data
    );
  },
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> => {
    return await apiClient.post<ApiResponse<void>>("/Account/change-password", {
      currentPassword,
      newPassword,
    });
  },
  getSummary: async (id: number): Promise<ApiResponse<AccountSummary>> => {
    return await apiClient.get<ApiResponse<AccountSummary>>(
      "/Account/summary",
      {
        params: id !== 0 ? { id } : {},
      }
    );
  },
  adminGetSummary: async (id: number): Promise<any> => {
    return await apiClient.get<any>("/account/summary/" + id);
  },
};
