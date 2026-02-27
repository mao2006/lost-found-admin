export interface AnnouncementListRequest {
  page?: number
  page_size?: number
}

export interface AnnouncementItem {
  content: string
  created_at: string
  id: number
  publisher_id?: number
  title: string
  type: string
}

export interface AnnouncementListResponse {
  list: AnnouncementItem[]
  page: number
  page_size: number
  total: number
}

export interface PublishAnnouncementRequest {
  content: string
  title: string
  type: 'SYSTEM' | 'REGION'
}

export interface PublishAnnouncementResponse {
  id: number
}

export interface ApproveAnnouncementRequest {
  id: number
}
