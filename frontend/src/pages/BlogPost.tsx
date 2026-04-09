import React, { Suspense, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import posts from '../content/posts'
import BlogPostLayout from '../components/BlogPostLayout'

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()

  const entry = useMemo(() => posts.find(p => p.slug === slug), [slug])

  const LazyComponent = useMemo(() => {
    if (!entry) return null
    return React.lazy(entry.component)
  }, [entry])

  if (!entry || !LazyComponent) {
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
    <BlogPostLayout {...entry}>
      <Suspense fallback={
        <div className="flex items-center justify-center" style={{ minHeight: '40vh' }}>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      }>
        <LazyComponent />
      </Suspense>
    </BlogPostLayout>
  )
}

export default BlogPost
