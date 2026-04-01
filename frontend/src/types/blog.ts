export interface BlogPost {
  id: string
  title: string
  slug: string
  description: string
  content: string
  author: string
  tags: string[]
  created_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}
