import { useState } from 'react'

export default function InterpolationFormula() {
  const [alpha, setAlpha] = useState(100) // 0-100 slider

  const a = alpha / 100
  const maskPct = ((1 - a) * 100).toFixed(0)
  const cleanPct = (a * 100).toFixed(0)

  return (
    <div className="not-prose my-8 max-w-lg mx-auto">
      {/* Formula display */}
      <div className="text-center font-mono text-sm text-gray-600 dark:text-gray-400 mb-6">
        <span className="text-amber-600 dark:text-amber-400">{a.toFixed(2)}</span>
        {' · x₀ + '}
        <span className="text-red-500 dark:text-red-400">{(1 - a).toFixed(2)}</span>
        {' · m'}
      </div>

      {/* Token pill with split visualization */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-12 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          {/* Clean portion */}
          <div
            className="absolute inset-y-0 left-0 bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center transition-all duration-100"
            style={{ width: `${cleanPct}%` }}
          >
            {a > 0.2 && (
              <span className="font-mono text-sm font-medium text-amber-700 dark:text-amber-300 px-1">
                cat
              </span>
            )}
          </div>
          {/* Mask portion */}
          <div
            className="absolute inset-y-0 right-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center transition-all duration-100"
            style={{ width: `${maskPct}%` }}
          >
            {(1 - a) > 0.2 && (
              <span className="font-mono text-sm text-gray-400 dark:text-gray-500 px-1">
                [MASK]
              </span>
            )}
          </div>
          {/* Divider line */}
          <div
            className="absolute inset-y-0 w-[2px] bg-gray-400 dark:bg-gray-500 transition-all duration-100"
            style={{ left: `${cleanPct}%` }}
          />
        </div>
      </div>

      {/* Probability labels */}
      <div className="flex justify-center gap-8 text-xs mb-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700" />
          <span className="text-gray-500 dark:text-gray-400">
            P(stay) = <span className="font-mono text-amber-600 dark:text-amber-400">{cleanPct}%</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-800 border border-gray-400 dark:border-gray-600" />
          <span className="text-gray-500 dark:text-gray-400">
            P([MASK]) = <span className="font-mono text-red-500 dark:text-red-400">{maskPct}%</span>
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="max-w-sm mx-auto">
        <div
          className="relative h-10 flex items-center cursor-pointer select-none"
          onPointerDown={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const update = (cx: number) => {
              const pct = Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100))
              setAlpha(Math.round(100 - pct))
            }
            update(e.clientX)
            const onMove = (ev: PointerEvent) => update(ev.clientX)
            const onUp = () => {
              window.removeEventListener('pointermove', onMove)
              window.removeEventListener('pointerup', onUp)
            }
            window.addEventListener('pointermove', onMove)
            window.addEventListener('pointerup', onUp)
          }}
        >
          <div className="absolute inset-x-0 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div
            className="absolute left-0 h-1 rounded-full bg-gray-400 dark:bg-gray-500"
            style={{ width: `${100 - alpha}%` }}
          />
          <div
            className="absolute w-5 h-5 rounded-full bg-white dark:bg-gray-200 shadow-md border border-gray-300 dark:border-gray-500 -translate-x-1/2"
            style={{ left: `${100 - alpha}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
          <span>α_t = 1 (clean)</span>
          <span>α_t = 0 (fully masked)</span>
        </div>
      </div>
    </div>
  )
}
