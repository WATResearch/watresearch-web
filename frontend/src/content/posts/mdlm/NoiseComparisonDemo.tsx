import { useRef, useEffect } from 'react'
import gsap from 'gsap'

const GRID_SIZE = 16
const _ = '#60a5fa', F = '#facc15', E = '#1e293b', M = '#92400e'
const CLEAN_COLORS: string[] = [
  _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
  _,_,_,_,_,F,F,F,F,F,F,_,_,_,_,_,
  _,_,_,_,F,F,F,F,F,F,F,F,_,_,_,_,
  _,_,_,F,F,F,F,F,F,F,F,F,F,_,_,_,
  _,_,F,F,F,F,F,F,F,F,F,F,F,F,_,_,
  _,_,F,F,E,E,F,F,F,F,E,E,F,F,_,_,
  _,_,F,F,E,E,F,F,F,F,E,E,F,F,_,_,
  _,_,F,F,F,F,F,F,F,F,F,F,F,F,_,_,
  _,_,F,F,F,F,F,F,F,F,F,F,F,F,_,_,
  _,_,F,F,M,F,F,F,F,F,F,M,F,F,_,_,
  _,_,_,F,F,M,M,M,M,M,M,F,F,_,_,_,
  _,_,_,F,F,F,F,F,F,F,F,F,F,_,_,_,
  _,_,_,_,F,F,F,F,F,F,F,F,_,_,_,_,
  _,_,_,_,_,F,F,F,F,F,F,_,_,_,_,_,
  _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
  _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,
]

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

function blendColor(clean: [number, number, number], noise: [number, number, number], alpha: number): string {
  const r = Math.round(clean[0] * alpha + noise[0] * (1 - alpha))
  const g = Math.round(clean[1] * alpha + noise[1] * (1 - alpha))
  const b = Math.round(clean[2] * alpha + noise[2] * (1 - alpha))
  return `rgb(${r},${g},${b})`
}

const CLEAN_RGB = CLEAN_COLORS.map(hexToRgb)
const NOISE_RGB: [number, number, number][] = CLEAN_COLORS.map(() => [
  Math.floor(Math.random() * 256),
  Math.floor(Math.random() * 256),
  Math.floor(Math.random() * 256),
])

function labelForAlpha(alpha: number): string {
  if (alpha > 0.9) return 'clean'
  if (alpha > 0.7) return 'slightly noised'
  if (alpha > 0.5) return 'noisy'
  if (alpha > 0.3) return 'very noisy'
  if (alpha > 0.1) return 'barely visible'
  return 'completely noised'
}

function borderForAlpha(alpha: number): string {
  const t = Math.max(0, Math.min(1, 1 - alpha))
  const r = Math.round(107 + (239 - 107) * t)
  const g = Math.round(114 + (68 - 114) * t)
  const b = Math.round(128 + (68 - 128) * t)
  return `rgb(${r},${g},${b})`
}

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat']

export default function NoiseComparisonDemo() {
  const pixelsRef = useRef<(HTMLDivElement | null)[]>([])
  const tokenTexts = useRef<(HTMLSpanElement | null)[]>([])
  const tokenMarks = useRef<(HTMLSpanElement | null)[]>([])
  const tokenPills = useRef<(HTMLDivElement | null)[]>([])
  const markerRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const pixels = pixelsRef.current.filter(Boolean) as HTMLDivElement[]
    const texts = tokenTexts.current.filter(Boolean) as HTMLSpanElement[]
    const marks = tokenMarks.current.filter(Boolean) as HTMLSpanElement[]
    const pills = tokenPills.current.filter(Boolean) as HTMLDivElement[]
    if (pixels.length === 0) return

    const colorAt = (i: number, alpha: number) =>
      blendColor(CLEAN_RGB[i], NOISE_RGB[i], alpha)

    const proxy = { alpha: 1 }
    let lastLabel = ''

    const applyAlpha = () => {
      const a = proxy.alpha
      const noisePct = (1 - a) * 100

      pixels.forEach((px, i) => {
        px.style.backgroundColor = colorAt(i, a)
      })

      texts.forEach(t => { t.style.opacity = String(a) })
      marks.forEach(m => { m.style.opacity = String(1 - a) })

      const border = borderForAlpha(a)
      pills.forEach(p => { p.style.borderColor = border })

      if (markerRef.current) markerRef.current.style.left = `${noisePct}%`

      const label = labelForAlpha(a)
      if (label !== lastLabel) {
        lastLabel = label
        if (labelRef.current) labelRef.current.textContent = label
      }
    }

    const tl = gsap.timeline({ repeat: -1 })

    tl.to({}, { duration: 1.5 })
    tl.to(proxy, { alpha: 0, duration: 4, ease: 'power1.inOut', onUpdate: applyAlpha })
    tl.to({}, { duration: 1.2 })
    tl.to(proxy, { alpha: 1, duration: 4, ease: 'power1.inOut', onUpdate: applyAlpha })
    tl.to({}, { duration: 1.5 })

    return () => { tl.kill() }
  }, [])

  return (
    <div className="not-prose my-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-8 sm:gap-12">
        <div className="flex flex-col items-center gap-3">
          <div className="grid gap-[1px] w-fit" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {CLEAN_COLORS.map((color, i) => (
              <div
                key={i}
                ref={el => { pixelsRef.current[i] = el }}
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[1px]"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Continuous</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="grid grid-cols-2 gap-2 w-fit place-content-center">
            {TOKENS.map((token, i) => (
              <div
                key={i}
                ref={el => { tokenPills.current[i] = el }}
                className="relative flex items-center justify-center rounded-lg border border-gray-500 dark:border-gray-500 px-4 py-2 min-w-[72px]"
              >
                <span
                  ref={el => { tokenTexts.current[i] = el }}
                  className="font-mono text-sm font-medium text-gray-800 dark:text-gray-200"
                >
                  {token}
                </span>
                <span
                  ref={el => { tokenMarks.current[i] = el }}
                  className="absolute inset-0 flex items-center justify-center font-mono text-lg font-bold text-red-500 dark:text-red-400"
                  style={{ opacity: 0 }}
                >
                  ?
                </span>
              </div>
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Discrete</span>
        </div>
      </div>

      <div className="mt-6 mx-auto max-w-md flex flex-col items-center gap-2">
        <div className="w-full flex flex-col gap-1">
          <div className="relative h-5">
            <div
              ref={markerRef}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left: '0%' }}
            >
              <span className="text-gray-500 dark:text-gray-400 text-xs leading-none">&#9660;</span>
            </div>
          </div>
          <div className="h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            <span>clean</span>
            <span>pure noise</span>
          </div>
        </div>
        <span ref={labelRef} className="text-sm text-gray-500 dark:text-gray-400 font-medium h-5">clean</span>
      </div>
    </div>
  )
}
