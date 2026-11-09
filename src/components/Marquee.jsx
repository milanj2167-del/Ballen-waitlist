/** Infinite scrolling ticker strip. */
export default function Marquee({ items, className = '', reverse = false }) {
  const row = [...items, ...items]
  return (
    <div className={`overflow-hidden whitespace-nowrap select-none ${className}`} aria-hidden="true">
      <div
        className="inline-flex animate-marquee"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0">
            {row.map((t, i) => (
              <span key={i} className="mx-6 inline-flex items-center gap-6 font-display text-2xl uppercase md:text-3xl">
                {t}
                <span className="text-xl">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
