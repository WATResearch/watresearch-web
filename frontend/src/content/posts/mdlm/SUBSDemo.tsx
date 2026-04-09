import { useState } from 'react'

const TOKENS = ['The', '[MASK]', 'sat', '[MASK]', 'the', '[MASK]']
const VOCAB = ['The', 'cat', 'sat', 'on', 'the', 'mat', '[MASK]']

// Raw logits before SUBS (for masked positions)
const RAW_LOGITS_1: Record<number, number[]> = {
  1: [0.3, 2.8, 0.1, 0.5, 0.2, 0.1, 0.7],   // position 1: should be "cat"
  3: [0.1, 0.2, 0.1, 2.5, 0.3, 0.1, 0.4],   // position 3: should be "on"
  5: [0.2, 0.1, 0.1, 0.1, 0.1, 2.9, 0.6],   // position 5: should be "mat"
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits)
  const exps = logits.map(l => Math.exp(l - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

export default function SUBSDemo() {
  const [tab, setTab] = useState<'zero' | 'carry'>('zero')

  return (
    <div className="not-prose my-8">
      {/* Tab switcher */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setTab('zero')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === 'zero'
              ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Zero Masking Probability
        </button>
        <button
          onClick={() => setTab('carry')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === 'carry'
              ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Carry-Over Unmasking
        </button>
      </div>

      {tab === 'zero' ? <ZeroMaskingDemo /> : <CarryOverDemo />}
    </div>
  )
}

function ZeroMaskingDemo() {
  const rawLogits = RAW_LOGITS_1[1]
  const rawProbs = softmax(rawLogits)

  // After setting [MASK] logit to -∞
  const fixedLogits = rawLogits.map((l, i) => i === 6 ? -Infinity : l)
  const fixedProbs = softmax(fixedLogits.map(l => l === -Infinity ? -100 : l))

  return (
    <div className="max-w-md mx-auto">
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
        Predicting position 2 (should be "cat") — logit vector:
      </p>

      <div className="grid grid-cols-2 gap-6">
        {/* Before */}
        <div>
          <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 text-center mb-2">Before SUBS</div>
          <div className="space-y-1">
            {VOCAB.map((token, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className={`w-10 text-right ${i === 6 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {token}
                </span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${i === 6 ? 'bg-red-400 dark:bg-red-500' : i === 1 ? 'bg-amber-400 dark:bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    style={{ width: `${rawProbs[i] * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-400 dark:text-gray-500">
                  {(rawProbs[i] * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* After */}
        <div>
          <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 text-center mb-2">After SUBS</div>
          <div className="space-y-1">
            {VOCAB.map((token, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className={`w-10 text-right ${i === 6 ? 'text-red-500 dark:text-red-400 line-through' : 'text-gray-500 dark:text-gray-400'}`}>
                  {token}
                </span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${i === 6 ? 'bg-red-400 dark:bg-red-500' : i === 1 ? 'bg-amber-400 dark:bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    style={{ width: `${fixedProbs[i] * 100}%` }}
                  />
                </div>
                <span className={`w-8 text-right ${i === 6 ? 'text-red-500 dark:text-red-400 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                  {i === 6 ? '0%' : `${(fixedProbs[i] * 100).toFixed(0)}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-3">
        [MASK] logit → −∞ → probability becomes 0, rest renormalizes
      </p>
    </div>
  )
}

function CarryOverDemo() {
  return (
    <div className="max-w-md mx-auto">
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
        Partially masked input → denoising network → output
      </p>

      {/* Flow diagram */}
      <div className="flex flex-col items-center gap-3">
        {/* Input tokens */}
        <div className="flex gap-1.5">
          {TOKENS.map((token, i) => (
            <span
              key={i}
              className={`px-2 py-1 rounded-md font-mono text-xs ${
                token === '[MASK]'
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
              }`}
            >
              {token}
            </span>
          ))}
        </div>

        {/* Arrows showing what goes through network vs what bypasses */}
        <div className="flex gap-1.5 text-[10px] font-mono">
          {TOKENS.map((token, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 text-center min-w-[40px] ${
                token === '[MASK]'
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-emerald-500 dark:text-emerald-400'
              }`}
            >
              {token === '[MASK]' ? '↓ net' : '↓ copy'}
            </span>
          ))}
        </div>

        {/* Network box */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">x̂_θ(x_t, t)</span>
        </div>

        {/* Output arrows */}
        <div className="flex gap-1.5 text-[10px] font-mono text-gray-400 dark:text-gray-500">
          {TOKENS.map((_, i) => (
            <span key={i} className="px-2 py-0.5 text-center min-w-[40px]">↓</span>
          ))}
        </div>

        {/* Output tokens */}
        <div className="flex gap-1.5">
          {TOKENS.map((token, i) => {
            const output = token === '[MASK]'
              ? ['cat', 'on', 'mat'][Math.floor(i / 2)]
              : token
            return (
              <span
                key={i}
                className={`px-2 py-1 rounded-md font-mono text-xs ${
                  token === '[MASK]'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-700'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                }`}
              >
                {output}
              </span>
            )
          })}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-3">
        unmasked tokens bypass the network — only [MASK] positions get predicted
      </p>
    </div>
  )
}
