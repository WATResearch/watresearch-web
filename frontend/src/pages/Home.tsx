import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTheme } from '../context/ThemeContext'

gsap.registerPlugin(useGSAP)

const Home: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useGSAP(() => {
    const shadow = theme === 'dark'
      ? '0 0 20px rgba(255,255,255,0.5), 0 0 50px rgba(150,150,255,0.3)'
      : '0 0 20px rgba(0,0,0,0.15), 0 0 50px rgba(100,100,200,0.2)'

    gsap.to('.hero-title', {
      textShadow: shadow,
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: 'sine.inOut',
    })

    gsap.from('.hero-stagger', {
      opacity: 0,
      y: 30,
      duration: 1.2,
      stagger: 0.3,
      ease: 'power3.out',
    })
  }, { scope: containerRef, dependencies: [theme] })

  return (
    <div ref={containerRef} className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col items-center justify-center">
      <h1 className="hero-stagger hero-title text-7xl font-bold tracking-tight">WATResearch</h1>
      <p className="hero-stagger mt-4 text-lg text-gray-500 dark:text-gray-400">Advancing AI research at the University of Waterloo</p>
    </div>
  )
}

export default Home
