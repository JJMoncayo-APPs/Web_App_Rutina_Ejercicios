export const exercises = [
  {
    id: 'marcha-suave',
    name: 'Marcha suave en el sitio',
    category: 'calentamiento',
    equipment: ['peso-corporal'],
    muscleGroups: ['piernas', 'cardio'],
    shoulderLoad: 'baja',
    durationSeconds: 60,
    instructions: [
      'Mantén una postura erguida.',
      'Mueve brazos y piernas de forma cómoda.',
      'Aumenta progresivamente el ritmo.',
    ],
  },
  {
    id: 'movilidad-cadera',
    name: 'Movilidad de cadera',
    category: 'calentamiento',
    equipment: ['peso-corporal'],
    muscleGroups: ['cadera', 'piernas'],
    shoulderLoad: 'ninguna',
    durationSeconds: 45,
    instructions: [
      'Mantén los pies separados al ancho de las caderas.',
      'Realiza movimientos lentos y controlados.',
      'No fuerces el recorrido.',
    ],
  },
  {
    id: 'movilidad-tobillos',
    name: 'Movilidad de tobillos',
    category: 'calentamiento',
    equipment: ['peso-corporal'],
    muscleGroups: ['tobillos', 'piernas'],
    shoulderLoad: 'ninguna',
    durationSeconds: 45,
    instructions: [
      'Apoya ambos pies con estabilidad.',
      'Desplaza suavemente las rodillas hacia delante.',
      'Mantén los talones apoyados.',
    ],
  },
  {
    id: 'sentadilla-silla',
    name: 'Sentadilla a silla',
    category: 'fuerza',
    equipment: ['silla', 'peso-corporal'],
    muscleGroups: ['cuadriceps', 'gluteos', 'piernas'],
    shoulderLoad: 'ninguna',
    sets: 3,
    repsMin: 10,
    repsMax: 15,
    restSeconds: 60,
    instructions: [
      'Colócate delante de una silla firme.',
      'Lleva la cadera hacia atrás hasta tocar suavemente la silla.',
      'Empuja el suelo con los pies para levantarte.',
      'Mantén las rodillas alineadas con los pies.',
    ],
  },
  {
    id: 'puente-gluteos',
    name: 'Puente de glúteos',
    category: 'fuerza',
    equipment: ['esterilla', 'peso-corporal'],
    muscleGroups: ['gluteos', 'isquiotibiales', 'core'],
    shoulderLoad: 'baja',
    sets: 3,
    repsMin: 12,
    repsMax: 18,
    restSeconds: 45,
    instructions: [
      'Túmbate boca arriba con las rodillas flexionadas.',
      'Eleva la cadera apretando los glúteos.',
      'Evita arquear excesivamente la espalda.',
      'Baja de forma lenta y controlada.',
    ],
  },
  {
    id: 'zancada-asistida-silla',
    name: 'Zancada asistida con silla',
    category: 'fuerza',
    equipment: ['silla', 'peso-corporal'],
    muscleGroups: ['cuadriceps', 'gluteos', 'equilibrio'],
    shoulderLoad: 'baja',
    sets: 2,
    repsMin: 6,
    repsMax: 10,
    restSeconds: 60,
    instructions: [
      'Utiliza la silla únicamente como apoyo de equilibrio.',
      'Da un paso cómodo hacia atrás.',
      'Desciende solo hasta donde mantengas el control.',
      'Alterna ambas piernas.',
    ],
  },
  {
    id: 'peso-muerto-mancuernas',
    name: 'Peso muerto con mancuernas',
    category: 'fuerza',
    equipment: ['mancuernas'],
    muscleGroups: ['gluteos', 'isquiotibiales', 'espalda'],
    shoulderLoad: 'baja',
    sets: 3,
    repsMin: 8,
    repsMax: 12,
    restSeconds: 75,
    instructions: [
      'Mantén las mancuernas cerca de las piernas.',
      'Lleva la cadera hacia atrás.',
      'Mantén la espalda estable.',
      'Vuelve a la posición inicial apretando los glúteos.',
    ],
  },
  {
    id: 'remo-trx-suave',
    name: 'Remo TRX con inclinación suave',
    category: 'fuerza',
    equipment: ['trx'],
    muscleGroups: ['espalda', 'biceps', 'core'],
    shoulderLoad: 'moderada',
    sets: 3,
    repsMin: 8,
    repsMax: 12,
    restSeconds: 60,
    instructions: [
      'Empieza con el cuerpo bastante vertical.',
      'Mantén los hombros alejados de las orejas.',
      'Acerca el pecho a las empuñaduras.',
      'Reduce la inclinación si aumenta la molestia.',
    ],
    shoulderRules: {
      stopIfPainIncreases: true,
      avoidOverheadPosition: true,
      reduceRangeIfDiscomfort: true,
    },
  },
  {
    id: 'flexion-inclinada',
    name: 'Flexión inclinada',
    category: 'fuerza',
    equipment: ['silla', 'peso-corporal'],
    muscleGroups: ['pectoral', 'triceps', 'core'],
    shoulderLoad: 'moderada',
    sets: 3,
    repsMin: 6,
    repsMax: 12,
    restSeconds: 60,
    instructions: [
      'Apoya las manos sobre una superficie firme y estable.',
      'Mantén el cuerpo alineado.',
      'Baja únicamente hasta un recorrido cómodo.',
      'Detén la serie si aumenta la molestia del hombro.',
    ],
    shoulderRules: {
      stopIfPainIncreases: true,
      reduceRangeIfDiscomfort: true,
      avoidOverheadPosition: true,
    },
  },
  {
    id: 'flexion-rodillas',
    name: 'Flexión con rodillas apoyadas',
    category: 'fuerza',
    equipment: ['esterilla', 'peso-corporal'],
    muscleGroups: ['pectoral', 'triceps', 'core'],
    shoulderLoad: 'moderada',
    sets: 3,
    repsMin: 6,
    repsMax: 12,
    restSeconds: 60,
    instructions: [
      'Apoya las rodillas sobre la esterilla.',
      'Mantén el abdomen activo.',
      'Baja solo hasta un rango cómodo.',
      'Detén la serie si aumenta la molestia del hombro.',
    ],
    shoulderRules: {
      stopIfPainIncreases: true,
      reduceRangeIfDiscomfort: true,
    },
  },
  {
    id: 'curl-biceps-mancuernas',
    name: 'Curl de bíceps con mancuernas',
    category: 'fuerza',
    equipment: ['mancuernas'],
    muscleGroups: ['biceps'],
    shoulderLoad: 'baja',
    sets: 2,
    repsMin: 10,
    repsMax: 15,
    restSeconds: 45,
    instructions: [
      'Mantén los codos cerca del cuerpo.',
      'Sube y baja las mancuernas de forma controlada.',
      'No balancees el tronco.',
    ],
  },
  {
    id: 'remo-mancuerna-apoyado',
    name: 'Remo con mancuerna apoyado',
    category: 'fuerza',
    equipment: ['mancuernas', 'silla'],
    muscleGroups: ['espalda', 'biceps'],
    shoulderLoad: 'moderada',
    sets: 3,
    repsMin: 8,
    repsMax: 12,
    restSeconds: 60,
    instructions: [
      'Utiliza la silla como apoyo estable.',
      'Mantén la espalda en posición neutra.',
      'Lleva la mancuerna hacia la cadera.',
      'No eleves el hombro hacia la oreja.',
    ],
    shoulderRules: {
      stopIfPainIncreases: true,
      reduceRangeIfDiscomfort: true,
    },
  },
  {
    id: 'dead-bug',
    name: 'Dead bug',
    category: 'core',
    equipment: ['esterilla', 'peso-corporal'],
    muscleGroups: ['core'],
    shoulderLoad: 'baja',
    sets: 3,
    repsMin: 6,
    repsMax: 10,
    restSeconds: 45,
    instructions: [
      'Túmbate boca arriba con las piernas elevadas.',
      'Mantén la zona lumbar estable.',
      'Mueve las piernas lentamente.',
      'No pierdas el control abdominal.',
    ],
  },
  {
    id: 'bird-dog-piernas',
    name: 'Bird dog adaptado',
    category: 'core',
    equipment: ['esterilla', 'peso-corporal'],
    muscleGroups: ['core', 'espalda', 'gluteos'],
    shoulderLoad: 'moderada',
    sets: 3,
    repsMin: 6,
    repsMax: 10,
    restSeconds: 45,
    instructions: [
      'Colócate a cuatro apoyos.',
      'Extiende una pierna manteniendo el tronco estable.',
      'No es necesario extender los brazos.',
      'Detén el ejercicio si el apoyo molesta al hombro.',
    ],
    shoulderRules: {
      stopIfPainIncreases: true,
    },
  },
  {
    id: 'plancha-rodillas',
    name: 'Plancha con rodillas apoyadas',
    category: 'core',
    equipment: ['esterilla', 'peso-corporal'],
    muscleGroups: ['core'],
    shoulderLoad: 'moderada',
    sets: 3,
    durationSeconds: 20,
    restSeconds: 45,
    instructions: [
      'Apoya los antebrazos y las rodillas.',
      'Mantén el abdomen y los glúteos activos.',
      'Evita hundir la zona lumbar.',
      'Detén el ejercicio si aumenta la molestia del hombro.',
    ],
    shoulderRules: {
      stopIfPainIncreases: true,
    },
  },
  {
    id: 'rotacion-externa-elastico',
    name: 'Rotación externa con elástico',
    category: 'hombro',
    equipment: ['elasticos'],
    muscleGroups: ['hombro', 'manguito-rotador'],
    shoulderLoad: 'controlada',
    sets: 2,
    repsMin: 10,
    repsMax: 15,
    restSeconds: 45,
    instructions: [
      'Mantén el codo junto al cuerpo.',
      'Utiliza una resistencia ligera.',
      'Realiza un recorrido lento y controlado.',
      'Detén el ejercicio si aumenta la molestia.',
    ],
    shoulderRules: {
      stopIfPainIncreases: true,
      lightResistanceOnly: true,
      avoidOverheadPosition: true,
    },
  },
  {
    id: 'retraccion-escapular-elastico',
    name: 'Retracción escapular con elástico',
    category: 'hombro',
    equipment: ['elasticos'],
    muscleGroups: ['espalda', 'escapulas', 'hombro'],
    shoulderLoad: 'controlada',
    sets: 2,
    repsMin: 10,
    repsMax: 15,
    restSeconds: 45,
    instructions: [
      'Mantén los brazos en una posición cómoda.',
      'Acerca suavemente los omóplatos.',
      'Evita elevar los hombros hacia las orejas.',
      'Usa poca resistencia al comenzar.',
    ],
    shoulderRules: {
      stopIfPainIncreases: true,
      lightResistanceOnly: true,
      avoidOverheadPosition: true,
    },
  },
  {
    id: 'isometrico-rotacion-externa',
    name: 'Isométrico de rotación externa',
    category: 'hombro',
    equipment: ['elasticos'],
    muscleGroups: ['hombro', 'manguito-rotador'],
    shoulderLoad: 'controlada',
    sets: 2,
    durationSeconds: 15,
    restSeconds: 30,
    instructions: [
      'Mantén el codo junto al cuerpo.',
      'Aplica una resistencia suave sin mover el brazo.',
      'Mantén una respiración normal.',
      'No continúes si aumenta la molestia.',
    ],
    shoulderRules: {
      stopIfPainIncreases: true,
      lightResistanceOnly: true,
      avoidOverheadPosition: true,
    },
  },
  {
    id: 'comba-intervalos-suaves',
    name: 'Comba por intervalos suaves',
    category: 'cardio',
    equipment: ['comba'],
    muscleGroups: ['cardio', 'piernas'],
    shoulderLoad: 'moderada',
    sets: 6,
    workSeconds: 30,
    restSeconds: 30,
    instructions: [
      'Salta con poca altura.',
      'Mantén un ritmo que puedas controlar.',
      'Mueve la cuerda principalmente con las muñecas.',
      'Detente ante molestias relevantes.',
    ],
  },
  {
    id: 'marcha-rapida',
    name: 'Marcha rápida en el sitio',
    category: 'cardio',
    equipment: ['peso-corporal'],
    muscleGroups: ['cardio', 'piernas'],
    shoulderLoad: 'baja',
    sets: 6,
    workSeconds: 45,
    restSeconds: 15,
    instructions: [
      'Mantén un ritmo vivo pero sostenible.',
      'Eleva las rodillas hasta una altura cómoda.',
      'Reduce el movimiento de brazos si molesta el hombro.',
    ],
  },
  {
    id: 'caminata-ritmo-vivo',
    name: 'Caminata a ritmo vivo',
    category: 'cardio',
    equipment: ['exterior'],
    muscleGroups: ['cardio', 'piernas'],
    shoulderLoad: 'ninguna',
    durationMinutes: 30,
    instructions: [
      'Camina a un ritmo vivo y sostenible.',
      'Debes poder hablar con algo de esfuerzo.',
      'Reduce el ritmo si notas fatiga excesiva.',
    ],
  },
  {
    id: 'respiracion-relajacion',
    name: 'Respiración y vuelta a la calma',
    category: 'enfriamiento',
    equipment: ['esterilla'],
    muscleGroups: ['recuperacion'],
    shoulderLoad: 'ninguna',
    durationSeconds: 120,
    instructions: [
      'Respira lentamente.',
      'Relaja los hombros y la mandíbula.',
      'Reduce progresivamente el ritmo respiratorio.',
    ],
  },
  {
    id: 'movilidad-suave-piernas',
    name: 'Movilidad suave de piernas',
    category: 'enfriamiento',
    equipment: ['esterilla'],
    muscleGroups: ['piernas', 'recuperacion'],
    shoulderLoad: 'ninguna',
    durationSeconds: 120,
    instructions: [
      'Realiza movimientos suaves.',
      'No rebotes ni fuerces el recorrido.',
      'Mantén una respiración tranquila.',
    ],
  },
  {
    id: 'movilidad-hombros-comoda',
    name: 'Movilidad cómoda de hombros',
    category: 'enfriamiento',
    equipment: ['peso-corporal'],
    muscleGroups: ['hombro', 'recuperacion'],
    shoulderLoad: 'controlada',
    durationSeconds: 60,
    instructions: [
      'Mueve los hombros dentro de un rango cómodo.',
      'No eleves los brazos por encima del rango tolerado.',
      'Evita rebotes y movimientos rápidos.',
    ],
    shoulderRules: {
      stopIfPainIncreases: true,
      avoidOverheadPosition: true,
    },
  },
]

export function getExerciseById(exerciseId) {
  return (
    exercises.find((exercise) => {
      return exercise.id === exerciseId
    }) || null
  )
}

export function getExercisesByCategory(category) {
  return exercises.filter((exercise) => {
    return exercise.category === category
  })
}

export function getExercisesForEquipment(availableEquipment = []) {
  return exercises.filter((exercise) => {
    return exercise.equipment.every((equipmentItem) => {
      return (
        equipmentItem === 'peso-corporal' ||
        availableEquipment.includes(equipmentItem)
      )
    })
  })
}

export function getShoulderAdaptedExercises() {
  return exercises.filter((exercise) => {
    return (
      exercise.shoulderLoad === 'ninguna' ||
      exercise.shoulderLoad === 'baja' ||
      exercise.shoulderLoad === 'controlada'
    )
  })
}