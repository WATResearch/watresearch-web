import { useRef, useEffect } from 'react'
import gsap from 'gsap'

const GRID = 8
const _ = '#60a5fa', F = '#facc15', E = '#1e293b', M = '#92400e'

const INPUT_PIXELS: string[] = [
  _,_,_,_,_,_,_,_,
  _,_,F,F,F,F,_,_,
  _,F,F,F,F,F,F,_,
  _,F,E,F,F,E,F,_,
  _,F,F,F,F,F,F,_,
  _,F,M,M,M,M,F,_,
  _,_,F,F,F,F,_,_,
  _,_,_,_,_,_,_,_,
]

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

const INPUT_RGB = INPUT_PIXELS.map(hexToRgb)

const RECON_OFFSETS: [number, number, number][] = INPUT_RGB.map(() => [
  Math.round((Math.random() - 0.5) * 20),
  Math.round((Math.random() - 0.5) * 20),
  Math.round((Math.random() - 0.5) * 20),
])

function clamp(v: number) { return Math.max(0, Math.min(255, v)) }

function reconColor(i: number): string {
  const [r, g, b] = INPUT_RGB[i]
  const [dr, dg, db] = RECON_OFFSETS[i]
  return `rgb(${clamp(r + dr)},${clamp(g + dg)},${clamp(b + db)})`
}

const LATENT_DIM = 4
const HIDDEN = { opacity: 0, visibility: 'hidden' as const }

