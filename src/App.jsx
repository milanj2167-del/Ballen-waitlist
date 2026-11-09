import { useEffect } from 'react'
import Nav from './components/Nav'
import Hero from './sections/Hero'
import About from './sections/About'
import Game from './sections/Game'
import Waitlist from './sections/Waitlist'
import Footer from './sections/Footer'
import { initAnalytics } from './lib/analytics'

export default function App() {
  useEffect(() => {
    initAnalytics()
  }, [])
  return (
    <>
      <a
        href="#waitlist"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-ballen"
      >
        Skip to waitlist
      </a>
      <Nav />
      <main className="overflow-x-hidden max-w-full w-full">
        <Hero />
        <About />
        <Game />
        <Waitlist />
      </main>
      <Footer />
    </>
  )
}
