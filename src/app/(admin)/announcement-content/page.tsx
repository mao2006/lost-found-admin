'use client'

import type { PublishKind, RegionalAnnouncement, ReviewPublishPost } from '@/mock/system-admin'
import { App, Button, Card, Descriptions, Empty, Flex, Image, Input, Segmented, Space, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { REGIONAL_ANNOUNCEMENTS, REVIEW_PUBLISH_POSTS } from '@/mock/system-admin'
import { formatDate, formatDateTime } from '@/utils/admin-mock'

const { TextArea } = Input

type MainTab = 'global' | 'regional' | 'review'

const KIND_LABEL: Record<PublishKind, string> = {
  lost: '失物',
  found: '招领',
}

export default function AnnouncementContentPage() {
  const { message } = App.useApp()
  const [activeTab, setActiveTab] = useState<MainTab>('global')
  const [globalContent, setGlobalContent] = useState('')
  const [regionalAnnouncements, setRegionalAnnouncements] = useState<RegionalAnnouncement[]>([...REGIONAL_ANNOUNCEMENTS])
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(REGIONAL_ANNOUNCEMENTS[0]?.id ?? null)

  const [postKind, setPostKind] = useState<PublishKind>('lost')
  const [reviewPosts, setReviewPosts] = useState<ReviewPublishPost[]>([...REVIEW_PUBLISH_POSTS])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const sortedAnnouncements = useMemo(
    () => [...regionalAnnouncements].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    [regionalAnnouncements],
  )

  const selectedAnnouncement = useMemo(
    () => sortedAnnouncements.find(item => item.id === selectedAnnouncementId) ?? null,
    [selectedAnnouncementId, sortedAnnouncements],
  )

  const visibleReviewPosts = useMemo(() => {
    return reviewPosts
      .filter(post => post.kind === postKind)
      .sort((a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime())
  }, [postKind, reviewPosts])

  const selectedPost = useMemo(
    () => reviewPosts.find(post => post.id === selectedPostId) ?? null,
    [reviewPosts, selectedPostId],
  )

  const handleApproveAnnouncement = () => {
    if (!selectedAnnouncement)
      return

    setRegionalAnnouncements(prev => prev.map(item => (
      item.id === selectedAnnouncement.id
        ? { ...item, status: 'approved' }
        : item
    )))
    message.success('区域公告审核通过')
  }

  const handleDeletePost = () => {
    if (!selectedPost)
      return

    setReviewPosts(prev => prev.filter(item => item.id !== selectedPost.id))
    setSelectedPostId(null)
    message.success('发布信息已删除')
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      <Card>
        <Flex vertical gap={10}>
          <Typography.Title level={4} className="!mb-0">
            公告与内容管理
          </Typography.Title>
          <Typography.Text type="secondary">发布全局公告、审核区域公告、审核发布信息</Typography.Text>
          <Segmented
            block
            value={activeTab}
            options={[
              { label: '发布全局公告', value: 'global' },
              { label: '审核区域公告', value: 'regional' },
              { label: '审核发布信息', value: 'review' },
            ]}
            onChange={value => setActiveTab(value as MainTab)}
          />
        </Flex>
      </Card>

      {activeTab === 'global' && (
        <Card title="发布全局公告">
          <Space direction="vertical" size={12} className="w-full">
            <TextArea
              rows={8}
              maxLength={1000}
              value={globalContent}
              placeholder="请输入公告内容（限1000字）"
              onChange={event => setGlobalContent(event.target.value)}
            />
            <Button
              type="primary"
              className="w-fit"
              disabled={!globalContent.trim()}
              onClick={() => {
                setGlobalContent('')
                message.success('全局公告已发布')
              }}
            >
              确认
            </Button>
          </Space>
        </Card>
      )}

      {activeTab === 'regional' && (
        <Flex vertical gap={16}>
          <Card title="区域公告列表">
            <Space direction="vertical" size={10} className="w-full">
              {sortedAnnouncements.length === 0 && <Empty description="暂无区域公告" />}
              {sortedAnnouncements.map(item => (
                <Button
                  key={item.id}
                  block
                  className="!h-auto !justify-start !rounded-lg !border-sky-100 !px-4 !py-3 !text-left"
                  onClick={() => setSelectedAnnouncementId(item.id)}
                >
                  <Flex justify="space-between" align="center" className="w-full gap-2">
                    <Space wrap>
                      <Typography.Text strong>{item.title}</Typography.Text>
                      <Tag color={item.status === 'approved' ? 'success' : 'processing'}>
                        {item.status === 'approved' ? '已通过' : '待审核'}
                      </Tag>
                    </Space>
                    <Typography.Text type="secondary">{formatDate(item.publishedAt)}</Typography.Text>
                  </Flex>
                </Button>
              ))}
            </Space>
          </Card>

          {selectedAnnouncement && (
            <Card title="区域公告详情">
              <Space direction="vertical" size={16} className="w-full">
                <Typography.Title level={5} className="!mb-0">
                  {selectedAnnouncement.title}
                </Typography.Title>
                <Typography.Paragraph className="!mb-0">
                  {selectedAnnouncement.content}
                </Typography.Paragraph>
                <Flex justify="space-between" align="center">
                  <Typography.Text type="secondary">{formatDate(selectedAnnouncement.publishedAt)}</Typography.Text>
                  <Button
                    type="primary"
                    disabled={selectedAnnouncement.status === 'approved'}
                    onClick={handleApproveAnnouncement}
                  >
                    已通过
                  </Button>
                </Flex>
              </Space>
            </Card>
          )}
        </Flex>
      )}

      {activeTab === 'review' && (
        <Space direction="vertical" size={16} className="w-full">
          <Card>
            <Segmented
              value={postKind}
              options={[
                { label: '失物', value: 'lost' },
                { label: '招领', value: 'found' },
              ]}
              onChange={value => setPostKind(value as PublishKind)}
            />
          </Card>

          {!selectedPost && (
            <Card title="发布信息列表">
              <Space direction="vertical" size={10} className="w-full">
                {visibleReviewPosts.length === 0 && <Empty description="暂无可审核发布信息" />}
                {visibleReviewPosts.map(post => (
                  <Button
                    key={post.id}
                    block
                    className="!h-auto !justify-start !rounded-lg !border-sky-100 !px-4 !py-3 !text-left"
                    onClick={() => setSelectedPostId(post.id)}
                  >
                    <Flex justify="space-between" align="center" className="w-full gap-2">
                      <Space wrap>
                        <Tag color={post.kind === 'lost' ? 'gold' : 'blue'}>{KIND_LABEL[post.kind]}</Tag>
                        <Typography.Text>{post.itemName}</Typography.Text>
                        <Typography.Text type="secondary">{post.itemType}</Typography.Text>
                      </Space>
                      <Typography.Text type="secondary">{formatDateTime(post.eventTime)}</Typography.Text>
                    </Flex>
                  </Button>
                ))}
              </Space>
            </Card>
          )}

          {selectedPost && (
            <Card title="物品详情页">
              <Space direction="vertical" size={16} className="w-full">
                <Descriptions
                  bordered
                  column={{ xs: 1, md: 2 }}
                  items={[
                    { key: 'kind', label: '发布类型', children: KIND_LABEL[selectedPost.kind] },
                    { key: 'type', label: '物品类型', children: selectedPost.itemType },
                    { key: 'name', label: '名称', children: selectedPost.itemName },
                    { key: 'status', label: '物品状态', children: selectedPost.status },
                    { key: 'features', label: '描述特征', children: selectedPost.features },
                    { key: 'campus', label: '拾取/丢失校区', children: selectedPost.campus },
                    { key: 'location', label: '具体地点', children: selectedPost.locationDetail },
                    { key: 'time', label: '时间范围', children: formatDateTime(selectedPost.eventTime) },
                    { key: 'storage', label: '存放地点', children: selectedPost.storageLocation },
                    { key: 'claim', label: '认领人数', children: selectedPost.claimCount },
                    { key: 'contact', label: '联系方式', children: selectedPost.contactPhone },
                    {
                      key: 'reward',
                      label: '有无悬赏',
                      children: selectedPost.hasReward ? `有（¥${selectedPost.rewardAmount ?? 0}）` : '无',
                    },
                  ]}
                />
                <Flex wrap gap={8}>
                  {selectedPost.photos.map((photo, index) => (
                    <Image
                      key={`${selectedPost.id}-${photo}`}
                      src={photo}
                      alt={`${selectedPost.itemName}-${index + 1}`}
                      width={160}
                      height={112}
                      className="rounded-lg object-cover"
                    />
                  ))}
                </Flex>
                <Flex gap={10}>
                  <Button onClick={() => setSelectedPostId(null)}>返回</Button>
                  <Button danger type="primary" onClick={handleDeletePost}>删除</Button>
                </Flex>
              </Space>
            </Card>
          )}
        </Space>
      )}
    </Space>
  )
}
