import { CONFIG, clamp } from './config'
import { drawObject, pickStandardType } from './objects'
import { COMBO_WINDOW, comboMultiplier, computeCatchPoints, nextCombo } from './scoring'
import { MR_BALLER_ASSET, drawCharacter, getMouthRect, loadCharacter } from './character'
import { sound } from './sound'

/**
 * Framework-agnostic game engine. React only talks to it via:
 *   start(), pause(), resume(), destroy(), resize(), setPointerX(), setKey()
 * and receives callbacks: onHud({score, combo, mult}), onGameOver(result).
 */
export class GameEngine {
  constructor(canvas, { onHud, onGameOver, reducedMotion = false } = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.onHud = onHud
    this.onGameOver = onGameOver
    this.reducedMotion = reducedMotion
    this.W = 320
    this.H = 400
    this.dpr = 1
    this.raf = 0
    this.overTimer = 0
    this.running = false
    this.character = loadCharacter(() => this.render())
    this.reset()
  }

  // ---------- lifecycle ----------
  reset() {
    this.objects = []
    this.particles = []
    this.popups = []
    this.time = 0
    this.score = 0
    this.combo = 0
    this.lastCatchT = -Infinity
    this.events = []
    this.spawnTimer = CONFIG.firstSpawnDelay
    this.lastArrive = 0
    this.lastX = this.W / 2
    this.cx = this.W / 2
    this.targetX = this.W / 2
    this.keys = { left: false, right: false }
    this.chomp = 0
    this.happy = 0
    this.over = false
    this.missed = null
    this.shake = 0
    this.flash = 0
  }

