import type { PostEntry } from '../types/blog'

const posts: PostEntry[] = [
  {
    slug: 'speculative-decoding',
    title: 'Speculative Decoding',
    description: '',
    author: 'Aaron Kang',
    date: '2026-04-18',
    tags: [],
    component: () => import('./posts/speculative-decoding/index'),
  },
  {
    slug: 'vae',
    title: 'Variational Autoencoders (VAEs)',
    description: '',
    author: 'Aaron Kang',
    date: '2026-04-10',
    tags: [],
    component: () => import('./posts/vae/index'),
  },
  {
    slug: 'mdlm',
    title: 'Masked Diffusion Language Models (MDLMs)',
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
