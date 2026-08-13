// src/pages/SettingsPage.jsx

import { useState } from 'react'
import BottomNavigation from '../components/BottomNavigation'
import {
  getAppSettings,
  saveAppSettings,
} from '../services/appSettingsService'
import { clearWorkoutHistory } from '../services/workoutHistoryService'
import { clearMaxHistory } from '../services/maxHistoryService'

const CURRENT_SESSION_KEY = 'freeletics-current-session'
const PROGRAM_PROGRESS_KEY = 'freeletics-program-progress'
const PROGRAM_STARTED_KEY = 'freeletics-program-started'

const GearIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1.4 1.6v.1H9.6V21a1.7 1.7 0 0 0-1.4-1.6 1.7 1.7 0 0 0-1.88.34l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4.1 15a1.7 1.7 0 0 0-1.6-1.4h-.1V9.6h.1A1.7 1.7 0 0 0 4.1 8.2a1.7 1.7 0 0 0-.34-1.88l-.06-.06L6.56 3.4l.06.06A1.7 1.7 0 0 0 8.5 4.1 1.7 1.7 0 0 0 9.9 2.5v-.1h4v.1a1.7 1.7 0 0 0 1.4 1.6 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 19.4 8.5a1.7 1.7 0 0 0 1.6 1.4h.1v4H21a1.7 1.7 0 0 0-1.6 1.1Z" />
  </svg>
)

const SoundIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 10v4h4l5 4V6L8 10H4Z" />
    <path d="M17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
  </svg>
)

const VibrationIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="8" y="4" width="8" height="16" rx="2" />
    <path d="M4 8v8M2 10v4M20 8v8M22 10v4" />
  </svg>
)

const TimerIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l3 2M9 2h6M12 2v3" />
  </svg>
)

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3 2.5 20h19L12 3Z" />
    <path d="M12 9v5M12 17h.01" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
  </svg>
)

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={checked ? 'settings-toggle settings-toggle-active' : 'settings-toggle'}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span />
    </button>
  )
}

