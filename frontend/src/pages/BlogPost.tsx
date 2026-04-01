import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import type { BlogPost as BlogPostType } from '../types/blog'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002'

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/v1/blogs/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(setPost)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (post && !loading) {
      const timer = setTimeout(() => setReady(true), 25)
      return () => clearTimeout(timer)
    }
  }, [post, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-400">Post not found.</p>
          <Link to="/blog" className="text-gray-500 hover:text-white mt-4 inline-block">Back to blog</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 pb-25">
      <div className={`max-w-3xl mx-auto ${ready ? 'animate-fade-up' : 'opacity-0'}`}>
        <Link to="/blog" className="text-gray-500 hover:text-white text-sm">Back to blog</Link>
        <h1 className="text-4xl font-bold mt-4">{post.title}</h1>
        <p className="text-gray-400 mt-2 text-sm">
          {post.author} · {new Date(post.created_at).toLocaleDateString()}
        </p>
        {post.tags.length > 0 && (
          <div className="flex gap-2 mt-3">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs text-gray-400 border border-gray-700 rounded px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className={`mt-8 text-gray-300 prose prose-invert max-w-none ${ready ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
          <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{post.content}</Markdown>
        </div>
      </div>
    </div>
  )
}

export default BlogPost
