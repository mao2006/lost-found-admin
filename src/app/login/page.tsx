'use client'

import type { AdminRole } from '@/constants/admin-access'
import { App, Button, Card, Form, Input, Modal, Space, Typography } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ADMIN_ROLE_LABEL, getDefaultRouteByRole } from '@/constants/admin-access'
import { useAuthStore } from '@/stores/use-auth-store'

const { Text, Title } = Typography

const PASSWORD_RULE_TEXT = '密码由 6 - 16 位字母（区分大小写）、数字或符号组成'
const PASSWORD_PATTERN = /^\S{6,16}$/

interface LoginFormValues {
  employeeNo: string
  password: string
}

interface ForgotPasswordFormValues {
  confirmPassword: string
  newPassword: string
  oldPassword: string
  studentNo: string
}

function resolveRoleByEmployeeNo(employeeNo: string): AdminRole {
  if (employeeNo === '1')
    return 'lost_found_admin'
  if (employeeNo === '2')
    return 'system_admin'

  return Math.random() > 0.5 ? 'system_admin' : 'lost_found_admin'
}

export default function LoginPage() {
  const router = useRouter()
  const { message } = App.useApp()
  const login = useAuthStore(state => state.login)
  const isLoggedIn = useAuthStore(state => state.isLoggedIn)
  const role = useAuthStore(state => state.role)
  const [forgotPasswordForm] = Form.useForm<ForgotPasswordFormValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false)

  useEffect(() => {
    if (isLoggedIn && role) {
      router.replace(getDefaultRouteByRole(role))
    }
  }, [isLoggedIn, role, router])

  const openForgotModal = () => {
    setIsForgotOpen(true)
    forgotPasswordForm.resetFields()
  }

  const closeForgotModal = () => {
    setIsForgotOpen(false)
    forgotPasswordForm.resetFields()
  }

  const handleLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 450))
    setIsSubmitting(false)

    const employeeNo = values.employeeNo.trim()
    const loginRole = resolveRoleByEmployeeNo(employeeNo)

    login({
      employeeNo,
      role: loginRole,
    })
    message.success(`登录成功，当前身份：${ADMIN_ROLE_LABEL[loginRole]}`)
    router.push(getDefaultRouteByRole(loginRole))
  }

  const handleForgotConfirm = async (_values: ForgotPasswordFormValues) => {
    setIsForgotSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 450))
    setIsForgotSubmitting(false)
    message.success('密码修改成功')
    setIsForgotOpen(false)
    forgotPasswordForm.resetFields()
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-28 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(255_255_255_/_0.45)_0%,transparent_58%)]" />

      <Card
        className="relative w-full max-w-md"
        style={{
          borderRadius: 18,
          border: '1px solid rgb(255 255 255 / 0.65)',
          background: 'rgb(255 255 255 / 0.78)',
          boxShadow: '0 24px 60px -28px rgba(15, 23, 42, 0.38)',
          backdropFilter: 'blur(6px)',
        }}
        styles={{
          body: {
            padding: 32,
          },
        }}
      >
        <div className="mb-7 space-y-2 text-center">
          <Text className="text-xs tracking-[0.24em] text-slate-500">
            LOST & FOUND ADMIN
          </Text>
          <Title level={3} className="!m-0 !text-slate-900">
            失物招领管理平台
          </Title>
        </div>

        <Form
          layout="vertical"
          requiredMark={false}
          size="large"
          onFinish={handleLogin}
        >
          <Text type="secondary" className="!mb-4 !block">
            账号 1 默认进入失物招领管理员，账号 2 默认进入系统管理员，其它账号随机分流。
          </Text>

          <Form.Item
            className="!mb-4"
            label="工号"
            name="employeeNo"
            rules={[{ required: true, message: '请输入工号' }]}
          >
            <Input placeholder="请输入工号" allowClear />
          </Form.Item>

          <Form.Item
            className="!mb-4"
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item className="!mb-3">
            <Button type="primary" htmlType="submit" block loading={isSubmitting}>
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={openForgotModal}
            className="cursor-pointer bg-transparent text-sm text-slate-500 transition hover:text-slate-900"
          >
            忘记密码
          </button>
        </div>
      </Card>

      <Modal
        title="忘记密码"
        open={isForgotOpen}
        onCancel={closeForgotModal}
        onOk={() => forgotPasswordForm.submit()}
        okText="确认"
        cancelText="取消"
        confirmLoading={isForgotSubmitting}
        destroyOnHidden
      >
        <Space direction="vertical" size={2} className="mb-4 w-full">
          <Text type="secondary">为统一验证系统密码</Text>
          <Text type="secondary">{PASSWORD_RULE_TEXT}</Text>
        </Space>

        <Form
          form={forgotPasswordForm}
          layout="vertical"
          requiredMark={false}
          onFinish={handleForgotConfirm}
          autoComplete="off"
        >
          <Form.Item
            className="!mb-3"
            label="学号"
            name="studentNo"
            rules={[{ required: true, message: '请输入学号' }]}
          >
            <Input placeholder="请输入学号" autoComplete="off" />
          </Form.Item>

          <Form.Item
            className="!mb-3"
            label="原密码"
            name="oldPassword"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>

          <Form.Item
            className="!mb-3"
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { pattern: PASSWORD_PATTERN, message: PASSWORD_RULE_TEXT },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            className="!mb-3"
            label="确认密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value)
                    return Promise.resolve()
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  )
}
