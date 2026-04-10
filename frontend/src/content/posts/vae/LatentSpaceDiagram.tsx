// Static 2D scatter plot showing clustered latent space

// Deterministic pseudo-random using seed
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807 + 0) % 2147483647
    return (seed - 1) / 2147483646
  }
}

const rand = seeded(42)

interface Point { x: number; y: number; color: string; label: string }

const CLUSTERS: { cx: number; cy: number; color: string; label: string; count: number; spread: number }[] = [
  { cx: 28, cy: 32, color: '#60a5fa', label: 'Cats', count: 18, spread: 30 },
  { cx: 68, cy: 30, color: '#facc15', label: 'Dogs', count: 16, spread: 28 },
  { cx: 32, cy: 68, color: '#f87171', label: 'Cars', count: 15, spread: 26 },
  { cx: 70, cy: 65, color: '#34d399', label: 'Birds', count: 17, spread: 30 },
]

const points: Point[] = CLUSTERS.flatMap(({ cx, cy, color, label, count, spread }) =>
  Array.from({ length: count }, () => ({
    x: cx + (rand() - 0.5) * spread,
    y: cy + (rand() - 0.5) * spread,
    color,
    label,
  }))
)

export default function LatentSpaceDiagram() {
  return (
    <div className="not-prose my-8 flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-64 h-64 sm:w-80 sm:h-80">
        {/* Axes */}
        <line x1="8" y1="92" x2="95" y2="92" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="0.4" />
        <line x1="8" y1="92" x2="8" y2="5" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="0.4" />
        <text x="52" y="99" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500" fontSize="4" fontFamily="ui-sans-serif, system-ui, sans-serif">z₁</text>
        <text x="3" y="50" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500" fontSize="4" fontFamily="ui-sans-serif, system-ui, sans-serif" transform="rotate(-90, 3, 50)">z₂</text>

        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.3"
            fill={p.color}
            opacity={0.75}
          />
        ))}

        {/* Cluster labels with background for readability */}
        {CLUSTERS.map((c, i) => (
          <g key={i}>
            <text
              x={c.cx}
              y={c.cy - 13}
              textAnchor="middle"
              stroke="black"
              strokeWidth="2.5"
              fontSize="4"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight="500"
              paintOrder="stroke"
              className="dark:stroke-black stroke-white"
            >
              {c.label}
            </text>
            <text
              x={c.cx}
              y={c.cy - 13}
              textAnchor="middle"
              fill={c.color}
              fontSize="4"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontWeight="500"
            >
              {c.label}
            </text>
          </g>
        ))}
      </svg>
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">2D latent space</span>
    </div>
  )
}
