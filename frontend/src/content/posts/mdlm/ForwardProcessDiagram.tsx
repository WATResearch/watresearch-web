import { useRef, useEffect } from 'react'
import gsap from 'gsap'

const VOCAB = ['the', 'cat', 'sat', 'on', 'mat', '[M]']
const MASK_IDX = VOCAB.length - 1

// At t=0: one-hot on "cat" (index 1). At t=1: all mass on [MASK].
// Interpolation: clean_mass * (1-t) bleeds into [MASK], tiny uniform noise on others.
function distAtT(t: number): number[] {
  const d = VOCAB.map((_, i) => {
    if (i === 1) return 1 - t                        // "cat" drains
    if (i === MASK_IDX) return t                      // [MASK] fills
    return Math.sin((i + 1) * 1.5) * 0.03 * t        // tiny noise on others
  })
  // Normalize
  const sum = d.reduce((a, b) => a + b, 0)
  return d.map(v => Math.max(0, v / sum))
}

export default function ForwardProcessDiagram() {
  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const valuesRef = useRef<(HTMLSpanElement | null)[]>([])
  const markerRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const bars = barsRef.current.filter(Boolean) as HTMLDivElement[]
    const values = valuesRef.current.filter(Boolean) as HTMLSpanElement[]
    if (bars.length === 0) return

    const proxy = { t: 0 }

    const apply = () => {
      const dist = distAtT(proxy.t)
      const maxVal = Math.max(...dist, 0.01)

      bars.forEach((bar, i) => {
        const pct = (dist[i] / maxVal) * 100
        bar.style.height = `${Math.max(pct, 2)}%`
      })

      values.forEach((el, i) => {
        const v = dist[i]
        el.textContent = v >= 0.01 ? v.toFixed(2) : ''
      })

      if (markerRef.current) markerRef.current.style.left = `${proxy.t * 100}%`

      if (labelRef.current) {
        if (proxy.t < 0.05) labelRef.current.textContent = 'x₀ — one-hot on "cat"'
        else if (proxy.t > 0.95) labelRef.current.textContent = 'x_T — all mass on [MASK]'
        else labelRef.current.textContent = `x_t — mass shifting to [MASK]`
      }
    }

    const tl = gsap.timeline({ repeat: -1 })
    tl.to({}, { duration: 1.5 })
    tl.to(proxy, { t: 1, duration: 4, ease: 'power1.inOut', onUpdate: apply })
    tl.to({}, { duration: 1.5 })
    tl.to(proxy, { t: 0, duration: 4, ease: 'power1.inOut', onUpdate: apply })
    tl.to({}, { duration: 1.5 })

    return () => { tl.kill() }
  }, [])

  const initDist = distAtT(0)
  const initMax = Math.max(...initDist, 0.01)

  return (
    <div className="not-prose my-8 max-w-sm mx-auto">
      {/* Bar chart */}
      <div className="flex items-end justify-center gap-2 h-40 mb-1">
        {VOCAB.map((token, i) => (
          <div key={i} className="flex flex-col items-center gap-1 w-10">
            {/* Value label */}
            <span
              ref={el => { valuesRef.current[i] = el }}
              className="text-[10px] font-mono text-gray-400 dark:text-gray-500 h-3"
            >
              {initDist[i] >= 0.01 ? initDist[i].toFixed(2) : ''}
            </span>
            {/* Bar */}
            <div className="relative w-full h-28 flex items-end">
              <div
                ref={el => { barsRef.current[i] = el }}
                className={`w-full rounded-t transition-colors ${
                  i === MASK_IDX
                    ? 'bg-red-400 dark:bg-red-500'
                    : i === 1
                      ? 'bg-amber-400 dark:bg-amber-500'
                      : 'bg-gray-300 dark:bg-gray-700'
                }`}
                style={{ height: `${Math.max((initDist[i] / initMax) * 100, 2)}%` }}
              />
            </div>
            {/* Label */}
            <span className={`text-[10px] font-mono leading-none ${
              i === MASK_IDX
                ? 'text-red-500 dark:text-red-400 font-bold'
                : i === 1
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-gray-400 dark:text-gray-500'
            }`}>
              {token}
            </span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="mt-4 flex flex-col gap-1">
        <div className="relative h-5">
          <div
            ref={markerRef}
            className="absolute top-0 -translate-x-1/2"
            style={{ left: '0%' }}
          >
            <span className="text-gray-500 dark:text-gray-400 text-xs leading-none">&#9660;</span>
          </div>
        </div>
        <div className="h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
        <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
          <span>t = 0</span>
          <span>t = T</span>
        </div>
      </div>

      {/* State label */}
      <div className="text-center mt-2">
        <span ref={labelRef} className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          x₀ — one-hot on "cat"
        </span>
      </div>
    </div>
  )
}
