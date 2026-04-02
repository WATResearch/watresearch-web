import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTheme } from '../context/ThemeContext'

const Moon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
  </svg>
)

const Sun = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  const knobRef = useRef<HTMLSpanElement>(null)
  const moonRef = useRef<HTMLSpanElement>(null)
  const sunRef = useRef<HTMLSpanElement>(null)
  const firstRender = useRef(true)

  useGSAP(() => {
    if (firstRender.current) {
      firstRender.current = false
      gsap.set(knobRef.current, { x: isDark ? 24 : 0 })
      gsap.set(moonRef.current, { opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0 })
      gsap.set(sunRef.current, { opacity: isDark ? 0 : 1, scale: isDark ? 0 : 1 })
      return
    }

    const tl = gsap.timeline()

    tl.to(knobRef.current, {
      x: isDark ? 24 : 0,
      rotation: isDark ? '+=360' : '-=360',
      duration: 0.4,
      ease: 'power2.inOut',
    }, 0)

    tl.to(isDark ? sunRef.current : moonRef.current, {
      opacity: 0,
      scale: 0,
      duration: 0.2,
      ease: 'power2.in',
    }, 0)

    tl.to(isDark ? moonRef.current : sunRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
    }, 0.2)
  }, { dependencies: [isDark] })

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="fixed bottom-6 left-6 z-50 flex items-center w-14 h-8 rounded-full p-1 bg-gray-200 dark:bg-gray-700 cursor-pointer"
    >
      <span
        ref={knobRef}
        className="w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white"
      >
        <span ref={moonRef} className="absolute">
          <Moon />
        </span>
        <span ref={sunRef} className="absolute">
          <Sun />
        </span>
      </span>
    </button>
  )
}

export default ThemeToggle
