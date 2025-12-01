import { jwtDecode } from "jwt-decode"

interface JwtPayload {
  exp: number
  iat: number
  [key: string]: any
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const currentTime = Date.now() / 1000

    // Check if token expires in the next 60 seconds (buffer time)
    return decoded.exp < currentTime + 60
  } catch (error) {
    console.error("Error decoding token:", error)
    return true
  }
}

/**
 * Get account ID from JWT token
 */
export function getAccountIdFromToken(token: string): number | null {
  try {
    const decoded = jwtDecode<any>(token)

    // Log the decoded token for debugging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("[Token Debug] Decoded JWT:", decoded)
      console.log("[Token Debug] Available claims:", Object.keys(decoded))
    }

    // Try various possible claim names
    // Standard claims
    if (decoded.accountId) return Number(decoded.accountId)
    if (decoded.sub) return Number(decoded.sub)
    if (decoded.id) return Number(decoded.id)
    if (decoded.userId) return Number(decoded.userId)
    if (decoded.user_id) return Number(decoded.user_id)

    // Namespaced claims (common in ASP.NET)
    if (decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]) {
      return Number(decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"])
    }

    // Custom claims
    if (decoded["AccountId"]) return Number(decoded["AccountId"])
    if (decoded["account_id"]) return Number(decoded["account_id"])

    console.warn("[Token] Could not find accountId in token. Available claims:", Object.keys(decoded))
    return null
  } catch (error) {
    console.error("Error extracting account ID from token:", error)
    return null
  }
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpirationTime(token: string): number | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return decoded.exp
  } catch (error) {
    console.error("Error getting token expiration:", error)
    return null
  }
}
