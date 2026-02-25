'use client'

import type { AccountRecord, ComplaintFeedback, ReviewPublishPost } from '@/mock/system-admin'
import { App, Button, Card, Descriptions, Empty, Flex, Modal, Radio, Segmented, Space, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { COMPLAINT_FEEDBACKS, REVIEW_PUBLISH_POSTS, SYSTEM_ACCOUNTS, SYSTEM_ITEMS } from '@/mock/system-admin'
import { formatDateTime } from '@/utils/admin-mock'

type MainTab = 'all_info' | 'feedback'
type DisableDuration = '7d' | '1m' | '6m' | '1y'

const EXPIRED_STATUS_SET = new Set(['archived', 'pending_deleted', 'approved_canceled'])

function buildDisabledUntil(duration: DisableDuration) {
  const nextDate = new Date()
  const daysMap: Record<DisableDuration, number> = {
    '7d': 7,
    '1m': 30,
    '6m': 180,
    '1y': 365,
  }
  nextDate.setDate(nextDate.getDate() + daysMap[duration])
  return nextDate.toISOString()
}

export default function DataManagementPage() {
  const { message } = App.useApp()
  const [activeTab, setActiveTab] = useState<MainTab>('all_info')
  const [showExpiredData, setShowExpiredData] = useState(false)
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const [items, setItems] = useState([...SYSTEM_ITEMS])

  const [posts, setPosts] = useState<ReviewPublishPost[]>([...REVIEW_PUBLISH_POSTS])
  const [accounts, setAccounts] = useState<AccountRecord[]>([...SYSTEM_ACCOUNTS])
  const [feedbacks] = useState<ComplaintFeedback[]>([...COMPLAINT_FEEDBACKS])
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null)
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false)
  const [disableDuration, setDisableDuration] = useState<DisableDuration | null>(null)

  const visibleItems = useMemo(() => {
    const source = showExpiredData
      ? items.filter(item => EXPIRED_STATUS_SET.has(item.status))
      : items

    return [...source].sort((a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime())
  }, [items, showExpiredData])

  const sortedFeedbacks = useMemo(
    () => [...feedbacks].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()),
    [feedbacks],
  )

  const selectedFeedback = useMemo(
    () => sortedFeedbacks.find(item => item.id === selectedFeedbackId) ?? null,
    [selectedFeedbackId, sortedFeedbacks],
  )

  const selectedPost = useMemo(
    () => posts.find(post => post.id === selectedFeedback?.postId) ?? null,
    [posts, selectedFeedback?.postId],
  )

  const reportedAccount = useMemo(
    () => accounts.find(account => account.userNo === selectedFeedback?.accountNo) ?? null,
    [accounts, selectedFeedback?.accountNo],
  )

  return (
    <Space direction="vertical" size={16} className="w-full">
      <Card>
        <Flex vertical gap={10}>
          <Typography.Title level={4} className="!mb-0">数据管理</Typography.Title>
          <Typography.Text type="secondary">备份导出、清理数据、处理投诉反馈</Typography.Text>
          <Segmented
            block
            value={activeTab}
            options={[
              { label: '全校失物招领信息', value: 'all_info' },
              { label: '投诉与反馈', value: 'feedback' },
            ]}
            onChange={value => setActiveTab(value as MainTab)}
          />
        </Flex>
      </Card>

      {activeTab === 'all_info' && (
        <Space direction="vertical" size={16} className="w-full">
          <Card>
            <Flex wrap gap={10}>
              <Button onClick={() => message.success('系统数据备份完成')}>备份</Button>
              <Button onClick={() => message.success('系统数据导出成功')}>导出</Button>
              <Button
                type={showExpiredData ? 'primary' : 'default'}
                onClick={() => setShowExpiredData(prev => !prev)}
              >
                过期无效数据
              </Button>
              {showExpiredData && (
                <Button
                  danger
                  onClick={() => setIsClearModalOpen(true)}
                >
                  清理
                </Button>
              )}
            </Flex>
          </Card>

          <Card title={showExpiredData ? '过期无效信息总览' : '全校失物招领信息总览'}>
            <Space direction="vertical" size={10} className="w-full">
              {visibleItems.length === 0 && <Empty description="暂无数据" />}
              {visibleItems.map(item => (
                <Button
                  key={item.id}
                  block
                  className="!h-auto !justify-start !rounded-lg !border-sky-100 !px-4 !py-3 !text-left"
                >
                  <Flex justify="space-between" align="center" className="w-full gap-2">
                    <Space wrap>
                      <Tag color="blue">{item.itemType}</Tag>
                      <Typography.Text>{item.itemName}</Typography.Text>
                      <Typography.Text type="secondary">
                        {item.campus}
                        {' '}
                        ·
                        {' '}
                        {item.locationDetail}
                      </Typography.Text>
                    </Space>
                    <Typography.Text type="secondary">{formatDateTime(item.eventTime)}</Typography.Text>
                  </Flex>
                </Button>
              ))}
            </Space>
          </Card>
        </Space>
      )}

      {activeTab === 'feedback' && (
        <Space direction="vertical" size={16} className="w-full">
          {!selectedFeedback && (
            <Card title="用户投诉与反馈列表">
              <Space direction="vertical" size={10} className="w-full">
                {sortedFeedbacks.length === 0 && <Empty description="暂无投诉反馈" />}
                {sortedFeedbacks.map(feedback => (
                  <Button
                    key={feedback.id}
                    block
                    className="!h-auto !justify-start !rounded-lg !border-sky-100 !px-4 !py-3 !text-left"
                    onClick={() => setSelectedFeedbackId(feedback.id)}
                  >
                    <Flex justify="space-between" align="center" className="w-full gap-2">
                      <Space wrap>
                        <Tag color="warning">{feedback.complaintType}</Tag>
                        <Typography.Text>{feedback.accountName}</Typography.Text>
                      </Space>
                      <Typography.Text type="secondary">{formatDateTime(feedback.postedAt)}</Typography.Text>
                    </Flex>
                  </Button>
                ))}
              </Space>
            </Card>
          )}

          {selectedFeedback && (
            <Card title="投诉反馈详情">
              <Space direction="vertical" size={16} className="w-full">
                <Descriptions
                  bordered
                  column={1}
                  title="投诉与反馈"
                  items={[
                    { key: 'type', label: '投诉类型', children: selectedFeedback.complaintType },
                    { key: 'time', label: '时间', children: formatDateTime(selectedFeedback.postedAt) },
                    { key: 'desc', label: '说明', children: selectedFeedback.description },
                    { key: 'user', label: '投诉人', children: `${selectedFeedback.accountName}（${selectedFeedback.accountNo}）` },
                  ]}
                />

                <Descriptions
                  bordered
                  column={{ xs: 1, md: 2 }}
                  title="被反馈物品详情"
                  items={[
                    { key: 'name', label: '物品名称', children: selectedPost?.itemName ?? '已删除' },
                    { key: 'type', label: '物品类型', children: selectedPost?.itemType ?? '-' },
                    { key: 'campus', label: '校区', children: selectedPost?.campus ?? '-' },
                    { key: 'location', label: '地点', children: selectedPost?.locationDetail ?? '-' },
                    { key: 'time', label: '时间', children: selectedPost ? formatDateTime(selectedPost.eventTime) : '-' },
                    { key: 'contact', label: '联系方式', children: selectedPost?.contactPhone ?? '-' },
                  ]}
                />

                <Flex wrap gap={10}>
                  <Button
                    danger
                    type="primary"
                    onClick={() => {
                      if (!selectedPost)
                        return
                      setPosts(prev => prev.filter(post => post.id !== selectedPost.id))
                      message.success('该帖子已删除')
                    }}
                  >
                    删除该帖子
                  </Button>
                  <Button
                    disabled={!reportedAccount}
                    onClick={() => {
                      setIsDisableModalOpen(true)
                      setDisableDuration(null)
                    }}
                  >
                    禁用被投诉的账号
                  </Button>
                  <Button onClick={() => setSelectedFeedbackId(null)}>返回</Button>
                </Flex>
              </Space>
            </Card>
          )}
        </Space>
      )}

      <Modal
        title="确认清理过期无效数据"
        open={isClearModalOpen}
        okText="确认"
        cancelText="返回"
        onCancel={() => setIsClearModalOpen(false)}
        onOk={() => {
          setItems(prev => prev.filter(item => !EXPIRED_STATUS_SET.has(item.status)))
          setIsClearModalOpen(false)
          message.success('过期无效数据清理完成')
        }}
      >
        <Typography.Text>清理后数据不可恢复，是否继续？</Typography.Text>
      </Modal>

      <Modal
        title={reportedAccount ? `禁用账号：${reportedAccount.name}` : '禁用账号'}
        open={isDisableModalOpen}
        okText="确认"
        cancelText="返回"
        okButtonProps={{ disabled: !disableDuration }}
        onCancel={() => {
          setIsDisableModalOpen(false)
          setDisableDuration(null)
        }}
        onOk={() => {
          if (!reportedAccount || !disableDuration)
            return

          const disabledUntil = buildDisabledUntil(disableDuration)
          setAccounts(prev => prev.map(account => (
            account.id === reportedAccount.id
              ? { ...account, disabledUntil }
              : account
          )))
          setIsDisableModalOpen(false)
          setDisableDuration(null)
          message.success('该账号已禁用')
        }}
      >
        <Radio.Group
          options={[
            { label: '7天', value: '7d' },
            { label: '1个月', value: '1m' },
            { label: '半年', value: '6m' },
            { label: '1年', value: '1y' },
          ]}
          value={disableDuration}
          onChange={event => setDisableDuration(event.target.value as DisableDuration)}
        />
      </Modal>
    </Space>
  )
}
