"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Send, Trash2, Sparkles, Bot, MessageSquare, Plus, History, ArrowLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useChatbot } from "@/lib/hooks/use-chatbot"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [view, setView] = useState<"nickname" | "chat" | "sessions">("nickname")
  const [nickname, setNickname] = useState("")
  const [nicknameInput, setNicknameInput] = useState("")
  const {
    messages,
    isTyping,
    isLoadingHistory,
    sendMessage,
    clearChat,
    sessions,
    isLoadingSessions,
    currentSessionId,
    loadSessions,
    switchSession,
    startNewChat,
  } = useChatbot()
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const nicknameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNickname = localStorage.getItem("chatbot_nickname")
      if (savedNickname) {
        setNickname(savedNickname)
        setView("chat")
      } else if (user?.fullName) {
        setNickname(user.fullName)
        setView("chat")
      }
    }
  }, [user])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && inputRef.current && view === "chat") {
      inputRef.current.focus()
    }
  }, [isOpen, view])

  useEffect(() => {
    if (isOpen && view === "nickname" && nicknameInputRef.current) {
      nicknameInputRef.current.focus()
    }
  }, [isOpen, view])

  useEffect(() => {
    if (view === "sessions" && user?.id) {
      loadSessions(user.id)
    }
  }, [view, user?.id, loadSessions])

  const handleNicknameSubmit = () => {
    const finalNickname = nicknameInput.trim() || `Khách ${Math.floor(Math.random() * 9000) + 1000}`
    setNickname(finalNickname)
    if (typeof window !== "undefined") {
      localStorage.setItem("chatbot_nickname", finalNickname)
    }
    setView("chat")
  }

  const handleNicknameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleNicknameSubmit()
    }
  }

  const handleSkipNickname = () => {
    const defaultNickname = `Khách ${Math.floor(Math.random() * 9000) + 1000}`
    setNickname(defaultNickname)
    if (typeof window !== "undefined") {
      localStorage.setItem("chatbot_nickname", defaultNickname)
    }
    setView("chat")
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return

    const message = inputValue
    setInputValue("")
    await sendMessage(message, user?.id)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearChat = async () => {
    if (confirm("Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện?")) {
      await clearChat()
    }
  }

  const handleSelectSession = async (sessionId: string) => {
    await switchSession(sessionId)
    setView("chat")
  }

  const handleNewChat = () => {
    startNewChat()
    setView("chat")
  }

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full animate-ping opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full animate-pulse opacity-20" />

            <Button
              onClick={() => setIsOpen(true)}
              className="relative h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary via-purple-600 to-primary hover:scale-110 hover:rotate-12 transition-all duration-300 group-hover:shadow-primary/50"
              size="icon"
            >
              <Bot className="h-8 w-8 text-white animate-pulse" />
              <Sparkles className="h-5 w-5 absolute -top-1 -right-1 text-yellow-300 animate-bounce" />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </Button>

            <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Trò chuyện với AI
              <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[400px] p-0 gap-0 overflow-hidden h-[600px] shadow-2xl z-50 flex flex-col border-2 border-primary/20 animate-in slide-in-from-bottom-4 duration-300">
          <div className="relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-primary" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

            <div className="relative flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center ring-2 ring-white/30">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-1">
                    Trợ lý ảo StayHub
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                  </h3>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-xs text-white/90">Sẵn sàng hỗ trợ 24/7</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {user && view === "chat" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setView("sessions")}
                    className="h-8 w-8 text-white hover:bg-white/20"
                    title="Xem lịch sử"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                )}
                {view === "chat" && messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearChat}
                    className="h-8 w-8 text-white hover:bg-white/20"
                    title="Xóa cuộc trò chuyện"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {view === "nickname" ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-muted/20 to-background">
              <div className="text-center max-w-sm">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h4 className="font-semibold text-xl mb-2">Chào mừng bạn đến với StayHub</h4>
                <p className="text-sm text-muted-foreground mb-6">Bạn muốn được gọi là gì trong cuộc trò chuyện này?</p>
                <div className="space-y-3">
                  <Input
                    ref={nicknameInputRef}
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    onKeyDown={handleNicknameKeyPress}
                    placeholder="Nhập tên của bạn..."
                    className="text-center"
                    maxLength={30}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSkipNickname} variant="outline" className="flex-1 bg-transparent">
                      Bỏ qua
                    </Button>
                    <Button
                      onClick={handleNicknameSubmit}
                      className="flex-1 bg-gradient-to-br from-primary via-purple-600 to-primary"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Bỏ qua để sử dụng tên mặc định</p>
                </div>
              </div>
            </div>
          ) : view === "chat" ? (
            <>
              <div className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/20 to-background py-2 px-4">
                {isLoadingHistory && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-primary/20 flex items-center justify-center mb-4">
                      <Bot className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse">Đang tải lịch sử trò chuyện...</p>
                  </div>
                )}

                {!isLoadingHistory && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-primary/20 flex items-center justify-center mb-4 animate-pulse">
                      <Bot className="h-10 w-10 text-primary" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">Xin chào {nickname}!</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Tôi có thể giúp bạn tìm phòng phù hợp hoặc trả lời các câu hỏi về khách sạn
                    </p>
                    <div className="grid gap-2 w-full">
                      <button
                        onClick={() => {
                          setInputValue("Cho tôi xem các phòng có sẵn")
                          inputRef.current?.focus()
                        }}
                        className="text-xs bg-muted hover:bg-primary/10 p-3 rounded-lg text-left transition-all hover:scale-[1.02] hover:shadow-md"
                      >
                        🏨 Xem phòng có sẵn
                      </button>
                      <button
                        onClick={() => {
                          setInputValue("Giá phòng là bao nhiêu?")
                          inputRef.current?.focus()
                        }}
                        className="text-xs bg-muted hover:bg-primary/10 p-3 rounded-lg text-left transition-all hover:scale-[1.02] hover:shadow-md"
                      >
                        💰 Hỏi về giá phòng
                      </button>
                      <button
                        onClick={() => {
                          setInputValue("Khách sạn có những dịch vụ gì?")
                          inputRef.current?.focus()
                        }}
                        className="text-xs bg-muted hover:bg-primary/10 p-3 rounded-lg text-left transition-all hover:scale-[1.02] hover:shadow-md"
                      >
                        ✨ Tìm hiểu dịch vụ
                      </button>
                    </div>
                  </div>
                )}

                {!isLoadingHistory && messages.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                          message.role === "user" ? "justify-end" : "justify-start",
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary via-purple-600 to-primary flex items-center justify-center flex-shrink-0 mt-1 ring-2 ring-primary/20">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}

                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
                            message.role === "user"
                              ? "bg-gradient-to-br from-primary via-purple-600 to-primary text-primary-foreground rounded-br-md"
                              : "bg-white border border-border rounded-bl-md",
                          )}
                        >
                          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap [word-break:break-word] [overflow-wrap:anywhere]">
                            {message.content}
                          </p>
                          <p
                            className={cn(
                              "text-xs mt-2 flex items-center gap-1",
                              message.role === "user"
                                ? "text-primary-foreground/70 justify-end"
                                : "text-muted-foreground",
                            )}
                          >
                            {message.timestamp.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {message.role === "user" && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-xs font-semibold truncate px-1">{nickname.slice(0, 2)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary via-purple-600 to-primary flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-white border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                          <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-background/95 backdrop-blur flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Nhập tin nhắn của bạn..."
                    disabled={isTyping || isLoadingHistory}
                    className="flex-1 rounded-full border-2 focus:border-primary transition-colors"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping || isLoadingHistory}
                    size="icon"
                    className="rounded-full h-10 w-10 shadow-md hover:scale-105 transition-transform bg-gradient-to-br from-primary via-purple-600 to-primary"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">Nhấn Enter để gửi</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-b from-muted/20 to-background">
                <div className="p-4 border-b flex-shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <Button
                      onClick={() => setView("chat")}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 flex-shrink-0"
                      title="Quay lại chat"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h4 className="font-semibold text-sm flex-1">Lịch sử trò chuyện</h4>
                    <Button
                      onClick={handleNewChat}
                      size="sm"
                      className="h-8 gap-1.5 text-xs bg-gradient-to-br from-primary via-purple-600 to-primary flex-shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Mới
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Chọn một cuộc trò chuyện để tiếp tục</p>
                </div>

                <ScrollArea className="flex-1 px-4">
                  {isLoadingSessions && (
                    <div className="flex flex-col items-center justify-center h-32">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-primary/20 flex items-center justify-center mb-3">
                        <Bot className="h-6 w-6 text-primary animate-pulse" />
                      </div>
                      <p className="text-xs text-muted-foreground animate-pulse">Đang tải...</p>
                    </div>
                  )}

                  {!isLoadingSessions && sessions.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-center px-6">
                      <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Chưa có cuộc trò chuyện nào</p>
                    </div>
                  )}

                  {!isLoadingSessions && sessions.length > 0 && (
                    <div className="space-y-2 py-2">
                      {sessions.map((session) => (
                        <button
                          key={session.sessionId}
                          onClick={() => handleSelectSession(session.sessionId)}
                          className={cn(
                            "w-full p-3 rounded-lg text-left transition-all hover:scale-[1.02] hover:shadow-md border",
                            session.sessionId === currentSessionId
                              ? "bg-primary/10 border-primary/30"
                              : "bg-muted/50 hover:bg-muted border-transparent",
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-2 break-words">
                                {session.firstMessage || "Cuộc trò chuyện"}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs text-muted-foreground">{session.messageCount} tin nhắn</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(session.lastMessageAt).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  )
}
