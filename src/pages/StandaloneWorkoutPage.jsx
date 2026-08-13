// src/pages/StandaloneWorkoutPage.jsx

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { exercises, workouts } from '../data/freeleticsProgram'
import {
  getWorkoutStatistics,
  registerWorkoutResult,
} from '../services/workoutHistoryService'
import {
  playPreparationBeep,
  playStartBeep,
  unlockAudio,
} from '../services/audioService'
import { getAppSettings } from '../services/appSettingsService'

const WORKOUT_IMAGES = {
  aphrodite: '/assets/workouts/aphrodite.webp',
  apollon: '/assets/workouts/apollon.webp',
  dione: '/assets/workouts/dione.webp',
  iris: '/assets/workouts/iris.webp',
  metis: '/assets/workouts/metis.webp',
  venus: '/assets/workouts/venus.webp',
}

const formatTime = (totalSeconds = 0) => {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const formatDistance = (distanceMeters = 0) => {
  const distance = Math.max(0, Number(distanceMeters) || 0)

  if (distance >= 1000) {
    return `${String(distance / 1000).replace('.', ',')} km`
  }

  return `${distance} m`
}

const buildWorkoutSteps = (workout) => {
  if (!workout) {
    return []
  }

  const flattenedSteps = []
  const totalRounds = Array.isArray(workout.rounds)
    ? workout.rounds.length
    : 0

  const addStep = (step, roundNumber, position) => {
    if (step.type === 'run') {
      const running = exercises.running

      flattenedSteps.push({
        id: `${workout.id}-${position}`,
        type: 'run',
        workoutId: workout.id,
        workoutName: workout.name,
        exerciseId: 'running',
        exerciseName: running?.name || 'Carrera',
        distanceMeters: step.distanceMeters,
        measurement: 'distance',
        roundNumber,
        totalRounds,
        image: running?.image || null,
        modifiedImage: running?.modifiedImage || null,
        instructions: running?.instructions || '',
        modifiedInstructions: running?.modifiedInstructions || '',
        allowModifiedVersion: Boolean(
          running?.modifiedImage || running?.modifiedInstructions
        ),
        selectedVersion: 'normal',
        completed: false,
      })

      return
    }

    if (step.type !== 'exercise') {
      return
    }

    const exercise = exercises[step.exerciseId]

    if (!exercise) {
      console.warn(`Ejercicio no encontrado: ${step.exerciseId}`)
      return
    }

    flattenedSteps.push({
      id: `${workout.id}-${position}`,
      type: 'exercise',
      workoutId: workout.id,
      workoutName: workout.name,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      repetitions: step.repetitions,
      measurement: exercise.measurement,
      roundNumber,
      totalRounds,
      image: exercise.image,
      modifiedImage: exercise.modifiedImage,
      instructions: exercise.instructions,
      modifiedInstructions: exercise.modifiedInstructions,
      shoulderWarning: exercise.shoulderWarning === true,
      allowModifiedVersion: Boolean(
        exercise.modifiedImage || exercise.modifiedInstructions
      ),
      selectedVersion: 'normal',
      completed: false,
    })
  }

  if (Array.isArray(workout.initialSteps)) {
    workout.initialSteps.forEach((step, index) => {
      addStep(step, null, `initial-${index + 1}`)
    })
  }

  if (Array.isArray(workout.rounds)) {
    workout.rounds.forEach((round) => {
      if (!Array.isArray(round.steps)) {
        return
      }

      round.steps.forEach((step, index) => {
        addStep(
          step,
          round.round,
          `round-${round.round}-${index + 1}`
        )
      })
    })
  }

  if (Array.isArray(workout.finalSteps)) {
    workout.finalSteps.forEach((step, index) => {
      addStep(step, null, `final-${index + 1}`)
    })
  }

  return flattenedSteps
}

function StandaloneWorkoutPage() {
  const navigate = useNavigate()
  const { workoutId = '' } = useParams()

  const [appSettings] = useState(() => getAppSettings())
  const preparationDuration = appSettings.preparationSeconds

  const workout = workouts[workoutId] || null
  const steps = useMemo(() => buildWorkoutSteps(workout), [workout])
  const statistics = useMemo(
    () => getWorkoutStatistics(workoutId),
    [workoutId]
  )

  const [screen, setScreen] = useState('intro')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [preparationSeconds, setPreparationSeconds] = useState(
    preparationDuration
  )
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [startedAt, setStartedAt] = useState(null)
  const [selectedVersions, setSelectedVersions] = useState({})
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [completedResult, setCompletedResult] = useState(null)
  const [imageErrors, setImageErrors] = useState({})

  const timerRef = useRef(null)
  const preparationRef = useRef(null)
  const lastSoundRef = useRef(null)

  const currentStep = steps[currentStepIndex] || null
  const workoutImage = WORKOUT_IMAGES[workoutId] || null

  const progressPercentage =
    steps.length === 0
      ? 0
      : Math.round((currentStepIndex / steps.length) * 100)

  useEffect(() => {
    if (!timerRunning) {
      clearInterval(timerRef.current)
      return undefined
    }

    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((currentValue) => currentValue + 1)
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [timerRunning])

  useEffect(() => {
    clearTimeout(preparationRef.current)

    if (screen !== 'preparation') {
      return undefined
    }

    if (
      preparationSeconds === 2 &&
      lastSoundRef.current !== 2
    ) {
      lastSoundRef.current = 2
      if (appSettings.soundsEnabled) {
        playPreparationBeep()
      }

      if (appSettings.vibrationEnabled && navigator.vibrate) {
        navigator.vibrate(80)
      }
    }

    if (
      preparationSeconds === 1 &&
      lastSoundRef.current !== 1
    ) {
      lastSoundRef.current = 1
      if (appSettings.soundsEnabled) {
        playPreparationBeep()
      }

      if (appSettings.vibrationEnabled && navigator.vibrate) {
        navigator.vibrate(80)
      }
    }

    if (
      preparationSeconds === 0 &&
      lastSoundRef.current !== 0
    ) {
      lastSoundRef.current = 0
      if (appSettings.soundsEnabled) {
        playStartBeep()
      }

      if (appSettings.vibrationEnabled && navigator.vibrate) {
        navigator.vibrate([120, 60, 120])
      }

      preparationRef.current = window.setTimeout(() => {
        setScreen('exercise')
      }, 450)

      return () => clearTimeout(preparationRef.current)
    }

    preparationRef.current = window.setTimeout(() => {
      setPreparationSeconds((currentValue) =>
        Math.max(0, currentValue - 1)
      )
    }, 1000)

    return () => clearTimeout(preparationRef.current)
  }, [
    screen,
    preparationSeconds,
    appSettings.soundsEnabled,
    appSettings.vibrationEnabled,
  ])

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearTimeout(preparationRef.current)
    }
  }, [])

  const startPreparation = () => {
    lastSoundRef.current = null
    setPreparationSeconds(preparationDuration)
    setScreen('preparation')
  }

  const startWorkout = async () => {
    if (!workout || steps.length === 0) {
      return
    }

    await unlockAudio()

    setStartedAt(new Date().toISOString())
    setElapsedSeconds(0)
    setCurrentStepIndex(0)
    setTimerRunning(true)
    startPreparation()
  }

  const completeWorkout = () => {
    const result = registerWorkoutResult({
      workoutId: workout.id,
      workoutName: workout.name,
      source: 'standalone',
      startedAt,
      completedAt: new Date().toISOString(),
      elapsedSeconds,
      completedWithModifiedExercises: Object.values(
        selectedVersions
      ).includes('modified'),
    })

    setCompletedResult(result)
    setTimerRunning(false)
    setScreen('completed')
  }

  const completeCurrentExercise = () => {
    if (currentStepIndex >= steps.length - 1) {
      completeWorkout()
      return
    }

    setCurrentStepIndex((currentValue) => currentValue + 1)
    startPreparation()
  }

  const selectVersion = (version) => {
    if (!currentStep || !['normal', 'modified'].includes(version)) {
      return
    }

    if (
      version === 'modified' &&
      currentStep.allowModifiedVersion !== true
    ) {
      return
    }

    setSelectedVersions((currentVersions) => ({
      ...currentVersions,
      [currentStep.id]: version,
    }))
  }

  const restartWorkout = () => {
    clearInterval(timerRef.current)
    clearTimeout(preparationRef.current)

    setScreen('intro')
    setCurrentStepIndex(0)
    setPreparationSeconds(preparationDuration)
    setElapsedSeconds(0)
    setTimerRunning(false)
    setStartedAt(null)
    setSelectedVersions({})
    setShowExitDialog(false)
    setCompletedResult(null)
    setImageErrors({})
  }

  const handleImageError = (key) => {
    setImageErrors((currentErrors) => ({
      ...currentErrors,
      [key]: true,
    }))
  }

  if (!workout) {
    return (
      <main className="training-page">
        <section className="training-shell">
          <section className="training-error-card">
            <h1>Workout no encontrado</h1>
            <button
              type="button"
              className="training-main-button"
              onClick={() => navigate('/workouts')}
            >
              Volver a workouts
            </button>
          </section>
        </section>
      </main>
    )
  }

  const renderIntro = () => (
    <section className="training-intro-card">
      <p className="training-kicker">WORKOUT INDEPENDIENTE</p>
      <h1>{workout.name}</h1>

      {workoutImage && !imageErrors.workout && (
        <div className="training-workout-overview">
          <img
            src={workoutImage}
            alt={`Resumen del workout ${workout.name}`}
            onError={() => handleImageError('workout')}
          />
        </div>
      )}

      <div className="training-best-time">
        <span>MEJOR TIEMPO</span>
        <strong>{formatTime(statistics.bestTimeSeconds)}</strong>
        <small>
          {statistics.bestTimeSeconds
            ? 'Esta es la marca que debes superar'
            : 'Completa el workout para registrar tu primera marca'}
        </small>
      </div>

      <button
        type="button"
        className="training-play-button"
        onClick={startWorkout}
        aria-label="Comenzar workout"
      >
        <span className="training-play-triangle" />
      </button>

      <strong className="training-play-label">
        COMENZAR WORKOUT
      </strong>

      <div className="training-intro-information">
        <article>
          <span>Rondas</span>
          <strong>{workout.rounds?.length || 0}</strong>
        </article>
        <article>
          <span>Bloques</span>
          <strong>{steps.length}</strong>
        </article>
        <article>
          <span>Realizado</span>
          <strong>{statistics.completedCount} veces</strong>
        </article>
      </div>
    </section>
  )

  const renderPreparation = () => {
    const version = selectedVersions[currentStep?.id] || 'normal'
    const preparationImage =
      version === 'modified'
        ? currentStep?.modifiedImage || currentStep?.image
        : currentStep?.image

    return (
      <section className="training-countdown-card">
        <p className="training-kicker">PREPÁRATE</p>
        <h2>{currentStep?.exerciseName}</h2>

        <strong className="training-preparation-repetitions">
          {currentStep?.type === 'run'
            ? formatDistance(currentStep.distanceMeters)
            : `${currentStep?.repetitions || 0} REPETICIONES`}
        </strong>

        {preparationImage && !imageErrors[currentStep?.id] && (
          <div className="training-preparation-image">
            <img
              src={preparationImage}
              alt={currentStep?.exerciseName || 'Ejercicio'}
              onError={() => handleImageError(currentStep?.id)}
            />
          </div>
        )}

        <div
          className={`training-countdown-number ${
            preparationSeconds <= 2
              ? 'training-countdown-number-warning'
              : ''
          }`}
        >
          {preparationSeconds}
        </div>

        <p className="training-countdown-message">
          {preparationSeconds > 2
            ? 'Colócate en posición'
            : preparationSeconds > 0
              ? 'Listo...'
              : '¡YA!'}
        </p>
      </section>
    )
  }

  const renderExercise = () => {
    if (!currentStep) {
      return null
    }

    const version = selectedVersions[currentStep.id] || 'normal'
    const selectedImage =
      version === 'modified'
        ? currentStep.modifiedImage || currentStep.image
        : currentStep.image
    const instructions =
      version === 'modified'
        ? currentStep.modifiedInstructions || currentStep.instructions
        : currentStep.instructions

    return (
      <section className="training-exercise-card">
        <div className="training-exercise-heading">
          <div>
            <p className="training-kicker">
              {currentStep.roundNumber
                ? `RONDA ${currentStep.roundNumber} DE ${currentStep.totalRounds}`
                : currentStep.type === 'run'
                  ? 'CARRERA'
                  : 'EJERCICIO'}
            </p>
            <h2>{currentStep.exerciseName}</h2>
          </div>

          <div className="training-session-clock">
            <span>TIEMPO</span>
            <strong>{formatTime(elapsedSeconds)}</strong>
          </div>
        </div>

        {selectedImage && !imageErrors[currentStep.id] && (
          <div className="training-exercise-image">
            <img
              src={selectedImage}
              alt={currentStep.exerciseName}
              onError={() => handleImageError(currentStep.id)}
            />
          </div>
        )}

        <div className="training-exercise-target">
          {currentStep.type === 'run'
            ? formatDistance(currentStep.distanceMeters)
            : `${currentStep.repetitions} REPETICIONES`}
        </div>

        {currentStep.allowModifiedVersion && (
          <div className="workout-version-selector">
            <button
              type="button"
              className={
                version === 'normal'
                  ? 'workout-version-button workout-version-button-active'
                  : 'workout-version-button'
              }
              onClick={() => selectVersion('normal')}
            >
              Normal
            </button>
            <button
              type="button"
              className={
                version === 'modified'
                  ? 'workout-version-button workout-version-button-active'
                  : 'workout-version-button'
              }
              onClick={() => selectVersion('modified')}
            >
              Modificada
            </button>
          </div>
        )}

        <p className="training-exercise-instructions">
          {instructions}
        </p>

        {appSettings.physicalWarningsEnabled &&
          currentStep.shoulderWarning && (
          <div className="training-warning">
            Este ejercicio puede cargar el hombro. Detén el ejercicio
            si provoca dolor.
          </div>
        )}

        <button
          type="button"
          className="training-main-button"
          onClick={completeCurrentExercise}
        >
          {currentStepIndex >= steps.length - 1
            ? 'FINALIZAR WORKOUT'
            : 'EJERCICIO COMPLETADO'}
          <span aria-hidden="true">→</span>
        </button>
      </section>
    )
  }

  const renderCompleted = () => (
    <section className="training-completed-card">
      <div className="training-completed-icon">✓</div>
      <p className="training-kicker">WORKOUT COMPLETADO</p>
      <h1>{workout.name}</h1>

      {completedResult?.isPersonalBest && (
        <div className="training-best-time">
          <span>NUEVO MEJOR TIEMPO</span>
          <strong>{formatTime(elapsedSeconds)}</strong>
          <small>
            {completedResult.previousBestSeconds
              ? `Marca anterior: ${formatTime(completedResult.previousBestSeconds)}`
              : 'Primera marca registrada'}
          </small>
        </div>
      )}

      <div className="training-completed-time">
        <span>Tiempo total</span>
        <strong>{formatTime(elapsedSeconds)}</strong>
      </div>

      <button
        type="button"
        className="training-main-button"
        onClick={() => navigate('/workouts')}
      >
        VOLVER A WORKOUTS
      </button>

      <button
        type="button"
        className="training-text-button"
        onClick={restartWorkout}
      >
        Repetir este workout
      </button>
    </section>
  )

  return (
    <main className="training-page">
      <div className="training-background-grid" />

      <section className="training-shell">
        <header className="training-header">
          <button
            type="button"
            className="training-exit-button"
            onClick={() => setShowExitDialog(true)}
            aria-label="Salir del workout"
          >
            ✕
          </button>

          <div>
            <span>WORKOUT INDEPENDIENTE</span>
            <strong>{workout.name}</strong>
          </div>

          <time>{formatTime(elapsedSeconds)}</time>
        </header>

        {screen !== 'intro' && screen !== 'completed' && (
          <section className="training-progress">
            <div>
              <span>
                Ejercicio {currentStepIndex + 1} de {steps.length}
              </span>
              <strong>{progressPercentage} %</strong>
            </div>
            <div className="training-progress-track">
              <span style={{ width: `${progressPercentage}%` }} />
            </div>
          </section>
        )}

        {screen === 'intro' && renderIntro()}
        {screen === 'preparation' && renderPreparation()}
        {screen === 'exercise' && renderExercise()}
        {screen === 'completed' && renderCompleted()}
      </section>

      {showExitDialog && (
        <div className="training-dialog-overlay">
          <section className="training-dialog">
            <p className="training-kicker">SALIR DEL WORKOUT</p>
            <h2>¿Quieres abandonar?</h2>
            <p>
              Los workouts incompletos no se guardan en el historial.
            </p>
            <button
              type="button"
              className="training-danger-button"
              onClick={() => navigate('/workouts')}
            >
              ABANDONAR WORKOUT
            </button>
            <button
              type="button"
              className="training-text-button"
              onClick={() => setShowExitDialog(false)}
            >
              Continuar entrenando
            </button>
          </section>
        </div>
      )}
    </main>
  )
}

export default StandaloneWorkoutPage
