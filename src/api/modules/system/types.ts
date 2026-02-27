export interface SystemConfig {
  claim_validity_days: number
  feedback_types: string[]
  item_types: string[]
  publish_limit: number
}

export interface UpdateSystemConfigRequest {
  claim_validity_days?: number
  config_key: 'feedback_types' | 'item_types' | 'claim_validity_days' | 'publish_limit'
  feedback_types?: string[]
  item_types?: string[]
  publish_limit?: number
}
