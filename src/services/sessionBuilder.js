// src/services/sessionBuilder.js

import {
  getExercise,
  getMaxExercise,
  getSession,
  getWorkout,
} from '../data/freeleticsProgram'

const createId = (...parts) => {
  return parts
    .filter((part) => part !== undefined && part !== null)
    .join('-')
}

const buildExerciseStep = ({
  step,
  workout,
  roundNumber,
  totalRounds,
  position,
}) => {
  const exercise = getExercise(step.exerciseId)

  if (!exercise) {
    console.warn(`Ejercicio no encontrado: ${step.exerciseId}`)
    return null
  }

  return {
    id: createId(workout.id, roundNumber || 0, exercise.id, position),
    type: 'exercise',
    workoutId: workout.id,
    workoutName: workout.name,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    exerciseShortName: exercise.shortName,
    repetitions: step.repetitions,
    measurement: exercise.measurement,
    roundNumber: roundNumber || null,
    totalRounds: totalRounds || null,
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
  }
}

const buildRunStep = ({
  step,
  workout,
  roundNumber,
  totalRounds,
  position,
}) => {
  const running = getExercise('running')

  if (!running) {
    console.warn('No se ha encontrado el ejercicio running')
    return null
  }

  return {
    id: createId(workout.id, roundNumber || 0, 'running', position),
    type: 'run',
    workoutId: workout.id,
    workoutName: workout.name,
    exerciseId: running.id,
    exerciseName: running.name,
    exerciseShortName: running.shortName,
    distanceMeters: step.distanceMeters,
    measurement: 'distance',
    roundNumber: roundNumber || null,
    totalRounds: totalRounds || null,
    image: running.image,
    modifiedImage: running.modifiedImage,
    instructions: running.instructions,
    modifiedInstructions: running.modifiedInstructions,
    shoulderWarning: false,
    allowModifiedVersion: Boolean(
      running.modifiedImage || running.modifiedInstructions
    ),
    selectedVersion: 'normal',
    completed: false,
  }
}

const buildWorkoutRestStep = ({
  step,
  workout,
  roundNumber,
  totalRounds,
  position,
}) => {
  const durationSeconds = Math.max(
    1,
    Number(step.durationSeconds) || 0
  )

  return {
    id: createId(
      workout.id,
      roundNumber || 0,
      'rest',
      position
    ),
    type: 'rest',
    name: 'Descanso',
    workoutId: workout.id,
    workoutName: workout.name,
    durationSeconds,
    remainingSeconds: durationSeconds,
    roundNumber: roundNumber || null,
    totalRounds: totalRounds || null,
    timerStarted: false,
    timerFinished: false,
    completed: false,
  }
}

const buildWorkoutContentStep = ({
  step,
  workout,
  roundNumber,
  totalRounds,
  position,
}) => {
  if (step.type === 'exercise') {
    return buildExerciseStep({
      step,
      workout,
      roundNumber,
      totalRounds,
      position,
    })
  }

  if (step.type === 'run') {
    return buildRunStep({
      step,
      workout,
      roundNumber,
      totalRounds,
      position,
    })
  }

  if (step.type === 'rest') {
    return buildWorkoutRestStep({
      step,
      workout,
      roundNumber,
      totalRounds,
      position,
    })
  }

  return null
}

const buildWorkoutSteps = (workoutId, occurrence = 1) => {
  const workout = getWorkout(workoutId)

  if (!workout) {
    console.warn(`Workout no encontrado: ${workoutId}`)
    return []
  }

  const result = []
  const totalRounds = workout.rounds?.length || 0
  const workoutOccurrenceId = createId(workout.id, occurrence)

  const addBuiltStep = (stepData) => {
    const builtStep = buildWorkoutContentStep(stepData)

    if (builtStep) {
      result.push(builtStep)
    }
  }

  if (Array.isArray(workout.initialSteps)) {
    workout.initialSteps.forEach((step, index) => {
      addBuiltStep({
        step,
        workout,
        roundNumber: null,
        totalRounds,
        position: createId(occurrence, 'initial', index + 1),
      })
    })
  }

  if (Array.isArray(workout.rounds)) {
    workout.rounds.forEach((round) => {
      if (!Array.isArray(round.steps)) {
        return
      }

      round.steps.forEach((step, index) => {
        addBuiltStep({
          step,
          workout,
          roundNumber: round.round,
          totalRounds,
          position: createId(
            occurrence,
            'round',
            round.round,
            index + 1
          ),
        })
      })
    })
  }

  if (Array.isArray(workout.finalSteps)) {
    workout.finalSteps.forEach((step, index) => {
      addBuiltStep({
        step,
        workout,
        roundNumber: null,
        totalRounds,
        position: createId(occurrence, 'final', index + 1),
      })
    })
  }

  return result.map((step, index) => ({
    ...step,
    workoutOccurrenceId,
    workoutOccurrence: occurrence,
    workoutFirstStep: index === 0,
    workoutLastStep: index === result.length - 1,
    workoutResultRegistered: false,
  }))
}