export default function AutoencoderDiagram() {
  const inputGroupRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<(HTMLDivElement | null)[]>([])
  const reconRef = useRef<(HTMLDivElement | null)[]>([])
  const latentRef = useRef<(HTMLDivElement | null)[]>([])
  const latentGroupRef = useRef<HTMLDivElement>(null)
  const arrowLeftGroupRef = useRef<HTMLDivElement>(null)
  const arrowRightGroupRef = useRef<HTMLDivElement>(null)
  const reconGroupRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const inputs = inputRef.current.filter(Boolean) as HTMLDivElement[]
    const recons = reconRef.current.filter(Boolean) as HTMLDivElement[]
    const latents = latentRef.current.filter(Boolean) as HTMLDivElement[]
    if (inputs.length === 0) return

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 })

    // ── Stage 1: Image → Latent ──

    // Caption
    tl.fromTo(captionRef.current, { opacity: 0 }, {
      opacity: 1, duration: 0.4,
      onStart() { if (captionRef.current) captionRef.current.textContent = 'Take a complex 8×8 image...' },
    })

    // Show input group
    tl.to(inputGroupRef.current, {
      opacity: 1, visibility: 'visible', duration: 0.4,
    }, '<')

    // Highlight input pixels
    tl.to(inputs, {
      scale: 1.08, duration: 0.5, stagger: 0.008, ease: 'power2.out',
    }, '+=0.3')
    tl.to(inputs, {
      scale: 1, duration: 0.3, stagger: 0.005,
    })

    // Update caption, show arrow
    tl.call(() => { if (captionRef.current) captionRef.current.textContent = '...and compress it down to a simple 4-dimensional latent.' })
    tl.to(arrowLeftGroupRef.current, {
      opacity: 1, visibility: 'visible', duration: 0.4,
    }, '+=0.2')

    // Show latent label + bars pop in
    tl.to(latentGroupRef.current, {
      opacity: 1, visibility: 'visible', duration: 0.3,
    })
    tl.to(latents, {
      opacity: 1, scaleY: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(2)',
    }, '-=0.1')

    // Hold
    tl.to({}, { duration: 2.5 })

    // ── Transition: fade out stage 1 (input + arrow), keep latent ──
    tl.to([inputGroupRef.current, arrowLeftGroupRef.current, captionRef.current], {
      opacity: 0, duration: 0.5,
    })
    tl.call(() => {
      if (inputGroupRef.current) { inputGroupRef.current.style.display = 'none' }
      if (arrowLeftGroupRef.current) { arrowLeftGroupRef.current.style.display = 'none' }
      if (arrowRightGroupRef.current) { arrowRightGroupRef.current.style.display = '' }
      if (reconGroupRef.current) { reconGroupRef.current.style.display = '' }
    })

    // ── Stage 2: Latent → Reconstruction ──
    tl.fromTo(captionRef.current, { opacity: 0 }, {
      opacity: 1, duration: 0.4,
      onStart() { if (captionRef.current) captionRef.current.textContent = 'Then reconstruct the 8×8 image from just those 4 numbers.' },
    })

    // Show reconstruct arrow
    tl.to(arrowRightGroupRef.current, {
      opacity: 1, visibility: 'visible', duration: 0.4,
    }, '+=0.2')

    // Show recon group + pixels fade in
    tl.to(reconGroupRef.current, {
      opacity: 1, visibility: 'visible', duration: 0.3,
    })
    tl.to(recons, {
      opacity: 1, duration: 0.5, stagger: 0.008, ease: 'power2.out',
    }, '-=0.1')

    // Hold
    tl.to({}, { duration: 2.5 })

    // ── Reset everything ──
    tl.to([
      captionRef.current, reconGroupRef.current, arrowRightGroupRef.current,
      latentGroupRef.current,
    ], {
      opacity: 0, duration: 0.5,
    })
    tl.to(latents, { scaleY: 0.3, opacity: 0, duration: 0.4 }, '<')
    tl.to(recons, { opacity: 0, duration: 0.4 }, '<')

    // Restore DOM for next loop
    tl.call(() => {
      if (inputGroupRef.current) { inputGroupRef.current.style.display = '' }
      if (arrowLeftGroupRef.current) { arrowLeftGroupRef.current.style.display = '' }
      if (arrowRightGroupRef.current) { arrowRightGroupRef.current.style.display = 'none' }
      if (reconGroupRef.current) { reconGroupRef.current.style.display = 'none' }
      // Reset visibility so gsap can animate them again
      ;[inputGroupRef, arrowLeftGroupRef, latentGroupRef].forEach(ref => {
        if (ref.current) { ref.current.style.visibility = 'hidden'; ref.current.style.opacity = '0' }
      })
    })

    return () => { tl.kill() }
  }, [])

  const pixelSize = 'w-3.5 h-3.5 sm:w-4 sm:h-4'

  return (
    <div className="not-prose my-8">
      <div className="flex items-center justify-center gap-3 sm:gap-5">
        {/* Input grid */}
        <div ref={inputGroupRef} className="flex flex-col items-center gap-2" style={HIDDEN}>
          <div
            className="grid gap-[1px] w-fit"
            style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}
          >
            {INPUT_PIXELS.map((color, i) => (
              <div
                key={i}
                ref={el => { inputRef.current[i] = el }}
                className={`${pixelSize} rounded-[1px]`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Image</span>
        </div>

        {/* Compress arrow */}
        <div ref={arrowLeftGroupRef} className="flex flex-col items-center gap-1" style={HIDDEN}>
          <div className="text-gray-400 dark:text-gray-500 text-lg leading-none">&#x2192;</div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">compress</span>
        </div>

        {/* Latent code */}
        <div ref={latentGroupRef} className="flex flex-col items-center gap-2" style={HIDDEN}>
          <div className="flex flex-col gap-1">
            {Array.from({ length: LATENT_DIM }).map((_, i) => (
              <div
                key={i}
                ref={el => { latentRef.current[i] = el }}
                className="w-6 h-4 sm:w-7 sm:h-5 rounded-sm bg-emerald-400 dark:bg-emerald-500"
                style={{ opacity: 0, transform: 'scaleY(0.3)' }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Latent</span>
        </div>

        {/* Reconstruct arrow */}
        <div ref={arrowRightGroupRef} className="flex flex-col items-center gap-1" style={{ ...HIDDEN, display: 'none' }}>
          <div className="text-gray-400 dark:text-gray-500 text-lg leading-none">&#x2192;</div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">reconstruct</span>
        </div>

        {/* Reconstruction grid */}
        <div ref={reconGroupRef} className="flex flex-col items-center gap-2" style={{ ...HIDDEN, display: 'none' }}>
          <div
            className="grid gap-[1px] w-fit"
            style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}
          >
            {INPUT_PIXELS.map((_, i) => (
              <div
                key={i}
                ref={el => { reconRef.current[i] = el }}
                className={`${pixelSize} rounded-[1px]`}
                style={{ backgroundColor: reconColor(i), opacity: 0 }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Reconstruction</span>
        </div>
      </div>

      <p
        ref={captionRef}
        className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 h-5"
        style={{ opacity: 0 }}
      />
    </div>
  )
}
