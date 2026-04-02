import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { getPosts } from '../api/blog'
import type { BlogPost } from '../types/blog'

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const animated = useRef(false)
  const pageSize = 10

  useEffect(() => {
    setLoading(true)
    getPosts(page, pageSize)
      .then(({ data }) => {
        setPosts(data.items)
        setTotal(data.total)
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [page])

  useGSAP(() => {
    if (loading || posts.length === 0 || animated.current) return
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
    tl.fromTo('.blog-title',
      { opacity: 0, y: 30, visibility: 'hidden' },
      { opacity: 1, y: 0, visibility: 'visible', duration: 0.8, ease: 'power3.out' },
    )
    tl.fromTo('.blog-card',
      { opacity: 0, y: 30, visibility: 'hidden' },
      { opacity: 1, y: 0, visibility: 'visible', duration: 0.5, stagger: 0.08, ease: 'power3.out' },
      '-=0.4',
    )
  }, { dependencies: [loading, posts] })

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pt-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="blog-title text-4xl font-bold mb-8" style={{ visibility: 'hidden' }}>Blog</h1>

        {loading ? (
          <div className="loading-indicator flex items-center justify-center" style={{ minHeight: '60vh' }}>
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
            <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="blog-card block border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                style={{ visibility: 'hidden' }}
              >
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                  {post.author} · {new Date(post.created_at).toLocaleDateString()}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{post.description}</p>
                {post.tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded px-2 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-10">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page <= 1}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400 dark:text-gray-500">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Blog
