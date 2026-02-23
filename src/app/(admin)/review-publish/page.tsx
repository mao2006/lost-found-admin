'use client'

import { Card, Typography } from 'antd'

const { Paragraph, Title } = Typography

export default function ReviewPublishPage() {
  return (
    <Card styles={{ body: { padding: 28 } }}>
      <Title level={3} className="!mb-2">
        审核发布信息
      </Title>
      <Paragraph className="!mb-0 text-slate-600">
        该页面用于承接发布信息审核流程，当前为路由与布局占位页。
      </Paragraph>
    </Card>
  )
}
