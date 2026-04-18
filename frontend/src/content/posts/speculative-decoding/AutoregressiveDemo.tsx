import { useRef, useEffect } from 'react'
import gsap from 'gsap'

const SENTENCE = ['The', 'old', 'cat', 'sat', 'on', 'the', 'mat', '.']

const DISTRIBUTIONS: { heights: number[]; labels: string[]; sampled: number }[] = [
  { heights: [0.95, 0.35, 0.25, 0.15, 0.08], labels: ['The', 'A',   'One', 'An',  '…'], sampled: 0 },
  { heights: [0.80, 0.55, 0.30, 0.20, 0.10], labels: ['old', 'big', 'cat', 'tired', '…'], sampled: 0 },
  { heights: [0.70, 0.60, 0.40, 0.25, 0.12], labels: ['cat', 'dog', 'man', 'fox', '…'], sampled: 0 },
  { heights: [0.88, 0.40, 0.30, 0.22, 0.10], labels: ['sat', 'ran', 'lay', 'sat', '…'], sampled: 0 },
  { heights: [0.75, 0.65, 0.35, 0.25, 0.15], labels: ['on',  'in',  'at',  'by',  '…'], sampled: 0 },
  { heights: [0.85, 0.50, 0.30, 0.20, 0.10], labels: ['the', 'a',   'that', 'some', '…'], sampled: 0 },
  { heights: [0.80, 0.55, 0.40, 0.25, 0.12], labels: ['mat', 'rug', 'bed', 'floor', '…'], sampled: 0 },
  { heights: [0.90, 0.35, 0.25, 0.15, 0.08], labels: ['.',   ',',   ';',   '!',   '…'], sampled: 0 },
]

const N_BARS = 5

