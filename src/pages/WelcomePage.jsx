// src/pages/WelcomePage.jsx

import { useNavigate } from 'react-router-dom'

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M14 7l5 5-5 5" />
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
    <path d="m8 14 2 2 5-5" />
  </svg>
)

const TimerIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l3 2M9 2h6M12 2v3" />
  </svg>
)

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

function WelcomePage() {
  const navigate = useNavigate()

  return (
    <main className="welcome-page">
      <div className="welcome-background-grid" />
      <div className="welcome-orange-glow welcome-orange-glow-top" />
      <div className="welcome-orange-glow welcome-orange-glow-bottom" />

      <section className="welcome-card">
        <header className="welcome-header">
          <div className="welcome-logo">
            assets/branding/free-athlete-logo.png

            <div className="welcome-logo-text">
              <strong>FREE ATHLETE</strong>
              <span>PERSONAL TRAINING</span>
            </div>
          </div>

          <div className="welcome-program-status">
            <span />
            Programa preparado
          </div>
        </header>

        <section className="welcome-hero">
          <p className="welcome-eyebrow">
            PROGRAMA DE ENTRENAMIENTO
          </p>

          <h1>
            15 semanas.
            <br />
            <span>Sin excusas.</span>
          </h1>

          <p className="welcome-description">
            Sigue cada sesión paso a paso, controla tus tiempos y registra
            todos tus resultados desde una única aplicación.
          </p>

          <div className="welcome-stats">
            <article>
              <strong>15</strong>
              <span>Semanas</span>
            </article>

            <div className="welcome-stats-separator" />

            <article>
              <strong>73</strong>
              <span>Sesiones</span>
            </article>

            <div className="welcome-stats-separator" />

            <article>
              <strong>6</strong>
              <span>Workouts</span>
            </article>
          </div>
        </section>

        <section className="welcome-features">
          <article className="welcome-feature">
            <div className="welcome-feature-number">01</div>

            <div className="welcome-feature-icon">
              <CalendarIcon />
            </div>

            <div className="welcome-feature-content">
              <h2>Programa completo</h2>
              <p>
                Las 15 semanas y todas las sesiones organizadas en el orden
                correcto.
              </p>
            </div>
          </article>

          <article className="welcome-feature">
            <div className="welcome-feature-number">02</div>

            <div className="welcome-feature-icon">
              <TimerIcon />
            </div>

            <div className="welcome-feature-content">
              <h2>Entrenamiento guiado</h2>
              <p>
                Ejercicios, repeticiones, rondas, descansos y temporizadores
                MAX.
              </p>
            </div>
          </article>

          <article className="welcome-feature">
            <div className="welcome-feature-number">03</div>

            <div className="welcome-feature-icon">
              <ChartIcon />
            </div>

            <div className="welcome-feature-content">
              <h2>Control de resultados</h2>
              <p>
                Registra tus tiempos, repeticiones, progreso y mejores marcas.
              </p>
            </div>
          </article>
        </section>

        <section className="welcome-action-area">
          <button
  type="button"
  className="welcome-primary-button"
  onClick={() => {
    localStorage.setItem('freeletics-program-started', 'true')
    navigate('/programa')
  }}
>
            <span>COMENZAR PROGRAMA</span>
            <ArrowIcon />
          </button>

          <p className="welcome-action-note">
            Tu progreso se guardará automáticamente en este dispositivo.
          </p>
        </section>
      </section>
    </main>
  )
}

export default WelcomePage