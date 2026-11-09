import Wordmark from './Wordmark'
import { trackCtaClick } from '../lib/analytics'

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4 md:px-8">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between rounded-full border-2 border-ink bg-paper/95 px-4 py-2 backdrop-blur-md shadow-[4px_4px_0_0_#111] sm:px-5 sm:py-2.5 sm:shadow-hard"
      >
        <a href="#top" aria-label="Ballen home" className="flex items-center rounded-full">
          <Wordmark variant="ink" className="h-6 w-auto sm:h-7" />
        </a>
        <ul className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-wider md:flex">
          <li><a className="hover:underline decoration-2 underline-offset-4" href="#about">About</a></li>
          <li><a className="hover:underline decoration-2 underline-offset-4" href="#game">Game</a></li>
          <li><a className="hover:underline decoration-2 underline-offset-4" href="#leaderboard">Leaderboard</a></li>
        </ul>
        <a
          href="#waitlist"
          onClick={() => trackCtaClick('Nav Join Waitlist', '#waitlist')}
          className="rounded-full bg-ink px-3.5 py-1.5 font-display text-xs uppercase tracking-wide text-ballen transition-transform hover:-rotate-3 sm:px-5 sm:text-base"
        >
          Join waitlist
        </a>
      </nav>
    </header>
  )
}
