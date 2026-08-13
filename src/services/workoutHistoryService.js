// src/services/workoutHistoryService.js

const HISTORY_STORAGE_KEY = 'freeletics-workout-history'
const BEST_TIMES_STORAGE_KEY = 'freeletics-best-times'

const VALID_SOURCES = ['program', 'standalone']

const createHistoryId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const normalizeWorkoutId = (workoutId) => {
  return String(workoutId || '')
    .trim()
    .toLowerCase()
}

const readJsonStorage = (storageKey, fallbackValue) => {
  try {
    const storedValue = localStorage.getItem(storageKey)

    if (!storedValue) {
      return fallbackValue
    }

    return JSON.parse(storedValue)
  } catch (error) {
    console.error(
      `No se pudo leer ${storageKey} desde localStorage:`,
      error
    )

    return fallbackValue
  }
}

const writeJsonStorage = (storageKey, value) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(
      `No se pudo guardar ${storageKey} en localStorage:`,
      error
    )

    return false
  }
}

/* =========================================================
   HISTORIAL COMPLETO
   ========================================================= */

export const getWorkoutHistory = () => {
  const storedHistory = readJsonStorage(HISTORY_STORAGE_KEY, [])

  return Array.isArray(storedHistory) ? storedHistory : []
}

export const saveWorkoutHistory = (history) => {
  if (!Array.isArray(history)) {
    return false
  }

  return writeJsonStorage(HISTORY_STORAGE_KEY, history)
}

export const clearWorkoutHistory = () => {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY)
    return true
  } catch (error) {
    console.error('No se pudo borrar el historial:', error)
    return false
  }
}

/* =========================================================
   MEJORES TIEMPOS
   ========================================================= */

export const getBestTimes = () => {
  const storedTimes = readJsonStorage(BEST_TIMES_STORAGE_KEY, {})

  if (
    !storedTimes ||
    typeof storedTimes !== 'object' ||
    Array.isArray(storedTimes)
  ) {
    return {}
  }

  return storedTimes
}

export const getWorkoutBestTime = (workoutId) => {
  const normalizedWorkoutId = normalizeWorkoutId(workoutId)

  if (!normalizedWorkoutId) {
    return null
  }

  const bestTimes = getBestTimes()
  const storedTime = Number(bestTimes[normalizedWorkoutId])

  return storedTime > 0 ? storedTime : null
}

export const updateWorkoutBestTime = (
  workoutId,
  elapsedSeconds
) => {
  const normalizedWorkoutId = normalizeWorkoutId(workoutId)
  const numericTime = Number(elapsedSeconds)

  if (!normalizedWorkoutId || numericTime <= 0) {
    return {
      updated: false,
      previousBestSeconds: null,
      bestTimeSeconds: null,
    }
  }

  const bestTimes = getBestTimes()
  const previousBestSeconds =
    Number(bestTimes[normalizedWorkoutId]) || null

  const isNewPersonalBest =
    !previousBestSeconds || numericTime < previousBestSeconds

  if (isNewPersonalBest) {
    bestTimes[normalizedWorkoutId] = numericTime

    writeJsonStorage(BEST_TIMES_STORAGE_KEY, bestTimes)
  }

  return {
    updated: isNewPersonalBest,
    previousBestSeconds,
    bestTimeSeconds: isNewPersonalBest
      ? numericTime
      : previousBestSeconds,
  }
}

/* =========================================================
   REGISTRAR UN WORKOUT COMPLETADO
   ========================================================= */

export const registerWorkoutResult = ({
  workoutId,
  workoutName,
  source = 'standalone',
  weekNumber = null,
  sessionNumber = null,
  startedAt = null,
  completedAt = null,
  elapsedSeconds,
  completedWithModifiedExercises = false,
}) => {
  const normalizedWorkoutId = normalizeWorkoutId(workoutId)
  const numericTime = Number(elapsedSeconds)

  if (!normalizedWorkoutId) {
    console.error('No se puede registrar un workout sin workoutId')
    return null
  }

  if (numericTime <= 0) {
    console.error(
      'No se puede registrar un workout sin un tiempo válido'
    )
    return null
  }

  const normalizedSource = VALID_SOURCES.includes(source)
    ? source
    : 'standalone'

  const bestTimeResult = updateWorkoutBestTime(
    normalizedWorkoutId,
    numericTime
  )

  const result = {
    id: createHistoryId(),

    workoutId: normalizedWorkoutId,
    workoutName: String(workoutName || normalizedWorkoutId),

    source: normalizedSource,

    weekNumber:
      weekNumber === null ? null : Number(weekNumber),

    sessionNumber:
      sessionNumber === null ? null : Number(sessionNumber),

    startedAt:
      startedAt || new Date(Date.now() - numericTime * 1000).toISOString(),

    completedAt: completedAt || new Date().toISOString(),

    elapsedSeconds: numericTime,

    previousBestSeconds:
      bestTimeResult.previousBestSeconds,

    bestTimeSeconds:
      bestTimeResult.bestTimeSeconds,

    isPersonalBest:
      bestTimeResult.updated,

    completedWithModifiedExercises:
      completedWithModifiedExercises === true,
  }

  const history = getWorkoutHistory()

  history.push(result)

  const saved = saveWorkoutHistory(history)

  if (!saved) {
    return null
  }

  return result
}

