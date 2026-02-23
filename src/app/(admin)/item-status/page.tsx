'use client'

import { Card, Typography } from 'antd'

const { Paragraph, Title } = Typography

export default function ItemStatusPage() {
  return (
    <Card styles={{ body: { padding: 28 } }}>
      <Title level={3} className="!mb-2">
        管理物品状态
      </Title>
      <Paragraph className="!mb-0 text-slate-600">
        该页面用于维护物品状态流转，当前为路由与布局占位页。
      </Paragraph>
    </Card>
  )
}
