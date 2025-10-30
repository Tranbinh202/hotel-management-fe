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
    // The account ID might be in different fields depending on the JWT structure
    return decoded.accountId || decoded.sub || decoded.id || null
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
