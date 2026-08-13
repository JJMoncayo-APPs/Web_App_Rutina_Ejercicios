// src/pages/RecordsPage.jsx

import { useMemo } from 'react'
import BottomNavigation from '../components/BottomNavigation'
import {
  maxExercises,
  workouts,
} from '../data/freeleticsProgram'
import {
  getRecentWorkoutResults,
  getWorkoutStatistics,
} from '../services/workoutHistoryService'
import {
  getMaxStatistics,
  getRecentMaxResults,
} from '../services/maxHistoryService'

const WORKOUT_ORDER = [
  'aphrodite',
  'apollon',
  'dione',
  'iris',
  'metis',
  'venus',
]

const MAX_ORDER = [
  'burpeeMax',
  'squatMax',
  'situpMax',
  'pushupMax',
  'legLeverMax',
]

const WORKOUT_IMAGES = {
  aphrodite: 'assets/workouts/aphrodite.webp',
  apollon: 'assets/workouts/apollon.webp',
  dione: 'assets/workouts/dione.webp',
  iris: 'assets/workouts/iris.webp',
  metis: 'assets/workouts/metis.webp',
  venus: 'assets/workouts/venus.webp',
}

const MAX_IMAGES = {
  burpeeMax: 'assets/exercises/burpees.webp',
  squatMax: 'assets/exercises/squats.webp',
  situpMax: 'assets/exercises/situps.webp',
  pushupMax: 'assets/exercises/pushups.webp',
  legLeverMax: 'assets/exercises/leg-levers.webp',
}

const formatTime = (totalSeconds) => {
  const secondsValue = Number(totalSeconds)

  if (!secondsValue || secondsValue <= 0) {
    return '--:--'
  }

  const hours = Math.floor(secondsValue / 3600)
  const minutes = Math.floor((secondsValue % 3600) / 60)
  const seconds = secondsValue % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const formatRepetitions = (repetitions) => {
  if (repetitions === null || repetitions === undefined) {
    return '--'
  }

  return `${Number(repetitions)} reps`
}

const formatDate = (dateValue) => {
  if (!dateValue) {
    return 'Sin registros'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return 'Sin registros'
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
    <path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 12v5M8 21h8M9 17h6" />
  </svg>
)

const TimerIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l3 2M9 2h6M12 2v3" />
  </svg>
)

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5M12 7v5l3 2" />
  </svg>
)

