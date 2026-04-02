import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Markdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { getPost } from '../api/blog'
import type { BlogPost as BlogPostType } from '../types/blog'

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [loading, setLoading] = useState(true)
  const animated = useRef(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    getPost(slug!)
      .then(({ data }) => setPost(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  useGSAP(() => {
    if (!post || loading || animated.current) return
    animated.current = true

    const tl = gsap.timeline()
    tl.to('.loading-indicator', {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set('.loading-indicator', { display: 'none' })
      },
    })
    tl.fromTo('.post-header',
      { opacity: 0, y: 30, visibility: 'hidden' },
      { opacity: 1, y: 0, visibility: 'visible', duration: 0.8, ease: 'power3.out' },
    )
    tl.fromTo('.post-content',
      { opacity: 0, y: 30, visibility: 'hidden' },
      { opacity: 1, y: 0, visibility: 'visible', duration: 0.8, ease: 'power3.out' },
      '-=0.4',
    )
  }, { dependencies: [post, loading] })

  if (error || (!loading && !post)) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pt-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-500 dark:text-gray-400">Post not found.</p>
          <Link to="/blog" className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white mt-4 inline-block">Back to blog</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pt-24 px-6 pb-25">
      <div className="loading-indicator flex items-center justify-center" style={{ minHeight: loading ? '60vh' : 'auto' }}>
        {loading && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}
      </div>
      {post && (
        <div className="max-w-3xl mx-auto">
          <div className="post-header" style={{ visibility: 'hidden' }}>
            <Link to="/blog" className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white text-sm inline-flex items-center gap-1">&larr; Back to blog</Link>
            <h1 className="text-4xl font-bold mt-4">{post.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              {post.author} · {new Date(post.created_at).toLocaleDateString()}
            </p>
            {post.tags.length > 0 && (
              <div className="flex gap-2 mt-3">
                {post.tags.map(tag => (
                  <span key={tag} className="text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="post-content mt-8 text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none" style={{ visibility: 'hidden' }}>
            <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{post.content}</Markdown>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlogPost
