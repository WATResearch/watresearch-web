import { useRef, useEffect } from 'react'
import gsap from 'gsap'

const SENTENCE = ['The', 'old', 'cat', 'sat', 'on', 'the', 'warm', 'mat']

// Reveal order (which token unmasks at each step) + fake confidence
const STEPS: { idx: number; conf: number }[] = [
  { idx: 5, conf: 0.95 },  // "the" — very confident (common word)
  { idx: 3, conf: 0.88 },  // "sat"
  { idx: 0, conf: 0.85 },  // "The"
  { idx: 7, conf: 0.78 },  // "mat"
  { idx: 4, conf: 0.72 },  // "on"
  { idx: 6, conf: 0.65 },  // "warm"
  { idx: 1, conf: 0.58 },  // "old"
  { idx: 2, conf: 0.51 },  // "cat"
]

export default function ReverseProcessDemo() {
  const tokenRefs = useRef<(HTMLDivElement | null)[]>([])
  const confRefs = useRef<(HTMLDivElement | null)[]>([])
  const stepRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const tokens = tokenRefs.current.filter(Boolean) as HTMLDivElement[]
    const confs = confRefs.current.filter(Boolean) as HTMLDivElement[]
    if (tokens.length === 0) return

    const tl = gsap.timeline({ repeat: -1 })

    // Reset: all masked
    tl.call(() => {
      tokens.forEach(el => {
        el.querySelector('.token-text')!.textContent = '[MASK]'
        el.className = 'relative flex flex-col items-center gap-1'
        const pill = el.querySelector('.pill') as HTMLElement
        pill.className = 'pill px-2 py-1 rounded-md font-mono text-xs bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
      })
      confs.forEach(el => {
        el.style.opacity = '0'
        el.style.width = '0%'
      })
      if (stepRef.current) stepRef.current.textContent = 't = T (fully masked)'
    })
    tl.to({}, { duration: 1.5 })

    // Reverse steps
    STEPS.forEach((step, si) => {
      const el = tokens[step.idx]
      const confBar = confs[step.idx]

      // Show confidence bar
      tl.call(() => {
        if (stepRef.current) stepRef.current.textContent = `step ${si + 1}/${STEPS.length} — confidence: ${(step.conf * 100).toFixed(0)}%`
      })
      tl.to(confBar, { opacity: 1, width: `${step.conf * 100}%`, duration: 0.3, ease: 'power2.out' })
      tl.to({}, { duration: 0.2 })

      // Reveal token
      tl.call(() => {
        el.querySelector('.token-text')!.textContent = SENTENCE[step.idx]
        const pill = el.querySelector('.pill') as HTMLElement
        pill.className = 'pill px-2 py-1 rounded-md font-mono text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
        gsap.fromTo(pill, { scale: 1.15 }, { scale: 1, duration: 0.25, ease: 'back.out(2)' })
      })

      // Fade confidence bar
      tl.to(confBar, { opacity: 0, duration: 0.2 }, '+=0.15')
      tl.to({}, { duration: 0.25 })
    })

    // Done
    tl.call(() => {
      if (stepRef.current) stepRef.current.textContent = 't = 0 (fully recovered)'
    })
    tl.to({}, { duration: 2.5 })

    return () => { tl.kill() }
  }, [])

  return (
    <div className="not-prose my-8">
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {SENTENCE.map((_, i) => (
          <div key={i} ref={el => { tokenRefs.current[i] = el }} className="relative flex flex-col items-center gap-1">
            <span className="pill px-2 py-1 rounded-md font-mono text-xs bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
              <span className="token-text">[MASK]</span>
            </span>
            {/* Confidence bar */}
            <div className="w-full h-1 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
              <div
                ref={el => { confRefs.current[i] = el }}
                className="h-full rounded-full bg-emerald-400 dark:bg-emerald-500"
                style={{ opacity: 0, width: '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <span ref={stepRef} className="text-xs text-gray-400 dark:text-gray-500">t = T (fully masked)</span>
      </div>
    </div>
  )
}
