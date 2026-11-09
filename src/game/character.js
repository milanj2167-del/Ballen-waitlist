/**
 * Official Character Controller for "Feed the Boys" — Mr. Baller Mascot.
 *
 * Anatomically authentic brand mascot:
 * - Faces the other side (right & upwards) directly facing items falling from above
 * - Wide open laughing mouth in idle, acting as the catch basket for incoming items
 * - Dynamic biting motion on catch: mouth clamps shut, head lunges upward with recoil,
 *   action crunch sparks explode from the teeth, and sound effects play!
 * - Game over: comical wince with sweat drop and dizzy tilt!
 */

import ballerReady from '../assets/mr-baller/baller_ready.png'
import ballerOpen from '../assets/mr-baller/baller_open.png'
import ballerChew from '../assets/mr-baller/baller_chew.png'
import ballerSad from '../assets/mr-baller/baller_sad.png'

export const MR_BALLER_ASSET = {
  // Height to width ratio (341 / 256 = 1.332)
  aspect: 1.332,
  // Mouth catch zone relative to sprite box (0..1)
  // Positioned directly on the wide-open mouth facing upward
  mouth: {
    x: 0.56,
    y: 0.54,
    w: 0.36,
    h: 0.26,
  },
}

const SPRITE_URLS = {
  ready: ballerReady,
  open: ballerOpen,
  chew: ballerChew,
  sad: ballerSad,
  // Backward compatibility aliases
  idle: ballerOpen,
  bite: ballerChew,
  gameover: ballerSad,
}

/**
 * Preload character sprites into memory
 */
export function loadCharacter(onLoad) {
  const state = {
    ready: false,
    images: {},
  }

  if (typeof window === 'undefined') {
    state.ready = true
    if (typeof onLoad === 'function') onLoad()
    return state
  }

  let loaded = 0
  const keys = Object.keys(SPRITE_URLS)
  const total = keys.length

  const onAssetLoad = () => {
    loaded++
    if (loaded === total) {
      state.ready = true
      if (typeof onLoad === 'function') onLoad()
    }
  }

  keys.forEach((key) => {
    const img = new Image()
    img.src = SPRITE_URLS[key]
    img.onload = onAssetLoad
    img.onerror = () => {
      console.warn(`[FeedTheBoys] Failed to load sprite: ${SPRITE_URLS[key]}`)
      onAssetLoad()
    }
    state.images[key] = img
  })

  return state
}

/**
 * Returns the mouth catch zone bounding rectangle in canvas coordinates
 */
export function getMouthRect(cx, bottom, w) {
  const h = w * MR_BALLER_ASSET.aspect
  const m = MR_BALLER_ASSET.mouth
  const left = cx - w / 2
  const top = bottom - h
  return {
    x: left + (m.x - m.w / 2) * w,
    y: top + (m.y - m.h / 2) * h,
    w: m.w * w,
    h: m.h * h,
    cx: left + m.x * w,
    cy: top + m.y * h,
  }
}

/**
 * Main Character Drawing Loop
 */
export function drawCharacter(ctx, state, { cx, bottom, w, chomp = 0, happy = 0, dead = false, t = 0 }) {
  const h = w * MR_BALLER_ASSET.aspect
  const s = w / 175.0

  // Biting physics: chomp decays from 1.0 down to 0
  // biteFactor reaches 1.0 on impact (mouth snaps shut, teeth gnash!)
  const biteFactor = chomp > 0 ? Math.sin(Math.min(1.0, chomp * 1.6) * Math.PI * 0.5) : 0
  const idleBob = Math.sin(t * 3.5) * 3.0 * s
  const biteLunge = -biteFactor * 12.0 * s // Snappy upward bite lunge!

  ctx.save()
  ctx.translate(cx, bottom + idleBob + biteLunge)

  // Game over dizzy tilt
  if (dead) {
    ctx.rotate(Math.sin(t * 15) * 0.06 + 0.04)
  }

  // Select sprite frame
  let sprite = null
  if (state?.images) {
    if (dead) {
      sprite = state.images.sad || state.images.gameover || state.images.open
    } else if (chomp > 0.12) {
      sprite = state.images.chew || state.images.bite || state.images.open
    } else {
      sprite = state.images.open || state.images.idle
    }
  }

  const drawX = -w / 2
  const drawY = -h

  if (sprite && sprite.complete && sprite.naturalWidth > 0) {
    // Draw the high-res mascot sprite
    ctx.drawImage(sprite, drawX, drawY, w, h)
  } else {
    // Graceful procedural vector fallback while loading
    drawFallbackCharacter(ctx, s)
  }

  // ==========================================
  // DYNAMIC ACTION CRUNCH SPARKLES ON BITE
  // ==========================================
  if (biteFactor > 0.3) {
    ctx.save()
    // Crunch impact right at the teeth / mouth
    const impactX = drawX + MR_BALLER_ASSET.mouth.x * w
    const impactY = drawY + MR_BALLER_ASSET.mouth.y * h

    ctx.lineWidth = 3 * s
    ctx.strokeStyle = '#F8D928' // Ballen Yellow
    ctx.lineCap = 'round'

    // 4 sharp dynamic crunch burst lines
    for (let i = 0; i < 4; i++) {
      const angle = -Math.PI * 0.45 + (i / 3) * Math.PI * 0.95
      const r1 = 12 * s
      const r2 = 26 * s + (i % 2) * 8 * s
      ctx.beginPath()
      ctx.moveTo(impactX + Math.cos(angle) * r1, impactY + Math.sin(angle) * r1)
      ctx.lineTo(impactX + Math.cos(angle) * r2, impactY + Math.sin(angle) * r2)
      ctx.stroke()
    }

    // Bite star sparkle
    drawStar(ctx, impactX + 8 * s, impactY - 14 * s, 4, 8 * s, 4 * s, '#FFFFFF', '#111111', 1.5 * s)
    ctx.restore()
  }

  // ==========================================
  // COMBO GLOW & STAR AURA
  // ==========================================
  if (happy > 0 && !dead) {
    ctx.save()
    const starX = drawX + 0.35 * w + Math.sin(t * 8) * 6 * s
    const starY = drawY + 0.15 * h
    drawStar(ctx, starX, starY, 5, 10 * s, 5 * s, '#F8D928', '#111111', 1.5 * s)
    ctx.restore()
  }

  ctx.restore()
}

/** Procedural fallback in case image is loading */
function drawFallbackCharacter(ctx, s) {
  ctx.save()
  ctx.fillStyle = '#C05C24'
  ctx.strokeStyle = '#111111'
  ctx.lineWidth = 4 * s

  // Head oval
  ctx.beginPath()
  ctx.ellipse(0, -90 * s, 45 * s, 65 * s, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // White shirt collar
  ctx.fillStyle = '#FAF9F6'
  ctx.beginPath()
  ctx.rect(-50 * s, -25 * s, 100 * s, 25 * s)
  ctx.fill()
  ctx.stroke()

  ctx.restore()
}

/** Helper: draw polygon star */
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, fill, stroke, strokeWidth) {
  let rot = (Math.PI / 2) * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }
  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
}