  start() {
    this.stopLoop()
    clearTimeout(this.overTimer)
    this.reset()
    this.emitHud()
    this.running = true
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.loop)
  }

  pause() {
    if (!this.running) return
    this.running = false
    this.stopLoop()
  }

  resume() {
    if (this.running || this.over) return
    this.running = true
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.loop)
  }

  destroy() {
    this.running = false
    this.stopLoop()
    clearTimeout(this.overTimer)
  }

  stopLoop() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  resize(w, h, dpr = 1) {
    const ratio = this.W ? this.cx / this.W : 0.5
    this.W = Math.max(1, w)
    this.H = Math.max(1, h)
    this.dpr = Math.min(dpr, 2.5)
    this.canvas.width = Math.round(this.W * this.dpr)
    this.canvas.height = Math.round(this.H * this.dpr)
    this.cx = this.targetX = ratio * this.W
    if (!this.running) this.render()
  }

  // ---------- input ----------
  setPointerX(x) {
    this.targetX = x
  }
  setKey(dir, down) {
    this.keys[dir] = down
  }

  // ---------- derived ----------
  get charW() {
    return clamp(this.W * CONFIG.charWidthRatio, CONFIG.charMin, CONFIG.charMax)
  }
  get charBottom() {
    return this.H - CONFIG.charBottomPad
  }
  mouth() {
    return getMouthRect(this.cx, this.charBottom, this.charW)
  }
  /** Allowed range for the mouth centre, given the character is clamped to the canvas. */
  mouthRange() {
    const half = this.charW / 2
    const off = (MR_BALLER_ASSET.mouth.x - 0.5) * this.charW
    return [half + off, this.W - half + off]
  }
  fallSpeed() {
    return Math.min(CONFIG.fallCap, CONFIG.baseFall + CONFIG.fallGrowth * this.time) * this.H
  }
  spawnInterval() {
    return Math.max(CONFIG.intervalMin, CONFIG.baseInterval - CONFIG.intervalDecay * this.time)
  }
  emitHud() {
    this.onHud?.({ score: this.score, combo: this.combo, mult: comboMultiplier(this.combo) })
  }

  // ---------- loop ----------
  loop = (ts) => {
    if (!this.running) return
    const dt = Math.min((ts - this.last) / 1000, 0.05)
    this.last = ts
    this.update(dt)
    this.render()
    if (this.running) this.raf = requestAnimationFrame(this.loop)
  }

  update(dt) {
    this.time += dt

    // movement
    const half = this.charW / 2
    const dir = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0)
    if (dir) {
      this.cx = clamp(this.cx + dir * CONFIG.keyboardSpeed * this.W * dt, half, this.W - half)
      this.targetX = this.cx
    } else {
      const t = clamp(this.targetX, half, this.W - half)
      this.cx += (t - this.cx) * (1 - Math.pow(CONFIG.pointerSmoothing, dt))
    }

    // spawning
    this.spawnTimer -= dt
    if (this.spawnTimer <= 0) {
      this.spawn()
      this.spawnTimer = this.spawnInterval() * (0.85 + Math.random() * 0.3)
    }

    // combo timeout
    if (this.combo > 0 && Math.round(this.time * 1000) / 1000 - this.lastCatchT > COMBO_WINDOW) {
      this.combo = 0
      this.emitHud()
    }

    // objects + collision
    const m = this.mouth()
    const floorY = this.H - 10

    for (const o of this.objects) {
      o.y += o.v * dt
      o.rot += o.type.spin * dt

      // Tighter, skill-based catch radius into the open mouth:
      const dx = Math.abs(o.x - m.cx)
      const dy = Math.abs(o.y - m.cy)
      const catchRadiusX = m.w * 0.45 + o.r + 5
      const catchRadiusY = m.h * 0.45 + o.r + 5

      if (dx <= catchRadiusX && dy <= catchRadiusY) {
        this.catchObject(o, m)
      } else if (o.y >= floorY) {
        // Game over only when a falling hazard actually touches the floor!
        this.gameOver(o)
        return
      }
    }
    this.objects = this.objects.filter((o) => !o.dead)

    this.updateFx(dt)
  }

  updateFx(dt) {
    this.chomp = Math.max(0, this.chomp - dt * 6)
    this.happy = Math.max(0, this.happy - dt)
    this.flash = Math.max(0, this.flash - dt * 3)
    this.shake = Math.max(0, this.shake - dt * 2.5)
    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 600 * dt
      p.life -= dt
    }
    this.particles = this.particles.filter((p) => p.life > 0)
    for (const p of this.popups) {
      p.y -= 50 * dt
      p.life -= dt
    }
    this.popups = this.popups.filter((p) => p.life > 0)
  }

  /**
   * Fairness: every new object arrives at the mouth no earlier than
   * `minArrivalGap` after the previous one, and its x is reachable from the previous
   * object's x at (reachSafety × keyboard speed). Since arrivals are ordered, a
   * player who catches each object in order can always catch the next one.
   */
  spawn() {
    const r = clamp(this.W * CONFIG.objRadiusRatio, CONFIG.objMin, CONFIG.objMax)
    const type = pickStandardType(this.time)
    const m = this.mouth()
    const y0 = -r * 1.6
    const dist = m.y + m.h / 2 - y0

    let v = this.fallSpeed() * (1 + (Math.random() * 2 - 1) * CONFIG.speedJitter)
    let arrive = this.time + dist / v
    // Dynamically tighten arrival gap as time progresses
    const currentMinGap = Math.max(CONFIG.gapMin, CONFIG.baseArrivalGap - CONFIG.gapDecay * this.time)
    const minArrive = this.lastArrive + currentMinGap
    if (arrive < minArrive) {
      arrive = minArrive
      v = dist / (arrive - this.time)
    }

    const pending = this.lastArrive > this.time
    const fromX = pending ? this.lastX : m.cx
    const window = arrive - (pending ? this.lastArrive : this.time)
    const reach = CONFIG.keyboardSpeed * this.W * CONFIG.reachSafety * window + m.w * 0.3
    const [minC, maxC] = this.mouthRange()
    const lo = Math.max(minC - m.w * 0.3, r + 2, fromX - reach)
    const hi = Math.min(maxC + m.w * 0.3, this.W - r - 2, fromX + reach)
    const x = lo + Math.random() * Math.max(0, hi - lo)

    this.lastArrive = arrive
    this.lastX = clamp(x, minC, maxC)
    this.objects.push({ type, x, y: y0, r, v, rot: 0, phase: Math.random() * 10, dead: false })
  }

  catchObject(o, m) {
    o.dead = true
    // Round once and use the same value for live scoring and the replay log.
    const t = Math.round(this.time * 1000) / 1000
    this.combo = nextCombo(this.combo, t - this.lastCatchT)
    this.lastCatchT = t
    const pts = computeCatchPoints(o.type.kind, this.combo)
    this.score += pts
    this.events.push({ t, kind: o.type.kind })
    this.chomp = 1

    this.popups.push({ x: o.x, y: m.y - 14, text: `+${pts}`, life: 0.8, big: false })
    if ([5, 10, 20].includes(this.combo)) {
      this.popups.push({ x: this.W / 2, y: this.H * 0.35, text: `${this.combo} STREAK! 🔥`, life: 1.1, big: true, center: true })
      this.happy = 0.7
      sound.play('combo')
    } else {
      sound.play('catch')
    }

    const n = this.reducedMotion ? 3 : 8
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI
      const s = 120 + Math.random() * 180
      this.particles.push({
        x: o.x, y: m.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 0.5 + Math.random() * 0.3, color: i % 2 ? '#F8D928' : '#FFFFFF', size: 2 + Math.random() * 3,
      })
    }
    this.emitHud()
  }

  gameOver(missed) {
    this.over = true
    this.running = false
    this.stopLoop()
    this.missed = missed
    this.shake = this.reducedMotion ? 0 : 1
    sound.play('over')
    // short shake animation, then hand off to UI
    const start = performance.now()
    const anim = (ts) => {
      const dt = Math.min((ts - (this._lastOver ?? start)) / 1000, 0.05)
      this._lastOver = ts
      this.updateFx(dt)
      this.render()
      if (ts - start < 450) this.raf = requestAnimationFrame(anim)
    }
    this._lastOver = start
    this.raf = requestAnimationFrame(anim)
    const result = {
      score: this.score,
      durationSec: Math.round(this.time * 100) / 100,
      events: this.events.slice(),
      missedType: missed?.type?.id || 'sweat',
    }
    this.overTimer = setTimeout(() => this.onGameOver?.(result), 650)
  }

  // ---------- render ----------
  render() {
    const { ctx, W, H } = this
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    if (this.shake) ctx.translate((Math.random() - 0.5) * 14 * this.shake, (Math.random() - 0.5) * 14 * this.shake)

    // backdrop grid
    ctx.strokeStyle = 'rgba(248,217,40,0.06)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 0; x < W; x += 40) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H) }
    for (let y = 0; y < H; y += 40) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5) }
    ctx.stroke()

    // floor line
    const floorY = this.H - 10
    ctx.setLineDash([6, 8])
    ctx.strokeStyle = 'rgba(248,217,40,0.35)'
    ctx.beginPath()
    ctx.moveTo(0, floorY)
    ctx.lineTo(W, floorY)
    ctx.stroke()
    ctx.setLineDash([])

    const t = performance.now() / 1000
    // head first, so falling objects are visible as they drop into the mouth
    drawCharacter(ctx, this.character, { cx: this.cx, bottom: this.charBottom, w: this.charW, chomp: this.chomp, happy: this.happy, dead: this.over, t })
    for (const o of this.objects) drawObject(ctx, o, t)

    for (const p of this.particles) {
      ctx.globalAlpha = Math.min(1, p.life * 2)
      ctx.fillStyle = p.color
      ctx.fillRect(p.x, p.y, p.size, p.size)
    }
    ctx.globalAlpha = 1

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const p of this.popups) {
      ctx.globalAlpha = Math.min(1, p.life * 2.5)
      ctx.font = `${p.big ? (p.center ? 40 : 28) : 22}px Anton, Impact, sans-serif`
      ctx.lineWidth = 4
      ctx.strokeStyle = '#111'
      ctx.strokeText(p.text, p.x, p.y)
      ctx.fillStyle = p.big ? '#F8D928' : '#FFFFFF'
      ctx.fillText(p.text, p.x, p.y)
    }
    ctx.globalAlpha = 1

    if (this.missed) {
      const o = this.missed
      ctx.strokeStyle = '#F8D928'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(o.x, o.y, o.r * 1.9, 0, Math.PI * 2)
      ctx.stroke()
      ctx.font = '22px Anton, Impact, sans-serif'
      ctx.fillStyle = '#F8D928'
      ctx.fillText('MISSED!', clamp(o.x, 50, W - 50), o.y - o.r * 2.6)
    }
    ctx.restore()

    if (this.flash) {
      ctx.fillStyle = `rgba(248,217,40,${this.flash * 0.18})`
      ctx.fillRect(0, 0, W, H)
    }
  }
}
