import type { PostEntry } from '../types/blog'

const posts: PostEntry[] = [
  {
    slug: 'mdlm',
    title: 'MDLM',
    description: '',
    author: 'Aaron Kang',
    date: '2026-04-09',
    tags: [],
    component: () => import('./posts/mdlm/index'),
  },
  {
    slug: 'example-post',
    title: 'Example Blog Post',
    description: 'A demonstration of the new blog system.',
    author: 'Aaron Kang',
    date: '2026-04-09',
    tags: ['demo'],
    component: () => import('./posts/example-post'),
  },
]

export default posts
