'use client'

import { Alert, Button, Card, Space, Spin, Tag, Typography } from 'antd'
import { camelCase, upperFirst } from 'lodash-es'
import { useHealthQuery } from '@/hooks/use-health-query'
import { useCounterStore } from '@/stores/use-counter-store'

const { Paragraph, Text, Title } = Typography

export function HomePanel() {
  const { count, decrement, increment, reset } = useCounterStore()
  const healthQuery = useHealthQuery()
  const statusLabel = healthQuery.data
    ? upperFirst(camelCase(healthQuery.data.status))
    : 'Unknown'

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-10">
      <Card className="w-full shadow-sm">
        <Space direction="vertical" size={20} className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Title level={3} className="!mb-0">
              Lost & Found Admin
            </Title>
            <Tag color={healthQuery.isError ? 'error' : 'success'}>
              API
              {' '}
              {healthQuery.isError ? 'Unavailable' : statusLabel}
            </Tag>
          </div>

          <Paragraph className="!mb-0 text-gray-600">
            Next.js + Ant Design + Tailwind + Axios + React Query + Zustand
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

          <Card size="small" title="Health Query (axios + react-query)">
            {healthQuery.isPending && <Spin />}
            {healthQuery.isError && (
              <Alert
                type="error"
                message="Failed to fetch /api/health"
                description={healthQuery.error.message}
                showIcon
              />
            )}
            {healthQuery.data && (
              <Space direction="vertical" size={4}>
                <Text>
                  Service:
                  {' '}
                  {healthQuery.data.service}
                </Text>
                <Text>
                  Status:
                  {' '}
                  {healthQuery.data.status}
                </Text>
                <Text>
                  Timestamp:
                  {' '}
                  {new Date(healthQuery.data.timestamp).toLocaleString()}
                </Text>
              </Space>
            )}
          </Card>
        </Space>
      </Card>
    </div>
  )
}
