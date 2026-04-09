import type { PostEntry } from '../../types/blog'

const posts: PostEntry[] = [
  {
    slug: 'example-post',
    title: 'Example Blog Post',
    description: 'A demonstration of the new blog system.',
    author: 'Aaron Kang',
    date: '2026-04-09',
    tags: ['demo'],
    component: () => import('./example-post'),
  },
]

export default posts
