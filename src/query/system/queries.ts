import { useQuery } from '@tanstack/react-query'
import { getSystemConfig } from '@/api/modules/system'
import { queryKeys } from '@/query/query-keys'

export function useSystemConfigQuery() {
  return useQuery({
    queryFn: getSystemConfig,
    queryKey: queryKeys.system.config(),
  })
}
