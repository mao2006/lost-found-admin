import type { PostListRequest } from '@/api/modules/post'
import { useQuery } from '@tanstack/react-query'
import { getPostList } from '@/api/modules/post'
import { queryKeys } from '@/query/query-keys'

export function usePostListQuery(params: PostListRequest) {
  return useQuery({
    queryFn: () => getPostList(params),
    queryKey: queryKeys.post.list(params),
  })
}
