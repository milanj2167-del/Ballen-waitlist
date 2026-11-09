/** All tunable gameplay numbers live here. Units: W = canvas width, H = canvas height. */
export const CONFIG = {
  // Mr. Baller — scaled smaller for skill & precision
  charWidthRatio: 0.18,
  charMin: 60,
  charMax: 130,
  charBottomPad: 0,
  keyboardSpeed: 1.25, // W per second (also used as the "reach" speed for fair spawning)
  pointerSmoothing: 1e-14, // lower = snappier follow

  // Falling objects
  objRadiusRatio: 0.038,
  objMin: 13,
  objMax: 24,
  baseFall: 0.35, // H per second at t=0
  fallGrowth: 0.015, // + H/s per second played (ramps up progressively)
  fallCap: 1.15,
  speedJitter: 0.22,

  // Spawning — tightens pace and arrival gaps over time
  firstSpawnDelay: 0.65,
  baseInterval: 1.05, // seconds between spawns at t=0
  intervalDecay: 0.018, // accelerates drop rate over time
  intervalMin: 0.24, // rapid-fire cap
  baseArrivalGap: 0.28, // initial buffer between drops
  gapDecay: 0.0035, // shrinks arrival gap as time progresses
  gapMin: 0.14, // minimum gap so objects arrive in rapid waves
  reachSafety: 0.85, // ensures physical catchability
}

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
