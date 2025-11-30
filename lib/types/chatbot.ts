export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface ChatRequest {
  sessionId: string
  accountId: number
  guestIdentifier: string
  message: string
}

export interface ChatResponse {
  isSuccess: boolean
  data?: {
    sessionId: string
    message: string
    isNewSession: boolean
  }
  responseCode?: string
  message?: string
}

export interface ChatSession {
  sessionId: string | null
  guestId: string
  messages: ChatMessage[]
  isTyping: boolean
}

export interface ChatHistoryMessage {
  id: number
  sessionId: string
  senderType: string
  messageText: string
  sentAt: string
}

export interface ChatHistoryResponse {
  isSuccess: boolean
  data?: ChatHistoryMessage[]
  responseCode?: string
  message?: string
}

export interface ChatSessionInfo {
  sessionId: string
  lastMessageAt: string
  messageCount: number
  firstMessage: string
}

export interface SessionListResponse {
  isSuccess: boolean
  data?: ChatSessionInfo[]
  responseCode?: string
  message?: string
}
