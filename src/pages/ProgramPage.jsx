// src/pages/ProgramPage.jsx

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { freeleticsProgram } from '../data/freeleticsProgram'
import BottomNavigation from '../components/BottomNavigation'

const PROGRAM_PROGRESS_KEY = 'freeletics-program-progress'
const CURRENT_SESSION_KEY = 'freeletics-current-session'

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
    <path d="m8 14 2 2 5-5" />
  </svg>
)

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
    <path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 12v5M8 21h8M9 17h6" />
  </svg>
)

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 8.5 19.3a1.7 1.7 0 0 0-1.88.34l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4.1 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2.3V9.6h.1A1.7 1.7 0 0 0 4 8.5a1.7 1.7 0 0 0-.34-1.88L3.6 6.56 6.46 3.7l.06.06A1.7 1.7 0 0 0 8.4 4.1a1.7 1.7 0 0 0 1-.6A1.7 1.7 0 0 0 9.8 2.4v-.1h4v.1A1.7 1.7 0 0 0 15 4a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 19.4 8.4a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4h-.1a1.7 1.7 0 0 0-1.7 1.2Z" />
  </svg>
)

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m8 5 11 7-11 7V5Z" />
  </svg>
)

const LockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="10" width="14" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
)
const WorkoutIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.5 6.5v11M3.5 8.5v7M17.5 6.5v11M20.5 8.5v7M6.5 12h11" />
  </svg>
)

const readProgramProgress = () => {
  try {
    const storedProgress = localStorage.getItem(PROGRAM_PROGRESS_KEY)

    if (!storedProgress) {
      return {
        completedSessions: [],
      }
    }

    const parsedProgress = JSON.parse(storedProgress)

    return {
      completedSessions: Array.isArray(parsedProgress.completedSessions)
        ? parsedProgress.completedSessions
        : [],
    }
  } catch (error) {
    console.error('No se pudo cargar el progreso:', error)

    return {
      completedSessions: [],
    }
  }
}

const readCurrentSession = () => {
  try {
    const storedSession = localStorage.getItem(CURRENT_SESSION_KEY)

    if (!storedSession) {
      return null
    }

    return JSON.parse(storedSession)
  } catch (error) {
    console.error('No se pudo cargar la sesión actual:', error)
    return null
  }
}

