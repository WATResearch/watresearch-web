import { useState } from 'react'

const DIFF_SENTENCE = ['The', 'cat', 'sat', 'on', 'the', 'mat']

const DIFF_LEVELS: { label: string; sublabel: string; masked: number[] }[] = [
  { label: 'Easy', sublabel: 'few masks, lots of context', masked: [3] },
  { label: 'Medium', sublabel: 'half masked', masked: [0, 2, 5] },
  { label: 'Hard', sublabel: 'almost all masked', masked: [0, 1, 2, 3, 5] },
]

const PREDICTIONS: Record<number, { top: string; conf: number }[]> = {
  0: [{ top: 'The', conf: 0.92 }, { top: 'A', conf: 0.06 }, { top: 'One', conf: 0.02 }],
  1: [{ top: 'cat', conf: 0.71 }, { top: 'dog', conf: 0.18 }, { top: 'rat', conf: 0.08 }],
  2: [{ top: 'sat', conf: 0.65 }, { top: 'lay', conf: 0.15 }, { top: 'slept', conf: 0.12 }],
  3: [{ top: 'on', conf: 0.88 }, { top: 'by', conf: 0.07 }, { top: 'near', conf: 0.03 }],
  5: [{ top: 'mat', conf: 0.52 }, { top: 'bed', conf: 0.21 }, { top: 'rug', conf: 0.14 }],
}

export default function DifficultyDemo() {
  const [active, setActive] = useState<{ level: number; token: number } | null>(null)

  return (
    <div className="not-prose my-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {DIFF_LEVELS.map((level, li) => (
          <div key={li} className="flex flex-col items-center gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">{level.label}</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center">{level.sublabel}</div>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {DIFF_SENTENCE.map((token, ti) => {
                const isMasked = level.masked.includes(ti)
                const isActive = active?.level === li && active?.token === ti
                return (
                  <div key={ti} className="relative">
                    <span
                      onClick={() => {
                        if (isMasked) setActive(isActive ? null : { level: li, token: ti })
                      }}
                      className={`inline-block px-2 py-1 rounded-md font-mono text-xs transition-all duration-150 ${
                        isMasked
                          ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {isMasked ? '[MASK]' : token}
                    </span>
                    {isActive && PREDICTIONS[ti] && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-[120px]">
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 text-center">model predicts</div>
                        {PREDICTIONS[ti].map((pred, pi) => (
                          <div key={pi} className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-gray-700 dark:text-gray-300 w-12">{pred.top}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                                style={{ width: `${pred.conf * 100}%` }}
                              />
                            </div>
                            <span className="text-gray-400 dark:text-gray-500 w-8 text-right">{(pred.conf * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-white dark:bg-gray-900 border-r border-b border-gray-200 dark:border-gray-700 rotate-45 -mt-1" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-3">click a [MASK] token to see prediction confidence</p>
    </div>
  )
}
