// Three-panel diagram: Recon only | KL only | Balanced

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807 + 0) % 2147483647
    return (seed - 1) / 2147483646
  }
}

interface Dot { x: number; y: number; color: string }

const COLORS = ['#60a5fa', '#facc15', '#f87171', '#34d399']

function makePanel(
  clusters: { cx: number; cy: number; spread: number }[],
  seed: number,
  count: number,
): Dot[] {
  const rand = seeded(seed)
  return clusters.flatMap((c, ci) =>
    Array.from({ length: count }, () => ({
      x: c.cx + (rand() - 0.5) * c.spread,
      y: c.cy + (rand() - 0.5) * c.spread,
      color: COLORS[ci % COLORS.length],
    }))
  )
}

// Panel 1: Recon only — tight clusters scattered far apart, big gaps
const reconOnlyDots = makePanel([
  { cx: 15, cy: 18, spread: 8 },
  { cx: 78, cy: 15, spread: 7 },
  { cx: 20, cy: 80, spread: 9 },
  { cx: 82, cy: 75, spread: 7 },
], 42, 10)

// Panel 2: KL only — everything collapsed to center
const klOnlyDots = makePanel([
  { cx: 50, cy: 50, spread: 16 },
  { cx: 50, cy: 50, spread: 16 },
  { cx: 50, cy: 50, spread: 16 },
  { cx: 50, cy: 50, spread: 16 },
], 77, 10)

// Panel 3: Balanced — clusters near center, overlapping, organized
const balancedDots = makePanel([
  { cx: 35, cy: 38, spread: 18 },
  { cx: 62, cy: 35, spread: 16 },
  { cx: 38, cy: 62, spread: 16 },
  { cx: 60, cy: 60, spread: 18 },
], 99, 10)

function Panel({ dots, label, sublabel, borderColor }: {
  dots: Dot[]
  label: string
  sublabel: string
  borderColor: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      <svg viewBox="0 0 100 100" className="w-full max-w-[180px] aspect-square">
        {/* Centered axes through (50,50) */}
        <line x1="5" y1="50" x2="95" y2="50" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="0.3" />
        <line x1="50" y1="5" x2="50" y2="95" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="0.3" />

        {/* Dots */}
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="1.5" fill={d.color} opacity={0.7} />
        ))}
      </svg>
      <span className="text-xs font-medium" style={{ color: borderColor }}>{label}</span>
      <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight">{sublabel}</span>
    </div>
  )
}

export default function LossTradeoffDiagram() {
  return (
    <div className="not-prose my-8">
      <div className="flex items-start justify-center gap-4 sm:gap-6">
        <Panel
          dots={reconOnlyDots}
          label="Recon loss only"
          sublabel="Good reconstruction, but gaps everywhere — can't sample"
          borderColor="#60a5fa"
        />
        <Panel
          dots={klOnlyDots}
          label="KL loss only"
          sublabel="Everything collapses to N(0,I) — can't reconstruct"
          borderColor="#f87171"
        />
        <Panel
          dots={balancedDots}
          label="Balanced"
          sublabel="Organized, overlapping — good reconstruction and sampling"
          borderColor="#34d399"
        />
      </div>
    </div>
  )
}
