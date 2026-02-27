import axios from 'axios'

export class RequestError extends Error {
  code?: number
  status?: number

  constructor(message: string, options?: { code?: number, status?: number }) {
    super(message)
    this.name = 'RequestError'
    this.code = options?.code
    this.status = options?.status
  }
}

interface BackendErrorPayload {
  code?: number
  message?: string
  msg?: string
}

function getBackendErrorMessage(data: unknown) {
  if (typeof data !== 'object' || data === null)
    return null

  const payload = data as BackendErrorPayload
  return payload.message ?? payload.msg ?? null
}

export function resolveRequestError(error: unknown, fallbackMessage: string) {
  if (error instanceof RequestError)
    return error

  if (!axios.isAxiosError(error))
    return new RequestError(fallbackMessage)

  const message = getBackendErrorMessage(error.response?.data) ?? error.message ?? fallbackMessage

  return new RequestError(message, {
    code: typeof error.response?.data?.code === 'number' ? error.response.data.code : undefined,
    status: error.response?.status,
  })
}

export function resolveErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof RequestError)
    return error.message

  if (error instanceof Error)
    return error.message

  return fallbackMessage
}
