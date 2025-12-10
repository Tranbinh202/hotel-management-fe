"use client"

import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import { getAccountIdFromToken } from "@/lib/utils/token"

export default function TokenDebugPage() {
    const [tokenInfo, setTokenInfo] = useState<any>(null)

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token")
        const refreshToken = localStorage.getItem("refresh_token")
        const accountId = localStorage.getItem("account_id")

        if (accessToken) {
            try {
                const decoded = jwtDecode<any>(accessToken)
                const extractedAccountId = getAccountIdFromToken(accessToken)

                setTokenInfo({
                    hasAccessToken: !!accessToken,
                    hasRefreshToken: !!refreshToken,
                    cachedAccountId: accountId,
                    extractedAccountId,
                    decodedAccessToken: decoded,
                    accessTokenClaims: Object.keys(decoded),
                })
            } catch (e) {
                console.error("Failed to decode token:", e)
            }
        }
    }, [])

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Token Debug Info</h1>

            {tokenInfo ? (
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <h2 className="font-semibold mb-2">Token Status</h2>
                        <p>Has Access Token: {tokenInfo.hasAccessToken ? "✅" : "❌"}</p>
                        <p>Has Refresh Token: {tokenInfo.hasRefreshToken ? "✅" : "❌"}</p>
                        <p>Cached Account ID: {tokenInfo.cachedAccountId || "None"}</p>
                        <p>Extracted Account ID: {tokenInfo.extractedAccountId || "None"}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <h2 className="font-semibold mb-2">Available JWT Claims</h2>
                        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                            {JSON.stringify(tokenInfo.accessTokenClaims, null, 2)}
                        </pre>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <h2 className="font-semibold mb-2">Decoded Access Token</h2>
                        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-96">
                            {JSON.stringify(tokenInfo.decodedAccessToken, null, 2)}
                        </pre>
                    </div>
                </div>
            ) : (
                <p>No token found. Please login first.</p>
            )}
        </div>
    )
}
