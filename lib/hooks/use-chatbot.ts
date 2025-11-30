"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ChatbotService } from "../services/chatbot-service"
import type { ChatMessage, ChatSessionInfo } from "../types/chatbot"

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [sessions, setSessions] = useState<ChatSessionInfo[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const sendTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const loadChatHistory = async () => {
      if (typeof window === "undefined") return

      const sessionId = ChatbotService.getSessionId()
      setCurrentSessionId(sessionId)

      if (!sessionId) {
        setIsLoadingHistory(false)
        return
      }

      try {
        const response = await ChatbotService.getChatHistory(sessionId)

        if (response.isSuccess && response.data && response.data.length > 0) {
          const historyMessages: ChatMessage[] = response.data.map((msg) => ({
            id: `history-${msg.id}`,
            role: msg.senderType.toLowerCase() === "user" ? "user" : "assistant",
            content: msg.messageText,
            timestamp: new Date(msg.sentAt),
          }))

          setMessages(historyMessages)
        }
      } catch (err) {
        console.error("Failed to load chat history:", err)
        const saved = sessionStorage.getItem("chatbot_messages")
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            setMessages(
              parsed.map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp),
              })),
            )
          } catch (e) {
            console.error("Failed to parse saved messages:", e)
          }
        }
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadChatHistory()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || messages.length === 0) return
    sessionStorage.setItem("chatbot_messages", JSON.stringify(messages))
  }, [messages])

  const loadSessions = useCallback(async (accountId: number) => {
    setIsLoadingSessions(true)
    try {
      const response = await ChatbotService.getAccountSessions(accountId)
      if (response.isSuccess && response.data) {
        setSessions(response.data)
      }
    } catch (err) {
      console.error("Failed to load sessions:", err)
    } finally {
      setIsLoadingSessions(false)
    }
  }, [])

  const switchSession = useCallback(async (sessionId: string) => {
    setIsLoadingHistory(true)
    setMessages([])

    try {
      ChatbotService.setSessionId(sessionId)
      setCurrentSessionId(sessionId)

      const response = await ChatbotService.getChatHistory(sessionId)

      if (response.isSuccess && response.data && response.data.length > 0) {
        const historyMessages: ChatMessage[] = response.data.map((msg) => ({
          id: `history-${msg.id}`,
          role: msg.senderType.toLowerCase() === "user" ? "user" : "assistant",
          content: msg.messageText,
          timestamp: new Date(msg.sentAt),
        }))

        setMessages(historyMessages)
      }
    } catch (err) {
      console.error("Failed to switch session:", err)
      setError("Không thể tải lịch sử trò chuyện")
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  const startNewChat = useCallback(() => {
    ChatbotService.clearSession()
    const newSessionId = ChatbotService.generateSessionId()
    ChatbotService.setSessionId(newSessionId)
    setCurrentSessionId(newSessionId)
    setMessages([])
    setError(null)
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("chatbot_messages")
    }
  }, [])

  const sendMessage = useCallback(
    async (message: string, accountId?: number) => {
      if (!message.trim() || isTyping) return

      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current)
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsTyping(true)
      setError(null)

      try {
        const response = await ChatbotService.sendMessage(message, accountId)

        if (response.isSuccess && response.data) {
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: response.data.message,
            timestamp: new Date(),
          }

          setMessages((prev) => [...prev, assistantMessage])
        } else {
          throw new Error(response.message || "Failed to get response")
        }
      } catch (err) {
        console.error("Chat error:", err)
        setError(err instanceof Error ? err.message : "Failed to send message")

        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsTyping(false)
      }
    },
    [isTyping],
  )

  const clearChat = useCallback(async () => {
    await ChatbotService.clearChatSession()
    setMessages([])
    setError(null)
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("chatbot_messages")
    }
  }, [])

  return {
    messages,
    isTyping,
    error,
    isLoadingHistory,
    sendMessage,
    clearChat,
    sessions,
    isLoadingSessions,
    currentSessionId,
    loadSessions,
    switchSession,
    startNewChat,
  }
}
