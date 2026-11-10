import { useState, useEffect } from 'react'
import { submitWaitlist, submitGameScore, getStoredUser } from '../../lib/supabase'
import { trackWaitlistLead } from '../../lib/analytics'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate({ name, email, phone, consent }) {
  const errors = {}
  if (!name.trim()) errors.name = 'We need something to call you.'
  else if (name.trim().length < 2) errors.name = 'Bit short, no? At least 2 characters.'

  if (!email.trim()) errors.email = 'Email please. We promise not to be weird.'
  else if (!EMAIL_RE.test(email.trim())) errors.email = "That email doesn't look right."

  const cleanPhone = phone.replace(/[\s\-()+]/g, '')
  if (!phone.trim()) errors.phone = 'Drop your phone or WhatsApp number for launch alerts.'
  else if (cleanPhone.length < 7 || !/^\d+$/.test(cleanPhone)) {
    errors.phone = 'Please enter a valid phone number (at least 7 digits).'
  }

  if (!consent) {
    errors.consent = 'Please tick the box to join the waitlist.'
  }

  return errors
}

export default function WaitlistModal({ isOpen, onClose, score, onSuccess }) {
  const [values, setValues] = useState({ name: '', email: '', phone: '', guess: '' })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredUser()
      setValues({
        name: stored?.name || '',
        email: stored?.email || '',
        phone: stored?.phone || '',
        guess: stored?.guess || '',
      })
      setConsent(false)
      setErrors({})
      setServerError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const onChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
    if (serverError) setServerError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate({ ...values, consent })
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    setServerError('')

    const consentAt = new Date().toISOString()

    try {
      // 1. Submit/verify waitlist account
      const waitlistRes = await submitWaitlist({
        ...values,
        consent: true,
        consent_at: consentAt,
      })
      if (waitlistRes.error) {
        setServerError(waitlistRes.error.message || 'Could not verify account.')
        setSubmitting(false)
        return
      }

      // 2. Post or replace game score on the live leaderboard
      const scoreRes = await submitGameScore({
        playerName: values.name.trim(),
        playerEmail: values.email.trim(),
        playerPhone: values.phone.trim(),
        score,
        consent_at: consentAt,
      })

      // 3. Analytics
      trackWaitlistLead({ ...values, source: 'game_unlock_modal' })

      setSubmitting(false)
      onSuccess?.(values, scoreRes?.standing)
      onClose()
    } catch {
      // Resilient fallback: ensure score is still submitted locally
      try {
        const scoreRes = await submitGameScore({
          playerName: values.name.trim(),
          playerEmail: values.email.trim(),
          playerPhone: values.phone.trim(),
          score,
          consent_at: consentAt,
        })
        onSuccess?.(values, scoreRes?.standing)
      } catch {}
      setSubmitting(false)
      onClose()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/85 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose()
      }}
    >
      <div className="relative my-auto w-full max-w-md animate-rise rounded-[28px] border-[3px] border-ink bg-paper p-6 shadow-hard sm:p-7 text-left text-ink">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close modal"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-paper font-display text-sm font-bold text-ink hover:bg-ballen transition-colors"
        >
          ✕
        </button>

        <span className="inline-block rounded-full border-2 border-ink bg-ballen px-3 py-0.5 font-display text-[11px] uppercase tracking-wider text-ink shadow-[2px_2px_0_0_#111]">
          🔒 VIP Score Unlock
        </span>

        <h3 id="waitlist-modal-title" className="mt-2 font-display text-2xl uppercase leading-tight sm:text-3xl">
          Join the list <br />
          <span className="text-ballen-shade underline decoration-ballen decoration-[3px] underline-offset-2">
            to lock in your score
          </span>
        </h3>

        {/* Highlighted Score Badge */}
        <div className="mt-3 flex items-center justify-between rounded-2xl border-2 border-ink bg-ballen/25 px-3.5 py-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink">
            Score To Share:
          </span>
          <span className="font-display text-2xl text-ink tabular-nums">
            {score} PTS
          </span>
        </div>

        <p className="font-fun mt-2 text-xs font-semibold text-ink/75 sm:text-sm">
          Submit your details to enter the waitlist and claim your spot on the live leaderboard!
        </p>

        <form noValidate onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="modal-name" className="block text-[11px] font-bold uppercase tracking-wider text-ink/80">
              Your Name
            </label>
            <input
              id="modal-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="What do the boys call you?"
              value={values.name}
              onChange={onChange}
              className={`mt-1 w-full rounded-xl border-2 bg-paper px-3.5 py-2 text-sm font-semibold outline-none focus:border-ballen focus:shadow-[2px_2px_0_0_#111] ${
                errors.name ? 'border-red-600' : 'border-ink'
              }`}
            />
            {errors.name && <p className="mt-1 text-[11px] font-semibold text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="modal-email" className="block text-[11px] font-bold uppercase tracking-wider text-ink/80">
              Email Address
            </label>
            <input
              id="modal-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={onChange}
              className={`mt-1 w-full rounded-xl border-2 bg-paper px-3.5 py-2 text-sm font-semibold outline-none focus:border-ballen focus:shadow-[2px_2px_0_0_#111] ${
                errors.email ? 'border-red-600' : 'border-ink'
              }`}
            />
            {errors.email && <p className="mt-1 text-[11px] font-semibold text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="modal-phone" className="block text-[11px] font-bold uppercase tracking-wider text-ink/80">
              Phone / WhatsApp Number
            </label>
            <input
              id="modal-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210 (launch alert)"
              value={values.phone}
              onChange={onChange}
              className={`mt-1 w-full rounded-xl border-2 bg-paper px-3.5 py-2 text-sm font-semibold outline-none focus:border-ballen focus:shadow-[2px_2px_0_0_#111] ${
                errors.phone ? 'border-red-600' : 'border-ink'
              }`}
            />
            {errors.phone && <p className="mt-1 text-[11px] font-semibold text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="modal-guess" className="block text-[11px] font-bold uppercase tracking-wider text-ink/80">
                Guess The Product
              </label>
              <span className="text-[10px] font-bold text-ink/50">Optional · Win free box</span>
            </div>
            <input
              id="modal-guess"
              name="guess"
              type="text"
              placeholder="What are we dropping?"
              value={values.guess}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border-2 border-ink bg-paper px-3.5 py-2 text-sm font-semibold outline-none focus:border-ballen focus:shadow-[2px_2px_0_0_#111]"
            />
          </div>

          {/* Consent Checkbox (Required) */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none text-[11px] sm:text-xs font-medium text-ink leading-snug">
              <input
                type="checkbox"
                id="modal-consent"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked)
                  if (errors.consent) setErrors((er) => ({ ...er, consent: undefined }))
                }}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-2 border-ink text-ink accent-ink focus:ring-1 focus:ring-ballen cursor-pointer"
              />
              <span>
                I agree to the{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline decoration-1 underline-offset-2 hover:text-ballen-shade"
                >
                  Privacy Policy
                </a>{' '}
                and I consent to Ballen contacting me by email, SMS and WhatsApp about its launch.
              </span>
            </label>
            {errors.consent && (
              <p className="mt-1 text-[11px] font-semibold text-red-600">{errors.consent}</p>
            )}
          </div>

          {serverError && (
            <p className="rounded-lg border border-red-600 bg-red-50 p-2 text-xs font-semibold text-red-700">
              ⚠️ {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-ballen py-3 font-display text-base uppercase tracking-wider text-ink shadow-[4px_4px_0_0_#111] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#111] disabled:opacity-60"
          >
            {submitting ? 'Locking in score...' : 'Lock in & Share score →'}
          </button>

          <p className="mt-2 text-center text-[10px] font-semibold text-ink/65 leading-tight">
            We'll only message you about the Ballen launch. No spam. We never sell or share your details.
          </p>
        </form>
      </div>
    </div>
  )
}
