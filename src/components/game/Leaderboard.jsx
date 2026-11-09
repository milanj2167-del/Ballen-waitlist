import { useState, useEffect } from 'react'
import { fetchTopScores, subscribeToLeaderboard, isSupabaseConfigured } from '../../lib/supabase'

const DEMO_ENTRIES = [
  { rank: 1, name: 'Player One', score: 0 },
  { rank: 2, name: 'Player Two', score: 0 },
  { rank: 3, name: 'Player Three', score: 0 },
]

const MEDAL = { 1: 'bg-ballen', 2: 'bg-paper', 3: 'bg-paper' }

export default function Leaderboard() {
  const [entries, setEntries] = useState(DEMO_ENTRIES)
  const [isLive, setIsLive] = useState(false)

  const loadScores = async () => {
    if (!isSupabaseConfigured) {
      return
    }

    const { data, error } = await fetchTopScores(3)
    if (!error && data && data.length > 0) {
      // If we have fewer than 3 records, pad with demo spots
      const padded = [...data]
      while (padded.length < 3) {
        padded.push({
          rank: padded.length + 1,
          name: `Spot Open #${padded.length + 1}`,
          score: 0,
        })
      }
      setEntries(padded)
      setIsLive(true)
    } else {
      setIsLive(false)
    }
  }

  useEffect(() => {
    loadScores()

    // Listen for custom score-submitted event from game on same page
    const handleLocalSubmit = () => {
      loadScores()
    }
    window.addEventListener('ballen_score_submitted', handleLocalSubmit)

    // Listen for Supabase Realtime changes across any client
    const unsubscribe = subscribeToLeaderboard(() => {
      loadScores()
    })

    return () => {
      window.removeEventListener('ballen_score_submitted', handleLocalSubmit)
      unsubscribe()
    }
  }, [])

  const topEntries = entries.slice(0, 3)

  return (
    <div id="leaderboard" className="scroll-mt-28 w-full max-w-full overflow-hidden rounded-[24px] border-[3px] border-ink bg-paper shadow-[4px_4px_0_0_#111] sm:rounded-[28px] sm:shadow-hard">
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b-[3px] border-ink bg-ink px-4 py-3.5 text-paper sm:px-5 sm:py-4 md:px-7">
        <h3 className="font-display text-2xl uppercase tracking-wide sm:text-3xl md:text-4xl">
          Leader<span className="text-ballen">board</span>
        </h3>
        {isLive ? (
          <span className="flex items-center gap-1.5 rounded-full border-2 border-ballen bg-ballen/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ballen sm:px-3 sm:py-1 sm:text-[11px] sm:tracking-widest">
            <span className="h-2 w-2 rounded-full bg-ballen animate-pulse" />
            Live Rankings
          </span>
        ) : (
          <span className="rounded-full border-2 border-ballen px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ballen sm:px-3 sm:py-1 sm:text-[11px] sm:tracking-widest">
            Demo data · Not real scores
          </span>
        )}
      </div>

      <table className="w-full text-left">
        <caption className="sr-only">
          {isLive ? 'Top players on the live leaderboard' : 'Example leaderboard with placeholder demo data'}
        </caption>
        <thead>
          <tr className="text-[11px] font-bold uppercase tracking-widest text-ink/50">
            <th scope="col" className="w-16 px-3 py-3 sm:px-5 md:px-7">Rank</th>
            <th scope="col" className="px-2 py-3">Player</th>
            <th scope="col" className="w-24 px-3 py-3 text-right sm:px-5 md:px-7">Score</th>
          </tr>
        </thead>
        <tbody className={!isLive ? 'opacity-70' : ''}>
          {topEntries.map((e) => (
            <tr key={e.rank} className="border-t-2 border-dashed border-ink/15 transition-colors hover:bg-ballen/30">
              <td className="px-3 py-3.5 sm:px-5 md:px-7">
                <span
                  className={`grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border-2 border-ink font-display text-base sm:text-lg ${MEDAL[e.rank] ?? 'bg-transparent'}`}
                >
                  {e.rank}
                </span>
              </td>
              <td className="px-2 py-3.5">
                <div className="font-semibold text-ink text-sm sm:text-base leading-snug">{e.name}</div>
                {e.rank === 1 && (
                  <div className="mt-1">
                    <span className="inline-block whitespace-nowrap rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ballen shadow-[1px_1px_0_0_#fff]">
                      Wins free Ballen
                    </span>
                  </div>
                )}
              </td>
              <td className="px-3 py-3.5 text-right font-display text-xl sm:text-2xl tabular-nums sm:px-5 md:px-7">
                {String(e.score).padStart(5, '0')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!isLive && (
        <p className="border-t-2 border-ink/10 px-5 py-4 text-center text-sm text-ink/60 md:px-7">
          Live scores appear here once scores are posted. Your name could be up top.
        </p>
      )}
    </div>
  )
}
