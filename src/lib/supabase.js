import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://wcymvkwrpdbuofaysjoi.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_-sddQiHNwpdgXmLst3ff_Q_QcNHchj3'

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  DEFAULT_SUPABASE_URL

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  DEFAULT_SUPABASE_ANON_KEY

let client = null
let configured = false

try {
  if (
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  ) {
    client = createClient(supabaseUrl, supabaseAnonKey)
    configured = true
  }
} catch (err) {
  console.warn('[Supabase] Client init error:', err)
  client = null
  configured = false
}

export const isSupabaseConfigured = configured
export const supabase = client

/**
 * Retrieve cached waitlist user info from localStorage.
 */
export function getStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('ballen_waitlist_user')
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

/**
 * Cache waitlist user info to localStorage.
 */
export function saveStoredUser(user) {
  if (typeof window === 'undefined' || !user) return
  try {
    localStorage.setItem('ballen_waitlist_user', JSON.stringify(user))
    if (user.name) {
      localStorage.setItem('ballen_player_name', user.name)
    }
  } catch {}
}

/**
 * Submit waitlist registration.
 */
export async function submitWaitlist({ name, email, phone, guess }) {
  const cleanUser = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    guess: guess?.trim() || null,
  }

  saveStoredUser(cleanUser)

  if (!isSupabaseConfigured || !supabase) {
    // Simulated offline/dev fallback
    await new Promise((res) => setTimeout(res, 500))
    return { data: cleanUser, error: null, isMock: true }
  }

  const { data, error } = await supabase
    .from('waitlist')
    .insert([cleanUser])

  if (error) {
    // If email is already registered, treat gracefully as already saved
    if (error.code === '23505') {
      return { data: { ...cleanUser, isExisting: true }, error: null, isMock: false }
    }
    return { data: null, error, isMock: false }
  }

  return { data, error: null, isMock: false }
}

const LOCAL_SCORES_KEY = 'ballen_local_submitted_scores'

export function getLocalScores() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_SCORES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalScore(entry) {
  if (typeof window === 'undefined') return
  try {
    const existing = getLocalScores()
    const cleanEntryName = entry.player_name.trim().toLowerCase()

    // If player already has a score locally, keep their highest score
    const match = existing.find(
      (e) =>
        e.player_name.trim().toLowerCase() === cleanEntryName ||
        (entry.player_email && e.player_email && e.player_email.toLowerCase() === entry.player_email.toLowerCase())
    )
    const bestScore = match ? Math.max(match.score, entry.score) : entry.score

    const filtered = existing.filter(
      (e) =>
        e.player_name.trim().toLowerCase() !== cleanEntryName &&
        (!entry.player_email || !e.player_email || e.player_email.toLowerCase() !== entry.player_email.toLowerCase())
    )

    filtered.push({
      ...entry,
      score: bestScore,
      created_at: entry.created_at || new Date().toISOString(),
    })
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(filtered))
  } catch {}
}

/**
 * Fetch top N scores from Supabase ordered by score descending.
 */
export async function fetchTopScores(limit = 3) {
  let supabaseRows = []
  let dbError = null

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('id, player_name, score, created_at')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit * 4)

      if (!error && data) {
        supabaseRows = data
      } else if (error) {
        dbError = error
      }
    } catch (e) {
      dbError = e
    }
  }

  // Merge with locally saved scores on this device
  const localRows = getLocalScores()
  const combined = [...localRows, ...supabaseRows]

  // Guarantee each player only occupies 1 spot (highest score)
  const map = new Map()
  for (const row of combined) {
    const key = (row.player_name || '').trim().toLowerCase()
    if (!key) continue
    const existing = map.get(key)
    if (!existing || row.score > existing.score) {
      map.set(key, row)
    }
  }

  // Sort strictly by score DESC, then created_at ASC
  const sorted = Array.from(map.values()).sort((a, b) => b.score - a.score)
  const topList = sorted.slice(0, limit)

  const mapped = topList.map((row, idx) => ({
    rank: idx + 1,
    name: row.player_name,
    score: row.score,
  }))

  return { data: mapped, error: dbError, isMock: false }
}

/**
 * Evaluates whether a given score qualifies for the Top 3 leaderboard,
 * and what score needs to be beaten if not.
 */
