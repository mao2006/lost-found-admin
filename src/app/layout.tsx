import type { Metadata } from 'next'
import { AppProvider } from '@/providers/app-provider'
import 'antd/dist/reset.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lost & Found Admin',
  description: 'Admin dashboard starter based on Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
