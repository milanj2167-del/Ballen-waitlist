import { useEffect } from 'react'

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Privacy Policy — Ballen'
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
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink/60">Legal</p>
          <h1 className="font-display text-4xl uppercase leading-tight sm:text-5xl md:text-6xl">
            Privacy <span className="text-stroke">Policy</span>
          </h1>
          <p className="mt-2 text-sm font-semibold text-ink/70">
            Last updated: 10 November 2026
          </p>
        </header>

        <div className="mt-8 space-y-8 font-fun text-sm font-medium leading-relaxed text-ink/90 sm:text-base">
          <p>
            Ballen (&ldquo;Ballen&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a partnership firm with its registered address at [REGISTERED ADDRESS]. This policy explains how we collect and use your personal data when you visit this website, play our game and join our waitlist. We handle your data in line with the Digital Personal Data Protection Act, 2023 and other applicable Indian laws.
          </p>

          <section className="rounded-2xl border-2 border-ink bg-ballen/10 p-5 shadow-[3px_3px_0_0_#111]">
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              1. What we collect
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 font-semibold text-ink/85">
              <li>Waitlist details: your name, phone number and email address.</li>
              <li>Game data: your score and rank in our game.</li>
              <li>Basic technical data: your device type, browser and general usage on this website, collected through standard website and analytics tools.</li>
            </ul>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-ink/70">
              We do not ask for any health, medical or payment information on this website.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              2. Why we collect it
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink/85">
              <li>To add you to the Ballen waitlist and tell you when we launch.</li>
              <li>To send you launch updates and early-access offers by email, SMS and WhatsApp.</li>
              <li>To run the game, rank players, and contact and deliver the prize to the winner.</li>
              <li>To keep the website secure and prevent cheating or duplicate entries.</li>
            </ul>
            <p className="mt-3 font-semibold text-ink">
              We use your data only for these purposes, and only because you have given us your consent.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              3. Who we share it with
            </h2>
            <p className="mt-3 text-ink/85">
              We do not sell your data. We share it only with trusted service providers who help us run the website and waitlist, such as our website hosting, form and database, email, SMS and WhatsApp messaging providers. They may use your data only to provide their service to us. We may also disclose data if the law or a government authority requires it. Some of these providers may store data on servers outside India.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              4. How long we keep it
            </h2>
            <p className="mt-3 text-ink/85">
              We keep your details for as long as you remain on our waitlist or are a Ballen customer, and for as long as we need them for the purposes above. We delete them when you withdraw your consent or ask us to delete them, or when we no longer need them for those purposes. We may keep limited records for longer where the law requires, for example for tax, accounting or legal claims. Your game score and rank are kept along with your waitlist record.
            </p>
          </section>

          <section className="rounded-2xl border-2 border-ink bg-paper p-5 shadow-hard">
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              5. Your rights
            </h2>
            <p className="mt-2 text-ink/85">You can, at any time:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink/85">
              <li>ask for a summary of the personal data we hold about you;</li>
              <li>ask us to correct or update it;</li>
              <li>ask us to delete it;</li>
              <li>withdraw your consent. This is as easy as giving it: email us, use the unsubscribe link in our emails, or reply STOP to our messages;</li>
              <li>nominate another person to exercise these rights for you if you die or cannot do so yourself;</li>
              <li>make a complaint to us. If you are not satisfied with our reply, you may approach the Data Protection Board of India.</li>
            </ul>
            <p className="mt-4 font-bold text-ink">
              To use any of these rights, email <a href="mailto:Ballenindia@gmail.com" className="text-ballen-shade underline hover:text-ink">Ballenindia@gmail.com</a>. We will reply within 15 days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              6. Security
            </h2>
            <p className="mt-3 text-ink/85">
              We protect your data with reasonable security measures, including encrypted connections and restricted access. No system is completely secure. If a data breach affects you, we will inform you and the authorities as the law requires.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              7. Age
            </h2>
            <p className="mt-3 text-ink/85">
              This website and our waitlist are only for people aged 18 and above. We do not knowingly collect data from anyone under 18. If you think a minor has given us their data, email us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              8. Cookies
            </h2>
            <p className="mt-3 text-ink/85">
              We use essential cookies to make the website work and basic analytics to understand how it is used. You can block cookies in your browser settings, but some parts of the site may not work properly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-ink sm:text-2xl">
              9. Changes to this policy
            </h2>
            <p className="mt-3 text-ink/85">
              We may update this policy from time to time. The latest version will always be on this page with its date. If we make a major change to how we use your data, we will ask for your consent again.
            </p>
          </section>

          <section className="rounded-2xl border-2 border-ink bg-ink p-6 text-paper">
            <h2 className="font-display text-xl uppercase tracking-wide text-ballen sm:text-2xl">
              10. Contact and grievance officer
            </h2>
            <div className="mt-3 space-y-1 font-semibold text-sm sm:text-base">
              <p>Grievance Officer, Ballen</p>
              <p>
                Email: <a href="mailto:Ballenindia@gmail.com" className="text-ballen underline hover:text-paper">Ballenindia@gmail.com</a>
              </p>
              <p>Address: [REGISTERED ADDRESS]</p>
            </div>
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
