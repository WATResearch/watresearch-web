import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

const Home: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.to('.hero-title', {
      textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 50px rgba(150,150,255,0.3)',
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
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="hero-stagger hero-title text-7xl font-bold tracking-tight">WATResearch</h1>
      <p className="hero-stagger mt-4 text-lg text-gray-400">Advancing AI research at the University of Waterloo</p>
    </div>
  )
}

export default Home
