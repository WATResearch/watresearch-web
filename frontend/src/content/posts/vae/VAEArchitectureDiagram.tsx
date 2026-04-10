// Static diagram: Encoder with two heads (μ, σ²) → sample z → Decoder

const INPUT_DIM = 20
const LATENT_DIM = 4

const inputHeights = Array.from({ length: INPUT_DIM }, (_, i) =>
  0.3 + 0.7 * Math.abs(Math.sin(i * 1.7 + 0.5))
)
const muHeights = [0.6, 0.8, 0.4, 0.7]
const sigmaHeights = [0.3, 0.5, 0.6, 0.4]

export default function VAEArchitectureDiagram() {
  return (
    <div className="not-prose my-8">
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {/* Input */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-end gap-[2px] h-16">
            {inputHeights.map((h, i) => (
              <div
                key={i}
                className="w-1 sm:w-1.5 rounded-t bg-blue-400 dark:bg-blue-500"
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Input</span>
        </div>

        {/* Encoder trapezoid */}
        <svg viewBox="-2 -2 84 64" className="w-16 h-12 sm:w-20 sm:h-14 shrink-0" overflow="visible">
          <polygon
            points="0,0 80,10 80,50 0,60"
            className="fill-gray-200 dark:fill-gray-800 stroke-gray-400 dark:stroke-gray-600"
            strokeWidth="1"
          />
          <text x="35" y="33" textAnchor="middle" dominantBaseline="central" className="fill-gray-400 dark:fill-gray-500" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="7">Encoder</text>
        </svg>

        {/* Two heads: μ and σ² */}
        <div className="flex flex-col items-center gap-3">
          {/* μ head */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-end gap-[3px] h-10">
              {muHeights.map((h, i) => (
                <div
                  key={i}
                  className="w-2 sm:w-2.5 rounded-t bg-emerald-400 dark:bg-emerald-500"
                  style={{ height: `${h * 100}%` }}
                />
              ))}
            </div>
            <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">&#x03BC;</span>
          </div>

          {/* σ² head */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-end gap-[3px] h-10">
              {sigmaHeights.map((h, i) => (
                <div
                  key={i}
                  className="w-2 sm:w-2.5 rounded-t bg-amber-400 dark:bg-amber-500"
                  style={{ height: `${h * 100}%` }}
                />
              ))}
            </div>
            <span className="text-[10px] text-amber-500 dark:text-amber-400 font-medium">&#x03C3;&#xB2;</span>
          </div>
        </div>

        {/* Sample arrow + z */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">sample</span>
          <span className="text-gray-400 dark:text-gray-500 text-sm">&#x2192;</span>
        </div>

        {/* Sampled z */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-end gap-[3px] h-10">
            {LATENT_DIM > 0 && [0.5, 0.7, 0.55, 0.65].map((h, i) => (
              <div
                key={i}
                className="w-2 sm:w-2.5 rounded-t bg-violet-400 dark:bg-violet-500"
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>
          <span className="text-[10px] text-violet-500 dark:text-violet-400 font-medium">z</span>
        </div>

        {/* Decoder trapezoid */}
        <svg viewBox="-2 -2 84 64" className="w-16 h-12 sm:w-20 sm:h-14 shrink-0" overflow="visible">
          <polygon
            points="0,10 80,0 80,60 0,50"
            className="fill-gray-200 dark:fill-gray-800 stroke-gray-400 dark:stroke-gray-600"
            strokeWidth="1"
          />
          <text x="45" y="33" textAnchor="middle" dominantBaseline="central" className="fill-gray-400 dark:fill-gray-500" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="7">Decoder</text>
        </svg>

        {/* Output */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-end gap-[2px] h-16">
            {inputHeights.map((h, i) => (
              <div
                key={i}
                className="w-1 sm:w-1.5 rounded-t bg-blue-400/70 dark:bg-blue-500/70"
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Output</span>
        </div>
      </div>
    </div>
  )
}
