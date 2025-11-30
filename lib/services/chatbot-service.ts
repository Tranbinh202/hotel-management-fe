import { API_CONFIG } from "../api-config"
import type { ChatRequest, ChatResponse, ChatHistoryResponse, SessionListResponse } from "../types/chatbot"

export class ChatbotService {
  private static readonly SESSION_STORAGE_KEY = "chatbot_session_id"
  private static readonly GUEST_STORAGE_KEY = "chatbot_guest_id"

  static getSessionId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.SESSION_STORAGE_KEY)
  }

  static setSessionId(sessionId: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.SESSION_STORAGE_KEY, sessionId)
  }

  static getGuestId(): string {
    if (typeof window === "undefined") return `guest-${Date.now()}`

    let guestId = localStorage.getItem(this.GUEST_STORAGE_KEY)
    if (!guestId) {
      guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(this.GUEST_STORAGE_KEY, guestId)
    }
    return guestId
  }

  static generateSessionId(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  static clearSession(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.SESSION_STORAGE_KEY)
  }

  static async sendMessage(message: string, accountId?: number | null): Promise<ChatResponse> {
    let sessionId = this.getSessionId()
    if (!sessionId) {
      sessionId = this.generateSessionId()
      this.setSessionId(sessionId)
    }

    const guestId = this.getGuestId()

    const request: ChatRequest = {
      sessionId,
      accountId: accountId || 0,
      guestIdentifier: guestId,
      message,
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/ChatBot/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ChatResponse = await response.json()

    // Save sessionId from response if provided
    if (data.isSuccess && data.data?.sessionId) {
      this.setSessionId(data.data.sessionId)
    }

    return data
  }

  static async getChatHistory(sessionId: string): Promise<ChatHistoryResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/ChatBot/history/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ChatHistoryResponse = await response.json()
      return data
    } catch (error) {
      console.error("Failed to fetch chat history:", error)
      throw error
    }
  }

  static async getAccountSessions(accountId: number, limit = 20): Promise<SessionListResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/ChatBot/account/${accountId}?limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SessionListResponse = await response.json()
      return data
    } catch (error) {
      console.error("Failed to fetch account sessions:", error)
      throw error
    }
  }

  static async clearChatSession(): Promise<void> {
    const sessionId = this.getSessionId()
    if (sessionId) {
      try {
        await fetch(`${API_CONFIG.BASE_URL}/ChatBot/session/${sessionId}`, {
          method: "DELETE",
        })
      } catch (error) {
        console.error("Failed to clear chat session:", error)
      } finally {
        this.clearSession()
      }
    }
  }
}
