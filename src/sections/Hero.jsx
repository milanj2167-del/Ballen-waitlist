import Button from '../components/Button'
import Marquee from '../components/Marquee'
import { trackCtaClick } from '../lib/analytics'

/** Little speech-cloud tag that sits on top of a CTA. */
function OfferCloud({ children, dark = false }) {
  const bg = dark ? 'bg-paper text-ink' : 'bg-ink text-ballen'
  const tail = dark ? 'border-t-paper' : 'border-t-ink'
  return (
    <span
      className={`pointer-events-none absolute -top-9 right-5 z-10 rotate-[-6deg] rounded-full border-2 border-ink px-4 py-1.5 font-display text-sm md:text-base uppercase tracking-wider whitespace-nowrap animate-wobble ${bg}`}
    >
      {children}
      <span aria-hidden="true" className={`absolute -bottom-[9px] left-5 h-0 w-0 border-x-[7px] border-t-[9px] border-x-transparent ${tail}`} />
    </span>
  )
}

function SpinBadge() {
  const text = 'COMING SOON ✦ FRESH • DRY • HAPPY ✦ '
  return (
    <div className="relative h-28 w-28 md:h-36 md:w-36" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="h-full w-full animate-[spin_14s_linear_infinite]">
        <defs>
          <path id="circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <circle cx="50" cy="50" r="49" fill="#111" />
        <text fill="#F8D928" fontSize="9.5" fontFamily="Anton, Impact, sans-serif" letterSpacing="1.4">
          <textPath href="#circle">{text}</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 grid place-items-center text-3xl md:text-4xl">👀</span>
    </div>
  )
}

/** The cheeky duo. Two balls, gently bouncing out of sync. No mascot, just vibes. */
function TheBoys() {
  return (
    <div className="flex items-end gap-2 md:gap-3" aria-hidden="true">
      <span className="block h-14 w-14 rounded-full border-[3px] border-ink bg-paper shadow-hard md:h-20 md:w-20 animate-[bounce_2.4s_ease-in-out_infinite]" />
      <span className="block h-16 w-16 rounded-full border-[3px] border-ink bg-ink md:h-24 md:w-24 animate-[bounce_2.4s_ease-in-out_0.3s_infinite]" />
    </div>
  )
}

export default function Hero() {
  return (
    <section id="top" className="grain relative isolate overflow-hidden bg-ballen pt-28 md:pt-32">
      {/* faint grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
        <div className="flex items-center justify-between">
          <p className="inline-flex max-w-full items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:px-3 sm:py-1 sm:text-xs sm:tracking-widest">
            <span className="h-2 w-2 rounded-full bg-ink animate-blink shrink-0" />
            Pre-launch · Men's intimate grooming
          </p>
          <div className="hidden md:block">
            <SpinBadge />
          </div>
        </div>

        <h1 className="mt-6 font-display uppercase leading-[0.82] tracking-tight text-ink md:-mt-6">
          <span className="block animate-rise text-[26.5vw] sm:text-[22vw] md:text-[15vw] lg:text-[13.5rem]">The boys</span>
          <span className="block animate-rise text-[29vw] sm:text-[22vw] md:text-[15vw] lg:text-[13.5rem] [animation-delay:120ms]">
            <span className="text-stroke">deserve</span>
          </span>
          <span className="flex flex-wrap items-end gap-x-6 animate-rise [animation-delay:240ms]">
            <span className="text-[32vw] sm:text-[22vw] md:text-[15vw] lg:text-[13.5rem]">
              better<span className="inline-block origin-bottom animate-wobble">.</span>
            </span>
            <span className="mb-[3vw] hidden sm:block lg:mb-8">
              <TheBoys />
            </span>
          </span>
        </h1>

        <div className="mt-8 grid gap-8 pb-16 md:mt-10 md:grid-cols-12 md:items-end md:pb-20">
          <p className="max-w-md text-xl font-medium leading-snug md:col-span-5 md:text-2xl animate-rise [animation-delay:360ms]">
            Something's coming for the boys <em className="font-extrabold not-italic underline decoration-[3px] underline-offset-4">downstairs</em>.
          </p>
          <div className="flex flex-col gap-12 pt-8 sm:flex-row sm:gap-5 md:col-span-7 md:justify-end animate-rise [animation-delay:480ms]">
            <div className="relative">
              <OfferCloud>Big offer 🤯</OfferCloud>
              <Button
                href="#waitlist"
                variant="outline"
                id="hero-waitlist-btn"
                onClick={() => trackCtaClick('Hero Join Waitlist', '#waitlist')}
                className="w-full !bg-paper !px-9 !py-5 !text-xl md:!text-2xl"
              >
                Join the waitlist
              </Button>
            </div>
            <div className="relative">
              <OfferCloud dark>Bigger offer 🤑</OfferCloud>
              <Button
                href="#game"
                variant="ink"
                id="hero-play-btn"
                onClick={() => trackCtaClick('Hero Play Game', '#game')}
                className="w-full !px-9 !py-5 !text-xl md:!text-2xl"
              >
                Play the game
              </Button>
            </div>
          </div>
          <div className="flex justify-center sm:hidden">
            <TheBoys />
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <div className="-rotate-1 border-y-2 border-ink bg-ink py-3 text-ballen">
          <Marquee items={['Fresh', 'Dry', 'Happy', 'No more swamp', 'Pure comfort', 'Big launch energy']} />
        </div>
      </div>
    </section>
  )
}