export default function AutoregressiveDemo() {
  const contextRefs = useRef<(HTMLSpanElement | null)[]>([])
  const modelBoxRef = useRef<HTMLDivElement>(null)
  const barRefs = useRef<(HTMLDivElement | null)[]>([])
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])
  const distPanelRef = useRef<HTMLDivElement>(null)
  const flyingTokenRef = useRef<HTMLDivElement>(null)
  const stepLabelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const ctxEls = contextRefs.current.filter(Boolean) as HTMLSpanElement[]
    const barEls = barRefs.current.filter(Boolean) as HTMLDivElement[]
    const labelEls = labelRefs.current.filter(Boolean) as HTMLDivElement[]
    const modelBox = modelBoxRef.current
    const distPanel = distPanelRef.current
    const flying = flyingTokenRef.current
    const stepLabel = stepLabelRef.current
    if (!modelBox || !distPanel || !flying || !stepLabel || ctxEls.length === 0) return

    const emptyClass = 'inline-block px-2.5 py-1.5 rounded-md font-mono text-sm min-w-[52px] h-9 border border-dashed border-gray-300 dark:border-gray-700'
    const filledClass = 'inline-block px-2.5 py-1.5 rounded-md font-mono text-sm min-w-[52px] h-9 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'

    const resetScene = () => {
      ctxEls.forEach(el => {
        el.textContent = ''
        el.className = emptyClass
      })
      barEls.forEach(b => {
        gsap.set(b, { scaleY: 0, opacity: 0, transformOrigin: 'bottom' })
        b.className = 'w-6 rounded-sm bg-emerald-300 dark:bg-emerald-700/80'
      })
      labelEls.forEach(l => { gsap.set(l, { opacity: 0 }) })
      gsap.set(distPanel, { opacity: 1 })
      gsap.set(flying, { opacity: 0, x: 0, y: 0, scale: 1 })
      flying.textContent = ''
      stepLabel.textContent = 'ready'
    }

    resetScene()

    const tl = gsap.timeline({ repeat: -1 })
    tl.to({}, { duration: 0.8 })

    SENTENCE.forEach((token, step) => {
      const dist = DISTRIBUTIONS[step]

      // 1. Pulse context (reading)
      tl.call(() => {
        if (step === 0) {
          // first step: nothing to pulse yet, just highlight the empty first slot briefly
          gsap.fromTo(ctxEls[0], { opacity: 0.5 }, { opacity: 1, duration: 0.2 })
        } else {
          const filled = ctxEls.slice(0, step)
          gsap.fromTo(filled,
            { scale: 1 },
            { scale: 1.04, duration: 0.15, yoyo: true, repeat: 1, ease: 'sine.inOut' }
          )
        }
      })
      tl.to({}, { duration: 0.3 })

      // 2. Highlight model box
      tl.call(() => {
        gsap.fromTo(modelBox,
          { boxShadow: '0 0 0 0 rgba(96,165,250,0)' },
          { boxShadow: '0 0 0 4px rgba(96,165,250,0.35)', duration: 0.15, yoyo: true, repeat: 1, ease: 'sine.inOut' }
        )
      })
      tl.to({}, { duration: 0.3 })

      // 3. Distribution appears
      tl.call(() => {
        barEls.forEach((bar, i) => {
          bar.style.height = `${Math.round(dist.heights[i] * 76)}px`
          bar.className = 'w-6 rounded-sm bg-emerald-300 dark:bg-emerald-700/80'
          gsap.fromTo(bar,
            { scaleY: 0, opacity: 0 },
            { scaleY: 1, opacity: 1, duration: 0.25, ease: 'power2.out', delay: i * 0.03 }
          )
        })
        labelEls.forEach((label, i) => {
          label.textContent = dist.labels[i]
          gsap.fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.25, delay: i * 0.03 })
        })
      })
      tl.to({}, { duration: 0.35 })

      // 4. Sample — highlight the chosen bar and materialize flying token
      tl.call(() => {
        const chosen = barEls[dist.sampled]
        chosen.className = 'w-6 rounded-sm bg-emerald-500 dark:bg-emerald-400'

        // Position the flying token over the distribution panel (at the chosen bar)
        const panelRect = distPanel.getBoundingClientRect()
        const barRect = chosen.getBoundingClientRect()
        const startX = barRect.left + barRect.width / 2 - panelRect.left
        const startY = barRect.top - panelRect.top - flying.offsetHeight - 6

        flying.textContent = token
        gsap.set(flying, { x: startX - flying.offsetWidth / 2, y: startY, opacity: 0, scale: 1.2 })
        gsap.to(flying, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' })
      })
      tl.to({}, { duration: 0.3 })

      // 5. Token travels to the context row
      tl.call(() => {
        const slot = ctxEls[step]
        const panelRect = distPanel.getBoundingClientRect()
        const slotRect = slot.getBoundingClientRect()
        const targetX = slotRect.left + slotRect.width / 2 - panelRect.left - flying.offsetWidth / 2
        const targetY = slotRect.top + slotRect.height / 2 - panelRect.top - flying.offsetHeight / 2

        gsap.to(flying, { x: targetX, y: targetY, duration: 0.4, ease: 'power2.inOut' })
        gsap.to(distPanel, { opacity: 0.55, duration: 0.4 })
      })
      tl.to({}, { duration: 0.4 })

      // 6. Land — fill slot, hide flying token, fade distribution back for next step
      tl.call(() => {
        const slot = ctxEls[step]
        slot.textContent = token
        slot.className = filledClass
        gsap.fromTo(slot, { scale: 1.2 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' })

        gsap.to(flying, { opacity: 0, duration: 0.15 })
        gsap.to(distPanel, { opacity: 1, duration: 0.2 })
        barEls.forEach(b => { gsap.to(b, { opacity: 0, duration: 0.2 }) })
        labelEls.forEach(l => { gsap.to(l, { opacity: 0, duration: 0.2 }) })

        stepLabel.textContent = `step ${step + 1} / ${SENTENCE.length}`
      })
      tl.to({}, { duration: 0.25 })
    })

    tl.call(() => { stepLabel.textContent = 'done' })
    tl.to({}, { duration: 1.5 })
    tl.call(resetScene)
    tl.to({}, { duration: 0.5 })

    return () => { tl.kill() }
  }, [])

  return (
    <div className="not-prose my-10 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6">
        {/* Context row */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <div className="text-xs text-gray-500 dark:text-gray-400">context</div>
          <div className="flex flex-wrap gap-1.5 justify-center min-h-[44px] px-1">
            {SENTENCE.map((_, i) => (
              <span
                key={i}
                ref={el => { contextRefs.current[i] = el }}
                className="inline-block px-2.5 py-1.5 rounded-md font-mono text-sm min-w-[52px] h-9 border border-dashed border-gray-300 dark:border-gray-700"
              />
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="text-gray-400 dark:text-gray-600 text-2xl rotate-90 sm:rotate-0">→</div>

        {/* Model box */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">model</div>
          <div
            ref={modelBoxRef}
            className="w-28 h-24 rounded-lg border-2 border-blue-300 dark:border-blue-600 flex items-center justify-center text-sm font-mono text-blue-500 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20"
          >
            forward
          </div>
        </div>

        {/* Arrow */}
        <div className="text-gray-400 dark:text-gray-600 text-2xl rotate-90 sm:rotate-0">→</div>

        {/* Distribution panel */}
        <div className="flex flex-col items-center gap-2 relative">
          <div className="text-xs text-gray-500 dark:text-gray-400">p(next token)</div>
          <div ref={distPanelRef} className="relative">
            <div className="flex items-end gap-2 h-[82px] px-1">
              {Array.from({ length: N_BARS }).map((_, i) => (
                <div
                  key={i}
                  ref={el => { barRefs.current[i] = el }}
                  className="w-6 rounded-sm bg-emerald-300 dark:bg-emerald-700/80"
                  style={{ height: 0 }}
                />
              ))}
            </div>
            <div className="flex gap-2 px-1 mt-1.5">
              {Array.from({ length: N_BARS }).map((_, i) => (
                <div
                  key={i}
                  ref={el => { labelRefs.current[i] = el }}
                  className="w-6 text-xs text-center font-mono text-gray-600 dark:text-gray-300"
                  style={{ opacity: 0 }}
                />
              ))}
            </div>
            {/* Flying sampled token */}
            <div
              ref={flyingTokenRef}
              className="absolute top-0 left-0 inline-block px-2.5 py-1.5 rounded-md font-mono text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 pointer-events-none"
              style={{ opacity: 0 }}
            />
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <span ref={stepLabelRef} className="text-xs text-gray-500 dark:text-gray-400">ready</span>
      </div>
    </div>
  )
}
