import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthProvider } from "@/hooks/use-auth"
import "./globals.css"

export const metadata: Metadata = {
  title: "Charisword Gospel Ministry - Church Management System",
  description: "Professional church management system for attendance tracking and financial management",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AuthProvider>
      </body>
    </html>
  )
}
