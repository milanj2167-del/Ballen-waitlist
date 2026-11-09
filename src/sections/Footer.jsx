import Wordmark from '../components/Wordmark'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="on-dark bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-5 pt-20 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="max-w-xs text-lg text-paper/70">Fresh, dry, happy boys. Dropping soon.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold uppercase tracking-widest">
            <a href="#" aria-label="Ballen on Instagram (coming soon)" className="inline-flex items-center gap-2 hover:text-ballen">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
              Instagram
            </a>
            <a href="#" className="hover:text-ballen">Privacy Policy</a>
            <a href="#" className="hover:text-ballen">Terms</a>
          </nav>
        </div>

        <a href="#top" aria-label="Back to top" className="mt-12 block transition-transform hover:scale-[1.01]">
          <Wordmark variant="yellow" className="w-full max-w-full h-auto" />
        </a>

        <div className="flex flex-col gap-2 border-t border-paper/15 py-6 text-xs text-paper/50 sm:flex-row sm:justify-between">
          <p>© {year} Ballen. All rights reserved.</p>
          <p>Made with care for the boys downstairs.</p>
        </div>
      </div>
    </footer>
  )
}
