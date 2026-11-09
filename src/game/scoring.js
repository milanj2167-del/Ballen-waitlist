/**
 * Pure scoring rules.
 * Each caught element awards strictly 1 point.
 */
export const POINTS = { standard: 1 }

/** Catches within this many seconds of the previous one keep the combo alive. */
export const COMBO_WINDOW = 0.9

export function comboMultiplier(_combo) {
  return 1
}

export function computeCatchPoints(kind) {
  return POINTS[kind] ?? 1
}

/** Advances combo given time since last catch. */
export function nextCombo(prevCombo, secondsSinceLastCatch) {
  return secondsSinceLastCatch <= COMBO_WINDOW ? prevCombo + 1 : 1
}

/**
 * Replays a run. events: [{ t: seconds, kind: 'standard' }] in order.
 */
export function computeRunScore(events) {
  let score = 0
  let combo = 0
  let lastT = -Infinity
  for (const e of events) {
    combo = nextCombo(combo, e.t - lastT)
    lastT = e.t
    score += computeCatchPoints(e.kind, combo)
  }
  return score
}
