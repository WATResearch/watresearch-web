const INPUT_DIM = 32

const inputHeights = Array.from({ length: INPUT_DIM }, (_, i) =>
  0.3 + 0.7 * Math.abs(Math.sin(i * 1.7 + 0.5))
)
const latentHeights = [0.7, 0.9, 0.5, 0.8]

export default function EncoderDiagram() {
  return (
    <div className="not-prose my-8">
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        {/* Input vector */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-end gap-[2px] h-20">
            {inputHeights.map((h, i) => (
              <div
                key={i}
                className="w-1.5 sm:w-2 rounded-t bg-blue-400 dark:bg-blue-500"
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Input (high-dim)</span>
        </div>

        {/* Trapezoid encoder */}
        <svg viewBox="-2 -2 124 84" className="w-24 h-16 sm:w-32 sm:h-20" overflow="visible">
          <polygon
            points="0,0 120,20 120,60 0,80"
            className="fill-gray-200 dark:fill-gray-800 stroke-gray-400 dark:stroke-gray-600"
            strokeWidth="1.5"
          />
          <text
            x="60"
            y="40"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-gray-400 dark:fill-gray-500"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontSize="10"
          >
            Encoder
          </text>
        </svg>

        {/* Latent vector */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-end gap-[3px] h-20">
            {latentHeights.map((h, i) => (
              <div
                key={i}
                className="w-2.5 sm:w-3 rounded-t bg-emerald-400 dark:bg-emerald-500"
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Latent (low-dim)</span>
        </div>
      </div>
    </div>
  )
}
