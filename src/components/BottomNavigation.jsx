import { useNavigate } from 'react-router-dom'

const ProgramIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
    <path d="m8 14 2 2 5-5" />
  </svg>
)
const WorkoutIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.5 6.5v11M3.5 8.5v7M17.5 6.5v11M20.5 8.5v7M6.5 12h11" />
  </svg>
)

const RecordsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
    <path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 12v5M8 21h8M9 17h6" />
  </svg>
)

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1.4 1.6v.1H9.6V21a1.7 1.7 0 0 0-1.4-1.6 1.7 1.7 0 0 0-1.88.34l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4.1 15a1.7 1.7 0 0 0-1.6-1.4h-.1V9.6h.1A1.7 1.7 0 0 0 4.1 8.2a1.7 1.7 0 0 0-.34-1.88l-.06-.06L6.56 3.4l.06.06A1.7 1.7 0 0 0 8.5 4.1 1.7 1.7 0 0 0 9.9 2.5v-.1h4v.1a1.7 1.7 0 0 0 1.4 1.6 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 19.4 8.5a1.7 1.7 0 0 0 1.6 1.4h.1v4H21a1.7 1.7 0 0 0-1.6 1.1Z" />
  </svg>
)

const navigationItems = [
  {
    id: 'program',
    label: 'Programa',
    route: '/programa',
    icon: ProgramIcon,
  },
 {
    id: 'workouts',
    label: 'Workouts',
    route: '/workouts',
    icon: WorkoutIcon,
  },
  {
    id: 'records',
    label: 'Marcas',
    route: '/marcas',
    icon: RecordsIcon,
  },
  {
    id: 'settings',
    label: 'Ajustes',
    route: '/ajustes',
    icon: SettingsIcon,
  },
]

function BottomNavigation({ activeItem }) {
  const navigate = useNavigate()

  return (
    <nav className="program-navigation">
      {navigationItems.map((item) => {
        const Icon = item.icon
        const isActive = activeItem === item.id

        return (
          <button
            key={item.id}
            type="button"
            className={
              isActive
                ? 'program-navigation-button program-navigation-button-active'
                : 'program-navigation-button'
            }
            onClick={() => navigate(item.route)}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNavigation