import { getExerciseById } from '../data/exercises'

const WORKOUTS_KEY = 'fithome_generated_workouts'

function leerJsonLocalStorage(clave, valorInicial) {
  try {
    const datosGuardados = localStorage.getItem(clave)

    if (!datosGuardados) {
      return valorInicial
    }

    return JSON.parse(datosGuardados)
  } catch {
    return valorInicial
  }
}

function guardarJsonLocalStorage(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos))
}

function obtenerEquipamientoDisponible() {
  const equipamiento = leerJsonLocalStorage(
    'fithome_equipment_draft',
    {},
  )

  const disponible = ['peso-corporal']

  if (equipamiento.esterilla) {
    disponible.push('esterilla')
  }

  if (equipamiento.trx) {
    disponible.push('trx')
  }

  if (equipamiento.comba) {
    disponible.push('comba')
  }

  if (equipamiento.mancuernas) {
    disponible.push('mancuernas')
  }

  if (equipamiento.elasticos) {
    disponible.push('elasticos')
  }

  if (equipamiento.silla) {
    disponible.push('silla')
  }

  if (equipamiento.caminarExterior) {
    disponible.push('exterior')
  }

  return disponible
}

function obtenerConfiguracionSalud() {
  return leerJsonLocalStorage('fithome_health_draft', {
    tieneMolestiasHombro: false,
    hombroIzquierdoConMolestias: false,
    hombroDerechoConMolestias: false,
    adaptarEjerciciosHombro: false,
    evitarMovimientosSobreCabeza: false,
  })
}

function obtenerEvaluacionInicial() {
  return leerJsonLocalStorage('fithome_assessment_draft', {
    sentadillasSilla30s: '',
    sentadillasEsfuerzo: 5,
    flexionesRodillas30s: '',
    flexionesEsfuerzo: 5,
    flexionesMolestiaHombroIzquierdo: 0,
    flexionesMolestiaHombroDerecho: 0,
    remoTrx30s: '',
    remoTrxEsfuerzo: 5,
    planchaSegundos: '',
    planchaEsfuerzo: 5,
    cardioSegundos: '',
    cardioEsfuerzo: 5,
  })
}

function tieneEquipamiento(ejercicio, equipamientoDisponible) {
  return ejercicio.equipment.every((elemento) => {
    return (
      elemento === 'peso-corporal' ||
      equipamientoDisponible.includes(elemento)
    )
  })
}

function esSeguroParaHombro(ejercicio, salud) {
  if (
    !salud.tieneMolestiasHombro ||
    !salud.adaptarEjerciciosHombro
  ) {
    return true
  }

  if (ejercicio.shoulderLoad === 'alta') {
    return false
  }

  if (
    salud.evitarMovimientosSobreCabeza &&
    ejercicio.shoulderRules &&
    ejercicio.shoulderRules.avoidOverheadPosition === false
  ) {
    return false
  }

  return true
}

function obtenerEjercicioValido(
  exerciseId,
  equipamientoDisponible,
  salud,
) {
  const ejercicio = getExerciseById(exerciseId)

  if (!ejercicio) {
    return null
  }

  if (!tieneEquipamiento(ejercicio, equipamientoDisponible)) {
    return null
  }

  if (!esSeguroParaHombro(ejercicio, salud)) {
    return null
  }

  return ejercicio
}

function convertirEjercicioEnBloque(ejercicio, fase) {
  return {
    id: ejercicio.id,
    exerciseId: ejercicio.id,
    name: ejercicio.name,
    phase: fase,
    category: ejercicio.category,
    equipment: ejercicio.equipment,
    muscleGroups: ejercicio.muscleGroups,
    shoulderLoad: ejercicio.shoulderLoad,
    sets: ejercicio.sets || 1,
    repsMin: ejercicio.repsMin || null,
    repsMax: ejercicio.repsMax || null,
    durationSeconds: ejercicio.durationSeconds || null,
    durationMinutes: ejercicio.durationMinutes || null,
    workSeconds: ejercicio.workSeconds || null,
    restSeconds: ejercicio.restSeconds || 30,
    instructions: ejercicio.instructions || [],
    shoulderRules: ejercicio.shoulderRules || null,
  }
}

function añadirEjercicio(
  bloques,
  exerciseId,
  fase,
  equipamientoDisponible,
  salud,
) {
  const ejercicio = obtenerEjercicioValido(
    exerciseId,
    equipamientoDisponible,
    salud,
  )

  if (!ejercicio) {
    return
  }

  const yaIncluido = bloques.some((bloque) => {
    return bloque.exerciseId === ejercicio.id
  })

  if (yaIncluido) {
    return
  }

  bloques.push(convertirEjercicioEnBloque(ejercicio, fase))
}

