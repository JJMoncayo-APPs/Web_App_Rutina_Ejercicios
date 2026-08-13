const ACTIVITY_LOG_KEY = 'fithome_activity_log'

const ordenDias = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
]

const nombresDias = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

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

function obtenerDiaActual() {
  const indiceDia = new Date().getDay()

  const mapaDias = {
    0: 'domingo',
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sabado',
  }

  return mapaDias[indiceDia]
}

function obtenerIndiceDia(dia) {
  return ordenDias.indexOf(dia)
}

function haPasadoElDia(diaActividad) {
  const diaActual = obtenerDiaActual()
  const indiceActual = obtenerIndiceDia(diaActual)
  const indiceActividad = obtenerIndiceDia(diaActividad)

  if (indiceActividad === -1 || indiceActual === -1) {
    return false
  }

  return indiceActividad < indiceActual
}

function generarIdRegistro(actividad) {
  return `${actividad.id}-${actividad.dia}`
}

export function obtenerRegistrosActividad() {
  return leerJsonLocalStorage(ACTIVITY_LOG_KEY, [])
}

export function guardarRegistrosActividad(registros) {
  guardarJsonLocalStorage(ACTIVITY_LOG_KEY, registros)
}

export function existeRegistroActividad(actividadId) {
  const registros = obtenerRegistrosActividad()

  return registros.some((registro) => {
    return registro.actividadId === actividadId
  })
}

export function registrarActividadManual(actividad, datosExtra = {}) {
  const registros = obtenerRegistrosActividad()
  const actividadId = generarIdRegistro(actividad)

  if (existeRegistroActividad(actividadId)) {
    return registros
  }

  const nuevoRegistro = {
    id: `registro-${Date.now()}`,
    actividadId,
    actividadOriginalId: actividad.id,
    dia: actividad.dia,
    diaNombre: nombresDias[actividad.dia] || actividad.dia,
    tipo: actividad.tipo,
    titulo: actividad.titulo,
    duracion: actividad.duracion,
    intensidad: actividad.intensidad,
    estado: 'realizada',
    origen: 'manual',
    confirmadoPorUsuario: true,
    creadoEn: new Date().toISOString(),
    ...datosExtra,
  }

  const nuevosRegistros = [...registros, nuevoRegistro]

  guardarRegistrosActividad(nuevosRegistros)

  return nuevosRegistros
}

export function registrarActividadAutomatica(actividad, datosExtra = {}) {
  const registros = obtenerRegistrosActividad()
  const actividadId = generarIdRegistro(actividad)

  if (existeRegistroActividad(actividadId)) {
    return registros
  }

  const nuevoRegistro = {
    id: `registro-${Date.now()}`,
    actividadId,
    actividadOriginalId: actividad.id,
    dia: actividad.dia,
    diaNombre: nombresDias[actividad.dia] || actividad.dia,
    tipo: actividad.tipo,
    titulo: actividad.titulo,
    duracion: actividad.duracion,
    intensidad: actividad.intensidad,
    estado: 'registrada-automaticamente',
    origen: 'automatico',
    confirmadoPorUsuario: false,
    creadoEn: new Date().toISOString(),
    ...datosExtra,
  }

  const nuevosRegistros = [...registros, nuevoRegistro]

  guardarRegistrosActividad(nuevosRegistros)

  return nuevosRegistros
}

export function registrarFutbolPasadoAutomaticamente(actividades = []) {
  const registrosAntes = obtenerRegistrosActividad()

  let registrosActuales = registrosAntes

  actividades.forEach((actividad) => {
    const esFutbol =
      actividad.tipo === 'Fútbol sala' ||
      actividad.tipo === 'futbol-sala'

    if (!esFutbol) {
      return
    }

    if (!haPasadoElDia(actividad.dia)) {
      return
    }

    const actividadId = generarIdRegistro(actividad)

    const yaExiste = registrosActuales.some((registro) => {
      return registro.actividadId === actividadId
    })

    if (yaExiste) {
      return
    }

    const nuevoRegistro = {
      id: `registro-${Date.now()}-${actividad.dia}`,
      actividadId,
      actividadOriginalId: actividad.id,
      dia: actividad.dia,
      diaNombre: nombresDias[actividad.dia] || actividad.dia,
      tipo: actividad.tipo,
      titulo: actividad.titulo,
      duracion: actividad.duracion,
      intensidad: actividad.intensidad,
      estado: 'registrada-automaticamente',
      origen: 'automatico',
      confirmadoPorUsuario: false,
      creadoEn: new Date().toISOString(),
      nota:
        'Partido registrado automáticamente porque el día programado ya ha pasado.',
    }

    registrosActuales = [...registrosActuales, nuevoRegistro]
  })

  guardarRegistrosActividad(registrosActuales)

  return registrosActuales
}

export function confirmarActividadRegistrada(registroId) {
  const registros = obtenerRegistrosActividad()

  const nuevosRegistros = registros.map((registro) => {
    if (registro.id !== registroId) {
      return registro
    }

    return {
      ...registro,
      estado: 'realizada',
      confirmadoPorUsuario: true,
      confirmadoEn: new Date().toISOString(),
    }
  })

  guardarRegistrosActividad(nuevosRegistros)

  return nuevosRegistros
}

export function cancelarActividadRegistrada(registroId) {
  const registros = obtenerRegistrosActividad()

  const nuevosRegistros = registros.map((registro) => {
    if (registro.id !== registroId) {
      return registro
    }

    return {
      ...registro,
      estado: 'cancelada',
      confirmadoPorUsuario: true,
      confirmadoEn: new Date().toISOString(),
    }
  })

  guardarRegistrosActividad(nuevosRegistros)

  return nuevosRegistros
}

export function obtenerEstadoActividad(actividad) {
  const registros = obtenerRegistrosActividad()
  const actividadId = generarIdRegistro(actividad)

  const registro = registros.find((item) => {
    return item.actividadId === actividadId
  })

  if (!registro) {
    return {
      estado: 'pendiente',
      registro: null,
    }
  }

  return {
    estado: registro.estado,
    registro,
  }
}

export function limpiarRegistrosActividad() {
  guardarRegistrosActividad([])

  return []
}