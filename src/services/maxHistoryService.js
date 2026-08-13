// src/services/maxHistoryService.js

const MAX_HISTORY_STORAGE_KEY = 'freeletics-max-history'
const MAX_BEST_RESULTS_STORAGE_KEY = 'freeletics-max-best-results'

const VALID_SOURCES = ['program', 'standalone']

const normalizeMaxId = (maxId) => {
  return String(maxId || '').trim()
}

const createResultId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const readJsonStorage = (storageKey, fallbackValue) => {
  try {
    const storedValue = localStorage.getItem(storageKey)

    if (!storedValue) {
      return fallbackValue
    }

    return JSON.parse(storedValue)
  } catch (error) {
    console.error(`No se pudo leer ${storageKey}:`, error)
    return fallbackValue
  }
}

const writeJsonStorage = (storageKey, value) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`No se pudo guardar ${storageKey}:`, error)
    return false
  }
}

const isValidMaxResult = (result) => {
  const repetitions = Number(result?.repetitions)

  return Boolean(
    result &&
      normalizeMaxId(result.maxId) &&
      Number.isFinite(repetitions) &&
      repetitions >= 0
  )
}

const sortByDateDescending = (resultA, resultB) => {
  const dateA = new Date(resultA.completedAt).getTime() || 0
  const dateB = new Date(resultB.completedAt).getTime() || 0

  return dateB - dateA
}

const sortByRepetitionsDescending = (resultA, resultB) => {
  const repetitionsDifference =
    Number(resultB.repetitions) - Number(resultA.repetitions)

  if (repetitionsDifference !== 0) {
    return repetitionsDifference
  }

  return sortByDateDescending(resultA, resultB)
}

/* =========================================================
   HISTORIAL COMPLETO
   ========================================================= */

export const getMaxHistory = () => {
  const storedHistory = readJsonStorage(MAX_HISTORY_STORAGE_KEY, [])

  return Array.isArray(storedHistory)
    ? storedHistory.filter(isValidMaxResult)
    : []
}

export const saveMaxHistory = (history) => {
  if (!Array.isArray(history)) {
    return false
  }

  return writeJsonStorage(
    MAX_HISTORY_STORAGE_KEY,
    history.filter(isValidMaxResult)
  )
}

export const clearMaxHistory = () => {
  try {
    localStorage.removeItem(MAX_HISTORY_STORAGE_KEY)
    localStorage.removeItem(MAX_BEST_RESULTS_STORAGE_KEY)
    return true
  } catch (error) {
    console.error('No se pudo borrar el historial MAX:', error)
    return false
  }
}

/* =========================================================
   MEJORES RESULTADOS Y PODIO
   ========================================================= */

export const getMaxBestResults = () => {
  const storedResults = readJsonStorage(
    MAX_BEST_RESULTS_STORAGE_KEY,
    {}
  )

  if (
    !storedResults ||
    typeof storedResults !== 'object' ||
    Array.isArray(storedResults)
  ) {
    return {}
  }

  return storedResults
}

export const getMaxBestResult = (maxId) => {
  const normalizedMaxId = normalizeMaxId(maxId)

  if (!normalizedMaxId) {
    return null
  }

  const bestResults = getMaxBestResults()

  if (bestResults[normalizedMaxId] === undefined) {
    return null
  }

  const repetitions = Number(bestResults[normalizedMaxId])

  return Number.isFinite(repetitions) && repetitions >= 0
    ? repetitions
    : null
}

export const getMaxTopResults = (maxId, limit = 3) => {
  const normalizedMaxId = normalizeMaxId(maxId)
  const numericLimit = Math.max(1, Number(limit) || 3)

  if (!normalizedMaxId) {
    return []
  }

  return getMaxHistory()
    .filter((result) => result.maxId === normalizedMaxId)
    .sort(sortByRepetitionsDescending)
    .slice(0, numericLimit)
    .map((result, index) => ({
      ...result,
      position: index + 1,
    }))
}

export const getMaxTopThree = (maxId) => {
  return getMaxTopResults(maxId, 3)
}

export const updateMaxBestResult = (maxId, repetitions) => {
  const normalizedMaxId = normalizeMaxId(maxId)
  const numericRepetitions = Number(repetitions)

  if (
    !normalizedMaxId ||
    !Number.isFinite(numericRepetitions) ||
    numericRepetitions < 0
  ) {
    return {
      updated: false,
      previousBestRepetitions: null,
      bestRepetitions: null,
    }
  }

  const bestResults = getMaxBestResults()
  const hasPreviousBest =
    bestResults[normalizedMaxId] !== undefined
  const previousBestRepetitions = hasPreviousBest
    ? Number(bestResults[normalizedMaxId])
    : null
  const isNewPersonalBest =
    previousBestRepetitions === null ||
    numericRepetitions > previousBestRepetitions

  if (isNewPersonalBest) {
    bestResults[normalizedMaxId] = numericRepetitions
    writeJsonStorage(MAX_BEST_RESULTS_STORAGE_KEY, bestResults)
  }

  return {
    updated: isNewPersonalBest,
    previousBestRepetitions,
    bestRepetitions: isNewPersonalBest
      ? numericRepetitions
      : previousBestRepetitions,
  }
}

/* =========================================================
   REGISTRAR UN MAX COMPLETADO
   ========================================================= */