function ProgramPage() {
  const navigate = useNavigate()

  const progress = useMemo(() => readProgramProgress(), [])
  const storedSession = useMemo(() => readCurrentSession(), [])

  const completedSessionIds = progress.completedSessions

  const totalSessions = useMemo(() => {
    return freeleticsProgram.reduce(
      (total, week) => total + week.sessions.length,
      0
    )
  }, [])

  const nextSession = useMemo(() => {
    for (const week of freeleticsProgram) {
      for (const session of week.sessions) {
        const sessionId = `${week.week}-${session.session}`

        if (!completedSessionIds.includes(sessionId)) {
          return {
            week,
            session,
          }
        }
      }
    }

    return null
  }, [completedSessionIds])

  const currentWeek = nextSession?.week || freeleticsProgram[14]
  const currentSession = nextSession?.session || null

  const completedInCurrentWeek = currentWeek.sessions.filter((session) =>
    completedSessionIds.includes(
      `${currentWeek.week}-${session.session}`
    )
  ).length

  const weeklyPercentage =
    currentWeek.sessions.length === 0
      ? 0
      : Math.round(
          (completedInCurrentWeek / currentWeek.sessions.length) * 100
        )

  const totalPercentage =
    totalSessions === 0
      ? 0
      : Math.round(
          (completedSessionIds.length / totalSessions) * 100
        )

  const hasPausedCurrentSession =
    storedSession?.status === 'inProgress' ||
    storedSession?.status === 'paused'

  const startCurrentSession = () => {
    if (!currentSession) {
      return
    }

    navigate(
      `/sesion/${currentWeek.week}/${currentSession.session}`
    )
  }

  const openSession = (weekNumber, sessionNumber, isLocked) => {
    if (isLocked) {
      return
    }

    navigate(`/sesion/${weekNumber}/${sessionNumber}`)
  }

  const isWeekLocked = (weekNumber) => {
    return weekNumber > currentWeek.week
  }

  return (
    <main className="program-page">
      <div className="program-mineral-background" />

      <section className="program-shell">
        <header className="program-header">
          <div>
            <span className="program-header-label">
              PROGRAMA DE ENTRENAMIENTO
            </span>

            <h1>Tu plan</h1>
          </div>

          <button
            type="button"
            className="program-settings-button"
            aria-label="Ajustes"
          >
            <SettingsIcon />
          </button>
        </header>

        <section className="program-week-card">
          <div className="program-week-heading">
            <div>
              <span>SEMANA ACTUAL</span>
              <strong>
                {String(currentWeek.week).padStart(2, '0')}
              </strong>
            </div>

            <div className="program-week-percentage">
              {weeklyPercentage} %
            </div>
          </div>

          <div className="program-week-progress">
            <span
              style={{
                width: `${weeklyPercentage}%`,
              }}
            />
          </div>

          <div className="program-week-meta">
            <span>
              {completedInCurrentWeek} de {currentWeek.sessions.length}{' '}
              sesiones
            </span>

            <span>
              {currentWeek.minimumCompletionPercentage} % mínimo
            </span>
          </div>
        </section>

        {currentSession ? (
          <section className="program-featured-session">
            <div className="program-session-texture" />

            <div className="program-featured-top">
              <span className="program-featured-label">
                SIGUIENTE ENTRENAMIENTO
              </span>

              <span className="program-session-number">
                SESIÓN {currentSession.session}
              </span>
            </div>

            <div className="program-featured-content">
              <div>
                <p>
                  SEMANA {currentWeek.week} · SESIÓN{' '}
                  {currentSession.session}
                </p>

                <h2>{currentSession.name}</h2>

                {hasPausedCurrentSession && (
                  <span className="program-paused-badge">
                    Sesión en curso
                  </span>
                )}
              </div>

              <div className="program-workout-mark">
                {String(currentSession.session).padStart(2, '0')}
              </div>
            </div>

            <div className="program-featured-information">
              <article>
                <span>Semana</span>
                <strong>{currentWeek.week} / 15</strong>
              </article>

              <article>
                <span>Bloques</span>
                <strong>{currentSession.steps.length}</strong>
              </article>

              <article>
                <span>Estado</span>
                <strong>
                  {hasPausedCurrentSession ? 'En curso' : 'Pendiente'}
                </strong>
              </article>
            </div>

            <button
              type="button"
              className="program-start-button"
              onClick={startCurrentSession}
            >
              <PlayIcon />

              <span>
                {hasPausedCurrentSession
                  ? 'CONTINUAR SESIÓN'
                  : 'COMENZAR SESIÓN'}
              </span>
            </button>
          </section>
        ) : (
          <section className="program-finished-card">
            <div className="program-finished-icon">
              <TrophyIcon />
            </div>

            <h2>Programa completado</h2>

            <p>
              Has completado las 15 semanas y las 73 sesiones.
            </p>
          </section>
        )}

        {currentWeek.challenge && (
          <section className="program-challenge-card">
            <div className="program-challenge-icon">
              <TrophyIcon />
            </div>

            <div>
              <span>RETO DE LA SEMANA</span>
              <p>{currentWeek.challenge}</p>
            </div>
          </section>
        )}

        <section className="program-section">
          <div className="program-section-heading">
            <div>
              <span>PROGRAMA COMPLETO</span>
              <h2>15 semanas</h2>
            </div>

            <strong>{totalPercentage} %</strong>
          </div>

          <div className="program-week-list">
            {freeleticsProgram.map((week) => {
              const locked = isWeekLocked(week.week)

              const completedSessions = week.sessions.filter((session) =>
                completedSessionIds.includes(
                  `${week.week}-${session.session}`
                )
              ).length

              const weekCompleted =
                completedSessions === week.sessions.length

              const weekPercentage =
                week.sessions.length === 0
                  ? 0
                  : Math.round(
                      (completedSessions / week.sessions.length) * 100
                    )

              return (
                <article
                  key={week.week}
                  className={[
                    'program-week-item',
                    week.week === currentWeek.week
                      ? 'program-week-item-current'
                      : '',
                    locked ? 'program-week-item-locked' : '',
                    weekCompleted
                      ? 'program-week-item-completed'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="program-week-item-number">
                    {weekCompleted ? (
                      <CheckIcon />
                    ) : locked ? (
                      <LockIcon />
                    ) : (
                      String(week.week).padStart(2, '0')
                    )}
                  </div>

                  <div className="program-week-item-content">
                    <div>
                      <h3>{week.title}</h3>

                      <span>
                        {completedSessions} de {week.sessions.length}{' '}
                        sesiones
                      </span>
                    </div>

                    <strong>{weekPercentage} %</strong>
                  </div>

                  <div className="program-week-item-progress">
                    <span
                      style={{
                        width: `${weekPercentage}%`,
                      }}
                    />
                  </div>

                  {!locked && (
                    <div className="program-session-buttons">
                      {week.sessions.map((session) => {
                        const sessionId = `${week.week}-${session.session}`

                        const completed =
                          completedSessionIds.includes(sessionId)

                        const isCurrent =
                          week.week === currentWeek.week &&
                          session.session === currentSession?.session

                        return (
                          <button
                            key={session.session}
                            type="button"
                            className={[
                              'program-session-button',
                              completed
                                ? 'program-session-button-completed'
                                : '',
                              isCurrent
                                ? 'program-session-button-current'
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() =>
                              openSession(
                                week.week,
                                session.session,
                                false
                              )
                            }
                            aria-label={`Semana ${week.week}, sesión ${session.session}`}
                          >
                            {completed ? (
                              <CheckIcon />
                            ) : (
                              session.session
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      </section>
      <BottomNavigation activeItem="program" />
      
    </main>
  )
}

export default ProgramPage