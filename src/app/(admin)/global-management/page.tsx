'use client'

import type { RangePickerProps } from 'antd/es/date-picker'
import type { ColumnsType } from 'antd/es/table'
import type { Campus, ItemStatus, SystemItem } from '@/mock/system-admin'
import { PlusOutlined } from '@ant-design/icons'
import { App, Button, Card, DatePicker, Descriptions, Empty, Flex, Image, Input, InputNumber, Modal, Segmented, Select, Space, Statistic, Table, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { DEFAULT_COMPLAINT_TYPES, DEFAULT_ITEM_TYPES, SYSTEM_ITEMS } from '@/mock/system-admin'
import { formatDateTime } from '@/utils/admin-mock'

const { RangePicker } = DatePicker
const { Text, Title } = Typography

type GlobalTab = 'overview' | 'params' | 'permission'
type OverviewStatus = Extract<ItemStatus, 'unmatched' | 'matched' | 'claimed'>

interface StatisticsRow {
  key: string
  claimed: number
  claimRate: string
  dimension: string
  matched: number
  total: number
  unmatched: number
}

const CAMPUS_OPTIONS: Campus[] = ['朝晖', '屏峰', '莫干山']
const STATUS_OPTIONS: { label: string, value: OverviewStatus }[] = [
  { label: '未匹配', value: 'unmatched' },
  { label: '已匹配', value: 'matched' },
  { label: '已认领', value: 'claimed' },
]

const OTHER_TYPE_VALUE = '__other_type__'
const OVERVIEW_STATUSES: OverviewStatus[] = ['unmatched', 'matched', 'claimed']

function buildStatisticsRows(source: SystemItem[]): StatisticsRow[] {
  const rows = new Map<string, StatisticsRow>()

  source.forEach((item) => {
    const current = rows.get(item.itemType) ?? {
      key: item.itemType,
      dimension: item.itemType,
      total: 0,
      unmatched: 0,
      matched: 0,
      claimed: 0,
      claimRate: '0%',
    }

    current.total += 1
    if (item.status === 'unmatched')
      current.unmatched += 1
    if (item.status === 'matched')
      current.matched += 1
    if (item.status === 'claimed')
      current.claimed += 1

    rows.set(item.itemType, current)
  })

  return Array.from(rows.values())
    .map(row => ({
      ...row,
      claimRate: `${Math.round((row.claimed / row.total) * 100)}%`,
    }))
    .sort((a, b) => b.total - a.total)
}

function toTimestamp(value: string) {
  return new Date(value).getTime()
}

interface TagEditorProps {
  maxLength: number
  values: string[]
  onChange: (nextValues: string[]) => void
}

function DraggableTagEditor({ maxLength, values, onChange }: TagEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [newValue, setNewValue] = useState('')

  const handleDelete = (index: number) => {
    onChange(values.filter((_, currentIndex) => currentIndex !== index))
  }

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index)
      return

    const next = [...values]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(index, 0, moved)
    onChange(next)
    setDragIndex(null)
  }

  const handleAdd = () => {
    const trimmed = newValue.trim()
    if (!trimmed || values.includes(trimmed))
      return
    onChange([...values, trimmed])
    setNewValue('')
  }

  return (
    <Space direction="vertical" size={12} className="w-full">
      <Flex wrap gap={8}>
        {values.map((value, index) => (
          <Tag
            key={value}
            closable
            draggable
            color="blue"
            onDragStart={() => setDragIndex(index)}
            onDragOver={event => event.preventDefault()}
            onDrop={() => handleDrop(index)}
            onClose={(event) => {
              event.preventDefault()
              handleDelete(index)
            }}
          >
            {value}
          </Tag>
        ))}

        <Input
          value={newValue}
          maxLength={maxLength}
          placeholder="新增标签（最多15字）"
          className="w-48"
          onChange={event => setNewValue(event.target.value)}
          onPressEnter={handleAdd}
        />
        <Button icon={<PlusOutlined />} onClick={handleAdd}>添加</Button>
      </Flex>
      <Text type="secondary">支持拖拽标签调整顺序。</Text>
    </Space>
  )
}

