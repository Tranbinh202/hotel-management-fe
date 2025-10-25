export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
    ENDPOINTS: {
        LOGIN: "/Authentication/login",
        ACCOUNT_SUMMARY: "/Account/summary",
        REFRESH_TOKEN: "/Account/refresh-token",
    },
    HEADERS: {
        "Content-Type": "application/json",
        Accept: "*/*",
    },
}

export function getAuthHeader(token: string): Record<string, string> {
    return {
        Authorization: `Bearer ${token}`,
    }
}
