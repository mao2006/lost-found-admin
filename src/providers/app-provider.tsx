'use client'

import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { App as AntdApp, ConfigProvider } from 'antd'
import { useState } from 'react'
import { createQueryClient } from '@/query/query-client'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [queryClient] = useState(createQueryClient)

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 10,
          colorPrimary: '#1677ff',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AntdApp>
          {children}
        </AntdApp>
      </QueryClientProvider>
    </ConfigProvider>
  )
}
