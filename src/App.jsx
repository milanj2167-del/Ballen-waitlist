import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import Hero from './sections/Hero'
import About from './sections/About'
import Game from './sections/Game'
import Waitlist from './sections/Waitlist'
import Footer from './sections/Footer'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ContestTerms from './pages/ContestTerms'
import ErrorBoundary from './components/ErrorBoundary'
import { initAnalytics } from './lib/analytics'

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.replace(/\/+$/, '') || '/'
    }
    return '/'
  })

  useEffect(() => {
    initAnalytics()

    const onPop = () => {
      setCurrentPath(window.location.pathname.replace(/\/+$/, '') || '/')
    }
    window.addEventListener('popstate', onPop)

    const handleDocumentClick = (e) => {
      const anchor = e.target.closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href) return

      if (
        anchor.target === '_blank' ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('http://') ||
        href.startsWith('https://')
      ) {
        return
      }

      if (href.startsWith('#')) {
        if (window.location.pathname !== '/') {
          e.preventDefault()
          window.history.pushState({}, '', '/' + href)
          setCurrentPath('/')
          setTimeout(() => {
            const target = document.querySelector(href)
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' })
            }
          }, 60)
        }
        return
      }

      if (href.startsWith('/')) {
        const [pathPart, hashPart] = href.split('#')
        const targetPath = pathPart.replace(/\/+$/, '') || '/'

        if (['/', '/privacy', '/contest-terms'].includes(targetPath)) {
          e.preventDefault()
          if (window.location.pathname !== targetPath || hashPart) {
            window.history.pushState({}, '', href)
            setCurrentPath(targetPath)
            if (hashPart) {
              setTimeout(() => {
                const target = document.getElementById(hashPart)
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' })
                }
              }, 60)
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }
      }
    }

    document.addEventListener('click', handleDocumentClick)
    return () => {
      window.removeEventListener('popstate', onPop)
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  return (
    <ErrorBoundary>
      <a
        href="#waitlist"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-ballen"
      >
        Skip to waitlist
      </a>
      <Nav />
      <main className="overflow-x-hidden max-w-full w-full">
        {currentPath === '/privacy' ? (
          <PrivacyPolicy />
        ) : currentPath === '/contest-terms' ? (
          <ContestTerms />
        ) : (
          <>
            <Hero />
            <About />
            <Game />
            <Waitlist />
          </>
        )}
      </main>
      <Footer />
    </ErrorBoundary>
  )
}
