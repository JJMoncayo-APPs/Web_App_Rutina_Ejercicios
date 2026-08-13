// src/data/freeleticsProgram.js

/*
 * Programa estructurado para uso personal.
 *
 * IMPORTANTE:
 * - Las imágenes originales del PDF no deben copiarse ni publicarse.
 * - Las ilustraciones de la aplicación deberán ser propias.
 * - Ajusta o detén cualquier ejercicio que provoque dolor.
 */

// ======================================================
// TIPOS DE PASOS
// ======================================================

const ejercicio = (exerciseId, repetitions, options = {}) => ({
  type: 'exercise',
  exerciseId,
  repetitions,
  ...options,
})

const carrera = (distanceMeters) => ({
  type: 'run',
  exerciseId: 'running',
  distanceMeters,
})

const descanso = (durationSeconds) => ({
  type: 'rest',
  durationSeconds,
})

const workout = (workoutId) => ({
  type: 'workout',
  workoutId,
})

const max = (maxId) => ({
  type: 'max',
  maxId,
})

// ======================================================
// EJERCICIOS
// ======================================================

export const exercises = {
  burpees: {
    id: 'burpees',
    name: 'Burpees',
    shortName: 'Burpees',
    category: 'cardio',
    measurement: 'repetitions',
    image: 'assets/exercises/burpees.webp',
    modifiedImage: 'assets/exercises/burpees-modified.webp',
    instructions:
      'Desde posición de pie, baja al suelo, lleva los pies atrás, vuelve a levantarte y termina con un salto.',
    modifiedInstructions:
      'Lleva los pies hacia atrás hasta la posición de plancha sin apoyar el pecho en el suelo.',
    shoulderWarning: true,
  },

  squats: {
    id: 'squats',
    name: 'Sentadillas',
    shortName: 'Sentadillas',
    category: 'legs',
    measurement: 'repetitions',
    image: 'assets/exercises/squats.webp',
    modifiedImage: null,
    instructions:
      'Baja la cadera por debajo de la altura de las rodillas y vuelve a la posición de pie.',
    modifiedInstructions:
      'Baja solamente hasta una profundidad que puedas controlar correctamente.',
    shoulderWarning: false,
  },

  deepSquats: {
    id: 'deepSquats',
    name: 'Sentadillas profundas',
    shortName: 'Sentadillas profundas',
    category: 'legs',
    measurement: 'repetitions',
    image: 'assets/exercises/deep-squats.webp',
    modifiedImage: null,
    instructions:
      'Baja la cadera de manera controlada hasta alcanzar la máxima profundidad posible y vuelve a levantarte.',
    modifiedInstructions:
      'Reduce la profundidad manteniendo los talones apoyados y la espalda estable.',
    shoulderWarning: false,
  },

  situps: {
    id: 'situps',
    name: 'Abdominales',
    shortName: 'Abdominales',
    category: 'core',
    measurement: 'repetitions',
    image: 'assets/exercises/situps.webp',
    modifiedImage: null,
    instructions:
      'Desde una posición sentada, baja el tronco hasta el suelo y vuelve a incorporarte.',
    modifiedInstructions:
      'Al incorporarte, toca las rodillas en lugar de llegar hasta los pies.',
    shoulderWarning: false,
  },

  legLevers: {
    id: 'legLevers',
    name: 'Elevaciones de piernas',
    shortName: 'Elevaciones de piernas',
    category: 'core',
    measurement: 'repetitions',
    image: 'assets/exercises/leg-levers.webp',
    modifiedImage: null,
    instructions:
      'Tumbado boca arriba, eleva las piernas juntas hasta colocarlas verticales y bájalas de forma controlada.',
    modifiedInstructions:
      'Coloca las manos debajo de la zona lumbar y flexiona las rodillas si lo necesitas.',
    shoulderWarning: false,
  },

  jumpingJacks: {
    id: 'jumpingJacks',
    name: 'Jumping Jacks',
    shortName: 'Jumping Jacks',
    category: 'cardio',
    measurement: 'repetitions',
    image: 'assets/exercises/jumping-jacks.webp',
    modifiedImage: null,
    instructions:
      'Abre las piernas mientras elevas los brazos y vuelve a la posición inicial.',
    modifiedInstructions: null,
    shoulderWarning: true,
  },

  climbers: {
    id: 'climbers',
    name: 'Climbers',
    shortName: 'Climbers',
    category: 'cardio',
    measurement: 'repetitions',
    image: 'assets/exercises/climbers.webp',
    modifiedImage: null,
    instructions:
      'Desde la posición de plancha, lleva alternativamente cada pie hacia la altura de las manos.',
    modifiedInstructions:
      'Acerca cada pie a las manos solamente hasta donde puedas mantener una postura estable.',
    shoulderWarning: true,
  },

  highJumps: {
    id: 'highJumps',
    name: 'Saltos altos',
    shortName: 'Saltos altos',
    category: 'cardio',
    measurement: 'repetitions',
    image: 'assets/exercises/high-jumps.webp',
    modifiedImage: null,
    instructions:
      'Salta verticalmente elevando las rodillas y aterriza suavemente.',
    modifiedInstructions:
      'Realiza un salto más bajo y eleva las rodillas solamente hasta donde puedas controlar.',
    shoulderWarning: false,
  },

  pushups: {
    id: 'pushups',
    name: 'Flexiones',
    shortName: 'Flexiones',
    category: 'upperBody',
    measurement: 'repetitions',
    image: 'assets/exercises/pushups.webp',
    modifiedImage: 'assets/exercises/pushups-modified.webp',
    instructions:
      'Mantén el cuerpo alineado, extiende completamente los brazos y vuelve a bajar de forma controlada.',
    modifiedInstructions:
      'Realiza la flexión apoyando las rodillas en el suelo.',
    shoulderWarning: true,
  },

  jackknives: {
    id: 'jackknives',
    name: 'Jackknifes',
    shortName: 'Jackknifes',
    category: 'core',
    measurement: 'repetitions',
    image: 'assets/exercises/jackknives.webp',
    modifiedImage: null,
    instructions:
      'Eleva simultáneamente las piernas y el tronco hasta acercar las manos a los pies.',
    modifiedInstructions:
      'Eleva las piernas hasta donde puedas y lleva las manos hacia las espinillas.',
    shoulderWarning: false,
  },

  running: {
    id: 'running',
    name: 'Carrera',
    shortName: 'Carrera',
    category: 'cardio',
    measurement: 'distance',
    image: 'assets/exercises/running.webp',
    modifiedImage: null,
    instructions:
      'Completa la distancia indicada a un ritmo que puedas mantener con seguridad.',
    modifiedInstructions:
      'Sustituye la carrera por caminata rápida si necesitas reducir el impacto.',
    shoulderWarning: false,
  },
}

