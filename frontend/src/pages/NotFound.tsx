import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-6xl font-bold">404</h1>
      <p className="mt-4 text-gray-500 dark:text-gray-400">Page not found.</p>
      <Link to="/" className="mt-6 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors">Go home</Link>
    </div>
  )
}

export default NotFound