function ajustarRepeticionesSegunEvaluacion(bloques, evaluacion) {
  return bloques.map((bloque) => {
    if (
      bloque.exerciseId === 'sentadilla-silla' &&
      evaluacion.sentadillasSilla30s !== ''
    ) {
      const repeticiones = Number(evaluacion.sentadillasSilla30s)

      if (repeticiones < 12) {
        return {
          ...bloque,
          sets: 2,
          repsMin: 8,
          repsMax: 10,
        }
      }

      if (repeticiones >= 20) {
        return {
          ...bloque,
          sets: 3,
          repsMin: 12,
          repsMax: 16,
        }
      }
    }

    if (
      bloque.exerciseId === 'flexion-rodillas' &&
      evaluacion.flexionesRodillas30s !== ''
    ) {
      const repeticiones = Number(evaluacion.flexionesRodillas30s)

      if (repeticiones < 8) {
        return {
          ...bloque,
          sets: 2,
          repsMin: 4,
          repsMax: 6,
        }
      }

      if (repeticiones < 15) {
        return {
          ...bloque,
          sets: 3,
          repsMin: 6,
          repsMax: 10,
        }
      }
    }

    if (
      bloque.exerciseId === 'remo-trx-suave' &&
      evaluacion.remoTrx30s !== ''
    ) {
      const repeticiones = Number(evaluacion.remoTrx30s)

      if (repeticiones < 10) {
        return {
          ...bloque,
          sets: 2,
          repsMin: 6,
          repsMax: 8,
        }
      }
    }

    if (
      bloque.exerciseId === 'plancha-rodillas' &&
      evaluacion.planchaSegundos !== ''
    ) {
      const segundos = Number(evaluacion.planchaSegundos)

      if (segundos < 20) {
        return {
          ...bloque,
          sets: 2,
          durationSeconds: 15,
        }
      }

      if (segundos >= 45) {
        return {
          ...bloque,
          sets: 3,
          durationSeconds: 30,
        }
      }
    }

    return bloque
  })
}

function crearCalentamiento(
  equipamientoDisponible,
  salud,
  tipoActividad,
) {
  const bloques = []

  añadirEjercicio(
    bloques,
    'marcha-suave',
    'calentamiento',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'movilidad-cadera',
    'calentamiento',
    equipamientoDisponible,
    salud,
  )

  if (
    tipoActividad === 'Fútbol sala' ||
    tipoActividad === 'Caminata rápida' ||
    tipoActividad === 'Cardio suave en casa'
  ) {
    añadirEjercicio(
      bloques,
      'movilidad-tobillos',
      'calentamiento',
      equipamientoDisponible,
      salud,
    )
  }

  return bloques
}

function crearFuerzaGeneral(
  equipamientoDisponible,
  salud,
  evaluacion,
) {
  const bloques = []

  añadirEjercicio(
    bloques,
    'sentadilla-silla',
    'principal',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'peso-muerto-mancuernas',
    'principal',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'remo-trx-suave',
    'principal',
    equipamientoDisponible,
    salud,
  )

  if (!bloques.some((bloque) => bloque.exerciseId === 'remo-trx-suave')) {
    añadirEjercicio(
      bloques,
      'remo-mancuerna-apoyado',
      'principal',
      equipamientoDisponible,
      salud,
    )
  }

  const molestiaFlexiones =
    Number(evaluacion.flexionesMolestiaHombroIzquierdo || 0) >= 4 ||
    Number(evaluacion.flexionesMolestiaHombroDerecho || 0) >= 4

  if (!molestiaFlexiones) {
    añadirEjercicio(
      bloques,
      'flexion-inclinada',
      'principal',
      equipamientoDisponible,
      salud,
    )
  }

  añadirEjercicio(
    bloques,
    'dead-bug',
    'principal',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'rotacion-externa-elastico',
    'principal',
    equipamientoDisponible,
    salud,
  )

  return ajustarRepeticionesSegunEvaluacion(
    bloques,
    evaluacion,
  )
}

function crearFuerzaComplementaria(
  equipamientoDisponible,
  salud,
  evaluacion,
) {
  const bloques = []

  añadirEjercicio(
    bloques,
    'zancada-asistida-silla',
    'principal',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'puente-gluteos',
    'principal',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'remo-mancuerna-apoyado',
    'principal',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'curl-biceps-mancuernas',
    'principal',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'bird-dog-piernas',
    'principal',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'retraccion-escapular-elastico',
    'principal',
    equipamientoDisponible,
    salud,
  )

  return ajustarRepeticionesSegunEvaluacion(
    bloques,
    evaluacion,
  )
}

function crearMovilidadRecuperacion(
  equipamientoDisponible,
  salud,
) {
  const bloques = []

  añadirEjercicio(
    bloques,
    'movilidad-cadera',
    'principal',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'movilidad-tobillos',
    'principal',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'dead-bug',
    'principal',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'rotacion-externa-elastico',
    'principal',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'isometrico-rotacion-externa',
    'principal',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'retraccion-escapular-elastico',
    'principal',
    equipamientoDisponible,
    salud,
  )

  return bloques
}

