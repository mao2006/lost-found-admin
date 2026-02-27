export interface AccountListRequest {
  page?: number
  page_size?: number
  uid?: number
  user_type?: 'STUDENT' | 'ADMIN' | 'SYSTEM_ADMIN'
}

export interface AccountListItem {
  created_at: string
  disabled_until?: unknown
  first_login: boolean
  id: number
  name: string
  uid: number
  user_type: string
}

export interface AccountListResponse {
  list: AccountListItem[]
  page: number
  page_size: number
  total: number
}

export interface CreateAccountRequest {
  id_card: string
  name: string
  password: string
  uid: number
  user_type: 'STUDENT' | 'ADMIN' | 'SYSTEM_ADMIN'
}

export interface CreateAccountResponse {
  id: number
}

export interface DisableAccountRequest {
  duration: '7days' | '1month' | '6months' | '1year'
  id: number
}

export interface EnableAccountRequest {
  id: number
}

export interface UpdateAccountRequest {
  id: number
  reset_password: boolean
  user_type: 'STUDENT' | 'ADMIN' | 'SYSTEM_ADMIN'
}

export interface SendNotificationRequest {
  content: string
  is_global: boolean
  title: string
  user_id?: number
}

export interface SendNotificationResponse {
  id: number
}