function RecordsPage() {
  const workoutRecords = useMemo(() => {
    return WORKOUT_ORDER.map((workoutId) => {
      const workout = workouts[workoutId]

      if (!workout) {
        return null
      }

      return {
        workout,
        image: WORKOUT_IMAGES[workoutId],
        statistics: getWorkoutStatistics(workoutId),
      }
    }).filter(Boolean)
  }, [])

  const maxRecords = useMemo(() => {
    return MAX_ORDER.map((maxId) => {
      const maxExercise = maxExercises[maxId]

      if (!maxExercise) {
        return null
      }

      return {
        maxExercise,
        image: MAX_IMAGES[maxId],
        statistics: getMaxStatistics(maxId),
      }
    }).filter(Boolean)
  }, [])

  const recentWorkoutResults = useMemo(
    () => getRecentWorkoutResults(8),
    []
  )

  const recentMaxResults = useMemo(
    () => getRecentMaxResults(8),
    []
  )

  const recentResults = useMemo(() => {
    const workoutItems = recentWorkoutResults.map((result) => ({
      ...result,
      resultType: 'workout',
    }))

    const maxItems = recentMaxResults.map((result) => ({
      ...result,
      resultType: 'max',
    }))

    return [...workoutItems, ...maxItems]
      .sort((resultA, resultB) => {
        return (
          new Date(resultB.completedAt).getTime() -
          new Date(resultA.completedAt).getTime()
        )
      })
      .slice(0, 10)
  }, [recentWorkoutResults, recentMaxResults])

  const workoutsWithRecords = workoutRecords.filter(
    ({ statistics }) => statistics.completedCount > 0
  ).length

  const maxWithRecords = maxRecords.filter(
    ({ statistics }) => statistics.completedCount > 0
  ).length

  const totalCompleted =
    workoutRecords.reduce(
      (total, { statistics }) => total + statistics.completedCount,
      0
    ) +
    maxRecords.reduce(
      (total, { statistics }) => total + statistics.completedCount,
      0
    )

  return (
    <main className="records-page">
      <div className="records-mineral-background" />

      <section className="records-shell">
        <header className="records-header">
          <div>
            <span className="records-header-label">RESULTADOS</span>
            <h1>Marcas</h1>
            <p>
              Consulta tus mejores tiempos y tus récords de
              repeticiones MAX.
            </p>
          </div>

          <div className="records-header-icon">
            <TrophyIcon />
          </div>
        </header>

        <section className="records-summary">
          <article>
            <span>WORKOUTS CON MARCA</span>
            <strong>{workoutsWithRecords} / 6</strong>
          </article>

          <article>
            <span>MAX CON MARCA</span>
            <strong>{maxWithRecords} / 5</strong>
          </article>

          <article>
            <span>TOTAL COMPLETADOS</span>
            <strong>{totalCompleted}</strong>
          </article>
        </section>

        <section className="records-section">
          <div className="records-section-heading">
            <TrophyIcon />
            <div>
              <span>MEJORES TIEMPOS</span>
              <h2>Récords de workouts</h2>
            </div>
          </div>

          <div className="records-grid">
            {workoutRecords.map(({ workout, image, statistics }) => (
              <article key={workout.id} className="record-card">
                <div className="record-card-image">
                  {image && (
                    <img
                      src={image}
                      alt={`Resumen del workout ${workout.name}`}
                    />
                  )}
                  <div className="record-card-overlay" />
                  <h3>{workout.name}</h3>
                </div>

                <div className="record-card-content">
                  <div className="record-best-time">
                    <span>MEJOR TIEMPO</span>
                    <strong>
                      {formatTime(statistics.bestTimeSeconds)}
                    </strong>
                  </div>

                  <div className="record-card-details">
                    <div>
                      <span>Último</span>
                      <strong>
                        {formatTime(statistics.lastTimeSeconds)}
                      </strong>
                    </div>
                    <div>
                      <span>Media</span>
                      <strong>
                        {formatTime(statistics.averageTimeSeconds)}
                      </strong>
                    </div>
                    <div>
                      <span>Intentos</span>
                      <strong>{statistics.completedCount}</strong>
                    </div>
                  </div>

                  <small>
                    {statistics.lastCompletedAt
                      ? `Última vez: ${formatDate(statistics.lastCompletedAt)}`
                      : 'Todavía no has completado este workout'}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="records-section records-max-section">
          <div className="records-section-heading">
            <TimerIcon />
            <div>
              <span>MÁXIMAS REPETICIONES</span>
              <h2>Récords MAX</h2>
            </div>
          </div>

          <div className="records-max-grid">
            {maxRecords.map(
              ({ maxExercise, image, statistics }) => (
                <article
                  key={maxExercise.id}
                  className="record-max-card"
                >
                  <div className="record-max-visual">
                    {image && (
                      <img
                        src={image}
                        alt={maxExercise.name}
                      />
                    )}
                    <div className="record-max-overlay" />
                    <div className="record-max-heading">
                      <span>MAX</span>
                      <h3>{maxExercise.name}</h3>
                    </div>
                  </div>

                  <div className="record-max-content">
                    <div className="record-max-best">
                      <span>MEJOR RESULTADO</span>
                      <strong>
                        {formatRepetitions(
                          statistics.bestRepetitions
                        )}
                      </strong>
                    </div>

                    <div className="record-max-details">
                      <div>
                        <span>Último</span>
                        <strong>
                          {formatRepetitions(
                            statistics.lastRepetitions
                          )}
                        </strong>
                      </div>
                      <div>
                        <span>Media</span>
                        <strong>
                          {formatRepetitions(
                            statistics.averageRepetitions
                          )}
                        </strong>
                      </div>
                      <div>
                        <span>Duración</span>
                        <strong>
                          {formatTime(maxExercise.durationSeconds)}
                        </strong>
                      </div>
                      <div>
                        <span>Intentos</span>
                        <strong>{statistics.completedCount}</strong>
                      </div>
                    </div>

                    <small>
                      {statistics.lastCompletedAt
                        ? `Última vez: ${formatDate(statistics.lastCompletedAt)}`
                        : 'Todavía no has registrado este MAX'}
                    </small>
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        <section className="records-section">
          <div className="records-section-heading">
            <HistoryIcon />
            <div>
              <span>ACTIVIDAD RECIENTE</span>
              <h2>Últimos resultados</h2>
            </div>
          </div>

          {recentResults.length === 0 ? (
            <div className="records-empty-state">
              Completa un workout o un MAX para empezar a registrar
              resultados.
            </div>
          ) : (
            <div className="records-history-list">
              {recentResults.map((result) => {
                const isMax = result.resultType === 'max'

                return (
                  <article
                    key={`${result.resultType}-${result.id}`}
                    className="records-history-item"
                  >
                    <div>
                      <strong>
                        {isMax
                          ? result.maxName
                          : result.workoutName}
                      </strong>
                      <span>
                        {result.source === 'program'
                          ? 'Programa de 15 semanas'
                          : isMax
                            ? 'MAX independiente'
                            : 'Workout independiente'}
                      </span>
                    </div>

                    <div className="records-history-result">
                      <strong>
                        {isMax
                          ? formatRepetitions(result.repetitions)
                          : formatTime(result.elapsedSeconds)}
                      </strong>
                      <span>{formatDate(result.completedAt)}</span>
                    </div>

                    {result.isPersonalBest && (
                      <span className="records-pb-badge">
                        NUEVA MARCA
                      </span>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </section>

      <BottomNavigation activeItem="records" />
    </main>
  )
}

export default RecordsPage
