export default function ReparamDiagram() {
  const font = 'ui-sans-serif, system-ui, sans-serif'

  return (
    <div className="not-prose my-8">
      <div className="flex items-end justify-center gap-8 sm:gap-16">
        {/* Direct sampling — no gradients */}
        <div className="flex flex-col items-center gap-3">
          <svg viewBox="0 0 100 140" className="w-48 sm:w-60">
            {/* Encoder */}
            <rect x="20" y="4" width="60" height="22" rx="3" className="fill-gray-200 dark:fill-gray-800 stroke-gray-400 dark:stroke-gray-600" strokeWidth="0.8" />
            <text x="50" y="15" textAnchor="middle" dy="0.35em" className="fill-gray-500 dark:fill-gray-400" fontSize="9" fontFamily={font}>Encoder</text>

            {/* Arrow to distribution */}
            <line x1="50" y1="26" x2="50" y2="40" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="0.8" />
            <polygon points="47,39 53,39 50,43" className="fill-gray-400 dark:fill-gray-500" />

            {/* Distribution ellipse */}
            <ellipse cx="50" cy="60" rx="28" ry="15" className="fill-emerald-400/12 dark:fill-emerald-500/12 stroke-emerald-400/50 dark:stroke-emerald-500/50" strokeWidth="0.6" />
            <text x="50" y="56" textAnchor="middle" dy="0.35em" className="fill-emerald-500 dark:fill-emerald-400" fontSize="9" fontFamily={font} fontWeight="500">&#x03BC;, &#x03C3;&#xB2;</text>
            <text x="50" y="65" textAnchor="middle" dy="0.35em" className="fill-gray-400 dark:fill-gray-500" fontSize="6" fontFamily={font}>sample</text>

            {/* Red X — non-differentiable */}
            <line x1="50" y1="75" x2="50" y2="92" className="stroke-red-400 dark:stroke-red-500" strokeWidth="0.8" />
            <line x1="44" y1="80" x2="56" y2="88" className="stroke-red-400 dark:stroke-red-500" strokeWidth="1.5" />
            <line x1="56" y1="80" x2="44" y2="88" className="stroke-red-400 dark:stroke-red-500" strokeWidth="1.5" />
            <polygon points="47,91 53,91 50,95" className="fill-red-400 dark:fill-red-500" />

            {/* z */}
            <circle cx="50" cy="106" r="10" className="fill-violet-400/12 dark:fill-violet-500/12 stroke-violet-400 dark:stroke-violet-500" strokeWidth="0.8" />
            <text x="50" y="106" textAnchor="middle" dy="0.35em" className="fill-violet-500 dark:fill-violet-400" fontSize="11" fontFamily={font} fontWeight="500">z</text>

            {/* Label */}
            <text x="50" y="128" textAnchor="middle" className="fill-red-400 dark:fill-red-500" fontSize="7" fontFamily={font}>no gradients</text>
          </svg>
          <span className="text-sm text-gray-500 dark:text-gray-400">Direct sampling</span>
        </div>

        {/* Reparameterized — gradients flow */}
        <div className="flex flex-col items-center gap-3">
          <svg viewBox="0 0 120 145" className="w-56 sm:w-72">
            <defs>
              <marker id="arr-green" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                <polygon points="0,0 6,2.5 0,5" className="fill-emerald-400 dark:fill-emerald-500" />
              </marker>
              <marker id="arr-amber" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                <polygon points="0,0 6,2.5 0,5" className="fill-amber-400 dark:fill-amber-500" />
              </marker>
              <marker id="arr-gray" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                <polygon points="0,0 6,2.5 0,5" className="fill-gray-400 dark:fill-gray-500" />
              </marker>
            </defs>

            {/* Encoder */}
            <rect x="20" y="4" width="60" height="22" rx="3" className="fill-gray-200 dark:fill-gray-800 stroke-gray-400 dark:stroke-gray-600" strokeWidth="0.8" />
            <text x="50" y="15" textAnchor="middle" dy="0.35em" className="fill-gray-500 dark:fill-gray-400" fontSize="9" fontFamily={font}>Encoder</text>

            {/* Encoder → μ */}
            <line x1="38" y1="26" x2="28" y2="41" className="stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="0.8" markerEnd="url(#arr-green)" />
            {/* Encoder → σ */}
            <line x1="62" y1="26" x2="72" y2="41" className="stroke-amber-400 dark:stroke-amber-500" strokeWidth="0.8" markerEnd="url(#arr-amber)" />

            {/* μ */}
            <circle cx="26" cy="52" r="9" className="fill-emerald-400/12 dark:fill-emerald-500/12 stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="0.8" />
            <text x="26" y="52" textAnchor="middle" dy="0.35em" className="fill-emerald-500 dark:fill-emerald-400" fontSize="11" fontFamily={font} fontWeight="500">&#x03BC;</text>

            {/* σ */}
            <circle cx="74" cy="52" r="9" className="fill-amber-400/12 dark:fill-amber-500/12 stroke-amber-400 dark:stroke-amber-500" strokeWidth="0.8" />
            <text x="74" y="52" textAnchor="middle" dy="0.35em" className="fill-amber-500 dark:fill-amber-400" fontSize="11" fontFamily={font} fontWeight="500">&#x03C3;</text>

            {/* ε */}
            <circle cx="105" cy="76" r="8" className="fill-gray-200/20 dark:fill-gray-700/20 stroke-gray-400 dark:stroke-gray-500" strokeWidth="0.6" />
            <text x="105" y="76" textAnchor="middle" dy="0.35em" className="fill-gray-500 dark:fill-gray-400" fontSize="10" fontFamily={font}>&#x03B5;</text>
            <text x="105" y="90" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400" fontSize="5" fontFamily={font}>~ N(0, I)</text>

            {/* σ → × */}
            <line x1="74" y1="61" x2="74" y2="71" className="stroke-amber-400 dark:stroke-amber-500" strokeWidth="0.8" markerEnd="url(#arr-amber)" />

            {/* ε → × */}
            <line x1="97" y1="76" x2="80" y2="76" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="0.6" markerEnd="url(#arr-gray)" />

            {/* × node */}
            <circle cx="74" cy="76" r="5" className="fill-gray-100 dark:fill-gray-900 stroke-gray-400 dark:stroke-gray-600" strokeWidth="0.6" />
            <text x="74" y="76" textAnchor="middle" dy="0.35em" className="fill-gray-500 dark:fill-gray-400" fontSize="9" fontFamily={font}>&#xD7;</text>

            {/* μ → + (long path down and across) */}
            <line x1="26" y1="61" x2="26" y2="96" className="stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="0.8" />
            <line x1="26" y1="96" x2="43" y2="100" className="stroke-emerald-400 dark:stroke-emerald-500" strokeWidth="0.8" markerEnd="url(#arr-green)" />

            {/* σε → + */}
            <line x1="74" y1="81" x2="74" y2="92" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="0.6" />
            <line x1="74" y1="92" x2="55" y2="100" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="0.6" markerEnd="url(#arr-gray)" />

            {/* + node */}
            <circle cx="48" cy="102" r="5" className="fill-gray-100 dark:fill-gray-900 stroke-gray-400 dark:stroke-gray-600" strokeWidth="0.6" />
            <text x="48" y="102" textAnchor="middle" dy="0.35em" className="fill-gray-500 dark:fill-gray-400" fontSize="10" fontFamily={font}>+</text>

            {/* + → z */}
            <line x1="48" y1="107" x2="48" y2="117" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="0.8" markerEnd="url(#arr-gray)" />

            {/* z */}
            <circle cx="48" cy="128" r="10" className="fill-violet-400/12 dark:fill-violet-500/12 stroke-violet-400 dark:stroke-violet-500" strokeWidth="0.8" />
            <text x="48" y="128" textAnchor="middle" dy="0.35em" className="fill-violet-500 dark:fill-violet-400" fontSize="11" fontFamily={font} fontWeight="500">z</text>

            {/* Gradient flow label */}
            <text x="8" y="80" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400" fontSize="5.5" fontFamily={font} transform="rotate(-90, 8, 80)">gradients flow</text>
          </svg>
          <span className="text-sm text-gray-500 dark:text-gray-400">Reparameterized</span>
        </div>
      </div>
    </div>
  )
}
