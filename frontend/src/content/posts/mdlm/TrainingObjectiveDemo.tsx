import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'

const SENTENCE = ['The', 'cat', 'sat', 'on', 'the', 'mat']

// Fake loss values per position (lower = easier prediction)
const LOSSES: Record<number, number> = {
  0: 0.12, 1: 0.85, 2: 0.45, 3: 0.08, 4: 0.10, 5: 0.92,
}

// Pre-seeded mask thresholds per position
const THRESHOLDS = [0.7, 0.3, 0.5, 0.8, 0.75, 0.2]

// w(t) curve: -α'(t) / (1 - α(t)) for a cosine schedule
function wt(t: number): number {
  if (t < 0.01) return 0.1
  if (t > 0.99) return 5
  // Approximate cosine schedule derivative
  const alpha = Math.cos(t * Math.PI / 2) ** 2
  const alphaPrime = -Math.PI * Math.cos(t * Math.PI / 2) * Math.sin(t * Math.PI / 2)
  return Math.abs(alphaPrime) / (1 - alpha + 0.001)
}

export default function TrainingObjectiveDemo() {
  const [step, setStep] = useState(0) // 0-4 steps
  const canvasRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<(HTMLDivElement | null)[]>([])

  const t = 0.6 // fixed timestep for this demo
  const maskedIndices = THRESHOLDS.map((th, i) => th < t ? i : -1).filter(i => i >= 0)
  const weight = wt(t)

  const STEP_LABELS = [
    `1. Sample t = ${t.toFixed(1)}`,
    `2. Mask tokens (${maskedIndices.length}/${SENTENCE.length} masked)`,
    '3. Model predicts masked positions',
    '4. Compute cross-entropy loss',
    `5. Weight by w(t) = ${weight.toFixed(2)}`,
  ]

  useEffect(() => {
    const els = stepsRef.current.filter(Boolean) as HTMLDivElement[]
    if (els.length === 0) return
    els.forEach((el, i) => {
      gsap.to(el, { opacity: i <= step ? 1 : 0.3, duration: 0.3 })
    })
  }, [step])

  return (
    <div className="not-prose my-8">
      <div className="max-w-xl mx-auto">
        {/* Token display */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {SENTENCE.map((token, i) => {
            const isMasked = maskedIndices.includes(i)
            const showLoss = step >= 3 && isMasked
            const showPred = step >= 2 && isMasked
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className={`px-2 py-1 rounded-md font-mono text-xs transition-all duration-300 ${
                    step < 1
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-gray-800 dark:text-gray-200'
                      : isMasked
                        ? showPred
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {step >= 1 && isMasked && !showPred ? '[MASK]' : token}
                </span>
                {showLoss && (
                  <span className="text-[9px] font-mono text-red-500 dark:text-red-400">
                    {step >= 4 ? `${(LOSSES[i] * weight).toFixed(2)}` : LOSSES[i].toFixed(2)}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Step indicators */}
        <div className="space-y-1.5 mb-4">
          {STEP_LABELS.map((label, i) => (
            <div
              key={i}
              ref={el => { stepsRef.current[i] = el }}
              className={`text-xs font-mono px-3 py-1 rounded transition-all duration-300 cursor-pointer ${
                i === step
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
              onClick={() => setStep(i)}
            >
              {label}
            </div>
          ))}
        </div>

        {/* w(t) curve */}
        <div className="mt-4">
          <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center mb-1">w(t) weighting function</div>
          <div ref={canvasRef} className="h-16 relative bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
            {/* Draw curve as bars */}
            {Array.from({ length: 50 }).map((_, i) => {
              const tVal = i / 49
              const w = wt(tVal)
              const maxW = 5
              const h = Math.min(w / maxW, 1) * 100
              const isActive = Math.abs(tVal - t) < 0.02
              return (
                <div
                  key={i}
                  className={`absolute bottom-0 w-[2%] ${
                    isActive
                      ? 'bg-amber-500 dark:bg-amber-400'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  style={{ left: `${(i / 50) * 100}%`, height: `${h}%` }}
                />
              )
            })}
            {/* Current t marker */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-amber-500 dark:bg-amber-400"
              style={{ left: `${t * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            <span>t = 0</span>
            <span>t = 1</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30"
          >
            ← prev
          </button>
          <span className="text-xs text-gray-400 dark:text-gray-500">{step + 1} / {STEP_LABELS.length}</span>
          <button
            onClick={() => setStep(Math.min(STEP_LABELS.length - 1, step + 1))}
            disabled={step === STEP_LABELS.length - 1}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30"
          >
            next →
          </button>
        </div>
      </div>
    </div>
  )
}
