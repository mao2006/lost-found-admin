'use client'

import { Card, Typography } from 'antd'

const { Paragraph, Title } = Typography

export default function InfoMaintenancePage() {
  return (
    <Card styles={{ body: { padding: 28 } }}>
      <Title level={3} className="!mb-2">
        信息维护与查询
      </Title>
      <Paragraph className="!mb-0 text-slate-600">
        该页面用于信息维护与查询，当前为路由与布局占位页。
      </Paragraph>
    </Card>
  )
}
