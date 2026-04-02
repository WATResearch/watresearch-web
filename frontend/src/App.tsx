import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/ThemeToggle'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Research from './pages/Research'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import NotFound from './pages/NotFound'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <NavBar />
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/research" element={<Research />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
