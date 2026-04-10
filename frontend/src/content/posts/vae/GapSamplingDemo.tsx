import { useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'

const GRID = 8

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807 + 0) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

const rand = seeded(42)

const CLUSTERS = [
  { cx: 28, cy: 32, color: '#60a5fa', label: 'Cats', count: 18, spread: 30 },
  { cx: 68, cy: 30, color: '#facc15', label: 'Dogs', count: 16, spread: 28 },
  { cx: 32, cy: 68, color: '#f87171', label: 'Cars', count: 15, spread: 26 },
  { cx: 70, cy: 65, color: '#34d399', label: 'Birds', count: 17, spread: 30 },
]

const scatterPoints = CLUSTERS.flatMap(({ cx, cy, color, count, spread }) =>
  Array.from({ length: count }, () => ({
    x: cx + (rand() - 0.5) * spread,
    y: cy + (rand() - 0.5) * spread,
    color,
  }))
)

// Prototype images per cluster
const _ = '#60a5fa', F = '#facc15', E = '#1e293b', M = '#92400e'
const G = '#34d399', R = '#f87171', W = '#e2e8f0', D = '#334155'

const CLUSTER_IMAGES: [number, number, number][][] = [
  [_,_,_,_,_,_,_,_,_,_,F,F,F,F,_,_,_,F,F,F,F,F,F,_,_,F,E,F,F,E,F,_,_,F,F,F,F,F,F,_,_,F,M,M,M,M,F,_,_,_,F,F,F,F,_,_,_,_,_,_,_,_,_,_].map(hexToRgb),
  [F,F,F,F,F,F,F,F,F,F,M,F,F,M,F,F,F,F,F,F,F,F,F,F,F,F,E,F,F,E,F,F,F,F,F,F,F,F,F,F,F,F,F,M,M,F,F,F,F,F,M,M,M,M,F,F,F,F,F,F,F,F,F,F].map(hexToRgb),
  [D,D,D,D,D,D,D,D,D,D,D,R,R,D,D,D,D,D,R,R,R,R,D,D,D,R,R,R,R,R,R,D,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,D,W,R,R,R,R,W,D,D,D,D,D,D,D,D,D].map(hexToRgb),
  [_,_,_,_,_,_,_,_,_,_,_,G,G,_,_,_,_,_,G,G,G,G,_,_,_,G,E,G,G,G,G,_,_,G,G,G,G,G,G,_,G,G,G,G,G,G,G,G,_,_,G,_,_,G,_,_,_,_,_,_,_,_,_,_].map(hexToRgb),
]

// Group scatter points by cluster
const pointsByCluster: { x: number; y: number }[][] = []
let idx = 0
for (const cluster of CLUSTERS) {
  pointsByCluster.push(scatterPoints.slice(idx, idx + cluster.count))
  idx += cluster.count
}

// Trajectory: actual data points in clusters, with gap waypoints between
const WAYPOINTS: { x: number; y: number }[] = [
  pointsByCluster[0][0], pointsByCluster[0][3], pointsByCluster[0][7],
  { x: 50, y: 31 },
  pointsByCluster[1][2], pointsByCluster[1][5], pointsByCluster[1][10],
  { x: 70, y: 48 },
  pointsByCluster[3][1], pointsByCluster[3][6], pointsByCluster[3][12],
  { x: 50, y: 67 },
  pointsByCluster[2][0], pointsByCluster[2][4], pointsByCluster[2][9],
  { x: 30, y: 50 },
  pointsByCluster[0][0],
]

function clusterWeights(px: number, py: number): number[] {
  const radius = 22
  return CLUSTERS.map(c => {
    const d = Math.sqrt((px - c.cx) ** 2 + (py - c.cy) ** 2)
    const w = Math.max(0, 1 - d / radius)
    return w * w
  })
}

// Position-dependent hash — changes abruptly with small position changes
function hash(x: number, y: number, i: number, ch: number): number {
  let h = (x * 374761 + y * 668265 + i * 1234567 + ch * 987653) | 0
  h = ((h >> 16) ^ h) * 0x45d9f3b
  h = ((h >> 16) ^ h) * 0x45d9f3b
  h = (h >> 16) ^ h
  return (h & 0xff)
}