// ======================================================
// WORKOUTS
// ======================================================

export const workouts = {
  aphrodite: {
    id: 'aphrodite',
    name: 'Aphrodite',
    type: 'workout',
    measurement: 'time',
    equipment: [],
    requiresRunningSpace: false,
    rounds: [
      {
        round: 1,
        steps: [
          ejercicio('burpees', 50),
          ejercicio('squats', 50),
          ejercicio('situps', 50),
        ],
      },
      {
        round: 2,
        steps: [
          ejercicio('burpees', 40),
          ejercicio('squats', 40),
          ejercicio('situps', 40),
        ],
      },
      {
        round: 3,
        steps: [
          ejercicio('burpees', 30),
          ejercicio('squats', 30),
          ejercicio('situps', 30),
        ],
      },
      {
        round: 4,
        steps: [
          ejercicio('burpees', 20),
          ejercicio('squats', 20),
          ejercicio('situps', 20),
        ],
      },
      {
        round: 5,
        steps: [
          ejercicio('burpees', 10),
          ejercicio('squats', 10),
          ejercicio('situps', 10),
        ],
      },
    ],
  },

  apollon: {
    id: 'apollon',
    name: 'Apollon',
    type: 'workout',
    measurement: 'time',
    equipment: [],
    requiresRunningSpace: true,
    rounds: Array.from({ length: 3 }, (_, index) => ({
      round: index + 1,
      steps: [
        ejercicio('burpees', 25),
        carrera(400),
        ejercicio('deepSquats', 50),
        carrera(400),
      ],
    })),
  },

  dione: {
    id: 'dione',
    name: 'Dione',
    type: 'workout',
    measurement: 'time',
    equipment: [],
    requiresRunningSpace: false,
    rounds: Array.from({ length: 3 }, (_, index) => ({
      round: index + 1,
      steps: [
        ejercicio('jumpingJacks', 75),
        ejercicio('burpees', 25),
        ejercicio('legLevers', 50),
        ejercicio('jumpingJacks', 75),
        ejercicio('situps', 50),
        ejercicio('burpees', 25),
      ],
    })),
  },

  iris: {
    id: 'iris',
    name: 'Iris',
    type: 'workout',
    measurement: 'time',
    equipment: [],
    requiresRunningSpace: true,
    initialSteps: [carrera(1000)],
    rounds: Array.from({ length: 5 }, (_, index) => ({
      round: index + 1,
      steps: [
        ejercicio('jumpingJacks', 100),
        ejercicio('climbers', 100),
      ],
    })),
    finalSteps: [carrera(1000)],
  },

  metis: {
    id: 'metis',
    name: 'Metis',
    type: 'workout',
    measurement: 'time',
    equipment: [],
    requiresRunningSpace: false,
    rounds: [
      {
        round: 1,
        steps: [
          ejercicio('burpees', 10),
          ejercicio('climbers', 10),
          ejercicio('highJumps', 10),
        ],
      },
      {
        round: 2,
        steps: [
          ejercicio('burpees', 25),
          ejercicio('climbers', 25),
          ejercicio('highJumps', 25),
        ],
      },
      {
        round: 3,
        steps: [
          ejercicio('burpees', 10),
          ejercicio('climbers', 10),
          ejercicio('highJumps', 10),
        ],
      },
    ],
  },

  venus: {
    id: 'venus',
    name: 'Venus',
    type: 'workout',
    measurement: 'time',
    equipment: [],
    requiresRunningSpace: false,
    rounds: Array.from({ length: 4 }, (_, index) => ({
      round: index + 1,
      steps: [
        ejercicio('pushups', 50),
        ejercicio('situps', 20),
        ejercicio('deepSquats', 50),
      ],
    })),
  },
}

