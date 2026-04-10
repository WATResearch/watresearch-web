export default function PointVsDistributionDiagram() {
  return (
    <div className="not-prose my-8">
      <div className="flex items-end justify-center gap-6 sm:gap-12">
        {/* Autoencoder */}
        <div className="flex flex-col items-center gap-2">
          <svg viewBox="0 0 80 80" className="w-36 h-36 sm:w-44 sm:h-44">
            <line x1="10" y1="70" x2="75" y2="70" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="0.4" />
            <line x1="10" y1="70" x2="10" y2="5" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="0.4" />
            <text x="42" y="78" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500" fontSize="4" fontFamily="ui-sans-serif, system-ui, sans-serif">z&#x2081;</text>
            <text x="5" y="38" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500" fontSize="4" fontFamily="ui-sans-serif, system-ui, sans-serif" transform="rotate(-90, 5, 38)">z&#x2082;</text>

            <circle cx="40" cy="35" r="2.5" className="fill-blue-400 dark:fill-blue-500" />
            <text x="46" y="33" className="fill-blue-400 dark:fill-blue-400" fontSize="5" fontFamily="ui-sans-serif, system-ui, sans-serif">z</text>
          </svg>
          <span className="text-xs text-gray-500 dark:text-gray-400">Autoencoder: single point</span>
        </div>

        {/* VAE */}
        <div className="flex flex-col items-center gap-2">
          <svg viewBox="0 0 80 80" className="w-36 h-36 sm:w-44 sm:h-44">
            <line x1="10" y1="70" x2="75" y2="70" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="0.4" />
            <line x1="10" y1="70" x2="10" y2="5" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="0.4" />
            <text x="42" y="78" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500" fontSize="4" fontFamily="ui-sans-serif, system-ui, sans-serif">z&#x2081;</text>
            <text x="5" y="38" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500" fontSize="4" fontFamily="ui-sans-serif, system-ui, sans-serif" transform="rotate(-90, 5, 38)">z&#x2082;</text>

            {/* Distribution */}
            <ellipse cx="40" cy="35" rx="18" ry="13" className="fill-emerald-400/8 dark:fill-emerald-500/8 stroke-emerald-400/25 dark:stroke-emerald-500/25" strokeWidth="0.5" />
            <ellipse cx="40" cy="35" rx="11" ry="8" className="fill-emerald-400/15 dark:fill-emerald-500/15 stroke-emerald-400/30 dark:stroke-emerald-500/30" strokeWidth="0.5" />

            {/* Samples */}
            {[[37, 32], [44, 38], [35, 38], [43, 31], [46, 35], [38, 28], [33, 36], [42, 40], [48, 33], [36, 42]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="0.9" className="fill-emerald-400 dark:fill-emerald-500" opacity={0.4} />
            ))}

            {/* Mean */}
            <circle cx="40" cy="35" r="1.5" className="fill-emerald-500 dark:fill-emerald-400" />
            <text x="40" y="54" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400" fontSize="4" fontFamily="ui-sans-serif, system-ui, sans-serif">&#x03BC;, &#x03C3;&#xB2;</text>
          </svg>
          <span className="text-xs text-gray-500 dark:text-gray-400">VAE: distribution</span>
        </div>
      </div>
    </div>
  )
}
