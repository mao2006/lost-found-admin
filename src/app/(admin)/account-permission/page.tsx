'use client'

import type { ColumnsType } from 'antd/es/table'
import type { AccountRecord, AccountRole } from '@/mock/system-admin'
import { App, Button, Card, Flex, Form, Input, Modal, Radio, Segmented, Select, Space, Table, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { SYSTEM_ACCOUNTS } from '@/mock/system-admin'
import { formatDateTime } from '@/utils/admin-mock'

const { Text } = Typography

type MainTab = 'manage' | 'create'
type CreateTab = 'student_teacher' | 'admin'
type DisableDuration = '7d' | '1m' | '6m' | '1y'

interface DisableModalState {
  account: AccountRecord | null
  duration: DisableDuration | null
  open: boolean
}

interface RestoreModalState {
  account: AccountRecord | null
  open: boolean
}

interface NoticeModalState {
  account: AccountRecord | null
  content: string
  open: boolean
  sendType: 'all' | 'single'
}

interface CreateAccountValues {
  idCard: string
  name: string
  password: string
  role: AccountRole
  userNo: string
}

const ROLE_LABEL: Record<AccountRole, string> = {
  student: '学生',
  teacher: '老师',
  lost_found_admin: '失物招领管理员',
  system_admin: '系统管理员',
}

const ID_CARD_PATTERN = /^\d{17}[\dX]$/i
const ONLY_NUMBER_PATTERN = /^\d+$/
const DISABLE_DURATION_OPTIONS: { label: string, value: DisableDuration }[] = [
  { label: '7天', value: '7d' },
  { label: '1个月', value: '1m' },
  { label: '半年', value: '6m' },
  { label: '1年', value: '1y' },
]

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

export default function AccountPermissionPage() {
  const { message } = App.useApp()
  const [activeTab, setActiveTab] = useState<MainTab>('manage')
  const [accounts, setAccounts] = useState<AccountRecord[]>([...SYSTEM_ACCOUNTS])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [queryKeyword, setQueryKeyword] = useState('')
  const [hasQueried, setHasQueried] = useState(false)

  const [disableState, setDisableState] = useState<DisableModalState>({
    open: false,
    account: null,
    duration: null,
  })
  const [restoreState, setRestoreState] = useState<RestoreModalState>({
    open: false,
    account: null,
  })
  const [noticeState, setNoticeState] = useState<NoticeModalState>({
    open: false,
    account: null,
    content: '',
    sendType: 'single',
  })

  const [createTab, setCreateTab] = useState<CreateTab>('student_teacher')
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createForm] = Form.useForm<CreateAccountValues>()

  const displayedAccounts = useMemo(() => {
    if (!hasQueried)
      return accounts

    const keyword = queryKeyword.trim().toLowerCase()
    return accounts.filter((account) => {
      return account.userNo.includes(keyword) || account.name.toLowerCase().includes(keyword)
    })
  }, [accounts, hasQueried, queryKeyword])

  const columns: ColumnsType<AccountRecord> = [
    {
      title: '工号/学号',
      dataIndex: 'userNo',
      key: 'userNo',
      width: 120,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      key: 'idCard',
      width: 180,
    },
    {
      title: '身份',
      dataIndex: 'role',
      key: 'role',
      width: 170,
      render: role => ROLE_LABEL[role as AccountRole],
    },
    {
      title: '状态',
      key: 'status',
      width: 190,
      render: (_, record) => {
        if (!record.disabledUntil)
          return <Tag color="success">正常</Tag>
        return (
          <Tag color="warning">
            禁用至
            {formatDateTime(record.disabledUntil)}
          </Tag>
        )
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 320,
      render: (_, record) => (
        <Flex wrap gap={8}>
          <Button
            size="small"
            disabled={Boolean(record.disabledUntil)}
            onClick={() => {
              setDisableState({
                open: true,
                account: record,
                duration: null,
              })
            }}
          >
            禁用
          </Button>
          <Button
            size="small"
            disabled={!record.disabledUntil}
            onClick={() => {
              setRestoreState({
                open: true,
                account: record,
              })
            }}
          >
            恢复
          </Button>
          <Button
            size="small"
            type="primary"
            ghost
            onClick={() => {
              setNoticeState({
                open: true,
                account: record,
                content: '',
                sendType: 'single',
              })
            }}
          >
            发送系统通知
          </Button>
        </Flex>
      ),
    },
  ]

  const handleQuery = () => {
    setHasQueried(true)
    setQueryKeyword(searchKeyword)
  }

  const handleCreateConfirm = (values: CreateAccountValues) => {
    const nextRecord: AccountRecord = {
      id: `acc-${Date.now()}`,
      name: values.name,
      userNo: values.userNo,
      idCard: values.idCard,
      role: values.role,
      disabledUntil: null,
    }

    setAccounts(prev => [nextRecord, ...prev])
    setCreateSuccess(true)
    createForm.resetFields()
    createForm.setFieldsValue({
      role: createTab === 'student_teacher' ? 'student' : 'lost_found_admin',
    })
    message.success('创建成功')
  }

  const handleCreateTabChange = (nextTab: CreateTab) => {
    setCreateTab(nextTab)
    setCreateSuccess(false)
    createForm.resetFields()
    createForm.setFieldsValue({
      role: nextTab === 'student_teacher' ? 'student' : 'lost_found_admin',
    })
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      <Card>
        <Flex vertical gap={10}>
          <Typography.Title level={4} className="!mb-0">
            账号与权限管理
          </Typography.Title>
          <Typography.Text type="secondary">管理账号、禁用恢复、发送系统通知</Typography.Text>
          <Segmented
            value={activeTab}
            options={[
              { label: '管理与通知', value: 'manage' },
              { label: '新增账号', value: 'create' },
            ]}
            block
            onChange={value => setActiveTab(value as MainTab)}
          />
        </Flex>
      </Card>

      {activeTab === 'manage' && (
        <Space direction="vertical" size={16} className="w-full">
          <Card>
            <Flex wrap gap={10} align="center">
              <Input
                value={searchKeyword}
                placeholder="可按照学号/工号、姓名搜索"
                className="w-full min-w-56 md:w-96"
                onChange={event => setSearchKeyword(event.target.value)}
              />
              <Button
                type="primary"
                disabled={!searchKeyword.trim()}
                onClick={handleQuery}
              >
                查询
              </Button>
              <Button
                onClick={() => {
                  setNoticeState({
                    open: true,
                    account: null,
                    content: '',
                    sendType: 'all',
                  })
                }}
              >
                发送全体系统通知
              </Button>
              {hasQueried && (
                <Button
                  onClick={() => {
                    setHasQueried(false)
                    setSearchKeyword('')
                    setQueryKeyword('')
                  }}
                >
                  清空查询
                </Button>
              )}
            </Flex>
          </Card>

          <Card title={hasQueried ? '搜索结果' : '账号列表'}>
            <Table
              rowKey="id"
              dataSource={displayedAccounts}
              columns={columns}
              scroll={{ x: 1200 }}
              pagination={{ pageSize: 8 }}
              locale={{
                emptyText: hasQueried ? '未查询到相关账号' : '暂无账号数据',
              }}
            />
          </Card>
        </Space>
      )}

      {activeTab === 'create' && (
        <Card>
          <Space direction="vertical" size={16} className="w-full">
            <Segmented
              value={createTab}
              options={[
                { label: '学生/老师', value: 'student_teacher' },
                { label: '失物招领管理员/系统管理员', value: 'admin' },
              ]}
              onChange={value => handleCreateTabChange(value as CreateTab)}
            />

            <Form<CreateAccountValues>
              form={createForm}
              layout="vertical"
              requiredMark={false}
              initialValues={{
                role: 'student',
              }}
              onValuesChange={(changedValues, allValues) => {
                if (changedValues.idCard && createTab === 'student_teacher' && ONLY_NUMBER_PATTERN.test(changedValues.idCard)) {
                  const autoPassword = changedValues.idCard.slice(-6)
                  if (autoPassword.length === 6) {
                    createForm.setFieldValue('password', autoPassword)
                  }
                }
                if (changedValues.role) {
                  setCreateSuccess(false)
                }
                if (allValues.password) {
                  createForm.validateFields(['password']).catch(() => {})
                }
              }}
              onFinish={handleCreateConfirm}
            >
              <Form.Item
                label="姓名"
                name="name"
                rules={[
                  { required: true, message: '请输入姓名' },
                  { max: 10, message: '姓名最多 10 字' },
                ]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>

              <Form.Item
                label="学号/工号"
                name="userNo"
                rules={[
                  { required: true, message: '请输入学号/工号' },
                  {
                    validator(_, value) {
                      if (!value || ONLY_NUMBER_PATTERN.test(value))
                        return Promise.resolve()
                      return Promise.reject(new Error('学号/工号仅支持数字'))
                    },
                  },
                ]}
              >
                <Input placeholder="仅数字" />
              </Form.Item>

              <Form.Item
                label="身份证号"
                name="idCard"
                rules={[
                  { required: true, message: '请输入身份证号' },
                  { pattern: ID_CARD_PATTERN, message: '请输入合法身份证号' },
                ]}
              >
                <Input placeholder="18 位身份证号" />
              </Form.Item>

              <Form.Item
                label="身份"
                name="role"
                rules={[{ required: true, message: '请选择身份' }]}
              >
                <Select
                  options={
                    createTab === 'student_teacher'
                      ? [
                          { label: ROLE_LABEL.student, value: 'student' },
                          { label: ROLE_LABEL.teacher, value: 'teacher' },
                        ]
                      : [
                          { label: ROLE_LABEL.lost_found_admin, value: 'lost_found_admin' },
                          { label: ROLE_LABEL.system_admin, value: 'system_admin' },
                        ]
                  }
                />
              </Form.Item>

              <Form.Item
                label="密码"
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  {
                    validator(_, value) {
                      if (!value || ONLY_NUMBER_PATTERN.test(value))
                        return Promise.resolve()
                      return Promise.reject(new Error('密码仅支持数字'))
                    },
                  },
                ]}
              >
                <Input
                  placeholder={createTab === 'student_teacher' ? '初始密码默认为身份证后六位' : '分配的密码'}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit">确认</Button>
            </Form>

            {createSuccess && (
              <Card size="small">
                <Text className="text-sky-600">创建成功！</Text>
              </Card>
            )}
          </Space>
        </Card>
      )}

      <Modal
        title={disableState.account ? `禁用账号：${disableState.account.name}` : '禁用账号'}
        open={disableState.open}
        okText="确认"
        cancelText="返回"
        okButtonProps={{ disabled: !disableState.duration }}
        onCancel={() => {
          setDisableState({
            open: false,
            account: null,
            duration: null,
          })
        }}
        onOk={() => {
          if (!disableState.account || !disableState.duration)
            return

          const disabledUntil = buildDisabledUntil(disableState.duration)
          setAccounts(prev => prev.map(account => (
            account.id === disableState.account?.id
              ? { ...account, disabledUntil }
              : account
          )))

          message.success('账号已禁用')
          setDisableState({
            open: false,
            account: null,
            duration: null,
          })
        }}
      >
        <Radio.Group
          options={DISABLE_DURATION_OPTIONS}
          value={disableState.duration}
          onChange={event => setDisableState(prev => ({ ...prev, duration: event.target.value as DisableDuration }))}
        />
      </Modal>

      <Modal
        title={restoreState.account ? `恢复账号：${restoreState.account.name}` : '恢复账号'}
        open={restoreState.open}
        okText="确认"
        cancelText="返回"
        onCancel={() => {
          setRestoreState({
            open: false,
            account: null,
          })
        }}
        onOk={() => {
          if (!restoreState.account)
            return
          setAccounts(prev => prev.map(account => (
            account.id === restoreState.account?.id
              ? { ...account, disabledUntil: null }
              : account
          )))
          message.success('账号已恢复')
          setRestoreState({
            open: false,
            account: null,
          })
        }}
      >
        <Text>确认恢复该账号？</Text>
      </Modal>

      <Modal
        title={noticeState.sendType === 'all' ? '发送全体系统通知' : `发送系统通知：${noticeState.account?.name ?? ''}`}
        open={noticeState.open}
        okText="确认"
        cancelText="返回"
        okButtonProps={{ disabled: !noticeState.content.trim() }}
        onCancel={() => {
          setNoticeState({
            open: false,
            account: null,
            content: '',
            sendType: noticeState.sendType,
          })
        }}
        onOk={() => {
          if (!noticeState.content.trim())
            return
          message.success(
            noticeState.sendType === 'all'
              ? '全体系统通知已发送'
              : '系统通知已发送',
          )
          setNoticeState({
            open: false,
            account: null,
            content: '',
            sendType: noticeState.sendType,
          })
        }}
      >
        <Input.TextArea
          maxLength={1000}
          rows={6}
          value={noticeState.content}
          placeholder="请输入通知内容（最多1000字）"
          onChange={event => setNoticeState(prev => ({ ...prev, content: event.target.value }))}
        />
      </Modal>
    </Space>
  )
}
