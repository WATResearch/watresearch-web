import { useRef, useEffect } from 'react'
import gsap from 'gsap'

// Two blocks of text to generate
const BLOCK1 = ['The', 'old', 'cat', 'sat', 'quietly', 'on', 'the', 'warm']
const BLOCK2 = ['mat', 'and', 'watched', 'the', 'birds', 'fly', 'across', 'it']

// Reveal orders within each block (random positions)
const ORDER1 = [5, 2, 7, 0, 6, 3, 1, 4]
const ORDER2 = [3, 6, 0, 5, 1, 7, 4, 2]

export default function SamplingDemo() {
  const block1Refs = useRef<(HTMLSpanElement | null)[]>([])
  const block2Refs = useRef<(HTMLSpanElement | null)[]>([])
  const windowRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const b1 = block1Refs.current.filter(Boolean) as HTMLSpanElement[]
    const b2 = block2Refs.current.filter(Boolean) as HTMLSpanElement[]
    if (b1.length === 0) return

    const maskClass = 'inline-block px-1.5 py-0.5 rounded font-mono text-[11px] bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
    const revealClass = 'inline-block px-1.5 py-0.5 rounded font-mono text-[11px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
    const contextClass = 'inline-block px-1.5 py-0.5 rounded font-mono text-[11px] bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'

    const tl = gsap.timeline({ repeat: -1 })

    // Reset all
    tl.call(() => {
      b1.forEach(el => { el.textContent = '[M]'; el.className = maskClass })
      b2.forEach(el => { el.textContent = '[M]'; el.className = maskClass; el.style.opacity = '0.3' })
      if (windowRef.current) {
        windowRef.current.style.left = '0%'
        windowRef.current.style.width = '50%'
      }
      if (labelRef.current) labelRef.current.textContent = 'Block 1: generating...'
    })
    tl.to({}, { duration: 0.8 })

    // Generate block 1
    ORDER1.forEach((idx, step) => {
      tl.call(() => {
        b1[idx].textContent = BLOCK1[idx]
        b1[idx].className = revealClass
        gsap.fromTo(b1[idx], { scale: 1.15 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' })
        if (labelRef.current) labelRef.current.textContent = `Block 1: step ${step + 1}/${BLOCK1.length}`
      })
      tl.to({}, { duration: 0.25 })
    })

    tl.call(() => {
      if (labelRef.current) labelRef.current.textContent = 'Block 1 done — sliding window →'
    })
    tl.to({}, { duration: 1.0 })

    // Slide window: block 1 becomes context, block 2 becomes active
    tl.call(() => {
      // Block 1 tokens become context color
      b1.forEach(el => { el.className = contextClass })
      // Block 2 becomes visible
      b2.forEach(el => { el.style.opacity = '1' })
      if (labelRef.current) labelRef.current.textContent = 'Block 2: generating (with context)...'
    })
    if (windowRef.current) {
      tl.to(windowRef.current, { left: '50%', duration: 0.6, ease: 'power2.inOut' })
    }
    tl.to({}, { duration: 0.5 })

    // Generate block 2
    ORDER2.forEach((idx, step) => {
      tl.call(() => {
        b2[idx].textContent = BLOCK2[idx]
        b2[idx].className = revealClass
        gsap.fromTo(b2[idx], { scale: 1.15 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' })
        if (labelRef.current) labelRef.current.textContent = `Block 2: step ${step + 1}/${BLOCK2.length}`
      })
      tl.to({}, { duration: 0.25 })
    })

    tl.call(() => {
      if (labelRef.current) labelRef.current.textContent = 'Generation complete'
    })
    tl.to({}, { duration: 2.5 })

    return () => { tl.kill() }
  }, [])

  return (
    <div className="not-prose my-8 max-w-xl mx-auto">
      {/* Tokens row with sliding window indicator */}
      <div className="relative mb-2">
        {/* Window highlight */}
        <div
          ref={windowRef}
          className="absolute -inset-y-1 rounded-lg border-2 border-dashed border-emerald-400 dark:border-emerald-600 pointer-events-none transition-all"
          style={{ left: '0%', width: '50%' }}
        />

        <div className="flex flex-wrap gap-1.5 justify-center py-2">
          {/* Block 1 */}
          {BLOCK1.map((_, i) => (
            <span
              key={`b1-${i}`}
              ref={el => { block1Refs.current[i] = el }}
              className="inline-block px-1.5 py-0.5 rounded font-mono text-[11px] bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
            >
              [M]
            </span>
          ))}
          {/* Divider */}
          <span className="text-gray-300 dark:text-gray-700">|</span>
          {/* Block 2 */}
          {BLOCK2.map((_, i) => (
            <span
              key={`b2-${i}`}
              ref={el => { block2Refs.current[i] = el }}
              className="inline-block px-1.5 py-0.5 rounded font-mono text-[11px] bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
              style={{ opacity: 0.3 }}
            >
              [M]
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-[10px] mb-2">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700" />
          <span className="text-gray-400 dark:text-gray-500">generated</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700" />
          <span className="text-gray-400 dark:text-gray-500">context</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
          <span className="text-gray-400 dark:text-gray-500">[MASK]</span>
        </div>
      </div>

      <div className="text-center">
        <span ref={labelRef} className="text-xs text-gray-400 dark:text-gray-500">Block 1: generating...</span>
      </div>
    </div>
  )
}
