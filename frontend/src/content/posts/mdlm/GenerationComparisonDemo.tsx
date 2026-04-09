import { useRef, useEffect } from 'react'
import gsap from 'gsap'

const GEN_SENTENCE = [
  'The', 'old', 'cat', 'sat', 'quietly', 'on', 'the', 'warm',
  'mat', 'and', 'watched', 'the', 'birds', 'fly', 'across',
  'the', 'bright', 'morning', 'sky', 'above',
]

const MDLM_ORDER = [7, 14, 2, 19, 9, 16, 4, 11, 0, 18, 6, 13, 1, 8, 15, 10, 3, 17, 5, 12]

export default function GenerationComparisonDemo() {
  const gptRefs = useRef<(HTMLSpanElement | null)[]>([])
  const mdlmRefs = useRef<(HTMLSpanElement | null)[]>([])
  const gptLabelRef = useRef<HTMLSpanElement>(null)
  const mdlmLabelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const gptEls = gptRefs.current.filter(Boolean) as HTMLSpanElement[]
    const mdlmEls = mdlmRefs.current.filter(Boolean) as HTMLSpanElement[]
    if (gptEls.length === 0) return

    const tl = gsap.timeline({ repeat: -1 })

    tl.call(() => {
      gptEls.forEach(el => {
        el.textContent = ''
        el.className = 'inline-block px-2 py-1 rounded-md font-mono text-xs min-w-[40px] h-7 border border-dashed border-gray-300 dark:border-gray-700'
      })
      mdlmEls.forEach(el => {
        el.textContent = '[MASK]'
        el.className = 'inline-block px-2 py-1 rounded-md font-mono text-xs min-w-[40px] h-7 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
        el.style.transform = ''
        el.style.opacity = '1'
      })
      if (gptLabelRef.current) gptLabelRef.current.textContent = 'waiting...'
      if (mdlmLabelRef.current) mdlmLabelRef.current.textContent = 'waiting...'
    })
    tl.to({}, { duration: 1.0 })

    for (let step = 0; step < GEN_SENTENCE.length; step++) {
      tl.call(() => {
        const el = gptEls[step]
        el.textContent = GEN_SENTENCE[step]
        el.className = 'inline-block px-2 py-1 rounded-md font-mono text-xs min-w-[40px] h-7 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
        gsap.fromTo(el, { scale: 1.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' })
        if (gptLabelRef.current) gptLabelRef.current.textContent = `step ${step + 1}/${GEN_SENTENCE.length}`
      })

      tl.call(() => {
        const idx = MDLM_ORDER[step]
        const el = mdlmEls[idx]
        el.textContent = GEN_SENTENCE[idx]
        el.className = 'inline-block px-2 py-1 rounded-md font-mono text-xs min-w-[40px] h-7 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
        gsap.fromTo(el, { scale: 1.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' })
        if (mdlmLabelRef.current) mdlmLabelRef.current.textContent = `step ${step + 1}/${GEN_SENTENCE.length}`
      }, [], `+=0.0`)

      tl.to({}, { duration: 0.35 })
    }

    tl.call(() => {
      if (gptLabelRef.current) gptLabelRef.current.textContent = 'done'
      if (mdlmLabelRef.current) mdlmLabelRef.current.textContent = 'done'
    })
    tl.to({}, { duration: 2.5 })

    return () => { tl.kill() }
  }, [])

  return (
    <div className="not-prose my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-3">
          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">Autoregressive (left → right)</div>
          <div className="flex flex-wrap gap-1.5 justify-center min-h-[36px]">
            {GEN_SENTENCE.map((_, i) => (
              <span
                key={i}
                ref={el => { gptRefs.current[i] = el }}
                className="inline-block px-2 py-1 rounded-md font-mono text-xs min-w-[40px] h-7 border border-dashed border-gray-300 dark:border-gray-700"
              />
            ))}
          </div>
          <span ref={gptLabelRef} className="text-[10px] text-gray-400 dark:text-gray-500 h-4">waiting...</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Diffusion (any position)</div>
          <div className="flex flex-wrap gap-1.5 justify-center min-h-[36px]">
            {GEN_SENTENCE.map((_, i) => (
              <span
                key={i}
                ref={el => { mdlmRefs.current[i] = el }}
                className="inline-block px-2 py-1 rounded-md font-mono text-xs min-w-[40px] h-7 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
              >
                [MASK]
              </span>
            ))}
          </div>
          <span ref={mdlmLabelRef} className="text-[10px] text-gray-400 dark:text-gray-500 h-4">waiting...</span>
        </div>
      </div>
    </div>
  )
}
