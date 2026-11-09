/** Local-only persistence. Personal best is NOT a verified global ranking. */
const BEST_KEY = 'ballen.feedTheBoys.personalBest'
const SOUND_KEY = 'ballen.feedTheBoys.sound'

export function getPersonalBest() {
  try {
    return Math.max(0, parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0)
  } catch {
    return 0
  }
}

export function savePersonalBest(score) {
  try {
    localStorage.setItem(BEST_KEY, String(score))
  } catch {
    /* storage unavailable (private mode etc.) */
  }
}

export function getSoundPref() {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off'
  } catch {
    return true
  }
}

export function saveSoundPref(on) {
  try {
    localStorage.setItem(SOUND_KEY, on ? 'on' : 'off')
  } catch {
    /* ignore */
  }
}
