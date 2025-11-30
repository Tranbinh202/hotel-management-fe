import type React from "react"
import { ClientHeader } from "@/components/client-header"
import { ClientFooter } from "@/components/client-footer"
import { ChatbotWidget } from "@/components/chatbot-widget"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1 pt-16">{children}</main>
      <ClientFooter />
      <ChatbotWidget />
    </div>
  )
}
