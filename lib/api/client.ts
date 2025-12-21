// api-client.ts
import axios, {
  type AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import type { ApiError, ApiResponse, AuthResponse } from "@/lib/types/api";
import { QueryClient } from "@tanstack/react-query";
import { isTokenExpired, getAccountIdFromToken } from "@/lib/utils/token";

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:5001/api",
  headers: { "Content-Type": "application/json" },
});

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:5001/api",
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      async (config) => {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("access_token")
            : null;

        if (!config.headers) config.headers = new AxiosHeaders();
        const h = config.headers as AxiosHeaders;

        if (token && isTokenExpired(token)) {
          console.log("Token expired, refreshing before request...");

          try {
            const newToken = await this.handleTokenRefresh();
            if (newToken) {
              h.set("Authorization", `Bearer ${newToken}`);
            }
          } catch (error) {
            console.error(
              "Failed to refresh token in request interceptor:",
              error
            );
            // Continue with expired token, let response interceptor handle it
            if (token) {
              h.set("Authorization", `Bearer ${token}`);
            }
          }
        } else if (token) {
          h.set("Authorization", `Bearer ${token}`);
        }

        if (!h.has("Content-Type")) {
          h.set("Content-Type", "application/json");
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const original = error.config as
          | (AxiosRequestConfig & { _retry?: boolean })
          | undefined;
        const status = error.response?.status;

        if (!original || original._retry) {
          return Promise.reject(this.handleError(error));
        }

        if (status === 401) {
          original._retry = true;

          if (!isRefreshing) {
            isRefreshing = true;
            try {
              const newToken = await this.handleTokenRefresh();

              if (!newToken) {
                throw new Error("Failed to refresh token");
              }

              // Notify all queued requests
              refreshQueue.forEach((cb) => cb(newToken));
              refreshQueue = [];
              isRefreshing = false;

              // Retry original request with new token
              if (!original.headers) original.headers = new AxiosHeaders();
              (original.headers as AxiosHeaders).set(
                "Authorization",
                `Bearer ${newToken}`
              );

              return this.instance(original);
            } catch (e) {
              console.error("Token refresh failed:", e);
              refreshQueue.forEach((cb) => cb(null));
              refreshQueue = [];
              isRefreshing = false;

              if (typeof window !== "undefined") {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("account_id");
                localStorage.removeItem("user");
                localStorage.removeItem("resumeSession");
                localStorage.removeItem("resume_session");
                window.location.href = "/login";
              }
              return Promise.reject(this.handleError(error));
            }
          } else {
            // Wait for ongoing refresh
            return new Promise((resolve, reject) => {
              refreshQueue.push((newToken) => {
                if (!newToken) {
                  reject(this.handleError(error));
                  return;
                }
                if (!original.headers) original.headers = new AxiosHeaders();
                (original.headers as AxiosHeaders).set(
                  "Authorization",
                  `Bearer ${newToken}`
                );
                resolve(this.instance(original));
              });
            });
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async handleTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refresh_token")
          : null;

      if (!refreshToken) {
        console.error("No refresh token available");
        this.clearAuthAndRedirect();
        throw new Error("No refresh token available");
      }

      // Validate refresh token format (should be a non-empty string)
      if (
        typeof refreshToken !== "string" ||
        refreshToken.trim().length === 0
      ) {
        console.error("Invalid refresh token format");
        this.clearAuthAndRedirect();
        throw new Error("Invalid refresh token format");
      }

      console.log("Refresh token found, length:", refreshToken.length);

      // Try to get accountId from access token first
      let accountId: number | null = null;
      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      if (accessToken) {
        // Only try to decode if it's a valid JWT format
        const parts = accessToken.split(".");
        if (parts.length === 3) {
          accountId = getAccountIdFromToken(accessToken);
          console.log("Extracted accountId from access token:", accountId);
        }
      }

      // If not found in access token, try refresh token (if it's a JWT)
      if (!accountId && refreshToken) {
        const parts = refreshToken.split(".");
        if (parts.length === 3) {
          accountId = getAccountIdFromToken(refreshToken);
          console.log(
            "Extracted accountId from refresh token:",
            accountId
          );
        }
      }

      // Fallback to cached accountId
      if (!accountId && typeof window !== "undefined") {
        const cachedAccountId = localStorage.getItem("account_id");
        if (cachedAccountId) {
          accountId = parseInt(cachedAccountId, 10);
          console.log(
            "Using cached accountId from localStorage:",
            accountId
          );
        }
      }

      if (!accountId) {
        console.error("No accountId available - cannot refresh token");
        this.clearAuthAndRedirect();
        throw new Error(
          "Cannot refresh token: accountId not found in access token, refresh token, or localStorage"
        );
      }

      if (isNaN(accountId)) {
        console.error("accountId is NaN");
        this.clearAuthAndRedirect();
        throw new Error("Invalid accountId: NaN");
      }

      // Don't check refresh token expiration - it might not be a JWT
      // The backend will validate if it's still valid

      // Use POST endpoint with accountId and refreshToken
      const resumeSession =
        typeof window !== "undefined"
          ? localStorage.getItem("resumeSession") ||
            localStorage.getItem("resume_session")
          : null;
      const payload: Record<string, unknown> = { accountId, refreshToken };
      if (resumeSession) {
        payload.resumeSession = resumeSession;
      }
      console.log(
        "Refreshing token with POST endpoint. Payload:",
        JSON.stringify({ accountId, refreshToken: "***" })
      );
      const response = await refreshClient.post<ApiResponse<AuthResponse>>(
        "/Authentication/refresh-token",
        payload
      );

      console.log("Refresh response:", response.data);

      const apiResponse = response.data as ApiResponse<AuthResponse>;
      const newAccessToken = apiResponse.isSuccess
        ? apiResponse.data?.token
        : null;
      const newRefreshToken = apiResponse.isSuccess
        ? apiResponse.data?.refreshToken
        : null;
      const newResumeSession = apiResponse.isSuccess
        ? apiResponse.data?.resumeSession
        : null;

      console.log("New access token received:", !!newAccessToken);
      console.log("New refresh token received:", !!newRefreshToken);

      if (!newAccessToken) {
        console.error("No access token in refresh response");
        this.clearAuthAndRedirect();
        throw new Error("No access token in refresh response");
      }

      // Update tokens in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refresh_token", newRefreshToken);
        }
        if (newResumeSession) {
          localStorage.setItem("resumeSession", newResumeSession);
          localStorage.setItem("resume_session", newResumeSession);
        }
        // Cache accountId for future refresh attempts
        localStorage.setItem("account_id", accountId.toString());
      }

      console.log("Token refreshed successfully");
      return newAccessToken;
    } catch (error: any) {
      console.error("Token refresh error:", error);
      console.error(
        "Error response:",
        JSON.stringify(error.response?.data || {}, null, 2)
      );

      // Clear auth and redirect on refresh failure
      this.clearAuthAndRedirect();
      throw error;
    }
  }

  private clearAuthAndRedirect() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("account_id");
      localStorage.removeItem("resumeSession");
      localStorage.removeItem("resume_session");

      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        console.log("Redirecting to login due to auth failure");
        window.location.href = "/login";
      }
    }
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const data = error.response.data as any;
      return {
        message: data?.message || "Đã xảy ra lỗi từ máy chủ",
        code: data?.code,
        status: error.response.status,
        errors: data?.errors,
      };
    } else if (error.request) {
      return {
        message: "Không thể kết nối đến máy chủ",
        code: "NETWORK_ERROR",
      };
    } else {
      return {
        message: error.message || "Đã xảy ra lỗi không xác định",
        code: "UNKNOWN_ERROR",
      };
    }
  }

  // wrappers...
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.get<T>(url, config);
    return res.data;
  }
  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const res = await this.instance.post<T>(url, data, config);
    return res.data;
  }
  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const res = await this.instance.put<T>(url, data, config);
    return res.data;
  }
  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const res = await this.instance.patch<T>(url, data, config);
    return res.data;
  }
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.delete<T>(url, config);
    return res.data;
  }
}

export const apiClient = new ApiClient();

export const publicApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:5001/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Public API client with error handling but no auth
publicApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const data = error.response.data as any;
      return Promise.reject({
        message: data?.message || "Đã xảy ra lỗi từ máy chủ",
        code: data?.code,
        status: error.response.status,
        errors: data?.errors,
      });
    } else if (error.request) {
      return Promise.reject({
        message: "Không thể kết nối đến máy chủ",
        code: "NETWORK_ERROR",
      });
    } else {
      return Promise.reject({
        message: error.message || "Đã xảy ra lỗi không xác định",
        code: "UNKNOWN_ERROR",
      });
    }
  }
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
    mutations: { retry: 1 },
  },
});
