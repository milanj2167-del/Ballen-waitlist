import { useCallback, useEffect, useRef, useState } from 'react'
import { GameEngine } from '../../game/engine'
import { sound } from '../../game/sound'
import { getPersonalBest, savePersonalBest, getSoundPref, saveSoundPref } from '../../game/storage'
import { getDefeatMessage } from '../../game/messages'
import CodedHorseMascot from './CodedHorseMascot'
import WaitlistModal from './WaitlistModal'
import { trackGameStart, trackGameOver, trackShareScore } from '../../lib/analytics'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function GameButton({ children, variant = 'yellow', className = '', ...props }) {
  const styles = {
    yellow: 'bg-ballen text-ink shadow-[5px_5px_0_0_#fff] hover:shadow-[2px_2px_0_0_#fff]',
    white: 'bg-paper text-ink shadow-[5px_5px_0_0_#F8D928] hover:shadow-[2px_2px_0_0_#F8D928]',
    ghost: 'bg-transparent text-paper border-paper/40 hover:border-ballen hover:text-ballen',
  }
  return (
    <button
      type="button"
      className={`rounded-full border-2 border-ink px-6 py-3 font-display text-lg uppercase tracking-wide transition-all
        hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ballen
        ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function SoundToggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? 'Mute sound' : 'Unmute sound'}
      className="grid h-10 w-10 place-items-center rounded-full border-2 border-paper/30 text-lg text-paper hover:border-ballen focus-visible:outline-3 focus-visible:outline-ballen"
    >
      {on ? '🔊' : '🔇'}
    </button>
  )
}

/**
 * FEED THE BOYS — self-contained game component.
 * Drop into <GameContainer>. Talks to the page only via #waitlist scroll.
 */
export default function FeedTheBoys() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const [screen, setScreen] = useState('start') // start | playing | paused | over
  const [hud, setHud] = useState({ score: 0, combo: 0, mult: 1 })
  const [best, setBest] = useState(() => getPersonalBest())
  const [result, setResult] = useState(null)
  const [soundOn, setSoundOn] = useState(() => getSoundPref())
  const [toast, setToast] = useState('')
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false)
  const [standingFeedback, setStandingFeedback] = useState(null)

  useEffect(() => {
    sound.enabled = soundOn
    saveSoundPref(soundOn)
  }, [soundOn])

  // engine lifecycle
  useEffect(() => {
    const engine = new GameEngine(canvasRef.current, {
      reducedMotion: prefersReducedMotion(),
      onHud: setHud,
      onGameOver: (r) => {
        const prev = getPersonalBest()
        const isNewBest = r.score > prev
        if (isNewBest) savePersonalBest(r.score)
        setBest(Math.max(prev, r.score))
        const defeat = getDefeatMessage(r.missedType)
        setResult({ ...r, isNewBest, defeat })
        setScreen('over')
        trackGameOver({ score: r.score, cause: r.missedType, isNewBest })
      },
    })
    engineRef.current = engine
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      engine.resize(width, height, window.devicePixelRatio || 1)
    })
    ro.observe(wrapRef.current)
    return () => {
      ro.disconnect()
      engine.destroy()
    }
  }, [])

  const start = useCallback(() => {
    sound.unlock()
    sound.play('start')
    setResult(null)
    setStandingFeedback(null)
    setScreen('playing')
    engineRef.current?.start()
    wrapRef.current?.focus({ preventScroll: true })
    trackGameStart()
  }, [])

  const pause = useCallback(() => {
    engineRef.current?.pause()
    setScreen((s) => (s === 'playing' ? 'paused' : s))
  }, [])

  const resume = useCallback(() => {
    setScreen('playing')
    engineRef.current?.resume()
    wrapRef.current?.focus({ preventScroll: true })
  }, [])

  // keyboard (only while playing)
  useEffect(() => {
    if (screen !== 'playing') return
    const map = { ArrowLeft: 'left', ArrowRight: 'right', a: 'left', d: 'right' }
    const down = (e) => {
      if (map[e.key]) {
        e.preventDefault()
        engineRef.current?.setKey(map[e.key], true)
      } else if (e.key === 'Escape' || e.key === 'p') {
        pause()
      }
    }
    const up = (e) => map[e.key] && engineRef.current?.setKey(map[e.key], false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      engineRef.current?.setKey('left', false)
      engineRef.current?.setKey('right', false)
    }
  }, [screen, pause])

  // pause when tab hidden / window blurred
  useEffect(() => {
    const onHide = () => document.hidden && pause()
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('blur', pause)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('blur', pause)
    }
  }, [pause])

  const onPointer = (e) => {
    if (screen !== 'playing') return
    const rect = wrapRef.current.getBoundingClientRect()
    engineRef.current?.setPointerX(e.clientX - rect.left)
  }

  const triggerNativeShare = async (scoreVal = result?.score ?? 0) => {
    trackShareScore({ score: scoreVal })
    const text = `I scored ${scoreVal} in Feed the Boys by Ballen. Think you can beat me?`
    const url = window.location.href.split('#')[0] + '#game'
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Feed the Boys — Ballen', text, url })
        setToast('Score shared & leaderboard updated! 🏆')
        return
      }
      await navigator.clipboard.writeText(`${text} ${url}`)
      setToast('Score copied & leaderboard updated! 🏆')
    } catch (err) {
      if (err?.name !== 'AbortError') setToast('Score saved to leaderboard!')
    }
    setTimeout(() => setToast(''), 2500)
  }

  const handleShareClick = () => {
    // Prompt waitlist modal to collect/confirm details and lock in score
    setIsWaitlistModalOpen(true)
  }

  const playing = screen === 'playing'

  return (
    <div
      ref={wrapRef}
      tabIndex={-1}
      onPointerMove={onPointer}
      onPointerDown={onPointer}
      className="relative h-full w-full select-none overflow-hidden bg-ink text-paper outline-none"
      style={{ touchAction: playing ? 'none' : 'auto', cursor: playing ? 'none' : 'auto' }}
      aria-label="Feed the Boys game"
      role="application"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      {/* HUD */}
      {(playing || screen === 'paused') && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 md:p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-paper/50">Score</p>
            <p className="font-display text-4xl leading-none text-ballen tabular-nums md:text-5xl" aria-live="off">{hud.score}</p>
            {hud.combo >= 2 && (
              <p className="mt-1 inline-block rounded-full bg-ballen px-2 py-0.5 font-display text-sm uppercase text-ink">
                Combo {hud.combo}{hud.mult > 1 ? ` · x${hud.mult}` : ''}
              </p>
            )}
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <div className="mr-1 text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-paper/50">Best</p>
              <p className="font-display text-xl leading-none tabular-nums">{best}</p>
            </div>
            <SoundToggle on={soundOn} onToggle={() => setSoundOn((s) => !s)} />
            {playing && (
              <button
                type="button"
                onClick={pause}
                aria-label="Pause game"
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-paper/30 font-display text-paper hover:border-ballen focus-visible:outline-3 focus-visible:outline-ballen"
              >
                II
              </button>
            )}
          </div>
        </div>
      )}

      {/* START */}
      {screen === 'start' && (
        <Overlay>
          <div className="relative mx-auto mb-2 flex flex-col items-center">
            <div className="relative">
              <span className="pointer-events-none absolute -top-2.5 -right-6 z-10 rotate-12 rounded-full border-2 border-ink bg-ballen px-2.5 py-0.5 font-display text-[11px] uppercase tracking-wider text-ink shadow-[2px_2px_0_0_#fff] animate-wobble">
                Feed me! 👅
              </span>
              <CodedHorseMascot
                pose="ready"
                className="h-28 w-28 drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] animate-[bounce_2.4s_ease-in-out_infinite] sm:h-36 sm:w-36 md:h-40 md:w-40"
              />
            </div>
            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-ballen/40 bg-ink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ballen">
              <span className="h-1.5 w-1.5 rounded-full bg-ballen animate-blink" />
              Mr. Baller · Catch with mouth
            </span>
          </div>

          <h3 className="font-display text-4xl uppercase leading-[0.85] sm:text-5xl md:text-6xl">
            Feed the <span className="text-ballen">boys</span>
          </h3>
          <p className="mt-2 text-sm font-semibold sm:text-base">Catch everything. Miss one. It's over.</p>
          <p className="mt-1 text-xs text-paper/60 md:text-sm">
            <span className="hidden sm:inline">Move your mouse or use ← → keys.</span>
            <span className="sm:hidden">Drag left and right to move.</span>
          </p>
          <div className="mt-4 flex items-center justify-center gap-2.5">
            <GameButton onClick={start} id="game-start-btn" className="!px-6 !py-3 !text-xl md:!px-8 md:!py-3.5 md:!text-2xl">Start game</GameButton>
            <SoundToggle on={soundOn} onToggle={() => setSoundOn((s) => !s)} />
          </div>
          {best > 0 && (
            <p className="mt-2.5 text-xs font-bold uppercase tracking-widest text-paper/60">
              Your personal best: <span className="text-ballen">{best}</span>
            </p>
          )}
        </Overlay>
      )}

      {/* PAUSED */}
      {screen === 'paused' && (
        <Overlay>
          <div className="mx-auto mb-2 flex justify-center">
            <CodedHorseMascot
              pose="chew"
              className="h-20 w-20 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] sm:h-24 sm:w-24 md:h-28 md:w-28"
            />
          </div>
          <h3 className="font-display text-5xl uppercase sm:text-6xl">Paused</h3>
          <p className="mt-1.5 text-sm text-paper/70 sm:text-base">The boys can wait. Briefly.</p>
          <div className="mt-5 flex justify-center gap-2.5">
            <GameButton onClick={resume} id="game-resume-btn" className="!px-5 !py-2.5 !text-base">Resume</GameButton>
            <GameButton onClick={start} variant="ghost" className="!px-5 !py-2.5 !text-base">Restart</GameButton>
          </div>
        </Overlay>
      )}

      {/* GAME OVER */}
      {screen === 'over' && result && (
        <Overlay>
          <div className="mx-auto mb-1 flex justify-center">
            <CodedHorseMascot
              pose="sad"
              className="h-16 w-16 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] sm:h-20 sm:w-20 md:h-24 md:w-24"
            />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ballen">Game over</p>
          <p className="mt-0.5 font-display text-5xl leading-none text-ballen tabular-nums sm:text-6xl md:text-7xl">{result.score}</p>
          {result.isNewBest && result.score > 0 && (
            <p className="mt-1.5 inline-block -rotate-2 rounded-full bg-paper px-2.5 py-0.5 font-display text-xs uppercase text-ink">
              New personal best! 🏆
            </p>
          )}
          {/* Single Major Defeat Line */}
          {result.defeat && (
            <div className="my-2.5 rounded-2xl border-2 border-ballen/60 bg-ink/95 px-3.5 py-2.5 text-center shadow-[3px_3px_0_0_#F8D928]">
              <p className="font-fun text-xs font-semibold leading-relaxed text-paper sm:text-sm">
                <span className="mr-1.5 text-base">{result.defeat.icon}</span>
                {result.defeat.message}
              </p>
            </div>
          )}

          {/* Standing Feedback Banner when score is shared */}
          {standingFeedback && (
            <div
              className={`my-2.5 rounded-2xl border-2 p-3 text-center shadow-[3px_3px_0_0_#111] animate-rise ${
                standingFeedback.qualifiesTop3
                  ? 'border-ballen bg-ink/95 shadow-[3px_3px_0_0_#F8D928]'
                  : 'border-amber-400 bg-ink/95 shadow-[3px_3px_0_0_#F59E0B]'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-display text-sm uppercase tracking-wider">
                <span>{standingFeedback.qualifiesTop3 ? '🏆' : '⚡'}</span>
                <span className={standingFeedback.qualifiesTop3 ? 'text-ballen' : 'text-amber-300'}>
                  {standingFeedback.qualifiesTop3
                    ? standingFeedback.rank === 1
                      ? "You're Rank #1 on the Board!"
                      : `You Made Top 3 · Rank #${standingFeedback.rank}!`
                    : 'Score Saved · Not in Top 3 Yet'}
                </span>
              </div>
              <p className="mt-1 font-fun text-xs font-semibold leading-snug text-paper">
                {standingFeedback.qualifiesTop3 ? (
                  standingFeedback.rank === 1
                    ? "Holding the top spot for the launch giveaway!"
                    : `Live on the board! Beat ${standingFeedback.topScore} to take #1!`
                ) : (
                  <>
                    You scored <strong className="text-ballen">{result.score}</strong>. To get on the live leaderboard, you must beat the Top 3 score of <strong className="text-paper">{standingFeedback.cutoffScore}</strong> (<span className="text-amber-300 font-bold">+{standingFeedback.pointsNeeded} pts</span> needed)!
                  </>
                )}
              </p>
              {standingFeedback.qualifiesTop3 ? (
                <a
                  href="#leaderboard"
                  className="mt-1.5 inline-block text-[11px] font-bold uppercase tracking-wider text-ballen underline underline-offset-2 hover:text-paper"
                >
                  View live leaderboard ↓
                </a>
              ) : (
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-ballen">
                  Play again to beat the top scores and claim your spot!
                </p>
              )}
            </div>
          )}

          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-paper/50">
            Personal best: {best} · saved on this device only
          </p>

          <div className="mt-3.5 flex gap-2.5 sm:justify-center">
            <GameButton onClick={start} id="game-again-btn" className="flex-1 !px-4 !py-3 !text-sm sm:!text-base">
              Play again
            </GameButton>
            <GameButton onClick={handleShareClick} variant="white" id="game-share-btn" className="flex-1 !px-4 !py-3 !text-sm sm:!text-base">
              Share score
            </GameButton>
          </div>
          <p role="status" className="mt-1.5 h-3.5 text-xs font-semibold text-ballen">{toast}</p>
        </Overlay>
      )}

      {/* WAITLIST GATE MODAL TO UNLOCK SCORE SHARING */}
      <WaitlistModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        score={result?.score ?? 0}
        onSuccess={(_values, standing) => {
          if (standing) {
            setStandingFeedback(standing)
            if (standing.qualifiesTop3) {
              setToast(`🏆 You made Top 3 (Rank #${standing.rank})!`)
              setTimeout(() => {
                const el = document.getElementById('leaderboard')
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }, 700)
            } else {
              setToast(`⚡ Score saved! Beat ${standing.cutoffScore} pts to make Top 3!`)
            }
          }
          triggerNativeShare(result?.score ?? 0)
        }}
      />
    </div>
  )
}

function Overlay({ children }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-ink/85 p-3 text-center backdrop-blur-[2px] md:p-5">
      <div className="my-auto w-full max-w-sm animate-rise sm:max-w-md">{children}</div>
    </div>
  )
}
