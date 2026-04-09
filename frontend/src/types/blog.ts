import type { ComponentType } from 'react'

export interface PostMeta {
  slug: string
  title: string
  description: string
  author: string
  date: string
  tags: string[]
}

export interface PostEntry extends PostMeta {
  component: () => Promise<{ default: ComponentType }>
}
