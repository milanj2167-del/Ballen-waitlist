/**
 * Primary CTA button. Renders <a> when `href` is given, otherwise <button>.
 * variants: "ink" (black on light bg), "yellow" (yellow on dark bg), "outline".
 */
const VARIANTS = {
  ink: 'bg-ink text-ballen shadow-[6px_6px_0_0_#fff] hover:shadow-[2px_2px_0_0_#fff] border-2 border-ink',
  yellow: 'bg-ballen text-ink shadow-[6px_6px_0_0_#fff] hover:shadow-[2px_2px_0_0_#fff] border-2 border-ink',
  outline: 'bg-paper text-ink border-2 border-ink shadow-hard hover:shadow-[2px_2px_0_0_#111]',
}

export default function Button({ href, variant = 'ink', className = '', children, ...props }) {
  const cls = `group inline-flex items-center justify-center gap-3 rounded-full px-7 py-4 font-display text-lg uppercase tracking-wide
    transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-1.5 active:translate-y-1.5 active:shadow-none
    disabled:opacity-60 disabled:pointer-events-none ${VARIANTS[variant]} ${className}`
  const arrow = (
    <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
  )
  if (href) {
    return (
      <a href={href} className={cls} {...props}>
        {children}
        {arrow}
      </a>
    )
  }
  return (
    <button className={cls} {...props}>
      {children}
      {arrow}
    </button>
  )
}