/* =========================================================
   CONSULTAS POR WORKOUT
   ========================================================= */

export const getWorkoutResults = (workoutId) => {
  const normalizedWorkoutId = normalizeWorkoutId(workoutId)

  if (!normalizedWorkoutId) {
    return []
  }

  return getWorkoutHistory()
    .filter(
      (result) =>
        normalizeWorkoutId(result.workoutId) ===
        normalizedWorkoutId
    )
    .sort((resultA, resultB) => {
      const dateA = new Date(resultA.completedAt).getTime()
      const dateB = new Date(resultB.completedAt).getTime()

      return dateB - dateA
    })
}

export const getWorkoutLastResult = (workoutId) => {
  const results = getWorkoutResults(workoutId)

  return results[0] || null
}

export const getWorkoutCompletionCount = (workoutId) => {
  return getWorkoutResults(workoutId).length
}

export const getWorkoutStatistics = (workoutId) => {
  const normalizedWorkoutId = normalizeWorkoutId(workoutId)
  const results = getWorkoutResults(normalizedWorkoutId)
  const bestTimeSeconds = getWorkoutBestTime(normalizedWorkoutId)
  const lastResult = results[0] || null

  const totalTimeSeconds = results.reduce(
    (total, result) =>
      total + Number(result.elapsedSeconds || 0),
    0
  )

  const averageTimeSeconds =
    results.length === 0
      ? null
      : Math.round(totalTimeSeconds / results.length)

  const standaloneCount = results.filter(
    (result) => result.source === 'standalone'
  ).length

  const programCount = results.filter(
    (result) => result.source === 'program'
  ).length

  return {
    workoutId: normalizedWorkoutId,
    completedCount: results.length,
    standaloneCount,
    programCount,
    bestTimeSeconds,
    lastTimeSeconds:
      Number(lastResult?.elapsedSeconds) || null,
    averageTimeSeconds,
    lastCompletedAt:
      lastResult?.completedAt || null,
    lastResult,
  }
}

/* =========================================================
   CONSULTAS GENERALES
   ========================================================= */

export const getRecentWorkoutResults = (limit = 10) => {
  const numericLimit = Math.max(1, Number(limit) || 10)

  return getWorkoutHistory()
    .sort((resultA, resultB) => {
      const dateA = new Date(resultA.completedAt).getTime()
      const dateB = new Date(resultB.completedAt).getTime()

      return dateB - dateA
    })
    .slice(0, numericLimit)
}

export const getPersonalBestResults = () => {
  return getWorkoutHistory()
    .filter((result) => result.isPersonalBest === true)
    .sort((resultA, resultB) => {
      const dateA = new Date(resultA.completedAt).getTime()
      const dateB = new Date(resultB.completedAt).getTime()

      return dateB - dateA
    })
}

/* =========================================================
   ELIMINAR RESULTADOS
   ========================================================= */

export const deleteWorkoutResult = (resultId) => {
  if (!resultId) {
    return false
  }

  const currentHistory = getWorkoutHistory()

  const updatedHistory = currentHistory.filter(
    (result) => result.id !== resultId
  )

  if (updatedHistory.length === currentHistory.length) {
    return false
  }

  const saved = saveWorkoutHistory(updatedHistory)

  if (!saved) {
    return false
  }

  rebuildBestTimesFromHistory()

  return true
}

export const rebuildBestTimesFromHistory = () => {
  const history = getWorkoutHistory()
  const rebuiltBestTimes = {}

  history.forEach((result) => {
    const workoutId = normalizeWorkoutId(result.workoutId)
    const elapsedSeconds = Number(result.elapsedSeconds)

    if (!workoutId || elapsedSeconds <= 0) {
      return
    }

    const currentBest = Number(rebuiltBestTimes[workoutId])

    if (!currentBest || elapsedSeconds < currentBest) {
      rebuiltBestTimes[workoutId] = elapsedSeconds
    }
  })

  writeJsonStorage(
    BEST_TIMES_STORAGE_KEY,
    rebuiltBestTimes
  )

  return rebuiltBestTimes
}

export default {
  getWorkoutHistory,
  saveWorkoutHistory,
  clearWorkoutHistory,
  getBestTimes,
  getWorkoutBestTime,
  updateWorkoutBestTime,
  registerWorkoutResult,
  getWorkoutResults,
  getWorkoutLastResult,
  getWorkoutCompletionCount,
  getWorkoutStatistics,
  getRecentWorkoutResults,
  getPersonalBestResults,
  deleteWorkoutResult,
  rebuildBestTimesFromHistory,
}