function positionNoise(px: number, py: number, i: number): [number, number, number] {
  const qx = Math.floor(px * 3.7)
  const qy = Math.floor(py * 3.7)
  return [hash(qx, qy, i, 0), hash(qx, qy, i, 1), hash(qx, qy, i, 2)]
}

function nearestDataPointDist(px: number, py: number): number {
  let min = Infinity
  for (const p of scatterPoints) {
    const d = Math.sqrt((px - p.x) ** 2 + (py - p.y) ** 2)
    if (d < min) min = d
  }
  return min
}

function clamp255(v: number) { return Math.max(0, Math.min(255, Math.round(v))) }

function imageAtPosition(px: number, py: number): string[] {
  const weights = clusterWeights(px, py)
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  const dpDist = nearestDataPointDist(px, py)

  // On a data point: no jitter. Ramps up within 3 units.
  const onPoint = Math.max(0, 1 - dpDist / 3)
  const jitter = 0.55 * (1 - onPoint)

  // How much of the output is signal vs noise:
  // - On a data point: fully signal (clean image)
  // - In cluster but off a point: signal with jitter
  // - In gap: pure noise
  const signal = Math.max(onPoint, Math.min(totalWeight * 3, 1))

  return Array.from({ length: GRID * GRID }, (_, i) => {
    const [nr, ng, nb] = positionNoise(px, py, i)

    if (signal < 0.01) {
      return `rgb(${nr},${ng},${nb})`
    }

    // Weighted blend of cluster prototypes
    let r = 0, g = 0, b = 0
    if (totalWeight > 0) {
      for (let c = 0; c < CLUSTERS.length; c++) {
        const w = weights[c] / totalWeight
        r += CLUSTER_IMAGES[c][i][0] * w
        g += CLUSTER_IMAGES[c][i][1] * w
        b += CLUSTER_IMAGES[c][i][2] * w
      }
    }

    // Position-dependent perturbation (suppressed on data points)
    r = r * (1 - jitter) + nr * jitter
    g = g * (1 - jitter) + ng * jitter
    b = b * (1 - jitter) + nb * jitter

    // Blend toward pure noise away from signal
    r = r * signal + nr * (1 - signal)
    g = g * signal + ng * (1 - signal)
    b = b * signal + nb * (1 - signal)

    return `rgb(${clamp255(r)},${clamp255(g)},${clamp255(b)})`
  })
}

