// src/pages/RecordsPage.jsx

import { useMemo, useRef, useState } from 'react'
import AppBrandHeader from '../components/AppBrandHeader'
import BottomNavigation from '../components/BottomNavigation'
import { maxExercises, workouts } from '../data/freeleticsProgram'
import {
  deleteWorkoutResult,
  getRecentWorkoutResults,
  getWorkoutStatistics,
} from '../services/workoutHistoryService'
import {
  deleteMaxResult,
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

const LONG_PRESS_DELAY = 650

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
  const [dataVersion, setDataVersion] = useState(0)
  const [pendingDelete, setPendingDelete] = useState(null)
  const longPressTimerRef = useRef(null)

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
  }, [dataVersion])

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
  }, [dataVersion])

  const recentResults = useMemo(() => {
    const workoutItems = getRecentWorkoutResults(10).map((result) => ({
      ...result,
      resultType: 'workout',
    }))
    const maxItems = getRecentMaxResults(10).map((result) => ({
      ...result,
      resultType: 'max',
    }))

    return [...workoutItems, ...maxItems]
      .sort(
        (resultA, resultB) =>
          new Date(resultB.completedAt).getTime() -
          new Date(resultA.completedAt).getTime()
      )
      .slice(0, 10)
  }, [dataVersion])

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

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const startLongPress = (result) => {
    clearLongPressTimer()

    longPressTimerRef.current = window.setTimeout(() => {
      setPendingDelete(result)
      longPressTimerRef.current = null
    }, LONG_PRESS_DELAY)
  }

  const getLongPressProps = (result) => ({
    onPointerDown: () => startLongPress(result),
    onPointerUp: clearLongPressTimer,
    onPointerCancel: clearLongPressTimer,
    onPointerLeave: clearLongPressTimer,
    onContextMenu: (event) => event.preventDefault(),
  })

  const confirmDelete = () => {
    if (!pendingDelete) {
      return
    }

    const deleted =
      pendingDelete.resultType === 'max'
        ? deleteMaxResult(pendingDelete.id)
        : deleteWorkoutResult(pendingDelete.id)

    if (deleted) {
      setDataVersion((currentVersion) => currentVersion + 1)
    }

    setPendingDelete(null)
  }

  const getDeleteTitle = () => {
    if (!pendingDelete) {
      return ''
    }

    return pendingDelete.resultType === 'max'
      ? pendingDelete.maxName
      : pendingDelete.workoutName
  }

  const getDeleteValue = () => {
    if (!pendingDelete) {
      return ''
    }

    return pendingDelete.resultType === 'max'
      ? formatRepetitions(pendingDelete.repetitions)
      : formatTime(pendingDelete.elapsedSeconds)
  }

  return (
    <main className="records-page">
      <div className="records-mineral-background" />

      <section className="records-shell">
        <AppBrandHeader
          eyebrow="RESULTADOS"
          title="Marcas"
          description="Consulta tus tres mejores tiempos y tus récords de repeticiones MAX."
          action={
            <div className="records-header-icon" aria-hidden="true">
              <TrophyIcon />
            </div>
          }
        />

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

        <p className="records-long-press-help">
          Mantén pulsado cualquier resultado para eliminarlo.
        </p>

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
                    <strong>{formatTime(statistics.bestTimeSeconds)}</strong>
                  </div>

                  {statistics.topResults.length > 0 ? (
                    <div className="records-podium-list">
                      {statistics.topResults.map((result) => (
                        <article
                          key={result.id}
                          className="records-podium-item"
                          {...getLongPressProps({
                            ...result,
                            resultType: 'workout',
                          })}
                        >
                          <span className={`records-position records-position-${result.position}`}>
                            {result.position}º
                          </span>
                          <strong>{formatTime(result.elapsedSeconds)}</strong>
                          <small>{formatDate(result.completedAt)}</small>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="records-no-podium">
                      Todavía no hay resultados.
                    </div>
                  )}

                  <div className="record-card-details">
                    <div>
                      <span>Último</span>
                      <strong>{formatTime(statistics.lastTimeSeconds)}</strong>
                    </div>
                    <div>
                      <span>Media</span>
                      <strong>{formatTime(statistics.averageTimeSeconds)}</strong>
                    </div>
                    <div>
                      <span>Intentos</span>
                      <strong>{statistics.completedCount}</strong>
                    </div>
                  </div>
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
            {maxRecords.map(({ maxExercise, image, statistics }) => (
              <article key={maxExercise.id} className="record-max-card">
                <div className="record-max-visual">
                  {image && <img src={image} alt={maxExercise.name} />}
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
                      {formatRepetitions(statistics.bestRepetitions)}
                    </strong>
                  </div>

                  {statistics.topResults.length > 0 ? (
                    <div className="records-podium-list">
                      {statistics.topResults.map((result) => (
                        <article
                          key={result.id}
                          className="records-podium-item"
                          {...getLongPressProps({
                            ...result,
                            resultType: 'max',
                          })}
                        >
                          <span className={`records-position records-position-${result.position}`}>
                            {result.position}º
                          </span>
                          <strong>
                            {formatRepetitions(result.repetitions)}
                          </strong>
                          <small>{formatDate(result.completedAt)}</small>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="records-no-podium">
                      Todavía no hay resultados.
                    </div>
                  )}

                  <div className="record-max-details">
                    <div>
                      <span>Último</span>
                      <strong>
                        {formatRepetitions(statistics.lastRepetitions)}
                      </strong>
                    </div>
                    <div>
                      <span>Media</span>
                      <strong>
                        {formatRepetitions(statistics.averageRepetitions)}
                      </strong>
                    </div>
                    <div>
                      <span>Duración</span>
                      <strong>{formatTime(maxExercise.durationSeconds)}</strong>
                    </div>
                    <div>
                      <span>Intentos</span>
                      <strong>{statistics.completedCount}</strong>
                    </div>
                  </div>
                </div>
              </article>
            ))}
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
                    {...getLongPressProps(result)}
                  >
                    <div>
                      <strong>
                        {isMax ? result.maxName : result.workoutName}
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

      {pendingDelete && (
        <div className="records-delete-overlay" role="presentation">
          <section
            className="records-delete-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-record-title"
          >
            <span className="records-delete-kicker">ELIMINAR REGISTRO</span>
            <h2 id="delete-record-title">¿Estás seguro?</h2>
            <p>
              Se eliminará solamente este resultado. Las marcas se
              recalcularán automáticamente.
            </p>

            <div className="records-delete-result">
              <strong>{getDeleteTitle()}</strong>
              <span>{getDeleteValue()}</span>
              <small>{formatDate(pendingDelete.completedAt)}</small>
            </div>

            <div className="records-delete-actions">
              <button
                type="button"
                className="records-delete-cancel"
                onClick={() => setPendingDelete(null)}
              >
                CANCELAR
              </button>
              <button
                type="button"
                className="records-delete-confirm"
                onClick={confirmDelete}
              >
                ELIMINAR
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default RecordsPage
