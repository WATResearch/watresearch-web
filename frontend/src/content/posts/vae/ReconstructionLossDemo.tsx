import { useRef, useEffect } from 'react'
import gsap from 'gsap'

const GRID = 8
const _ = '#60a5fa', F = '#facc15', E = '#1e293b', M = '#92400e'

const CLEAN_PIXELS: string[] = [
  _,_,_,_,_,_,_,_,
  _,_,F,F,F,F,_,_,
  _,F,F,F,F,F,F,_,
  _,F,E,F,F,E,F,_,
  _,F,F,F,F,F,F,_,
  _,F,M,M,M,M,F,_,
  _,_,F,F,F,F,_,_,
  _,_,_,_,_,_,_,_,
]

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

const CLEAN_RGB = CLEAN_PIXELS.map(hexToRgb)

// Fixed random offsets per pixel — the "maximum deviation" for each channel
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807 + 0) % 2147483647
    return (seed - 1) / 2147483646
  }
}
const rand = seeded(77)
const MAX_OFFSETS: [number, number, number][] = CLEAN_RGB.map(() => [
  (rand() - 0.5) * 400,
  (rand() - 0.5) * 400,
  (rand() - 0.5) * 400,
])

function clamp(v: number) { return Math.max(0, Math.min(255, v)) }

function reconAt(i: number, t: number): string {
  const [r, g, b] = CLEAN_RGB[i]
  const [dr, dg, db] = MAX_OFFSETS[i]
  return `rgb(${clamp(r + dr * t)},${clamp(g + dg * t)},${clamp(b + db * t)})`
}

// Normalized to 0–1 range (divide by max possible per-channel error of 255²)
function mseAt(t: number): number {
  let sum = 0
  for (let i = 0; i < CLEAN_RGB.length; i++) {
    const [dr, dg, db] = MAX_OFFSETS[i]
    sum += (dr * t) ** 2 + (dg * t) ** 2 + (db * t) ** 2
  }
  return sum / (CLEAN_RGB.length * 3 * 255 * 255)
}

export default function ReconstructionLossDemo() {
  const reconRef = useRef<(HTMLDivElement | null)[]>([])
  const lossRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const recons = reconRef.current.filter(Boolean) as HTMLDivElement[]
    if (recons.length === 0) return

    const proxy = { t: 0 }

    const apply = () => {
      recons.forEach((el, i) => {
        el.style.backgroundColor = reconAt(i, proxy.t)
      })
      if (lossRef.current) {
        lossRef.current.textContent = mseAt(proxy.t).toFixed(2)
      }
    }

    const tl = gsap.timeline({ repeat: -1 })
    tl.to({}, { duration: 1.5 })
    tl.to(proxy, { t: 1, duration: 3, ease: 'power1.inOut', onUpdate: apply })
    tl.to({}, { duration: 1.5 })
    tl.to(proxy, { t: 0, duration: 3, ease: 'power1.inOut', onUpdate: apply })
    tl.to({}, { duration: 1.5 })

    return () => { tl.kill() }
  }, [])

  const pixelSize = 'w-3.5 h-3.5 sm:w-4 sm:h-4'

  return (
    <div className="not-prose my-8">
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {/* Clean input */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="grid gap-[1px] w-fit"
            style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}
          >
            {CLEAN_PIXELS.map((color, i) => (
              <div
                key={i}
                className={`${pixelSize} rounded-[1px]`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Input</span>
        </div>

        {/* Network: encoder → latent → decoder */}
        <svg viewBox="-2 -2 244 84" className="w-52 h-16 sm:w-72 sm:h-24 shrink-0" overflow="visible">
          {/* Encoder trapezoid: wide left, narrow right */}
          <polygon
            points="0,0 80,20 80,60 0,80"
            className="fill-gray-200 dark:fill-gray-800 stroke-gray-400 dark:stroke-gray-600"
            strokeWidth="1"
          />
          <text x="35" y="42" textAnchor="middle" dominantBaseline="central" className="fill-gray-400 dark:fill-gray-500" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="7">Encoder</text>

          {/* Latent square */}
          <rect
            x="90" y="20" width="60" height="40" rx="2"
            className="fill-emerald-100 dark:fill-emerald-900/40 stroke-emerald-400 dark:stroke-emerald-600"
            strokeWidth="1"
          />
          <text x="120" y="42" textAnchor="middle" dominantBaseline="central" className="fill-emerald-500 dark:fill-emerald-400" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="7">Latent</text>

          {/* Decoder trapezoid: narrow left, wide right */}
          <polygon
            points="160,20 240,0 240,80 160,60"
            className="fill-gray-200 dark:fill-gray-800 stroke-gray-400 dark:stroke-gray-600"
            strokeWidth="1"
          />
          <text x="205" y="42" textAnchor="middle" dominantBaseline="central" className="fill-gray-400 dark:fill-gray-500" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="7">Decoder</text>
        </svg>

        {/* Reconstruction (animated) */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="grid gap-[1px] w-fit"
            style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}
          >
            {CLEAN_PIXELS.map((color, i) => (
              <div
                key={i}
                ref={el => { reconRef.current[i] = el }}
                className={`${pixelSize} rounded-[1px]`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Reconstruction</span>
        </div>
      </div>

      {/* Loss readout */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Loss (MSE): <span ref={lossRef} className="font-mono font-medium text-gray-700 dark:text-gray-300">0.00</span>
        </span>
      </div>
    </div>
  )
}