function SettingsPage() {
  const [settings, setSettings] = useState(() => getAppSettings())
  const [dialogType, setDialogType] = useState(null)
  const [message, setMessage] = useState('')

  const updateSetting = (settingName, value) => {
    const updatedSettings = {
      ...settings,
      [settingName]: value,
    }

    const savedSettings = saveAppSettings(updatedSettings)

    if (savedSettings) {
      setSettings(savedSettings)
      setMessage('Ajustes guardados')
      window.setTimeout(() => setMessage(''), 1800)
    }
  }

  const deleteAllRecords = () => {
    const workoutDeleted = clearWorkoutHistory()
    const maxDeleted = clearMaxHistory()

    if (workoutDeleted && maxDeleted) {
      setMessage('Todos los registros y marcas se han eliminado')
    }

    setDialogType(null)
  }

  const resetProgram = () => {
    localStorage.removeItem(CURRENT_SESSION_KEY)
    localStorage.removeItem(PROGRAM_PROGRESS_KEY)
    localStorage.removeItem(PROGRAM_STARTED_KEY)
    setMessage('El progreso del programa se ha reiniciado')
    setDialogType(null)
  }

  return (
    <main className="settings-page">
      <div className="settings-mineral-background" />

      <section className="settings-shell">
        <header className="settings-header">
          <div>
            <span className="settings-header-label">PREFERENCIAS</span>
            <h1>Ajustes</h1>
            <p>Configura la experiencia de entrenamiento y gestiona tus datos.</p>
          </div>

          <div className="settings-header-icon">
            <GearIcon />
          </div>
        </header>

        {message && <div className="settings-message">{message}</div>}

        <section className="settings-section">
          <div className="settings-section-heading">
            <span>ENTRENAMIENTO</span>
            <h2>Preferencias</h2>
          </div>

          <div className="settings-card">
            <article className="settings-row">
              <div className="settings-row-icon"><SoundIcon /></div>
              <div className="settings-row-content">
                <strong>Sonidos y pitidos</strong>
                <span>Avisos durante preparación, MAX y finalización.</span>
              </div>
              <Toggle
                checked={settings.soundsEnabled}
                onChange={(value) => updateSetting('soundsEnabled', value)}
                label="Sonidos y pitidos"
              />
            </article>

            <article className="settings-row">
              <div className="settings-row-icon"><VibrationIcon /></div>
              <div className="settings-row-content">
                <strong>Vibración</strong>
                <span>Avisos hápticos cuando sean compatibles.</span>
              </div>
              <Toggle
                checked={settings.vibrationEnabled}
                onChange={(value) => updateSetting('vibrationEnabled', value)}
                label="Vibración"
              />
            </article>

            <article className="settings-row settings-row-stacked">
              <div className="settings-row-icon"><TimerIcon /></div>
              <div className="settings-row-content">
                <strong>Tiempo de preparación</strong>
                <span>Cuenta atrás antes de cada ejercicio.</span>
              </div>
              <div className="settings-segmented-control">
                {[3, 5, 10].map((seconds) => (
                  <button
                    key={seconds}
                    type="button"
                    className={
                      settings.preparationSeconds === seconds
                        ? 'settings-segment settings-segment-active'
                        : 'settings-segment'
                    }
                    onClick={() => updateSetting('preparationSeconds', seconds)}
                  >
                    {seconds} s
                  </button>
                ))}
              </div>
            </article>

            <article className="settings-row">
              <div className="settings-row-icon"><WarningIcon /></div>
              <div className="settings-row-content">
                <strong>Avisos físicos</strong>
                <span>Muestra advertencias en ejercicios sensibles.</span>
              </div>
              <Toggle
                checked={settings.physicalWarningsEnabled}
                onChange={(value) =>
                  updateSetting('physicalWarningsEnabled', value)
                }
                label="Avisos físicos"
              />
            </article>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading">
            <span>DATOS</span>
            <h2>Gestión y borrado</h2>
          </div>

          <div className="settings-danger-card">
            <button
              type="button"
              className="settings-danger-row"
              onClick={() => setDialogType('records')}
            >
              <span className="settings-danger-icon"><TrashIcon /></span>
              <span>
                <strong>Borrar todos los registros</strong>
                <small>Elimina tiempos, podios, MAX e historial.</small>
              </span>
            </button>

            <button
              type="button"
              className="settings-danger-row"
              onClick={() => setDialogType('program')}
            >
              <span className="settings-danger-icon"><WarningIcon /></span>
              <span>
                <strong>Reiniciar progreso del programa</strong>
                <small>Vuelve a la semana 1 sin borrar las marcas.</small>
              </span>
            </button>
          </div>
        </section>

        <footer className="settings-footer">
  <div
    className="settings-footer-logo"
    role="img"
    aria-label="Logo de Free Athlete"
    style={{
      backgroundImage: `url("${import.meta.env.BASE_URL}assets/branding/free-athlete-logo.png")`,
    }}
  />

  <strong>Free Athlete</strong>
  <span>Versión 1.0.0</span>
</footer>
      </section>

      <BottomNavigation activeItem="settings" />

      {dialogType && (
        <div className="settings-dialog-overlay">
          <section className="settings-dialog" role="dialog" aria-modal="true">
            <span>ACCIÓN IRREVERSIBLE</span>
            <h2>
              {dialogType === 'records'
                ? '¿Borrar todos los registros?'
                : '¿Reiniciar el programa?'}
            </h2>
            <p>
              {dialogType === 'records'
                ? 'Se eliminarán todos los tiempos, resultados MAX, podios e historial. Esta acción no se puede deshacer.'
                : 'Se borrará el avance de las 15 semanas y la sesión actual. Tus marcas personales se conservarán.'}
            </p>
            <div className="settings-dialog-actions">
              <button type="button" onClick={() => setDialogType(null)}>
                CANCELAR
              </button>
              <button
                type="button"
                className="settings-dialog-confirm"
                onClick={
                  dialogType === 'records' ? deleteAllRecords : resetProgram
                }
              >
                CONFIRMAR
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default SettingsPage
