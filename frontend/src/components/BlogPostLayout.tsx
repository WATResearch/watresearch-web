import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { PostMeta } from '../types/blog'

interface Props extends PostMeta {
  children: React.ReactNode
}

const BlogPostLayout: React.FC<Props> = ({ title, author, date, tags, children }) => {
  useGSAP(() => {
    const tl = gsap.timeline()
    tl.fromTo('.post-header',
      { opacity: 0, y: 30, visibility: 'hidden' },
      { opacity: 1, y: 0, visibility: 'visible', duration: 0.8, ease: 'power3.out' },
    )
    tl.fromTo('.post-content',
      { opacity: 0, y: 30, visibility: 'hidden' },
      { opacity: 1, y: 0, visibility: 'visible', duration: 0.8, ease: 'power3.out' },
      '-=0.4',
    )
  })

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pt-24 px-6 pb-25">
      <div className="max-w-3xl mx-auto">
        <div className="post-header" style={{ visibility: 'hidden' }}>
          <Link to="/blog" className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white text-sm inline-flex items-center gap-1">&larr; Back to blog</Link>
          <h1 className="text-2xl md:text-4xl font-bold mt-4">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            {author} &middot; {new Date(date).toLocaleDateString()}
          </p>
          {tags.length > 0 && (
            <div className="flex gap-2 mt-3">
              {tags.map(tag => (
                <span key={tag} className="text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="post-content mt-8 text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none" style={{ visibility: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default BlogPostLayout
