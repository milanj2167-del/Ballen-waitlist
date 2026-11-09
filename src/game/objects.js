/** Falling object catalogue + canvas drawing. Brand palette only. */
const Y = '#F8D928'
const K = '#111111'
const W = '#FFFFFF'

function face(ctx, r, { angry = false, y = 0 } = {}) {
  ctx.fillStyle = K
  ctx.beginPath()
  ctx.arc(-r * 0.3, y, r * 0.12, 0, Math.PI * 2)
  ctx.arc(r * 0.3, y, r * 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = Math.max(1.5, r * 0.09)
  ctx.strokeStyle = K
  if (angry) {
    ctx.beginPath()
    ctx.moveTo(-r * 0.5, y - r * 0.32); ctx.lineTo(-r * 0.15, y - r * 0.18)
    ctx.moveTo(r * 0.5, y - r * 0.32); ctx.lineTo(r * 0.15, y - r * 0.18)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(0, y + r * 0.38, r * 0.2, Math.PI * 1.1, Math.PI * 1.9)
  ctx.stroke()
}

function drawGerm(ctx, r, t) {
  ctx.fillStyle = W
  ctx.strokeStyle = K
  ctx.lineWidth = 2
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + t * 1.5
    const len = r * (1.25 + Math.sin(t * 6 + i) * 0.08)
    ctx.beginPath()
    ctx.arc(Math.cos(a) * len, Math.sin(a) * len, r * 0.18, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  face(ctx, r, { angry: true })
}

function drawSweat(ctx, r) {
  ctx.fillStyle = W
  ctx.strokeStyle = K
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, -r * 1.45)
  ctx.bezierCurveTo(r * 0.5, -r * 0.6, r * 1.05, -r * 0.1, r, r * 0.25)
  ctx.arc(0, r * 0.25, r, 0, Math.PI)
  ctx.bezierCurveTo(-r * 1.05, -r * 0.1, -r * 0.5, -r * 0.6, 0, -r * 1.45)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = Y
  ctx.beginPath()
  ctx.ellipse(-r * 0.45, -r * 0.2, r * 0.12, r * 0.28, 0.4, 0, Math.PI * 2)
  ctx.fill()
  face(ctx, r, { y: r * 0.25 })
}

function drawStink(ctx, r, t) {
  ctx.strokeStyle = Y
  ctx.lineWidth = 2.5
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    const x0 = i * r * 0.55
    for (let k = 0; k <= 8; k++) {
      const yy = -r * 0.9 - k * r * 0.12
      const xx = x0 + Math.sin(k * 0.9 + t * 8 + i) * r * 0.15
      k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy)
    }
    ctx.stroke()
  }
  ctx.fillStyle = K
  ctx.strokeStyle = W
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(-r * 0.55, r * 0.1, r * 0.6, 0, Math.PI * 2)
  ctx.arc(r * 0.55, r * 0.1, r * 0.6, 0, Math.PI * 2)
  ctx.arc(0, -r * 0.25, r * 0.75, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(0, r * 0.15, r * 1.1, r * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()
  // face in white
  ctx.fillStyle = W
  ctx.beginPath()
  ctx.arc(-r * 0.3, 0, r * 0.12, 0, Math.PI * 2)
  ctx.arc(r * 0.3, 0, r * 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = W
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-r * 0.25, r * 0.35)
  ctx.quadraticCurveTo(0, r * 0.2, r * 0.25, r * 0.35)
  ctx.stroke()
}

function drawHeat(ctx, r, t) {
  const flick = Math.sin(t * 14) * r * 0.08
  ctx.fillStyle = Y
  ctx.strokeStyle = K
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, -r * 1.5 + flick)
  ctx.bezierCurveTo(r * 0.4, -r * 0.9, r * 1.1, -r * 0.6, r * 0.95, r * 0.3)
  ctx.arc(0, r * 0.3, r * 0.95, 0, Math.PI)
  ctx.bezierCurveTo(-r * 1.1, -r * 0.3, -r * 0.6, -r * 0.5, -r * 0.45, -r * 1.1 - flick)
  ctx.quadraticCurveTo(-r * 0.15, -r * 0.6, 0, -r * 1.5 + flick)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = W
  ctx.beginPath()
  ctx.ellipse(0, r * 0.45, r * 0.5, r * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()
  face(ctx, r * 0.8, { angry: true, y: r * 0.35 })
}

function drawItch(ctx, r, t) {
  // "Itch" — a jittery zig-zag bolt
  ctx.save()
  ctx.translate(Math.sin(t * 40) * 1.5, 0)
  ctx.fillStyle = W
  ctx.strokeStyle = K
  ctx.lineWidth = 2
  ctx.beginPath()
  const pts = [[0.2, -1.4], [-0.7, 0.1], [-0.05, 0.1], [-0.35, 1.4], [0.75, -0.3], [0.1, -0.3], [0.45, -1.4]]
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * r, y * r) : ctx.moveTo(x * r, y * r)))
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

export const OBJECT_TYPES = [
  { id: 'germ', kind: 'standard', draw: drawGerm, spin: 0 },
  { id: 'sweat', kind: 'standard', draw: drawSweat, spin: 0 },
  { id: 'stink', kind: 'standard', draw: drawStink, spin: 0 },
  { id: 'heat', kind: 'standard', draw: drawHeat, spin: 0 },
  { id: 'itch', kind: 'standard', draw: drawItch, spin: 2.5 },
]

/** Variety unlocks over time: 2 types at start, all 5 by ~15s. */
export function pickStandardType(time) {
  const unlocked = Math.min(OBJECT_TYPES.length, 2 + Math.floor(time / 5))
  return OBJECT_TYPES[Math.floor(Math.random() * unlocked)]
}

export function drawObject(ctx, o, t) {
  ctx.save()
  ctx.translate(o.x, o.y)
  ctx.rotate(Math.sin(t * 3 + o.phase) * 0.15 + o.rot)
  o.type.draw(ctx, o.r, t + o.phase)
  ctx.restore()
}
