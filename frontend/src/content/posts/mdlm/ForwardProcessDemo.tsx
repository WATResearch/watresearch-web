import { useState } from 'react'

const SENTENCE = ['A', 'masked', 'diffusion', 'model', 'learns', 'to', 'predict', 'every', 'masked', 'token', 'at', 'once']

const MASK_THRESHOLDS = SENTENCE.map((_, i) => {
  const h = Math.sin(i * 9301 + 4973) * 10000
  return h - Math.floor(h)
})

export default function ForwardProcessDemo() {
  const [t, setT] = useState(0)

  const maskFrac = t / 100

  return (
    <div className="not-prose my-8">
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {SENTENCE.map((token, i) => {
          const isMasked = MASK_THRESHOLDS[i] < maskFrac
          return (
            <span
              key={i}
              className={`inline-block px-3 py-1.5 rounded-md font-mono text-sm transition-all duration-150 ${
                isMasked
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-gray-800 dark:text-gray-200'
              }`}
            >
              {isMasked ? '[MASK]' : token}
            </span>
          )
        })}
      </div>

      <div className="max-w-md mx-auto flex flex-col gap-2">
        <div
          className="relative h-10 flex items-center cursor-pointer select-none"
          onPointerDown={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const update = (cx: number) => {
              const pct = Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100))
              setT(Math.round(pct))
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
            style={{ width: `${t}%` }}
          />
          <div
            className="absolute w-5 h-5 rounded-full bg-white dark:bg-gray-200 shadow-md border border-gray-300 dark:border-gray-500 -translate-x-1/2 transition-shadow hover:shadow-lg active:scale-110"
            style={{ left: `${t}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
          <span>t = 0 (clean)</span>
          <span>t = T (fully masked)</span>
        </div>
      </div>
    </div>
  )
}
