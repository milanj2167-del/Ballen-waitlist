import Reveal from '../components/Reveal'
import GameContainer from '../components/game/GameContainer'
import Leaderboard from '../components/game/Leaderboard'
import FeedTheBoys from '../components/game/FeedTheBoys'

export default function Game() {
  return (
    <section id="game" className="relative scroll-mt-24 w-full max-w-full overflow-hidden bg-paper md:scroll-mt-32">
      <div className="mx-auto w-full max-w-7xl px-4 pt-14 pb-10 sm:px-6 md:px-8 md:py-14">
        {/* Top Header Row with reduced negative space */}
        <div className="grid gap-4 md:grid-cols-12 md:items-end">
          <Reveal className="w-full max-w-full md:col-span-7">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-ink/60">(The game)</p>
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h2 className="font-display text-4xl uppercase leading-[0.88] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                Got <span className="relative inline-block -rotate-2 bg-ballen px-2.5 py-0.5 shadow-[3px_3px_0_0_#111]">game?</span>
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-ballen px-2.5 py-0.5 font-display text-[11px] uppercase tracking-wider text-ink shadow-[2px_2px_0_0_#111] animate-wobble sm:text-xs sm:px-3 sm:py-1">
                🏆 Free Product Giveaway
              </span>
            </div>
          </Reveal>

          <Reveal delay={100} className="w-full max-w-full md:col-span-5 md:pb-1">
            <p className="font-fun text-base font-semibold leading-snug text-ink/80 md:text-lg">
              Climb the leaderboard. At <strong className="font-extrabold text-ink underline decoration-ballen decoration-[3px] underline-offset-2">9:00 PM on launch day</strong>, whoever holds <strong>Rank #1</strong> wins a free Ballen product.
            </p>
          </Reveal>
        </div>

        {/* Game Console + Leaderboard & Prize Card Grid */}
        <div className="mt-8 flex flex-col items-center justify-center gap-6 lg:grid lg:grid-cols-12 lg:items-start">
          {/* Left: Arcade Game Screen */}
          <Reveal className="flex w-full max-w-full justify-center lg:col-span-7">
            <GameContainer>
              <FeedTheBoys />
            </GameContainer>
          </Reveal>

          {/* Right: Leaderboard & Highly Visible Prize Rules */}
          <Reveal delay={150} className="flex w-full max-w-full flex-col gap-5 lg:col-span-5">
            <Leaderboard />

            {/* High-Impact Launch Prize Card */}
            <div className="relative rounded-[24px] border-[3px] border-ink bg-ballen p-4 shadow-[4px_4px_0_0_#111] sm:rounded-[28px] sm:p-5 sm:shadow-hard md:p-6">
              <span className="absolute -top-3.5 right-6 rotate-2 rounded-full border-2 border-ink bg-ink px-3 py-1 font-display text-[11px] uppercase tracking-wider text-ballen shadow-[2px_2px_0_0_#fff] sm:text-xs sm:px-3.5">
                👑 Launch Day Giveaway
              </span>

              <div className="flex items-center gap-2">
                <span className="text-3xl">🏆</span>
                <h4 className="font-display text-2xl uppercase tracking-wide text-ink md:text-3xl">
                  Win A Free Product
                </h4>
              </div>

              <p className="font-fun mt-2 text-sm font-semibold text-ink/85">
                Rules are simple. Play, share your score, and take the crown:
              </p>

              <div className="mt-3.5 space-y-2.5 font-fun text-xs md:text-sm">
                <div className="flex items-start gap-2.5 rounded-xl border-2 border-ink/30 bg-paper/85 p-2.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink font-display text-xs text-ballen">
                    1
                  </span>
                  <p className="font-semibold text-ink leading-snug">
                    <strong className="font-bold">Play as much as you want:</strong> Unlimited attempts. Replay anytime to crush your high score.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border-2 border-ink/30 bg-paper/85 p-2.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink font-display text-xs text-ballen">
                    2
                  </span>
                  <p className="font-semibold text-ink leading-snug">
                    <strong className="font-bold">Share your score:</strong> Claim your rank on the leaderboard and defend your position.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border-2 border-ink bg-ink p-2.5 text-paper">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ballen font-display text-xs text-ink">
                    3
                  </span>
                  <p className="font-semibold leading-snug">
                    <strong className="font-bold text-ballen">Rank #1 at 9:00 PM Wins:</strong> On launch day at exactly <span className="underline decoration-ballen">9:00 PM</span>, whoever is at the top of the leaderboard wins a <strong className="text-ballen uppercase">free Ballen product</strong>!
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
