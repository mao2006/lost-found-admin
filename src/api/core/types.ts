export interface ApiEnvelope<T> {
  code: number
  data: T
  message: string
}

export function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  if (typeof value !== 'object' || value === null)
    return false

  return 'code' in value && 'message' in value && 'data' in value
}
