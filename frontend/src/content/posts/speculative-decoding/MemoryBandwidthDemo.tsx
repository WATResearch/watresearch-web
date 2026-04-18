import { useRef, useEffect } from 'react'
import gsap from 'gsap'

const N_LAYERS = 4
const LOAD_DURATION = 1.0
const MATMUL_DURATION = 0.15
const TRANSITION_DURATION = 0.3

const STEP_DURATION = LOAD_DURATION + MATMUL_DURATION + TRANSITION_DURATION
const PASS_DURATION = N_LAYERS * STEP_DURATION

const UTIL_W = 200
const UTIL_H = 44

// Pre-computed step-function transitions (time in sec, new util value)
const UTIL_EVENTS: [number, number][] = []
for (let i = 0; i < N_LAYERS; i++) {
  const base = i * STEP_DURATION
  UTIL_EVENTS.push([base + LOAD_DURATION, 1])
  UTIL_EVENTS.push([base + LOAD_DURATION + MATMUL_DURATION, 0])
}

function buildUtilPoints(nowSec: number): string {
  const clamped = Math.max(0, Math.min(nowSec, PASS_DURATION))
  const pts: string[] = [`0,${UTIL_H}`]
  let lastUtil = 0
  for (const [t, u] of UTIL_EVENTS) {
    if (t > clamped) break
    const x = (t / PASS_DURATION) * UTIL_W
    pts.push(`${x.toFixed(2)},${(UTIL_H - lastUtil * UTIL_H).toFixed(2)}`)
    pts.push(`${x.toFixed(2)},${(UTIL_H - u * UTIL_H).toFixed(2)}`)
    lastUtil = u
  }
  const xNow = (clamped / PASS_DURATION) * UTIL_W
  pts.push(`${xNow.toFixed(2)},${(UTIL_H - lastUtil * UTIL_H).toFixed(2)}`)
  return pts.join(' ')
}

