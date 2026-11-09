import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL)
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY)

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key'
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

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

/**
 * Fetch top N scores from Supabase ordered by score descending.
 */
export async function fetchTopScores(limit = 3) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: null, isMock: true }
  }

  const { data, error } = await supabase
    .from('scores')
    .select('id, player_name, score, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit * 4)

  if (error) return { data: null, error }

  // Guarantee each player only occupies 1 spot on the leaderboard
  const seen = new Set()
  const uniquePlayers = []
  for (const row of data || []) {
    const key = (row.player_name || '').trim().toLowerCase()
    if (key && !seen.has(key)) {
      seen.add(key)
      uniquePlayers.push(row)
    }
    if (uniquePlayers.length >= limit) break
  }

  const mapped = uniquePlayers.map((row, idx) => ({
    rank: idx + 1,
    name: row.player_name,
    score: row.score,
  }))

  return { data: mapped, error: null, isMock: false }
}

/**
 * Submit or REPLACE a game score on the leaderboard.
 * Each player replaces their previous score with their current one.
 */
export async function submitGameScore({ playerName, playerEmail, score }) {
  const cleanScore = Math.max(0, Math.floor(score))
  const cleanName = playerName?.trim() || 'Anonymous Baller'
  const cleanEmail = (playerEmail || getStoredUser()?.email || '').trim().toLowerCase()

  if (!isSupabaseConfigured || !supabase) {
    await new Promise((res) => setTimeout(res, 300))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ballen_score_submitted'))
    }
    return { data: { playerName: cleanName, score: cleanScore }, error: null, isMock: true }
  }

  // 1. If player has an email, upsert on player_email so it replaces their current score
  if (cleanEmail) {
    const { data, error } = await supabase
      .from('scores')
      .upsert(
        {
          player_name: cleanName,
          player_email: cleanEmail,
          score: cleanScore,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'player_email' }
      )
      .select()

    if (!error) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('ballen_score_submitted'))
      }
      return { data, error: null, isMock: false }
    }
    // If player_email column is not yet migrated, fall through to ID-based replacement
  }

  // 2. Fallback: replace by previously stored score ID on this device
  const storedId = typeof window !== 'undefined' ? localStorage.getItem('ballen_score_id') : null
  if (storedId) {
    const { data, error } = await supabase
      .from('scores')
      .update({
        player_name: cleanName,
        score: cleanScore,
      })
      .eq('id', storedId)
      .select()

    if (!error && data && data.length > 0) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('ballen_score_submitted'))
      }
      return { data, error: null, isMock: false }
    }
  }

  // 3. Otherwise, insert new row and save the ID so future shares replace it
  const { data, error } = await supabase
    .from('scores')
    .insert([
      {
        player_name: cleanName,
        score: cleanScore,
      },
    ])
    .select()

  if (data && data[0]?.id && typeof window !== 'undefined') {
    localStorage.setItem('ballen_score_id', data[0].id)
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ballen_score_submitted'))
  }

  return { data, error, isMock: false }
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
