/**
 * Pure scoring rules. The backend can re-run `computeRunScore(events)` on the
 * submitted event log to validate a claimed score.
 */
export const POINTS = { standard: 10 }

/** Catches within this many seconds of the previous one keep the combo alive. */
export const COMBO_WINDOW = 0.9

export function comboMultiplier(combo) {
  if (combo >= 20) return 3
  if (combo >= 10) return 2
  if (combo >= 5) return 1.5
  return 1
}

export function computeCatchPoints(kind, combo) {
  return Math.round((POINTS[kind] ?? 0) * comboMultiplier(combo))
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