export default function MemoryBandwidthDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const vramRefs = useRef<(HTMLDivElement | null)[]>([])
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])
  const activationRef = useRef<HTMLDivElement>(null)
  const computeBoxRef = useRef<HTMLDivElement>(null)
  const computeStatusRef = useRef<HTMLDivElement>(null)
  const flyingWeightRef = useRef<HTMLDivElement>(null)
  const outputTokenRef = useRef<HTMLDivElement>(null)
  const stepLabelRef = useRef<HTMLSpanElement>(null)
  const utilPolylineRef = useRef<SVGPolylineElement>(null)
  const nowCursorRef = useRef<SVGLineElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const vramEls = vramRefs.current.filter(Boolean) as HTMLDivElement[]
    const layerEls = layerRefs.current.filter(Boolean) as HTMLDivElement[]
    const activation = activationRef.current
    const computeBox = computeBoxRef.current
    const computeStatus = computeStatusRef.current
    const flying = flyingWeightRef.current
    const output = outputTokenRef.current
    const stepLabel = stepLabelRef.current

    const utilPolyline = utilPolylineRef.current
    const nowCursor = nowCursorRef.current

    if (!container || !activation || !computeBox || !computeStatus || !flying || !output || !stepLabel) return
    if (!utilPolyline || !nowCursor) return
    if (vramEls.length === 0 || layerEls.length === 0) return

    let passStartMs: number | null = null
    let rafId = 0

    const tickGraph = () => {
      if (passStartMs !== null) {
        const now = Math.min((performance.now() - passStartMs) / 1000, PASS_DURATION)
        utilPolyline.setAttribute('points', buildUtilPoints(now))
        const x = (now / PASS_DURATION) * UTIL_W
        nowCursor.setAttribute('x1', x.toString())
        nowCursor.setAttribute('x2', x.toString())
      }
      rafId = requestAnimationFrame(tickGraph)
    }
    rafId = requestAnimationFrame(tickGraph)

    const resetGraph = () => {
      passStartMs = null
      utilPolyline.setAttribute('points', `0,${UTIL_H}`)
      nowCursor.setAttribute('x1', '0')
      nowCursor.setAttribute('x2', '0')
    }

    const layerIdleClass = 'px-4 py-2 rounded-md font-mono text-sm border border-gray-300 dark:border-gray-700 min-w-[110px] h-10 flex items-center justify-center text-gray-500 dark:text-gray-400'
    const layerActiveClass = 'px-4 py-2 rounded-md font-mono text-sm border-2 border-blue-400 dark:border-blue-500 min-w-[110px] h-10 flex items-center justify-center text-blue-600 dark:text-blue-300 bg-blue-50/40 dark:bg-blue-950/30'
    const layerDoneClass = 'px-4 py-2 rounded-md font-mono text-sm border border-emerald-400/40 dark:border-emerald-500/30 min-w-[110px] h-10 flex items-center justify-center text-emerald-600/70 dark:text-emerald-400/60 bg-emerald-50/20 dark:bg-emerald-950/20'

    const placeActivationAt = (layerIdx: number) => {
      const layer = layerEls[layerIdx]
      if (!layer) return
      const layerRect = layer.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      gsap.to(activation, {
        x: layerRect.left - containerRect.left - activation.offsetWidth - 10,
        y: layerRect.top - containerRect.top + (layerRect.height - activation.offsetHeight) / 2,
        duration: 0.25,
        ease: 'power2.out',
      })
    }

    const setActivationInstant = (layerIdx: number) => {
      const layer = layerEls[layerIdx]
      if (!layer) return
      const layerRect = layer.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      gsap.set(activation, {
        x: layerRect.left - containerRect.left - activation.offsetWidth - 10,
        y: layerRect.top - containerRect.top + (layerRect.height - activation.offsetHeight) / 2,
      })
    }

    const setComputeIdle = () => {
      gsap.to(computeBox, { opacity: 0.45, duration: 0.15 })
      computeStatus.textContent = 'idle'
      computeStatus.className = 'font-mono text-sm text-blue-500/60 dark:text-blue-400/50 italic'
    }

    const setComputeBusy = () => {
      gsap.to(computeBox, { opacity: 1, duration: 0.1 })
      computeStatus.textContent = 'matmul'
      computeStatus.className = 'font-mono text-sm text-blue-600 dark:text-blue-300 font-semibold'
    }

    const resetScene = () => {
      vramEls.forEach(el => {
        el.style.opacity = '1'
        el.style.filter = 'none'
      })
      layerEls.forEach(el => { el.className = layerIdleClass })
      gsap.set(flying, { opacity: 0 })
      gsap.set(output, { opacity: 0 })
      gsap.set(activation, { opacity: 0 })
      setComputeIdle()
      stepLabel.textContent = 'ready'
      resetGraph()
    }

    resetScene()

    const tl = gsap.timeline({ repeat: -1 })
    tl.to({}, { duration: 0.6 })

    // Activation appears at layer 1 (bottom of stack)
    tl.call(() => {
      setActivationInstant(0)
      gsap.to(activation, { opacity: 1, duration: 0.3 })
      stepLabel.textContent = 'starting forward pass — input at layer 1'
    })
    tl.to({}, { duration: 0.7 })

    // Begin the live utilization clock alongside the first layer load
    tl.call(() => { passStartMs = performance.now() })

    for (let i = 0; i < N_LAYERS; i++) {
      // 1. Highlight current layer + weight, begin load (compute idle)
      tl.call(() => {
        layerEls[i].className = layerActiveClass
        vramEls[i].style.filter = 'brightness(1.25)'
        setComputeIdle()
        stepLabel.textContent = `layer ${i + 1} / ${N_LAYERS} — loading W${i + 1} from VRAM (compute idle)`

        // launch flying weight from VRAM → compute
        const vramRect = vramEls[i].getBoundingClientRect()
        const computeRect = computeBox.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        flying.textContent = `W${i + 1}`
        gsap.set(flying, {
          x: vramRect.left - containerRect.left,
          y: vramRect.top - containerRect.top,
          opacity: 1,
          scale: 1,
        })
        const targetX = computeRect.left - containerRect.left + (computeRect.width - flying.offsetWidth) / 2
        const targetY = computeRect.top - containerRect.top + (computeRect.height - flying.offsetHeight) / 2
        gsap.to(flying, { x: targetX, y: targetY, duration: LOAD_DURATION, ease: 'power1.inOut' })
      })
      tl.to({}, { duration: LOAD_DURATION })

      // 2. Weight arrives — matmul flash
      tl.call(() => {
        gsap.to(flying, { opacity: 0, duration: 0.1 })
        setComputeBusy()
        gsap.fromTo(computeBox,
          { scale: 1 },
          { scale: 1.06, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }
        )
        stepLabel.textContent = `layer ${i + 1} / ${N_LAYERS} — matmul (brief burst of compute)`
      })
      tl.to({}, { duration: MATMUL_DURATION })

      // 3. Return compute to idle, mark layer done, advance activation
      tl.call(() => {
        setComputeIdle()
        layerEls[i].className = layerDoneClass
        vramEls[i].style.opacity = '0.35'
        vramEls[i].style.filter = 'none'

        if (i + 1 < N_LAYERS) {
          placeActivationAt(i + 1)
        }
      })
      tl.to({}, { duration: TRANSITION_DURATION })
    }

    // Emit output token
    tl.call(() => {
      const topLayer = layerEls[N_LAYERS - 1]
      const topRect = topLayer.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      output.textContent = 'next token'
      gsap.set(output, {
        x: topRect.left - containerRect.left + (topRect.width - output.offsetWidth) / 2,
        y: topRect.top - containerRect.top - output.offsetHeight - 10,
        opacity: 0,
        scale: 0.7,
      })
      gsap.to(output, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' })
      gsap.to(activation, { opacity: 0, duration: 0.3 })
      stepLabel.textContent = 'one token produced — now repeat all of this for the next one'
    })
    tl.to({}, { duration: 2.0 })

    tl.call(resetScene)
    tl.to({}, { duration: 0.5 })

    return () => {
      tl.kill()
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div ref={containerRef} className="not-prose my-10 max-w-4xl mx-auto relative">
      <div className="flex items-center justify-center gap-6 sm:gap-10">
        {/* VRAM column */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">VRAM (weights)</div>
          <div className="flex flex-col-reverse gap-1.5 p-2 rounded-lg border border-gray-300 dark:border-gray-700">
            {Array.from({ length: N_LAYERS }, (_, i) => (
              <div
                key={i}
                ref={el => { vramRefs.current[i] = el }}
                className="px-3 py-1 rounded-md font-mono text-sm bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 min-w-[60px] text-center"
              >
                W{i + 1}
              </div>
            ))}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">tens of GB</div>
        </div>

        {/* Compute column */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">compute cores</div>
          <div
            ref={computeBoxRef}
            className="w-32 h-32 rounded-lg border-2 border-blue-300 dark:border-blue-600 flex items-center justify-center bg-blue-50/30 dark:bg-blue-950/20"
          >
            <div
              ref={computeStatusRef}
              className="font-mono text-sm text-blue-500/60 dark:text-blue-400/50 italic"
            >
              idle
            </div>
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">mostly waiting</div>
        </div>

        {/* Layer stack column */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">transformer layers</div>
          <div className="flex flex-col-reverse gap-1.5">
            {Array.from({ length: N_LAYERS }, (_, i) => (
              <div
                key={i}
                ref={el => { layerRefs.current[i] = el }}
                className="px-4 py-2 rounded-md font-mono text-sm border border-gray-300 dark:border-gray-700 min-w-[110px] h-10 flex items-center justify-center text-gray-500 dark:text-gray-400"
              >
                layer {i + 1}
              </div>
            ))}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">activation climbs</div>
        </div>
      </div>

      {/* Activation marker (absolutely positioned by animation) */}
      <div
        ref={activationRef}
        className="absolute top-0 left-0 px-2 py-1 rounded-md font-mono text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 pointer-events-none shadow-sm"
        style={{ opacity: 0 }}
      >
        x
      </div>

      {/* Flying weight pill (absolutely positioned by animation) */}
      <div
        ref={flyingWeightRef}
        className="absolute top-0 left-0 px-3 py-1 rounded-md font-mono text-sm bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 min-w-[60px] text-center pointer-events-none shadow-sm"
        style={{ opacity: 0 }}
      >
        W
      </div>

      {/* Output token (absolutely positioned when emitted) */}
      <div
        ref={outputTokenRef}
        className="absolute top-0 left-0 px-2.5 py-1.5 rounded-md font-mono text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 pointer-events-none shadow-sm"
        style={{ opacity: 0 }}
      >
        next token
      </div>

      {/* Live utilization graph */}
      <div className="flex justify-center mt-6">
        <div className="flex flex-col items-center gap-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">compute utilization over time</div>
          <div className="flex items-center gap-2">
            {/* Y-axis labels */}
            <div
              className="flex flex-col justify-between text-[10px] font-mono text-gray-400 dark:text-gray-500"
              style={{ height: `${UTIL_H}px` }}
            >
              <span className="leading-none">1</span>
              <span className="leading-none">0</span>
            </div>
            <svg
              width={UTIL_W}
              height={UTIL_H + 2}
              className="overflow-visible"
              viewBox={`0 -1 ${UTIL_W} ${UTIL_H + 2}`}
            >
              {/* baseline (util=0) */}
              <line x1={0} y1={UTIL_H} x2={UTIL_W} y2={UTIL_H} className="stroke-gray-300 dark:stroke-gray-700" strokeWidth={1} />
              {/* ceiling (util=1) */}
              <line x1={0} y1={0} x2={UTIL_W} y2={0} className="stroke-gray-200 dark:stroke-gray-800" strokeWidth={1} strokeDasharray="2 3" />
              {/* live trace */}
              <polyline
                ref={utilPolylineRef}
                points={`0,${UTIL_H}`}
                fill="none"
                strokeWidth={1.75}
                strokeLinejoin="miter"
                className="stroke-blue-500 dark:stroke-blue-400"
              />
              {/* now cursor */}
              <line
                ref={nowCursorRef}
                x1={0}
                y1={-1}
                x2={0}
                y2={UTIL_H + 1}
                strokeWidth={1}
                className="stroke-blue-400/40 dark:stroke-blue-300/40"
              />
            </svg>
          </div>
          <div
            className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mt-0.5"
            style={{ marginLeft: '16px', width: `${UTIL_W}px`, display: 'flex', justifyContent: 'space-between' }}
          >
            <span>t = 0</span>
            <span>one forward pass</span>
            <span>t = {PASS_DURATION.toFixed(2)}s</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <span ref={stepLabelRef} className="text-xs text-gray-500 dark:text-gray-400">ready</span>
      </div>
    </div>
  )
}
