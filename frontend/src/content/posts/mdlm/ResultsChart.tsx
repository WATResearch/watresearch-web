import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'

const LM1B_DATA: { name: string; ppl: number; type: 'ar' | 'diffusion' | 'mdlm' }[] = [
  { name: 'D3PM', ppl: 77.50, type: 'diffusion' },
  { name: 'DiffusionBert', ppl: 63.78, type: 'diffusion' },
  { name: 'SEDD', ppl: 32.79, type: 'diffusion' },
  { name: 'MDLM (33B)', ppl: 27.04, type: 'mdlm' },
  { name: 'MDLM (327B)', ppl: 23.00, type: 'mdlm' },
  { name: 'AR (33B)', ppl: 22.32, type: 'ar' },
  { name: 'AR (327B)', ppl: 20.86, type: 'ar' },
]

const ZERO_SHOT: { dataset: string; ar: number; sedd: number; mdlm: number }[] = [
  { dataset: 'PTB', ar: 82.05, sedd: 100.09, mdlm: 95.26 },
  { dataset: 'Wikitext', ar: 25.75, sedd: 34.28, mdlm: 32.83 },
  { dataset: 'LM1B', ar: 51.25, sedd: 68.20, mdlm: 67.01 },
  { dataset: 'Lambada', ar: 51.28, sedd: 49.86, mdlm: 47.52 },
  { dataset: 'AG News', ar: 52.09, sedd: 62.09, mdlm: 61.15 },
  { dataset: 'Pubmed', ar: 49.01, sedd: 44.53, mdlm: 41.89 },
  { dataset: 'Arxiv', ar: 41.73, sedd: 38.48, mdlm: 37.37 },
]

const MAX_PPL = 80

export default function ResultsChart() {
  const [tab, setTab] = useState<'lm1b' | 'zeroshot'>('lm1b')

  return (
    <div className="not-prose my-8">
      {/* Tab switcher */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setTab('lm1b')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === 'lm1b'
              ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          LM1B Perplexity
        </button>
        <button
          onClick={() => setTab('zeroshot')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === 'zeroshot'
              ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Zero-Shot Generalization
        </button>
      </div>

      {tab === 'lm1b' ? <LM1BChart /> : <ZeroShotTable />}
    </div>
  )
}

function LM1BChart() {
  const barRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const bars = barRefs.current.filter(Boolean) as HTMLDivElement[]
    gsap.fromTo(bars,
      { scaleX: 0 },
      { scaleX: 1, stagger: 0.08, duration: 0.5, ease: 'power2.out' },
    )
  }, [])

  return (
    <div className="max-w-lg mx-auto">
      <div className="space-y-2">
        {LM1B_DATA.map((d, i) => {
          const pct = (d.ppl / MAX_PPL) * 100
          const color = d.type === 'ar'
            ? 'bg-blue-400 dark:bg-blue-500'
            : d.type === 'mdlm'
              ? 'bg-emerald-400 dark:bg-emerald-500'
              : 'bg-gray-300 dark:bg-gray-600'
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 w-28 text-right shrink-0">
                {d.name}
              </span>
              <div className="flex-1 h-4 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  ref={el => { barRefs.current[i] = el }}
                  className={`h-full rounded-full origin-left ${color}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span className={`text-[11px] font-mono w-10 shrink-0 ${
                d.type === 'mdlm' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {d.ppl.toFixed(1)}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex justify-center gap-4 text-[10px] mt-4">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-300 dark:bg-gray-600" />
          <span className="text-gray-400 dark:text-gray-500">prior diffusion</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 dark:bg-emerald-500" />
          <span className="text-gray-400 dark:text-gray-500">MDLM (ours)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-400 dark:bg-blue-500" />
          <span className="text-gray-400 dark:text-gray-500">autoregressive</span>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
        perplexity ↓ is better — MDLM nearly closes the gap to autoregressive
      </p>
    </div>
  )
}

function ZeroShotTable() {
  const [highlight, setHighlight] = useState<number | null>(null)

  return (
    <div className="max-w-lg mx-auto overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-800">
            <th className="text-left py-1.5 pr-3 font-medium">Dataset</th>
            <th className="text-right py-1.5 px-2 font-medium">AR</th>
            <th className="text-right py-1.5 px-2 font-medium">SEDD</th>
            <th className="text-right py-1.5 px-2 font-medium text-emerald-600 dark:text-emerald-400">MDLM</th>
          </tr>
        </thead>
        <tbody>
          {ZERO_SHOT.map((row, i) => {
            const mdlmBest = row.mdlm < row.ar
            return (
              <tr
                key={i}
                className={`border-b border-gray-100 dark:border-gray-800/50 transition-colors cursor-default ${
                  highlight === i ? 'bg-gray-50 dark:bg-gray-900' : ''
                }`}
                onMouseEnter={() => setHighlight(i)}
                onMouseLeave={() => setHighlight(null)}
              >
                <td className="py-1.5 pr-3 text-gray-600 dark:text-gray-300">{row.dataset}</td>
                <td className="py-1.5 px-2 text-right text-gray-400 dark:text-gray-500">{row.ar.toFixed(2)}</td>
                <td className="py-1.5 px-2 text-right text-gray-400 dark:text-gray-500">{row.sedd.toFixed(2)}</td>
                <td className={`py-1.5 px-2 text-right font-bold ${
                  mdlmBest
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-emerald-500 dark:text-emerald-500'
                }`}>
                  {row.mdlm.toFixed(2)}
                  {mdlmBest && ' ★'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-3">
        ★ = MDLM beats autoregressive — perplexity ↓ is better
      </p>
    </div>
  )
}
