import axios from 'axios'
import { useAuthStore } from '@/stores/use-auth-store'
import { resolveRequestError } from './errors'

const DEFAULT_TIMEOUT = 10000
const DEFAULT_BASE_URL = '/api'

// eslint-disable-next-line node/prefer-global/process
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL

export const httpClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: DEFAULT_TIMEOUT,
})

httpClient.interceptors.request.use((config) => {
  config.headers.Accept = 'application/json'

  const token = useAuthStore.getState().token
  if (token)
    config.headers.Authorization = `Bearer ${token}`

  return config
})

httpClient.interceptors.response.use(
  response => response,
  error => Promise.reject(resolveRequestError(error, '请求失败，请稍后重试')),
)
