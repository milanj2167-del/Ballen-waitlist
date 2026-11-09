/**
 * GameContainer — placeholder for the future browser game.
 *
 * Integration contract: replace the inner <GamePlaceholder /> with the real game
 * (canvas / iframe / component). The outer frame keeps a fixed aspect ratio so the
 * page layout does not change. `onScore` will be wired to the leaderboard later.
 */
function GamePlaceholder() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-ink text-paper">
      {/* pixel grid floor */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/3 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(#F8D928 1px, transparent 1px), linear-gradient(90deg, #F8D928 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          transform: 'perspective(300px) rotateX(60deg)',
          transformOrigin: 'bottom',
        }}
      />

      {/* placeholder illustration: two balls dodging a cactus */}
      <svg aria-hidden="true" viewBox="0 0 240 110" className="relative w-56 md:w-80">
        <g className="animate-[bounce_1.6s_ease-in-out_infinite]">
          <circle cx="60" cy="70" r="20" fill="#F8D928" stroke="#111" strokeWidth="3" />
          <circle cx="98" cy="74" r="16" fill="#fff" stroke="#111" strokeWidth="3" />
          <circle cx="54" cy="64" r="3" fill="#111" />
          <circle cx="66" cy="64" r="3" fill="#111" />
          <circle cx="94" cy="70" r="2.5" fill="#111" />
          <circle cx="103" cy="70" r="2.5" fill="#111" />
        </g>
        <g fill="#F8D928">
          <rect x="180" y="40" width="12" height="54" rx="6" />
          <rect x="166" y="54" width="8" height="22" rx="4" />
          <rect x="166" y="70" width="16" height="7" rx="3.5" />
          <rect x="198" y="48" width="8" height="20" rx="4" />
          <rect x="190" y="62" width="16" height="7" rx="3.5" />
        </g>
        <line x1="0" y1="96" x2="240" y2="96" stroke="#F8D928" strokeWidth="2" strokeDasharray="6 6" />
      </svg>

      <p className="relative mt-6 font-display text-4xl uppercase tracking-wide text-ballen md:text-6xl">
        Game loading<span className="animate-blink">_</span>
      </p>
      <div className="relative mt-4 h-3 w-56 overflow-hidden rounded-full border-2 border-ballen md:w-72" role="progressbar" aria-label="Game loading" aria-valuetext="Coming soon">
        <div className="h-full w-2/3 bg-ballen" />
      </div>
      <p className="relative mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-paper/60">
        Coming soon · Stretch those thumbs
      </p>
    </div>
  )
}

export default function GameContainer({ children }) {
  return (
    <div className="relative mx-auto w-full max-w-full rounded-[24px] border-[3px] border-ink bg-paper p-1.5 shadow-[4px_4px_0_0_#111] sm:rounded-[28px] sm:p-2 sm:shadow-hard md:p-3">
      {/* arcade top bar */}
      <div className="flex items-center justify-between px-2.5 pb-2 pt-1 sm:px-3 md:pb-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-ink sm:h-3 sm:w-3" />
          <span className="h-2.5 w-2.5 rounded-full bg-ballen ring-2 ring-ink sm:h-3 sm:w-3" />
          <span className="h-2.5 w-2.5 rounded-full bg-paper ring-2 ring-ink sm:h-3 sm:w-3" />
        </div>
        <span className="font-display text-xs uppercase tracking-widest sm:text-sm">Feed the Boys · v0.1</span>
        <span className="text-xs font-bold uppercase">P1</span>
      </div>
      <div id="game-root" className="aspect-[3/4] min-h-[480px] w-full max-w-full overflow-hidden rounded-[18px] sm:aspect-[4/3] sm:min-h-0 sm:rounded-[20px]">
        {children ?? <GamePlaceholder />}
      </div>
    </div>
  )
}
