import { ALL_PATH, BALLS_PATH, VIEW_BOX } from './logoPaths'

/**
 * Ballen Official Logo Wordmark (Pure Vector SVG).
 * Renders the official brand logo with the signature two-ball 'B'.
 *
 * Supported variants:
 * - 'ink':    Black letters for light backgrounds (Navbar)
 * - 'yellow': Ballen Yellow (#F8D928) for dark backgrounds (Footer)
 * - 'white':  Paper White (#FFFFFF)
 *
 * Props:
 * - variant: 'ink' | 'yellow' | 'white' (defaults to 'ink')
 * - className: custom Tailwind classes (sizing, margins, color overrides)
 * - ballFill: optional fill for tennis ball cutouts (defaults to transparent)
 */
export default function Wordmark({
  variant = 'ink',
  className = '',
  ballFill,
  ...props
}) {
  const variantClasses = {
    ink: 'text-ink',
    yellow: 'text-ballen',
    white: 'text-paper',
  }

  const colorClass = variantClasses[variant] ?? ''

  return (
    <svg
      viewBox={VIEW_BOX}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none overflow-visible ${colorClass} ${className}`.trim()}
      aria-label="Ballen"
      role="img"
      {...props}
    >
      {ballFill && ballFill !== 'transparent' && (
        <path d={BALLS_PATH} fill={ballFill} />
      )}
      <path d={ALL_PATH} fillRule="evenodd" stroke="none" />
    </svg>
  )
}
