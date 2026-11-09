/**
 * Leaderboard API interface — NOT CONNECTED YET.
 * Replace the bodies with Supabase calls (ideally an Edge Function that
 * re-validates the run with `computeRunScore` before inserting).
 *
 * RunSubmission: {
 *   displayName: string,
 *   score: number,            // client claim — never authoritative
 *   durationSec: number,
 *   events: { t: number, kind: 'standard' }[],
 *   gameVersion: string,
 * }
 * LeaderboardEntry: { rank: number, name: string, score: number }
 */
export const GAME_VERSION = 'ftb-0.1.0'

export const LEADERBOARD_CONNECTED = false

export async function submitRun(/* run: RunSubmission */) {
  return { ok: false, reason: 'not_connected' }
}

export async function fetchLeaderboard(/* { limit = 10 } = {} */) {
  return { ok: false, reason: 'not_connected', entries: [] }
}

export function buildRunSubmission({ displayName = '', score, durationSec, events }) {
  return { displayName, score, durationSec, events, gameVersion: GAME_VERSION }
}
