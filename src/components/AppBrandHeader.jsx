// src/components/AppBrandHeader.jsx

function AppBrandHeader({
  eyebrow,
  title,
  description = null,
  action = null,
}) {
  return (
    <header className="app-brand-header">
      <div className="app-brand-identity">
        <div
          className="app-brand-logo"
          role="img"
          aria-label="Logo de Free Athlete"
          style={{
            backgroundImage: `url("${import.meta.env.BASE_URL}assets/branding/free-athlete-logo.png")`,
          }}
        />

        <div className="app-brand-name">
          <strong>FREE ATHLETE</strong>
          <span>PERSONAL TRAINING</span>
        </div>
      </div>

      <div className="app-brand-page-heading">
        <div>
          {eyebrow && (
            <span className="app-brand-eyebrow">
              {eyebrow}
            </span>
          )}

          <h1>{title}</h1>

          {description && <p>{description}</p>}
        </div>

        {action && (
          <div className="app-brand-action">
            {action}
          </div>
        )}
      </div>
    </header>
  )
}

export default AppBrandHeader