export async function evaluateLeaderboardStanding(score, playerName = '') {
  const cleanScore = Math.max(0, Math.floor(score))
  const cleanName = (playerName || '').trim().toLowerCase()

  try {
    const { data: topScores } = await fetchTopScores(10)
    const list = (topScores || []).filter((r) => r.name && !r.name.startsWith('Spot Open'))

    // Filter out current player from competitor list to see where this score ranks
    const competitorList = cleanName
      ? list.filter((r) => r.name.trim().toLowerCase() !== cleanName)
      : list

    // If fewer than 3 competitor spots exist, any score > 0 qualifies for Top 3
    if (competitorList.length < 3) {
      let rank = 1
      if (competitorList[0] && cleanScore < competitorList[0].score) rank = 2
      if (competitorList[1] && cleanScore < competitorList[1].score) rank = 3

      return {
        qualifiesTop3: cleanScore > 0,
        rank: cleanScore > 0 ? rank : null,
        topScores: list.slice(0, 3),
        cutoffScore: competitorList[competitorList.length - 1]?.score ?? 0,
        pointsNeeded: 1,
        topScore: competitorList[0]?.score ?? cleanScore,
      }
    }

    const rank1Competitor = competitorList[0]?.score ?? 0
    const rank2Competitor = competitorList[1]?.score ?? 0
    const rank3Competitor = competitorList[2]?.score ?? 0

    // Compare this score against the 3rd competitor
    if (cleanScore > rank3Competitor) {
      let rank = 3
      if (cleanScore > rank1Competitor) {
        rank = 1
      } else if (cleanScore > rank2Competitor) {
        rank = 2
      }

      return {
        qualifiesTop3: true,
        rank,
        topScores: list.slice(0, 3),
        cutoffScore: rank3Competitor,
        pointsNeeded: 0,
        topScore: rank1Competitor,
      }
    }

    // Did not qualify for Top 3
    const pointsNeeded = rank3Competitor - cleanScore + 1
    return {
      qualifiesTop3: false,
      rank: null,
      topScores: list.slice(0, 3),
      cutoffScore: rank3Competitor,
      pointsNeeded: Math.max(1, pointsNeeded),
      topScore: rank1Competitor,
    }
  } catch {
    return {
      qualifiesTop3: false,
      rank: null,
      topScores: [],
      cutoffScore: 0,
      pointsNeeded: 1,
      topScore: 0,
    }
  }
}

/**
 * Submit or REPLACE a game score on the leaderboard.
 * Each player replaces their previous score with their current one.
 */
export async function submitGameScore({ playerName, playerEmail, score }) {
  const cleanScore = Math.max(0, Math.floor(score))
  const cleanName = playerName?.trim() || 'Anonymous Baller'
  const cleanEmail = (playerEmail || getStoredUser()?.email || '').trim().toLowerCase()

  const entry = {
    player_name: cleanName,
    player_email: cleanEmail,
    score: cleanScore,
    created_at: new Date().toISOString(),
  }

  // 1. Evaluate standing against existing board
  const standing = await evaluateLeaderboardStanding(cleanScore, cleanName)

  // 2. Instantly save locally so the leaderboard updates without network delay
  saveLocalScore(entry)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ballen_score_submitted'))
  }

  // 3. Sync to Supabase
  let dbData = null
  let dbError = null

  if (isSupabaseConfigured && supabase) {
    try {
      if (cleanEmail) {
        // Try upsert with player_email
        const res = await supabase
          .from('scores')
          .upsert(entry, { onConflict: 'player_email' })
          .select()

        if (!res.error) {
          dbData = res.data
        } else {
          // Fallback: direct insert
          const insRes = await supabase.from('scores').insert([entry]).select()
          dbData = insRes.data
          dbError = insRes.error
        }
      } else {
        const insRes = await supabase.from('scores').insert([entry]).select()
        dbData = insRes.data
        dbError = insRes.error
      }
    } catch (err) {
      console.warn('[Supabase] submitGameScore error:', err)
      dbError = err
    }
  }

  // 4. Notify UI listeners again
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ballen_score_submitted'))
  }

  return { data: dbData || entry, error: dbError, standing, isMock: false }
}

/**
 * Real-time subscription to the scores table.
 */
export function subscribeToLeaderboard(onChange) {
  if (!isSupabaseConfigured || !supabase) {
    return () => {}
  }

  const channel = supabase
    .channel('realtime:scores')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'scores' },
      () => {
        onChange()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
