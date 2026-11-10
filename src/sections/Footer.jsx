import Wordmark from '../components/Wordmark'

const YEAR = 2026

export default function Footer() {
  return (
    <footer className="on-dark bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-5 pt-20 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="max-w-xs text-lg text-paper/70">Fresh, dry, happy boys. Dropping soon.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold uppercase tracking-wider">
            <a
              href="https://www.instagram.com/ballen.in?dlrf=MTAxcWJicGVnZnZpMQ=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ballen on Instagram"
              className="inline-flex items-center gap-2 hover:text-ballen transition-colors"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
              Instagram
            </a>
            <a href="/privacy" className="hover:text-ballen transition-colors">Privacy Policy</a>
            <a href="/contest-terms" className="hover:text-ballen transition-colors">Contest Terms</a>
            <a href="mailto:Ballenindia@gmail.com" className="hover:text-ballen transition-colors">Contact</a>
          </nav>
        </div>

        <a href="#top" aria-label="Back to top" className="mt-12 block transition-transform hover:scale-[1.01]">
          <Wordmark variant="yellow" className="w-full max-w-full h-auto" />
        </a>

        <div className="flex flex-col gap-2 border-t border-paper/15 py-6 text-xs text-paper/50 sm:flex-row sm:justify-between">
          <p>© {YEAR} Ballen. All rights reserved.</p>
          <p>Made with care for the boys downstairs.</p>
        </div>
      </div>
    </footer>
  )
}
