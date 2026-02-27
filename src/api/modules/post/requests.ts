import type { PostListRequest, PostListResponse } from './types'
import { request } from '@/api/core/request'
import { toCampusParam, toPublishTypeParam } from '@/api/shared/transforms'

export function getPostList(params: PostListRequest = {}) {
  return request<PostListResponse>({
    method: 'GET',
    params: {
      campus: toCampusParam(params.campus),
      end_time: params.end_time,
      item_type: params.item_type,
      location: params.location,
      page: params.page,
      page_size: params.page_size,
      publish_type: toPublishTypeParam(params.publish_type),
      start_time: params.start_time,
      status: params.status,
    },
    url: '/post/list',
  })
}
