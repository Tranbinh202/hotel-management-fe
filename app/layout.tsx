import type React from "react"
import type { Metadata } from "next"
import { Inter, Be_Vietnam_Pro } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import ReactQueryProvider from "@/lib/react-query-provider"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
})

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Khách sạn StayHub - Đặt phòng trực tuyến",
  description: "Hệ thống quản lý và đặt phòng khách sạn hiện đại",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${beVietnamPro.variable} font-sans antialiased`}>
        <ReactQueryProvider>
          <AuthProvider>
            <Suspense fallback={<div>Loading...</div>}>
              {children}
              <Analytics />
              <Toaster />
            </Suspense>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
