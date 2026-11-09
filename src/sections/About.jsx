import Reveal from '../components/Reveal'

export default function About() {
  return (
    <section id="about" className="on-dark relative overflow-hidden bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-12 md:items-center md:px-8 md:py-20">
        <Reveal className="md:col-span-5">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-ballen">(About us)</p>
          <h2 className="font-display text-7xl uppercase leading-[0.85] md:text-8xl lg:text-9xl">
            Meet <br />
            <span className="inline-block text-ballen">
              Ballen.
            </span>
          </h2>
        </Reveal>

        <div className="md:col-span-7 font-fun">
          <Reveal delay={100}>
            <p className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-[2.6rem]">
              We're building products to keep your boys{' '}
              <span className="inline-block rounded-xl bg-ballen px-2.5 py-0.5 font-extrabold text-ink shadow-[3px_3px_0_0_#fff]">
                fresh, dry, and happy.
              </span>
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-relaxed text-paper/80 md:text-xl">
              From sweaty afternoons to itchy situations and everything awkward in between, the boys downstairs go
              through a <strong className="font-extrabold text-paper underline decoration-ballen decoration-[3px] underline-offset-4">LOT</strong>.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-5 text-xl font-bold text-ballen md:text-2xl">
              We're here to change that. <span aria-label="eyes emoji">👀</span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
