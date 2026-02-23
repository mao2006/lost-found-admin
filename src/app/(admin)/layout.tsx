import type { ReactNode } from 'react'
import { AdminTopNav } from '@/components/admin-top-nav'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <AdminTopNav />
      <main className="mx-auto w-full max-w-7xl px-6 py-6">
        {children}
      </main>
    </div>
  )
}
