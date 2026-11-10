import { useEffect } from 'react'

export default function ContestTerms() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Game and Contest Terms — Ballen'
  }, [])

  return (
    <div className="min-h-screen bg-paper text-ink pt-28 pb-20 px-5 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-ballen px-4 py-1.5 font-display text-xs uppercase tracking-wider text-ink shadow-[2px_2px_0_0_#111] transition-transform hover:-translate-y-0.5"
        >
          ← Back to Home
        </a>

        <header className="mt-8 border-b-4 border-ink pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink/60">Contest Rules</p>
          <h1 className="font-display text-4xl uppercase leading-tight sm:text-5xl md:text-6xl">
            Game and <span className="text-stroke">Contest Terms</span>
          </h1>
          <p className="mt-2 text-sm font-semibold text-ink/70">
            Last updated: 10 November 2026
          </p>
        </header>

        <div className="mt-8 space-y-8 font-fun text-sm font-medium leading-relaxed text-ink/90 sm:text-base">
          <p>
            These terms apply to the Ballen game contest (&ldquo;Contest&rdquo;) run by Ballen (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By playing, you accept these terms.
          </p>

          <section className="rounded-2xl border-2 border-ink bg-ballen/10 p-5 shadow-[3px_3px_0_0_#111]">
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              1. The Contest
            </h2>
            <p className="mt-2 font-semibold text-ink">
              The Contest is a game of skill. It is free to play. No purchase, payment or fee is needed to play or to win. It is not a lottery.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              2. Who can enter
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink/85">
              <li>You must be 18 years or older and a resident of India.</li>
              <li>You must give correct details (name, phone number and email) when you join the waitlist.</li>
              <li>Ballen's partners, team members and their immediate family cannot win.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              3. Contest period
            </h2>
            <p className="mt-3 text-ink/85">
              The Contest runs for the period shown on the game page of this website. Scores recorded outside this period do not count.
            </p>
          </section>

          <section className="rounded-2xl border-2 border-ink bg-paper p-5 shadow-hard">
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              4. How the winner is chosen
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink/85">
              <li>The player with the highest score during the Contest period ranks 1st and wins.</li>
              <li>If two or more players have the same highest score, the player who reached that score first wins.</li>
              <li>Each person may have only one entry. Duplicate entries, whether using the same phone number or email or different details for the same person, will be removed.</li>
              <li>Our game records are final for deciding the ranking.</li>
            </ul>
          </section>

          <section className="rounded-2xl border-2 border-ink bg-ballen p-5 text-ink shadow-[4px_4px_0_0_#111]">
            <h2 className="font-display text-xl uppercase tracking-wide sm:text-2xl">
              5. The prize
            </h2>
            <p className="mt-2 font-semibold leading-relaxed">
              The winner receives one Ballen Daily Comfort Cream (50 ml), with a retail value of Rs. 299. The prize cannot be exchanged for cash, transferred to anyone else or replaced with another product, except as stated in Section 9.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              6. Claiming the prize
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-ink/85">
              <li>We will contact the winner within 7 days after the Contest ends, by email and phone.</li>
              <li>The winner must reply and confirm their delivery address within 7 days. If we do not hear back in that time, we may give the prize to the next-ranked player.</li>
              <li>We deliver within India at no cost to the winner. The prize will be sent after our product launches, and we will tell the winner the expected dispatch date when we contact them.</li>
              <li>With the winner's permission, we may announce their first name and the initial of their surname. We will never publish their phone number, email or address.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              7. Fair play
            </h2>
            <p className="mt-3 text-ink/85">
              Cheating is not allowed. This includes bots, scripts, hacks, exploits, multiple accounts and any other unfair method. We may disqualify any player and cancel any score that we reasonably believe was obtained unfairly. Our decision on this is final.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              8. Your data
            </h2>
            <p className="mt-3 text-ink/85">
              How we use your data is explained in our Privacy Policy. By joining the waitlist you agree to it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              9. Changes and cancellation
            </h2>
            <p className="mt-3 text-ink/85">
              We may change, pause or end the Contest, or replace the prize with a product of equal value, if something outside our control affects it, such as a technical fault, a legal requirement or a launch delay. Any change will be posted on this page. Our decisions about the Contest are final.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              10. Liability
            </h2>
            <p className="mt-3 text-ink/85">
              To the extent the law allows, Ballen is not responsible for technical failures, internet problems or losses arising from taking part in the Contest. Nothing in these terms limits any right you have under law that cannot be limited.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              11. Governing law
            </h2>
            <p className="mt-3 text-ink/85">
              These terms are governed by the laws of India. The courts at the place of Ballen's registered office have jurisdiction over any dispute.
            </p>
          </section>

          <section className="rounded-2xl border-2 border-ink bg-ink p-6 text-paper">
            <h2 className="font-display text-xl uppercase tracking-wide text-ballen sm:text-2xl">
              12. Contact
            </h2>
            <p className="mt-2 text-sm sm:text-base font-semibold">
              Questions about the Contest: <a href="mailto:Ballenindia@gmail.com" className="text-ballen underline hover:text-paper">Ballenindia@gmail.com</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t-2 border-ink/15 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-ballen px-6 py-2.5 font-display text-sm uppercase tracking-wider text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5"
          >
            ← Back to Ballen Home
          </a>
        </div>
      </div>
    </div>
  )
}