const buildMaxStep = (maxId, occurrence = 1) => {
  const maxExercise = getMaxExercise(maxId)

  if (!maxExercise) {
    console.warn(`Entrenamiento MAX no encontrado: ${maxId}`)
    return null
  }

  const exercise = getExercise(maxExercise.exerciseId)

  if (!exercise) {
    console.warn(`Ejercicio no encontrado para ${maxExercise.name}`)
    return null
  }

  return {
    id: createId(maxId, occurrence),
    type: 'max',
    maxId: maxExercise.id,
    maxName: maxExercise.name,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    exerciseShortName: exercise.shortName,
    durationSeconds: maxExercise.durationSeconds,
    remainingSeconds: maxExercise.durationSeconds,
    measurement: maxExercise.measurement,
    image: exercise.image,
    modifiedImage: exercise.modifiedImage,
    instructions: exercise.instructions,
    modifiedInstructions: exercise.modifiedInstructions,
    shoulderWarning: exercise.shoulderWarning === true,
    allowModifiedVersion: Boolean(
      exercise.modifiedImage || exercise.modifiedInstructions
    ),
    selectedVersion: 'normal',
    repetitionsCompleted: 0,
    timerStarted: false,
    timerFinished: false,
    completed: false,
  }
}

const buildRestStep = (durationSeconds, occurrence = 1) => {
  const safeDuration = Math.max(1, Number(durationSeconds) || 0)

  return {
    id: createId('rest', occurrence),
    type: 'rest',
    name: 'Descanso',
    durationSeconds: safeDuration,
    remainingSeconds: safeDuration,
    timerStarted: false,
    timerFinished: false,
    completed: false,
  }
}

export const buildSession = (weekNumber, sessionNumber) => {
  const sessionData = getSession(weekNumber, sessionNumber)

  if (!sessionData) {
    console.warn(
      `Sesión no encontrada: semana ${weekNumber}, sesión ${sessionNumber}`
    )
    return null
  }

  const workoutOccurrences = {}
  const maxOccurrences = {}
  let restOccurrence = 0
  const steps = []

  sessionData.steps.forEach((step) => {
    if (step.type === 'workout') {
      workoutOccurrences[step.workoutId] =
        (workoutOccurrences[step.workoutId] || 0) + 1

      steps.push(
        ...buildWorkoutSteps(
          step.workoutId,
          workoutOccurrences[step.workoutId]
        )
      )
      return
    }

    if (step.type === 'max') {
      maxOccurrences[step.maxId] =
        (maxOccurrences[step.maxId] || 0) + 1

      const maxStep = buildMaxStep(
        step.maxId,
        maxOccurrences[step.maxId]
      )

      if (maxStep) {
        steps.push(maxStep)
      }
      return
    }

    if (step.type === 'rest') {
      restOccurrence += 1
      steps.push(buildRestStep(step.durationSeconds, restOccurrence))
    }
  })

  return {
    id: createId('week', weekNumber, 'session', sessionNumber),
    weekNumber: Number(weekNumber),
    sessionNumber: Number(sessionNumber),
    name: sessionData.name,
    isHellDay: sessionData.isHellDay === true,
    isHellWeek: sessionData.isHellWeek === true,
    restDayAfterRecommended:
      sessionData.restDayAfterRecommended === true,
    status: 'notStarted',
    currentStepIndex: 0,
    startedAt: null,
    completedAt: null,
    elapsedSeconds: 0,
    workoutTracking: {},
    steps,
    totalSteps: steps.length,
  }
}

export const updateSessionStep = (session, stepIndex, changes) => {
  if (!session || !Array.isArray(session.steps)) {
    return session
  }

  const parsedIndex = Number(stepIndex)

  if (
    !Number.isInteger(parsedIndex) ||
    parsedIndex < 0 ||
    parsedIndex >= session.steps.length
  ) {
    return session
  }

  return {
    ...session,
    steps: session.steps.map((step, index) =>
      index === parsedIndex ? { ...step, ...changes } : step
    ),
  }
}

export const setMaxRepetitions = (
  session,
  stepIndex,
  repetitions
) => {
  const numericRepetitions = Math.max(0, Number(repetitions) || 0)

  return updateSessionStep(session, stepIndex, {
    repetitionsCompleted: numericRepetitions,
  })
}

export const getSessionProgress = (session) => {
  if (!session || !Array.isArray(session.steps)) {
    return {
      completedSteps: 0,
      totalSteps: 0,
      percentage: 0,
    }
  }

  const relevantSteps = session.steps.filter((step) =>
    ['exercise', 'run', 'max', 'rest'].includes(step.type)
  )
  const completedSteps = relevantSteps.filter(
    (step) => step.completed === true
  ).length
  const totalSteps = relevantSteps.length
  const percentage =
    totalSteps === 0
      ? 0
      : Math.round((completedSteps / totalSteps) * 100)

  return {
    completedSteps,
    totalSteps,
    percentage,
  }
}

export default buildSession
