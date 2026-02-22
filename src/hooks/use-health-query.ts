import { useQuery } from '@tanstack/react-query'
import { http } from '@/lib/http'

export interface HealthResponse {
  service: string
  status: string
  timestamp: string
}

export function useHealthQuery() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await http.get<HealthResponse>('/health')
      return data
    },
    staleTime: 30 * 1000,
  })
}
