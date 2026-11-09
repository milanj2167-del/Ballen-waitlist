/** Tiny WebAudio synth — no audio files to download. */
let ac = null
function ctx() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ac = new AC()
  }
  return ac
}

function tone(f1, f2, dur, type = 'square', vol = 0.06, delay = 0) {
  const a = ctx()
  if (!a) return
  const t0 = a.currentTime + delay
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(f1, t0)
  o.frequency.exponentialRampToValueAtTime(f2, t0 + dur)
  g.gain.setValueAtTime(vol, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g).connect(a.destination)
  o.start(t0)
  o.stop(t0 + dur + 0.02)
}

export const sound = {
  enabled: true,
  unlock() {
    ctx()?.resume?.()
  },
  play(name) {
    if (!this.enabled) return
    try {
      switch (name) {
        case 'catch': tone(480, 880, 0.08); break
        case 'combo': tone(800, 1600, 0.12, 'triangle', 0.07); break
        case 'over': tone(420, 70, 0.6, 'sawtooth', 0.06); break
        case 'start': tone(300, 600, 0.1); tone(600, 1200, 0.1, 'square', 0.05, 0.1); break
      }
    } catch {
      /* audio is optional */
    }
  },
}
