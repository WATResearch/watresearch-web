import client from './client'
import type { BlogPost, PaginatedResponse } from '../types/blog'

export const getPosts = (page: number, pageSize: number) =>
  client.get<PaginatedResponse<BlogPost>>('/blogs/', { params: { page, page_size: pageSize } })

export const getPost = (slug: string) =>
  client.get<BlogPost>(`/blogs/${slug}`)
