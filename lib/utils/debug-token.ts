import { jwtDecode } from "jwt-decode"

export function debugToken() {
    if (typeof window === "undefined") return

    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")
    const accountId = localStorage.getItem("account_id")

    console.log("=== TOKEN DEBUG ===")
    console.log("Has access token:", !!accessToken)
    console.log("Has refresh token:", !!refreshToken)
    console.log("Cached account_id:", accountId)

    if (accessToken) {
        try {
            const decoded = jwtDecode<any>(accessToken)
            console.log("Access Token Decoded:", decoded)
            console.log("Access Token Fields:", Object.keys(decoded))
        } catch (e) {
            console.error("Failed to decode access token:", e)
        }
    }

    if (refreshToken) {
        try {
            const decoded = jwtDecode<any>(refreshToken)
            console.log("Refresh Token Decoded:", decoded)
            console.log("Refresh Token Fields:", Object.keys(decoded))
        } catch (e) {
            console.error("Failed to decode refresh token:", e)
        }
    }
}

// Auto-run on import in browser
if (typeof window !== "undefined") {
    debugToken()
}
