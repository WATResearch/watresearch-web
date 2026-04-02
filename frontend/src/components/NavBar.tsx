import { Link } from 'react-router-dom'

const NavBar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-4 md:py-6 flex items-center gap-4 md:gap-8 bg-white dark:bg-black">
      <Link to="/" className="text-gray-900 dark:text-white text-lg md:text-xl font-semibold tracking-tight">
        WATResearch
      </Link>
      <div className="flex gap-3 md:gap-8 ml-auto md:ml-8">
        <Link to="/research" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded-full px-4 py-2 transition-colors">Research</Link>
        <Link to="/blog" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded-full px-4 py-2 transition-colors">Blog</Link>
      </div>
    </nav>
  )
}

export default NavBar
