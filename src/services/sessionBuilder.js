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
    id: createId(
      workout.id,
      roundNumber || 0,
      exercise.id,
      position
    ),
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
    id: createId(
      workout.id,
      roundNumber || 0,
      'running',
      position
    ),
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

  if (Array.isArray(workout.initialSteps)) {
    workout.initialSteps.forEach((step, index) => {
      const builtStep = buildWorkoutContentStep({
        step,
        workout,
        roundNumber: null,
        totalRounds,
        position: createId(occurrence, 'initial', index + 1),
      })

      if (builtStep) {
        result.push(builtStep)
      }
    })
  }

  if (Array.isArray(workout.rounds)) {
    workout.rounds.forEach((round) => {
      round.steps.forEach((step, index) => {
        const builtStep = buildWorkoutContentStep({
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

        if (builtStep) {
          result.push(builtStep)
        }
      })
    })
  }

  if (Array.isArray(workout.finalSteps)) {
    workout.finalSteps.forEach((step, index) => {
      const builtStep = buildWorkoutContentStep({
        step,
        workout,
        roundNumber: null,
        totalRounds,
        position: createId(occurrence, 'final', index + 1),
      })

      if (builtStep) {
        result.push(builtStep)
      }
    })
  }

  return result
}

const buildMaxStep = (maxId, occurrence = 1) => {
  const maxExercise = getMaxExercise(maxId)

  if (!maxExercise) {
    console.warn(`Entrenamiento MAX no encontrado: ${maxId}`)
    return null
  }

  const exercise = getExercise(maxExercise.exerciseId)

  if (!exercise) {
    console.warn(
      `Ejercicio no encontrado para ${maxExercise.name}`
    )
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
  return {
    id: createId('rest', occurrence),
    type: 'rest',
    name: 'Descanso',
    durationSeconds,
    remainingSeconds: durationSeconds,
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

      const workoutSteps = buildWorkoutSteps(
        step.workoutId,
        workoutOccurrences[step.workoutId]
      )

      steps.push(...workoutSteps)
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

      steps.push(
        buildRestStep(step.durationSeconds, restOccurrence)
      )
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
    steps,
    totalSteps: steps.length,
  }
}

export const updateSessionStep = (
  session,
  stepIndex,
  changes
) => {
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
    steps: session.steps.map((step, index) => {
      if (index !== parsedIndex) {
        return step
      }

      return {
        ...step,
        ...changes,
      }
    }),
  }
}

export const setMaxRepetitions = (
  session,
  stepIndex,
  repetitions
) => {
  const numericRepetitions = Math.max(
    0,
    Number(repetitions) || 0
  )

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