export default function GapSamplingDemo() {
  const markerRef = useRef<SVGCircleElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const gridRef = useRef<(HTMLDivElement | null)[]>([])
  const captionRef = useRef<HTMLSpanElement>(null)
  const posRef = useRef({ x: WAYPOINTS[0].x, y: WAYPOINTS[0].y })
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const draggingRef = useRef(false)

  const updateImage = useCallback(() => {
    const pixels = gridRef.current.filter(Boolean) as HTMLDivElement[]
    const pos = posRef.current
    if (markerRef.current) {
      markerRef.current.setAttribute('cx', String(pos.x))
      markerRef.current.setAttribute('cy', String(pos.y))
    }
    const img = imageAtPosition(pos.x, pos.y)
    pixels.forEach((el, i) => { el.style.backgroundColor = img[i] })

    const dpDist = nearestDataPointDist(pos.x, pos.y)
    const weights = clusterWeights(pos.x, pos.y)
    const total = weights.reduce((a, b) => a + b, 0)
    const inCluster = Math.min(total * 3, 1) > 0.3
    if (captionRef.current) {
      if (dpDist < 0.5) {
        captionRef.current.textContent = 'On a training point — clean reconstruction'
        captionRef.current.style.color = '#34d399'
      } else if (dpDist < 3 || inCluster) {
        captionRef.current.textContent = 'Nearby in cluster — already different'
        captionRef.current.style.color = '#facc15'
      } else {
        captionRef.current.textContent = 'Between clusters — garbage'
        captionRef.current.style.color = '#f87171'
      }
    }
  }, [])

  // Convert mouse/touch event to SVG coordinates
  const toSvgCoords = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return null
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    return { x: Math.max(8, Math.min(95, svgPt.x)), y: Math.max(5, Math.min(92, svgPt.y)) }
  }, [])

  const startDrag = useCallback(() => {
    draggingRef.current = true
    if (tlRef.current) tlRef.current.pause()
  }, [])

  const onDrag = useCallback((clientX: number, clientY: number) => {
    if (!draggingRef.current) return
    const coords = toSvgCoords(clientX, clientY)
    if (coords) {
      posRef.current.x = coords.x
      posRef.current.y = coords.y
      updateImage()
    }
  }, [toSvgCoords, updateImage])

  const stopDrag = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    // Resume animation from current position
    if (tlRef.current) {
      tlRef.current.kill()
    }
    const pos = posRef.current
    const tl = gsap.timeline({ repeat: -1 })
    // Animate back to the trajectory
    tl.to(pos, { x: WAYPOINTS[0].x, y: WAYPOINTS[0].y, duration: 1, ease: 'power2.inOut', onUpdate: updateImage })
    for (let i = 1; i < WAYPOINTS.length; i++) {
      tl.to(pos, { x: WAYPOINTS[i].x, y: WAYPOINTS[i].y, duration: 2, ease: 'power1.inOut', onUpdate: updateImage })
      tl.to({}, { duration: 0.8 })
    }
    tlRef.current = tl
  }, [updateImage])

  useEffect(() => {
    const pixels = gridRef.current.filter(Boolean) as HTMLDivElement[]
    if (pixels.length === 0) return

    const pos = posRef.current
    const tl = gsap.timeline({ repeat: -1 })

    for (let i = 1; i < WAYPOINTS.length; i++) {
      tl.to(pos, {
        x: WAYPOINTS[i].x,
        y: WAYPOINTS[i].y,
        duration: 2,
        ease: 'power1.inOut',
        onUpdate: updateImage,
      })
      tl.to({}, { duration: 0.8 })
    }
    tlRef.current = tl

    updateImage()

    return () => { tl.kill() }
  }, [updateImage])

  const pixelSize = 'w-3.5 h-3.5 sm:w-4 sm:h-4'

  return (
    <div className="not-prose my-8">
      <div className="flex items-center justify-center gap-6 sm:gap-10">
        <div className="flex flex-col items-center">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="w-52 h-52 sm:w-64 sm:h-64 shrink-0 cursor-crosshair select-none touch-none"
          onMouseDown={(e) => { startDrag(); onDrag(e.clientX, e.clientY) }}
          onMouseMove={(e) => onDrag(e.clientX, e.clientY)}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onTouchStart={(e) => { startDrag(); onDrag(e.touches[0].clientX, e.touches[0].clientY) }}
          onTouchMove={(e) => onDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={stopDrag}
        >
          <line x1="8" y1="92" x2="95" y2="92" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="0.4" />
          <line x1="8" y1="92" x2="8" y2="5" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="0.4" />
          <text x="52" y="99" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500" fontSize="4" fontFamily="ui-sans-serif, system-ui, sans-serif">z&#x2081;</text>
          <text x="3" y="50" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500" fontSize="4" fontFamily="ui-sans-serif, system-ui, sans-serif" transform="rotate(-90, 3, 50)">z&#x2082;</text>

          {scatterPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="1.3" fill={p.color} opacity={0.75} />
          ))}

          {CLUSTERS.map((c, i) => (
            <g key={i}>
              <text x={c.cx} y={c.cy - 13} textAnchor="middle" stroke="black" strokeWidth="2.5" fontSize="4" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="500" paintOrder="stroke" className="dark:stroke-black stroke-white">{c.label}</text>
              <text x={c.cx} y={c.cy - 13} textAnchor="middle" fill={c.color} fontSize="4" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="500">{c.label}</text>
            </g>
          ))}

          <circle ref={markerRef} cx={WAYPOINTS[0].x} cy={WAYPOINTS[0].y} r="2.5" fill="white" stroke="white" strokeWidth="0.5" opacity="0.9" className="pointer-events-none" />
        </svg>
        <span className="text-[10px] text-gray-500 dark:text-gray-600 mt-1">Click and drag to explore</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Decoded output</span>
          <div
            className="grid gap-[1px] w-fit"
            style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}
          >
            {Array.from({ length: GRID * GRID }).map((_, i) => (
              <div
                key={i}
                ref={el => { gridRef.current[i] = el }}
                className={`${pixelSize} rounded-[1px]`}
                style={{ backgroundColor: '#333' }}
              />
            ))}
          </div>
          <span ref={captionRef} className="text-xs font-medium w-56 text-center" />
        </div>
      </div>
    </div>
  )
}
