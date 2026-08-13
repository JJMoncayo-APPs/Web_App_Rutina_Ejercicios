import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  cancelarActividadRegistrada,
  confirmarActividadRegistrada,
  obtenerEstadoActividad,
  obtenerRegistrosActividad,
  registrarFutbolPasadoAutomaticamente,
} from '../services/activityLogService'

const nombresDias = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

const ordenDias = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
]

const objetivosLegibles = {
  bienestar: 'Sentirme mejor',
  'perder-grasa': 'Perder grasa',
  'ganar-musculo': 'Ganar músculo',
  definicion: 'Definir el cuerpo',
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

function ordenarActividades(actividades) {
  return [...actividades].sort((primeraActividad, segundaActividad) => {
    return (
      ordenDias.indexOf(primeraActividad.dia) -
      ordenDias.indexOf(segundaActividad.dia)
    )
  })
}

function obtenerActividadPrincipal(actividades) {
  if (actividades.length === 0) {
    return null
  }

  const diaActual = obtenerDiaActual()

  const actividadHoy = actividades.find((actividad) => {
    return actividad.dia === diaActual
  })

  if (actividadHoy) {
    return actividadHoy
  }

  return ordenarActividades(actividades)[0]
}

function obtenerTextoEstado(estado) {
  if (estado === 'realizada') {
    return 'Realizada'
  }

  if (estado === 'registrada-automaticamente') {
    return 'Registrada automáticamente'
  }

  if (estado === 'cancelada') {
    return 'Cancelada'
  }

  return 'Pendiente'
}

function obtenerClaseEstado(estado) {
  if (estado === 'realizada') {
    return 'dashboard-status-done'
  }

  if (estado === 'registrada-automaticamente') {
    return 'dashboard-status-auto'
  }

  if (estado === 'cancelada') {
    return 'dashboard-status-cancelled'
  }

  return 'dashboard-status-pending'
}

function DashboardPage() {
  const navigate = useNavigate()

  const [registros, setRegistros] = useState(() =>
    obtenerRegistrosActividad(),
  )

  const perfil = leerJsonLocalStorage('fithome_profile_draft', {
    nombre: 'José Juan',
    objetivoPrincipal: 'bienestar',
  })

  const planInicial = leerJsonLocalStorage(
    'fithome_initial_plan_draft',
    {
      actividades: [],
    },
  )

  const actividades = useMemo(() => {
    return ordenarActividades(planInicial.actividades || [])
  }, [planInicial.actividades])

  useEffect(() => {
    const registrosActualizados =
      registrarFutbolPasadoAutomaticamente(actividades)

    setRegistros(registrosActualizados)
  }, [actividades])

  const actividadPrincipal = useMemo(() => {
    return obtenerActividadPrincipal(actividades)
  }, [actividades])

  const volverAConfiguracion = () => {
    navigate('/configuracion')
  }

  const abrirPlan = () => {
    navigate('/configuracion/plan')
  }

  const abrirActividad = (actividad) => {
    if (!actividad) {
      navigate('/actividad')
      return
    }

    navigate(`/actividad/${actividad.id}`)
  }

  const refrescarRegistros = () => {
    setRegistros(obtenerRegistrosActividad())
  }

  const confirmarRegistro = (registroId) => {
    confirmarActividadRegistrada(registroId)
    refrescarRegistros()
  }

  const cancelarRegistro = (registroId) => {
    cancelarActividadRegistrada(registroId)
    refrescarRegistros()
  }

  const estadoActividadPrincipal = actividadPrincipal
    ? obtenerEstadoActividad(actividadPrincipal)
    : {
        estado: 'pendiente',
        registro: null,
      }

  const registrosPendientesConfirmacion = registros.filter((registro) => {
    return (
      registro.estado === 'registrada-automaticamente' &&
      !registro.confirmadoPorUsuario
    )
  })

  return (
    <main className="dashboard-page">
      <div className="background-glow background-glow-top" />
      <div className="background-glow background-glow-bottom" />

      <section className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-label">FitHome IA</span>

            <h1>Hola, {perfil.nombre}</h1>

            <p>
              Este es tu panel inicial. Aquí verás el plan, la
              próxima actividad y, más adelante, el entrenamiento
              guiado y el chat con IA.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-settings-button"
            onClick={volverAConfiguracion}
          >
            Ajustes
          </button>
        </header>

        {registrosPendientesConfirmacion.length > 0 && (
          <section className="dashboard-card dashboard-card-warning">
            <div className="dashboard-section-heading">
              <span>Confirmación pendiente</span>
            </div>

            <h2>Actividad registrada automáticamente</h2>

            <p>
              FitHome IA ha detectado que había actividad programada
              en días ya pasados. Confirma si finalmente se realizó
              para ajustar mejor la recuperación y las próximas
              sesiones.
            </p>

            <div className="dashboard-confirmation-list">
              {registrosPendientesConfirmacion.map((registro) => (
                <article
                  key={registro.id}
                  className="dashboard-confirmation-item"
                >
                  <div>
                    <strong>{registro.titulo}</strong>

                    <span>
                      {registro.diaNombre} · {registro.duracion} ·{' '}
                      {registro.intensidad}
                    </span>
                  </div>

                  <div className="dashboard-confirmation-actions">
                    <button
                      type="button"
                      className="dashboard-small-button dashboard-small-button-green"
                      onClick={() => {
                        confirmarRegistro(registro.id)
                      }}
                    >
                      Sí, lo hice
                    </button>

                    <button
                      type="button"
                      className="dashboard-small-button dashboard-small-button-red"
                      onClick={() => {
                        cancelarRegistro(registro.id)
                      }}
                    >
                      No lo hice
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="dashboard-card dashboard-card-highlight">
          <div className="dashboard-section-heading">
            <span>Hoy o próxima actividad</span>

            <strong>
              {actividadPrincipal
                ? nombresDias[actividadPrincipal.dia]
                : 'Sin plan'}
            </strong>
          </div>

          {actividadPrincipal ? (
            <>
              <div className="dashboard-title-row">
                <h2>{actividadPrincipal.titulo}</h2>

                <span
                  className={`dashboard-status-badge ${obtenerClaseEstado(
                    estadoActividadPrincipal.estado,
                  )}`}
                >
                  {obtenerTextoEstado(estadoActividadPrincipal.estado)}
                </span>
              </div>

              <p>{actividadPrincipal.descripcion}</p>

              <div className="dashboard-meta-list">
                <span>{actividadPrincipal.tipo}</span>
                <span>{actividadPrincipal.duracion}</span>
                <span>{actividadPrincipal.intensidad}</span>
              </div>

              {estadoActividadPrincipal.estado === 'pendiente' && (
                <button
                  type="button"
                  className="continue-button dashboard-main-button"
                  onClick={() => {
                    abrirActividad(actividadPrincipal)
                  }}
                >
                  Iniciar actividad
                  <span aria-hidden="true">→</span>
                </button>
              )}

              {estadoActividadPrincipal.estado ===
                'registrada-automaticamente' &&
                estadoActividadPrincipal.registro && (
                  <div className="dashboard-confirmation-actions">
                    <button
                      type="button"
                      className="dashboard-small-button dashboard-small-button-green"
                      onClick={() => {
                        confirmarRegistro(
                          estadoActividadPrincipal.registro.id,
                        )
                      }}
                    >
                      Sí, la hice
                    </button>

                    <button
                      type="button"
                      className="dashboard-small-button dashboard-small-button-red"
                      onClick={() => {
                        cancelarRegistro(
                          estadoActividadPrincipal.registro.id,
                        )
                      }}
                    >
                      No la hice
                    </button>
                  </div>
                )}

              {estadoActividadPrincipal.estado === 'realizada' && (
                <button
                  type="button"
                  className="continue-button dashboard-main-button"
                  onClick={() => {
                    abrirActividad(actividadPrincipal)
                  }}
                >
                  Ver registro
                  <span aria-hidden="true">→</span>
                </button>
              )}

              {estadoActividadPrincipal.estado === 'cancelada' && (
                <button
                  type="button"
                  className="continue-button dashboard-main-button"
                  onClick={() => {
                    abrirActividad(actividadPrincipal)
                  }}
                >
                  Ver actividad
                  <span aria-hidden="true">→</span>
                </button>
              )}
            </>
          ) : (
            <>
              <h2>No hay un plan guardado todavía</h2>

              <p>
                Completa el onboarding para generar tu primer plan
                recomendado.
              </p>

              <button
                type="button"
                className="continue-button dashboard-main-button"
                onClick={volverAConfiguracion}
              >
                Configurar FitHome IA
                <span aria-hidden="true">→</span>
              </button>
            </>
          )}
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card">
            <div className="dashboard-section-heading">
              <span>Objetivo principal</span>
            </div>

            <h3>
              {objetivosLegibles[perfil.objetivoPrincipal] ||
                perfil.objetivoPrincipal}
            </h3>

            <p>
              El plan equilibrará fuerza, cardio, movilidad,
              recuperación y descanso según tus datos.
            </p>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-section-heading">
              <span>Estado del plan</span>
            </div>

            <h3>
              {actividades.length > 0
                ? `${actividades.length} actividades`
                : 'Pendiente'}
            </h3>

            <p>
              El primer plan es un borrador inicial. Más adelante se
              ajustará con tus sensaciones y registros.
            </p>
          </article>
        </section>

        <section className="dashboard-card">
          <div className="dashboard-section-heading">
            <span>Semana sugerida</span>

            <button
              type="button"
              className="dashboard-link-button"
              onClick={abrirPlan}
            >
              Ver plan
            </button>
          </div>

          {actividades.length > 0 ? (
            <div className="dashboard-plan-list">
              {actividades.map((actividad) => {
                const estadoActividad =
                  obtenerEstadoActividad(actividad)

                return (
                  <article
                    key={actividad.id}
                    className="dashboard-plan-item dashboard-plan-item-clickable"
                    onClick={() => {
                      abrirActividad(actividad)
                    }}
                  >
                    <div>
                      <strong>{nombresDias[actividad.dia]}</strong>

                      <span>{actividad.tipo}</span>
                    </div>

                    <p>{actividad.titulo}</p>

                    <span
                      className={`dashboard-status-badge ${obtenerClaseEstado(
                        estadoActividad.estado,
                      )}`}
                    >
                      {obtenerTextoEstado(estadoActividad.estado)}
                    </span>
                  </article>
                )
              })}
            </div>
          ) : (
            <p>
              Todavía no hay actividades guardadas. Completa la
              configuración inicial para crear el primer plan.
            </p>
          )}
        </section>

        <section className="dashboard-card dashboard-card-muted">
          <div className="dashboard-section-heading">
            <span>Próximas funciones</span>
          </div>

          <ul className="dashboard-next-list">
            <li>Entrenamiento guiado con temporizadores.</li>

            <li>
              Registro de repeticiones, peso, esfuerzo y molestias.
            </li>

            <li>
              Adaptación automática de la siguiente sesión.
            </li>

            <li>
              Chat con IA para sensaciones, motivación y ajustes.
            </li>
          </ul>
        </section>
      </section>
    </main>
  )
}

export default DashboardPage