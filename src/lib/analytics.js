/**
 * Analytics service for Google Analytics (GA4) and Meta Pixel (Facebook Pixel).
 *
 * Automatically initializes from environment variables:
 * - VITE_GA_MEASUREMENT_ID (e.g. 'G-XXXXXXXXXX')
 * - VITE_META_PIXEL_ID     (e.g. '1234567890123456')
 *
 * In development, if IDs are not set, it logs actions to console so you can
 * verify tracking triggers without script errors.
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-809MTE0V8P'
const DEFAULT_META_PIXEL_ID = '1128590083487681'
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || DEFAULT_META_PIXEL_ID

let isInitialized = false

/**
 * Initialize Google Analytics (gtag.js)
 */
function initGA(measurementId) {
  if (!measurementId || typeof window === 'undefined') return

  // Prevent duplicate script injection
  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`)) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)
  }

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments)
  }

  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    send_page_view: true,
  })
}

/**
 * Initialize Meta Pixel (fbq)
 */
function initMetaPixel(pixelId) {
  if (!pixelId || typeof window === 'undefined') return

  if (!window.fbq) {
    const fbq = function () {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, arguments)
      } else {
        fbq.queue.push(arguments)
      }
    }
    window.fbq = fbq
    window._fbq = fbq
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)

    // Add noscript fallback iframe / img
    const noscript = document.createElement('noscript')
    const img = document.createElement('img')
    img.height = 1
    img.width = 1
    img.style.display = 'none'
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`
    noscript.appendChild(img)
    document.body.appendChild(noscript)

    window.fbq('init', pixelId)
    window.fbq('track', 'PageView')
  }
}

/**
 * Initialize all analytics providers
 */
export function initAnalytics() {
  try {
    if (isInitialized || typeof window === 'undefined') return
    isInitialized = true

    if (GA_ID) {
      initGA(GA_ID)
    } else if (import.meta.env?.DEV) {
      console.info('[Analytics] VITE_GA_MEASUREMENT_ID not set. Set it in .env to enable GA4.')
    }

    if (META_PIXEL_ID) {
      initMetaPixel(META_PIXEL_ID)
    } else if (import.meta.env?.DEV) {
      console.info('[Analytics] VITE_META_PIXEL_ID not set. Set it in .env to enable Meta Pixel.')
    }
  } catch (err) {
    console.warn('[Analytics] Init failed gracefully:', err)
  }
}

/**
 * Generic event tracker that sends to both GA4 and Meta Pixel
 */
export function trackEvent(gaEventName, gaParams = {}, metaEventName = null, metaParams = {}) {
  try {
    // 1. Google Analytics
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', gaEventName, gaParams)
    } else if (import.meta.env?.DEV) {
      console.debug(`[Analytics:GA] ${gaEventName}`, gaParams)
    }

    // 2. Meta Pixel
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      if (metaEventName) {
        const isStandard = ['PageView', 'Lead', 'CompleteRegistration', 'ViewContent', 'Contact'].includes(metaEventName)
        if (isStandard) {
          window.fbq('track', metaEventName, metaParams)
        } else {
          window.fbq('trackCustom', metaEventName, metaParams)
        }
      }
    } else if (import.meta.env?.DEV && metaEventName) {
      console.debug(`[Analytics:Meta] ${metaEventName}`, metaParams)
    }
  } catch (err) {
    console.warn('[Analytics] Track event failed gracefully:', err)
  }
}

/**
 * Track waitlist signup (Lead Conversion)
 */
export function trackWaitlistLead({ guess, source = 'landing_page' } = {}) {
  trackEvent(
    'generate_lead',
    {
      lead_source: source,
      has_guess: !!guess,
      currency: 'INR',
      value: 0,
    },
    'Lead',
    {
      content_name: 'Ballen VIP Waitlist',
      status: 'submitted',
      source,
    }
  )

  // Also trigger CompleteRegistration for Meta ad campaigns targeting registrations
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'CompleteRegistration', {
      content_name: 'Ballen VIP Waitlist',
      status: 'submitted',
    })
  }
}

/**
 * Track client-side page views (SPA transitions)
 */
export function trackPageView(path = typeof window !== 'undefined' ? window.location.pathname : '/') {
  try {
    if (typeof window !== 'undefined') {
      if (typeof window.gtag === 'function' && GA_ID) {
        window.gtag('config', GA_ID, { page_path: path })
      }
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'PageView')
      }
    }
  } catch {}
}

/**
 * Track game started
 */
export function trackGameStart() {
  trackEvent(
    'game_start',
    {
      game_name: 'Feed The Boys',
    },
    'GameStart',
    {
      game_name: 'Feed The Boys',
    }
  )
}

/**
 * Track game ended / score posted
 */
export function trackGameOver({ score, cause, isNewBest }) {
  trackEvent(
    'post_score',
    {
      score,
      character: 'MrBaller',
      defeat_cause: cause,
      is_new_best: isNewBest,
    },
    'GameOver',
    {
      score,
      cause,
      is_new_best: isNewBest,
    }
  )
}

/**
 * Track score shared
 */
export function trackShareScore({ score }) {
  trackEvent(
    'share',
    {
      method: 'web_share',
      content_type: 'game_score',
      item_id: String(score),
    },
    'ShareScore',
    {
      score,
    }
  )
}

/**
 * Track prominent CTA button clicks
 */
export function trackCtaClick(label, destination) {
  trackEvent(
    'select_content',
    {
      content_type: 'cta_button',
      item_id: label,
      destination,
    },
    'CtaClick',
    {
      label,
      destination,
    }
  )
}