// ======================================================
// ENTRENAMIENTOS MAX
// ======================================================

export const maxExercises = {
  burpeeMax: {
    id: 'burpeeMax',
    name: 'Burpee MAX',
    type: 'max',
    exerciseId: 'burpees',
    durationSeconds: 300,
    measurement: 'repetitions',
  },

  legLeverMax: {
    id: 'legLeverMax',
    name: 'Leg Lever MAX',
    type: 'max',
    exerciseId: 'legLevers',
    durationSeconds: 300,
    measurement: 'repetitions',
  },

  pushupMax: {
    id: 'pushupMax',
    name: 'Pushup MAX',
    type: 'max',
    exerciseId: 'pushups',
    durationSeconds: 100,
    measurement: 'repetitions',
  },

  situpMax: {
    id: 'situpMax',
    name: 'Situp MAX',
    type: 'max',
    exerciseId: 'situps',
    durationSeconds: 300,
    measurement: 'repetitions',
  },

  squatMax: {
    id: 'squatMax',
    name: 'Squat MAX',
    type: 'max',
    exerciseId: 'squats',
    durationSeconds: 300,
    measurement: 'repetitions',
  },
}

// ======================================================
// PROGRAMA COMPLETO DE 15 SEMANAS
// ======================================================

export const freeleticsProgram = [
  {
    week: 1,
    title: 'Semana 1',
    minimumCompletionPercentage: 80,
    challenge: null,
    sessions: [
      {
        session: 1,
        name: 'Dione',
        steps: [workout('dione')],
      },
      {
        session: 2,
        name: 'Burpee MAX + Squat MAX + Burpee MAX',
        steps: [
          max('burpeeMax'),
          descanso(300),
          max('squatMax'),
          descanso(300),
          max('burpeeMax'),
        ],
      },
      {
        session: 3,
        name: 'Aphrodite',
        steps: [workout('aphrodite')],
      },
      {
        session: 4,
        name: 'Burpee MAX + Squat MAX + Burpee MAX',
        steps: [
          max('burpeeMax'),
          descanso(300),
          max('squatMax'),
          descanso(300),
          max('burpeeMax'),
        ],
      },
      {
        session: 5,
        name: 'Dione',
        steps: [workout('dione')],
      },
    ],
  },

  {
    week: 2,
    title: 'Semana 2',
    minimumCompletionPercentage: 80,
    challenge: 'Conseguir dos nuevos récords personales en Aphrodite.',
    sessions: [
      {
        session: 1,
        name: 'Aphrodite',
        steps: [workout('aphrodite')],
      },
      {
        session: 2,
        name: 'Burpee MAX + Situp MAX + Burpee MAX',
        steps: [
          max('burpeeMax'),
          descanso(180),
          max('situpMax'),
          descanso(180),
          max('burpeeMax'),
        ],
      },
      {
        session: 3,
        name: 'Iris',
        steps: [workout('iris')],
      },
      {
        session: 4,
        name: 'Burpee MAX + Situp MAX + Burpee MAX',
        steps: [
          max('burpeeMax'),
          descanso(180),
          max('situpMax'),
          descanso(180),
          max('burpeeMax'),
        ],
      },
      {
        session: 5,
        name: 'Aphrodite',
        steps: [workout('aphrodite')],
      },
    ],
  },

  {
    week: 3,
    title: 'Semana 3',
    minimumCompletionPercentage: 80,
    challenge:
      'Conseguir un nuevo récord personal en Dione y otro en Burpee MAX.',
    sessions: [
      {
        session: 1,
        name: 'Dione',
        steps: [workout('dione')],
      },
      {
        session: 2,
        name: 'Triple Burpee MAX',
        steps: [
          max('burpeeMax'),
          descanso(300),
          max('burpeeMax'),
          descanso(180),
          max('burpeeMax'),
        ],
      },
      {
        session: 3,
        name: 'Venus',
        steps: [workout('venus')],
      },
      {
        session: 4,
        name: 'Triple Burpee MAX',
        steps: [
          max('burpeeMax'),
          descanso(300),
          max('burpeeMax'),
          descanso(180),
          max('burpeeMax'),
        ],
      },
      {
        session: 5,
        name: 'Dione',
        steps: [workout('dione')],
      },
    ],
  },

  {
    week: 4,
    title: 'Semana 4',
    minimumCompletionPercentage: 80,
    challenge:
      'Completar al menos una sesión de Aphrodite usando únicamente versiones normales.',
    sessions: [
      {
        session: 1,
        name: 'Aphrodite',
        steps: [workout('aphrodite')],
      },
      {
        session: 2,
        name: 'Burpee MAX + Leg Lever MAX',
        steps: [
          max('burpeeMax'),
          descanso(300),
          max('legLeverMax'),
          descanso(180),
          max('burpeeMax'),
          descanso(180),
          max('legLeverMax'),
        ],
      },
      {
        session: 3,
        name: 'Aphrodite',
        steps: [workout('aphrodite')],
      },
      {
        session: 4,
        name: 'Burpee MAX + Leg Lever MAX',
        steps: [
          max('burpeeMax'),
          descanso(300),
          max('legLeverMax'),
          descanso(180),
          max('burpeeMax'),
          descanso(180),
          max('legLeverMax'),
        ],
      },
      {
        session: 5,
        name: 'Aphrodite',
        steps: [workout('aphrodite')],
      },
    ],
  },

  {
    week: 5,
    title: 'Semana 5',
    minimumCompletionPercentage: 80,
    challenge: 'Conseguir un nuevo récord personal en Squat MAX.',
    sessions: [
      {
        session: 1,
        name: 'Dione',
        steps: [workout('dione')],
      },
      {
        session: 2,
        name: 'Squat MAX + Pushup MAX + Metis',
        steps: [
          max('squatMax'),
          descanso(300),
          max('pushupMax'),
          descanso(180),
          workout('metis'),
        ],
      },
      {
        session: 3,
        name: 'Dione',
        steps: [workout('dione')],
      },
      {
        session: 4,
        name: 'Squat MAX + Pushup MAX + Metis',
        steps: [
          max('squatMax'),
          descanso(300),
          max('pushupMax'),
          descanso(180),
          workout('metis'),
        ],
      },
    ],
  },

  {
    week: 6,
    title: 'Semana 6',
    minimumCompletionPercentage: 80,
    challenge:
      'Conseguir un nuevo récord personal en Burpee MAX dos veces.',
    sessions: [
      {
        session: 1,
        name: 'Iris',
        steps: [workout('iris')],
      },
      {
        session: 2,
        name: 'Burpee MAX + Squat MAX + Situp MAX',
        steps: [
          max('burpeeMax'),
          descanso(300),
          max('squatMax'),
          descanso(300),
          max('burpeeMax'),
          descanso(60),
          max('situpMax'),
        ],
      },
      {
        session: 3,
        name: 'Aphrodite',
        steps: [workout('aphrodite')],
      },
      {
        session: 4,
        name: 'Burpee MAX + Squat MAX + Situp MAX',
        steps: [
          max('burpeeMax'),
          descanso(300),
          max('squatMax'),
          descanso(300),
          max('burpeeMax'),
          descanso(60),
          max('situpMax'),
        ],
      },
      {
        session: 5,
        name: 'Iris',
        steps: [workout('iris')],
      },
    ],
  },

  {
    week: 7,
    title: 'Semana 7 · Hell Days',
    minimumCompletionPercentage: 100,
    challenge: 'Completar todos los entrenamientos de la semana.',
    sessions: [
      {
        session: 1,
        name: 'Hell Day 1',
        isHellDay: true,
        restDayAfterRecommended: true,
        steps: [
          workout('metis'),
          workout('aphrodite'),
          workout('iris'),
        ],
      },
      {
        session: 2,
        name: 'Hell Day 2',
        isHellDay: true,
        restDayAfterRecommended: true,
        steps: [
          workout('dione'),
          workout('metis'),
          workout('aphrodite'),
        ],
      },
      {
        session: 3,
        name: 'Hell Day 3',
        isHellDay: true,
        restDayAfterRecommended: true,
        steps: [
          workout('metis'),
          workout('aphrodite'),
          workout('iris'),
        ],
      },
    ],
  },

  {
    week: 8,
    title: 'Semana 8',
    minimumCompletionPercentage: 80,
    challenge: 'Conseguir un nuevo récord personal en Aphrodite.',
    sessions: [
      {
        session: 1,
        name: 'Apollon',
        steps: [workout('apollon')],
      },
      {
        session: 2,
        name: 'Leg Lever MAX + Metis',
        steps: [
          max('legLeverMax'),
          descanso(180),
          workout('metis'),
        ],
      },
      {
        session: 3,
        name: 'Aphrodite',
        steps: [workout('aphrodite')],
      },
      {
        session: 4,
        name: 'Apollon',
        steps: [workout('apollon')],
      },
      {
        session: 5,
        name: 'Leg Lever MAX + Metis',
        steps: [
          max('legLeverMax'),
          descanso(180),
          workout('metis'),
        ],
      },
    ],
  },

  {
    week: 9,
    title: 'Semana 9',
    minimumCompletionPercentage: 80,
    challenge:
      'Completar al menos una sesión de Dione usando únicamente versiones normales.',
    sessions: [
      {
        session: 1,
        name: 'Dione',
        steps: [workout('dione')],
      },
      {
        session: 2,
        name: 'Metis + Aphrodite',
        steps: [
          workout('metis'),
          descanso(420),
          workout('aphrodite'),
        ],
      },
      {
        session: 3,
        name: 'Dione',
        steps: [workout('dione')],
      },
      {
        session: 4,
        name: 'Dione',
        steps: [workout('dione')],
      },
    ],
  },

  {
    week: 10,
    title: 'Semana 10',
    minimumCompletionPercentage: 80,
    challenge: 'Conseguir un nuevo récord personal en Dione.',
    sessions: [
      {
        session: 1,
        name: 'Dione',
        steps: [workout('dione')],
      },
      {
        session: 2,
        name: 'Iris',
        steps: [workout('iris')],
      },
      {
        session: 3,
        name: 'Aphrodite',
        steps: [workout('aphrodite')],
      },
      {
        session: 4,
        name: 'Apollon',
        steps: [workout('apollon')],
      },
      {
        session: 5,
        name: 'Metis + Situp MAX',
        steps: [
          workout('metis'),
          descanso(300),
          max('situpMax'),
        ],
      },
    ],
  },

  {
    week: 11,
    title: 'Semana 11',
    minimumCompletionPercentage: 80,
    challenge: 'Conseguir un nuevo récord personal en Burpee MAX.',
    sessions: [
      {
        session: 1,
        name: 'Dione',
        steps: [workout('dione')],
      },
      {
        session: 2,
        name: 'Apollon',
        steps: [workout('apollon')],
      },
      {
        session: 3,
        name: 'Triple Burpee MAX',
        steps: [
          max('burpeeMax'),
          descanso(180),
          max('burpeeMax'),
          descanso(300),
          max('burpeeMax'),
        ],
      },
      {
        session: 4,
        name: 'Iris',
        steps: [workout('iris')],
      },
      {
        session: 5,
        name: 'Aphrodite',
        steps: [workout('aphrodite')],
      },
    ],
  },

  {
    week: 12,
    title: 'Semana 12',
    minimumCompletionPercentage: 80,
    challenge: 'Conseguir un nuevo récord personal en Apollon.',
    sessions: [
      {
        session: 1,
        name: 'Apollon',
        steps: [workout('apollon')],
      },
      {
        session: 2,
        name: 'Situp MAX + Burpee MAX + Situp MAX',
        steps: [
          max('situpMax'),
          descanso(180),
          max('burpeeMax'),
          descanso(300),
          max('situpMax'),
        ],
      },
      {
        session: 3,
        name: 'Iris',
        steps: [workout('iris')],
      },
      {
        session: 4,
        name: 'Situp MAX + Burpee MAX + Situp MAX',
        steps: [
          max('situpMax'),
          descanso(180),
          max('burpeeMax'),
          descanso(300),
          max('situpMax'),
        ],
      },
      {
        session: 5,
        name: 'Apollon',
        steps: [workout('apollon')],
      },
    ],
  },

  {
    week: 13,
    title: 'Semana 13',
    minimumCompletionPercentage: 80,
    challenge: 'Conseguir un nuevo récord personal en Iris dos veces.',
    sessions: [
      {
        session: 1,
        name: 'Squat MAX + Metis',
        steps: [
          max('squatMax'),
          descanso(300),
          workout('metis'),
        ],
      },
      {
        session: 2,
        name: 'Iris',
        steps: [workout('iris')],
      },
      {
        session: 3,
        name: 'Dione',
        steps: [workout('dione')],
      },
      {
        session: 4,
        name: 'Iris',
        steps: [workout('iris')],
      },
      {
        session: 5,
        name: 'Squat MAX + Metis',
        steps: [
          max('squatMax'),
          descanso(180),
          workout('metis'),
        ],
      },
    ],
  },

  {
    week: 14,
    title: 'Semana 14',
    minimumCompletionPercentage: 80,
    challenge: 'Conseguir un nuevo récord personal en Apollon.',
    sessions: [
      {
        session: 1,
        name: 'Apollon',
        steps: [workout('apollon')],
      },
      {
        session: 2,
        name: 'Situp MAX + Metis + Situp MAX',
        steps: [
          max('situpMax'),
          descanso(300),
          workout('metis'),
          descanso(180),
          max('situpMax'),
        ],
      },
      {
        session: 3,
        name: 'Venus',
        steps: [workout('venus')],
      },
      {
        session: 4,
        name: 'Situp MAX + Burpee MAX + Situp MAX',
        steps: [
          max('situpMax'),
          descanso(180),
          max('burpeeMax'),
          descanso(300),
          max('situpMax'),
        ],
      },
      {
        session: 5,
        name: 'Iris',
        steps: [workout('iris')],
      },
    ],
  },

  {
    week: 15,
    title: 'Semana 15 · Hell Week',
    minimumCompletionPercentage: 100,
    challenge:
      'Completar todos los workouts y todos los entrenamientos MAX.',
    sessions: [
      {
        session: 1,
        day: 1,
        name: 'Hell Week · Día 1',
        isHellWeek: true,
        steps: [workout('aphrodite')],
      },
      {
        session: 2,
        day: 2,
        name: 'Hell Week · Día 2',
        isHellWeek: true,
        steps: [
          workout('iris'),
          descanso(420),
          max('burpeeMax'),
        ],
      },
      {
        session: 3,
        day: 3,
        name: 'Hell Week · Día 3',
        isHellWeek: true,
        steps: [
          workout('dione'),
          max('squatMax'),
          workout('metis'),
        ],
      },
      {
        session: 4,
        day: 4,
        name: 'Hell Week · Día 4',
        isHellWeek: true,
        steps: [
          workout('aphrodite'),
          descanso(420),
          max('legLeverMax'),
        ],
      },
      {
        session: 5,
        day: 5,
        name: 'Hell Week · Día 5',
        isHellWeek: true,
        steps: [workout('iris')],
      },
      {
        session: 6,
        day: 6,
        name: 'Hell Week · Día 6',
        isHellWeek: true,
        steps: [
          workout('dione'),
          descanso(420),
          max('squatMax'),
        ],
      },
      {
        session: 7,
        day: 7,
        name: 'Hell Week · Día 7 · Hell Day',
        isHellWeek: true,
        isHellDay: true,
        steps: [
          workout('aphrodite'),
          workout('metis'),
          workout('apollon'),
        ],
      },
    ],
  },
]

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