export const registerMaxResult = ({
  maxId,
  maxName,
  exerciseId,
  source = 'standalone',
  weekNumber = null,
  sessionNumber = null,
  durationSeconds,
  repetitions,
  startedAt = null,
  completedAt = null,
  selectedVersion = 'normal',
}) => {
  const normalizedMaxId = normalizeMaxId(maxId)
  const numericRepetitions = Number(repetitions)
  const numericDuration = Number(durationSeconds)

  if (!normalizedMaxId) {
    console.error('No se puede registrar un MAX sin maxId')
    return null
  }

  if (
    !Number.isFinite(numericRepetitions) ||
    numericRepetitions < 0
  ) {
    console.error('El número de repeticiones MAX no es válido')
    return null
  }

  if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
    console.error('La duración del MAX no es válida')
    return null
  }

  const normalizedSource = VALID_SOURCES.includes(source)
    ? source
    : 'standalone'
  const bestResult = updateMaxBestResult(
    normalizedMaxId,
    numericRepetitions
  )

  const result = {
    id: createResultId(),
    maxId: normalizedMaxId,
    maxName: String(maxName || normalizedMaxId),
    exerciseId: String(exerciseId || ''),
    source: normalizedSource,
    weekNumber: weekNumber === null ? null : Number(weekNumber),
    sessionNumber:
      sessionNumber === null ? null : Number(sessionNumber),
    durationSeconds: numericDuration,
    repetitions: numericRepetitions,
    previousBestRepetitions:
      bestResult.previousBestRepetitions,
    bestRepetitions: bestResult.bestRepetitions,
    isPersonalBest: bestResult.updated,
    selectedVersion:
      selectedVersion === 'modified' ? 'modified' : 'normal',
    startedAt:
      startedAt ||
      new Date(Date.now() - numericDuration * 1000).toISOString(),
    completedAt: completedAt || new Date().toISOString(),
  }

  const history = getMaxHistory()
  history.push(result)

  if (!saveMaxHistory(history)) {
    return null
  }

  return result
}

/* =========================================================
   CONSULTAS POR MAX
   ========================================================= */

export const getMaxResults = (maxId) => {
  const normalizedMaxId = normalizeMaxId(maxId)

  if (!normalizedMaxId) {
    return []
  }

  return getMaxHistory()
    .filter((result) => result.maxId === normalizedMaxId)
    .sort(sortByDateDescending)
}

export const getMaxLastResult = (maxId) => {
  return getMaxResults(maxId)[0] || null
}

export const getMaxStatistics = (maxId) => {
  const normalizedMaxId = normalizeMaxId(maxId)
  const results = getMaxResults(normalizedMaxId)
  const topResults = getMaxTopThree(normalizedMaxId)
  const lastResult = results[0] || null
  const bestRepetitions = topResults[0]?.repetitions ?? null
  const totalRepetitions = results.reduce(
    (total, result) => total + Number(result.repetitions || 0),
    0
  )
  const averageRepetitions =
    results.length === 0
      ? null
      : Math.round(totalRepetitions / results.length)

  return {
    maxId: normalizedMaxId,
    completedCount: results.length,
    standaloneCount: results.filter(
      (result) => result.source === 'standalone'
    ).length,
    programCount: results.filter(
      (result) => result.source === 'program'
    ).length,
    bestRepetitions,
    topResults,
    lastRepetitions:
      lastResult === null ? null : Number(lastResult.repetitions),
    averageRepetitions,
    lastCompletedAt: lastResult?.completedAt || null,
    lastResult,
  }
}

/* =========================================================
   CONSULTAS GENERALES
   ========================================================= */

export const getRecentMaxResults = (limit = 10) => {
  const numericLimit = Math.max(1, Number(limit) || 10)

  return getMaxHistory()
    .sort(sortByDateDescending)
    .slice(0, numericLimit)
}

/* =========================================================
   ELIMINAR Y RECALCULAR
   ========================================================= */

export const rebuildMaxBestResults = () => {
  const bestResults = {}

  getMaxHistory().forEach((result) => {
    const maxId = normalizeMaxId(result.maxId)
    const repetitions = Number(result.repetitions)

    if (
      !maxId ||
      !Number.isFinite(repetitions) ||
      repetitions < 0
    ) {
      return
    }

    if (
      bestResults[maxId] === undefined ||
      repetitions > bestResults[maxId]
    ) {
      bestResults[maxId] = repetitions
    }
  })

  writeJsonStorage(MAX_BEST_RESULTS_STORAGE_KEY, bestResults)

  return bestResults
}

export const deleteMaxResult = (resultId) => {
  if (!resultId) {
    return false
  }

  const currentHistory = getMaxHistory()
  const updatedHistory = currentHistory.filter(
    (result) => result.id !== resultId
  )

  if (updatedHistory.length === currentHistory.length) {
    return false
  }

  if (!saveMaxHistory(updatedHistory)) {
    return false
  }

  rebuildMaxBestResults()
  return true
}

export const deleteMaxResults = (maxId) => {
  const normalizedMaxId = normalizeMaxId(maxId)

  if (!normalizedMaxId) {
    return false
  }

  const currentHistory = getMaxHistory()
  const updatedHistory = currentHistory.filter(
    (result) => result.maxId !== normalizedMaxId
  )

  if (updatedHistory.length === currentHistory.length) {
    return false
  }

  if (!saveMaxHistory(updatedHistory)) {
    return false
  }

  rebuildMaxBestResults()
  return true
}

export default {
  getMaxHistory,
  saveMaxHistory,
  clearMaxHistory,
  getMaxBestResults,
  getMaxBestResult,
  getMaxTopResults,
  getMaxTopThree,
  updateMaxBestResult,
  registerMaxResult,
  getMaxResults,
  getMaxLastResult,
  getMaxStatistics,
  getRecentMaxResults,
  rebuildMaxBestResults,
  deleteMaxResult,
  deleteMaxResults,
}
