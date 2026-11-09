import ballerReady from '../../assets/mr-baller/baller_ready.png'
import ballerOpen from '../../assets/mr-baller/baller_open.png'
import ballerChew from '../../assets/mr-baller/baller_chew.png'
import ballerSad from '../../assets/mr-baller/baller_sad.png'

/**
 * Mr. Baller Mascot Component
 * Displays the official Ballen brand mascot across game overlays (Start, Paused, GameOver).
 *
 * Official 4 Poses from user upload:
 * 1. 'ready'    — Signature cheeky smirk (Start screen overlay & default)
 * 2. 'open'     — Wide-open biting expression (Catch funnel / gameplay)
 * 3. 'chew'     — Eyes closed, puffed cheeks (Chomp impact / Paused screen)
 * 4. 'sad'      — Droopy eyes, disappointed expression (Game Over screen)
 */
export default function CodedHorseMascot({ pose = 'ready', className = '' }) {
  let src = ballerReady
  let alt = 'Mr. Baller Mascot — Ready'

  if (pose === 'sad' || pose === 'gameover' || pose === 'dead') {
    src = ballerSad
    alt = 'Mr. Baller Mascot — Disappointed'
  } else if (pose === 'chew' || pose === 'catch' || pose === 'bite') {
    src = ballerChew
    alt = 'Mr. Baller Mascot — Chewing'
  } else if (pose === 'open') {
    src = ballerOpen
    alt = 'Mr. Baller Mascot — Catch Mouth Open'
  } else {
    // Default / ready / idle
    src = ballerReady
    alt = 'Mr. Baller Mascot — Ready Smirk'
  }

  return (
    <div className={`relative inline-block select-none ${className}`}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
        draggable="false"
      />
    </div>
  )
}