export const getWeek = (weekNumber) => {
  return (
    freeleticsProgram.find((week) => week.week === Number(weekNumber)) ||
    null
  )
}

export const getSession = (weekNumber, sessionNumber) => {
  const week = getWeek(weekNumber)

  if (!week) {
    return null
  }

  return (
    week.sessions.find(
      (session) => session.session === Number(sessionNumber)
    ) || null
  )
}

export const getWorkout = (workoutId) => {
  return workouts[workoutId] || null
}

export const getMaxExercise = (maxId) => {
  return maxExercises[maxId] || null
}

export const getExercise = (exerciseId) => {
  return exercises[exerciseId] || null
}

export const getTotalSessions = () => {
  return freeleticsProgram.reduce(
    (total, week) => total + week.sessions.length,
    0
  )
}

export const getNextSession = (weekNumber, sessionNumber) => {
  const currentWeek = getWeek(weekNumber)

  if (!currentWeek) {
    return null
  }

  const currentSessionIndex = currentWeek.sessions.findIndex(
    (session) => session.session === Number(sessionNumber)
  )

  if (
    currentSessionIndex >= 0 &&
    currentSessionIndex < currentWeek.sessions.length - 1
  ) {
    return {
      week: Number(weekNumber),
      session: currentWeek.sessions[currentSessionIndex + 1].session,
    }
  }

  const nextWeek = getWeek(Number(weekNumber) + 1)

  if (!nextWeek || nextWeek.sessions.length === 0) {
    return null
  }

  return {
    week: nextWeek.week,
    session: nextWeek.sessions[0].session,
  }
}

export default freeleticsProgram