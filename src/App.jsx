// src/App.jsx

import {
  HashRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import WelcomePage from './pages/WelcomePage'
import ProgramPage from './pages/ProgramPage'
import WorkoutsPage from './pages/WorkoutsPage'
import RecordsPage from './pages/RecordsPage'
import ActivityPage from './pages/ActivityPage'
import StandaloneWorkoutPage from './pages/StandaloneWorkoutPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

const PROGRAM_STARTED_KEY = 'freeletics-program-started'

function InitialRoute() {
  const programStarted =
    localStorage.getItem(PROGRAM_STARTED_KEY) === 'true'

  if (programStarted) {
    return <Navigate to="/programa" replace />
  }

  return <WelcomePage />
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<InitialRoute />} />

        <Route
          path="/programa"
          element={<ProgramPage />}
        />

        <Route
          path="/workouts"
          element={<WorkoutsPage />}
        />

        <Route
          path="/workout/:workoutId"
          element={<StandaloneWorkoutPage />}
        />

        <Route
          path="/marcas"
          element={<RecordsPage />}
        />

        <Route
          path="/sesion/:week/:session"
          element={<ActivityPage />}
        />

        <Route path="/ajustes" element={<SettingsPage />} />

        <Route
          path="/actividad"
          element={<Navigate to="/programa" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/programa" replace />}
        />
      </Routes>
    </HashRouter>
  )
}

export default App