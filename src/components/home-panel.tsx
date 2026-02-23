'use client'

import { Button, Card, Space, Tag, Typography } from 'antd'
import { useCounterStore } from '@/stores/use-counter-store'

const { Paragraph, Text, Title } = Typography

export function HomePanel() {
  const { count, decrement, increment, reset } = useCounterStore()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-10">
      <Card className="w-full shadow-sm">
        <Space direction="vertical" size={20} className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Title level={3} className="!mb-0">
              Lost & Found Admin
            </Title>
            <Tag color="processing">
              Frontend Only
            </Tag>
          </div>

          <Paragraph className="!mb-0 text-gray-600">
            Next.js + Ant Design + Tailwind + Zustand
          </Paragraph>

          <Card size="small" title="Counter Store (zustand)">
            <Space direction="vertical" size={12} className="w-full">
              <Text>
                Current count:
                {count}
              </Text>
              <Space wrap>
                <Button onClick={decrement}>-1</Button>
                <Button type="primary" onClick={increment}>+1</Button>
                <Button onClick={reset}>Reset</Button>
              </Space>
            </Space>
          </Card>

          <Card size="small" title="Static Build">
            <Text>
              This project is configured for SSG export and does not include backend APIs.
            </Text>
          </Card>
        </Space>
      </Card>
    </div>
  )
}
