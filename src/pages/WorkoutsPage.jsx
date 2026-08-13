import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { workouts } from '../data/freeleticsProgram'
import { getWorkoutStatistics } from '../services/workoutHistoryService'

const WORKOUT_ORDER = ['aphrodite', 'apollon', 'dione', 'iris', 'metis', 'venus']

const WORKOUT_IMAGES = {
  aphrodite: 'assets/workouts/aphrodite.webp',
  apollon: 'assets/workouts/apollon.webp',
  dione: 'assets/workouts/dione.webp',
  iris: 'assets/workouts/iris.webp',
  metis: 'assets/workouts/metis.webp',
  venus: 'assets/workouts/venus.webp',
}

const formatTime = (totalSeconds) => {
  const numericSeconds = Number(totalSeconds)
  if (!numericSeconds || numericSeconds <= 0) return '--:--'

  const hours = Math.floor(numericSeconds / 3600)
  const minutes = Math.floor((numericSeconds % 3600) / 60)
  const seconds = numericSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const formatDate = (dateValue) => {
  if (!dateValue) return 'Sin registros'
  const parsedDate = new Date(dateValue)
  if (Number.isNaN(parsedDate.getTime())) return 'Sin registros'

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

const getWorkoutExerciseCount = (workout) => {
  const initialSteps = Array.isArray(workout?.initialSteps) ? workout.initialSteps.length : 0
  const roundSteps = Array.isArray(workout?.rounds)
    ? workout.rounds.reduce((total, round) => total + (Array.isArray(round.steps) ? round.steps.length : 0), 0)
    : 0
  const finalSteps = Array.isArray(workout?.finalSteps) ? workout.finalSteps.length : 0
  return initialSteps + roundSteps + finalSteps
}

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
    <path d="m8 14 2 2 5-5" />
  </svg>
)

const WorkoutIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.5 6.5v11M3.5 8.5v7M17.5 6.5v11M20.5 8.5v7M6.5 12h11" />
  </svg>
)

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
    <path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 12v5M8 21h8M9 17h6" />
  </svg>
)

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
  </svg>
)

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m8 5 11 7-11 7V5Z" />
  </svg>
)

const RunningIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="14" cy="4" r="2" />
    <path d="m10 8 3-2 2 3 3 1M8 21l3-6 3 2 2 4M5 13l5-5 3 4-2 3" />
  </svg>
)

function WorkoutsPage() {
  const navigate = useNavigate()

  const workoutCards = useMemo(
    () =>
      WORKOUT_ORDER.map((workoutId) => {
        const workout = workouts[workoutId]
        if (!workout) return null

        return {
          workout,
          statistics: getWorkoutStatistics(workoutId),
          image: WORKOUT_IMAGES[workoutId],
          totalExerciseSteps: getWorkoutExerciseCount(workout),
        }
      }).filter(Boolean),
    []
  )

  return (
    <main className="workouts-page">
      <div className="workouts-mineral-background" />

      <section className="workouts-shell">
        <AppBrandHeader
          eyebrow="ENTRENAMIENTO LIBRE"
          title="Workouts"
          description="Entrena cualquier workout cuando quieras. Tus tiempos quedarán registrados y podrán mejorar tu marca personal."
          action={
            <div className="workouts-header-icon" aria-hidden="true">
              <WorkoutIcon />
            </div>
          }
        />

        <section className="workouts-information-card">
          <div className="workouts-information-icon"><TrophyIcon /></div>
          <div>
            <strong>Supera tus marcas</strong>
            <p>Los workouts independientes no completan sesiones del programa, pero sí cuentan para tu historial y mejores tiempos.</p>
          </div>
        </section>

        <section className="workouts-list">
          {workoutCards.map(({ workout, statistics, image, totalExerciseSteps }) => (
            <article key={workout.id} className="workout-card">
              <div className="workout-card-image">
                {image && <img src={image} alt={`Resumen del workout ${workout.name}`} />}
                <div className="workout-card-image-overlay" />
                <div className="workout-card-image-heading">
                  <span>WORKOUT</span>
                  <h2>{workout.name}</h2>
                </div>
                {workout.requiresRunningSpace && (
                  <div className="workout-running-badge">
                    <RunningIcon />
                    Requiere espacio para correr
                  </div>
                )}
              </div>

              <div className="workout-card-content">
                <div className="workout-card-meta">
                  <article><span>Rondas</span><strong>{workout.rounds?.length || 0}</strong></article>
                  <article><span>Bloques</span><strong>{totalExerciseSteps}</strong></article>
                  <article><span>Realizado</span><strong>{statistics.completedCount} {statistics.completedCount === 1 ? 'vez' : 'veces'}</strong></article>
                </div>

                <div className="workout-card-times">
                  <div className="workout-time-item workout-time-best">
                    <span>MEJOR TIEMPO</span>
                    <strong>{formatTime(statistics.bestTimeSeconds)}</strong>
                    <small>{statistics.bestTimeSeconds ? 'Tu marca a superar' : 'Todavía sin marca'}</small>
                  </div>
                  <div className="workout-time-item">
                    <span>ÚLTIMO TIEMPO</span>
                    <strong>{formatTime(statistics.lastTimeSeconds)}</strong>
                    <small>{formatDate(statistics.lastCompletedAt)}</small>
                  </div>
                </div>

                <button type="button" className="workout-start-button" onClick={() => navigate(`/workout/${workout.id}`)}>
                  <PlayIcon />
                  <span>{statistics.completedCount > 0 ? 'VOLVER A REALIZAR' : 'COMENZAR WORKOUT'}</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      </section>

      <nav className="program-navigation">
        <button type="button" className="program-navigation-button" onClick={() => navigate('/programa')}>
          <CalendarIcon /><span>Programa</span>
        </button>
        <button type="button" className="program-navigation-button program-navigation-button-active" onClick={() => navigate('/workouts')}>
          <WorkoutIcon /><span>Workouts</span>
        </button>
        <button type="button" className="program-navigation-button"><ChartIcon /><span>Progreso</span></button>
        <button type="button" className="program-navigation-button"><TrophyIcon /><span>Marcas</span></button>
        <button type="button" className="program-navigation-button"><SettingsIcon /><span>Ajustes</span></button>
      </nav>
    </main>
  )
}

export default WorkoutsPage
