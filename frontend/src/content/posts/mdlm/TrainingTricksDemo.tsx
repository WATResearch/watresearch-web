import { useRef, useEffect } from 'react'
import gsap from 'gsap'

// Low-discrepancy sampler visualization
const RANDOM_SAMPLES = [0.12, 0.15, 0.18, 0.41, 0.43, 0.72, 0.73, 0.74, 0.95, 0.96, 0.97, 0.99]
const LD_SAMPLES = [0.04, 0.12, 0.21, 0.29, 0.37, 0.46, 0.54, 0.62, 0.71, 0.79, 0.87, 0.96]

// Tokenization comparison
const TEXT_8K = ['The', ' c', 'at', ' s', 'at', ' quiet', 'ly', ' on', ' the', ' w', 'arm', ' m', 'at']
const TEXT_32K = ['The', ' cat', ' sat', ' quietly', ' on', ' the', ' warm', ' mat']

export default function TrainingTricksDemo() {
  const randomRef = useRef<(HTMLDivElement | null)[]>([])
  const ldRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const randoms = randomRef.current.filter(Boolean) as HTMLDivElement[]
    const lds = ldRef.current.filter(Boolean) as HTMLDivElement[]

    gsap.fromTo(randoms,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, stagger: 0.05, duration: 0.3, ease: 'back.out(2)' },
    )
    gsap.fromTo(lds,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, stagger: 0.05, duration: 0.3, ease: 'back.out(2)', delay: 0.3 },
    )
  }, [])

  return (
    <div className="not-prose my-8 space-y-8">
      {/* Tokenization comparison */}
      <div className="max-w-lg mx-auto">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center mb-3">Tokenization: sequence length matters</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5">8K vocabulary ({TEXT_8K.length} tokens)</div>
            <div className="flex flex-wrap gap-1">
              {TEXT_8K.map((tok, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                  {tok}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5">32K vocabulary ({TEXT_32K.length} tokens)</div>
            <div className="flex flex-wrap gap-1">
              {TEXT_32K.map((tok, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {tok}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
          shorter sequences = shorter-range dependencies = easier for the model
        </p>
      </div>

      {/* Low-discrepancy sampler */}
      <div className="max-w-lg mx-auto">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center mb-3">Low-discrepancy sampling of timestep t</div>
        <div className="space-y-4">
          {/* Random */}
          <div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">i.i.d. random — clumpy, gaps</div>
            <div className="relative h-6 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800">
              {RANDOM_SAMPLES.map((s, i) => (
                <div
                  key={i}
                  ref={el => { randomRef.current[i] = el }}
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-400 dark:bg-red-500 -translate-x-1/2"
                  style={{ left: `${s * 100}%` }}
                />
              ))}
            </div>
          </div>
          {/* Low-discrepancy */}
          <div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">low-discrepancy — evenly spread</div>
            <div className="relative h-6 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800">
              {LD_SAMPLES.map((s, i) => (
                <div
                  key={i}
                  ref={el => { ldRef.current[i] = el }}
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-500 -translate-x-1/2"
                  style={{ left: `${s * 100}%` }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
            <span>t = 0</span>
            <span>t = 1</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
          even coverage of [0, 1] → lower variance ELBO → more stable training
        </p>
      </div>
    </div>
  )
}
