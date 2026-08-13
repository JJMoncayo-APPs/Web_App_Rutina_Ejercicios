// src/pages/ActivityPage.jsx

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  buildSession,
  getSessionProgress,
  setMaxRepetitions,
  updateSessionStep,
} from '../services/sessionBuilder'
import {
  playFinishBeep,
  playPreparationBeep,
  playStartBeep,
  unlockAudio,
} from '../services/audioService'
import { registerMaxResult } from '../services/maxHistoryService'

const STORAGE_KEY = 'freeletics-current-session'
const BEST_TIMES_KEY = 'freeletics-best-times'
const PROGRAM_PROGRESS_KEY = 'freeletics-program-progress'
const PREPARATION_SECONDS = 5

const ACTIONABLE_TYPES = ['exercise', 'run', 'max', 'rest']

const WORKOUT_IMAGES = {
  aphrodite: 'assets/workouts/aphrodite.webp',
  apollon: 'assets/workouts/apollon.webp',
  dione: 'assets/workouts/dione.webp',
  iris: 'assets/workouts/iris.webp',
  metis: 'assets/workouts/metis.webp',
  venus: 'assets/workouts/venus.webp',
}

const formatTime = (totalSeconds = 0) => {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0)
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const formatDistance = (distanceMeters = 0) => {
  const safeDistance = Math.max(0, Number(distanceMeters) || 0)

  if (safeDistance >= 1000) {
    return `${String(safeDistance / 1000).replace('.', ',')} km`
  }

  return `${safeDistance} m`
}

const findFirstActionableStepIndex = (steps = []) => {
  return steps.findIndex((step) => ACTIONABLE_TYPES.includes(step.type))
}

const findNextActionableStepIndex = (steps = [], currentIndex = -1) => {
  for (let index = currentIndex + 1; index < steps.length; index += 1) {
    if (ACTIONABLE_TYPES.includes(steps[index].type)) {
      return index
    }
  }

  return -1
}

const findPreviousActionableStepIndex = (steps = [], currentIndex = 0) => {
  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    if (ACTIONABLE_TYPES.includes(steps[index].type)) {
      return index
    }
  }

  return -1
}

const loadSavedSession = (weekNumber, sessionNumber) => {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY)

    if (!storedValue) {
      return null
    }

    const storedSession = JSON.parse(storedValue)
    const isSameSession =
      Number(storedSession.weekNumber) === Number(weekNumber) &&
      Number(storedSession.sessionNumber) === Number(sessionNumber)

    return isSameSession ? storedSession : null
  } catch (error) {
    console.error('No se pudo recuperar la sesión:', error)
    return null
  }
}

const loadBestTime = (workoutName) => {
  if (!workoutName) {
    return null
  }

  try {
    const storedTimes = JSON.parse(
      localStorage.getItem(BEST_TIMES_KEY) || '{}'
    )
    const storedTime = Number(storedTimes[workoutName.toLowerCase()])

    return storedTime > 0 ? storedTime : null
  } catch (error) {
    console.error('No se pudo cargar el mejor tiempo:', error)
    return null
  }
}

const saveBestTime = (workoutName, elapsedSeconds) => {
  if (!workoutName || Number(elapsedSeconds) <= 0) {
    return false
  }

  try {
    const storedTimes = JSON.parse(
      localStorage.getItem(BEST_TIMES_KEY) || '{}'
    )
    const workoutId = workoutName.toLowerCase()
    const previousBest = Number(storedTimes[workoutId])
    const newTime = Number(elapsedSeconds)

    if (!previousBest || newTime < previousBest) {
      storedTimes[workoutId] = newTime
      localStorage.setItem(BEST_TIMES_KEY, JSON.stringify(storedTimes))
      return true
    }

    return false
  } catch (error) {
    console.error('No se pudo guardar el mejor tiempo:', error)
    return false
  }
}

const saveCompletedSession = (weekNumber, sessionNumber) => {
  try {
    const storedProgress = JSON.parse(
      localStorage.getItem(PROGRAM_PROGRESS_KEY) || '{}'
    )
    const completedSessions = Array.isArray(storedProgress.completedSessions)
      ? storedProgress.completedSessions
      : []
    const sessionId = `${weekNumber}-${sessionNumber}`

    if (!completedSessions.includes(sessionId)) {
      completedSessions.push(sessionId)
    }

    localStorage.setItem(
      PROGRAM_PROGRESS_KEY,
      JSON.stringify({
        ...storedProgress,
        completedSessions,
      })
    )
  } catch (error) {
    console.error('No se pudo guardar el progreso:', error)
  }
}

