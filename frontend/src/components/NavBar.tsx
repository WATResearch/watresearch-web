import { Link } from 'react-router-dom'

const NavBar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex items-center gap-8 bg-black">
      <Link to="/" className="text-white text-xl font-semibold tracking-tight">
        WATResearch
      </Link>
      <div className="flex gap-8 ml-8">
        <Link to="/research" className="text-sm text-gray-300 hover:text-white transition-colors">Research</Link>
        <Link to="/blog" className="text-sm text-gray-300 hover:text-white transition-colors">Blog</Link>
      </div>
    </nav>
  )
}

export default NavBar