export default function GlobalManagementPage() {
  const { message } = App.useApp()
  const [activeTab, setActiveTab] = useState<GlobalTab>('overview')
  const [itemTypes, setItemTypes] = useState<string[]>([...DEFAULT_ITEM_TYPES])
  const [complaintTypes, setComplaintTypes] = useState<string[]>([...DEFAULT_COMPLAINT_TYPES])
  const [claimTimeoutDays, setClaimTimeoutDays] = useState(30)
  const [publishFrequency, setPublishFrequency] = useState(10)
  const [guideline, setGuideline] = useState('《失物招领内容规范》：发布信息需真实、完整，不得含违法违规内容。')

  const [selectedType, setSelectedType] = useState<string | undefined>()
  const [selectedCampus, setSelectedCampus] = useState<Campus | undefined>()
  const [selectedStatus, setSelectedStatus] = useState<OverviewStatus | undefined>()
  const [selectedRange, setSelectedRange] = useState<[string, string]>(['', ''])
  const [viewResult, setViewResult] = useState<SystemItem[]>([])
  const [detailItem, setDetailItem] = useState<SystemItem | null>(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const [isCustomTypeModalOpen, setIsCustomTypeModalOpen] = useState(false)
  const [customTypeInput, setCustomTypeInput] = useState('')

  const [editingComplaint, setEditingComplaint] = useState(false)
  const [draftComplaintTypes, setDraftComplaintTypes] = useState<string[]>([])
  const [editingItemType, setEditingItemType] = useState(false)
  const [draftItemTypes, setDraftItemTypes] = useState<string[]>([])
  const [editingTimeout, setEditingTimeout] = useState(false)
  const [draftTimeoutDays, setDraftTimeoutDays] = useState(claimTimeoutDays)

  const [editingFrequency, setEditingFrequency] = useState(false)
  const [draftFrequency, setDraftFrequency] = useState(publishFrequency)
  const [guidelineModalOpen, setGuidelineModalOpen] = useState(false)
  const [draftGuideline, setDraftGuideline] = useState(guideline)

  const overviewItems = useMemo(
    () => SYSTEM_ITEMS.filter(item => OVERVIEW_STATUSES.includes(item.status as OverviewStatus)),
    [],
  )

  const hasSelectedFilter = Boolean(
    selectedType
    || selectedCampus
    || selectedStatus
    || selectedRange[0]
    || selectedRange[1],
  )

  const statisticsRows = useMemo(
    () => buildStatisticsRows(viewResult),
    [viewResult],
  )

  const statisticsColumns: ColumnsType<StatisticsRow> = [
    { title: '物品类型', dataIndex: 'dimension', key: 'dimension' },
    { title: '总数', dataIndex: 'total', key: 'total' },
    { title: '未匹配', dataIndex: 'unmatched', key: 'unmatched' },
    { title: '已匹配', dataIndex: 'matched', key: 'matched' },
    { title: '已认领', dataIndex: 'claimed', key: 'claimed' },
    { title: '认领率', dataIndex: 'claimRate', key: 'claimRate' },
  ]

  const handleRangeChange: RangePickerProps['onChange'] = (_value, dateStrings) => {
    if (!Array.isArray(dateStrings))
      return
    const [start = '', end = ''] = dateStrings
    setSelectedRange([start, end])
  }

  const handleView = () => {
    if (!hasSelectedFilter)
      return

    const [start, end] = selectedRange
    const startTime = start ? new Date(`${start}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY
    const endTime = end ? new Date(`${end}T23:59:59`).getTime() : Number.POSITIVE_INFINITY

    const filtered = overviewItems
      .filter((item) => {
        if (selectedType && item.itemType !== selectedType)
          return false
        if (selectedCampus && item.campus !== selectedCampus)
          return false
        if (selectedStatus && item.status !== selectedStatus)
          return false

        const itemTime = toTimestamp(item.eventTime)
        return itemTime >= startTime && itemTime <= endTime
      })
      .sort((a, b) => toTimestamp(b.eventTime) - toTimestamp(a.eventTime))

    setViewResult(filtered)
    setStatsVisible(false)
    setDetailItem(null)
  }

  const handleTypeChange = (value?: string) => {
    if (value === OTHER_TYPE_VALUE) {
      setIsCustomTypeModalOpen(true)
      return
    }
    setSelectedType(value)
  }

  const handleCustomTypeConfirm = () => {
    const trimmed = customTypeInput.trim()
    if (!trimmed)
      return

    if (!itemTypes.includes(trimmed)) {
      setItemTypes(prev => [...prev, trimmed])
    }
    setSelectedType(trimmed)
    setCustomTypeInput('')
    setIsCustomTypeModalOpen(false)
  }

  const handleExport = () => {
    message.success('已按当前筛选条件导出统计数据')
  }

  const handleStartEditComplaint = () => {
    setDraftComplaintTypes([...complaintTypes])
    setEditingComplaint(true)
  }

  const handleStartEditItemType = () => {
    setDraftItemTypes([...itemTypes])
    setEditingItemType(true)
  }

  const tabOptions = [
    { label: '查看信息总览', value: 'overview' },
    { label: '修改系统参数', value: 'params' },
    { label: '信息发布权限', value: 'permission' },
  ]

  return (
    <Space direction="vertical" size={16} className="w-full">
      <Card>
        <Flex vertical gap={10}>
          <Title level={4} className="!mb-0">全局管理</Title>
          <Text type="secondary">查看统计、维护参数、配置发布权限</Text>
          <Segmented
            value={activeTab}
            options={tabOptions}
            block
            onChange={value => setActiveTab(value as GlobalTab)}
          />
        </Flex>
      </Card>

      {activeTab === 'overview' && (
        <Space direction="vertical" size={16} className="w-full">
          <Card>
            <Flex vertical gap={16}>
              <Flex wrap gap={12} className="w-full">
                <Select
                  allowClear
                  placeholder="物品类型"
                  className="w-full min-w-36 md:w-44"
                  value={selectedType}
                  options={[
                    ...itemTypes.map(type => ({ label: type, value: type })),
                    { label: '其它类型', value: OTHER_TYPE_VALUE },
                  ]}
                  onChange={handleTypeChange}
                />
                <Select
                  allowClear
                  placeholder="丢失/拾取校区"
                  className="w-full min-w-36 md:w-44"
                  value={selectedCampus}
                  options={CAMPUS_OPTIONS.map(campus => ({ label: campus, value: campus }))}
                  onChange={value => setSelectedCampus(value)}
                />
                <RangePicker className="w-full min-w-52 md:w-72" onChange={handleRangeChange} />
                <Select
                  allowClear
                  placeholder="物品状态"
                  className="w-full min-w-36 md:w-44"
                  value={selectedStatus}
                  options={STATUS_OPTIONS}
                  onChange={value => setSelectedStatus(value)}
                />
                <Button
                  type="primary"
                  disabled={!hasSelectedFilter}
                  onClick={handleView}
                >
                  查看
                </Button>
              </Flex>

              <Flex wrap gap={10}>
                <Button onClick={() => setStatsVisible(true)} disabled={viewResult.length === 0}>
                  统计数据
                </Button>
                <Button onClick={handleExport} disabled={!statsVisible || viewResult.length === 0}>
                  导出
                </Button>
              </Flex>
            </Flex>
          </Card>

          {viewResult.length === 0 && (
            <Card>
              <Empty description="请选择筛选条件后点击查看" />
            </Card>
          )}

          {viewResult.length > 0 && (
            <Card>
              <Space direction="vertical" size={12} className="w-full">
                {viewResult.map(item => (
                  <Button
                    key={item.id}
                    block
                    className="!h-auto !justify-start !rounded-lg !border-sky-100 !px-4 !py-3 !text-left"
                    onClick={() => setDetailItem(item)}
                  >
                    <Flex justify="space-between" align="center" className="w-full gap-2">
                      <Space wrap>
                        <Tag color="blue">{item.itemType}</Tag>
                        <Text>{item.itemName}</Text>
                        <Text type="secondary">
                          {item.campus}
                          {' '}
                          ·
                          {' '}
                          {item.locationDetail}
                        </Text>
                      </Space>
                      <Text type="secondary">{formatDateTime(item.eventTime)}</Text>
                    </Flex>
                  </Button>
                ))}
              </Space>
            </Card>
          )}

          {detailItem && (
            <Card title="物品详情">
              <Space direction="vertical" size={16} className="w-full">
                <Descriptions
                  bordered
                  column={{ xs: 1, md: 2 }}
                  items={[
                    { key: 'type', label: '物品类型', children: detailItem.itemType },
                    { key: 'name', label: '名称', children: detailItem.itemName },
                    {
                      key: 'status',
                      label: '状态',
                      children: (
                        <Tag color={detailItem.status === 'claimed' ? 'gold' : detailItem.status === 'matched' ? 'success' : 'processing'}>
                          {detailItem.status === 'unmatched' && '未匹配'}
                          {detailItem.status === 'matched' && '已匹配'}
                          {detailItem.status === 'claimed' && '已认领'}
                        </Tag>
                      ),
                    },
                    { key: 'desc', label: '描述', children: detailItem.description },
                    { key: 'feature', label: '特征', children: detailItem.features },
                    { key: 'campus', label: '拾取/丢失校区', children: detailItem.campus },
                    { key: 'location', label: '具体地点', children: detailItem.locationDetail },
                    { key: 'time', label: '时间', children: formatDateTime(detailItem.eventTime) },
                    { key: 'storage', label: '存放地点', children: detailItem.storageLocation },
                    { key: 'claimCount', label: '认领人数', children: detailItem.claimCount },
                    { key: 'contact', label: '联系方式', children: detailItem.contactPhone },
                    {
                      key: 'reward',
                      label: '有无悬赏',
                      children: detailItem.hasReward ? `有（¥${detailItem.rewardAmount ?? 0}）` : '无',
                    },
                  ]}
                />
                <Flex wrap gap={8}>
                  {detailItem.photos.map((photo, index) => (
                    <Image
                      key={`${detailItem.id}-${photo}`}
                      src={photo}
                      alt={`${detailItem.itemName}-${index + 1}`}
                      width={160}
                      height={112}
                      className="rounded-lg object-cover"
                    />
                  ))}
                </Flex>
                <Flex wrap gap={10}>
                  <Button onClick={() => setDetailItem(null)}>返回</Button>
                  <Button onClick={() => message.info('已进入投诉与反馈处理流程')}>投诉与反馈</Button>
                  <Button type="primary" onClick={() => message.success('已查看认领申请')}>认领申请</Button>
                </Flex>
              </Space>
            </Card>
          )}

          {statsVisible && (
            <Card title="统计数据">
              <Flex wrap gap={16} className="mb-4">
                <Card size="small" className="min-w-40">
                  <Statistic title="总记录数" value={viewResult.length} />
                </Card>
                <Card size="small" className="min-w-40">
                  <Statistic title="未匹配" value={viewResult.filter(item => item.status === 'unmatched').length} />
                </Card>
                <Card size="small" className="min-w-40">
                  <Statistic title="已认领" value={viewResult.filter(item => item.status === 'claimed').length} />
                </Card>
              </Flex>
              <Table
                rowKey="key"
                columns={statisticsColumns}
                dataSource={statisticsRows}
                pagination={false}
                scroll={{ x: 680 }}
              />
            </Card>
          )}
        </Space>
      )}

      {activeTab === 'params' && (
        <Space direction="vertical" size={16} className="w-full">
          <Card
            title="用户投诉与反馈类型"
            extra={!editingComplaint && <Button type="link" onClick={handleStartEditComplaint}>修改</Button>}
          >
            {!editingComplaint && (
              <Flex wrap gap={8}>
                {complaintTypes.map(type => <Tag key={type} color="blue">{type}</Tag>)}
              </Flex>
            )}
            {editingComplaint && (
              <Space direction="vertical" size={12} className="w-full">
                <DraggableTagEditor
                  maxLength={15}
                  values={draftComplaintTypes}
                  onChange={setDraftComplaintTypes}
                />
                <Flex gap={10}>
                  <Button onClick={() => setEditingComplaint(false)}>返回</Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setComplaintTypes(draftComplaintTypes)
                      setEditingComplaint(false)
                      message.success('投诉类型已更新')
                    }}
                  >
                    确认
                  </Button>
                </Flex>
              </Space>
            )}
          </Card>

          <Card
            title="物品类型分类"
            extra={!editingItemType && <Button type="link" onClick={handleStartEditItemType}>修改</Button>}
          >
            {!editingItemType && (
              <Flex wrap gap={8}>
                {itemTypes.map(type => <Tag key={type} color="blue">{type}</Tag>)}
              </Flex>
            )}
            {editingItemType && (
              <Space direction="vertical" size={12} className="w-full">
                <DraggableTagEditor
                  maxLength={15}
                  values={draftItemTypes}
                  onChange={setDraftItemTypes}
                />
                <Flex gap={10}>
                  <Button onClick={() => setEditingItemType(false)}>返回</Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setItemTypes(draftItemTypes)
                      setEditingItemType(false)
                      message.success('物品类型已更新')
                    }}
                  >
                    确认
                  </Button>
                </Flex>
              </Space>
            )}
          </Card>

          <Card
            title="认领时效（天）"
            extra={!editingTimeout && (
              <Button
                type="link"
                onClick={() => {
                  setDraftTimeoutDays(claimTimeoutDays)
                  setEditingTimeout(true)
                }}
              >
                修改
              </Button>
            )}
          >
            {!editingTimeout && (
              <Text>
                {claimTimeoutDays}
                {' '}
                天
              </Text>
            )}
            {editingTimeout && (
              <Space direction="vertical" size={12}>
                <InputNumber
                  min={1}
                  max={365}
                  addonAfter="天"
                  value={draftTimeoutDays}
                  onChange={value => setDraftTimeoutDays(value ?? claimTimeoutDays)}
                />
                <Flex gap={10}>
                  <Button onClick={() => setEditingTimeout(false)}>返回</Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setClaimTimeoutDays(draftTimeoutDays)
                      setEditingTimeout(false)
                      message.success('认领时效已更新')
                    }}
                  >
                    确认
                  </Button>
                </Flex>
              </Space>
            )}
          </Card>
        </Space>
      )}

      {activeTab === 'permission' && (
        <Space direction="vertical" size={16} className="w-full">
          <Card
            title="发布频率"
            extra={!editingFrequency && (
              <Button
                type="link"
                onClick={() => {
                  setDraftFrequency(publishFrequency)
                  setEditingFrequency(true)
                }}
              >
                修改
              </Button>
            )}
          >
            {!editingFrequency && (
              <Text>
                {publishFrequency}
                {' '}
                条/天
              </Text>
            )}
            {editingFrequency && (
              <Space direction="vertical" size={12}>
                <InputNumber
                  min={1}
                  max={200}
                  value={draftFrequency}
                  addonAfter="条/天"
                  onChange={value => setDraftFrequency(value ?? publishFrequency)}
                />
                <Flex gap={10}>
                  <Button onClick={() => setEditingFrequency(false)}>返回</Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setPublishFrequency(draftFrequency)
                      setEditingFrequency(false)
                      message.success('发布频率已更新')
                    }}
                  >
                    确认
                  </Button>
                </Flex>
              </Space>
            )}
          </Card>

          <Card title="内容规范">
            <Space direction="vertical" size={10}>
              <Button
                type="link"
                className="!px-0"
                onClick={() => {
                  setDraftGuideline(guideline)
                  setGuidelineModalOpen(true)
                }}
              >
                《失物招领内容规范》
              </Button>
              <Text type="secondary">点击链接可直接编辑，保存后内容会同步到发布页规范说明。</Text>
            </Space>
          </Card>
        </Space>
      )}

      <Modal
        title="其它类型"
        open={isCustomTypeModalOpen}
        onCancel={() => {
          setIsCustomTypeModalOpen(false)
          setCustomTypeInput('')
        }}
        onOk={handleCustomTypeConfirm}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ disabled: customTypeInput.trim().length === 0 }}
      >
        <Input
          maxLength={15}
          value={customTypeInput}
          placeholder="请输入其它类型（最多15字）"
          onChange={event => setCustomTypeInput(event.target.value)}
        />
      </Modal>

      <Modal
        title="编辑《失物招领内容规范》"
        open={guidelineModalOpen}
        width={720}
        onCancel={() => setGuidelineModalOpen(false)}
        onOk={() => {
          setGuideline(draftGuideline)
          setGuidelineModalOpen(false)
          message.success('内容规范已更新')
        }}
        okText="确认"
        cancelText="返回"
      >
        <Input.TextArea
          value={draftGuideline}
          rows={12}
          maxLength={5000}
          onChange={event => setDraftGuideline(event.target.value)}
        />
      </Modal>
    </Space>
  )
}
