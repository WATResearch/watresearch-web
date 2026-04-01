import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { BlogPost, PaginatedResponse } from '../types/blog'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const pageSize = 10

  useEffect(() => {
    setLoading(true)
    fetch(`${API_URL}/api/v1/blogs/?page=${page}&page_size=${pageSize}`)
      .then(res => res.json())
      .then((data: PaginatedResponse<BlogPost>) => {
        setPosts(data.items)
        setTotal(data.total)
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 animate-fade-up">Blog</h1>

        {loading ? (
          <div className="flex justify-center mt-32">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-400">No posts yet.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="block border border-gray-800 rounded-lg p-5 hover:border-gray-600 transition-colors animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p className="text-gray-400 mt-1 text-sm">
                  {post.author} · {new Date(post.created_at).toLocaleDateString()}
                </p>
                <p className="text-gray-300 mt-2">{post.description}</p>
                {post.tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs text-gray-400 border border-gray-700 rounded px-2 py-0.5">
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
              className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
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