function crearCardio(
  equipamientoDisponible,
  salud,
  tipoActividad,
) {
  const bloques = []

  if (
    tipoActividad === 'Caminata rápida' &&
    equipamientoDisponible.includes('exterior')
  ) {
    añadirEjercicio(
      bloques,
      'caminata-ritmo-vivo',
      'principal',
      equipamientoDisponible,
      salud,
    )

    return bloques
  }

  if (equipamientoDisponible.includes('comba')) {
    añadirEjercicio(
      bloques,
      'comba-intervalos-suaves',
      'principal',
      equipamientoDisponible,
      salud,
    )
  } else {
    añadirEjercicio(
      bloques,
      'marcha-rapida',
      'principal',
      equipamientoDisponible,
      salud,
    )
  }

  return bloques
}

function crearEnfriamiento(
  equipamientoDisponible,
  salud,
) {
  const bloques = []

  añadirEjercicio(
    bloques,
    'respiracion-relajacion',
    'enfriamiento',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'movilidad-suave-piernas',
    'enfriamiento',
    equipamientoDisponible,
    salud,
  )

  añadirEjercicio(
    bloques,
    'movilidad-hombros-comoda',
    'enfriamiento',
    equipamientoDisponible,
    salud,
  )

  return bloques
}

function crearSesionFutbol(actividad) {
  return {
    activityId: actividad.id,
    title: actividad.titulo,
    type: actividad.tipo,
    day: actividad.dia,
    expectedDuration: actividad.duracion,
    intensity: actividad.intensidad,
    isExternalActivity: true,
    blocks: [],
    generatedAt: new Date().toISOString(),
  }
}

export function generateWorkoutFromActivity(actividad) {
  if (!actividad) {
    return null
  }

  if (actividad.tipo === 'Fútbol sala') {
    return crearSesionFutbol(actividad)
  }

  const equipamientoDisponible =
    obtenerEquipamientoDisponible()

  const salud = obtenerConfiguracionSalud()
  const evaluacion = obtenerEvaluacionInicial()

  const calentamiento = crearCalentamiento(
    equipamientoDisponible,
    salud,
    actividad.tipo,
  )

  let bloquePrincipal = []

  if (actividad.tipo === 'Fuerza general') {
    bloquePrincipal = crearFuerzaGeneral(
      equipamientoDisponible,
      salud,
      evaluacion,
    )
  } else if (actividad.tipo === 'Fuerza complementaria') {
    bloquePrincipal = crearFuerzaComplementaria(
      equipamientoDisponible,
      salud,
      evaluacion,
    )
  } else if (actividad.tipo === 'Movilidad y recuperación') {
    bloquePrincipal = crearMovilidadRecuperacion(
      equipamientoDisponible,
      salud,
    )
  } else if (
    actividad.tipo === 'Caminata rápida' ||
    actividad.tipo === 'Cardio suave en casa'
  ) {
    bloquePrincipal = crearCardio(
      equipamientoDisponible,
      salud,
      actividad.tipo,
    )
  } else {
    bloquePrincipal = crearMovilidadRecuperacion(
      equipamientoDisponible,
      salud,
    )
  }

  const enfriamiento = crearEnfriamiento(
    equipamientoDisponible,
    salud,
  )

  return {
    activityId: actividad.id,
    title: actividad.titulo,
    type: actividad.tipo,
    day: actividad.dia,
    expectedDuration: actividad.duracion,
    intensity: actividad.intensidad,
    isExternalActivity: false,
    blocks: [
      ...calentamiento,
      ...bloquePrincipal,
      ...enfriamiento,
    ],
    generatedAt: new Date().toISOString(),
  }
}

export function getSavedWorkout(activityId) {
  const entrenamientos = leerJsonLocalStorage(
    WORKOUTS_KEY,
    {},
  )

  return entrenamientos[activityId] || null
}

export function saveWorkout(workout) {
  if (!workout || !workout.activityId) {
    return null
  }

  const entrenamientos = leerJsonLocalStorage(
    WORKOUTS_KEY,
    {},
  )

  const nuevosEntrenamientos = {
    ...entrenamientos,
  }

  nuevosEntrenamientos[workout.activityId] = workout

  guardarJsonLocalStorage(
    WORKOUTS_KEY,
    nuevosEntrenamientos,
  )

  return workout
}

export function getOrCreateWorkout(actividad) {
  if (!actividad) {
    return null
  }

  const entrenamientoGuardado = getSavedWorkout(
    actividad.id,
  )

  if (entrenamientoGuardado) {
    return entrenamientoGuardado
  }

  const nuevoEntrenamiento =
    generateWorkoutFromActivity(actividad)

  if (!nuevoEntrenamiento) {
    return null
  }

  saveWorkout(nuevoEntrenamiento)

  return nuevoEntrenamiento
}

export function removeSavedWorkout(activityId) {
  const entrenamientos = leerJsonLocalStorage(
    WORKOUTS_KEY,
    {},
  )

  const nuevosEntrenamientos = {
    ...entrenamientos,
  }

  delete nuevosEntrenamientos[activityId]

  guardarJsonLocalStorage(
    WORKOUTS_KEY,
    nuevosEntrenamientos,
  )
}