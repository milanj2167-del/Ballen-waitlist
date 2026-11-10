import { useState } from 'react'
import Button from '../components/Button'
import Reveal from '../components/Reveal'
import { submitWaitlist } from '../lib/supabase'
import { trackWaitlistLead } from '../lib/analytics'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate({ name, email, phone, consent }) {
  const errors = {}
  if (!name.trim()) errors.name = 'We need something to call you.'
  else if (name.trim().length < 2) errors.name = 'Bit short, no? At least 2 characters.'

  if (!email.trim()) errors.email = 'Email please. We promise not to be weird.'
  else if (!EMAIL_RE.test(email.trim())) errors.email = "That email doesn't look right."

  const cleanPhone = phone.replace(/[\s\-()+]/g, '')
  if (!phone.trim()) errors.phone = 'Drop your phone or WhatsApp number for VIP launch alerts.'
  else if (cleanPhone.length < 7 || !/^\d+$/.test(cleanPhone)) errors.phone = 'Please enter a valid phone number (at least 7 digits).'

  if (!consent) {
    errors.consent = 'Please tick the box to join the waitlist.'
  }

  // 'guess' is strictly optional, so no error generated!
  return errors
}

function Field({ id, label, badge, error, ...props }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-[0.25em]">
          {label}
        </label>
        {badge && (
          <span className="text-[11px] font-bold text-ink/60">
            {badge}
          </span>
        )}
      </div>
      <input
        id={id}
        name={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-2xl border-[3px] bg-paper px-5 py-3.5 text-base font-semibold text-ink placeholder:text-ink/35
          outline-none transition-shadow focus:shadow-hard focus-visible:outline-none
          ${error ? 'border-red-600' : 'border-ink'}`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Waitlist form with Name, Email, Phone, and Optional Product Guess.
 */
export default function Waitlist() {
  const [values, setValues] = useState({ name: '', email: '', phone: '', guess: '' })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error | already_saved
  const [errorMessage, setErrorMessage] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
    if (status !== 'idle') setStatus('idle')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = validate({ ...values, consent })
    setErrors(errs)
    if (Object.keys(errs).length) {
      const firstKey = Object.keys(errs)[0]
      document.getElementById(firstKey === 'consent' ? 'waitlist-consent' : firstKey)?.focus()
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      const { data, error } = await submitWaitlist({
        ...values,
        consent: true,
        consent_at: new Date().toISOString(),
      })
      if (error) {
        setStatus('error')
        setErrorMessage(error.message || 'Could not save your spot. Please try again.')
      } else {
        setStatus(data?.isExisting ? 'already_saved' : 'success')
        trackWaitlistLead({ ...values, source: 'waitlist_section' })
        // Cache player name for seamless leaderboard integration
        if (typeof window !== 'undefined' && values.name.trim()) {
          try {
            localStorage.setItem('ballen_player_name', values.name.trim())
          } catch {}
        }
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || 'Something went wrong. Please check your connection and try again.')
    }
  }

  return (
    <section id="waitlist" className="grain relative scroll-mt-20 overflow-hidden bg-ballen">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-12 lg:items-center">
        <Reveal className="lg:col-span-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em]">(Waitlist)</p>
          <h2 className="font-display text-[19vw] uppercase leading-[0.82] md:text-[9.5rem]">
            Get on <br />
            the <span className="text-stroke">list.</span>
          </h2>
          <p className="mt-8 max-w-md text-xl font-medium leading-snug">
            Get first dibs on the drop and an exclusive launch offer.{' '}
            <a href="#game" className="font-extrabold underline decoration-[3px] underline-offset-4 hover:bg-ink hover:text-ballen">
              Play the game
            </a>{' '}
            to unlock an even bigger one.
          </p>
        </Reveal>

        <Reveal delay={150} className="lg:col-span-6">
          <form
            noValidate
            onSubmit={onSubmit}
            aria-labelledby="waitlist-heading"
            className="relative rounded-[28px] border-[3px] border-ink bg-paper p-5 shadow-[5px_5px_0_0_#111] sm:rounded-[32px] sm:p-6 sm:shadow-[10px_10px_0_0_#111] md:p-10"
          >
            <span className="absolute -top-5 right-6 rotate-6 rounded-full border-[3px] border-ink bg-ink px-4 py-1.5 font-display text-sm uppercase tracking-wider text-ballen">
              Limited spots* 
            </span>
            <h3 id="waitlist-heading" className="font-display text-3xl uppercase md:text-4xl">
              Save your spot
            </h3>
            <p className="mt-1 text-sm text-ink/60">Drop your details. Guess the product if you can.</p>

            <div className="mt-7 space-y-4">
              <Field
                id="name"
                label="Full Name"
                type="text"
                autoComplete="name"
                placeholder="What do the boys call you?"
                value={values.name}
                onChange={onChange}
                error={errors.name}
              />
              <Field
                id="email"
                label="Email Address"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={onChange}
                error={errors.email}
              />
              <Field
                id="phone"
                label="Phone / WhatsApp Number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210 (VIP drop alert)"
                value={values.phone}
                onChange={onChange}
                error={errors.phone}
              />
              <Field
                id="guess"
                label="Guess the Product"
                badge="Optional · Win a free box 🎁"
                type="text"
                placeholder="What are we dropping? Take your best guess..."
                value={values.guess}
                onChange={onChange}
                error={errors.guess}
              />
            </div>

            {/* Legal Consent Checkbox (Required) */}
            <div className="mt-5">
              <label className="flex items-start gap-3 cursor-pointer select-none text-xs sm:text-sm font-semibold text-ink/90 leading-snug">
                <input
                  type="checkbox"
                  id="waitlist-consent"
                  name="consent"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked)
                    if (errors.consent) setErrors((er) => ({ ...er, consent: undefined }))
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-ink text-ink accent-ink focus:ring-2 focus:ring-ballen cursor-pointer"
                />
                <span>
                  I agree to the{' '}
                  <a
                    href="/privacy"
                    className="font-bold underline decoration-2 underline-offset-2 hover:text-ballen-shade transition-colors"
                  >
                    Privacy Policy
                  </a>{' '}
                  and I consent to Ballen contacting me by email, SMS and WhatsApp about its launch.
                </span>
              </label>
              {errors.consent && (
                <p id="waitlist-consent-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-700">
                  {errors.consent}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="ink"
              id="waitlist-submit"
              disabled={status === 'submitting'}
              className="mt-6 w-full !py-4.5 !text-2xl !shadow-[6px_6px_0_0_#F8D928] hover:!shadow-[2px_2px_0_0_#F8D928] disabled:opacity-75"
            >
              {status === 'submitting' ? 'Locking in spot...' : "I'm in"}
            </Button>

            <div aria-live="polite" className="min-h-0">
              {(status === 'success' || status === 'already_saved') && (
                <div className="mt-5 rounded-2xl border-2 border-dashed border-ink bg-ballen/40 p-4 text-sm font-semibold text-ink animate-rise">
                  <p className="font-bold text-base">
                    🎉 You're on the list. We'll let you know as soon as Ballen launches.
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-ink/80">
                    We'll text <strong>{values.phone}</strong> and email <strong>{values.email}</strong> the second the drop goes live.
                  </p>
                  {values.guess.trim() && (
                    <p className="mt-2 rounded-xl bg-ink/10 p-2 text-xs">
                      Locked in guess: <span className="font-bold">"{values.guess.trim()}"</span>. If you're right, your launch box is on us!
                    </p>
                  )}
                </div>
              )}

              {status === 'error' && (
                <div className="mt-5 rounded-2xl border-2 border-red-600 bg-red-100 p-4 text-sm font-semibold text-red-800">
                  <p className="font-bold">⚠️ Submission failed</p>
                  <p className="mt-1">{errorMessage}</p>
                </div>
              )}
            </div>

            <p className="mt-5 text-center font-fun text-xs font-semibold text-ink/65">
              No spam. We never sell or share your details.
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
