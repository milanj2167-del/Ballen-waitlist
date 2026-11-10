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
    const cleanEntryName = (entry.player_name || '').trim().toLowerCase()
    const cleanEntryEmail = (entry.player_email || '').trim().toLowerCase()
    const cleanEntryPhone = (entry.player_phone || '').replace(/\D/g, '')

    // If player already has a score locally, find match by email, phone, or name
    const match = existing.find((e) => {
      const eEmail = (e.player_email || '').trim().toLowerCase()
      const ePhone = (e.player_phone || '').replace(/\D/g, '')
      const eName = (e.player_name || '').trim().toLowerCase()

      if (cleanEntryEmail && eEmail && cleanEntryEmail === eEmail) return true
      if (cleanEntryPhone && ePhone && cleanEntryPhone === ePhone) return true
      if (cleanEntryName && eName && cleanEntryName === eName) return true
      return false
    })

    const bestScore = match ? Math.max(match.score || 0, entry.score || 0) : entry.score

    const filtered = existing.filter((e) => {
      const eEmail = (e.player_email || '').trim().toLowerCase()
      const ePhone = (e.player_phone || '').replace(/\D/g, '')
      const eName = (e.player_name || '').trim().toLowerCase()

      if (cleanEntryEmail && eEmail && cleanEntryEmail === eEmail) return false
      if (cleanEntryPhone && ePhone && cleanEntryPhone === ePhone) return false
      if (cleanEntryName && eName && cleanEntryName === eName) return false
      return true
    })

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
        .select('*')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit * 5)

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

  // Guarantee each player/account only occupies 1 spot (highest score)
  // Match by email OR phone OR name
  const list = []
  for (const row of combined) {
    const rEmail = (row.player_email || '').trim().toLowerCase()
    const rPhone = (row.player_phone || '').replace(/\D/g, '')
    const rName = (row.player_name || '').trim().toLowerCase()

    if (!rName && !rEmail && !rPhone) continue

    const existingIdx = list.findIndex((e) => {
      const eEmail = (e.player_email || '').trim().toLowerCase()
      const ePhone = (e.player_phone || '').replace(/\D/g, '')
      const eName = (e.player_name || '').trim().toLowerCase()

      if (rEmail && eEmail && rEmail === eEmail) return true
      if (rPhone && ePhone && rPhone === ePhone) return true
      if (rName && eName && rName === eName) return true
      return false
    })

    if (existingIdx === -1) {
      list.push(row)
    } else {
      if ((row.score || 0) > (list[existingIdx].score || 0)) {
        list[existingIdx] = {
          ...list[existingIdx],
          ...row,
          score: row.score,
        }
      }
    }
  }

  // Sort strictly by score DESC, then created_at ASC
  list.sort((a, b) => (b.score || 0) - (a.score || 0))
  const topList = list.slice(0, limit)

  const mapped = topList.map((row, idx) => ({
    rank: idx + 1,
    name: row.player_name || 'Anonymous Baller',
    score: row.score || 0,
    email: row.player_email || '',
    phone: row.player_phone || '',
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
 * Keeps scores saved per account (email or phone or name).
 */
export async function submitGameScore({ playerName, playerEmail, playerPhone, score }) {
  const cleanScore = Math.max(0, Math.floor(score))
  const storedUser = getStoredUser()
  const cleanName = playerName?.trim() || storedUser?.name || 'Anonymous Baller'
  const cleanEmail = (playerEmail || storedUser?.email || '').trim().toLowerCase()
  const cleanPhone = (playerPhone || storedUser?.phone || '').trim()

  const entry = {
    player_name: cleanName,
    player_email: cleanEmail,
    player_phone: cleanPhone,
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

  // 3. Sync to Supabase: Find existing record by email, phone, or name
  let dbData = null
  let dbError = null

  if (isSupabaseConfigured && supabase) {
    try {
      let existingRecord = null

      // A. Try searching by email or phone
      if (cleanEmail || cleanPhone) {
        try {
          let query = supabase.from('scores').select('*')
          if (cleanEmail && cleanPhone) {
            query = query.or(`player_email.eq.${cleanEmail},player_phone.eq.${cleanPhone}`)
          } else if (cleanEmail) {
            query = query.eq('player_email', cleanEmail)
          } else {
            query = query.eq('player_phone', cleanPhone)
          }
          const { data: matches, error: qErr } = await query.limit(1)
          if (!qErr && matches && matches.length > 0) {
            existingRecord = matches[0]
          }
        } catch {
          // In case player_email or player_phone column does not exist yet
        }
      }

      // B. If not found by email/phone, search by player_name
      if (!existingRecord && cleanName) {
        try {
          const { data: nameMatches, error: nErr } = await supabase
            .from('scores')
            .select('*')
            .eq('player_name', cleanName)
            .limit(1)
          if (!nErr && nameMatches && nameMatches.length > 0) {
            existingRecord = nameMatches[0]
          }
        } catch {}
      }

      // C. Update existing record if found, or insert new
      if (existingRecord) {
        const newBestScore = Math.max(existingRecord.score || 0, cleanScore)
        const updatePayload = {
          score: newBestScore,
          player_name: cleanName,
          player_email: cleanEmail || existingRecord.player_email,
          player_phone: cleanPhone || existingRecord.player_phone,
        }

        // Try full update
        let upRes = await supabase
          .from('scores')
          .update(updatePayload)
          .eq('id', existingRecord.id)
          .select()

        // If unknown column error, fallback to basic update
        if (upRes.error) {
          upRes = await supabase
            .from('scores')
            .update({ score: newBestScore, player_name: cleanName })
            .eq('id', existingRecord.id)
            .select()
        }

        dbData = upRes.data
        dbError = upRes.error
      } else {
        // Insert new score record
        let insRes = await supabase
          .from('scores')
          .insert([entry])
          .select()

        // If unknown column error, fallback to basic insert
        if (insRes.error) {
          insRes = await supabase
            .from('scores')
            .insert([{ player_name: cleanName, score: cleanScore }])
            .select()
        }

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