function ActivityPage() {
  const navigate = useNavigate()
  const params = useParams()
  const weekNumber = Number(params.week || 1)
  const sessionNumber = Number(params.session || 1)

  const [session, setSession] = useState(() => {
    return (
      loadSavedSession(weekNumber, sessionNumber) ||
      buildSession(weekNumber, sessionNumber)
    )
  })
  const [screen, setScreen] = useState('intro')
  const [preparationSeconds, setPreparationSeconds] = useState(
    PREPARATION_SECONDS
  )
  const [sessionTimerRunning, setSessionTimerRunning] = useState(false)
  const [stepTimerRunning, setStepTimerRunning] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isNewBestTime, setIsNewBestTime] = useState(false)
  const [imageErrors, setImageErrors] = useState({})

  const sessionIntervalRef = useRef(null)
  const preparationTimeoutRef = useRef(null)
  const stepIntervalRef = useRef(null)
  const lastPreparationSoundRef = useRef(null)
  const automaticAdvanceRef = useRef(false)

  const currentStep = useMemo(() => {
    if (!session?.steps?.length) {
      return null
    }

    return session.steps[session.currentStepIndex] || null
  }, [session])

  const progress = useMemo(() => getSessionProgress(session), [session])
  const workoutId = session?.name?.toLowerCase() || ''
  const workoutImage = WORKOUT_IMAGES[workoutId] || null
  const bestTime = useMemo(
    () => loadBestTime(session?.name),
    [session?.name, isNewBestTime]
  )
  const hasStartedSession = Boolean(
    session?.startedAt || Number(session?.elapsedSeconds) > 0
  )

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    }
  }, [session])

  useEffect(() => {
    if (!sessionTimerRunning) {
      clearInterval(sessionIntervalRef.current)
      return undefined
    }

    sessionIntervalRef.current = window.setInterval(() => {
      setSession((currentSession) => {
        if (!currentSession) {
          return currentSession
        }

        return {
          ...currentSession,
          elapsedSeconds: Number(currentSession.elapsedSeconds || 0) + 1,
        }
      })
    }, 1000)

    return () => clearInterval(sessionIntervalRef.current)
  }, [sessionTimerRunning])

  useEffect(() => {
    clearTimeout(preparationTimeoutRef.current)

    if (screen !== 'preparation') {
      return undefined
    }

    if (preparationSeconds === 2 && lastPreparationSoundRef.current !== 2) {
      lastPreparationSoundRef.current = 2
      playPreparationBeep()
    }

    if (preparationSeconds === 1 && lastPreparationSoundRef.current !== 1) {
      lastPreparationSoundRef.current = 1
      playPreparationBeep()
    }

    if (preparationSeconds === 0 && lastPreparationSoundRef.current !== 0) {
      lastPreparationSoundRef.current = 0
      playStartBeep()

      preparationTimeoutRef.current = window.setTimeout(() => {
        setScreen('exercise')

        if (currentStep?.type === 'max') {
          setStepTimerRunning(true)
        }
      }, 500)

      return () => clearTimeout(preparationTimeoutRef.current)
    }

    preparationTimeoutRef.current = window.setTimeout(() => {
      setPreparationSeconds((currentValue) => Math.max(0, currentValue - 1))
    }, 1000)

    return () => clearTimeout(preparationTimeoutRef.current)
  }, [screen, preparationSeconds, currentStep?.type])

  useEffect(() => {
    clearInterval(stepIntervalRef.current)

    if (!stepTimerRunning || !currentStep) {
      return undefined
    }

    if (currentStep.type !== 'max' && currentStep.type !== 'rest') {
      return undefined
    }

    stepIntervalRef.current = window.setInterval(() => {
      setSession((currentSession) => {
        if (!currentSession) {
          return currentSession
        }

        const activeStep =
          currentSession.steps[currentSession.currentStepIndex]

        if (!activeStep) {
          return currentSession
        }

        const newRemainingSeconds = Math.max(
          0,
          Number(activeStep.remainingSeconds || 0) - 1
        )

        return updateSessionStep(
          currentSession,
          currentSession.currentStepIndex,
          {
            remainingSeconds: newRemainingSeconds,
            timerStarted: true,
            timerFinished: newRemainingSeconds === 0,
          }
        )
      })
    }, 1000)

    return () => clearInterval(stepIntervalRef.current)
  }, [stepTimerRunning, currentStep?.id, currentStep?.type])

  useEffect(() => {
    if (
      !stepTimerRunning ||
      !currentStep ||
      Number(currentStep.remainingSeconds) !== 0 ||
      automaticAdvanceRef.current
    ) {
      return undefined
    }

    setStepTimerRunning(false)
    playFinishBeep()

    if (currentStep.type === 'max') {
      return undefined
    }

    automaticAdvanceRef.current = true

    const advanceTimeout = window.setTimeout(() => {
      advanceToNextStep()
      automaticAdvanceRef.current = false
    }, 650)

    return () => clearTimeout(advanceTimeout)
  }, [
    stepTimerRunning,
    currentStep?.id,
    currentStep?.type,
    currentStep?.remainingSeconds,
  ])

  useEffect(() => {
    return () => {
      clearInterval(sessionIntervalRef.current)
      clearInterval(stepIntervalRef.current)
      clearTimeout(preparationTimeoutRef.current)
    }
  }, [])

  const startPreparation = () => {
    lastPreparationSoundRef.current = null
    automaticAdvanceRef.current = false
    setPreparationSeconds(PREPARATION_SECONDS)
    setScreen('preparation')
  }

  const startWorkout = async () => {
    if (!session?.steps?.length) {
      return
    }

    await unlockAudio()

    const currentIndex = Number(session.currentStepIndex)
    const storedStep = session.steps[currentIndex]
    const canResumeCurrentStep =
      hasStartedSession &&
      storedStep &&
      ACTIONABLE_TYPES.includes(storedStep.type) &&
      storedStep.completed !== true
    const targetStepIndex = canResumeCurrentStep
      ? currentIndex
      : findFirstActionableStepIndex(session.steps)

    if (targetStepIndex < 0) {
      return
    }

    const targetStep = session.steps[targetStepIndex]

    setSession((currentSession) => ({
      ...currentSession,
      currentStepIndex: targetStepIndex,
      status: 'inProgress',
      startedAt: currentSession.startedAt || new Date().toISOString(),
    }))
    setSessionTimerRunning(true)

    if (canResumeCurrentStep && targetStep.type === 'rest') {
      setScreen('rest')
      setStepTimerRunning(true)
      return
    }

    if (
      canResumeCurrentStep &&
      targetStep.type === 'max' &&
      targetStep.timerStarted &&
      !targetStep.timerFinished
    ) {
      setScreen('exercise')
      setStepTimerRunning(true)
      return
    }

    if (
      canResumeCurrentStep &&
      targetStep.type === 'max' &&
      targetStep.timerFinished
    ) {
      setScreen('exercise')
      return
    }

    startPreparation()
  }

  const markStepCompleted = (currentSession, stepIndex) => {
    return updateSessionStep(currentSession, stepIndex, {
      completed: true,
      completedAt: new Date().toISOString(),
    })
  }

  const advanceToNextStep = () => {
    if (!session) {
      return
    }

    setStepTimerRunning(false)
    let sourceSession = session
    const activeStep = sourceSession.steps[sourceSession.currentStepIndex]

    if (
      activeStep?.type === 'max' &&
      activeStep.maxResultRegistered !== true
    ) {
      if (!activeStep.timerFinished) {
        return
      }

      const maxResult = registerMaxResult({
        maxId: activeStep.maxId,
        maxName: activeStep.maxName,
        exerciseId: activeStep.exerciseId,
        source: 'program',
        weekNumber: sourceSession.weekNumber,
        sessionNumber: sourceSession.sessionNumber,
        durationSeconds: activeStep.durationSeconds,
        repetitions: activeStep.repetitionsCompleted || 0,
        startedAt: activeStep.timerStartedAt || sourceSession.startedAt,
        completedAt: new Date().toISOString(),
        selectedVersion: activeStep.selectedVersion || 'normal',
      })

      if (!maxResult) {
        return
      }

      sourceSession = updateSessionStep(
        sourceSession,
        sourceSession.currentStepIndex,
        {
          maxResultRegistered: true,
          maxResultId: maxResult.id,
          isPersonalBest: maxResult.isPersonalBest,
          bestRepetitions: maxResult.bestRepetitions,
        }
      )
    }

    const completedSession = markStepCompleted(
      sourceSession,
      sourceSession.currentStepIndex
    )
    const nextStepIndex = findNextActionableStepIndex(
      completedSession.steps,
      completedSession.currentStepIndex
    )

    if (nextStepIndex < 0) {
      const achievedNewBest = saveBestTime(
        completedSession.name,
        completedSession.elapsedSeconds
      )

      saveCompletedSession(
        completedSession.weekNumber,
        completedSession.sessionNumber
      )

      const finishedSession = {
        ...completedSession,
        status: 'completed',
        completedAt: new Date().toISOString(),
      }

      setIsNewBestTime(achievedNewBest)
      setSession(finishedSession)
      setSessionTimerRunning(false)
      setScreen('completed')
      playFinishBeep()
      return
    }

    const nextStep = completedSession.steps[nextStepIndex]

    setSession({
      ...completedSession,
      currentStepIndex: nextStepIndex,
      status: 'inProgress',
    })

    if (nextStep.type === 'rest') {
      automaticAdvanceRef.current = false
      setScreen('rest')
      setStepTimerRunning(true)
      return
    }

    startPreparation()
  }

  const goToPreviousExercise = () => {
    if (!session) {
      return
    }

    const previousIndex = findPreviousActionableStepIndex(
      session.steps,
      session.currentStepIndex
    )

    if (previousIndex < 0) {
      return
    }

    setStepTimerRunning(false)
    setSession((currentSession) => ({
      ...currentSession,
      currentStepIndex: previousIndex,
    }))
    setScreen('exercise')
  }

  const changeMaxRepetitions = (value) => {
    setSession((currentSession) => {
      if (!currentSession) {
        return currentSession
      }

      return setMaxRepetitions(
        currentSession,
        currentSession.currentStepIndex,
        value
      )
    })
  }

  const handleImageError = (imageKey) => {
    setImageErrors((currentErrors) => ({
      ...currentErrors,
      [imageKey]: true,
    }))
  }

  const restartSession = () => {
    const newSession = buildSession(weekNumber, sessionNumber)

    clearInterval(sessionIntervalRef.current)
    clearInterval(stepIntervalRef.current)
    clearTimeout(preparationTimeoutRef.current)
    localStorage.removeItem(STORAGE_KEY)
    setSession(newSession)
    setSessionTimerRunning(false)
    setStepTimerRunning(false)
    setPreparationSeconds(PREPARATION_SECONDS)
    setShowExitDialog(false)
    setIsNewBestTime(false)
    setScreen('intro')
  }

  const exitSession = () => {
    clearInterval(sessionIntervalRef.current)
    clearInterval(stepIntervalRef.current)
    clearTimeout(preparationTimeoutRef.current)
    setSessionTimerRunning(false)
    setStepTimerRunning(false)
    setShowExitDialog(false)
    setSession((currentSession) => {
      if (!currentSession) {
        return currentSession
      }

      return {
        ...currentSession,
        status:
          currentSession.status === 'completed' ? 'completed' : 'paused',
      }
    })
    navigate('/programa')
  }

  if (!session) {
    return (
      <main className="training-page">
        <section className="training-error-card">
          <h1>Sesión no encontrada</h1>
          <button
            type="button"
            className="training-main-button"
            onClick={() => navigate('/programa')}
          >
            Volver al programa
          </button>
        </section>
      </main>
    )
  }

  const renderIntro = () => (
    <section className="training-intro-card">
      <div className="training-intro-number">
        {String(session.sessionNumber).padStart(2, '0')}
      </div>
      <p className="training-kicker">
        SEMANA {session.weekNumber} · SESIÓN {session.sessionNumber}
      </p>
      <h1>{session.name}</h1>

      {workoutImage && !imageErrors.workoutOverview && (
        <div className="training-workout-overview">
          <img
            src={workoutImage}
            alt={session.name}
            onError={() => handleImageError('workoutOverview')}
          />
        </div>
      )}

      <div className="training-best-time">
        <span>MEJOR TIEMPO</span>
        <strong>{bestTime ? formatTime(bestTime) : '--:--'}</strong>
        <small>
          {bestTime
            ? 'Este es el tiempo que debes superar'
            : 'Completa la sesión para registrar tu primera marca'}
        </small>
      </div>

      <p className="training-intro-description">
        ¡Prepárate para tu transformación!
      </p>

      <button
        type="button"
        className="training-play-button"
        onClick={startWorkout}
        aria-label={
          hasStartedSession
            ? 'Continuar entrenamiento'
            : 'Comenzar entrenamiento'
        }
      >
        <span className="training-play-triangle" />
      </button>

      <strong className="training-play-label">
        {hasStartedSession
          ? 'CONTINUAR ENTRENAMIENTO'
          : 'COMENZAR ENTRENAMIENTO'}
      </strong>

      {hasStartedSession && (
        <button
          type="button"
          className="training-restart-button"
          onClick={restartSession}
        >
          ↻ REINICIAR SESIÓN DESDE EL PRINCIPIO
        </button>
      )}

      <div className="training-intro-information">
        <article>
          <span>Programa</span>
          <strong>15 semanas</strong>
        </article>
        <article>
          <span>Sesión</span>
          <strong>{session.name}</strong>
        </article>
        <article>
          <span>Preparación</span>
          <strong>5 segundos</strong>
        </article>
      </div>
    </section>
  )

  const renderPreparation = () => {
    const preparationImage =
      currentStep?.selectedVersion === 'modified'
        ? currentStep?.modifiedImage || currentStep?.image
        : currentStep?.image

    return (
      <section className="training-countdown-card">
        <p className="training-kicker">PREPÁRATE</p>
        <h2>
          {currentStep?.exerciseName ||
            currentStep?.maxName ||
            'Siguiente ejercicio'}
        </h2>

        <strong className="training-preparation-repetitions">
          {currentStep?.type === 'exercise' &&
            `${currentStep.repetitions} REPETICIONES`}
          {currentStep?.type === 'run' &&
            formatDistance(currentStep.distanceMeters)}
          {currentStep?.type === 'max' &&
            `MÁXIMAS REPETICIONES · ${formatTime(
              currentStep.durationSeconds
            )}`}
        </strong>

        {preparationImage && (
          <div
            className="training-preparation-image"
            style={{
              backgroundImage: `url("${preparationImage}")`,
            }}
            role="img"
            aria-label={
              currentStep?.exerciseName ||
              currentStep?.maxName ||
              'Ejercicio'
            }
          />
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

    const selectedImage =
      currentStep.selectedVersion === 'modified'
        ? currentStep.modifiedImage || currentStep.image
        : currentStep.image
    const selectedInstructions =
      currentStep.selectedVersion === 'modified'
        ? currentStep.modifiedInstructions || currentStep.instructions
        : currentStep.instructions
    const exerciseImageKey =
      currentStep.id || currentStep.exerciseId || 'exercise'
    const exerciseImageFailed = imageErrors[exerciseImageKey]

    return (
      <section className="training-exercise-card">
        <div className="training-exercise-heading">
          <div>
            <p className="training-kicker">
              {currentStep.type === 'max'
                ? 'MÁXIMAS REPETICIONES'
                : currentStep.roundNumber
                  ? `RONDA ${currentStep.roundNumber} DE ${currentStep.totalRounds}`
                  : currentStep.type === 'run'
                    ? 'CARRERA'
                    : 'EJERCICIO'}
            </p>
            <h2>{currentStep.exerciseName || currentStep.maxName}</h2>
          </div>

          <div className="training-session-clock">
            <span>TIEMPO</span>
            <strong>{formatTime(session.elapsedSeconds)}</strong>
          </div>
        </div>

        {selectedImage && !exerciseImageFailed && (
          <div className="training-exercise-image">
            <img
              src={selectedImage}
              alt={
                currentStep.exerciseName ||
                currentStep.maxName ||
                'Ejercicio'
              }
              onError={() => handleImageError(exerciseImageKey)}
            />
          </div>
        )}

        {currentStep.type === 'max' ? (
          <div className="training-max-timer">
            {formatTime(currentStep.remainingSeconds)}
          </div>
        ) : (
          <div className="training-exercise-target">
            {currentStep.type === 'run'
              ? formatDistance(currentStep.distanceMeters)
              : `${currentStep.repetitions} REPETICIONES`}
          </div>
        )}

        <p className="training-exercise-instructions">
          {selectedInstructions}
        </p>

        {currentStep.shoulderWarning && (
          <div className="training-warning">
            Este ejercicio puede cargar el hombro. Detén la sesión si
            provoca dolor.
          </div>
        )}

        {currentStep.type === 'max' && (
          <>
            <label className="training-repetitions-field">
              <span>Repeticiones realizadas</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={currentStep.repetitionsCompleted || 0}
                onChange={(event) =>
                  changeMaxRepetitions(event.target.value)
                }
                disabled={!currentStep.timerFinished}
              />
            </label>

            <button
              type="button"
              className="training-main-button"
              onClick={advanceToNextStep}
              disabled={!currentStep.timerFinished}
            >
              {currentStep.timerFinished
                ? 'GUARDAR RESULTADO Y CONTINUAR'
                : 'MAX EN CURSO'}
            </button>
          </>
        )}

        {currentStep.type !== 'max' && (
          <button
            type="button"
            className="training-main-button"
            onClick={advanceToNextStep}
          >
            EJERCICIO COMPLETADO
            <span aria-hidden="true">→</span>
          </button>
        )}
      </section>
    )
  }

  const renderRest = () => (
    <section className="training-rest-card">
      <p className="training-kicker">DESCANSO</p>
      <div className="training-rest-timer">
        {formatTime(currentStep?.remainingSeconds)}
      </div>
      <p>
        Recupera el ritmo respiratorio. Al terminar aparecerán los 5
        segundos de preparación del siguiente ejercicio.
      </p>
      <button
        type="button"
        className="training-secondary-button"
        onClick={advanceToNextStep}
      >
        OMITIR DESCANSO
      </button>
    </section>
  )

  const renderCompleted = () => (
    <section className="training-completed-card">
      <div className="training-completed-icon">✓</div>
      <p className="training-kicker">SESIÓN COMPLETADA</p>
      <h1>{session.name}</h1>

      {isNewBestTime && (
        <div className="training-best-time">
          <span>NUEVO MEJOR TIEMPO</span>
          <strong>{formatTime(session.elapsedSeconds)}</strong>
          <small>Has superado tu marca anterior</small>
        </div>
      )}

      <div className="training-completed-time">
        <span>Tiempo total</span>
        <strong>{formatTime(session.elapsedSeconds)}</strong>
      </div>

      <button
        type="button"
        className="training-main-button"
        onClick={() => navigate('/programa')}
      >
        VOLVER AL PROGRAMA
      </button>
      <button
        type="button"
        className="training-text-button"
        onClick={restartSession}
      >
        Repetir esta sesión
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
            aria-label="Salir de la sesión"
          >
            ✕
          </button>
          <div>
            <span>
              SEMANA {session.weekNumber} · SESIÓN {session.sessionNumber}
            </span>
            <strong>{session.name}</strong>
          </div>
          <time>{formatTime(session.elapsedSeconds)}</time>
        </header>

        {screen !== 'intro' && screen !== 'completed' && (
          <section className="training-progress">
            <div>
              <span>Progreso</span>
              <strong>{progress.percentage} %</strong>
            </div>
            <div className="training-progress-track">
              <span style={{ width: `${progress.percentage}%` }} />
            </div>
          </section>
        )}

        {screen === 'intro' && renderIntro()}
        {screen === 'preparation' && renderPreparation()}
        {screen === 'exercise' && renderExercise()}
        {screen === 'rest' && renderRest()}
        {screen === 'completed' && renderCompleted()}

        {screen === 'exercise' &&
          findPreviousActionableStepIndex(
            session.steps,
            session.currentStepIndex
          ) !== -1 && (
            <button
              type="button"
              className="training-previous-button"
              onClick={goToPreviousExercise}
            >
              ← Ejercicio anterior
            </button>
          )}
      </section>

      {showExitDialog && (
        <div className="training-dialog-overlay">
          <section className="training-dialog">
            <p className="training-kicker">SALIR DE LA SESIÓN</p>
            <h2>¿Quieres salir?</h2>
            <p>
              El progreso quedará guardado y podrás continuar la sesión
              más tarde.
            </p>
            <button
              type="button"
              className="training-danger-button"
              onClick={exitSession}
            >
              GUARDAR Y SALIR
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

export default ActivityPage
